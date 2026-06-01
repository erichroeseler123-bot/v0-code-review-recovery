/**
 * DCC internal/external link policy.
 *
 * Every strategic link in the network is classified. This closes the
 * "external link leak" problem: untracked monetizable exits are not allowed.
 * Type-level + constant definitions only — no URL-building behavior here
 * (that lives in a future lib/dcc/handoff layer).
 *
 * Doctrine: v0_memories/user/network-design-system.md, dcc-place-time-engine.md
 */

export type LinkPolicy =
  /** Internal navigation between DCC decision surfaces / storefronts. */
  | "internal_decision_link"
  /** Monetizable external exit. MUST be tracked (FareHarbor, Viator, Rezdy, monetized Ticketmaster/SeatGeek). */
  | "tracked_handoff"
  /** Informational external link used purely to verify facts (venue schedule, official source). */
  | "official_verification_source"
  /** Disallowed: a raw external link that is neither chosen nor tracked. */
  | "blocked"

export type HandoffKind =
  | "internal_link"
  | "tracked_handoff"
  | "quote_request"
  | "booking_widget"
  | "official_source"

/** What every tracked handoff must capture before the user exits the network. */
export type HandoffCapture = {
  sourcePage: string
  corridorId?: string
  satelliteId: string
  destinationUrl: string
  ctaLabel: string
  product?: string
  operator?: string
  intent: string
  /** ISO 8601 */
  timestamp: string
}

/**
 * Default classification by destination family. A purely informational
 * Ticketmaster/SeatGeek reference is an official source; a monetized one is a
 * tracked handoff — callers pass `monetized` to disambiguate.
 */
export function classifyExternalLink(
  destination:
    | "fareharbor"
    | "viator"
    | "rezdy"
    | "ticketmaster"
    | "seatgeek"
    | "venue_schedule"
    | "operator_direct"
    | "unknown",
  opts: { monetized?: boolean } = {},
): LinkPolicy {
  switch (destination) {
    case "fareharbor":
    case "viator":
    case "rezdy":
      return "tracked_handoff"
    case "ticketmaster":
    case "seatgeek":
      return opts.monetized ? "tracked_handoff" : "official_verification_source"
    case "venue_schedule":
      return "official_verification_source"
    case "operator_direct":
      // Only allowed if it has been chosen by DCC and tracked.
      return opts.monetized ? "tracked_handoff" : "blocked"
    default:
      return "blocked"
  }
}
