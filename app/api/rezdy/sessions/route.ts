import { NextResponse } from "next/server"

const apiKey = process.env.REZDY_API_KEY
const baseUrl = "https://api.rezdy.com/v1"

interface CreateSessionPayload {
  startTimeLocal: string
  durationMinutes: number
  quantityAvailable: number
  price?: number
}

/**
 * POST /api/rezdy/sessions
 * Create availability sessions for GoSno products.
 * ?productCode=PB1CE8&date=2026-06-10&from=06:00&to=22:00&quantity=3&interval=30
 * Creates sessions at 30-minute intervals with specified quantity available.
 */
export async function POST(req: Request) {
  const apiKey = process.env.REZDY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "REZDY_API_KEY not configured" }, { status: 500 })
  }

  const { productCode, date, from = "06:00", to = "22:00", quantity = 3, interval = 30 } = await req.json()

  if (!productCode || !date) {
    return NextResponse.json({ error: "productCode and date required" }, { status: 400 })
  }

  // Parse time strings
  const [fromHour, fromMin] = from.split(":").map(Number)
  const [toHour, toMin] = to.split(":").map(Number)

  const startMinutes = fromHour * 60 + fromMin
  const endMinutes = toHour * 60 + toMin

  const sessions: CreateSessionPayload[] = []
  for (let m = startMinutes; m < endMinutes; m += interval) {
    const hour = Math.floor(m / 60)
    const min = m % 60
    sessions.push({
      startTimeLocal: `${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`,
      durationMinutes: interval,
      quantityAvailable: quantity,
    })
  }

  const results = []
  for (const session of sessions) {
    try {
      const params = new URLSearchParams({ apiKey })
      const url = `${baseUrl}/products/${productCode}/sessions?${params.toString()}`
      console.log("[v0] sessions POST", url.slice(0, 80))
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      })

      const data = (await r.json()) as { session?: { id?: number; startTimeLocal?: string }; error?: string }
      results.push({
        time: session.startTimeLocal,
        ok: r.ok,
        sessionId: r.ok ? data.session?.id : undefined,
        status: r.status,
        error: r.ok ? undefined : data.error || (await r.text()).slice(0, 100),
      })
    } catch (err) {
      results.push({ time: session.startTimeLocal, ok: false, error: String(err), status: -1 })
    }
  }

  const created = results.filter((r) => r.ok).length
  return NextResponse.json({ productCode, date, interval, quantity, created, results })
}
