import { Ban, Info, Lock } from "lucide-react"
import type { PressKit } from "@/lib/dcc/earthos/printingPress"
import { CopyField } from "./copy-field"

/** Renders one generated press kit (eligible) or a gated stub (ineligible). */
export function PressKitCard({ kit, protectionNote }: { kit: PressKit; protectionNote?: string }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight">{kit.label}</h3>
          {kit.route && <code className="font-mono text-xs text-muted-foreground">{kit.route}</code>}
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            kit.eligible ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
          }`}
        >
          {kit.eligible ? "DRAFT READY" : kit.state}
        </span>
      </header>

      {kit.eligible ? (
        <div className="mt-4 flex flex-col gap-3">
          {kit.assets.map((asset) => (
            <CopyField
              key={asset.key}
              label={asset.label}
              value={asset.value}
              guidance={asset.guidance}
              needsInput={asset.needsInput}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-medium text-foreground">Gated — no assets generated. </span>
            {kit.ineligibleReason}
          </p>
        </div>
      )}

      {protectionNote && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive bg-background p-3 text-sm text-destructive">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">Protected: </span>
            {protectionNote}
          </p>
        </div>
      )}

      {kit.doNotClaim.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Messaging guardrails
          </p>
          <ul className="flex flex-col gap-1">
            {kit.doNotClaim.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-foreground">
                <Ban className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        {kit.honestSchemaNote}
      </p>
    </article>
  )
}
