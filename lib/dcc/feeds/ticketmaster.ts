/**
 * Phase 6A — Ticketmaster event ingestion adapter (server-side only).
 *
 * Doctrine: v0_memories/user/dcc-place-time-engine.md, earth-os.md
 *
 * Rules honored here:
 *  - Runs server-side only ("server-only" import guards against client bundling).
 *  - The API key is read from the environment at call time and NEVER returned,
 *    logged, or sent to the client.
 *  - If no key exists (or the fetch fails), the adapter returns an empty list with
 *    diagnostics so the page falls back cleanly to mock data.
 *  - Raw Ticketmaster events are normalized onto the DCC shared schema
 *    (Event / Venue / TimeWindow / Handoff) and then projected into an Opportunity
 *    so the existing board can render live rows alongside mock rows.
 *
 * This is an adapter INTERFACE plus a working fetch path. With no key present it
 * is dormant; adding TICKETMASTER_API_KEY later activates it with no UI changes.
 */

import "server-only"

import type { Event, Venue, TimeWindow, Handoff } from "@/lib/dcc/schema/core"
import type { Opportunity } from "@/lib/dcc/earthos/mockOpportunities"

const TICKETMASTER_DISCOVERY_URL = "https://app.ticketmaster.com/discovery/v2/events.json"

/** Env keys checked, in priority order. The value itself is never exposed. */
const API_KEY_ENV_CANDIDATES = [
  "TICKETMASTER_API_KEY",
  "NEXT_PUBLIC_TICKETMASTER_API_KEY",
  "TICKETMASTER_CONSUMER_KEY",
] as const

/** Diagnostics surfaced on the internal page only — never any secret value. */
export type TicketmasterDiagnostics = {
  /** True when an API key is present in the environment. */
  enabled: boolean
  /** Number of live, normalized opportunities returned this fetch. */
  liveCount: number
  /** "mock-only" when no live rows merged, "mock+live" when live rows are present. */
  fallbackMode: "mock-only" | "mock+live"
  /** ISO timestamp of when the fetch was attempted. */
  lastFetchAttemptedAt: string
  /** Internal-only error summary (no secrets). Undefined when healthy. */
  error?: string
  /** Which env var name supplied the key (name only, never the value). */
  keySourceName?: (typeof API_KEY_ENV_CANDIDATES)[number]
}

export type TicketmasterFeedResult = {
  opportunities: Opportunity[]
  diagnostics: TicketmasterDiagnostics
}

export type TicketmasterQuery = {
  /** "lat,lng" point to search around. */
  latlong?: string
  /** Search radius. */
  radius?: number
  unit?: "miles" | "km"
  /** ISO datetime lower bound. */
  startDateTime?: string
  /** ISO datetime upper bound. */
  endDateTime?: string
  /** Max events to request. */
  size?: number
  /** Maps the resulting opportunities to a network corridor/satellite. */
  satelliteId?: string
  satelliteName?: string
  corridorId?: string
  /** Region label used by the board's location filter. */
  region?: Opportunity["region"]
}

/** Resolve the API key without exposing it. Returns the value + which env supplied it. */
function resolveApiKey(): { key?: string; sourceName?: TicketmasterDiagnostics["keySourceName"] } {
  for (const name of API_KEY_ENV_CANDIDATES) {
    const value = process.env[name]
    if (value && value.trim().length > 0) {
      return { key: value, sourceName: name }
    }
  }
  return {}
}

/** True when a Ticketmaster key is configured (no value revealed). */
export function isTicketmasterEnabled(): boolean {
  return Boolean(resolveApiKey().key)
}

// ---------------------------------------------------------------------------
// Normalization: raw Ticketmaster event -> DCC schema -> Opportunity
// ---------------------------------------------------------------------------

