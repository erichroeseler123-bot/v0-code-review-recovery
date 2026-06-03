import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiKey = process.env.REZDY_API_KEY
  if (!apiKey) return NextResponse.json({ error: "no api key" }, { status: 500 })

  const { productCode, startTime, durationMinutes = 30, quantityAvailable = 3 } = await req.json()

  if (!productCode || !startTime) {
    return NextResponse.json({ error: "productCode and startTime required" }, { status: 400 })
  }

  const payload = {
    startTimeLocal: startTime,
    durationMinutes,
    quantityAvailable,
  }

  const url = `https://api.rezdy.com/v1/products/${productCode}/sessions?apiKey=${apiKey}`
  console.log("[v0] POST session to", url.slice(0, 60) + "...")

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  console.log("[v0] response status", r.status)
  const text = await r.text()
  console.log("[v0] response body (first 200)", text.slice(0, 200))

  return NextResponse.json({
    ok: r.ok,
    status: r.status,
    body: text.slice(0, 500),
  })
}
