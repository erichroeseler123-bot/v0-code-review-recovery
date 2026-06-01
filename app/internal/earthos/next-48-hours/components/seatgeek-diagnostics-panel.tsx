/**
 * Internal-only SeatGeek adapter diagnostics.
 *
 * Shows adapter health for operators of the prototype. Never renders any secret:
 * only whether a client id is present, the env var NAME that supplied it, live
 * counts, fallback mode, current environment, a production-only note, the last
 * fetch timestamp, and a sanitized error string.
 *
 * Lives on a noindex internal route — not shown on any public page.
 */

import { Activity, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import type { SeatGeekDiagnostics } from "@/lib/dcc/feeds/seatgeek"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function SeatGeekDiagnosticsPanel({
  diagnostics,
  mockCount,
}: {
  diagnostics: SeatGeekDiagnostics
  mockCount: number
}) {
  const {
    enabled,
    keyExists,
    liveCount,
    fallbackMode,
    lastFetchAttemptedAt,
    error,
    keySourceName,
    environment,
    environmentNote,
  } = diagnostics

  return (
    <section
      aria-label="SeatGeek adapter diagnostics"
      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-6"
    >
      <header className="flex items-center gap-2">
        <Activity className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          SeatGeek adapter — diagnostics (internal)
        </h2>
        <span className="ml-auto rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
          PRIMARY EVENT FEED
        </span>
      </header>

      <dl className="flex flex-col">
        <Row
          label="Adapter enabled"
          value={
            enabled ? (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <CheckCircle2 className="size-4" aria-hidden="true" /> Yes
                {keySourceName ? (
                  <span className="font-mono text-xs text-muted-foreground">({keySourceName})</span>
                ) : null}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <XCircle className="size-4" aria-hidden="true" /> No — no client id set
              </span>
            )
          }
        />
        <Row label="Client id present" value={keyExists ? "Yes" : "No"} />
        <Row label="Environment" value={<span className="font-mono text-xs">{environment}</span>} />
        <Row label="Live event count" value={liveCount} />
        <Row label="Mock opportunity count" value={mockCount} />
        <Row
          label="Fallback mode"
          value={
            fallbackMode === "mock+live" ? (
              <span className="text-primary">mock + live</span>
            ) : (
              <span className="text-muted-foreground">mock only</span>
            )
          }
        />
        <Row
          label="Last fetch attempted"
          value={<span className="font-mono text-xs">{new Date(lastFetchAttemptedAt).toLocaleString("en-US")}</span>}
        />
        {error ? (
          <Row
            label="Adapter error"
            value={
              <span className="inline-flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="size-4" aria-hidden="true" />
                <span className="max-w-xs truncate font-mono text-xs">{error}</span>
              </span>
            }
          />
        ) : null}
      </dl>

      {environmentNote ? (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{environmentNote}</span>
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-muted-foreground">
        {enabled
          ? "Live SeatGeek rows are merged above and labeled LIVE. If the feed fails, the board falls back to mock-only without breaking."
          : "No SeatGeek client id is configured here, so the adapter is dormant and the board renders mock data only. Add SEATGEEK_CLIENT_ID to activate live rows — no code changes required."}
      </p>
    </section>
  )
}
