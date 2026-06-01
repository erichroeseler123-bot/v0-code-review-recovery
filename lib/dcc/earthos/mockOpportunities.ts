/**
 * Phase 5 mock opportunity feed for the internal next-48-hours prototype.
 *
 * MOCK / SAMPLE DATA ONLY. No external APIs, no database. Every record is
 * hand-authored to prove the place + time + intent + explanation + tracked-action
 * shape works before any real ingestion (Phase 6+).
 *
 * Each opportunity normalizes onto the Phase 1 schema/core grammar and references
 * a shared decision problem + a satellite + a corridor, so the same surface can
 * later be populated by Ticketmaster / FareHarbor / Rezdy / Viator feeds.
 *
 * Doctrine: v0_memories/user/dcc-place-time-engine.md, earth-os.md
 */

import type { DataSource, TimeWindow } from "@/lib/dcc/schema/core"
import type { DccEventName } from "@/lib/dcc/telemetry/events"
import type { HandoffDestination } from "@/lib/dcc/handoff/createHandoffPayload"
import type { SharedProblemKey } from "@/lib/dcc/decision/sharedProblems"

export type OpportunityIntent = "concert" | "tour" | "food" | "ride" | "cabin" | "shore-excursion"

export type OpportunityRegion = "Wisconsin" | "Alaska" | "Colorado" | "New Orleans"

export type OpportunityTimeBucket = "next-48-hours" | "this-weekend" | "anytime"

/** A single place-and-time decision opportunity rendered on the prototype board. */
export type Opportunity = {
  id: string
  title: string
  /** Human-readable category label shown on the card. */
  category: string
  intent: OpportunityIntent
  region: OpportunityRegion
  location: string
  timeWindow: TimeWindow
  timeBucket: OpportunityTimeBucket
  /** Canonical schema data source. */
  dataSource: DataSource
  /** How this row is currently sourced, e.g. "Mock", "FareHarbor (future)". */
  sourceLabel: string
  satelliteId: string
  satelliteName: string
  corridorId: string
  sharedProblem: SharedProblemKey
  whyThisFits: string[]
  bestFor: string[]
  whatToVerify: string[]
  /** Telemetry event that would fire if the visitor takes the primary action. */
  expectedEvent: DccEventName
  /** Optional tracked action. Omitted for protected/proven execution (PARR). */
  action?: {
    label: string
    href: string
    destinationType: HandoffDestination
    operatorName?: string
  }
  /** Protected/proven execution — shown as reference, never linked to checkout. */
  protected?: boolean
  /** Short note explaining a special status (e.g. PARR protection). */
  note?: string
}

