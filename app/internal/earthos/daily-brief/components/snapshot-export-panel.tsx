"use client"

import { useState } from "react"
import { Check, Copy, Download, ExternalLink } from "lucide-react"

type SnapshotExportPanelProps = {
  /** Pretty-printed snapshot JSON, built server-side (read-only). */
  json: string
  /** Stable GET endpoint that returns the same artifact. */
  endpoint: string
  /** Snapshot envelope metadata, surfaced for the reviewer. */
  generatedAt: string
  jobId: string
  mode: string
  /** Used to name the downloaded file, e.g. earthos-daily-brief-2026-06-01.json */
  date: string
}

/**
 * Read-only export controls for the daily-brief snapshot.
 *
 * Every action here is local-only: copy to clipboard, download the JSON the
 * browser already has, or open the GET endpoint. Nothing is POSTed, persisted
 * server-side, sent, or published. This panel adds NO new behavior to the
 * system — it only makes the existing read-only artifact easier to inspect.
 */
export function SnapshotExportPanel({ json, endpoint, generatedAt, jobId, mode, date }: SnapshotExportPanelProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; the JSON is selectable in the panel anyway.
    }
  }

  function handleDownload() {
    // Download the JSON the page already holds — no network request, no write.
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `earthos-daily-brief-${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const meta: { label: string; value: string }[] = [
    { label: "generatedAt", value: generatedAt },
    { label: "jobId", value: jobId },
    { label: "mode", value: mode },
  ]

  return (
    <section
      aria-label="Snapshot export"
      className="rounded-xl border border-border bg-card p-6 text-card-foreground"
    >
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Snapshot export</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Inspect or export the read-only snapshot a reviewer would hand off. Copy and download act only on the JSON
        this page already holds — nothing is sent, persisted server-side, or published.
      </p>

      {/* Envelope metadata */}
      <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {meta.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-background p-3">
            <dt className="text-xs font-medium text-muted-foreground">{m.label}</dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-foreground">{m.value}</dd>
          </div>
        ))}
      </dl>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          aria-label="Copy snapshot JSON"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          aria-label="Download snapshot JSON"
        >
          <Download className="size-3.5" aria-hidden="true" />
          Download
        </button>
        <a
          href={endpoint}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
          aria-label="Open snapshot endpoint"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          Open endpoint
        </a>
      </div>

      {/* Read-only JSON preview */}
      <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground">
        {json}
      </pre>
    </section>
  )
}
