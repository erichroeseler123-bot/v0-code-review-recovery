/**
 * SchedulerCard — renders one job from the Earth OS Scheduler Contract.
 *
 * Presentational only. Shows the full contract for a single future cron job:
 * cadence, mode, safety, allowed reads/writes, forbidden actions, output,
 * escalation, owner, and today's dry-run disposition.
 */

import { ArrowRight, Ban, Check, Clock, ShieldCheck } from "lucide-react"
import {
  cadenceLabel,
  modeLabel,
  safetyLabel,
  dispositionLabel,
  type ScheduledJob,
  type DryRunDisposition,
  type JobSafetyLevel,
} from "@/lib/dcc/earthos/schedulerContract"

const DISPOSITION_STYLES: Record<DryRunDisposition, string> = {
  would_run: "bg-primary/10 text-primary",
  requires_human_review: "bg-secondary text-secondary-foreground",
  would_not_run: "bg-muted text-muted-foreground",
}

const SAFETY_STYLES: Record<JobSafetyLevel, string> = {
  safe_read_only: "bg-primary/10 text-primary",
  guarded_write: "bg-secondary text-secondary-foreground",
  high_risk_blocked: "bg-destructive/10 text-destructive",
}

function Tag({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        className ?? "bg-muted text-muted-foreground"
      }`}
    >
      <span className="opacity-70">{label}:</span> {value}
    </span>
  )
}

export function SchedulerCard({
  job,
  disposition,
  reason,
}: {
  job: ScheduledJob
  disposition: DryRunDisposition
  reason: string
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{job.name}</h3>
          <code className="font-mono text-xs text-muted-foreground">{job.id}</code>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DISPOSITION_STYLES[disposition]}`}
        >
          <Clock className="size-3" aria-hidden="true" />
          {dispositionLabel[disposition]}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{job.purpose}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Tag label="Cadence" value={cadenceLabel[job.cadence]} />
        <Tag label="Mode" value={modeLabel[job.mode]} />
        <Tag label="Safety" value={safetyLabel[job.safety]} className={SAFETY_STYLES[job.safety]} />
        <Tag label="Owner" value={job.owner} />
      </div>

      {/* Allowed reads + writes */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            Allowed reads
          </h4>
          <ul className="mt-2 flex flex-col gap-1.5">
            {job.allowedReads.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-sm text-foreground">
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            Allowed writes
          </h4>
          <ul className="mt-2 flex flex-col gap-1.5">
            {job.allowedWrites.map((w) => (
              <li key={w} className="flex items-start gap-1.5 text-sm text-foreground">
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Forbidden actions */}
      <div className="mt-4">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive">
          <Ban className="size-3.5" aria-hidden="true" />
          Forbidden — never allowed
        </h4>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {job.forbiddenActions.map((f) => (
            <li
              key={f}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-0.5 text-xs text-destructive"
            >
              <Ban className="size-3 shrink-0" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Output + escalation + today's reason */}
      <dl className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Output artifact</dt>
          <dd className="mt-1 text-sm text-foreground">{job.outputArtifact}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Escalation trigger</dt>
          <dd className="mt-1 text-sm text-foreground">{job.escalationTrigger}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-border bg-background p-3">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Dry-run today: </span>
          {reason}
        </p>
      </div>
    </article>
  )
}
