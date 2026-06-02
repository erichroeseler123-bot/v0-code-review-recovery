"use client"

import { useState } from "react"
import { Check, Minus, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice, type Tour } from "@/lib/tours"

export function TourBookingPanel({ tour }: { tour: Tour }) {
  const { addItem, setOpen } = useCart()
  const [travelers, setTravelers] = useState(2)
  const [added, setAdded] = useState(false)

  function add(openCart: boolean) {
    addItem({
      tourSlug: tour.slug,
      title: tour.title,
      image: tour.image,
      port: tour.port,
      priceCents: tour.priceFromCents,
      travelers,
    })
    if (!openCart) setOpen(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm text-muted-foreground">From</span>
          <p className="font-serif text-3xl font-semibold text-foreground">
            {formatPrice(tour.priceFromCents)}
          </p>
          <span className="text-xs text-muted-foreground">per traveler</span>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {tour.durationHours} hours
        </span>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-foreground">Travelers</label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTravelers((t) => Math.max(1, t - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-secondary"
            aria-label="Remove a traveler"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-lg font-medium tabular-nums text-foreground">
            {travelers}
          </span>
          <button
            type="button"
            onClick={() => setTravelers((t) => t + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-secondary"
            aria-label="Add a traveler"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="font-serif text-xl font-semibold text-foreground">
          {formatPrice(tour.priceFromCents * travelers)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => add(true)}
        className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {added ? (
          <span className="inline-flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" /> Added to cart
          </span>
        ) : (
          "Add to cart"
        )}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Choose your exact date and time at checkout. Free dock pickup included.
      </p>
    </div>
  )
}
