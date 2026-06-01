/**
 * Earth OS route record — the network's memory of a single route.
 *
 * Earth OS records reality: what a route is, what it links to, what it tracks,
 * what it must not claim, and whether it is actually live. This is the type +
 * an example record; it does not need to be perfect, it just needs to start
 * recording reality. No database required.
 *
 * Doctrine: v0_memories/user/earth-os.md
 */

import type { DataSource, IsoDateTime } from "@/lib/dcc/schema/core"
import type { DccEventName } from "@/lib/dcc/telemetry/events"
import type { LinkPolicy } from "@/lib/dcc/links/linkPolicy"

export type RouteStatus =
  | "draft"
  | "live"
  | "indexable"
  | "held"
  | "retune"
  | "deprecated"

export type PromotionStatus = "candidate" | "promoted" | "demoted" | "watch" | "none"

export type EarthOsExternalLink = {
  href: string
  policy: LinkPolicy
}

export type EarthOsRouteRecord = {
  route: string
  status: RouteStatus
  satellite?: string
  corridor?: string
  scope: string
  dataFeeds: DataSource[]
  internalLinks: string[]
  externalLinks: EarthOsExternalLink[]
  telemetryEvents: DccEventName[]
  /** Things this route must NOT claim (availability, pricing, return-to-ship, etc.). */
  mustNotClaim?: string[]
  lastVerifiedAt?: IsoDateTime
  issues: string[]
  promotion?: PromotionStatus
}

/** Example record — the Somerset concerts decision surface from the doctrine. */
export const EXAMPLE_ROUTE_RECORD: EarthOsRouteRecord = {
  route: "/somerset-wi/concerts",
  status: "indexable",
  satellite: "somerset-st-croix",
  corridor: "somerset-st-croix",
  scope: "Somerset/St. Croix event and transportation decision surface.",
  dataFeeds: ["ticketmaster", "seatgeek"],
  internalLinks: ["/somerset-wi", "/somerset-wi/transport"],
  externalLinks: [
    { href: "https://www.ticketmaster.com/event-placeholder", policy: "tracked_handoff" },
  ],
  telemetryEvents: ["page_viewed", "dcc_exit_clicked", "product_opened"],
  mustNotClaim: ["guaranteed availability", "final pricing"],
  issues: ["custom domain currently points to a separate Vercel project", "corridor ID needed"],
  promotion: "watch",
}

/** A route is safe to promote only when live/indexable, measured, and issue-free. */
export function isPromotable(record: EarthOsRouteRecord): boolean {
  const liveEnough = record.status === "live" || record.status === "indexable"
  const measured = record.telemetryEvents.length > 0
  const clean = record.issues.length === 0
  return liveEnough && measured && clean
}
