/**
 * Earth OS Scheduler Contract (Phase 11).
 *
 * This module defines WHAT future cron jobs are ALLOWED to do, what they are
 * FORBIDDEN to do, and what they WOULD run in dry-run mode. It is automation
 * POLICY written BEFORE any automation exists.
 *
 * HARD RULES (doctrine + Phase 11 brief):
 * - This is NOT a cron. Nothing here is scheduled, queued, or executed.
 * - No email/Gmail, no publishing, no external API calls, no database, no deploy.
 * - No job may auto-send, auto-publish, auto-promote, or touch protected
 *   execution (PARR checkout / admin / payment). Every outbound action is
 *   reviewer-gated.
 * - The contract describes intent only. It reads the existing Earth OS modules
 *   purely to PREVIEW what each job would have to work with today.
 *
 * Pure functions. No side effects.
 *
 * Doctrine: v0_memories/user/earth-os.md, dcc-network.md
 */

import {
  PROMOTION_QUEUE,
  queueSummary,
  isActionable,
  type OwnerLayer,
} from "@/lib/dcc/earthos/promotionQueue"
import { eligiblePressKits, pressSummary } from "@/lib/dcc/earthos/printingPress"
import { OUTREACH_LOG, outreachSummary } from "@/lib/dcc/earthos/outreachLog"
import { MOCK_OPPORTUNITIES } from "@/lib/dcc/earthos/mockOpportunities"

/**
 * How often a job is intended to run. Descriptive only — no timer is created.
 */
export type JobCadence = "hourly" | "daily" | "weekly" | "on_demand"

/**
 * The execution posture a job is permitted. None of these mean "runs now" —
 * they describe the *most* a future cron would ever be allowed to do.
 * - dry_run_only: may only compute + preview; never writes or sends.
 * - reviewer_required: may produce an artifact, but a human must approve any
 *   outbound effect before it happens.
 * - future_automated_read_only: may run unattended LATER, but only to read +
 *   summarize; still never sends, publishes, or mutates protected surfaces.
 */
export type JobMode = "dry_run_only" | "reviewer_required" | "future_automated_read_only"

/**
 * Safety level — how much damage a mistake in this job could do. Drives how
 * conservatively it must be gated.
 */
export type JobSafetyLevel = "safe_read_only" | "guarded_write" | "high_risk_blocked"

/** Whether this job WOULD fire today, and why / why not. */
export type DryRunDisposition = "would_run" | "would_not_run" | "requires_human_review"

export type ScheduledJob = {
  id: string
  name: string
  /** One-line description of the job's purpose. */
  purpose: string
  cadence: JobCadence
  mode: JobMode
  safety: JobSafetyLevel
  /** Data sources the job is permitted to READ. */
  allowedReads: string[]
  /** Artifacts the job is permitted to WRITE (drafts/snapshots only). */
  allowedWrites: string[]
  /** Hard-forbidden actions. These never become allowed. */
  forbiddenActions: string[]
  /** The single artifact this job produces. */
  outputArtifact: string
  /** What would force a human into the loop. */
  escalationTrigger: string
  /** Which Earth OS layer owns the job. */
  owner: OwnerLayer
  /**
   * Live preview: given today's recorded state, would this job have work to do?
   * Pure — reads existing modules, computes a disposition + reason. Never acts.
   */
  preview: () => { disposition: DryRunDisposition; reason: string }
}

/* -------------------------------------------------------------------------- */
/* Shared forbidden baseline — every job inherits these.                       */
/* -------------------------------------------------------------------------- */

const UNIVERSAL_FORBIDDEN: string[] = [
  "Send email or message anyone",
  "Publish or unpublish any public route",
  "Auto-promote a blocked route",
  "Modify PARR checkout, admin, or payment",
  "Call an external API without a wired, reviewed adapter",
  "Write to a database",
  "Deploy",
]

/** Compose a job's forbidden list on top of the universal baseline (deduped). */
function withUniversalForbidden(specific: string[]): string[] {
  return Array.from(new Set([...specific, ...UNIVERSAL_FORBIDDEN]))
}

/* -------------------------------------------------------------------------- */
/* Job definitions                                                             */
/* -------------------------------------------------------------------------- */

