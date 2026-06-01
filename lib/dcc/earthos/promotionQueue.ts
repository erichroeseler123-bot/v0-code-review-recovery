/**
 * Earth OS Promotion Queue — what is ready to promote, what is blocked, and the
 * next action for each route/site in the network.
 *
 * This is the highest-leverage Earth OS module: before the network promotes
 * anything (Printing Press, Outreach, Media), it must know what is ready, what
 * is blocked, what needs proof, and what must never be touched.
 *
 * Pure data + helpers. No external APIs, no email, no cron, no DB. The items
 * below are hand-authored mock/pending examples normalized against the shared
 * satellite registry.
 *
 * Doctrine: v0_memories/user/earth-os.md, dcc-network.md
 */

import type { DccEventName } from "@/lib/dcc/telemetry/events"
import { getSatellite, type SatelliteRecord } from "@/lib/dcc/network/satelliteRegistry"

/**
 * Promotion lifecycle. Ordered loosely from "needs work" → "ready".
 * - blocked            : something hard prevents promotion (domain, missing commits, missing telemetry)
 * - in_progress        : actively being built; not ready
 * - needs_visual_polish: logic is correct but presentation is not publish-ready
 * - pr_ready           : code/branch is clean and ready for PR/review
 * - ready_to_publish   : passes checks, just needs the publish action
 * - promotable         : live + clean + measured; ready for outreach/media promotion
 */
export type PromotionState =
  | "blocked"
  | "in_progress"
  | "needs_visual_polish"
  | "pr_ready"
  | "ready_to_publish"
  | "promotable"

/** Which system layer owns the next action. */
export type OwnerLayer = "DCC" | "Earth OS" | "Satellite" | "Execution" | "Human review"

export type PromotionQueueItem = {
  /** Matches a satelliteRegistry id where possible (else a sub-route/corridor id). */
  id: string
  /** Display name (falls back to registry name). */
  label?: string
  /** Optional route/corridor this item refers to. */
  route?: string
  state: PromotionState
  /** Why it is in this state. */
  why: string
  /** The single next action that moves it forward. */
  nextAction: string
  /** Actions that are explicitly NOT allowed yet (guardrails). */
  blockedActions: string[]
  /** If promotable, the local media story angle. */
  mediaAngle?: string
  /** If promotable, who to reach and why. */
  outreachAngle?: string
  /** Telemetry that must be flowing before/while promoting. */
  telemetryNeeded: DccEventName[]
  /** Which layer owns the next action. */
  owner: OwnerLayer
}

/**
 * The queue. Seven seed items spanning ready, blocked, and in-progress states.
 * These are point-in-time examples — re-verify against the live network before
 * acting (see network-status-snapshot.md).
 */
