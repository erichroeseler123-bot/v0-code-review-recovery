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
      if (!providerRef) {
        return NextResponse.json(
          { ok: false, error: `${tour.title} is not mapped to a live ${market.provider} item.` },
          { status: 400 },
        )
      }
      if (!item.date) {
        return NextResponse.json(
          { ok: false, error: `Choose a date for ${tour.title} before checkout.` },
          { status: 400 },
        )
      }

      const dayStart = `${item.date}T00:00:00`
      const dayEnd = `${item.date}T23:59:59`
      let availabilityId = item.availabilityId

      if (market.provider === "fareharbor") {
        if (!item.availabilityId || !item.startsAt) {
          return NextResponse.json(
            { ok: false, error: `Choose an available FareHarbor time for ${tour.title} before checkout.` },
            { status: 400 },
          )
        }
        if (!item.startsAt.startsWith(item.date)) {
          return NextResponse.json(
            { ok: false, error: `The selected FareHarbor time does not match the selected date.` },
            { status: 400 },
          )
        }

        const slots = await adapter.getAvailability(providerRef, dayStart, dayEnd, tour.providerCompany)
        const selectedSlot = slots.find((slot) => slot.id === item.availabilityId)
        if (!selectedSlot) {
          return NextResponse.json(
            { ok: false, error: `The selected FareHarbor time is no longer available. Please choose another time.` },
            { status: 409 },
          )
        }
        if (selectedSlot.capacityRemaining < item.travelers) {
          return NextResponse.json(
            { ok: false, error: `Only ${selectedSlot.capacityRemaining} spaces remain for the selected FareHarbor time.` },
            { status: 409 },
          )
        }
      } else {
        const slots = await adapter.getAvailability(providerRef, dayStart, dayEnd, tour.providerCompany)
        if (slots.length === 0) {
          return NextResponse.json(
            { ok: false, error: `No availability for ${item.date}. Please pick another date.` },
            { status: 409 },
          )
        }
        availabilityId = slots[0].id
      }

      const result = await adapter.createBooking(
        {
          tourId: providerRef,
          availabilityId: availabilityId!,
          travelers: item.travelers,
          customer: body.contact,
        },
        tour.providerCompany,
      )

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
