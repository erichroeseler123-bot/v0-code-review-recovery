/**
 * DCC Editorial Persona Registry (Phase 14).
 *
 * Honest-schema rule (doctrine: dcc-place-time-engine.md): these are TRANSPARENT
 * editorial guide voices / field desks — NOT real humans. We never fabricate
 * credentials, headshots, social profiles, residency, or lived experience.
 * Every persona page must visibly disclose that it is an editorial persona, and
 * any authorship schema must match that visible disclosure.
 *
 * This is data, not behavior. It assigns topical desks, voice, internal-link
 * scope, and hard "must not claim" guardrails so the network has a legible
 * editorial layer.
 */

import type { SatelliteRecord } from "@/lib/dcc/network/satelliteRegistry"
import { getSatellite } from "@/lib/dcc/network/satelliteRegistry"

export type AuthorType =
  /** A disclosed fictional guide voice. Author schema uses Person + visible disclosure. */
  | "editorial_persona"
  /** A branded desk (the organization speaking). Author schema uses Organization. */
  | "organization_desk"
  /** A real, named human. NONE exist yet — reserved so we never mislabel a persona as real. */
  | "real_person"

export type DccAuthor = {
  id: string
  name: string
  desk: string
  type: AuthorType
  /** The exact sentence shown on the page AND mirrored by the schema. */
  disclosure: string
  voice: string
  topics: string[]
  /** Satellite registry ids this desk covers (validated against DCC_SATELLITES). */
  sites: string[]
  shouldWrite: string[]
  mustNotClaim: string[]
  profilePath: string
  /** Internal routes this desk may link to — must stay within its own lane. */
  relatedRoutes: string[]
}