export const PROMOTION_QUEUE: PromotionQueueItem[] = [
  {
    id: "blue-hills-outpost",
    route: "/blue-hills-firewood-delivery",
    state: "promotable",
    why: "Published, scope clean (no rental-marketplace or tourism-guide drift), zero open issues.",
    nextAction: "Property manager outreach + local media pitch.",
    blockedActions: [
      "Do not add rental listings or gear-rental packages",
      "Do not add DCC decision pages to this domain",
    ],
    mediaAngle:
      "Local cabin convenience-drop service launches for Blue Hills lake-house weekends (firewood, ice, essentials).",
    outreachAngle:
      "Cabin owners + NW Wisconsin property managers: a link guests can use for firewood, ice, and forgotten essentials.",
    telemetryNeeded: ["decision_viewed", "cta_clicked", "lead_captured"],
    owner: "Earth OS",
  },
  {
    id: "last-frontier-shore-excursions",
    route: "/",
    state: "ready_to_publish",
    why: "Scope clean (cruise-port only), build passed, Haines added, inland land-tour routes removed.",
    nextAction: "Publish.",
    blockedActions: [
      "Do not re-add Anchorage / Fairbanks / Denali land-tour routes",
      "Do not broaden into a general Alaska tour site",
    ],
    mediaAngle:
      "New Alaska cruise-port guide helps passengers compare shore excursions by port and cruise-safe timing.",
    outreachAngle: "Cruise-focused communities + Viator operators per port; seasonal (pre-cruise-season) timing.",
    telemetryNeeded: ["decision_viewed", "verdict_shown", "tour_clickout"],
    owner: "Satellite",
  },
  {
    id: "welcome-to-alaska-tours",
    route: "/",
    state: "needs_visual_polish",
    why: "Storefront decision logic is correct, but visual presentation is too white/plain to publish.",
    nextAction: "Add port/tour imagery and visual hierarchy before publish.",
    blockedActions: [
      "Do not publish in current plain state",
      "Do not turn the homepage into a DCC /plan decision surface",
    ],
    telemetryNeeded: ["decision_viewed", "verdict_shown", "tour_clickout"],
    owner: "Satellite",
  },
  {
    id: "somerset-st-croix",
    route: "/somerset-wi/concerts",
    state: "blocked",
    why: "Custom domain points to the wrong Vercel project; telemetry/corridor ID missing.",
    nextAction: "Decide domain architecture (keep shuttle domain separate) + wire telemetry + corridor ID.",
    blockedActions: [
      "Do not promote or pitch until domain + telemetry resolved",
      "Do not merge the shuttle domain into DCC casually",
    ],
    telemetryNeeded: ["page_viewed", "dcc_exit_clicked", "product_opened"],
    owner: "Earth OS",
  },
  {
    id: "dcc-decision-lane",
    label: "DCC Decision Lane Classification",
    state: "pr_ready",
    why: "Feature branch pushed and clean.",
    nextAction: "Create PR and review.",
    blockedActions: ["Do not merge without review", "Do not deploy from the branch directly"],
    telemetryNeeded: [],
    owner: "Human review",
  },
  {
    id: "dcc-doctrine-recovery",
    label: "DCC Doctrine / Somerset Recovery",
    state: "blocked",
    why: "Commits exist only in a local Codex worktree, not on GitHub.",
    nextAction: "Push the dcc-v1-cut-recovery branch to GitHub.",
    blockedActions: ["Do not start dependent work until commits are pushed"],
    telemetryNeeded: [],
    owner: "Human review",
  },
  {
    id: "gosno",
    route: "/",
    state: "in_progress",
    why: "Private-only conversion done, but Rezdy booking integration is unfinished.",
    nextAction: "Finish Rezdy wiring.",
    blockedActions: [
      "Do not promote before booking works end-to-end",
      "Do not reintroduce shared-shuttle marketplace scope",
    ],
    telemetryNeeded: ["decision_viewed", "cta_clicked", "booking_started", "booking_completed"],
    owner: "Execution",
  },
]

/** Display order: ready things first, blocked last, so the eye lands on action. */
const STATE_ORDER: Record<PromotionState, number> = {
  promotable: 0,
  ready_to_publish: 1,
  pr_ready: 2,
  needs_visual_polish: 3,
  in_progress: 4,
  blocked: 5,
}

/** Human-readable state label. */
export function promotionStateLabel(state: PromotionState): string {
  switch (state) {
    case "promotable":
      return "Promotable"
    case "ready_to_publish":
      return "Ready to publish"
    case "pr_ready":
      return "PR ready"
    case "needs_visual_polish":
      return "Needs visual polish"
    case "in_progress":
      return "In progress"
    case "blocked":
      return "Blocked"
  }
}

/** True when the item is clear to move forward (no hard blocker). */
export function isActionable(item: PromotionQueueItem): boolean {
  return item.state !== "blocked" && item.state !== "in_progress"
}

/** Resolve the registry record behind a queue item, if it maps to a known site. */
export function resolveSatellite(item: PromotionQueueItem): SatelliteRecord | undefined {
  return getSatellite(item.id)
}

/** Queue sorted for display. */
export function sortedQueue(items: PromotionQueueItem[] = PROMOTION_QUEUE): PromotionQueueItem[] {
  return [...items].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state])
}

/** Counts by state for the summary band. */
export function queueSummary(items: PromotionQueueItem[] = PROMOTION_QUEUE) {
  const total = items.length
  const promotable = items.filter((i) => i.state === "promotable").length
  const blocked = items.filter((i) => i.state === "blocked").length
  const actionable = items.filter(isActionable).length
  return { total, promotable, blocked, actionable }
}
