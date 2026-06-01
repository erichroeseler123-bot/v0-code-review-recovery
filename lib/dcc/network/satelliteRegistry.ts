/**
 * Canonical DCC network registry — the source of truth for what every site is.
 *
 * Without this, every session keeps rediscovering the network (and sometimes
 * gets the scope wrong). This is data, not behavior.
 *
 * Doctrine: v0_memories/user/dcc-network.md and the per-site memory files.
 */

import type { DataSource } from "@/lib/dcc/schema/core"
import type { DccEventName } from "@/lib/dcc/telemetry/events"

export type NetworkRole =
  /** Internal authority/decision/governance layers — NOT public sites. */
  | "authority"
  | "operational_governance"
  /** Public narrow storefront that explains and converts. */
  | "satellite_storefront"
  /** Site that fulfills (booking, quote, delivery, transport). */
  | "execution"
  /** Proven execution site with its own checkout — protected from casual edits. */
  | "protected_execution"
  /** Documented but explicitly NOT part of the tourism network. */
  | "separate"

export type SatelliteRecord = {
  id: string
  name: string
  role: NetworkRole
  scope: string
  /** Hard scope guardrails: what this site must never drift into. */
  mustNotBecome?: string[]
  /** How DCC relates to this site (routing / telemetry). */
  dccRelationship?: string
  /** Booking/affiliate/handoff family used at the execution edge. */
  handoffType?: DataSource | "owned_checkout" | "manual_quote" | "none"
  /** Events this site is expected to emit into the shared taxonomy. */
  telemetryExpectations?: DccEventName[]
  /** Special handling notes (e.g. protection rules). */
  protection?: string
  domain?: string
}

