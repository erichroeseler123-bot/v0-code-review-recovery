"use client"

import { useMemo, useState } from "react"
import { TourCard } from "@/components/tour-card"
import { TOURS, PORTS } from "@/lib/tours"

export function ToursBrowser({ initialPort }: { initialPort?: string }) {
  const [port, setPort] = useState<string>(
    initialPort && PORTS.includes(initialPort) ? initialPort : "All",
  )

  const filtered = useMemo(
    () => (port === "All" ? TOURS : TOURS.filter((t) => t.port === port)),
    [port],
  )

  const filters = ["All", ...PORTS]

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((p) => {
          const active = p === port
          return (
            <button
              key={p}
              type="button"
              onClick={() => setPort(p)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No tours found for this port yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
