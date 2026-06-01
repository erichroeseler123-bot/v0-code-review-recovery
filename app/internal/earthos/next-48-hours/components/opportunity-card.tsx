/**
 * OpportunityCard — one place-and-time decision on the next-48-hours board.
 *
 * Presentational. Composes the Phase 3 trust components (FitNotFitCards,
 * DecisionExplanation) with the Phase 4 TrackedHandoffLink so each mock row is
 * a real decision surface: place + time + intent + why + verify + tracked action.
 */

import { MapPin, Clock, Database, ShieldCheck } from "lucide-react"
import { FitNotFitCards } from "@/components/dcc/fit-not-fit-cards"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { TrackedHandoffLink } from "@/components/dcc/tracked-handoff-link"
import type { Opportunity } from "@/lib/dcc/earthos/mockOpportunities"

const SOURCE_ROUTE = "/internal/earthos/next-48-hours"

function formatWindow(startsAt?: string, endsAt?: string): string {
  if (!startsAt) return "Time TBD"
  const start = new Date(startsAt)
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }
  const startStr = start.toLocaleString("en-US", opts)
  if (!endsAt) return startStr
  const end = new Date(endsAt)
  const endStr = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return `${startStr} – ${endStr}`
}

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const o = opportunity

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            {o.category}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {o.intent}
          </span>
          {o.live ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              <span className="size-1.5 rounded-full bg-primary-foreground" aria-hidden="true" />
              LIVE
            </span>
          ) : (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              MOCK
            </span>
          )}
          {o.protected && (
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="size-3" aria-hidden="true" />
              protected
            </span>
          )}
        </div>

        <h3 className="text-balance text-lg font-semibold leading-snug tracking-tight text-foreground">
          {o.title}
        </h3>

        <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Location</dt>
            <dd>{o.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Time window</dt>
            <dd>{formatWindow(o.timeWindow.startsAt, o.timeWindow.endsAt)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Database className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Data source</dt>
            <dd>{o.sourceLabel}</dd>
          </div>
        </dl>
      </header>

      <DecisionExplanation reasons={o.whyThisFits} watchOutFor={o.whatToVerify} />

      <FitNotFitCards bestFor={o.bestFor} notFor={o.whatToVerify} />

      <footer className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Satellite:</span>
          <span>{o.satelliteName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-foreground">Corridor:</span>
          <span className="font-mono">{o.corridorId}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {o.action ? (
            <TrackedHandoffLink
              href={o.action.href}
              label={o.action.label}
              sourceRoute={SOURCE_ROUTE}
              satelliteId={o.satelliteId}
              corridorId={o.corridorId}
              destinationType={o.action.destinationType}
              operatorName={o.action.operatorName}
              intent={o.intent}
            />
          ) : (
            <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
              Reference only — no handoff
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            emits <code className="font-mono text-foreground">{o.expectedEvent}</code>
          </span>
        </div>

        {o.note && <p className="text-xs leading-relaxed text-muted-foreground">{o.note}</p>}
      </footer>
    </article>
  )
}
