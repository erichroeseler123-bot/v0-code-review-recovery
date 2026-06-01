/**
 * Earth OS Daily Brief — Cron Preview (Phase 10).
 *
 * A READ-ONLY roll-up of everything Earth OS already knows: the Promotion
 * Queue, Printing Press drafts, the Outreach Log, route records, and the
 * next-48-hours mock opportunities. It previews what a future daily cron would
 * summarize each morning — WITHOUT being a cron, sending anything, calling any
 * API, or touching a database.
 *
 * HARD RULES (doctrine + Phase 10 brief):
 * - No cron, no scheduler, no email/Gmail, no external API, no DB, no deploy.
 * - Pure aggregation over existing pure modules. No new data is invented here;
 *   every line traces back to a real queue / press / outreach / route record.
 * - Protected + blocked things are surfaced as "must not touch", never acted on.
 *
 * Pure functions. No side effects.
 *
 * Doctrine: v0_memories/user/earth-os.md, dcc-network.md
 */

import {
  PROMOTION_QUEUE,
  sortedQueue,
  queueSummary,
  isActionable,
  promotionStateLabel,
  resolveSatellite,
  type PromotionQueueItem,
} from "@/lib/dcc/earthos/promotionQueue"
import {
  eligiblePressKits,
  pressSummary,
  type PressKit,
} from "@/lib/dcc/earthos/printingPress"
import {
  OUTREACH_LOG,
  outreachSummary,
  outreachStatusLabel,
  outreachReadinessMismatch,
  resolveOutreachSite,
  type OutreachItem,
} from "@/lib/dcc/earthos/outreachLog"
import { MOCK_OPPORTUNITIES, type Opportunity } from "@/lib/dcc/earthos/mockOpportunities"

/** A single line item inside a brief section. */
export type BriefLine = {
  /** Short label / subject of the line. */
  label: string
  /** The detail / reasoning / next move. */
  detail: string
  /** Optional reference (route, site, contact) for traceability. */
  reference?: string
}

export type BriefTone = "action" | "blocked" | "draft" | "info" | "protected"

export type BriefSectionData = {
  id: string
  title: string
  /** One-line description of what this section answers. */
  summary: string
  tone: BriefTone
  lines: BriefLine[]
  /** Shown when there is genuinely nothing to report in this section. */
  emptyNote?: string
}

export type RankedAction = {
  rank: number
  action: string
  why: string
  owner: string
  reference?: string
}

export type DailyBrief = {
  /** ISO date the brief represents (static "today" for the preview). */
  date: string
  /** Human-friendly date label. */
  dateLabel: string
  /** The single headline sentence. */
  headline: string
  /** Coarse counts used in the headline + summary band. */
  metrics: {
    promotable: number
    pressKits: number
    outreachReady: number
    criticalBlockers: number
    opportunities: number
  }
  sections: BriefSectionData[]
  recommendedActions: RankedAction[]
}

/** Static "today" for the preview. A real cron would use the run date. */
const BRIEF_DATE = "2026-06-01"

