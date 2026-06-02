import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Live events near a point, within a time window — the engine behind
 * "what can I do near me in the next 48 hours?"
 *
 * Source: SeatGeek (real API). Requires SEATGEEK_CLIENT_ID.
 * The key is Production-only, so in environments without it we return
 * { configured: false } and the UI shows an honest "events go live in
 * production" state — never fake events.
 *
 * Query params:
 *  - lat, lng (required)
 *  - hours    (optional, default 48) — size of the look-ahead window
 *  - range    (optional, default "75mi")
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") ?? "")
  const lng = Number.parseFloat(searchParams.get("lng") ?? "")
  const hours = Number.parseInt(searchParams.get("hours") ?? "48", 10)
  const range = searchParams.get("range") ?? "75mi"

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 })
  }

  const clientId = process.env.SEATGEEK_CLIENT_ID
  if (!clientId) {
    // Honest, non-fake fallback when the key isn't present (e.g. preview).
    return NextResponse.json({ configured: false, events: [] })
  }

  const now = new Date()
  const end = new Date(now.getTime() + hours * 60 * 60 * 1000)

  const url = new URL("https://api.seatgeek.com/2/events")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("lat", String(lat))
  url.searchParams.set("lon", String(lng))
  url.searchParams.set("range", range)
  url.searchParams.set("datetime_utc.gte", toSeatGeekTime(now))
  url.searchParams.set("datetime_utc.lte", toSeatGeekTime(end))
  url.searchParams.set("sort", "datetime_utc.asc")
  url.searchParams.set("per_page", "24")

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Cache briefly — event listings don't change second to second.
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return NextResponse.json({ configured: true, events: [], error: "Events lookup failed." }, { status: 502 })
    }
    const data = await res.json()
    const events = (data.events ?? []).map((e: any) => ({
      id: e.id,
      title: e.short_title || e.title,
      type: e.type as string,
      datetime: e.datetime_local as string,
      venue: e.venue?.name as string | undefined,
      city: e.venue?.city as string | undefined,
      state: e.venue?.state as string | undefined,
      lat: e.venue?.location?.lat as number | undefined,
      lng: e.venue?.location?.lon as number | undefined,
      url: e.url as string,
      priceFrom: e.stats?.lowest_price as number | null,
    }))
    return NextResponse.json({ configured: true, events })
  } catch {
    return NextResponse.json({ configured: true, events: [], error: "Events lookup failed." }, { status: 502 })
  }
}

/** SeatGeek wants "YYYY-MM-DDTHH:MM:SS" (no trailing Z). */
function toSeatGeekTime(d: Date): string {
  return d.toISOString().slice(0, 19)
}
