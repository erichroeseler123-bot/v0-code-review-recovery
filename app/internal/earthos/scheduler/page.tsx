/**
 * Earth OS Scheduler Contract (Phase 11).
 *
 * INTERNAL ONLY. noindex/nofollow/nocache. Not linked from any public nav.
 *
 * This page DEFINES what future cron jobs are allowed to do, forbidden to do,
 * and what they would run in dry-run mode. It is automation POLICY written
 * BEFORE any automation. It is NOT a cron: nothing here is scheduled, sent,
 * published, or written to a database.
 */

import type { Metadata } from "next"
import { ArrowRight, Ban, Check, Clock, FileSearch, ShieldQuestion } from "lucide-react"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import {
  buildDryRunPreview,
  schedulerSummary,
  type JobDryRun,
} from "@/lib/dcc/earthos/schedulerContract"
import { SchedulerCard } from "./components/scheduler-card"

export const metadata: Metadata = {
  title: "Earth OS — Scheduler Contract (dry-run only)",
  description: "Internal definition of what future cron jobs may and may not do. Not a live cron.",
  robots: { index: false, follow: false, nocache: true },
}

export default function SchedulerPage() {
  const preview = buildDryRunPreview()
  const summary = schedulerSummary()

  const metricCards: { label: string; value: number }[] = [
    { label: "Jobs defined", value: summary.jobs },
    { label: "Would run", value: summary.wouldRun },
    { label: "Needs review", value: summary.requiresReview },
    { label: "Would not run", value: summary.wouldNotRun },
  ]

  const buckets: {
    key: string
    title: string
    description: string
    Icon: typeof Clock
    accent: string
    runs: JobDryRun[]
  }[] = [
    {
      key: "would-run",
      title: "Would run today",
      description: "Safe, read-only jobs that always have state to summarize.",
      Icon: Clock,
      accent: "text-primary",
      runs: preview.wouldRun,
    },
    {
      key: "needs-review",
      title: "Requires human review",
      description: "Jobs that could produce drafts/worklists, but a human must approve any outbound effect.",
      Icon: ShieldQuestion,
      accent: "text-secondary-foreground",
      runs: preview.requiresReview,
    },
    {
      key: "would-not-run",
      title: "Would not run",
      description: "Nothing eligible today, or gated until a policy/key exists.",
      Icon: FileSearch,
      accent: "text-muted-foreground",
      runs: preview.wouldNotRun,
    },
  ]

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
          INTERNAL · NOINDEX · DRY-RUN ONLY
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Automation policy — no cron exists yet
        </span>
      </div>

      <DecisionHero
        eyebrow="Earth OS · Scheduler Contract"
        title="What a future cron is allowed to do — before it exists"
        description="Six scheduled jobs are defined here as policy: their cadence, the most they may ever do, what they are permanently forbidden from doing, and whether they would even fire today. Automation contract first, automation later."
      />

      {/* Metrics band */}
      <section
        aria-label="Scheduler summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {metricCards.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 text-card-foreground">
            <div className="text-2xl font-bold tabular-nums text-foreground">{m.value}</div>
            <div className="mt-1 text-xs font-medium text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </section>

      <DecisionExplanation
        title="What this contract is (and is not)"
        reasons={[
          "A definition of every future cron job: cadence, execution mode, safety level, allowed reads/writes, forbidden actions, output, and escalation trigger.",
          "A dry-run preview that reads today's real Earth OS state and says whether each job would fire, do nothing, or need a human.",
          `It currently tracks ${summary.queueTracked} queue routes, ${summary.pressEligible} eligible press kit(s), and ${summary.outreachOpen} outreach item(s).`,
        ]}
        watchOutFor={[
          "This is NOT a cron. Nothing runs on a schedule, sends, publishes, calls an API, or writes to a database.",
          "Every job inherits a universal forbidden list — no auto-send, no auto-publish, no touching PARR checkout/admin/payment.",
        ]}
        nextStep="Approve the contract, then wire ONE safe read-only job (daily brief snapshot) behind a reviewer before anything else."
      />

      {/* Global allowed / forbidden */}
      <section aria-label="Global guarantees" className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Check className="size-4 text-primary" aria-hidden="true" />
            A future cron WOULD be allowed to
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {preview.allowedSummary.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-destructive">
            <Ban className="size-4" aria-hidden="true" />
            A future cron is FORBIDDEN from
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {preview.forbiddenSummary.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-destructive">
                <Ban className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Dry-run preview buckets */}
      <section aria-label="Dry-run preview" className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dry-run preview — today</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {buckets.map((bucket) => (
            <div key={bucket.key} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
              <h3 className={`flex items-center gap-2 text-sm font-semibold ${bucket.accent}`}>
                <bucket.Icon className="size-4" aria-hidden="true" />
                {bucket.title}
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                  {bucket.runs.length}
                </span>
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{bucket.description}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {bucket.runs.length > 0 ? (
                  bucket.runs.map((r) => (
                    <li key={r.job.id} className="text-sm font-medium text-foreground">
                      {r.job.name}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">None</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Full job contracts */}
      <section aria-label="Job contracts" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Job contracts</h2>
        {[...preview.wouldRun, ...preview.requiresReview, ...preview.wouldNotRun].map((r) => (
          <SchedulerCard key={r.job.id} job={r.job} disposition={r.disposition} reason={r.reason} />
        ))}
      </section>

      {/* Future-cron note */}
      <section className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <span className="font-medium text-foreground">When automation is finally wired</span>, it must implement
          exactly this contract: start with the safe read-only daily-brief snapshot, keep every outbound action
          reviewer-gated, and let the protected-surface guard veto any change that touches PARR. No job graduates past
          its declared mode without an explicit human decision.
        </p>
      </section>

      <DccNetworkBadge variant="authority" satelliteName="Earth OS — Scheduler Contract" />
    </main>
  )
}
