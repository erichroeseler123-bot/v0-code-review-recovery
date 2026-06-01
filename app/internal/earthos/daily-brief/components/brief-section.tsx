/**
 * BriefSection — renders one section of the Earth OS Daily Brief.
 *
 * Presentational only. Tone drives the accent color so the eye can separate
 * "act" from "blocked" from "must-not-touch" at a glance.
 */

import { ArrowRight, Ban, FileText, Info, ShieldAlert } from "lucide-react"
import type { BriefSectionData, BriefTone } from "@/lib/dcc/earthos/dailyBrief"

const TONE_STYLES: Record<
  BriefTone,
  { border: string; chip: string; Icon: typeof ArrowRight }
> = {
  action: { border: "border-l-primary", chip: "bg-primary/10 text-primary", Icon: ArrowRight },
  blocked: {
    border: "border-l-destructive",
    chip: "bg-destructive/10 text-destructive",
    Icon: Ban,
  },
  draft: {
    border: "border-l-secondary-foreground",
    chip: "bg-secondary text-secondary-foreground",
    Icon: FileText,
  },
  info: { border: "border-l-border", chip: "bg-muted text-muted-foreground", Icon: Info },
  protected: {
    border: "border-l-destructive",
    chip: "bg-destructive/10 text-destructive",
    Icon: ShieldAlert,
  },
}

export function BriefSection({ section }: { section: BriefSectionData }) {
  const { border, chip, Icon } = TONE_STYLES[section.tone]

  return (
    <section
      aria-label={section.title}
      className={`rounded-xl border border-l-4 ${border} border-border bg-card p-6 text-card-foreground`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`flex size-7 items-center justify-center rounded-md ${chip}`}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{section.title}</h2>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {section.lines.length}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.summary}</p>

      {section.lines.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {section.lines.map((line, i) => (
            <li key={i} className="rounded-lg border border-border bg-background p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{line.label}</span>
                {line.reference && (
                  <span className="font-mono text-xs text-muted-foreground">{line.reference}</span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{line.detail}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
          {section.emptyNote ?? "Nothing to report."}
        </p>
      )}
    </section>
  )
}
