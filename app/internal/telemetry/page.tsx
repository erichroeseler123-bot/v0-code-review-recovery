/**
 * DCC Internal Telemetry — Reference Dashboard.
 *
 * INTERNAL ONLY. noindex/nofollow/nocache. Not linked from any public nav.
 *
 * Production DCC /internal/telemetry currently returns a hard 404 (verified by
 * browsing the live domain). This page is a PROTOTYPE / reference implementation
 * inside the DCC/Earth OS prototype workspace so the real DCC project has a clear
 * target to port.
 *
 * STATIC + READ-ONLY. It reads the canonical event taxonomy
 * (lib/dcc/telemetry/events.ts) and the network registry
 * (lib/dcc/network/satelliteRegistry.ts), and renders hand-seeded mock events.
 * It calls no API, writes to no database, runs no cron, and sends nothing.
 *
 * Doctrine: v0_memories/user/dcc-network.md, earth-os.md, network-status-snapshot.md
 */

import type { Metadata } from "next"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { EventsTable } from "./components/events-table"
import {
  groupedTaxonomy,
  countsByEvent,
  countsBySatellite,
  totalEvents,
  handoffCount,
  leadCount,
  bookingCount,
  blockedCount,
  protectedCount,
  MOCK_EVENTS,
  FUNNEL,
  TELEMETRY_GAPS,
} from "@/lib/dcc/telemetry/mockTelemetry"

export const metadata: Metadata = {
  title: "DCC — Internal Telemetry (Reference)",
  description: "Internal reference implementation of the DCC telemetry dashboard. Not live.",
  robots: { index: false, follow: false, nocache: true },
}

export default function TelemetryPage() {
  const taxonomy = groupedTaxonomy()
  const byEvent = countsByEvent()
  const bySatellite = countsBySatellite()
  const maxEventCount = Math.max(...byEvent.map((e) => e.count), 1)

  const summaryCards = [
    { label: "Total events", value: totalEvents(), tone: "default" as const },
    { label: "Handoffs", value: handoffCount(), tone: "default" as const },
    { label: "Leads", value: leadCount(), tone: "default" as const },
    { label: "Bookings", value: bookingCount(), tone: "default" as const },
    { label: "Blocked / missing", value: blockedCount(), tone: "destructive" as const },
    { label: "Protected (PARR)", value: protectedCount(), tone: "accent" as const },
  ]

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
          INTERNAL · NOINDEX · REFERENCE
        </span>
        <span className="text-xs font-medium text-muted-foreground">Static mock data — not a live feed</span>
      </div>

      <DecisionHero
        eyebrow="DCC · Internal Telemetry"
        title="What the DCC telemetry dashboard should look like"
        description="A reference implementation reading the shared event taxonomy and network registry, rendered over hand-seeded sample events. Nothing here is live."
      />

      {/* 1. Status banner */}
      <section
        aria-label="Status"
        className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
      >
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex flex-col gap-1 text-sm leading-relaxed">
          <p className="font-semibold text-foreground">
            Production <span className="font-mono">destinationcommandcenter.com/internal/telemetry</span> is a hard
            404.
          </p>
          <p className="text-muted-foreground">
            No live telemetry dashboard is deployed. This page is a prototype/reference implementation inside the
            DCC/Earth OS prototype workspace — internal and noindex only, not linked from any public navigation. All
            numbers below are static sample data.
          </p>
        </div>
      </section>

      {/* 4. Summary cards */}
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-4 ${
              c.tone === "destructive"
                ? "border-destructive/30 bg-destructive/5"
                : c.tone === "accent"
                  ? "border-accent/30 bg-accent/10"
                  : "border-border bg-card"
            }`}
          >
            <div className="text-2xl font-bold tabular-nums text-foreground">{c.value}</div>
            <div className="mt-1 text-xs font-medium text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </section>

      {/* 2. Event taxonomy */}
      <section
        aria-label="Event taxonomy"
        className="rounded-xl border border-border bg-card p-6 text-card-foreground"
      >
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Canonical event taxonomy</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The shared DCC event vocabulary, read directly from{" "}
          <span className="font-mono text-foreground">lib/dcc/telemetry/events.ts</span>. Client analytics and server
          handoff events both map onto these names.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {taxonomy.map((group) => (
            <div key={group.category} className="rounded-lg border border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {group.events.map((e) => (
                  <li key={e} className="font-mono text-xs text-foreground">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recent events table (with client filters) */}
      <EventsTable events={MOCK_EVENTS} />

      {/* 5. Counts by event type */}
      <section
        aria-label="Counts by event type"
        className="rounded-xl border border-border bg-card p-6 text-card-foreground"
      >
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Counts by event type</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {byEvent.map((row) => (
            <li key={row.event} className="flex items-center gap-3">
              <span className="w-40 shrink-0 font-mono text-xs text-foreground">{row.event}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.count / maxEventCount) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. Counts by satellite/site */}
      <section
        aria-label="Counts by site"
        className="rounded-xl border border-border bg-card p-6 text-card-foreground"
      >
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Counts by site</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every site in the network registry, including those with no sample events (a real dashboard would
          highlight zero-signal sites as gaps).
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {bySatellite.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="truncate pr-2 text-xs text-foreground">{s.name}</span>
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${
                  s.count === 0 ? "text-muted-foreground/50" : "text-foreground"
                }`}
              >
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Funnel view */}
      <section
        aria-label="Funnel"
        className="rounded-xl border border-border bg-card p-6 text-card-foreground"
      >
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Funnel (sample)</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Illustrative arrival → conversion funnel mapped to the taxonomy. Static sample numbers.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {FUNNEL.map((stage) => (
            <li key={stage.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm font-medium text-foreground">{stage.label}</span>
              <div className="h-8 flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className="flex h-full items-center rounded-md bg-primary/85 px-2"
                  style={{ width: `${stage.value}%` }}
                >
                  <span className="truncate font-mono text-[10px] text-primary-foreground">{stage.events}</span>
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
                {stage.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 8. Gaps / warnings */}
      <section
        aria-label="Gaps and warnings"
        className="rounded-xl border border-accent/30 bg-accent/10 p-6"
      >
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <AlertTriangle className="size-4 text-accent-foreground" aria-hidden="true" />
          Gaps & warnings
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          {TELEMETRY_GAPS.map((gap) => (
            <li key={gap} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-foreground" aria-hidden="true" />
              <span>{gap}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Port note */}
      <section className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <span className="font-medium text-foreground">To make this real in the DCC project:</span> collect the
          shared events (the <span className="font-mono">TrackedHandoffLink</span> emitter already posts to{" "}
          <span className="font-mono">/api/internal/dcc-events</span>), persist them to a real store, then replace
          this file&apos;s mock data with live queries — keeping the same noindex protection and PARR-observe-only
          rule. No cron, sending, or checkout changes are needed to stand up the view.
        </p>
      </section>

      <DccNetworkBadge variant="authority" satelliteName="DCC — Internal Telemetry" />
    </main>
  )
}
