import { type NextRequest, NextResponse } from "next/server"
import { fareHarborAdapter, isFareHarborConfigured } from "@/lib/booking/fareharbor"
import type { CheckoutRequest } from "@/lib/booking/types"
import { getTour } from "@/lib/tours"

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

  // If FareHarbor credentials are not set yet, fail clearly instead of pretending.
  if (!isFareHarborConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Booking is not connected yet. Add FAREHARBOR_API_APP_KEY, FAREHARBOR_API_USER_KEY, and FAREHARBOR_SHORTNAME to enable live checkout.",
        code: "FAREHARBOR_NOT_CONFIGURED",
      },
      { status: 503 },
    )
  }

  try {
    const confirmations: string[] = []

    for (const item of body.items) {
      const tour = getTour(item.tourSlug)
      if (!tour) {
        return NextResponse.json(
          { ok: false, error: `Unknown tour: ${item.tourSlug}` },
          { status: 400 },
        )
      }
      const fhItemId = tour.fareHarborItemId
      // Resolve the chosen date to a concrete FareHarbor availability.
      const dayStart = `${item.date}T00:00:00`
      const dayEnd = `${item.date}T23:59:59`
      const slots = await fareHarborAdapter.getAvailability(fhItemId, dayStart, dayEnd)

      if (slots.length === 0) {
        return NextResponse.json(
          { ok: false, error: `No availability for ${item.date}. Please pick another date.` },
          { status: 409 },
        )
      }

      const slot = slots[0]
      const result = await fareHarborAdapter.createBooking({
        tourId: fhItemId,
        availabilityId: slot.id,
        travelers: item.travelers,
        customer: body.contact,
      })

      if (!result.ok || !result.bookingId) {
        return NextResponse.json(
          { ok: false, error: result.error ?? "Booking failed." },
          { status: 502 },
        )
      }
      confirmations.push(result.bookingId)
    }

    return NextResponse.json({ ok: true, confirmationCode: confirmations.join("-") })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed. Please try again."
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