/** Window helper: keeps the mock ISO strings readable and consistent. */
function window(startsAt: string, endsAt: string, source: DataSource): TimeWindow {
  return { startsAt, endsAt, lastVerifiedAt: "2026-06-01T08:00:00-05:00", source }
}

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "mystic-lake-shuttle-tailgate",
    title: "Private shuttle + tailgate to Mystic Lake show night",
    category: "Concert transport & tailgate",
    intent: "concert",
    region: "Wisconsin",
    location: "Somerset / Hudson → Mystic Lake, MN",
    timeWindow: window("2026-06-02T17:30:00-05:00", "2026-06-02T23:59:00-05:00", "manual"),
    timeBucket: "next-48-hours",
    dataSource: "manual",
    sourceLabel: "Mock · owned execution (future)",
    satelliteId: "somerset-st-croix",
    satelliteName: "Somerset / St. Croix corridor",
    corridorId: "somerset-mystic-lake-concert",
    sharedProblem: "eventParkingTailgate",
    whyThisFits: [
      "There is a fixed show time, so parking and a sober return are the real problems.",
      "Your group is staying in the Somerset / Hudson corridor.",
      "A private shuttle removes the post-show driving risk entirely.",
    ],
    bestFor: ["Concert groups of 6+", "Tailgaters who do not want to drive after the show"],
    whatToVerify: ["Confirm the show date and door time", "Lock the pickup window before the lot fills"],
    expectedEvent: "booking_started",
    action: {
      label: "Plan the shuttle + tailgate",
      href: "#somerset-shuttle",
      destinationType: "manual_quote",
    },
  },
  {
    id: "blue-hills-cabin-drop",
    title: "Firewood, ice & snack drop to your NW Wisconsin cabin",
    category: "Cabin convenience drop",
    intent: "cabin",
    region: "Wisconsin",
    location: "Blue Hills area, NW Wisconsin",
    timeWindow: window("2026-06-01T16:00:00-05:00", "2026-06-01T20:00:00-05:00", "manual"),
    timeBucket: "next-48-hours",
    dataSource: "manual",
    sourceLabel: "Mock · owned execution (future)",
    satelliteId: "blue-hills-outpost",
    satelliteName: "Blue Hills Outpost",
    corridorId: "blue-hills-cabin-convenience",
    sharedProblem: "cabinConvenience",
    whyThisFits: [
      "You just arrived and realized you are missing essentials.",
      "Leaving again to drive into town defeats the point of the cabin.",
      "A single convenience drop covers firewood, ice, and forgotten items.",
    ],
    bestFor: ["Just-arrived cabin guests", "Groups who want to settle in without another drive"],
    whatToVerify: ["Confirm the delivery window", "List the exact items so it can be quoted"],
    expectedEvent: "lead_captured",
    action: {
      label: "Request a local drop",
      href: "#blue-hills-drop",
      destinationType: "manual_quote",
    },
  },
  {
    id: "dells-feastly-group-dinner",
    title: "Group dinner delivered to your Wisconsin Dells rental",
    category: "Large-group meal",
    intent: "food",
    region: "Wisconsin",
    location: "Wisconsin Dells, WI",
    timeWindow: window("2026-06-02T18:00:00-05:00", "2026-06-02T19:30:00-05:00", "manual"),
    timeBucket: "next-48-hours",
    dataSource: "manual",
    sourceLabel: "Mock · owned execution (future)",
    satelliteId: "feastly-spread",
    satelliteName: "Feastly Spread",
    corridorId: "dells-large-group-food",
    sharedProblem: "largeGroupMeal",
    whyThisFits: [
      "Your group is staying together in one rental house.",
      "Restaurants are a coordination problem for groups over 15.",
      "A fixed meal package solves timing, quantity, and cleanup at once.",
    ],
    bestFor: ["Vacation rentals with 15+ guests", "Hosts who do not want to cook or clean up"],
    whatToVerify: ["Confirm headcount and the night", "Lock a delivery window before planning the evening"],
    expectedEvent: "lead_captured",
    action: {
      label: "Feed the house",
      href: "#feastly-quote",
      destinationType: "manual_quote",
    },
  },
  {
    id: "juneau-whale-watching",
    title: "Juneau whale watching with operator pickup",
    category: "Alaska tour",
    intent: "tour",
    region: "Alaska",
    location: "Juneau, AK",
    timeWindow: window("2026-06-03T09:00:00-08:00", "2026-06-03T12:30:00-08:00", "fareharbor"),
    timeBucket: "this-weekend",
    dataSource: "fareharbor",
    sourceLabel: "Mock · FareHarbor (future)",
    satelliteId: "welcome-to-alaska-tours",
    satelliteName: "Welcome to Alaska Tours",
    corridorId: "juneau-wildlife-tours",
    sharedProblem: "tourChoiceAnxiety",
    whyThisFits: [
      "Juneau has multiple comparable wildlife tours, so the real problem is choosing.",
      "Morning departures leave room for the rest of your day in port.",
      "Operator pickup reduces the logistics you have to solve yourself.",
    ],
    bestFor: ["First-time Juneau visitors", "Families comparing several tour options"],
    whatToVerify: ["Confirm departure time and pickup point", "Check the operator's weather policy"],
    expectedEvent: "tour_clickout",
    action: {
      label: "Choose the right tour",
      href: "#juneau-tour",
      destinationType: "fareharbor",
      operatorName: "Juneau wildlife operator",
    },
  },
  {
    id: "last-frontier-shore-excursion",
    title: "Cruise-safe shore excursion in Skagway",
    category: "Cruise shore excursion",
    intent: "shore-excursion",
    region: "Alaska",
    location: "Skagway, AK (cruise port)",
    timeWindow: window("2026-06-04T08:30:00-08:00", "2026-06-04T13:00:00-08:00", "viator"),
    timeBucket: "this-weekend",
    dataSource: "viator",
    sourceLabel: "Mock · Viator (future)",
    satelliteId: "last-frontier-shore-excursions",
    satelliteName: "Last Frontier Shore Excursions",
    corridorId: "skagway-shore-excursions",
    sharedProblem: "cruiseTimingAnxiety",
    whyThisFits: [
      "You have a limited port window and cannot risk missing the ship.",
      "This excursion is timed to return well before all-aboard.",
      "Operator handles the timing so return-to-ship risk stays low.",
    ],
    bestFor: ["Cruise passengers with a fixed port window", "Travelers worried about all-aboard timing"],
    whatToVerify: ["Confirm your ship's all-aboard time", "Check the excursion's stated return buffer"],
    expectedEvent: "tour_clickout",
    action: {
      label: "Check cruise-safe availability",
      href: "#skagway-excursion",
      destinationType: "viator",
      operatorName: "Skagway shore operator",
    },
  },
  {
    id: "new-orleans-swamp-tour",
    title: "New Orleans swamp tour with hotel pickup",
    category: "Swamp tour",
    intent: "tour",
    region: "New Orleans",
    location: "New Orleans, LA",
    timeWindow: window("2026-06-02T13:00:00-05:00", "2026-06-02T17:00:00-05:00", "viator"),
    timeBucket: "next-48-hours",
    dataSource: "viator",
    sourceLabel: "Mock · Viator (future)",
    satelliteId: "welcome-to-new-orleans-tours",
    satelliteName: "Welcome to New Orleans Tours",
    corridorId: "nola-swamp-tours",
    sharedProblem: "tourChoiceAnxiety",
    whyThisFits: [
      "Swamp tours vary a lot by group type and pickup needs.",
      "Hotel pickup removes the drive out to the bayou.",
      "An afternoon departure leaves your evening open in the city.",
    ],
    bestFor: ["Visitors without a car", "Groups wanting the signature NOLA swamp experience"],
    whatToVerify: ["Confirm hotel pickup is included", "Check the pickup time and return window"],
    expectedEvent: "tour_clickout",
    action: {
      label: "Choose the right swamp tour",
      href: "#nola-swamp",
      destinationType: "viator",
      operatorName: "NOLA swamp operator",
    },
  },
  {
    id: "mighty-argo-shuttle",
    title: "Mighty Argo Cable Car shuttle",
    category: "Attraction shuttle",
    intent: "ride",
    region: "Colorado",
    location: "Georgetown, CO",
    timeWindow: window("2026-06-03T10:00:00-06:00", "2026-06-03T16:00:00-06:00", "manual"),
    timeBucket: "this-weekend",
    dataSource: "manual",
    sourceLabel: "Mock · owned execution (future)",
    satelliteId: "shuttleya",
    satelliteName: "Shuttleya",
    corridorId: "mighty-argo-shuttle",
    sharedProblem: "groupTransportation",
    whyThisFits: [
      "Getting to the cable car is the only logistics problem here.",
      "A dedicated shuttle removes parking and timing stress.",
      "This is the single job this site does — nothing to compare.",
    ],
    bestFor: ["Cable car visitors", "Groups who want a direct ride to the attraction"],
    whatToVerify: ["Confirm pickup point and time", "Match the shuttle to your cable car reservation"],
    expectedEvent: "cta_clicked",
    action: {
      label: "Check shuttle times",
      href: "#argo-shuttle",
      destinationType: "manual_quote",
    },
  },
  {
    id: "gosno-private-ride",
    title: "Private mountain ride to the resort",
    category: "Private mountain transport",
    intent: "ride",
    region: "Colorado",
    location: "Denver / Front Range → Colorado mountains",
    timeWindow: window("2026-06-04T06:00:00-06:00", "2026-06-04T09:30:00-06:00", "rezdy"),
    timeBucket: "this-weekend",
    dataSource: "rezdy",
    sourceLabel: "Mock · Rezdy (future)",
    satelliteId: "gosno",
    satelliteName: "GoSno",
    corridorId: "frontrange-mountain-rides",
    sharedProblem: "groupTransportation",
    whyThisFits: [
      "Mountain driving and conditions are the real risk on this trip.",
      "A private ride means no one in your group has to drive the pass.",
      "Early departure gets you to the mountain on time.",
    ],
    bestFor: ["Groups headed to the mountains", "Travelers who would rather not drive I-70"],
    whatToVerify: ["Confirm pickup time and address", "Check vehicle size against your group"],
    expectedEvent: "tour_clickout",
    action: {
      label: "Check ride options",
      href: "#gosno-ride",
      destinationType: "rezdy",
      operatorName: "GoSno",
    },
  },
  {
    id: "parr-red-rocks-proven",
    title: "Red Rocks transport + tailgate (proven execution)",
    category: "Event transport & tailgate",
    intent: "concert",
    region: "Colorado",
    location: "Denver → Red Rocks Amphitheatre, CO",
    timeWindow: window("2026-06-02T16:00:00-06:00", "2026-06-02T23:59:00-06:00", "manual"),
    timeBucket: "next-48-hours",
    dataSource: "manual",
    sourceLabel: "Reference only · proven execution",
    satelliteId: "party-at-red-rocks",
    satelliteName: "Party at Red Rocks (PARR)",
    corridorId: "red-rocks-event-transport",
    sharedProblem: "eventParkingTailgate",
    whyThisFits: [
      "Red Rocks parking and post-show return are well-known pain points.",
      "PARR is the network's proven Red Rocks transport + tailgate execution.",
      "This row exists to show how proven execution slots into the board.",
    ],
    bestFor: ["Red Rocks concertgoers", "Groups wanting a known-good tailgate option"],
    whatToVerify: ["This is a reference card only", "PARR owns its own checkout — not linked here"],
    expectedEvent: "decision_viewed",
    protected: true,
    note: "Protected: PARR is proven and self-contained. No checkout link, no PARR code touched.",
  },
]

export const REGION_OPTIONS: ("all" | OpportunityRegion)[] = [
  "all",
  "Wisconsin",
  "Alaska",
  "Colorado",
  "New Orleans",
]

export const INTENT_OPTIONS: ("all" | OpportunityIntent)[] = [
  "all",
  "concert",
  "tour",
  "food",
  "ride",
  "cabin",
  "shore-excursion",
]

export const TIME_OPTIONS: ("all" | OpportunityTimeBucket)[] = [
  "all",
  "next-48-hours",
  "this-weekend",
  "anytime",
]

/** Pure filter used by the client board. "all" / "anytime" act as wildcards. */
export function filterOpportunities(
  items: Opportunity[],
  region: "all" | OpportunityRegion,
  intent: "all" | OpportunityIntent,
  time: "all" | OpportunityTimeBucket,
): Opportunity[] {
  return items.filter((o) => {
    const regionOk = region === "all" || o.region === region
    const intentOk = intent === "all" || o.intent === intent
    const timeOk = time === "all" || time === "anytime" || o.timeBucket === time
    return regionOk && intentOk && timeOk
  })
}
