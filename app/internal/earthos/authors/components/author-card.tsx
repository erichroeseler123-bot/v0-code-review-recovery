/**
 * AuthorCard — internal review card for one editorial persona (Phase 14).
 * Presentational. Surfaces disclosure, scope, and guardrails prominently so a
 * reviewer can confirm the persona is honest before any public exposure.
 */

import Link from "next/link"
import { Check, Ban, ArrowRight } from "lucide-react"
import { AUTHOR_TYPE_LABELS, type DccAuthor } from "@/lib/dcc/authors/authorRegistry"
import type { SatelliteRecord } from "@/lib/dcc/network/satelliteRegistry"

export function AuthorCard({ author, sites }: { author: DccAuthor; sites: SatelliteRecord[] }) {
  const isPersona = author.type === "editorial_persona"

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{author.name}</h3>
          <p className="text-sm text-muted-foreground">{author.desk}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isPersona ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          {AUTHOR_TYPE_LABELS[author.type]}
        </span>
      </div>

      {/* Disclosure — the honest-schema anchor, shown prominently. */}
      <div className="rounded-lg border border-border bg-muted/50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visible disclosure</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{author.disclosure}</p>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">Voice:</span> {author.voice}
        </span>
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">Topics:</span> {author.topics.join(", ")}
        </span>
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">Sites:</span>{" "}
          {sites.length > 0 ? sites.map((s) => s.name).join(", ") : "—"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">May write</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {author.shouldWrite.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Must not claim</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {author.mustNotClaim.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <Ban className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={author.profilePath}
        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Review desk detail
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}
