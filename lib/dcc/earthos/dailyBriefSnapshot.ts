/**
 * Earth OS — Daily Brief Snapshot (Phase 12).
 *
 * Wires EXACTLY ONE scheduler-contract job — `daily_brief_snapshot` — as a real
 * READ-ONLY artifact builder. It composes the existing Daily Brief (Phase 10)
 * and the matching job definition from the Scheduler Contract (Phase 11) into a
 * single, serializable JSON envelope a reviewer (or a future read-only cron)
 * could consume.
 *
 * HARD RULES (Phase 12 brief + doctrine):
 * - READ-ONLY. Pure function. No side effects of any kind.
 * - Does NOT persist, send, publish, deploy, call any external API, write to a
 *   database, or touch protected (PARR) surfaces.
 * - Builds the brief from lib/dcc/earthos/dailyBrief.ts — no data is invented
 *   here; every value traces back to real recorded state.
 * - Exposes no secrets, env vars, file paths, or credentials.
 *
 * Doctrine: v0_memories/user/earth-os.md, dcc-network.md
 */

import { buildDailyBrief, type DailyBrief } from "@/lib/dcc/earthos/dailyBrief"
import {
  SCHEDULED_JOBS,
  modeLabel,
  type ScheduledJob,
} from "@/lib/dcc/earthos/schedulerContract"

/** The job this handler implements. Looked up from the real contract. */
const JOB_ID = "daily_brief_snapshot" as const

/** A flattened, serializable must-not-touch line for the JSON consumer. */
export type SnapshotMustNotTouch = {
  label: string
  detail: string
  reference?: string
}

/** A trimmed, serializable view of the governing scheduler-contract job. */
export type SnapshotContractReference = {
  jobId: string
  name: string
  cadence: string
  mode: ScheduledJob["mode"]
  modeLabel: string
  safety: ScheduledJob["safety"]
  owner: ScheduledJob["owner"]
  allowedReads: string[]
  allowedWrites: string[]
  forbiddenActions: string[]
  outputArtifact: string
  escalationTrigger: string
}

export type DailyBriefSnapshot = {
  generatedAt: string
  jobId: typeof JOB_ID
  /** Posture this artifact was produced under — never an "acting" mode. */
  mode: "dry_run_only" | "reviewer_required"
  date: string
  dateLabel: string
  headline: string
  metrics: DailyBrief["metrics"]
  rankedActions: DailyBrief["recommendedActions"]
  sections: DailyBrief["sections"]
  mustNotTouch: SnapshotMustNotTouch[]
  schedulerContract: SnapshotContractReference
  safetyNotes: string[]
}

/** Find the governing job in the real Scheduler Contract. */
function getJob(): ScheduledJob {
  const job = SCHEDULED_JOBS.find((j) => j.id === JOB_ID)
  if (!job) {
    // The contract is the source of truth; if the id ever drifts, fail loudly
    // rather than silently emitting an empty contract reference.
    throw new Error(`Scheduler contract is missing job "${JOB_ID}"`)
  }
  return job
}

/**
 * Build the read-only daily-brief snapshot envelope.
 *
 * `mode` defaults to "dry_run_only" (pure preview). A reviewer-facing surface
 * may pass "reviewer_required" to label the artifact as awaiting human sign-off
 * — neither value performs any action.
 */
export function buildDailyBriefSnapshot(
  mode: DailyBriefSnapshot["mode"] = "dry_run_only",
): DailyBriefSnapshot {
  const brief = buildDailyBrief()
  const job = getJob()

  const mustNotTouchSection = brief.sections.find((s) => s.id === "must-not-touch")
  const mustNotTouch: SnapshotMustNotTouch[] = (mustNotTouchSection?.lines ?? []).map((line) => ({
    label: line.label,
    detail: line.detail,
    reference: line.reference,
  }))

  return {
    generatedAt: new Date().toISOString(),
    jobId: JOB_ID,
    mode,
    date: brief.date,
    dateLabel: brief.dateLabel,
    headline: brief.headline,
    metrics: brief.metrics,
    rankedActions: brief.recommendedActions,
    sections: brief.sections,
    mustNotTouch,
    schedulerContract: {
      jobId: job.id,
      name: job.name,
      cadence: job.cadence,
      mode: job.mode,
      modeLabel: modeLabel[job.mode],
      safety: job.safety,
      owner: job.owner,
      allowedReads: job.allowedReads,
      allowedWrites: job.allowedWrites,
      forbiddenActions: job.forbiddenActions,
      outputArtifact: job.outputArtifact,
      escalationTrigger: job.escalationTrigger,
    },
    safetyNotes: [
      "Read-only: this endpoint computes the brief from existing Earth OS records and returns it. It performs no action.",
      "Nothing is persisted — no database write, no file write, no dated snapshot is stored.",
      "Nothing is sent — no email, message, or post to anyone named in the brief.",
      "No external API is called; the brief is built purely from in-repo modules.",
      "Protected (PARR) and blocked items appear only under mustNotTouch — they are never acted on.",
      "No secrets, env vars, file paths, or credentials are exposed in this payload.",
    ],
  }
}

/** Stable public identifier for the endpoint (for on-page reference). */
export const DAILY_BRIEF_SNAPSHOT_ENDPOINT = "/api/internal/earthos/daily-brief"
