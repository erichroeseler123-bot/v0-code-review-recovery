/**
 * DCC handoff payload builder.
 *
 * Pure, server-safe functions that turn handoff-link props into the canonical
 * HandoffCapture + TelemetryEvent shapes from Phase 1. No network calls, no DOM
 * access here — emitting lives in the client component / postHandoffEvent.
 *
 * Doctrine: v0_memories/user/network-design-system.md, dcc-place-time-engine.md
 */

import type { DccEventName } from "@/lib/dcc/telemetry/events"
import type { HandoffCapture, LinkPolicy } from "@/lib/dcc/links/linkPolicy"
import type { TelemetryEvent } from "@/lib/dcc/schema/core"

/** Destination families a handoff link can point at. */
export type HandoffDestination =
  | "fareharbor"
  | "viator"
  | "rezdy"
  | "ticketmaster"
  | "seatgeek"
  | "operator"
  | "internal"
  | "manual_quote"

export type HandoffLinkInput = {
  href: string
  label: string
  sourceRoute: string
  satelliteId?: string
  corridorId?: string
  destinationType: HandoffDestination
  productId?: string
  operatorName?: string
  intent?: string
  eventName?: DccEventName
}

/** Map a destination family to the network link policy. */
export function policyForDestination(destination: HandoffDestination): LinkPolicy {
  switch (destination) {
    case "fareharbor":
    case "viator":
    case "rezdy":
    case "ticketmaster":
    case "seatgeek":
    case "operator":
      return "tracked_handoff"
    case "manual_quote":
      // Owned quote/lead request — still a tracked, monetizable exit.
      return "tracked_handoff"
    case "internal":
      return "internal_decision_link"
    default:
      return "blocked"
  }
}

/** The default telemetry event when a caller does not specify one. */
export function defaultEventName(destination: HandoffDestination): DccEventName {
  switch (destination) {
    case "ticketmaster":
    case "seatgeek":
      return "ticket_clickout"
    case "fareharbor":
    case "viator":
    case "rezdy":
      return "tour_clickout"
    case "manual_quote":
      return "lead_captured"
    case "internal":
      return "cta_clicked"
    default:
      // The network's most important generic exit signal.
      return "dcc_exit_clicked"
  }
}

/** True when the destination leaves the network (target=_blank, rel=noopener). */
export function isExternalDestination(destination: HandoffDestination): boolean {
  return destination !== "internal" && destination !== "manual_quote"
}

/** Build the structured capture metadata for a handoff. */
export function createHandoffCapture(input: HandoffLinkInput, now: Date = new Date()): HandoffCapture {
  return {
    sourcePage: input.sourceRoute,
    corridorId: input.corridorId,
    satelliteId: input.satelliteId ?? "unknown",
    destinationUrl: input.href,
    ctaLabel: input.label,
    product: input.productId,
    operator: input.operatorName,
    intent: input.intent ?? "unspecified",
    timestamp: now.toISOString(),
  }
}

/** Build the canonical telemetry event for a handoff. */
export function createHandoffEvent(input: HandoffLinkInput, now: Date = new Date()): TelemetryEvent {
  const policy = policyForDestination(input.destinationType)
  return {
    name: input.eventName ?? defaultEventName(input.destinationType),
    satelliteId: input.satelliteId,
    corridorId: input.corridorId,
    route: input.sourceRoute,
    at: now.toISOString(),
    meta: {
      destinationType: input.destinationType,
      destinationUrl: input.href,
      policy,
      ctaLabel: input.label,
      intent: input.intent ?? "unspecified",
      ...(input.productId ? { product: input.productId } : {}),
      ...(input.operatorName ? { operator: input.operatorName } : {}),
    },
  }
}

/** Convenience: both shapes at once. */
export function createHandoffPayload(input: HandoffLinkInput, now: Date = new Date()) {
  return {
    capture: createHandoffCapture(input, now),
    event: createHandoffEvent(input, now),
    policy: policyForDestination(input.destinationType),
    external: isExternalDestination(input.destinationType),
  }
}
