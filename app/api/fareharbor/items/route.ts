import "server-only"
import { NextResponse } from "next/server"

/**
 * Discovery endpoint: lists the real FareHarbor items (tours) on the connected
 * company account, so we can map each storefront tour to its true item pk.
 * Returns an honest "not configured" state when credentials are absent.
 */
export async function GET() {
  const appKey = process.env.FAREHARBOR_API_APP_KEY
  const userKey = process.env.FAREHARBOR_API_USER_KEY
  const shortname = process.env.FAREHARBOR_SHORTNAME

  if (!appKey || !userKey || !shortname) {
    return NextResponse.json({ configured: false, items: [] })
  }

  const url = `https://fareharbor.com/api/external/v1/companies/${shortname}/items/`
  try {
    const res = await fetch(url, {
      headers: {
        "X-FareHarbor-API-App": appKey,
        "X-FareHarbor-API-User": userKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json(
        { configured: true, ok: false, status: res.status, detail: body.slice(0, 300), items: [] },
        { status: 200 },
      )
    }
    const data = (await res.json()) as { items?: { pk: number; name: string }[] }
    return NextResponse.json({
      configured: true,
      ok: true,
      shortname,
      items: (data.items ?? []).map((i) => ({ pk: i.pk, name: i.name })),
    })
  } catch (err) {
    return NextResponse.json(
      { configured: true, ok: false, error: (err as Error).message, items: [] },
      { status: 200 },
    )
  }
}
