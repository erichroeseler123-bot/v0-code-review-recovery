import { type NextRequest, NextResponse } from "next/server"
import { getAdapter } from "@/lib/booking"
import type { CheckoutRequest } from "@/lib/booking/types"
import { getTour } from "@/lib/tours"
import { getMarket } from "@/lib/markets"

const APPROVED_WTA_FAREHARBOR_ITEMS = new Set([
  "temscoair-juneau:214803",
  "wingsairways:256881",
  "dolphintours:2436",
  "taquanair:560411",
])

function isApprovedWtaFareHarborTour(tour: { marketId: string; providerCompany?: string; providerRef?: string }) {
  return (
    tour.marketId === "alaska" &&
    Boolean(tour.providerCompany && tour.providerRef) &&
    APPROVED_WTA_FAREHARBOR_ITEMS.has(`${tour.providerCompany}:${tour.providerRef}`)
  )
}

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
          { ok: false, error: `${tour.title} is not mapped to a live booking product yet.` },
          { status: 409 },
        )
      }

      if (market.provider === "fareharbor" && !isApprovedWtaFareHarborTour(tour)) {
        return NextResponse.json(
          {
            ok: false,
            error: "FareHarbor API checkout is enabled only for approved Welcome to Alaska Tours products.",
            code: "WTA_FAREHARBOR_ONLY",
          },
          { status: 403 },
        )
      }

      const dayStart = `${item.date}T00:00:00`
      const dayEnd = `${item.date}T23:59:59`
      const slots = await adapter.getAvailability(providerRef, dayStart, dayEnd, tour.providerCompany)

      if (slots.length === 0) {
        return NextResponse.json(
          { ok: false, error: `No availability for ${item.date}. Please pick another date.` },
          { status: 409 },
        )
      }

      const selectedRates = (item.customerTypeRates ?? [])
        .map((rate) => ({ id: String(rate.id), quantity: Number(rate.quantity) }))
        .filter((rate) => rate.id && Number.isFinite(rate.quantity) && rate.quantity > 0)
      const selectedTravelerCount = selectedRates.reduce((sum, rate) => sum + rate.quantity, 0)

      if (market.provider === "fareharbor") {
        if (!item.availabilityId || !item.startsAt) {
          return NextResponse.json(
            { ok: false, error: `Choose an available FareHarbor time for ${tour.title} before checkout.` },
            { status: 400 },
          )
        }
        if (!item.startsAt.startsWith(item.date)) {
          return NextResponse.json(
            { ok: false, error: "The selected FareHarbor time does not match the selected date." },
            { status: 400 },
          )
        }
        if (selectedTravelerCount < 1) {
          return NextResponse.json(
            { ok: false, error: `Choose at least one FareHarbor ticket type for ${tour.title}.` },
            { status: 400 },
          )
        }

        const selectedSlot = slots.find((slot) => slot.id === item.availabilityId)
        if (!selectedSlot || selectedSlot.startsAt !== item.startsAt) {
          return NextResponse.json(
            { ok: false, error: "The selected FareHarbor time is no longer available. Please choose another time." },
            { status: 409 },
          )
        }
        if (selectedSlot.capacityRemaining < selectedTravelerCount) {
          return NextResponse.json(
            {
              ok: false,
              error: `Only ${selectedSlot.capacityRemaining} spaces remain for the selected FareHarbor time.`,
            },
            { status: 409 },
          )
        }

        const availableRateIds = new Set((selectedSlot.customerTypeRates ?? []).map((rate) => rate.id))
        const hasUnknownRate = selectedRates.some((rate) => !availableRateIds.has(rate.id))
        if (hasUnknownRate || availableRateIds.size === 0) {
          return NextResponse.json(
            { ok: false, error: "The selected FareHarbor ticket type is no longer available." },
            { status: 409 },
          )
        }
      }

      const slot = market.provider === "fareharbor"
        ? slots.find((s) => s.id === item.availabilityId)!
        : slots[0]
      const result = await adapter.createBooking(
        {
          tourId: providerRef,
          availabilityId: slot.id,
          travelers: market.provider === "fareharbor" ? selectedTravelerCount : item.travelers,
          customerTypeRates: market.provider === "fareharbor" ? selectedRates : undefined,
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
