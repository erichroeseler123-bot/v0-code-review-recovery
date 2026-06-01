/**
 * Mock telemetry for the INTERNAL /internal/telemetry reference dashboard.
 *
 * STATIC + READ-ONLY. This file invents no live data, calls no API, writes to
 * no database, and emits nothing. It is a hand-seeded sample set used purely to
 * demonstrate what a real DCC telemetry view would look like once the shared
 * event stream (see lib/dcc/telemetry/events.ts) is collected.
 *
 * Doctrine: v0_memories/user/dcc-network.md, earth-os.md, network-status-snapshot.md
 */

import { DCC_EVENTS, type DccEventName } from "@/lib/dcc/telemetry/events"
import { DCC_SATELLITES, getSatellite } from "@/lib/dcc/network/satelliteRegistry"

/** Coarse grouping of the canonical taxonomy for display. */
export type EventCategory =
  | "page/decision"
  | "CTA/handoff"
  | "ticket/tour clickout"
  | "lead/booking"
  | "return/failure"

export const EVENT_CATEGORY: Record<DccEventName, EventCategory> = {
  page_viewed: "page/decision",
  landing_viewed: "page/decision",
  decision_viewed: "page/decision",
  verdict_shown: "page/decision",
  cta_clicked: "CTA/handoff",
  product_opened: "CTA/handoff",
  dcc_exit_clicked: "CTA/handoff",
  handoff_viewed: "CTA/handoff",
  ticket_clickout: "ticket/tour clickout",
  tour_clickout: "ticket/tour clickout",
  lead_captured: "lead/booking",
  booking_started: "lead/booking",
  booking_completed: "lead/booking",
  booking_failed: "return/failure",
  traveler_returned: "return/failure",
}

export const EVENT_CATEGORY_ORDER: EventCategory[] = [
  "page/decision",
  "CTA/handoff",
  "ticket/tour clickout",
  "lead/booking",
  "return/failure",
]

/** Build the grouped taxonomy straight from the canonical DCC_EVENTS list. */
export function groupedTaxonomy(): { category: EventCategory; events: DccEventName[] }[] {
  return EVENT_CATEGORY_ORDER.map((category) => ({
    category,
    events: DCC_EVENTS.filter((e) => EVENT_CATEGORY[e] === category),
  }))
}

export type MockTelemetryEvent = {
  id: string
  /** ISO timestamp (static, illustrative). */
  timestamp: string
  event: DccEventName
  satelliteId: string
  route: string
  intent: string
  destinationType: string
  status: "ok" | "protected" | "blocked" | "unverified"
  notes: string
}

/**
 * Hand-seeded sample events. Static only — order is newest-first by timestamp.
 * PARR appears as a PROTECTED reference (observed, never modified here).
 */
export const MOCK_EVENTS: MockTelemetryEvent[] = [
  {
    id: "evt_0001",
    timestamp: "2026-06-01T07:42:00Z",
    event: "lead_captured",
    satelliteId: "blue-hills-outpost",
    route: "/cabin-drop/request",
    intent: "cabin convenience drop",
    destinationType: "manual_quote",
    status: "ok",
    notes: "Confirmed live + on-scope tonight. Firewood/ice/essentials request.",
  },
  {
    id: "evt_0002",
    timestamp: "2026-06-01T07:31:00Z",
    event: "tour_clickout",
    satelliteId: "last-frontier-shore-excursions",
    route: "/skagway/glacier",
    intent: "cruise-port shore excursion",
    destinationType: "viator",
    status: "unverified",
    notes: "Publish state unverified tonight — confirm in its own repo.",
  },
  {
    id: "evt_0003",
    timestamp: "2026-06-01T07:18:00Z",
    event: "cta_clicked",
    satelliteId: "welcome-to-alaska-tours",
    route: "/wta (prototype)",
    intent: "find Alaska tour by port",
    destinationType: "fareharbor",
    status: "blocked",
    notes: "Illustrative only — /wta visual prototype has NO telemetry wired.",
  },
  {
    id: "evt_0004",
    timestamp: "2026-06-01T06:59:00Z",
    event: "booking_started",
    satelliteId: "gosno",
    route: "/den-to-ski/quote",
    intent: "private mountain transport",
    destinationType: "rezdy",
    status: "unverified",
    notes: "Funnel sample. Production state not verified tonight.",
  },
  {
    id: "evt_0005",
    timestamp: "2026-06-01T06:44:00Z",
    event: "dcc_exit_clicked",
    satelliteId: "somerset-st-croix",
    route: "/somerset/shuttle",
    intent: "amphitheater shuttle",
    destinationType: "ticketmaster",
    status: "blocked",
    notes: "Telemetry/domain alignment unresolved; shuttle domain on a different project.",
  },
  {
    id: "evt_0006",
    timestamp: "2026-06-01T06:30:00Z",
    event: "booking_completed",
    satelliteId: "party-at-red-rocks",
    route: "/red-rocks/shuttle",
    intent: "Red Rocks transport + tailgate",
    destinationType: "owned_checkout",
    status: "protected",
    notes: "PROTECTED reference — observe only. Never modify PARR checkout/admin/payment.",
  },
  {
    id: "evt_0007",
    timestamp: "2026-06-01T06:12:00Z",
    event: "cta_clicked",
    satelliteId: "shuttleya",
    route: "/mighty-argo",
    intent: "Mighty Argo Cable Car shuttle",
    destinationType: "owned_checkout",
    status: "unverified",
    notes: "Narrow single-route shuttle. Publish state unverified.",
  },
  {
    id: "evt_0008",
    timestamp: "2026-06-01T05:58:00Z",
    event: "lead_captured",
    satelliteId: "feastly-spread",
    route: "/group-meal/request",
    intent: "large-group vacation-rental meal",
    destinationType: "manual_quote",
    status: "unverified",
    notes: "Funnel sample. Production state not verified tonight.",
  },
  {
    id: "evt_0009",
    timestamp: "2026-06-01T05:40:00Z",
    event: "verdict_shown",
    satelliteId: "welcome-to-new-orleans-tours",
    route: "/swamp/best-tour",
    intent: "swamp tour decision",
    destinationType: "viator",
    status: "unverified",
    notes: "Decision-stage sample for the funnel view.",
  },
  {
    id: "evt_0010",
    timestamp: "2026-06-01T05:25:00Z",
    event: "decision_viewed",
    satelliteId: "welcome-to-the-dells",
    route: "/dells/group-trip",
    intent: "Dells group-trip planning",
    destinationType: "manual_quote",
    status: "unverified",
    notes: "Top-of-funnel sample. Production state not verified tonight.",
  },
]

