import { type NextRequest, NextResponse } from "next/server"
import { getAdapter } from "@/lib/booking"
import type { CheckoutRequest } from "@/lib/booking/types"
import { getTour } from "@/lib/tours"
import { getMarket } from "@/lib/markets"

export async function POST(req: NextRequest) {
  let body: CheckoutRequest
  try {
    body = (await req.json()) as CheckoutRequest
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 })
  }

  if (!body.items?.length) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 })
  }
  if (!body.contact?.name || !body.contact?.email) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 })
  }

  try {
    const confirmations: string[] = []

    for (const item of body.items) {
      const tour = getTour(item.tourSlug)
      if (!tour) {
        return NextResponse.json({ ok: false, error: `Unknown tour: ${item.tourSlug}` }, { status: 400 })
      }
      const market = getMarket(tour.marketId)
      if (!market) {
        return NextResponse.json({ ok: false, error: `Unknown market for ${item.tourSlug}` }, { status: 400 })
      }

      const adapter = getAdapter(market.provider)

      // Handoff providers don't check out on-site.
      if (!adapter.onSiteCheckout) {
        return NextResponse.json(
          {
            ok: false,
            error: `${tour.title} is booked on our partner's site. Use the "Book on partner site" button.`,
            code: "HANDOFF_PROVIDER",
          },
          { status: 409 },
        )
      }

      // On-site provider not configured yet — fail clearly instead of pretending.
      if (!adapter.isConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            error: `${market.name} booking is not connected yet. Add the ${market.provider.toUpperCase()} credentials to enable live checkout.`,
            code: "PROVIDER_NOT_CONFIGURED",
          },
          { status: 503 },
        )
      }

      const providerRef = tour.providerRef ?? ""
      const dayStart = `${item.date}T00:00:00`
      const dayEnd = `${item.date}T23:59:59`
      const slots = await adapter.getAvailability(providerRef, dayStart, dayEnd)

      if (slots.length === 0) {
        return NextResponse.json(
          { ok: false, error: `No availability for ${item.date}. Please pick another date.` },
          { status: 409 },
        )
      }

      const slot = slots[0]
      const result = await adapter.createBooking({
        tourId: providerRef,
        availabilityId: slot.id,
        travelers: item.travelers,
        customer: body.contact,
      })

      if (!result.ok || !result.bookingId) {
        return NextResponse.json({ ok: false, error: result.error ?? "Booking failed." }, { status: 502 })
      }
      confirmations.push(result.bookingId)
    }

    return NextResponse.json({ ok: true, confirmationCode: confirmations.join("-") })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed. Please try again."
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
