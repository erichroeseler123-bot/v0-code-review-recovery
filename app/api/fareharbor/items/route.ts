import "server-only"
import { NextResponse } from "next/server"

/**
 * Discovery endpoint: lists the real FareHarbor items (tours) on the connected
 * company account, so we can map each storefront tour to its true item pk.
 * Returns an honest "not configured" state when credentials are absent.
 */
export async function GET(req: Request) {
  const appKey = process.env.FAREHARBOR_API_APP_KEY
  const userKey = process.env.FAREHARBOR_API_USER_KEY
  // Affiliates resell OTHER operators' inventory: allow probing any operator
  // shortname (e.g. coastalhelicopters, temscoair), defaulting to our own.
  const param = new URL(req.url).searchParams.get("shortname")?.trim()
  const shortname = param || process.env.FAREHARBOR_SHORTNAME

  if (!appKey || !userKey || !shortname) {
    return NextResponse.json({ configured: false, items: [] })
  }

  // Discovery probe: ?list=companies enumerates every partner company this
  // affiliate key can access (returns real shortnames behind the partner IDs).
  const list = new URL(req.url).searchParams.get("list")?.trim()
  if (list === "companies") {
    const url = `https://fareharbor.com/api/external/v1/companies/`
    const r = await fetch(url, {
      headers: { "X-FareHarbor-API-App": appKey, "X-FareHarbor-API-User": userKey },
      cache: "no-store",
    })
    const raw = await r.text()
    let j: { companies?: { name?: string; shortname?: string; pk?: number }[] } = {}
    try {
      j = JSON.parse(raw)
    } catch {
      /* non-JSON */
    }
    return NextResponse.json({
      configured: true,
      ok: r.ok,
      status: r.status,
      url,
      detail: r.ok ? undefined : raw.slice(0, 400),
      count: j.companies?.length ?? 0,
      companies: (j.companies ?? []).map((c) => ({
        pk: c.pk,
        name: c.name,
        shortname: c.shortname,
      })),
    })
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
