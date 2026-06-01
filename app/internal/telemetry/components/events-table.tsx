"use client"

import { useMemo, useState } from "react"
import type { MockTelemetryEvent } from "@/lib/dcc/telemetry/mockTelemetry"
import { satelliteName } from "@/lib/dcc/telemetry/mockTelemetry"

type Props = {
  events: MockTelemetryEvent[]
}

const STATUS_STYLES: Record<MockTelemetryEvent["status"], string> = {
  ok: "bg-primary/10 text-primary",
  protected: "bg-accent/15 text-accent-foreground",
  blocked: "bg-destructive/10 text-destructive",
  unverified: "bg-muted text-muted-foreground",
}

const ALL = "all"

export function EventsTable({ events }: Props) {
  const [eventFilter, setEventFilter] = useState<string>(ALL)
  const [siteFilter, setSiteFilter] = useState<string>(ALL)
  const [statusFilter, setStatusFilter] = useState<string>(ALL)

  const eventOptions = useMemo(() => [...new Set(events.map((e) => e.event))].sort(), [events])
  const siteOptions = useMemo(
    () => [...new Set(events.map((e) => e.satelliteId))].sort(),
    [events],
  )
  const statusOptions = useMemo(() => [...new Set(events.map((e) => e.status))].sort(), [events])

  const filtered = events.filter(
    (e) =>
      (eventFilter === ALL || e.event === eventFilter) &&
      (siteFilter === ALL || e.satelliteId === siteFilter) &&
      (statusFilter === ALL || e.status === statusFilter),
  )

  const selectClass =
    "rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground"

  return (
    <section
      aria-label="Recent events (mock)"
      className="rounded-xl border border-border bg-card p-6 text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent events (mock)</h2>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {filtered.length} of {events.length} shown
        </span>
      </div>

      {/* Client-side filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Event type
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter by event type"
          >
            <option value={ALL}>All events</option>
            {eventOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Site
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter by site"
          >
            <option value={ALL}>All sites</option>
            {siteOptions.map((o) => (
              <option key={o} value={o}>
                {satelliteName(o)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value={ALL}>All statuses</option>
            {statusOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-medium">Time (UTC)</th>
              <th className="px-3 py-2 font-medium">Event</th>
              <th className="px-3 py-2 font-medium">Site</th>
              <th className="px-3 py-2 font-medium">Route</th>
              <th className="px-3 py-2 font-medium">Intent</th>
              <th className="px-3 py-2 font-medium">Destination</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-border/60 align-top">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">
                  {e.timestamp.replace("T", " ").replace("Z", "")}
                </td>
                <td className="px-3 py-2 font-mono text-xs font-medium text-foreground">{e.event}</td>
                <td className="px-3 py-2 text-foreground">{satelliteName(e.satelliteId)}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{e.route}</td>
                <td className="px-3 py-2 text-muted-foreground">{e.intent}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{e.destinationType}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[e.status]}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">{e.notes}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No events match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
