import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Check, Ban, ArrowLeft } from "lucide-react"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { DCC_AUTHORS, getAuthor, resolveAuthorSites, AUTHOR_TYPE_LABELS } from "@/lib/dcc/authors/authorRegistry"
import { getVoiceRule } from "@/lib/dcc/authors/voiceGuides"
import { buildAuthorProfileSchema } from "@/lib/dcc/authors/schema"

export const metadata: Metadata = {
  title: "DCC Editorial Desk — Internal Review",
  robots: { index: false, follow: false, nocache: true },
}

export function generateStaticParams() {
  return DCC_AUTHORS.map((a) => ({ id: a.id }))
}

export default async function AuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const author = getAuthor(id)
  if (!author) notFound()

  const sites = resolveAuthorSites(author)
  const voice = getVoiceRule(author.id)
  const profileSchema = buildAuthorProfileSchema(author)
  const schemaJson = JSON.stringify(profileSchema, null, 2)

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:py-16">
      <Link
        href="/internal/earthos/authors"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All editorial desks
      </Link>

      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {author.desk} · {AUTHOR_TYPE_LABELS[author.type]}
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">{author.name}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Voice:</span> {author.voice}
        </p>
      </header>

      {/* Visible disclosure — must match the schema description below. */}
      <section aria-label="Disclosure" className="rounded-xl border border-border bg-muted/50 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visible editorial disclosure
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{author.disclosure}</p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <section aria-label="May write" className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <h2 className="text-sm font-semibold text-foreground">May write about</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {author.shouldWrite.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section
          aria-label="Must not claim"
          className="rounded-xl border border-border bg-card p-5 text-card-foreground"
        >
          <h2 className="text-sm font-semibold text-foreground">Must not claim</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {author.mustNotClaim.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <Ban className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-label="Topics and sites" className="rounded-xl border border-border bg-card p-5 text-card-foreground">
        <h2 className="text-sm font-semibold text-foreground">Topical ownership</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {author.topics.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Sites covered:</span>{" "}
          {sites.length > 0 ? sites.map((s) => s.name).join(", ") : "—"}
        </p>
      </section>

      {voice && (
        <section aria-label="Voice guide" className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <h2 className="text-sm font-semibold text-foreground">Voice discipline</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tone:</span> {voice.tone}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Use</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {voice.usePhrases.map((p) => (
                  <span key={p} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avoid</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {voice.avoidPhrases.map((p) => (
                  <span key={p} className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Related routes" className="rounded-xl border border-border bg-card p-5 text-card-foreground">
        <h2 className="text-sm font-semibold text-foreground">Internal links (within desk only)</h2>
        <ul className="mt-3 flex flex-col gap-1.5">
          {author.relatedRoutes.map((route) => (
            <li key={route} className="font-mono text-xs text-muted-foreground">
              {route}
            </li>
          ))}
        </ul>
      </section>

      {/* Schema review — what authorship markup WOULD emit. Description equals the
          visible disclosure above, proving schema matches visible content. */}
      <section aria-label="Authorship schema preview" className="rounded-xl border border-border bg-card p-5 text-card-foreground">
        <h2 className="text-sm font-semibold text-foreground">Authorship schema (review only)</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          This is what the ProfilePage / author markup would emit. It is shown for review and is NOT injected into any
          public page yet. The <span className="font-mono">description</span> equals the visible disclosure above.
        </p>
        <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
          {schemaJson}
        </pre>
      </section>

      <DccNetworkBadge variant="authority" satelliteName={`Earth OS — ${author.desk}`} />
    </main>
  )
}
