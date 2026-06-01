/**
 * Phase 6B — SeatGeek event ingestion adapter (server-side only).
 *
 * This is the network's FIRST real event provider: the production `destinations-cc`
 * Vercel project has SEATGEEK_CLIENT_ID (no Ticketmaster key). The Phase 6A
 * Ticketmaster adapter stays in place but dormant; this is the one to build around.
 *
 * Doctrine: v0_memories/user/dcc-place-time-engine.md, earth-os.md
 * Provider note: v0_memories/user/network-status-snapshot.md
 *
 * Rules honored here:
 *  - Runs server-side only ("server-only" import guards against client bundling).
 *  - SEATGEEK_CLIENT_ID is read at call time and NEVER returned, logged, or sent
 *    to the client.
 *  - If no client id exists (or the fetch fails), the adapter returns an empty list
 *    with diagnostics so the page falls back cleanly to mock data.
 *  - SEATGEEK_CLIENT_ID is Production-only in the real project, so Preview/Development
 *    will report "not configured" and fall back to mock — this is expected.
 *  - Raw SeatGeek events are normalized onto the DCC shared schema
 *    (Event / Venue / TimeWindow / Handoff) and projected into an Opportunity so the
 *    existing board renders live rows alongside mock rows.
 */

import "server-only"

import type { Event, Venue, TimeWindow, Handoff } from "@/lib/dcc/schema/core"
import type { Opportunity } from "@/lib/dcc/earthos/mockOpportunities"

const SEATGEEK_EVENTS_URL = "https://api.seatgeek.com/2/events"

/** Env keys checked, in priority order. The value itself is never exposed. */
const CLIENT_ID_ENV_CANDIDATES = ["SEATGEEK_CLIENT_ID", "NEXT_PUBLIC_SEATGEEK_CLIENT_ID"] as const

/** Diagnostics surfaced on the internal page only — never any secret value. */
export type SeatGeekDiagnostics = {
  /** True when a SeatGeek client id is present in the environment. */
  enabled: boolean
  /** True when a key value is present (same as enabled) — phrased for the panel. */
  keyExists: boolean
  /** Number of live, normalized opportunities returned this fetch. */
  liveCount: number
  /** "mock-only" when no live rows merged, "mock+live" when live rows are present. */
  fallbackMode: "mock-only" | "mock+live"
  /** ISO timestamp of when the fetch was attempted. */
  lastFetchAttemptedAt: string
  /** Internal-only error summary (no secrets). Undefined when healthy. */
  error?: string
  /** Which env var name supplied the id (name only, never the value). */
  keySourceName?: (typeof CLIENT_ID_ENV_CANDIDATES)[number]
  /** Current runtime environment (vercel env or node env). */
  environment: string
  /** Note shown when the key is expected to be Production-only. */
  environmentNote?: string
}

export type SeatGeekFeedResult = {
  opportunities: Opportunity[]
  diagnostics: SeatGeekDiagnostics
}

export type SeatGeekQuery = {
  /** Latitude to search around. */
  lat?: number
  /** Longitude to search around. */
  lon?: number
  /** Search range, e.g. "60mi" or "100km". */
  range?: string
  /** ISO date lower bound (datetime_local.gte). */
  startDate?: string
  /** ISO date upper bound (datetime_local.lte). */
  endDate?: string
  /** Max events to request (per_page). */
  size?: number
  /** Maps the resulting opportunities to a network corridor/satellite. */
  satelliteId?: string
  satelliteName?: string
  corridorId?: string
  /** Region label used by the board's location filter. */
  region?: Opportunity["region"]
}

/** Resolve the client id without exposing it. Returns the value + which env supplied it. */
function resolveClientId(): { clientId?: string; sourceName?: SeatGeekDiagnostics["keySourceName"] } {
  for (const name of CLIENT_ID_ENV_CANDIDATES) {
    const value = process.env[name]
    if (value && value.trim().length > 0) {
      return { clientId: value, sourceName: name }
    }
  }
  return {}
}