function dateLabel(iso: string): string {
  return new Date(`${iso}T08:00:00-05:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function siteLabel(item: PromotionQueueItem): string {
  return item.label ?? resolveSatellite(item)?.name ?? item.id
}

/* -------------------------------------------------------------------------- */
/* Section builders                                                            */
/* -------------------------------------------------------------------------- */

/** 2. Ready to act — actionable queue items, readiest first. */
function buildReadyToAct(): BriefSectionData {
  const ready = sortedQueue(PROMOTION_QUEUE).filter(isActionable)
  return {
    id: "ready-to-act",
    title: "Ready to act",
    summary: "Routes clear of hard blockers, ordered by readiness.",
    tone: "action",
    lines: ready.map((item) => ({
      label: siteLabel(item),
      detail: item.nextAction,
      reference: `${promotionStateLabel(item.state)} · ${item.owner}${item.route ? ` · ${item.route}` : ""}`,
    })),
    emptyNote: "Nothing is clear to act on today.",
  }
}

/** 3. Blocked / do not touch — blocked + in-progress queue items. */
function buildBlocked(): BriefSectionData {
  const blocked = PROMOTION_QUEUE.filter((i) => !isActionable(i))
  return {
    id: "blocked",
    title: "Blocked / do not touch",
    summary: "Hard blockers and unfinished work — resolve the blocker before promoting.",
    tone: "blocked",
    lines: blocked.map((item) => ({
      label: siteLabel(item),
      detail: `${item.why} → ${item.nextAction}`,
      reference: `${promotionStateLabel(item.state)} · ${item.owner}`,
    })),
    emptyNote: "No blocked routes today.",
  }
}

/** 4. Drafted assets — eligible press kits and which assets exist. */
function buildDraftedAssets(kits: PressKit[]): BriefSectionData {
  return {
    id: "drafted-assets",
    title: "Drafted assets",
    summary: "Press kits drafted by Printing Press Lite (drafts for human review only).",
    tone: "draft",
    lines: kits.map((kit) => {
      const ready = kit.assets.filter((a) => !a.needsInput).map((a) => a.label)
      const needs = kit.assets.filter((a) => a.needsInput).map((a) => a.label)
      const detail =
        `Drafted: ${ready.length ? ready.join(", ") : "none"}.` +
        (needs.length ? ` Needs input: ${needs.join(", ")}.` : "")
      return { label: kit.label, detail, reference: kit.route ? `${kit.state} · ${kit.route}` : kit.state }
    }),
    emptyNote: "No press kits are eligible to draft yet.",
  }
}

/** 5. Outreach follow-up — grouped status read of the outreach log. */
function buildOutreachFollowUp(): BriefSectionData {
  // Surface ready/in-flight first, then drafts, then blocked — the order a human works.
  const order: OutreachItem["status"][] = [
    "ready_to_send",
    "follow_up_needed",
    "replied",
    "sent",
    "draft",
    "blocked",
    "closed",
  ]
  const sorted = [...OUTREACH_LOG].sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status),
  )
  return {
    id: "outreach-follow-up",
    title: "Outreach follow-up",
    summary: "Manual outreach items: what is ready to send, drafted, or blocked.",
    tone: "info",
    lines: sorted.map((item) => {
      const site = resolveOutreachSite(item)
      const mismatch = outreachReadinessMismatch(item)
      const follow = item.nextFollowUp ? ` · follow-up: ${item.nextFollowUp}` : ""
      return {
        label: `${item.organization} (${outreachStatusLabel(item.status)})`,
        detail: `${item.nextAction}${mismatch ? ` ⚠ ${mismatch}` : ""}`,
        reference: `${site?.name ?? item.relatedSiteId ?? "—"}${follow}`,
      }
    }),
    emptyNote: "No outreach on record.",
  }
}

/** 6. Next-48-hours opportunities — mock/live opportunity snapshot. */
function buildOpportunities(): BriefSectionData {
  const next48 = MOCK_OPPORTUNITIES.filter((o) => o.timeBucket === "next-48-hours")
  const live = MOCK_OPPORTUNITIES.filter((o: Opportunity) => o.live).length
  const byRegion = next48.reduce<Record<string, number>>((acc, o) => {
    acc[o.region] = (acc[o.region] ?? 0) + 1
    return acc
  }, {})
  const regionLine = Object.entries(byRegion)
    .map(([r, n]) => `${r}: ${n}`)
    .join(", ")
  return {
    id: "opportunities",
    title: "Next-48-hours opportunities",
    summary: "Place + time decision opportunities on the internal board.",
    tone: "info",
    lines: [
      {
        label: `${next48.length} in the next 48 hours`,
        detail: regionLine || "No regions represented.",
        reference: "/internal/earthos/next-48-hours",
      },
      {
        label: "Source status",
        detail:
          live > 0
            ? `${live} live row(s) from a provider feed; the rest are mock.`
            : "All rows are mock/prototype — no provider adapter is live in this environment (SeatGeek client id is Production-only).",
        reference: `${MOCK_OPPORTUNITIES.length} total board rows`,
      },
    ],
  }
}

/** 7. Must-not-touch — explicit protected areas pulled from real data. */
function buildMustNotTouch(): BriefSectionData {
  const lines: BriefLine[] = []

  // Protected proven execution (PARR) from the board.
  const protectedRows = MOCK_OPPORTUNITIES.filter((o) => o.protected)
  for (const row of protectedRows) {
    lines.push({
      label: `${row.satelliteName} — protected`,
      detail: row.note ?? "Protected proven execution. Do not touch checkout / payment / admin.",
      reference: row.satelliteId,
    })
  }

  // Blocked queue items become explicit "do not touch yet" guardrails.
  for (const item of PROMOTION_QUEUE.filter((i) => i.state === "blocked")) {
    lines.push({
      label: `${siteLabel(item)} — blocked`,
      detail: item.blockedActions.join("; ") || item.why,
      reference: promotionStateLabel(item.state),
    })
  }

  // Standing doctrine guardrails that are always true.
  lines.push({
    label: "Unverified schema claims",
    detail:
      "Never publish structured data the page cannot back up (price, availability, return-to-ship). Honest-schema rule.",
    reference: "doctrine",
  })
  lines.push({
    label: "Automated sending / publishing",
    detail: "No auto-send, auto-post, or auto-publish. Every outbound action stays human-reviewed.",
    reference: "doctrine",
  })

  return {
    id: "must-not-touch",
    title: "Must-not-touch",
    summary: "Protected and frozen areas — explicitly off-limits until conditions change.",
    tone: "protected",
    lines,
  }
}

/* -------------------------------------------------------------------------- */
/* Recommended actions                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Rank the next best actions. Derived from real state, not invented:
 * promotable + ready_to_send outreach rank highest, then publish-ready, then
 * the blockers whose resolution unblocks the most downstream work.
 */
function buildRecommendedActions(): RankedAction[] {
  const actions: Omit<RankedAction, "rank">[] = []

  // Promotable site with a ready_to_send outreach item → highest leverage.
  const readyOutreach = OUTREACH_LOG.filter((o) => o.status === "ready_to_send")
  for (const o of readyOutreach) {
    actions.push({
      action: `Send / review: ${o.organization}`,
      why: o.why,
      owner: "Earth OS",
      reference: resolveOutreachSite(o)?.name ?? o.relatedSiteId,
    })
  }

  // Ready-to-publish routes → publish.
  for (const item of PROMOTION_QUEUE.filter((i) => i.state === "ready_to_publish")) {
    actions.push({
      action: `Publish: ${siteLabel(item)}`,
      why: item.why,
      owner: item.owner,
      reference: item.route,
    })
  }

  // Needs-visual-polish routes → polish before publish.
  for (const item of PROMOTION_QUEUE.filter((i) => i.state === "needs_visual_polish")) {
    actions.push({
      action: `Polish then publish: ${siteLabel(item)}`,
      why: item.nextAction,
      owner: item.owner,
      reference: item.route,
    })
  }

  // Blockers whose resolution unblocks downstream work.
  for (const item of PROMOTION_QUEUE.filter((i) => i.state === "blocked")) {
    actions.push({
      action: `Unblock: ${siteLabel(item)}`,
      why: item.nextAction,
      owner: item.owner,
      reference: promotionStateLabel(item.state),
    })
  }

  return actions.slice(0, 5).map((a, i) => ({ rank: i + 1, ...a }))
}

/* -------------------------------------------------------------------------- */
/* Public entry point                                                          */
/* -------------------------------------------------------------------------- */

/** Build the full daily brief. Pure — safe to call from a Server Component. */
export function buildDailyBrief(): DailyBrief {
  const queue = queueSummary()
  const press = pressSummary()
  const outreach = outreachSummary()
  const kits = eligiblePressKits()
  const next48 = MOCK_OPPORTUNITIES.filter((o) => o.timeBucket === "next-48-hours").length

  const metrics = {
    promotable: queue.promotable,
    pressKits: press.eligible,
    outreachReady: outreach.readyToSend,
    criticalBlockers: queue.blocked,
    opportunities: next48,
  }

  const headline =
    `${metrics.promotable} site${metrics.promotable === 1 ? "" : "s"} promotable, ` +
    `${metrics.pressKits} press kit${metrics.pressKits === 1 ? "" : "s"} drafted, ` +
    `${metrics.outreachReady} outreach item${metrics.outreachReady === 1 ? "" : "s"} ready, ` +
    `${metrics.criticalBlockers} critical blocker${metrics.criticalBlockers === 1 ? "" : "s"}.`

  return {
    date: BRIEF_DATE,
    dateLabel: dateLabel(BRIEF_DATE),
    headline,
    metrics,
    sections: [
      buildReadyToAct(),
      buildBlocked(),
      buildDraftedAssets(kits),
      buildOutreachFollowUp(),
      buildOpportunities(),
      buildMustNotTouch(),
    ],
    recommendedActions: buildRecommendedActions(),
  }
}
