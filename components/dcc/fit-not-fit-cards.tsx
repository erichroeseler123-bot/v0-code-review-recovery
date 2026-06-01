/**
 * FitNotFitCards — every DCC page states who a recommendation is for and who
 * should avoid it. Honest scoping is a core trust signal of the network.
 */

import { ThumbsUp, ThumbsDown } from "lucide-react"

export type FitNotFitCardsProps = {
  bestFor: string[]
  notFor: string[]
}

export function FitNotFitCards({ bestFor, notFor }: FitNotFitCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5 text-card-foreground">
        <div className="flex items-center gap-2">
          <ThumbsUp className="size-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Best for</h3>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {bestFor.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <div className="flex items-center gap-2">
          <ThumbsDown className="size-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">Not for</h3>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {notFor.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
