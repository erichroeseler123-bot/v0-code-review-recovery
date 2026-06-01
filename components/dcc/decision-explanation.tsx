/**
 * DecisionExplanation — the "AI explanation" pattern, even before real AI.
 *
 * Shows why a recommendation fits, what to watch out for, and the next step.
 * This is what makes a DCC surface feel smarter than a directory.
 */

import { Check, TriangleAlert, ArrowRight } from "lucide-react"

export type DecisionExplanationProps = {
  title?: string
  reasons: string[]
  watchOutFor?: string[]
  nextStep?: string
}

export function DecisionExplanation({
  title = "Why this fits",
  reasons,
  watchOutFor,
  nextStep,
}: DecisionExplanationProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {reasons.map((reason, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      {watchOutFor && watchOutFor.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">What to watch out for</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {watchOutFor.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-secondary-foreground" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nextStep && (
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4 text-sm font-medium text-foreground">
          <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{nextStep}</span>
        </div>
      )}
    </div>
  )
}
