import { NextResponse, type NextRequest } from "next/server"
import { nanoid } from "nanoid"
import { db } from "@/lib/db"
import { gosnoBookings } from "@/lib/db/schema"
import { getTour } from "@/lib/tours"

type LeadRequest = {
  marketId?: string
  tourSlug?: string
  tourTitle?: string
  route?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  travelers?: number
  preferredDate?: string
  flightInfo?: string
  notes?: string
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function invalid(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

export async function POST(req: NextRequest) {
  let body: LeadRequest
  try {
    body = (await req.json()) as LeadRequest
  } catch {
    return invalid("Invalid request body.")
  }

  if (body.marketId !== "gosno") {
    return invalid("Only GoSno leads are supported.")
  }

  const tourSlug = clean(body.tourSlug)
  const contactName = clean(body.contactName)
  const contactEmail = clean(body.contactEmail)
  const contactPhone = clean(body.contactPhone)
  const preferredDate = clean(body.preferredDate)
  const flightInfo = clean(body.flightInfo)
  const customerNotes = clean(body.notes)
  const travelers = Number(body.travelers)
  const tour = getTour(tourSlug)

  if (!tour || tour.marketId !== "gosno") {
    return invalid("Choose a valid GoSno route.")
  }
  if (!contactName || !contactEmail || !contactPhone) {
    return invalid("Name, email, and phone are required.")
  }
  if (!Number.isInteger(travelers) || travelers < 1) {
    return invalid("Traveler count is required.")
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    return invalid("Pickup date is required.")
  }

  const pickupDateTime = new Date(`${preferredDate}T12:00:00.000Z`)
  if (Number.isNaN(pickupDateTime.getTime())) {
    return invalid("Pickup date is invalid.")
  }

  const leadId = `gosno_lead_${nanoid(12)}`
  const bookingId = `lead_${nanoid(10)}`
  const notes = JSON.stringify({
    status: "lead_pending",
    contactName,
    contactEmail,
    contactPhone,
    travelers,
    tourSlug,
    tourTitle: tour.title,
    route: body.route || tour.location,
    flightInfo,
    notes: customerNotes,
  })

  await db.insert(gosnoBookings).values({
    id: leadId,
    bookingId,
    userId: `lead:${contactEmail.toLowerCase()}`,
    productCode: tour.slug,
    pickupDateTime,
    destination: tour.location,
    numVehicles: Math.max(1, Math.ceil(travelers / 6)),
    pricePerVehicleCents: tour.priceFromCents,
    notes,
  })

  return NextResponse.json({ ok: true, id: leadId })
}