/** Minimal shape of the Ticketmaster Discovery event payload we read. */
type RawTicketmasterEvent = {
  id?: string
  name?: string
  url?: string
  dates?: { start?: { dateTime?: string; localDate?: string } }
  _embedded?: {
    venues?: Array<{
      name?: string
      city?: { name?: string }
      state?: { stateCode?: string; name?: string }
      location?: { latitude?: string; longitude?: string }
    }>
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
 * Normalize one raw Ticketmaster event into the DCC shared schema, then project
 * it onto an Opportunity for the board. Returns null when the row is unusable.
 */
export function normalizeTicketmasterEvent(
  raw: RawTicketmasterEvent,
  query: TicketmasterQuery = {},
): Opportunity | null {
  const id = raw.id
  const title = raw.name
  if (!id || !title) return null

  const venueRaw = raw._embedded?.venues?.[0]
  const city = venueRaw?.city?.name
  const stateCode = venueRaw?.state?.stateCode
  const lat = venueRaw?.location?.latitude ? Number(venueRaw.location.latitude) : undefined
  const lng = venueRaw?.location?.longitude ? Number(venueRaw.location.longitude) : undefined
  const startsAt = raw.dates?.start?.dateTime ?? raw.dates?.start?.localDate
  const ticketUrl = raw.url

  // --- DCC schema objects (the canonical grammar) ---
  const venue: Venue | undefined = venueRaw?.name
    ? {
        id: `tm-venue-${id}`,
        placeId: `tm-place-${id}`,
        name: venueRaw.name,
        region: stateCode,
        lat: Number.isFinite(lat) ? lat : undefined,
        lng: Number.isFinite(lng) ? lng : undefined,
      }
    : undefined

  const timeWindow: TimeWindow = {
    startsAt,
    lastVerifiedAt: new Date().toISOString(),
    source: "ticketmaster",
  }

  const event: Event = {
    id: `tm-${id}`,
    title,
    venue,
    place: venue,
    timeWindow,
    source: "ticketmaster",
  }

  // Ticketmaster ticket links are monetizable exits → tracked handoff.
  const handoff: Handoff | undefined = ticketUrl
    ? {
        kind: "tracked_handoff",
        policy: "tracked_handoff",
        label: "Get tickets",
        href: ticketUrl,
        trackingId: `tm-${id}`,
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
    dataSource: "ticketmaster",
    sourceLabel: "Live · Ticketmaster",
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
          destinationType: "ticketmaster",
        }
      : undefined,
  }

  return opportunity
}

// ---------------------------------------------------------------------------
// Fetch path
// ---------------------------------------------------------------------------

/**
 * Fetch + normalize Ticketmaster events for a location/date window.
 *
 * Never throws to the caller: on any failure (no key, network error, bad shape)
 * it returns an empty opportunity list with diagnostics so the page can fall back
 * to mock-only mode. The API key is never returned or logged.
 */
export async function fetchTicketmasterOpportunities(
  query: TicketmasterQuery = {},
): Promise<TicketmasterFeedResult> {
  const lastFetchAttemptedAt = new Date().toISOString()
  const { key, sourceName } = resolveApiKey()

  if (!key) {
    return {
      opportunities: [],
      diagnostics: {
        enabled: false,
        liveCount: 0,
        fallbackMode: "mock-only",
        lastFetchAttemptedAt,
      },
    }
  }

  try {
    const params = new URLSearchParams({ apikey: key, size: String(query.size ?? 12) })
    if (query.latlong) params.set("latlong", query.latlong)
    if (query.radius) params.set("radius", String(query.radius))
    params.set("unit", query.unit ?? "miles")
    if (query.startDateTime) params.set("startDateTime", query.startDateTime)
    if (query.endDateTime) params.set("endDateTime", query.endDateTime)

    const res = await fetch(`${TICKETMASTER_DISCOVERY_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      // Cache briefly; this is an internal prototype, not a hot path.
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return {
        opportunities: [],
        diagnostics: {
          enabled: true,
          liveCount: 0,
          fallbackMode: "mock-only",
          lastFetchAttemptedAt,
          error: `Ticketmaster responded ${res.status}`,
          keySourceName: sourceName,
        },
      }
    }

    const data = (await res.json()) as { _embedded?: { events?: RawTicketmasterEvent[] } }
    const rawEvents = data._embedded?.events ?? []
    const opportunities = rawEvents
      .map((raw) => normalizeTicketmasterEvent(raw, query))
      .filter((o): o is Opportunity => o !== null)

    return {
      opportunities,
      diagnostics: {
        enabled: true,
        liveCount: opportunities.length,
        fallbackMode: opportunities.length > 0 ? "mock+live" : "mock-only",
        lastFetchAttemptedAt,
        keySourceName: sourceName,
      },
    }
  } catch (err) {
    return {
      opportunities: [],
      diagnostics: {
        enabled: true,
        liveCount: 0,
        fallbackMode: "mock-only",
        lastFetchAttemptedAt,
        error: err instanceof Error ? err.message : "Unknown Ticketmaster fetch error",
        keySourceName: sourceName,
      },
    }
  }
}
