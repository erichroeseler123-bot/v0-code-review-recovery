/**
 * DCC shared schema primitives.
 *
 * The "grammar" of the network: every API, page, and decision surface should
 * normalize into these objects rather than inventing one-off page shapes.
 * First version is types + a couple of helpers only — no database required.
 *
 * Doctrine: v0_memories/user/dcc-place-time-engine.md
 */

import type { DccEventName } from "@/lib/dcc/telemetry/events"
import type { HandoffKind, LinkPolicy } from "@/lib/dcc/links/linkPolicy"

/** ISO 8601 datetime string. */
export type IsoDateTime = string

export type DataSource =
  | "ticketmaster"
  | "seatgeek"
  | "fareharbor"
  | "rezdy"
  | "viator"
  | "google_places"
  | "weather"
  | "cruise_schedule"
  | "manual"

export type Place = {
  id: string
  name: string
  region?: string
  lat?: number
  lng?: number
}

export type Venue = Place & {
  placeId: string
  capacity?: number
}

export type TimeWindow = {
  startsAt?: IsoDateTime
  endsAt?: IsoDateTime
  lastVerifiedAt?: IsoDateTime
  source?: DataSource
}

export type AvailabilityWindow = TimeWindow & {
  bookingCutoff?: IsoDateTime
  nextAvailable?: IsoDateTime
  soldOut?: boolean
}

export type Operator = {
  id: string
  name: string
  /** Booking/affiliate family used when handing off to this operator. */
  handoffSource?: DataSource
}

export type Event = {
  id: string
  title: string
  place?: Place
  venue?: Venue
  timeWindow?: TimeWindow
  source?: DataSource
}

export type Tour = {
  id: string
  title: string
  operator?: Operator
  place?: Place
  availability?: AvailabilityWindow
  source?: DataSource
}

export type Product = {
  id: string
  title: string
  operator?: Operator
  priceFrom?: number
  currency?: string
  source?: DataSource
}

export type MealPackage = {
  id: string
  title: string
  servesPeople?: number
  deliveryWindow?: TimeWindow
}

export type ConvenienceDrop = {
  id: string
  title: string
  /** Per-item quoted; convenience-first, manual confirmation. */
  quoted?: boolean
  deliveryWindow?: TimeWindow
}

export type TransportationRoute = {
  id: string
  from?: Place
  to?: Place
  isPrivate?: boolean
  pickupWindow?: TimeWindow
}

/** A monetizable or informational exit from the network. */
export type Handoff = {
  kind: HandoffKind
  policy: LinkPolicy
  label: string
  href: string
  trackingId?: string
  operator?: Operator
}

/** A decision the network helps a visitor make (fit / not-fit / next step). */
export type DecisionProblem = {
  id: string
  problem: string
  fitRules: string[]
  notFitRules?: string[]
  ctaPattern: string
  /** Events expected to fire on a surface that resolves this problem. */
  telemetryExpectation?: DccEventName[]
}

/** A canonical telemetry record shape (defined here, emitted elsewhere). */
export type TelemetryEvent = {
  name: DccEventName
  satelliteId?: string
  corridorId?: string
  route?: string
  at: IsoDateTime
  meta?: Record<string, string | number | boolean>
}

/** A rendered decision surface: shared problem + local qualifier + one safe next step. */
export type DecisionSurface = {
  id: string
  title: string
  intent: string
  location?: string
  timeWindow?: TimeWindow
  bestFor: string[]
  notFor: string[]
  explanation: string
  primaryAction: Handoff
}

/** True when a time window is still considered fresh relative to `now`. */
export function isWindowFresh(window: TimeWindow, maxAgeMs: number, now: number = Date.now()): boolean {
  if (!window.lastVerifiedAt) return false
  return now - new Date(window.lastVerifiedAt).getTime() <= maxAgeMs
}