export const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    id: "daily_brief_snapshot",
    name: "Daily Brief Snapshot",
    purpose: "Roll up the whole Earth OS state into one reviewer-facing brief each morning.",
    cadence: "daily",
    mode: "future_automated_read_only",
    safety: "safe_read_only",
    allowedReads: [
      "Promotion Queue",
      "Printing Press drafts",
      "Outreach Log",
      "Next-48-hours opportunity board",
      "Route records",
    ],
    allowedWrites: ["A dated, read-only daily-brief snapshot for review"],
    forbiddenActions: withUniversalForbidden([
      "Contact anyone named in the brief",
      "Act on any recommended action automatically",
    ]),
    outputArtifact: "Dated daily brief (reviewer-facing)",
    escalationTrigger: "A new critical blocker appears, or a promotable site has no owner action.",
    owner: "Earth OS",
    preview: () => ({
      disposition: "would_run",
      reason: "Read-only summary always has state to roll up; safe to run unattended.",
    }),
  },
  {
    id: "promotion_queue_audit",
    name: "Promotion Queue Audit",
    purpose: "Re-classify route readiness and flag blockers without ever promoting.",
    cadence: "daily",
    mode: "future_automated_read_only",
    safety: "safe_read_only",
    allowedReads: ["Route records", "Promotion Queue", "Satellite registry"],
    allowedWrites: ["Updated readiness classification + blocker flags (internal only)"],
    forbiddenActions: withUniversalForbidden([
      "Auto-promote blocked routes",
      "Change a route's state without human confirmation of the underlying fix",
    ]),
    outputArtifact: "Readiness classification report",
    escalationTrigger: "A route flips from actionable to blocked, or a blocker has aged past threshold.",
    owner: "Earth OS",
    preview: () => {
      const blocked = PROMOTION_QUEUE.filter((i) => !isActionable(i)).length
      return {
        disposition: "would_run",
        reason: `Would re-audit ${PROMOTION_QUEUE.length} routes and flag ${blocked} blocked/unfinished.`,
      }
    },
  },
  {
    id: "printing_press_refresh",
    name: "Printing Press Refresh",
    purpose: "Regenerate draft copy for promotable / ready-to-publish routes only.",
    cadence: "weekly",
    mode: "reviewer_required",
    safety: "guarded_write",
    allowedReads: ["Promotion Queue (eligible items only)", "Satellite registry"],
    allowedWrites: ["Refreshed DRAFT press kits (SEO title, meta, social, pitch, partner blurb)"],
    forbiddenActions: withUniversalForbidden([
      "Post to social or email media",
      "Invent facts (price, availability, claims)",
      "Generate copy for blocked or in-progress routes",
    ]),
    outputArtifact: "Refreshed draft press kits for review",
    escalationTrigger: "A draft contains a NEEDS INPUT placeholder that a human must fill.",
    owner: "Earth OS",
    preview: () => {
      const eligible = eligiblePressKits().length
      return eligible > 0
        ? {
            disposition: "requires_human_review",
            reason: `${eligible} eligible kit(s) could be refreshed, but drafts must be human-reviewed before any use.`,
          }
        : { disposition: "would_not_run", reason: "No promotable/ready routes — nothing eligible to draft." }
    },
  },
  {
    id: "outreach_followup_check",
    name: "Outreach Follow-up Check",
    purpose: "Surface follow-up due dates and ready-to-send items — never send.",
    cadence: "daily",
    mode: "reviewer_required",
    safety: "guarded_write",
    allowedReads: ["Outreach Log", "Promotion Queue (readiness cross-check)"],
    allowedWrites: ["A follow-up worklist (due dates + ready_to_send items) for review"],
    forbiddenActions: withUniversalForbidden([
      "Send emails or contact people automatically",
      "Mark an item as sent without a human action",
    ]),
    outputArtifact: "Outreach follow-up worklist",
    escalationTrigger: "A ready_to_send item, or a follow-up date is due/overdue.",
    owner: "Earth OS",
    preview: () => {
      const summary = outreachSummary()
      const due = summary.readyToSend + summary.inFlight
      return due > 0
        ? {
            disposition: "requires_human_review",
            reason: `${summary.readyToSend} ready-to-send + ${summary.inFlight} in-flight — all require a human to actually send.`,
          }
        : { disposition: "would_not_run", reason: "Nothing ready or due in the outreach log today." }
    },
  },
  {
    id: "next_48_hours_refresh",
    name: "Next-48-Hours Refresh",
    purpose: "Refresh opportunity records when provider adapters are wired and keyed.",
    cadence: "hourly",
    mode: "dry_run_only",
    safety: "guarded_write",
    allowedReads: ["Opportunity board", "Wired + keyed provider adapters (SeatGeek, etc.)"],
    allowedWrites: ["Refreshed internal opportunity records (labeled live vs mock)"],
    forbiddenActions: withUniversalForbidden([
      "Publish public recommendations without a route-health + telemetry policy",
      "Present mock rows as live",
    ]),
    outputArtifact: "Refreshed internal opportunity board",
    escalationTrigger: "A provider key becomes available, or a live feed starts/stops.",
    owner: "Earth OS",
    preview: () => {
      const live = MOCK_OPPORTUNITIES.filter((o) => o.live).length
      return {
        disposition: "would_not_run",
        reason:
          live > 0
            ? `${live} live row(s) present, but refresh stays dry-run until a route-health policy gates publication.`
            : "No provider adapter is live in this environment (SeatGeek client id is Production-only) — dry-run only.",
      }
    },
  },
  {
    id: "protected_surface_guard",
    name: "Protected Surface Guard",
    purpose: "Warn if PARR / protected files appear in any planned change set.",
    cadence: "daily",
    mode: "future_automated_read_only",
    safety: "safe_read_only",
    allowedReads: ["Planned change sets", "Satellite registry (protected flags)", "Opportunity board (protected rows)"],
    allowedWrites: ["A warning report when a protected surface is touched"],
    forbiddenActions: withUniversalForbidden([
      "Modify protected files",
      "Silence or auto-resolve its own warning",
    ]),
    outputArtifact: "Protected-surface warning report",
    escalationTrigger: "Any planned change references a protected (PARR) file or route.",
    owner: "DCC",
    preview: () => {
      const protectedRows = MOCK_OPPORTUNITIES.filter((o) => o.protected).length
      return {
        disposition: "would_run",
        reason: `Always-on guard. ${protectedRows} protected surface(s) tracked; warns the moment one is touched.`,
      }
    },
  },
]

