"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CalendarClock, Check, ExternalLink, Loader2, MessageSquare, Minus, Phone, Plus } from "lucide-react"
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
  const [travelers, setTravelers] = useState(1)
  const [added, setAdded] = useState(false)
  const [showRezdyBooking, setShowRezdyBooking] = useState(false)
  const [wtaDate, setWtaDate] = useState("")
  const [wtaSlots, setWtaSlots] = useState<FareHarborSlot[]>([])
  const [wtaSlot, setWtaSlot] = useState<FareHarborSlot | null>(null)
  const [wtaQuantities, setWtaQuantities] = useState<Record<string, number>>({})
  const [wtaStatus, setWtaStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [wtaError, setWtaError] = useState<string | null>(null)

  useEffect(() => {
    if (market.id !== "alaska") return
    if (!wtaDate) {
      setWtaSlots([])
      setWtaSlot(null)
      setWtaQuantities({})
      setWtaStatus("idle")
      setWtaError(null)
      return
    }

    const controller = new AbortController()
    setWtaStatus("loading")
    setWtaError(null)
    setWtaSlot(null)
    setWtaQuantities({})

    async function loadAvailability() {
      try {
        const res = await fetch(
          `/api/availability?tour=${encodeURIComponent(tour.slug)}&date=${encodeURIComponent(wtaDate)}`,
          { signal: controller.signal },
        )
        const data = (await res.json()) as FareHarborAvailabilityResponse
        if (!res.ok || data.configured === false || data.mapped === false) {
          setWtaSlots([])
          setWtaStatus("error")
          setWtaError("Live FareHarbor booking is not connected for this WTA product yet.")
          return
        }

        const slots = (data.dates ?? [])
          .flatMap((group) => group.slots)
          .filter((slot) => !slot.soldOut && slot.customerTypeRates?.length)
        setWtaSlots(slots)
        setWtaStatus("ready")
        setWtaError(slots.length ? null : "No bookable FareHarbor times were returned for this date.")
      } catch (error) {
        if ((error as Error).name === "AbortError") return
        setWtaSlots([])
        setWtaStatus("error")
        setWtaError("Could not load FareHarbor availability. Please choose another date.")
      }
    }

    loadAvailability()
    return () => controller.abort()
  }, [market.id, tour.slug, wtaDate])

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

  function formatSlotTime(slot: FareHarborSlot) {
    return new Date(slot.startsAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Anchorage",
    })
  }

  function formatSlotDay(slot: FareHarborSlot) {
    return new Date(slot.startsAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "America/Anchorage",
    })
  }

  const wtaSelectedRates = wtaSlot?.customerTypeRates ?? []
  const wtaTravelerCount = wtaSelectedRates.reduce((sum, rate) => sum + (wtaQuantities[rate.id] ?? 0), 0)
  const wtaTotalCents = wtaSelectedRates.reduce(
    (sum, rate) => sum + (wtaQuantities[rate.id] ?? 0) * (rate.totalIncludingTaxCents ?? rate.totalCents),
    0,
  )

  function addSelectedWtaFareHarborSlot() {
    if (!wtaDate || !wtaSlot || wtaTravelerCount < 1) return
    const selectedRates = wtaSelectedRates
      .map((rate) => ({
        id: rate.id,
        label: rate.label,
        quantity: wtaQuantities[rate.id] ?? 0,
        totalCents: rate.totalIncludingTaxCents ?? rate.totalCents,
      }))
      .filter((rate) => rate.quantity > 0)

    addItem({
      tourSlug: tour.slug,
      marketId: market.id,
      title: tour.title,
      image: tour.image,
      port: tour.location,
      priceCents: wtaTravelerCount ? Math.round(wtaTotalCents / wtaTravelerCount) : tour.priceFromCents,
      lineTotalCents: wtaTotalCents,
      travelers: wtaTravelerCount,
      availabilityId: wtaSlot.id,
      selectedDate: wtaDate,
      startsAt: wtaSlot.startsAt,
      dateLabel: `${formatSlotDay(wtaSlot)} · ${formatSlotTime(wtaSlot)}`,
      customerTypeRates: selectedRates,
    })
    setOpen(true)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  if (market.id === "alaska") {
    const today = new Date().toISOString().slice(0, 10)
    const isMappedToFareHarbor = Boolean(tour.providerCompany && tour.providerRef)

    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="text-sm text-muted-foreground">From</span>
            <p className="font-serif text-3xl font-semibold text-foreground">
              {formatPrice(tour.priceFromCents)}
            </p>
            <span className="text-xs text-muted-foreground">FareHarbor sets final ticket pricing</span>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            FareHarbor API
          </span>
        </div>

        {!isMappedToFareHarbor ? (
          <div className="mt-5 rounded-md border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Live booking not connected yet</p>
            <p className="mt-1">
              This WTA product needs an approved FareHarbor company and item before online checkout can be enabled.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-2">
              <label htmlFor="wta-fareharbor-date" className="text-sm font-medium text-foreground">
                Choose date
              </label>
              <input
                id="wta-fareharbor-date"
                type="date"
                min={today}
                value={wtaDate}
                onChange={(event) => setWtaDate(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              />
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" />
                Choose time
              </p>

              {!wtaDate ? (
                <p className="mt-3 rounded-md border border-dashed border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
                  Select a date to load real FareHarbor availability.
                </p>
              ) : wtaStatus === "loading" ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading FareHarbor times…
                </p>
              ) : wtaError ? (
                <p className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {wtaError}
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {wtaSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setWtaSlot(slot)
                        setWtaQuantities({})
                      }}
                      className={
                        wtaSlot?.id === slot.id
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

            {wtaSlot && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">Ticket quantities</p>
                <div className="mt-3 grid gap-3">
                  {wtaSelectedRates.map((rate) => {
                    const quantity = wtaQuantities[rate.id] ?? 0
                    return (
                      <div key={rate.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{rate.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(rate.totalIncludingTaxCents ?? rate.totalCents)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setWtaQuantities((current) => ({
                                ...current,
                                [rate.id]: Math.max(0, quantity - 1),
                              }))
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary"
                            aria-label={`Remove ${rate.label}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-medium tabular-nums text-foreground">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setWtaQuantities((current) => ({
                                ...current,
                                [rate.id]: quantity + 1,
                              }))
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary"
                            aria-label={`Add ${rate.label}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Selected total</span>
              <span className="font-serif text-xl font-semibold text-foreground">
                {formatPrice(wtaTotalCents)}
              </span>
            </div>

            <button
              type="button"
              onClick={addSelectedWtaFareHarborSlot}
              disabled={!wtaDate || !wtaSlot || wtaTravelerCount < 1 || wtaStatus !== "ready"}
              className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {added ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" /> Added selected time
                </span>
              ) : (
                "Continue to checkout"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Checkout books the exact selected FareHarbor time after FareHarbor confirms it.
            </p>
          </>
        )}
      </div>
    )
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

interface FareHarborCustomerTypeRate {
  id: string
  label: string
  totalCents: number
  totalIncludingTaxCents?: number
  capacityRemaining?: number
  minimumPartySize?: number
  maximumPartySize?: number
}

interface FareHarborSlot {
  id: string
  label: string
  startsAt: string
  capacityRemaining: number
  soldOut: boolean
  priceCents: number
  customerTypeRates?: FareHarborCustomerTypeRate[]
}

interface FareHarborAvailabilityResponse {
  provider: string | null
  configured?: boolean
  mapped?: boolean
  dates?: { date: string; slots: FareHarborSlot[] }[]
}
