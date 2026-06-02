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

function getConfig() {
  const appKey = process.env.FAREHARBOR_API_APP_KEY
  const userKey = process.env.FAREHARBOR_API_USER_KEY
  const shortname = process.env.FAREHARBOR_SHORTNAME
  if (!appKey || !userKey || !shortname) return null
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
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export const fareHarborAdapter: BookingProviderAdapter = {
  name: "fareharbor",
  onSiteCheckout: true,

  async getAvailability(tourId, fromISO, toISO): Promise<AvailabilitySlot[]> {
    const cfg = getConfig()
    if (!cfg) {
      console.log("[v0] FareHarbor not configured — returning empty availability")
      return []
    }
    const from = fromISO.slice(0, 10)
    const to = toISO.slice(0, 10)
    const url = `${BASE}/companies/${cfg.shortname}/items/${tourId}/availabilities/date_range/${from}/${to}/`
    try {
      const res = await fetch(url, { headers: headers(cfg), cache: "no-store" })
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

  async createBooking(input: CreateBookingInput): Promise<BookingResult> {
    const cfg = getConfig()
    if (!cfg) {
      return { ok: false, error: "FareHarbor is not configured yet." }
    }
    const url = `${BASE}/companies/${cfg.shortname}/availabilities/${input.availabilityId}/bookings/`
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
        confirmationUrl: `https://fareharbor.com/${cfg.shortname}/items/book/${data.booking.uuid}/`,
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
