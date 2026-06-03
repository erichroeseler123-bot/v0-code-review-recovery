import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * National Park "things to do" near a point — a third source for the
 * "what can I do near me?" view (alongside SeatGeek events and our own tours).
 *
 * Source: National Park Service API (real). Requires NPS_API_KEY.
 * The NPS API filters by state, not radius, so we:
 *   1. reverse-geocode lat/lng -> US state code (keyless OpenStreetMap)
 *   2. fetch /thingstodo for that state
 *   3. filter + sort by real distance from the origin
 *
 * Honest fallback: when the key is missing we return { configured: false }
 * and the UI shows a "connect in production" state — never fake park data.
 *
 * Query params: lat, lng (required); range (optional miles, default 150)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") ?? "")
  const lng = Number.parseFloat(searchParams.get("lng") ?? "")
  const rangeMiles = Number.parseFloat(searchParams.get("range") ?? "150")

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 })
  }

  const apiKey = process.env.NPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ configured: false, things: [] })
  }

  // 1. Reverse-geocode to a US state code.
  let stateCode = ""
  try {
    const revUrl = new URL("https://nominatim.openstreetmap.org/reverse")
    revUrl.searchParams.set("lat", String(lat))
    revUrl.searchParams.set("lon", String(lng))
    revUrl.searchParams.set("format", "json")
    const revRes = await fetch(revUrl, {
      headers: { "User-Agent": "EarthOS-Network/1.0" },
      next: { revalidate: 86400 },
    })
    if (revRes.ok) {
      const rev = await revRes.json()
      const iso = rev?.address?.["ISO3166-2-lvl4"] as string | undefined // e.g. "US-WI"
      if (iso?.startsWith("US-")) stateCode = iso.slice(3)
    }
  } catch {
    // fall through — without a state we can't query NPS by region
  }

  if (!stateCode) {
    return NextResponse.json({ configured: true, things: [] })
  }

  // 2. Fetch things-to-do for that state.
  try {
    const url = new URL("https://developer.nps.gov/api/v1/thingstodo")
    url.searchParams.set("stateCode", stateCode)
    url.searchParams.set("limit", "50")
    url.searchParams.set("api_key", apiKey)
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      return NextResponse.json({ configured: true, things: [], error: "Park lookup failed." }, { status: 502 })
    }
    const data = await res.json()

    // 3. Map + filter by real distance from the origin.
    const things = (data.data ?? [])
      .map((t: any) => {
        const tlat = Number.parseFloat(t.latitude)
        const tlng = Number.parseFloat(t.longitude)
        return {
          id: t.id as string,
          title: t.title as string,
          park: (t.relatedParks?.[0]?.fullName as string | undefined) ?? undefined,
          duration: (t.duration as string | undefined) || undefined,
          fee: t.isFeeRequired === "true",
          url: t.url as string,
          lat: Number.isNaN(tlat) ? null : tlat,
          lng: Number.isNaN(tlng) ? null : tlng,
        }
      })
      .filter((t: any) => t.lat != null && t.lng != null)
      .map((t: any) => ({ ...t, miles: haversineMiles(lat, lng, t.lat, t.lng) }))
      .filter((t: any) => t.miles <= rangeMiles)
      .sort((a: any, b: any) => a.miles - b.miles)
      .slice(0, 12)

    return NextResponse.json({ configured: true, things })
  } catch {
    return NextResponse.json({ configured: true, things: [], error: "Park lookup failed." }, { status: 502 })
  }
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
