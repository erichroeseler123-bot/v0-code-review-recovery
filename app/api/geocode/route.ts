import { NextResponse } from "next/server"

/**
 * Server-side proxy to OpenStreetMap Nominatim — a free, keyless geocoder.
 * Proxying lets us send a proper User-Agent (their usage policy) and avoids
 * client CORS issues. Resolves typed locations like "Eau Claire WI" or a
 * hotel address into coordinates so trip planners can search before they go.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Enter a place to search." }, { status: 400 })
  }

  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", q)
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("limit", "1")
  url.searchParams.set("addressdetails", "0")
  url.searchParams.set("countrycodes", "us,ca")

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EarthOS-Network/1.0 (location search for tour storefronts)",
        "Accept-Language": "en",
      },
      // Cache results for a day — place coordinates don't move.
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Location lookup failed." }, { status: 502 })
    }

    const data = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name: string
    }>

    if (!data.length) {
      return NextResponse.json({ error: `No match for "${q}".` }, { status: 404 })
    }

    const top = data[0]
    // Trim Nominatim's long display name to the first 2-3 meaningful parts.
    const parts = top.display_name.split(",").map((p) => p.trim())
    const label = parts.length > 2 ? `${parts[0]}, ${parts[parts.length - 2]}` : parts[0]

    return NextResponse.json({
      lat: Number.parseFloat(top.lat),
      lng: Number.parseFloat(top.lon),
      label,
    })
  } catch {
    return NextResponse.json({ error: "Location lookup failed." }, { status: 502 })
  }
}
