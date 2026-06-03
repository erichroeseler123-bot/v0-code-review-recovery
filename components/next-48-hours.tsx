"use client"

import useSWR from "swr"
import Link from "next/link"
import { ArrowRight, CalendarClock, Loader2, MapPin, Ticket, Trees } from "lucide-react"
import { rankMarketsByDistance, distanceMiles, formatMiles, type Coords } from "@/lib/geo"
import { formatPrice } from "@/lib/tours"

interface SeatGeekEvent {
  id: number
  title: string
  type: string
  datetime: string
  venue?: string
  city?: string
  state?: string
  lat?: number
  lng?: number
  url: string
  priceFrom: number | null
}

interface EventsResponse {
  configured: boolean
  events: SeatGeekEvent[]
  error?: string
}

interface ParkThing {
  id: string
  title: string
  park?: string
  duration?: string
  fee: boolean
  url: string
  miles: number
}

interface ParksResponse {
  configured: boolean
  things: ParkThing[]
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/** Friendly relative day label: Today / Tomorrow / weekday. */
function dayLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - startOfToday.getTime()) / 86400000)
  if (days <= 0) return "Today"
  if (days === 1) return "Tomorrow"
  return d.toLocaleDateString(undefined, { weekday: "long" })
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function Next48Hours({ origin, label }: { origin: Coords; label: string }) {
  const { data, isLoading } = useSWR<EventsResponse>(
    `/api/events?lat=${origin.lat}&lng=${origin.lng}&hours=48`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const { data: parksData, isLoading: parksLoading } = useSWR<ParksResponse>(
    `/api/parks?lat=${origin.lat}&lng=${origin.lng}&range=150`,
    fetcher,
    { revalidateOnFocus: false },
  )

  // Our own bookable activities near this origin (within ~150 mi).
  const nearbyMarkets = rankMarketsByDistance(origin).filter((r) => r.miles < 150 && r.tourCount > 0)
  const activities = nearbyMarkets.flatMap((r) =>
    r.tours.map((t) => ({ tour: t, market: r.market, miles: r.miles })),
  )

  const events = data?.events ?? []
  const eventsConfigured = data?.configured ?? false

  const parkThings = parksData?.things ?? []
  const parksConfigured = parksData?.configured ?? false

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground">
        <CalendarClock className="mr-1 inline h-4 w-4 text-primary" />
        Happening near <span className="font-medium text-foreground">{label}</span> in the next 48 hours
      </p>

      {/* Live events */}
      <div className="mt-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Ticket className="h-4 w-4 text-primary" /> Live events &amp; concerts
        </h4>

        {isLoading ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking what&apos;s on…
          </p>
        ) : !eventsConfigured ? (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Live events go on the moment SeatGeek is connected in production. The activities below are
            bookable right now.
          </div>
        ) : events.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No ticketed events in the next 48 hours within range — but the activities below are bookable.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {events.map((e) => {
              const dist =
                e.lat != null && e.lng != null ? distanceMiles(origin, { lat: e.lat, lng: e.lng }) : null
              return (
                <li
                  key={e.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {dayLabel(e.datetime)} · {timeLabel(e.datetime)}
                      </span>
                      {dist != null ? (
                        <span className="text-xs text-muted-foreground">{formatMiles(dist)}</span>
                      ) : null}
                    </div>
                    <h5 className="mt-1 truncate font-medium text-foreground">{e.title}</h5>
                    <p className="text-xs text-muted-foreground">
                      {[e.venue, e.city, e.state].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {e.priceFrom ? (
                      <span className="text-sm text-muted-foreground">from ${e.priceFrom}</span>
                    ) : null}
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Tickets
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* National Park things to do */}
      <div className="mt-6">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Trees className="h-4 w-4 text-primary" /> National parks &amp; outdoors
        </h4>
        {parksLoading ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking nearby parks…
          </p>
        ) : !parksConfigured ? (
          <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Park activities go live once the National Park Service key is connected in production.
          </div>
        ) : parkThings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No National Park activities within range of here.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {parkThings.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                      {t.fee ? "Fee" : "Free"}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatMiles(t.miles)}</span>
                    {t.duration ? <span className="text-xs text-muted-foreground">{t.duration}</span> : null}
                  </div>
                  <h5 className="mt-1 truncate font-medium text-foreground">{t.title}</h5>
                  {t.park ? <p className="text-xs text-muted-foreground">{t.park}</p> : null}
                </div>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Our bookable activities */}
      <div className="mt-6">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-primary" /> Tours &amp; activities you can book
        </h4>
        {activities.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No tours from the network within ~150 miles of here yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {activities.map(({ tour, market, miles }) => (
              <li
                key={tour.slug}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                      {tour.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatMiles(miles)}</span>
                  </div>
                  <h5 className="mt-1 truncate font-medium text-foreground">{tour.title}</h5>
                  <p className="text-xs text-muted-foreground">
                    {tour.location} · from {formatPrice(tour.priceFromCents)}
                  </p>
                </div>
                <Link
                  href={`/s/${market.id}/tours/${tour.slug}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Book
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
