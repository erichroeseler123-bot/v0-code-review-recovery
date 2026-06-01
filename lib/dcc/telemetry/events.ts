/**
 * DCC shared telemetry contract.
 *
 * One canonical event vocabulary for the whole network. Client analytics and
 * server handoff events should both map onto these names so Earth OS can read a
 * single language. Defining the taxonomy is the goal here — this file
 * intentionally contains NO runtime tracking behavior.
 *
 * Doctrine: v0_memories/user/dcc-network.md, earth-os.md
 */

export const DCC_EVENTS = [
  // Page / surface lifecycle
  "page_viewed",
  "landing_viewed",
  "decision_viewed",
  "verdict_shown",
  // Intent + interaction
  "cta_clicked",
  "product_opened",
  // Handoff / exit (the network's most important signal)
  "dcc_exit_clicked",
  "handoff_viewed",
  "ticket_clickout",
  "tour_clickout",
  // Conversion funnel
  "lead_captured",
  "booking_started",
  "booking_completed",
  "booking_failed",
  // Loop closure
  "traveler_returned",
] as const

export type DccEventName = (typeof DCC_EVENTS)[number]

/** Narrow runtime guard for validating an event name without a behavior layer. */
export function isDccEvent(name: string): name is DccEventName {
  return (DCC_EVENTS as readonly string[]).includes(name)
}
