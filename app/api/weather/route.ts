import { NextResponse } from "next/server"

/**
 * Server-side proxy to Open-Meteo — a free, keyless weather API.
 * Returns current conditions for a coordinate so EarthOS can show real,
 * live weather next to each location (no API key required).
 */

// WMO weather interpretation codes → short label + emoji-free icon key.
const WMO: Record<number, { label: string; icon: WeatherIcon }> = {
  0: { label: "Clear", icon: "sun" },
  1: { label: "Mostly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Heavy drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Heavy showers", icon: "rain" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm", icon: "storm" },
  99: { label: "Thunderstorm", icon: "storm" },
}

export type WeatherIcon =
  | "sun"
  | "cloud-sun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") ?? "")
  const lng = Number.parseFloat(searchParams.get("lng") ?? "")

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Missing coordinates." }, { status: 400 })
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.searchParams.set("latitude", String(lat))
  url.searchParams.set("longitude", String(lng))
  url.searchParams.set("current", "temperature_2m,weather_code")
  url.searchParams.set("temperature_unit", "fahrenheit")
  url.searchParams.set("timezone", "auto")

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) {
      return NextResponse.json({ error: "Weather lookup failed." }, { status: 502 })
    }
    const data = (await res.json()) as {
      current?: { temperature_2m: number; weather_code: number }
    }
    if (!data.current) {
      return NextResponse.json({ error: "No weather data." }, { status: 404 })
    }

    const code = WMO[data.current.weather_code] ?? { label: "—", icon: "cloud" as WeatherIcon }
    return NextResponse.json({
      tempF: Math.round(data.current.temperature_2m),
      label: code.label,
      icon: code.icon,
    })
  } catch {
    return NextResponse.json({ error: "Weather lookup failed." }, { status: 502 })
  }
}
