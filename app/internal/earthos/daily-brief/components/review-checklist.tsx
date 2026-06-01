"use client"

/**
 * Daily Brief Review Checklist (Phase 13A.2).
 *
 * LOCAL ONLY. This component holds reviewer sign-off state in React state for
 * the current page session. It does NOT:
 *   - persist anything (no database, no localStorage)
 *   - make any network call (no fetch, no POST)
 *   - affect the JSON endpoint or the snapshot payload
 *
 * Its only job is to give a human a disciplined review gate before any future
 * persistence / sending / publishing workflow is ever built.
 */

import { useMemo, useState } from "react"
import { Check, ClipboardCheck, ShieldAlert } from "lucide-react"

const CHECKLIST_ITEMS: { id: string; label: string }[] = [
  { id: "promotable", label: "I reviewed promotable items." },
  { id: "blocked", label: "I reviewed blocked items." },
  { id: "parr", label: "I verified no PARR checkout/admin/payment actions are requested." },
  { id: "automation", label: "I verified no automated sending/publishing is requested." },
  { id: "schema", label: "I verified schema/claims match visible content." },
  { id: "outreach", label: "I verified any outreach requires human approval." },
  { id: "export", label: "I verified the snapshot is safe to export." },
]

export function ReviewChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const checkedCount = useMemo(
    () => CHECKLIST_ITEMS.filter((item) => checked[item.id]).length,
    [checked],
  )
  const allChecked = checkedCount === CHECKLIST_ITEMS.length

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function reset() {
    setChecked({})
  }

  return (
    <section
      aria-label="Reviewer checklist"
      className="rounded-xl border border-border bg-card p-6 text-card-foreground"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Reviewer checklist</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Human review gate before manual export. Local to this page session — nothing here is saved, sent, or
              transmitted.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {checkedCount} / {CHECKLIST_ITEMS.length}
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = Boolean(checked[item.id])
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isChecked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                />
                <span className="text-sm leading-relaxed text-foreground">{item.label}</span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {allChecked ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            Ready for manual export
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
            <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
            Review all {CHECKLIST_ITEMS.length} items before manual export
          </span>
        )}
        {checkedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        This checklist does not gate the JSON endpoint or alter the snapshot payload. It is a discipline aid only —
        no persistence, no network calls, no automation.
      </p>
    </section>
  )
}