export const DCC_SATELLITES: SatelliteRecord[] = [
  {
    id: "dcc",
    name: "DCC",
    role: "authority",
    scope: "Internal decision/authority/routing/telemetry/governance brain. Not a public site.",
    dccRelationship: "Is DCC. Decides which option/storefront resolves a given intent.",
    handoffType: "none",
  },
  {
    id: "earth-os",
    name: "Earth OS",
    role: "operational_governance",
    scope:
      "Operations + publication + health layer. Knows what each route is, links to, tracks, must not claim, and whether it is live.",
    dccRelationship: "Governs whether DCC decisions are live, measured, healthy, and safe to promote.",
    handoffType: "none",
  },
  {
    id: "gosno",
    name: "GoSno",
    role: "execution",
    scope: "Private Colorado mountain transportation.",
    mustNotBecome: ["shared shuttle marketplace", "general transportation directory"],
    dccRelationship: "DCC routes private mountain transportation intent to GoSno.",
    handoffType: "rezdy",
    telemetryExpectations: ["decision_viewed", "cta_clicked", "booking_started", "booking_completed"],
  },
  {
    id: "shuttleya",
    name: "Shuttleya",
    role: "execution",
    scope: "Mighty Argo Cable Car shuttle only.",
    mustNotBecome: ["general shuttle marketplace", "Wisconsin shuttle brand"],
    dccRelationship: "DCC routes Mighty Argo Cable Car shuttle intent to Shuttleya.",
    handoffType: "owned_checkout",
    telemetryExpectations: ["decision_viewed", "cta_clicked", "booking_started"],
  },
  {
    id: "blue-hills-outpost",
    name: "Blue Hills Outpost",
    role: "execution",
    scope: "Manual cabin convenience drops (NW Wisconsin).",
    mustNotBecome: ["rental marketplace", "tourism guide", "automated gear system"],
    dccRelationship:
      "DCC may route cabin convenience intent and collect telemetry back; site hosts NO DCC content.",
    handoffType: "manual_quote",
    telemetryExpectations: ["decision_viewed", "cta_clicked", "lead_captured"],
  },
  {
    id: "feastly-spread",
    name: "Feastly Spread",
    role: "execution",
    scope: "Large-group vacation-rental meals (the house is fed tonight).",
    mustNotBecome: ["chef marketplace", "restaurant marketplace", "catering directory"],
    dccRelationship: "DCC routes large-group meal intent to Feastly Spread.",
    handoffType: "manual_quote",
    telemetryExpectations: ["decision_viewed", "cta_clicked", "lead_captured"],
  },
  {
    id: "welcome-to-alaska-tours",
    name: "Welcome to Alaska Tours",
    role: "satellite_storefront",
    scope: "Public Alaska tours storefront, sorted by port/timing/fit.",
    mustNotBecome: ["tour operator (does not operate tours)", "DCC decision surface"],
    dccRelationship: "Broad Alaska storefront; explains and converts, hands off to booking.",
    handoffType: "fareharbor",
    domain: "welcometoalaskatours.com",
    telemetryExpectations: ["decision_viewed", "verdict_shown", "tour_clickout"],
  },
  {
    id: "last-frontier-shore-excursions",
    name: "Last Frontier Shore Excursions",
    role: "satellite_storefront",
    scope: "Alaska cruise-port shore excursions only (cruise-safe timing).",
    mustNotBecome: ["general Alaska tour site", "land-tour storefront"],
    dccRelationship: "Narrow cruise-port satellite; hands off to Viator.",
    handoffType: "viator",
    telemetryExpectations: ["decision_viewed", "verdict_shown", "tour_clickout"],
  },
  {
    id: "welcome-to-the-dells",
    name: "Welcome to the Dells",
    role: "satellite_storefront",
    scope: "Wisconsin Dells group-trip and vacation-rental storefront.",
    mustNotBecome: ["general national travel directory"],
    dccRelationship: "Regional group-trip storefront feeding Dells-area execution.",
    handoffType: "manual_quote",
    telemetryExpectations: ["decision_viewed", "cta_clicked"],
  },
  {
    id: "welcome-to-new-orleans-tours",
    name: "Welcome to New Orleans Tours / Welcome to the Swamp",
    role: "satellite_storefront",
    scope: "New Orleans tour decision storefront (swamp-tour-first).",
    mustNotBecome: ["general NOLA city guide", "tour operator"],
    dccRelationship: "NOLA decision storefront; explains and converts, hands off to booking.",
    handoffType: "viator",
    telemetryExpectations: ["decision_viewed", "verdict_shown", "tour_clickout"],
  },
  {
    id: "party-at-red-rocks",
    name: "Party at Red Rocks (PARR)",
    role: "protected_execution",
    scope: "Proven Red Rocks transportation and tailgate execution, with its own checkout.",
    mustNotBecome: ["general Denver transport brand"],
    dccRelationship: "DCC may route Red Rocks event intent; PARR owns its checkout.",
    handoffType: "owned_checkout",
    protection: "Leave PARR alone — do not casually modify checkout/payment/admin.",
    telemetryExpectations: ["decision_viewed", "cta_clicked", "booking_started", "booking_completed"],
  },
  {
    id: "somerset-st-croix",
    name: "Somerset / St. Croix",
    role: "satellite_storefront",
    scope: "Regional decision corridor (Somerset/Hudson/Stillwater area events + transport).",
    mustNotBecome: ["generic regional directory"],
    dccRelationship:
      "Decision corridor; not yet fully clean (shuttle domain question open, corridor ID needed).",
    handoffType: "ticketmaster",
    telemetryExpectations: ["page_viewed", "dcc_exit_clicked", "product_opened"],
  },
  {
    id: "last-dollar-protection-plan",
    name: "Last Dollar Protection Plan",
    role: "separate",
    scope: "Command-center-style funeral pre-funding utility. NOT part of the tourism network.",
    dccRelationship: "None — documented separately; do not wire into DCC tourism routing.",
    handoffType: "none",
  },
]

/** Quick lookup by id. */
export function getSatellite(id: string): SatelliteRecord | undefined {
  return DCC_SATELLITES.find((s) => s.id === id)
}

/** All public sites DCC can route intent to (excludes internal + separate). */
export function getRoutableSites(): SatelliteRecord[] {
  return DCC_SATELLITES.filter(
    (s) => s.role === "satellite_storefront" || s.role === "execution" || s.role === "protected_execution",
  )
}
