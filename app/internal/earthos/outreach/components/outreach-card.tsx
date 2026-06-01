/**
 * OutreachCard — one row of the Earth OS Outreach Log.
 *
 * Presentational only. Reads an OutreachItem (+ resolved registry/promotion
 * records) and lays out: contact + organization, goal/channel/asset, why,
 * the single next action, what must NOT be sent yet, dates, outcome, telemetry,
 * and notes. Protected/separate sites surface their protection rule.
 */

import { ArrowRight, Ban, Activity, ShieldAlert, AlertTriangle, Calendar } from "lucide-react"
import {
  type OutreachItem,
  type OutreachStatus,
  outreachStatusLabel,
  outreachGoalLabel,
  contactTypeLabel,
  outreachChannelLabel,
  messageAssetLabel,
  resolveOutreachSite,
  resolveOutreachPromotion,
  outreachReadinessMismatch,
} from "@/lib/dcc/earthos/outreachLog"

function statusClasses(status: OutreachStatus): string {
  switch (status) {
    case "ready_to_send":
      return "bg-primary text-primary-foreground"
    case "sent":
    case "replied":
      return "bg-accent text-accent-foreground"
    case "follow_up_needed":
    case "draft":
      return "bg-secondary text-secondary-foreground"
    case "blocked":
      return "border border-destructive bg-background text-destructive"
    case "closed":
      return "border border-border bg-muted text-muted-foreground"
  }
}

export function OutreachCard({ item }: { item: OutreachItem }) {
  const site = resolveOutreachSite(item)
  const promo = resolveOutreachPromotion(item)
  const mismatch = outreachReadinessMismatch(item)
  const isProtected = site?.role === "protected_execution" || site?.role === "separate"

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{item.contactName}</h3>
          <span className="text-sm text-muted-foreground">{item.organization}</span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses(item.status)}`}>
          {outreachStatusLabel(item.status)}
        </span>
      </header>

      <div className="flex flex-wrap gap-1.5">
        <Tag>{contactTypeLabel(item.contactType)}</Tag>
        <Tag>{outreachGoalLabel(item.goal)}</Tag>
        <Tag>{outreachChannelLabel(item.channel)}</Tag>
        <Tag>Asset: {messageAssetLabel(item.messageAsset)}</Tag>
        {(promo || site) && <Tag>For: {site?.name ?? promo?.label ?? item.relatedPromotionId}</Tag>}
      </div>

      {isProtected && site?.protection && (
        <p className="flex items-start gap-2 rounded-md border border-destructive bg-background px-3 py-2 text-xs font-medium text-destructive">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{site.protection}</span>
        </p>
      )}

      {mismatch && (
        <p className="flex items-start gap-2 rounded-md border border-destructive bg-background px-3 py-2 text-xs font-medium text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Readiness mismatch: {mismatch}</span>
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
            Do not send / do not do yet
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

      {(item.lastContact || item.nextFollowUp || item.outcome) && (
        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <DateField icon label="Last contact" value={item.lastContact} />
          <DateField icon label="Next follow-up" value={item.nextFollowUp} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outcome</span>
            <span className="text-sm text-foreground">{item.outcome ?? "—"}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Activity className="size-3.5" aria-hidden="true" />
            Telemetry expected
          </span>
          {item.telemetry.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.telemetry.map((event) => (
                <code key={event} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {event}
                </code>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}
        </div>
      </div>

      {item.notes && (
        <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Notes: </span>
          {item.notes}
        </p>
      )}
    </article>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{children}</span>
  )
}

function DateField({ label, value, icon }: { label: string; value?: string; icon?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon && <Calendar className="size-3.5" aria-hidden="true" />}
        {label}
      </span>
      <span className="text-sm text-foreground">{value ?? "—"}</span>
    </div>
  )
}
