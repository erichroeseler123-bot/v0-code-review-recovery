import "server-only"
import type {
  AvailabilitySlot,
  BookingProviderAdapter,
  CreateBookingInput,
  BookingResult,
} from "./types"

/**
 * FareHarbor External API adapter.
 *
 * Required env vars (set in the WTA Vercel project):
 *   FAREHARBOR_API_APP_KEY   - your app key   (X-FareHarbor-API-App)
 *   FAREHARBOR_API_USER_KEY  - your user key  (X-FareHarbor-API-User)
 *   FAREHARBOR_SHORTNAME     - your company shortname (e.g. "welcometoalaska")
 *
 * Docs: https://fareharbor.com/api/external/v1/
 */

const BASE = "https://fareharbor.com/api/external/v1"
const ITEM_DETAILS_TIMEOUT_MS = 2000

function getConfig() {
  const appKey = process.env.FAREHARBOR_API_APP_KEY
  const userKey = process.env.FAREHARBOR_API_USER_KEY
  // Affiliate accounts don't need their own shortname — inventory lives under
  // each operator's company shortname, supplied per-tour. Keep it as a fallback.
  const shortname = process.env.FAREHARBOR_SHORTNAME ?? ""
  if (!appKey || !userKey) return null
  return { appKey, userKey, shortname }
}

export function isFareHarborConfigured() {
  return getConfig() !== null
}

function headers(cfg: { appKey: string; userKey: string }) {
  return {
    "X-FareHarbor-API-App": cfg.appKey,
    "X-FareHarbor-API-User": cfg.userKey,
    "Content-Type": "application/json",
  }
}

function formatLabel(startISO: string) {
  const d = new Date(startISO)
  // Render in the operator's local Alaska time so guests see the real
  // departure time, not the server's UTC clock.
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Anchorage",
  })
}

type FareHarborPhoto = {
  url?: string
  image_url?: string
  photo_url?: string
  large?: string
  medium?: string
  original?: string
  image?: { url?: string }
  photo?: { url?: string }
}

type FareHarborItemDetails = {
  name?: string
  description?: string
  photo_url?: string
  photo?: { image_url?: string; large?: string }
  photos?: FareHarborPhoto[]
  images?: FareHarborPhoto[]
  item?: {
    name?: string
    description?: string
    photo_url?: string
    photo?: { image_url?: string; large?: string }
    photos?: FareHarborPhoto[]
    images?: FareHarborPhoto[]
  }
}

function firstPhotoUrl(photos?: FareHarborPhoto[]) {
  for (const photo of photos ?? []) {
    const url =
      photo.url ||
      photo.image_url ||
      photo.photo_url ||
      photo.large ||
      photo.medium ||
      photo.original ||
      photo.image?.url ||
      photo.photo?.url
    if (url) return url
  }
  return undefined
}

function getFareHarborImageUrl(data: FareHarborItemDetails) {
  const item = data.item
  return (
    data.photo_url ||
    data.photo?.large ||
    data.photo?.image_url ||
    item?.photo_url ||
    item?.photo?.large ||
    item?.photo?.image_url ||
    firstPhotoUrl(item?.photos) ||
    firstPhotoUrl(item?.images) ||
    firstPhotoUrl(data.photos) ||
    firstPhotoUrl(data.images) ||
    undefined
  )
}

export const fareHarborAdapter: BookingProviderAdapter = {
  onSiteCheckout: true,
  isConfigured: isFareHarborConfigured,

  async getItemDetails(tourId: string, operatorShortname?: string) {
    const cfg = getConfig()
    if (!cfg) {
      return null
    }
    const company = operatorShortname || cfg.shortname
    const url = `${BASE}/companies/${company}/items/${tourId}/`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ITEM_DETAILS_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        headers: headers(cfg),
        next: { revalidate: 3600 },
        signal: controller.signal,
      })
      if (!res.ok) return null
      const data = (await res.json()) as FareHarborItemDetails
      const item = data.item
      return {
        title: item?.name || data.name || "",
        description: item?.description || data.description || "",
        imageUrl: getFareHarborImageUrl(data),
      }
    } catch {
      return null
    } finally {
      clearTimeout(timeout)
    }
  },

  async getAvailability(tourId, fromISO, toISO, operatorShortname): Promise<AvailabilitySlot[]> {
    const cfg = getConfig()
    if (!cfg) {
      console.log("[v0] FareHarbor not configured — returning empty availability")
      return []
    }
    // Affiliates resell other operators' inventory: each item lives under its
    // operator's shortname. Fall back to our own company shortname if none given.
    const company = operatorShortname || cfg.shortname
    const from = fromISO.slice(0, 10)
    const to = toISO.slice(0, 10)
    const url = `${BASE}/companies/${company}/items/${tourId}/availabilities/date-range/${from}/${to}/`
    try {
      // Cache live availability for a few minutes: FareHarbor's date-range
      // endpoint is slow over wide windows, and the final seat is re-checked
      // at checkout anyway. Keeps the storefront snappy without going stale.
      const res = await fetch(url, { headers: headers(cfg), next: { revalidate: 180 } })
      if (!res.ok) {
        console.log("[v0] FareHarbor availability error:", res.status)
        return []
      }
      const data = (await res.json()) as { availabilities?: FhAvailability[] }
      return (data.availabilities ?? []).map((a) => ({
        id: String(a.pk),
        startsAt: a.start_at,
        label: formatLabel(a.start_at),
        capacityRemaining: a.capacity ?? 0,
        priceCents:
          a.customer_type_rates?.[0]?.total ??
          a.customer_prototypes?.[0]?.total ??
          0,
      }))
    } catch (err) {
      console.log("[v0] FareHarbor availability fetch failed:", (err as Error).message)
      return []
    }
  },

  async createBooking(input: CreateBookingInput, operatorShortname?: string): Promise<BookingResult> {
    const cfg = getConfig()
    if (!cfg) {
      return { ok: false, error: "FareHarbor is not configured yet." }
    }
    const company = operatorShortname || cfg.shortname
    const url = `${BASE}/companies/${company}/availabilities/${input.availabilityId}/bookings/`
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: headers(cfg),
        cache: "no-store",
        body: JSON.stringify({
          contact: {
            name: input.customer.name,
            email: input.customer.email,
            phone: input.customer.phone ?? "",
          },
          customers: Array.from({ length: input.travelers }).map(() => ({
            customer_type_rate: null,
          })),
        }),
      })
      const data = (await res.json()) as { booking?: { pk: number; uuid: string } }
      if (!res.ok || !data.booking) {
        console.log("[v0] FareHarbor booking error:", res.status)
        return { ok: false, error: "Booking could not be completed." }
      }
      return {
        ok: true,
        bookingId: String(data.booking.pk),
        confirmationUrl: `https://fareharbor.com/${company}/items/book/${data.booking.uuid}/`,
      }
    } catch (err) {
      console.log("[v0] FareHarbor booking failed:", (err as Error).message)
      return { ok: false, error: "Booking request failed." }
    }
  },
}

interface FhAvailability {
  pk: number
  start_at: string
  capacity?: number
  customer_type_rates?: { total: number }[]
  customer_prototypes?: { total: number }[]
}
