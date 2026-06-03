import "server-only"
import type {
  AvailabilitySlot,
  BookingProviderAdapter,
  CreateBookingInput,
  BookingResult,
} from "./types"

/**
 * Rezdy API adapter (GoSno, Shuttleya).
 *
 * Required env vars:
 *   REZDY_API_KEY   - your Rezdy API key
 *   REZDY_API_BASE  - optional, defaults to the production endpoint
 *
 * Docs: https://developers.rezdy.com/
 */

const DEFAULT_BASE = "https://api.rezdy.com/v1"

function getConfig() {
  const apiKey = process.env.REZDY_API_KEY
  if (!apiKey) return null
  return { apiKey, base: process.env.REZDY_API_BASE || DEFAULT_BASE }
}

export function isRezdyConfigured() {
  return getConfig() !== null
}

function formatLabel(startISO: string) {
  return new Date(startISO).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export const rezdyAdapter: BookingProviderAdapter = {
  name: "rezdy",
  onSiteCheckout: true,
  isConfigured: isRezdyConfigured,

  async getAvailability(productCode, fromISO, toISO): Promise<AvailabilitySlot[]> {
    const cfg = getConfig()
    if (!cfg) {
      console.log("[v0] Rezdy not configured — returning empty availability")
      return []
    }
    // Rezdy requires "yyyy-MM-dd HH:mm:ss" — a bare date is rejected (HTTP 406).
    const params = new URLSearchParams({
      apiKey: cfg.apiKey,
      productCode,
      startTimeLocal: `${fromISO.slice(0, 10)} 00:00:00`,
      endTimeLocal: `${toISO.slice(0, 10)} 23:59:59`,
    })
    try {
      const res = await fetch(`${cfg.base}/availability?${params.toString()}`, {
        next: { revalidate: 180 },
      })
      if (!res.ok) {
        console.log("[v0] Rezdy availability error:", res.status)
        return []
      }
      const data = (await res.json()) as { sessions?: RezdySession[] }
      return (data.sessions ?? []).map((s) => {
        // Transfer-style products return a date marker at midnight rather than a
        // real departure time. Flag those so the UI shows a date, not "12:00 AM".
        const dateOnly = s.startTimeLocal.slice(11) === "00:00:00"
        return {
          id: String(s.id),
          startsAt: s.startTimeLocal,
          label: dateOnly ? formatDay(s.startTimeLocal) : formatLabel(s.startTimeLocal),
          capacityRemaining: s.seatsAvailable ?? 0,
          priceCents: Math.round((s.totalPrice ?? 0) * 100),
          dateOnly,
        }
      })
    } catch (err) {
      console.log("[v0] Rezdy availability fetch failed:", (err as Error).message)
      return []
    }
  },

  async createBooking(input: CreateBookingInput): Promise<BookingResult> {
    const cfg = getConfig()
    if (!cfg) return { ok: false, error: "Rezdy is not configured yet." }
    try {
      const res = await fetch(`${cfg.base}/bookings?apiKey=${cfg.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          status: "CONFIRMED",
          customer: {
            firstName: input.customer.name.split(" ")[0] ?? input.customer.name,
            lastName: input.customer.name.split(" ").slice(1).join(" ") || "Guest",
            email: input.customer.email,
            phone: input.customer.phone ?? "",
          },
          items: [
            {
              productCode: input.tourId,
              startTimeLocal: input.availabilityId,
              quantities: [{ optionLabel: "Guest", value: input.travelers }],
            },
          ],
        }),
      })
      const data = (await res.json()) as { booking?: { orderNumber: string } }
      if (!res.ok || !data.booking) {
        console.log("[v0] Rezdy booking error:", res.status)
        return { ok: false, error: "Booking could not be completed." }
      }
      return { ok: true, bookingId: data.booking.orderNumber }
    } catch (err) {
      console.log("[v0] Rezdy booking failed:", (err as Error).message)
      return { ok: false, error: "Booking request failed." }
    }
  },
}

interface RezdySession {
  id: number
  startTimeLocal: string
  seatsAvailable?: number
  totalPrice?: number
}
