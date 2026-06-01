/**
 * DCC shared decision-problem registry.
 *
 * The "common variable + local qualifier" model in code: a small set of shared
 * problems each storefront reuses, specialized by a local qualifier so pages are
 * specific rather than thin.
 *
 *   shared problem + local qualifier => specific decision surface
 *
 * Doctrine: v0_memories/user/dcc-network.md, dcc-place-time-engine.md
 */

import type { DecisionProblem } from "@/lib/dcc/schema/core"

export const SHARED_DECISION_PROBLEMS = {
  groupTransportation: {
    id: "group-transportation",
    problem:
      "Groups need a safe, simple way to get there and back without turning the trip into a driving problem.",
    fitRules: ["concert groups", "tour groups", "vacation rental groups", "after-dark returns"],
    notFitRules: ["solo travelers who can use normal transit", "routes with no coverage"],
    ctaPattern: "Check ride options",
    telemetryExpectation: ["decision_viewed", "cta_clicked", "dcc_exit_clicked"],
  },

  cruiseTimingAnxiety: {
    id: "cruise-timing-anxiety",
    problem: "Cruise passengers need excursions that fit port time and reduce return-to-ship risk.",
    fitRules: ["limited port windows", "operator pickup", "weather-sensitive tours"],
    notFitRules: ["land-only travelers", "open-ended schedules"],
    ctaPattern: "Check cruise-safe availability",
    telemetryExpectation: ["decision_viewed", "verdict_shown", "tour_clickout"],
  },

  largeGroupMeal: {
    id: "large-group-meal",
    problem:
      "Large vacation-rental groups need a way to feed everyone without cooking, splitting orders, or leaving the house.",
    fitRules: ["full-house groups", "no on-site cooking", "single coordinated order"],
    notFitRules: ["couples / small parties", "restaurant dine-out intent"],
    ctaPattern: "Feed the house",
    telemetryExpectation: ["decision_viewed", "cta_clicked", "lead_captured"],
  },

  cabinConvenience: {
    id: "cabin-convenience",
    problem: "Cabin guests arrive and realize they need useful things without wanting to leave again.",
    fitRules: ["firewood / ice / essentials", "forgotten-item runs", "settle-in convenience"],
    notFitRules: ["multi-day rental packages", "self-serve gear marketplace"],
    ctaPattern: "Request a local drop",
    telemetryExpectation: ["decision_viewed", "cta_clicked", "lead_captured"],
  },

  eventParkingTailgate: {
    id: "event-parking-tailgate",
    problem:
      "Event groups need to solve parking, tailgating, and sober return around a fixed show time.",
    fitRules: ["fixed-time events", "tailgate groups", "post-show return risk"],
    notFitRules: ["non-event days", "individuals using rideshare"],
    ctaPattern: "Plan the tailgate",
    telemetryExpectation: ["decision_viewed", "cta_clicked", "booking_started"],
  },

  tourChoiceAnxiety: {
    id: "tour-choice-anxiety",
    problem:
      "Visitors need help choosing the right tour by group type, timing, pickup needs, and risk.",
    fitRules: ["multiple comparable tours", "group-type fit", "timing/pickup constraints"],
    notFitRules: ["visitor already booked", "no comparable inventory"],
    ctaPattern: "Choose the right tour",
    telemetryExpectation: ["decision_viewed", "verdict_shown", "tour_clickout"],
  },
} satisfies Record<string, DecisionProblem>

export type SharedProblemKey = keyof typeof SHARED_DECISION_PROBLEMS

/** Compose a shared problem with a local qualifier into a specific decision context. */
export function localizeProblem(
  key: SharedProblemKey,
  qualifier: string,
  localExplanation: string,
) {
  const base = SHARED_DECISION_PROBLEMS[key]
  return {
    sharedProblem: key,
    problemId: base.id,
    qualifier,
    localExplanation,
    ctaPattern: base.ctaPattern,
  }
}
