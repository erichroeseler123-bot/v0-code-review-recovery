import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.REZDY_API_KEY

// All GoSno + Argo products with their max vehicle quantities
const PRODUCTS = [
  { code: "PB1CE8", name: "Breckenridge", quantity: 3 },
  { code: "PXFGPP", name: "Vail", quantity: 3 },
  { code: "P9PQRN", name: "Keystone", quantity: 2 },
  { code: "P360K5", name: "Winter Park", quantity: 2 },
  { code: "PHCYQL", name: "Copper", quantity: 3 },
  { code: "P11TWN", name: "Aspen", quantity: 4 },
  { code: "PEZN8V", name: "Steamboat", quantity: 6 },
  { code: "P9AP71", name: "Beaver Creek", quantity: 3 },
  { code: "PJQSR2", name: "Argo", quantity: 1 }, // Shared shuttle
]

export async function POST(req: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: "REZDY_API_KEY not set" }, { status: 500 })

  const body = await req.json()
  const daysAhead = body.days ?? 60
  const startHour = body.startHour ?? 6
  const endHour = body.endHour ?? 22
  const intervalMinutes = body.interval ?? 30

  const productResults = []

  for (const product of PRODUCTS) {
    const sessions = []
    const now = new Date()

    // Generate 30-minute pickups for each day for the next N days
    for (let d = 0; d < daysAhead; d++) {
      const date = new Date(now)
      date.setDate(date.getDate() + d)

      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += intervalMinutes) {
          const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`
          const isoTime = `${date.toISOString().slice(0, 10)}T${timeStr}`

          sessions.push({
            startTimeLocal: isoTime,
            durationMinutes: 150, // Typical transfer duration
            quantityAvailable: product.quantity,
          })
        }
      }
    }

    // Post all sessions for this product
    let created = 0
    let failed = 0
    for (const session of sessions) {
      try {
        const params = new URLSearchParams({ apiKey: API_KEY })
        const r = await fetch(
          `https://api.rezdy.com/v1/products/${product.code}/sessions?${params.toString()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(session),
          }
        )
        if (r.ok) created++
        else failed++
      } catch {
        failed++
      }
    }

    productResults.push({
      product: product.name,
      code: product.code,
      total: sessions.length,
      created,
      failed,
    })
  }

  return NextResponse.json({
    daysAhead,
    products: productResults,
    totalSessions: productResults.reduce((sum, p) => sum + p.total, 0),
    totalCreated: productResults.reduce((sum, p) => sum + p.created, 0),
  })
}
