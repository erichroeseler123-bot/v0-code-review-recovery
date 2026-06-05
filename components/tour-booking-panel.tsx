"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ExternalLink, Loader2, MessageSquare, Minus, Phone, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import type { Market } from "@/lib/markets"
import { formatPrice, type Tour } from "@/lib/tours"
import { bookingHref, hasConnectedBookingUrl } from "@/lib/links"
import { LiveAvailability } from "@/components/live-availability"
import { GoSnoRezdyBooking } from "@/components/gosno-rezdy-booking"
import { SomersetRezdyBooking } from "@/components/somerset-rezdy-booking"

const GOSNO_PHONE = "720-369-6292"
const GOSNO_SMS = "7203696292"

const PROVIDER_LABEL: Record<string, string> = {
  viator: "Viator",
  getyourguide: "GetYourGuide",
  fareharbor: "FareHarbor",
  rezdy: "Rezdy",
}

export function TourBookingPanel({ tour, market }: { tour: Tour; market: Market }) {
  const { addItem, setOpen } = useCart()
  const router = useRouter()
  const [travelers, setTravelers] = useState(1)
  const [added, setAdded] = useState(false)
  const [showRezdyBooking, setShowRezdyBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [slots, setSlots] = useState<FareHarborSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<FareHarborSlot | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  function add() {
    addItem({
      tourSlug: tour.slug,
      marketId: market.id,
      title: tour.title,
      image: tour.image,
      port: tour.location,
      priceCents: tour.priceFromCents,
      travelers,
    })
    setOpen(true)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  useEffect(() => {
    if (market.provider !== "fareharbor") return
    setSelectedSlot(null)
    setSlots([])
    setAvailabilityError(null)

    if (!selectedDate) {
      setAvailabilityStatus("idle")
      return
    }

    let cancelled = false
    async function loadAvailability() {
      setAvailabilityStatus("loading")
      try {
        const res = await fetch(`/api/availability?tour=${tour.slug}&date=${selectedDate}`)
        const data = (await res.json()) as FareHarborAvailabilityResponse

        if (cancelled) return

        if (data.configured === false) {
          setAvailabilityStatus("error")
          setAvailabilityError("Live FareHarbor booking is not connected for this storefront yet.")
          return
        }

        if (data.mapped === false) {
          setAvailabilityStatus("error")
          setAvailabilityError("This tour is not mapped to a live FareHarbor item yet.")
          return
        }

        const liveSlots = (data.dates?.[0]?.slots ?? []).filter((slot) => !slot.soldOut)
        setSlots(liveSlots)
        setAvailabilityStatus(liveSlots.length > 0 ? "ready" : "error")
        setAvailabilityError(liveSlots.length > 0 ? null : "No available FareHarbor times were returned for this date.")
      } catch {
        if (!cancelled) {
          setAvailabilityStatus("error")
          setAvailabilityError("Could not load FareHarbor availability. Please choose another date or try again.")
        }
      }
    }

    loadAvailability()
    return () => {
      cancelled = true
    }
  }, [market.provider, selectedDate, tour.slug])

  function formatSlotTime(slot: FareHarborSlot) {
    return new Date(slot.startsAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Anchorage",
    })
  }

  function addSelectedFareHarborSlot() {
    if (!selectedDate || !selectedSlot) return
    addItem({
      tourSlug: tour.slug,
      marketId: market.id,
      title: tour.title,
      image: tour.image,
      port: tour.location,
      priceCents: selectedSlot.priceCents || tour.priceFromCents,
      travelers,
      availabilityId: selectedSlot.id,
      selectedDate,
      startsAt: selectedSlot.startsAt,
      dateLabel: `${selectedDate} · ${formatSlotTime(selectedSlot)}`,
    })
    setOpen(false)
    router.push(`/s/${market.id}/checkout`)
  }

  if (market.id === "gosno") {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-sm text-muted-foreground">From</span>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {formatPrice(tour.priceFromCents)}
            </p>
            <span className="text-xs text-muted-foreground">per vehicle estimate</span>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Rezdy booking
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Book online through Rezdy. Choose your vehicle, date, and pickup time in the secure
          Rezdy booking widget.
        </p>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => setShowRezdyBooking((open) => !open)}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book Online
          </button>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${GOSNO_SMS}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
            <a
              href={`sms:${GOSNO_SMS}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <MessageSquare className="h-4 w-4" />
              Text
            </a>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Online bookings are confirmed in Rezdy. You can also call or text {GOSNO_PHONE}.
        </p>

        {showRezdyBooking && (
          <div className="mt-5 border-t border-border pt-5">
            <GoSnoRezdyBooking />
          </div>
        )}
      </div>
    )
  }

  if (market.id === "somerset") {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Private Suburban</span>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {formatPrice(tour.priceFromCents)}
            </p>
            <span className="text-xs text-muted-foreground">booking handled by Rezdy</span>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Rezdy booking
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Book online through Rezdy. Choose your date/time and complete payment in the secure
          Rezdy booking widget.
        </p>

        <div className="mt-5">
          <a
            href="#somerset-rezdy-booking"
            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book Online
          </a>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Rezdy handles date/time selection, payment, and confirmation.
        </p>

        <div id="somerset-rezdy-booking" className="mt-5 border-t border-border pt-5">
          <SomersetRezdyBooking />
        </div>
      </div>
    )
  }

  if (market.provider === "fareharbor") {
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
            FareHarbor
          </span>
        </div>

        <div className="mt-5 grid gap-1.5">
          <label htmlFor="fareharbor-date" className="text-sm font-medium text-foreground">
            Choose date
          </label>
          <input
            id="fareharbor-date"
            type="date"
            min={today}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-foreground">Choose time</p>
          {!selectedDate ? (
            <p className="mt-2 rounded-md border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              Select a date to load live FareHarbor times.
            </p>
          ) : availabilityStatus === "loading" ? (
            <p className="mt-2 flex items-center gap-2 rounded-md border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available times...
            </p>
          ) : availabilityStatus === "error" ? (
            <p className="mt-2 rounded-md border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              {availabilityError}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={
                    selectedSlot?.id === slot.id
                      ? "rounded-md border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                      : "rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary"
                  }
                >
                  {formatSlotTime(slot)}
                  <span className="ml-1 text-xs opacity-75">{slot.capacityRemaining} left</span>
                </button>
              ))}
            </div>
          )}
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
            {formatPrice((selectedSlot?.priceCents || tour.priceFromCents) * travelers)}
          </span>
        </div>

        <button
          type="button"
          onClick={addSelectedFareHarborSlot}
          disabled={!selectedDate || !selectedSlot || availabilityStatus !== "ready"}
          className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to checkout
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Checkout requires a selected FareHarbor date and time.
        </p>
      </div>
    )
  }

  // Handoff providers: book on the partner's site.
  if (!market.onSiteCheckout) {
    const label = PROVIDER_LABEL[market.provider] ?? "our partner"
    const hasProductLink = hasConnectedBookingUrl(tour)
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div>
          <span className="text-sm text-muted-foreground">From</span>
          <p className="font-serif text-3xl font-semibold text-foreground">
            {formatPrice(tour.priceFromCents)}
          </p>
          <span className="text-xs text-muted-foreground">per traveler</span>
        </div>
        {hasProductLink ? (
          <>
            <a
              href={bookingHref(tour, market)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book on {label}
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Availability, dates, and payment are handled securely by {label}.
            </p>
          </>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Product link not connected yet</p>
            <p className="mt-1">
              This product needs its exact {label} product URL before online booking can be
              linked from this page.
            </p>
          </div>
        )}
      </div>
    )
  }

  // On-site providers (FareHarbor / Rezdy): add to cart.
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

      <div className="mt-5 border-t border-border pt-4">
        <LiveAvailability tourSlug={tour.slug} provider={market.provider} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="font-serif text-xl font-semibold text-foreground">
          {formatPrice(tour.priceFromCents * travelers)}
        </span>
      </div>

      <button
        type="button"
        onClick={add}
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
        Choose your exact date and time at checkout.
      </p>
    </div>
  )
}

interface FareHarborSlot {
  id: string
  label: string
  startsAt: string
  capacityRemaining: number
  soldOut: boolean
  priceCents: number
}

interface FareHarborAvailabilityResponse {
  configured?: boolean
  mapped?: boolean
  dates?: { date: string; slots: FareHarborSlot[] }[]
}
