import { NextResponse } from "next/server"

/**
 * Rezdy product/availability discovery + creation (GoSno + Shuttleya).
 *
 *  GET /api/rezdy/products
 *      Lists every product the API key can see (real productCodes + names).
 *  GET /api/rezdy/products?code=PXXXXX
 *      Fetches live sessions for that product over the next 21 days.
 *  GET /api/rezdy/products?full=PXXXXX
 *      Dumps the raw product object (used to learn the schema that works in
 *      this account before creating new products).
 *  POST /api/rezdy/products
 *      Creates products from the canonical definitions in lib/booking/rezdy-products.
 *      Body: { dryRun?: boolean, only?: string[] (slugs) }
 *      dryRun=true returns the payloads WITHOUT writing to Rezdy.
 *
 * Rezdy is region-pinned: US accounts use api.rezdy.com, others api.rezdy-eu.com.
 * REZDY_API_BASE overrides the default if needed.
 */

import { REZDY_PRODUCT_DEFS, toRezdyProductPayload } from "@/lib/booking/rezdy-products"

const DEFAULT_BASE = "https://api.rezdy.com/v1"

function base() {
  return process.env.REZDY_API_BASE || DEFAULT_BASE
}

export async function GET(req: Request) {
  const apiKey = process.env.REZDY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ configured: false, products: [] })
  }
  const url0 = new URL(req.url)
  const code = url0.searchParams.get("code")?.trim()
  const full = url0.searchParams.get("full")?.trim()

  // Raw product object (schema discovery)
  if (full) {
    const r = await fetch(`${base()}/products/${full}?apiKey=${apiKey}`, { cache: "no-store" })
    const raw = await r.text()
    let j: unknown = null
    try {
      j = JSON.parse(raw)
    } catch {
      /* non-JSON */
    }
    return NextResponse.json({ ok: r.ok, status: r.status, body: j ?? raw.slice(0, 600) })
  }

  // Availability probe for a single product
  if (code) {
    const from = `${new Date().toISOString().slice(0, 10)} 00:00:00`
    const to = `${new Date(Date.now() + 21 * 864e5).toISOString().slice(0, 10)} 23:59:59`
    const params = new URLSearchParams({
      apiKey,
      productCode: code,
      startTimeLocal: from,
      endTimeLocal: to,
    })
    const url = `${base()}/availability?${params.toString()}`
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
  const url = `${base()}/products?apiKey=${apiKey}&limit=100`
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

export async function POST(req: Request) {
  const apiKey = process.env.REZDY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ configured: false, error: "REZDY_API_KEY not set" }, { status: 400 })
  }

  let body: { dryRun?: boolean; only?: string[] } = {}
  try {
    body = await req.json()
  } catch {
    /* empty body = create all, live */
  }
  const only = body.only?.length ? new Set(body.only) : null
  const defs = REZDY_PRODUCT_DEFS.filter((d) => !only || only.has(d.slug))

  // Dry run: return the exact payloads without touching Rezdy.
  if (body.dryRun) {
    return NextResponse.json({
      dryRun: true,
      count: defs.length,
      payloads: defs.map((d) => ({ slug: d.slug, payload: toRezdyProductPayload(d) })),
    })
  }

  const results: {
    slug: string
    ok: boolean
    status: number
    productCode?: string
    error?: string
  }[] = []

  for (const def of defs) {
    const payload = toRezdyProductPayload(def)
    const r = await fetch(`${base()}/products?apiKey=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const raw = await r.text()
    let j: { product?: { productCode?: string }; requestStatus?: { error?: { errorMessage?: string } } } = {}
    try {
      j = JSON.parse(raw)
    } catch {
      /* non-JSON */
    }
    results.push({
      slug: def.slug,
      ok: r.ok,
      status: r.status,
      productCode: j.product?.productCode,
      error: r.ok ? undefined : (j.requestStatus?.error?.errorMessage ?? raw.slice(0, 200)),
    })
    // Stop early on the first failure so we never spray a broken account.
    if (!r.ok) break
  }

  return NextResponse.json({ created: results.filter((x) => x.ok).length, results })
}