/** Best-effort current environment label (never a secret). */
function currentEnvironment(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown"
}

/** True when a SeatGeek client id is configured (no value revealed). */
export function isSeatGeekEnabled(): boolean {
  return Boolean(resolveClientId().clientId)
}

// ---------------------------------------------------------------------------
// Normalization: raw SeatGeek event -> DCC schema -> Opportunity
// ---------------------------------------------------------------------------

/** Minimal shape of the SeatGeek events payload we read. */
type RawSeatGeekEvent = {
  id?: number | string
  title?: string
  short_title?: string
  url?: string
  datetime_local?: string
  datetime_utc?: string
  venue?: {
    name?: string
    city?: string
    state?: string
    location?: { lat?: number; lon?: number }
  }
}

/** Bucket an event by how soon it starts relative to `now`. */
function bucketForStart(startsAt?: string, now: number = Date.now()): Opportunity["timeBucket"] {
  if (!startsAt) return "anytime"
  const deltaMs = new Date(startsAt).getTime() - now
  const hours = deltaMs / (1000 * 60 * 60)
  if (hours <= 48) return "next-48-hours"
  if (hours <= 120) return "this-weekend"
  return "anytime"
}

/**
 * Normalize one raw SeatGeek event into the DCC shared schema, then project it
 * onto an Opportunity for the board. Returns null when the row is unusable.
 */
export function normalizeSeatGeekEvent(
  raw: RawSeatGeekEvent,
  query: SeatGeekQuery = {},
): Opportunity | null {
  const rawId = raw.id
  const title = raw.title ?? raw.short_title
  if (rawId === undefined || rawId === null || !title) return null
  const id = String(rawId)

  const venueRaw = raw.venue
  const city = venueRaw?.city
  const stateCode = venueRaw?.state
  const lat = venueRaw?.location?.lat
  const lon = venueRaw?.location?.lon
  const startsAt = raw.datetime_local ?? raw.datetime_utc
  const ticketUrl = raw.url

  // --- DCC schema objects (the canonical grammar) ---
  const venue: Venue | undefined = venueRaw?.name
    ? {
        id: `sg-venue-${id}`,
        placeId: `sg-place-${id}`,
        name: venueRaw.name,
        region: stateCode,
        lat: Number.isFinite(lat) ? lat : undefined,
        lng: Number.isFinite(lon) ? lon : undefined,
      }
    : undefined

  const timeWindow: TimeWindow = {
    startsAt,
    lastVerifiedAt: new Date().toISOString(),
    source: "seatgeek",
  }

  const event: Event = {
    id: `sg-${id}`,
    title,
    venue,
    place: venue,
    timeWindow,
    source: "seatgeek",
  }

  // SeatGeek ticket links are monetizable exits → tracked handoff.
  const handoff: Handoff | undefined = ticketUrl
    ? {
        kind: "tracked_handoff",
        policy: "tracked_handoff",
        label: "Get tickets",
        href: ticketUrl,
        trackingId: `sg-${id}`,
      }
    : undefined

  const locationLabel = [city, stateCode].filter(Boolean).join(", ") || venue?.name || "Location TBD"

  // --- Project schema objects onto the board's Opportunity shape ---
  const opportunity: Opportunity = {
    id: event.id,
    title: event.title,
    category: "Live event",
    intent: "concert",
    region: query.region ?? "Wisconsin",
    location: locationLabel,
    timeWindow,
    timeBucket: bucketForStart(startsAt),
    dataSource: "seatgeek",
    sourceLabel: "Live · SeatGeek",
    live: true,
    satelliteId: query.satelliteId ?? "somerset-st-croix",
    satelliteName: query.satelliteName ?? "Somerset / St. Croix corridor",
    corridorId: query.corridorId ?? "somerset-mystic-lake-concert",
    sharedProblem: "eventParkingTailgate",
    whyThisFits: [
      "This is a real event with a fixed start time near your corridor.",
      "A fixed show time turns parking and a sober return into the real problem.",
      "DCC can pair the ticket with network transport so the night is handled.",
    ],
    bestFor: ["Concert groups planning around a confirmed show", "Travelers who want transport sorted too"],
    whatToVerify: ["Confirm the date and door time on the ticket page", "Check transport availability for this date"],
    expectedEvent: "ticket_clickout",
    action: handoff
      ? {
          label: "Get tickets",
          href: handoff.href,
          destinationType: "seatgeek",
        }
      : undefined,
  }

  return opportunity
}

