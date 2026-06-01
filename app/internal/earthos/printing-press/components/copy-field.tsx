"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

type CopyFieldProps = {
  label: string
  value: string
  guidance?: string
  needsInput: boolean
}

/**
 * Read-only drafted asset with a copy-to-clipboard button.
 * Copy is the ONLY action — nothing is sent, posted, or persisted.
 */
export function CopyField({ label, value, guidance, needsInput }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; fail quietly — the text is selectable anyway.
    }
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
          {needsInput && (
            <span className="rounded-full border border-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive">
              NEEDS INPUT
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={needsInput}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className={`text-sm leading-relaxed ${needsInput ? "text-muted-foreground italic" : "text-foreground"}`}>
        {value}
      </p>
      {guidance && <p className="mt-1.5 text-xs text-muted-foreground">{guidance}</p>}
    </div>
  )
}
