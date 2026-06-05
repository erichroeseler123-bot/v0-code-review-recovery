import "server-only"
import { NextResponse } from "next/server"
import { getTour } from "@/lib/tours"
import { getMarket } from "@/lib/markets"
import { getAdapter } from "@/lib/booking"

/**
 * Live availability for a single tour.
 *   GET /api/availability?tour=<slug>&days=45
 *
 * Honest states (never fabricated):
 *   configured:false      -> provider credentials not set
 *   mapped:false          -> tour has no provider item reference
 *   slots:[] (ok)         -> provider returned no live times in the window
 *   slots:[...]           -> real availability, with sold-out flags
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("tour")
  const date = searchParams.get("date")
  const days = Math.min(Number(searchParams.get("days") ?? 45), 90)

  if (!slug) {
    return NextResponse.json({ error: "Missing tour" }, { status: 400 })
  }

  const tour = getTour(slug)
  if (!tour) {
    return NextResponse.json({ error: "Unknown tour" }, { status: 404 })
  }

  const market = getMarket(tour.marketId)
  if (!market || !market.onSiteCheckout) {
    // Handoff markets book on the partner site; no live feed here.
    return NextResponse.json({ provider: market?.provider ?? null, handoff: true, slots: [] })
  }

  if (market.provider === "fareharbor" && market.id !== "alaska") {
    return NextResponse.json({
      provider: market.provider,
      configured: false,
      mapped: Boolean(tour.providerRef),
      wtaOnly: true,
      slots: [],
      dates: [],
    })
  }

  const adapter = getAdapter(market.provider)
  const configured = adapter.isConfigured()
  const mapped = Boolean(tour.providerRef && tour.providerCompany)

  if (!configured || !mapped) {
    return NextResponse.json({
      provider: market.provider,
      configured,
      mapped,
      slots: [],
    })
  }

  const now = date ? new Date(`${date}T00:00:00`) : new Date()
  const to = date
    ? new Date(`${date}T23:59:59`)
    : new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  const slots = await adapter.getAvailability(
    tour.providerRef!,
    now.toISOString(),
    to.toISOString(),
    tour.providerCompany,
  )

  // Group slots by calendar date, marking sold-out windows honestly.
  const byDate: Record<string, { id: string; label: string; startsAt: string; capacityRemaining: number; soldOut: boolean; priceCents: number; customerTypeRates?: { id: string; label: string; totalCents: number; totalIncludingTaxCents?: number; capacityRemaining?: number; minimumPartySize?: number; maximumPartySize?: number }[] }[]> =
    {}
  for (const s of slots) {
    const date = s.startsAt.slice(0, 10)
    byDate[date] ??= []
    byDate[date].push({
      id: s.id,
      label: s.label,
      startsAt: s.startsAt,
      capacityRemaining: s.capacityRemaining,
      soldOut: s.capacityRemaining <= 0,
      priceCents: s.priceCents,
      customerTypeRates: s.customerTypeRates,
    })
  }

  return NextResponse.json({
    provider: market.provider,
    configured: true,
    mapped: true,
    days,
    dates: Object.keys(byDate)
      .sort()
      .map((date) => ({ date, slots: byDate[date] })),
  })
}
