/**
 * DccNetworkBadge — the subtle DCC authority mark.
 *
 * Never dominates a hero. Lives in footers / trust bands to signal the site is
 * part of the decision network. Respects the DCC-visibility rule: satellites
 * acknowledge the network quietly, they do not advertise the internal brain.
 */

import { Compass } from "lucide-react"

export type DccNetworkBadgeProps = {
  variant?: "subtle" | "footer" | "authority"
  satelliteName?: string
}

export function DccNetworkBadge({ variant = "subtle", satelliteName }: DccNetworkBadgeProps) {
  const label =
    variant === "authority"
      ? "Powered by DCC route intelligence"
      : "Part of the Destination Command Center decision network"

  if (variant === "footer") {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-border py-6 text-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Compass className="size-3.5" aria-hidden="true" />
          <span>{label}</span>
        </div>
        {satelliteName && <span className="text-xs text-muted-foreground">{satelliteName}</span>}
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
      <Compass className="size-3.5" aria-hidden="true" />
      {label}
      {satelliteName ? <span className="text-muted-foreground/70">· {satelliteName}</span> : null}
    </span>
  )
}
