"use client"

import useSWR from "swr"
import { CalendarClock, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/tours"

interface Slot {
  id: string
  label: string
  startsAt: string
  capacityRemaining: number
  soldOut: boolean
  priceCents: number
}
interface DateGroup {
  date: string
  slots: Slot[]
}
interface AvailabilityResponse {
  provider: string | null
  configured?: boolean
  mapped?: boolean
  handoff?: boolean
  dates?: DateGroup[]
}

const PROVIDER_LABEL: Record<string, string> = {
  fareharbor: "FareHarbor",
  rezdy: "Rezdy",
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDay(date: string) {
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}
function formatTime(iso: string) {
  // FareHarbor start times carry the operator's Alaska offset; render in Alaska
  // time so the displayed time matches the actual departure.
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Anchorage",
  })
}

export function LiveAvailability({
  tourSlug,
  provider,
  onPick,
}: {
  tourSlug: string
  provider: string
  onPick?: (slot: Slot) => void
}) {
  const { data, isLoading } = useSWR<AvailabilityResponse>(
    `/api/availability?tour=${tourSlug}&days=14`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const label = PROVIDER_LABEL[provider] ?? "the provider"

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking live availability…
      </p>
    )
  }

  // Not configured yet — honest, no fake times.
  if (data && data.configured === false) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        Live times turn on the moment {label} is connected. Until then, add to cart and we&apos;ll
        confirm your slot.
      </div>
    )
  }

  // Configured but this tour isn't mapped to a real provider item.
  if (data && data.configured && data.mapped === false) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        This tour isn&apos;t mapped to a live {label} item yet. Add to cart and we&apos;ll confirm
        your slot.
      </div>
    )
  }

  const dates = data?.dates ?? []

  // Configured + mapped, but the provider returned no live windows.
  if (dates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
        No live departures in the next 45 days. Add to cart and we&apos;ll confirm the next opening.
      </div>
    )
  }

  // Real availability.
  const firstDates = dates.slice(0, 5)
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <CalendarClock className="h-4 w-4 text-primary" /> Live availability
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {firstDates.map((d) => (
          <div key={d.date}>
            <p className="text-xs font-medium text-muted-foreground">{formatDay(d.date)}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {d.slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={s.soldOut}
                  onClick={() => !s.soldOut && onPick?.(s)}
                  className={
                    s.soldOut
                      ? "cursor-not-allowed rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground line-through"
                      : "rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary"
                  }
                  title={
                    s.soldOut
                      ? "Sold out"
                      : `${s.capacityRemaining} spots left · ${formatPrice(s.priceCents)}`
                  }
                >
                  {formatTime(s.startsAt)}
                  {s.soldOut ? (
                    <span className="ml-1 text-[10px] uppercase">Sold out</span>
                  ) : (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      {s.capacityRemaining} left
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
