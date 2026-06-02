"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Crosshair, Loader2, MapPin } from "lucide-react"
import {
  rankMarketsByDistance,
  formatMiles,
  QUICK_ORIGINS,
  type Coords,
  type RankedMarket,
} from "@/lib/geo"
import { formatPrice } from "@/lib/tours"
import type { BookingProvider } from "@/lib/markets"

const PROVIDER_LABEL: Record<BookingProvider, string> = {
  fareharbor: "Books on-site",
  rezdy: "Books on-site",
  viator: "Booked via Viator",
  getyourguide: "Booked via GetYourGuide",
}

export function NearMe({
  defaultOrigin,
  originLabel,
  excludeMarketId,
}: {
  defaultOrigin?: Coords
  originLabel?: string
  excludeMarketId?: string
}) {
  const [origin, setOrigin] = useState<Coords | null>(defaultOrigin ?? null)
  const [label, setLabel] = useState<string>(originLabel ?? "")
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string>("")

  const ranked: RankedMarket[] = origin
    ? rankMarketsByDistance(origin).filter((r) => r.market.id !== excludeMarketId)
    : []

  function useMyLocation() {
    setError("")
    if (!("geolocation" in navigator)) {
      setError("Location isn't available in this browser. Pick a place below instead.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLabel("your location")
        setLocating(false)
      },
      () => {
        setError("Couldn't get your location. Pick a place below instead.")
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          Use my location
        </button>
        <span className="text-sm text-muted-foreground">or preview a place:</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_ORIGINS.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => {
              setOrigin(o.coords)
              setLabel(o.label)
              setError("")
            }}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              label === o.label
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {origin ? (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            <MapPin className="mr-1 inline h-4 w-4 text-primary" />
            Closest experiences to <span className="font-medium text-foreground">{label}</span>
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {ranked.map(({ market, miles, tourCount, fromCents }) => (
              <li
                key={market.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold text-foreground">{market.name}</h3>
                    <span className="text-xs font-medium text-primary">{formatMiles(miles)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{market.scope}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{market.region}</span>
                    <span aria-hidden>·</span>
                    <span>{tourCount > 0 ? `${tourCount} experiences` : "Coming soon"}</span>
                    {fromCents ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>from {formatPrice(fromCents)}</span>
                      </>
                    ) : null}
                    <span aria-hidden>·</span>
                    <span>{PROVIDER_LABEL[market.provider]}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/s/${market.id}/tours`}
                    className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    More info
                  </Link>
                  <Link
                    href={`/s/${market.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Book
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
