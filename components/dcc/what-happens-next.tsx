/**
 * WhatHappensNext — the numbered "here is what happens after you act" pattern.
 * Critical for execution sites: it removes uncertainty before a handoff.
 */

export type WhatHappensNextProps = {
  title?: string
  steps: { title: string; body: string }[]
}

export function WhatHappensNext({ title = "What happens next", steps }: WhatHappensNextProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="pt-0.5">
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