// ---------------------------------------------------------------------------
// Fetch path
// ---------------------------------------------------------------------------

/**
 * Fetch + normalize SeatGeek events for a location/date window.
 *
 * Never throws to the caller: on any failure (no client id, network error, bad
 * shape) it returns an empty opportunity list with diagnostics so the page can fall
 * back to mock-only mode. The client id is never returned or logged.
 */
export async function fetchSeatGeekOpportunities(
  query: SeatGeekQuery = {},
): Promise<SeatGeekFeedResult> {
  const lastFetchAttemptedAt = new Date().toISOString()
  const environment = currentEnvironment()
  const { clientId, sourceName } = resolveClientId()

  // The real project stores SEATGEEK_CLIENT_ID as Production-only, so a missing
  // key outside Production is expected rather than an error.
  const productionOnlyNote =
    environment !== "production"
      ? "SEATGEEK_CLIENT_ID is Production-only in destinations-cc; live rows appear only in Production unless the key is also added to this environment."
      : undefined

  if (!clientId) {
    return {
      opportunities: [],
      diagnostics: {
        enabled: false,
        keyExists: false,
        liveCount: 0,
        fallbackMode: "mock-only",
        lastFetchAttemptedAt,
        environment,
        environmentNote: productionOnlyNote,
      },
    }
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      per_page: String(query.size ?? 12),
      sort: "datetime_local.asc",
    })
    if (query.lat !== undefined) params.set("lat", String(query.lat))
    if (query.lon !== undefined) params.set("lon", String(query.lon))
    if (query.range) params.set("range", query.range)
    if (query.startDate) params.set("datetime_local.gte", query.startDate)
    if (query.endDate) params.set("datetime_local.lte", query.endDate)

    const res = await fetch(`${SEATGEEK_EVENTS_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      // Cache briefly; this is an internal prototype, not a hot path.
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return {
        opportunities: [],
        diagnostics: {
          enabled: true,
          keyExists: true,
          liveCount: 0,
          fallbackMode: "mock-only",
          lastFetchAttemptedAt,
          error: `SeatGeek responded ${res.status}`,
          keySourceName: sourceName,
          environment,
          environmentNote: productionOnlyNote,
        },
      }
    }

    const data = (await res.json()) as { events?: RawSeatGeekEvent[] }
    const rawEvents = data.events ?? []
    const opportunities = rawEvents
      .map((raw) => normalizeSeatGeekEvent(raw, query))
      .filter((o): o is Opportunity => o !== null)

    return {
      opportunities,
      diagnostics: {
        enabled: true,
        keyExists: true,
        liveCount: opportunities.length,
        fallbackMode: opportunities.length > 0 ? "mock+live" : "mock-only",
        lastFetchAttemptedAt,
        keySourceName: sourceName,
        environment,
        environmentNote: productionOnlyNote,
      },
    }
  } catch (err) {
    return {
      opportunities: [],
      diagnostics: {
        enabled: true,
        keyExists: true,
        liveCount: 0,
        fallbackMode: "mock-only",
        lastFetchAttemptedAt,
        error: err instanceof Error ? err.message : "Unknown SeatGeek fetch error",
        keySourceName: sourceName,
        environment,
        environmentNote: productionOnlyNote,
      },
    }
  }
}
