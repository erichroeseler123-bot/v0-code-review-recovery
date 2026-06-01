/**
 * PromotionCard — one row of the Earth OS Promotion Queue.
 *
 * Presentational only. Reads a PromotionQueueItem (+ its resolved registry
 * record) and lays out: state, why, next action, blocked actions, media +
 * outreach angles, telemetry needed, and owner layer. Protected/separate sites
 * surface their protection rule prominently.
 */

import { ArrowRight, Ban, Megaphone, Mail, Activity, ShieldAlert } from "lucide-react"
import {
  type PromotionQueueItem,
  type PromotionState,
  promotionStateLabel,
  resolveSatellite,
} from "@/lib/dcc/earthos/promotionQueue"

/** Tailwind tone per state — green-ish (primary) for ready, muted for in-progress, destructive for blocked. */
function stateClasses(state: PromotionState): string {
  switch (state) {
    case "promotable":
    case "ready_to_publish":
      return "bg-primary text-primary-foreground"
    case "pr_ready":
      return "bg-accent text-accent-foreground"
    case "needs_visual_polish":
    case "in_progress":
      return "bg-secondary text-secondary-foreground"
    case "blocked":
      return "border border-destructive bg-background text-destructive"
  }
}

export function PromotionCard({ item }: { item: PromotionQueueItem }) {
  const satellite = resolveSatellite(item)
  const name = item.label ?? satellite?.name ?? item.id
  const isProtected = satellite?.role === "protected_execution"
  const isSeparate = satellite?.role === "separate"

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{name}</h3>
          {item.route && (
            <code className="w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {item.route}
            </code>
          )}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stateClasses(item.state)}`}>
          {promotionStateLabel(item.state)}
        </span>
      </header>

      {(isProtected || isSeparate) && satellite?.protection && (
        <p className="flex items-start gap-2 rounded-md border border-destructive bg-background px-3 py-2 text-xs font-medium text-destructive">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{satellite.protection}</span>
        </p>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why</span>
        <p className="text-sm leading-relaxed text-foreground">{item.why}</p>
      </div>

      <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next action</span>
          <p className="text-sm font-medium leading-relaxed text-foreground">{item.nextAction}</p>
        </div>
      </div>

      {item.blockedActions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Blocked actions
          </span>
          <ul className="flex flex-col gap-1.5">
            {item.blockedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <Ban className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(item.mediaAngle || item.outreachAngle) && (
        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          {item.mediaAngle && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Megaphone className="size-3.5" aria-hidden="true" />
                Media angle
              </span>
              <p className="text-sm leading-relaxed text-foreground">{item.mediaAngle}</p>
            </div>
          )}
          {item.outreachAngle && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Mail className="size-3.5" aria-hidden="true" />
                Outreach angle
              </span>
              <p className="text-sm leading-relaxed text-foreground">{item.outreachAngle}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Activity className="size-3.5" aria-hidden="true" />
            Telemetry needed
          </span>
          {item.telemetryNeeded.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.telemetryNeeded.map((event) => (
                <code
                  key={event}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {event}
                </code>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">None (code/process item)</span>
          )}
        </div>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Owner: {item.owner}
        </span>
      </div>
    </article>
  )
}