/* -------------------------------------------------------------------------- */
/* Labels                                                                      */
/* -------------------------------------------------------------------------- */

export const cadenceLabel: Record<JobCadence, string> = {
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  on_demand: "On demand",
}

export const modeLabel: Record<JobMode, string> = {
  dry_run_only: "Dry-run only",
  reviewer_required: "Reviewer required",
  future_automated_read_only: "Future automated (read-only)",
}

export const safetyLabel: Record<JobSafetyLevel, string> = {
  safe_read_only: "Safe — read only",
  guarded_write: "Guarded — draft writes",
  high_risk_blocked: "High risk — blocked",
}

export const dispositionLabel: Record<DryRunDisposition, string> = {
  would_run: "Would run today",
  would_not_run: "Would not run",
  requires_human_review: "Requires human review",
}

/* -------------------------------------------------------------------------- */
/* Dry-run preview                                                             */
/* -------------------------------------------------------------------------- */

export type JobDryRun = {
  job: ScheduledJob
  disposition: DryRunDisposition
  reason: string
}

export type DryRunPreview = {
  wouldRun: JobDryRun[]
  requiresReview: JobDryRun[]
  wouldNotRun: JobDryRun[]
  /** Plain-language statement of the global guarantees. */
  allowedSummary: string[]
  forbiddenSummary: string[]
}

/** Compute today's dry-run disposition for every job. Pure — never acts. */
export function buildDryRunPreview(): DryRunPreview {
  const runs: JobDryRun[] = SCHEDULED_JOBS.map((job) => {
    const { disposition, reason } = job.preview()
    return { job, disposition, reason }
  })

  return {
    wouldRun: runs.filter((r) => r.disposition === "would_run"),
    requiresReview: runs.filter((r) => r.disposition === "requires_human_review"),
    wouldNotRun: runs.filter((r) => r.disposition === "would_not_run"),
    allowedSummary: [
      "Read existing Earth OS records (queue, press, outreach, opportunities, routes).",
      "Generate dated, reviewer-facing snapshots and draft artifacts.",
      "Flag blockers, due follow-ups, and protected-surface touches for a human.",
    ],
    forbiddenSummary: UNIVERSAL_FORBIDDEN,
  }
}

/** Counts used by the summary band. */
export function schedulerSummary() {
  const preview = buildDryRunPreview()
  return {
    jobs: SCHEDULED_JOBS.length,
    wouldRun: preview.wouldRun.length,
    requiresReview: preview.requiresReview.length,
    wouldNotRun: preview.wouldNotRun.length,
    // Cross-references so the contract visibly tracks real state.
    queueTracked: queueSummary().total,
    pressEligible: pressSummary().eligible,
    outreachOpen: outreachSummary().total,
  }
}