/** Total event count in the sample set. */
export function totalEvents(): number {
  return MOCK_EVENTS.length
}

/** Count of handoff/exit-style signals. */
export function handoffCount(): number {
  return MOCK_EVENTS.filter((e) =>
    (["dcc_exit_clicked", "handoff_viewed", "ticket_clickout", "tour_clickout"] as DccEventName[]).includes(
      e.event,
    ),
  ).length
}

export function leadCount(): number {
  return MOCK_EVENTS.filter((e) => e.event === "lead_captured").length
}

export function bookingCount(): number {
  return MOCK_EVENTS.filter((e) =>
    (["booking_started", "booking_completed"] as DccEventName[]).includes(e.event),
  ).length
}

export function blockedCount(): number {
  return MOCK_EVENTS.filter((e) => e.status === "blocked").length
}

export function protectedCount(): number {
  return MOCK_EVENTS.filter((e) => e.status === "protected").length
}

/** Counts grouped by event type (only events that actually appear). */
export function countsByEvent(): { event: DccEventName; count: number }[] {
  const map = new Map<DccEventName, number>()
  for (const e of MOCK_EVENTS) map.set(e.event, (map.get(e.event) ?? 0) + 1)
  return [...map.entries()]
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
}

/** Counts grouped by every satellite in the registry (0 where no sample event). */
export function countsBySatellite(): { id: string; name: string; count: number }[] {
  return DCC_SATELLITES.map((s) => ({
    id: s.id,
    name: s.name,
    count: MOCK_EVENTS.filter((e) => e.satelliteId === s.id).length,
  }))
}

/** Friendly site label from the registry, falling back to the raw id. */
export function satelliteName(id: string): string {
  return getSatellite(id)?.name ?? id
}

/** Illustrative funnel stages (static sample numbers, top → bottom). */
export type FunnelStage = { label: string; events: string; value: number }
export const FUNNEL: FunnelStage[] = [
  { label: "Arrived", events: "page_viewed / landing_viewed", value: 100 },
  { label: "Considered", events: "decision_viewed / verdict_shown", value: 64 },
  { label: "Intent", events: "cta_clicked", value: 38 },
  { label: "Handoff", events: "product_opened / dcc_exit_clicked", value: 21 },
  { label: "Converted", events: "lead_captured / booking_started / booking_completed", value: 9 },
]

/** Known gaps / warnings surfaced on the dashboard (doctrine-aligned). */
export const TELEMETRY_GAPS: string[] = [
  "Production DCC /internal/telemetry currently returns a hard 404 — no live dashboard is deployed.",
  "WTA /wta visual prototype has NO telemetry wired (plain links/buttons, not TrackedHandoffLink).",
  "Real WTA production telemetry must be verified in the wta-renderer repo, not assumed from here.",
  "Somerset has sitemap/pages work but telemetry + shuttle-domain alignment is unresolved.",
  "PARR telemetry should be OBSERVED only — never casually modify its checkout/admin/payment.",
  "All non-Blue-Hills publish/telemetry states are unverified tonight; do not treat as live.",
]
