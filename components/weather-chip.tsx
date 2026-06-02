"use client"

import useSWR from "swr"
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react"
import type { WeatherIcon } from "@/app/api/weather/route"

const ICONS: Record<WeatherIcon, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: Zap,
}

interface WeatherData {
  tempF: number
  label: string
  icon: WeatherIcon
}

const fetcher = async (url: string): Promise<WeatherData> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("weather")
  return res.json()
}

/** Live current conditions for a coordinate, via the keyless Open-Meteo API. */
export function WeatherChip({ lat, lng }: { lat: number; lng: number }) {
  const { data, error, isLoading } = useSWR<WeatherData>(
    `/api/weather?lat=${lat}&lng=${lng}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 1_800_000 },
  )

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
        <span className="h-3 w-3 animate-pulse rounded-full bg-muted-foreground/40" />
        Weather
      </span>
    )
  }

  if (error || !data) return null

  const Icon = ICONS[data.icon] ?? Cloud
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
      {data.tempF}&deg;F
      <span className="text-muted-foreground">{data.label}</span>
    </span>
  )
}
