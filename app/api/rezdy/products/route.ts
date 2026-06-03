import { NextResponse } from "next/server"

/**
 * Rezdy product/availability discovery probe (GoSno + Shuttleya).
 *
 *  - GET /api/rezdy/products
 *      Lists every product the API key can see (real productCodes + names).
 *  - GET /api/rezdy/products?code=PXXXXX
 *      Fetches live sessions for that product over the next 21 days
 *      (real start times, seats, prices) so we can verify before mapping.
 *
 * Rezdy is region-pinned: US accounts use api.rezdy.com, others api.rezdy-eu.com.
 * REZDY_API_BASE overrides the default if needed.
 */

const DEFAULT_BASE = "https://api.rezdy.com/v1"

export async function GET(req: Request) {
  const apiKey = process.env.REZDY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ configured: false, products: [] })
  }
  const base = process.env.REZDY_API_BASE || DEFAULT_BASE
  const code = new URL(req.url).searchParams.get("code")?.trim()

  // Availability probe for a single product
  if (code) {
    // Rezdy requires "yyyy-MM-dd HH:mm:ss" (not a bare date).
    const from = `${new Date().toISOString().slice(0, 10)} 00:00:00`
    const to = `${new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10)} 23:59:59`
    const params = new URLSearchParams({
      apiKey,
      productCode: code,
      startTimeLocal: from,
      endTimeLocal: to,
    })
    const url = `${base}/availability?${params.toString()}`
    const r = await fetch(url, { cache: "no-store" })
    const raw = await r.text()
    let j: {
      sessions?: { id: number; startTimeLocal: string; seatsAvailable?: number; totalPrice?: number }[]
    } = {}
    try {
      j = JSON.parse(raw)
    } catch {
      /* non-JSON */
    }
    return NextResponse.json({
      configured: true,
      ok: r.ok,
      status: r.status,
      code,
      detail: r.ok ? undefined : raw.slice(0, 400),
      count: j.sessions?.length ?? 0,
      sample: (j.sessions ?? []).slice(0, 5).map((s) => ({
        startTimeLocal: s.startTimeLocal,
        seatsAvailable: s.seatsAvailable,
        totalPrice: s.totalPrice,
      })),
    })
  }

  // Product catalog
  const url = `${base}/products?apiKey=${apiKey}&limit=100`
  const r = await fetch(url, { cache: "no-store" })
  const raw = await r.text()
  let j: { products?: { productCode?: string; name?: string; productType?: string }[] } = {}
  try {
    j = JSON.parse(raw)
  } catch {
    /* non-JSON */
  }
  return NextResponse.json({
    configured: true,
    ok: r.ok,
    status: r.status,
    detail: r.ok ? undefined : raw.slice(0, 400),
    count: j.products?.length ?? 0,
    products: (j.products ?? []).map((p) => ({
      productCode: p.productCode,
      name: p.name,
      productType: p.productType,
    })),
  })
}
