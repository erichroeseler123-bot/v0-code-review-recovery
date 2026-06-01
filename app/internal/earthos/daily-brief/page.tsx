/**
 * Earth OS Daily Brief — Cron Preview (Phase 10).
 *
 * INTERNAL ONLY. noindex/nofollow/nocache. Not linked from any public nav.
 *
 * This page PREVIEWS what a future daily cron would summarize. It does not run
 * on a schedule, send anything, call any API, or write to a database. It is a
 * pure read-only roll-up of the Promotion Queue, Printing Press, Outreach Log,
 * route records, and the next-48-hours board.
 */

import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { buildDailyBrief } from "@/lib/dcc/earthos/dailyBrief"
import { DAILY_BRIEF_SNAPSHOT_ENDPOINT } from "@/lib/dcc/earthos/dailyBriefSnapshot"
import { BriefSection } from "./components/brief-section"

export const metadata: Metadata = {
  title: "Earth OS — Daily Brief (Cron Preview)",
  description: "Internal preview of the Earth OS daily summary. Not a live cron.",
  robots: { index: false, follow: false, nocache: true },
}

export default function DailyBriefPage() {
  const brief = buildDailyBrief()

  const metricCards: { label: string; value: number }[] = [
    { label: "Promotable", value: brief.metrics.promotable },
    { label: "Press kits", value: brief.metrics.pressKits },
    { label: "Outreach ready", value: brief.metrics.outreachReady },
    { label: "Critical blockers", value: brief.metrics.criticalBlockers },
    { label: "48h opportunities", value: brief.metrics.opportunities },
  ]

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
          INTERNAL · NOINDEX · CRON PREVIEW
        </span>
        <span className="text-xs font-medium text-muted-foreground">{brief.dateLabel}</span>
      </div>

      <DecisionHero
        eyebrow="Earth OS · Daily Brief"
        title="What Earth OS would tell you this morning"
        description={brief.headline}
      />

      {/* Metrics band */}
      <section aria-label="Today's metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metricCards.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 text-card-foreground">
            <div className="text-2xl font-bold tabular-nums text-foreground">{m.value}</div>
            <div className="mt-1 text-xs font-medium text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </section>

      <DecisionExplanation
        title="What this brief is (and is not)"
        reasons={[
          "A read-only roll-up of the Promotion Queue, Printing Press drafts, Outreach Log, route records, and the next-48-hours board.",
          "Every line traces back to real recorded state — nothing here is invented or auto-generated copy.",
          "It previews what a future daily cron would summarize, so the summary can be trusted before any automation exists.",
        ]}
        watchOutFor={[
          "This is NOT a live cron. It does not run on a schedule, send email, post, call any API, or write to a database.",
          "Protected (PARR) and blocked items appear only as 'must-not-touch' — they are never acted on automatically.",
        ]}
        nextStep="Work the ranked actions below top-down; respect every must-not-touch line."
      />

      {/* Recommended actions */}
      <section aria-label="Recommended next actions" className="rounded-xl border border-border bg-card p-6 text-card-foreground">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Recommended next actions</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ranked by leverage — derived from real promotion + outreach state, not invented.
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          {brief.recommendedActions.map((a) => (
            <li key={a.rank} className="flex gap-3 rounded-lg border border-border bg-background p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground tabular-nums">
                {a.rank}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{a.action}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {a.owner}
                    {a.reference ? ` · ${a.reference}` : ""}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Brief sections */}
      <div className="flex flex-col gap-4">
        {brief.sections.map((section) => (
          <BriefSection key={section.id} section={section} />
        ))}
      </div>

      {/* JSON endpoint reference (Phase 12) */}
      <section
        aria-label="JSON snapshot endpoint"
        className="rounded-xl border border-border bg-card p-6 text-card-foreground"
      >
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Read-only JSON snapshot</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The same brief is available as a read-only JSON artifact (scheduler job{" "}
          <span className="font-mono text-foreground">daily_brief_snapshot</span>). GET only — it computes from
          existing state and returns; it never persists, sends, calls an external API, or touches protected
          surfaces.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground">
            GET {DAILY_BRIEF_SNAPSHOT_ENDPOINT}
          </code>
          <a
            href={DAILY_BRIEF_SNAPSHOT_ENDPOINT}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Open JSON
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Future-cron note */}
      <section className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <span className="font-medium text-foreground">A future real cron</span> would build this exact brief on a
          schedule (e.g. daily at 7am), persist a dated snapshot, and deliver it to a reviewer — without ever
          auto-sending outreach, auto-publishing routes, or touching protected execution. This preview proves the
          summary is correct before any of that automation is wired.
        </p>
      </section>

      <DccNetworkBadge variant="authority" satelliteName="Earth OS — Daily Brief" />
    </main>
  )
}