export const DCC_AUTHORS: DccAuthor[] = [
  {
    id: "mara-portlight",
    name: "Mara Portlight",
    desk: "Alaska Cruise Desk",
    type: "editorial_persona",
    disclosure:
      "Mara Portlight is a DCC editorial guide voice for Alaska cruise-port planning. This persona organizes DCC-reviewed guidance by port, timing, and traveler fit. Recommendations are produced from route data, source review, and operator availability signals — Mara is not a real individual and does not operate tours.",
    voice: "calm, cruise-safe, timing-aware, practical",
    topics: ["Juneau", "Skagway", "Ketchikan", "Sitka", "Icy Strait", "Haines", "Seward", "Whittier"],
    sites: ["last-frontier-shore-excursions", "welcome-to-alaska-tours"],
    shouldWrite: [
      "shore excursions by port",
      "cruise-safe port timing and return windows",
      "whale watching and glacier tour fit",
      "operator handoff choices",
    ],
    mustNotClaim: [
      "operates or guides tours",
      "guarantees return to ship",
      "personally took any excursion",
      "is a licensed guide or local resident",
    ],
    profilePath: "/internal/earthos/authors/mara-portlight",
    relatedRoutes: [
      "/juneau/shore-excursions",
      "/skagway/shore-excursions",
      "/ketchikan/wildlife",
      "/alaska/cruise-timing",
    ],
  },
  {
    id: "cal-housecount",
    name: "Cal Housecount",
    desk: "Dells Group Logistics Desk",
    type: "editorial_persona",
    disclosure:
      "Cal Housecount is a DCC editorial guide voice for Wisconsin Dells group trips. This persona organizes guidance on large-group lodging, meals, and weekend logistics from DCC route data and approved Feastly Spread offers. Cal is not a real individual and holds no chef or catering credentials.",
    voice: "blunt, useful, group-problem solver",
    topics: [
      "large vacation rentals",
      "group meals",
      "bad-weather plans",
      "Dells attractions",
      "group transportation",
    ],
    sites: ["welcome-to-the-dells", "feastly-spread"],
    shouldWrite: [
      "feeding a full house",
      "what works for large groups",
      "Dells weekend logistics",
      "bad-weather backup plans",
    ],
    mustNotClaim: [
      "chef or culinary credentials",
      "catering capability beyond approved Feastly offers",
      "guaranteed rental availability",
    ],
    profilePath: "/internal/earthos/authors/cal-housecount",
    relatedRoutes: [
      "/dells/group-dinner",
      "/dells/large-group-activities",
      "/dells/transportation",
      "/feastly/big-italian-dinner",
    ],
  },
  {
    id: "june-firewood",
    name: "June Firewood",
    desk: "Cabin Convenience Desk",
    type: "editorial_persona",
    disclosure:
      "June Firewood is a DCC editorial guide voice for NW Wisconsin cabin convenience. This persona organizes arrival-checklist and lake-house convenience guidance from DCC route data and approved Blue Hills Outpost drop offerings. June is not a real individual and does not operate delivery or gear systems.",
    voice: "local-flavored, practical, low-drama",
    topics: ["firewood", "ice", "cabin essentials", "forgotten items", "local drops"],
    sites: ["blue-hills-outpost"],
    shouldWrite: ["arrival checklists", "lake-house convenience", "what to request before you arrive"],
    mustNotClaim: [
      "guaranteed watercraft rental",
      "automated gear systems",
      "is a real local resident or operator",
    ],
    profilePath: "/internal/earthos/authors/june-firewood",
    relatedRoutes: ["/blue-hills/arrival-checklist", "/blue-hills/firewood", "/blue-hills/cabin-essentials"],
  },
  {
    id: "vale-aftershow",
    name: "Vale Aftershow",
    desk: "Concert Transportation Desk",
    type: "editorial_persona",
    disclosure:
      "Vale Aftershow is a DCC editorial guide voice for concert-night transportation. This persona organizes guidance on tailgates, parking, and post-show exits from DCC route data. Vale is not a real individual and does not claim venue affiliation unless a route is verified.",
    voice: "sharp, logistical, show-night aware",
    topics: ["tailgates", "parking", "post-show exits", "private shuttles", "group rides"],
    sites: ["party-at-red-rocks", "somerset-st-croix"],
    shouldWrite: [
      "why transportation breaks the night",
      "private ride fit for shows",
      "pickup timing after a concert",
    ],
    mustNotClaim: [
      "venue affiliation unless verified",
      "guaranteed parking or entry",
      "is a real driver or staffer",
    ],
    profilePath: "/internal/earthos/authors/vale-aftershow",
    relatedRoutes: ["/red-rocks/transportation", "/somerset-wi/concerts", "/somerset-wi/transport"],
  },
  {
    id: "ridge-transfer",
    name: "Ridge Transfer",
    desk: "Mountain Route Desk",
    type: "editorial_persona",
    disclosure:
      "Ridge Transfer is a DCC editorial guide voice for private Colorado mountain transportation. This persona organizes guidance on Denver-to-resort routes, vehicle fit, and winter timing from DCC route data and GoSno availability signals. Ridge is not a real individual and does not describe shared-shuttle service.",
    voice: "direct, weather-aware, route-focused",
    topics: ["private mountain rides", "SUVs", "vans", "winter route timing"],
    sites: ["gosno"],
    shouldWrite: ["Denver-to-resort transportation", "vehicle fit by group size", "winter pickup windows"],
    mustNotClaim: ["shared shuttle service", "guaranteed road conditions", "is a real driver or dispatcher"],
    profilePath: "/internal/earthos/authors/ridge-transfer",
    relatedRoutes: ["/gosno/denver-to-resort", "/gosno/vehicle-fit", "/gosno/winter-timing"],
  },
  {
    id: "cora-bayou",
    name: "Cora Bayou",
    desk: "New Orleans Tour Desk",
    type: "editorial_persona",
    disclosure:
      "Cora Bayou is a DCC editorial guide voice for New Orleans and swamp tours. This persona organizes guidance on tour choice by pickup, timing, and group type from DCC route data. Cora is not a real individual and does not operate tours.",
    voice: "warm, local-curious, practical",
    topics: ["swamp tours", "hotel pickup", "family fit", "airboat vs flat-bottom boat", "weather windows"],
    sites: ["welcome-to-new-orleans-tours"],
    shouldWrite: [
      "choosing a tour by pickup and timing",
      "airboat vs flat-bottom boat",
      "New Orleans tours with kids",
      "bad-weather tour options",
    ],
    mustNotClaim: ["operates tours", "guaranteed wildlife sightings", "is a real local guide or resident"],
    profilePath: "/internal/earthos/authors/cora-bayou",
    relatedRoutes: [
      "/new-orleans/swamp-tours-hotel-pickup",
      "/new-orleans/airboat-vs-boat",
      "/new-orleans/tours-with-kids",
    ],
  },
  {
    id: "the-dispatcher",
    name: "The Dispatcher",
    desk: "DCC Systems Desk",
    type: "organization_desk",
    disclosure:
      "The Dispatcher is the DCC Systems Desk — a branded organization voice for route governance and Earth OS operations. It is explicitly an editorial desk of Destination Command Center, not a named individual, and writes operational explanations only (no consumer marketing).",
    voice: "concise, systems-minded, operational",
    topics: ["route health", "telemetry", "handoffs", "promotion readiness"],
    sites: ["dcc", "earth-os"],
    shouldWrite: [
      "why DCC recommends or holds a route",
      "what route health and telemetry signals mean",
      "how promotion readiness is decided",
    ],
    mustNotClaim: ["consumer marketing claims", "to be a named human author", "anything not backed by route data"],
    profilePath: "/internal/earthos/authors/the-dispatcher",
    relatedRoutes: ["/internal/earthos/promotion-queue", "/internal/earthos/daily-brief", "/dcc/route-governance"],
  },
]

/** Quick lookup by id. */
export function getAuthor(id: string): DccAuthor | undefined {
  return DCC_AUTHORS.find((a) => a.id === id)
}

/** Resolve a desk's covered sites against the canonical satellite registry. */
export function resolveAuthorSites(author: DccAuthor): SatelliteRecord[] {
  return author.sites.map((id) => getSatellite(id)).filter((s): s is SatelliteRecord => Boolean(s))
}

/**
 * Consistency guard: flags any persona whose declared sites are not in the
 * canonical registry (prevents an author lane from drifting off the network).
 */
export function authorSiteMismatches(author: DccAuthor): string[] {
  return author.sites.filter((id) => !getSatellite(id))
}

/** Human-readable label for an author type. */
export const AUTHOR_TYPE_LABELS: Record<AuthorType, string> = {
  editorial_persona: "Editorial persona (disclosed guide voice)",
  organization_desk: "Organization desk (branded voice)",
  real_person: "Real person",
}
