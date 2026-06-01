import type { Metadata } from "next"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { DCC_AUTHORS, resolveAuthorSites } from "@/lib/dcc/authors/authorRegistry"
import { AuthorCard } from "./components/author-card"

export const metadata: Metadata = {
  title: "DCC Editorial Persona Registry — Internal",
  description: "Internal review of DCC editorial guide voices and their honest-schema guardrails.",
  robots: { index: false, follow: false, nocache: true },
}

export default function AuthorsRegistryPage() {
  const personaCount = DCC_AUTHORS.filter((a) => a.type === "editorial_persona").length
  const deskCount = DCC_AUTHORS.filter((a) => a.type === "organization_desk").length

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 md:py-16">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        INTERNAL · NOINDEX · EDITORIAL REVIEW
      </span>

      <DecisionHero
        eyebrow="Earth OS · Editorial Layer"
        title="DCC Editorial Persona Registry"
        description="Transparent guide voices that organize the network's content into topical desks. Every persona is a disclosed editorial voice — never a fabricated real person — so authorship stays honest and schema always matches what's on the page."
      />

      <DecisionExplanation
        title="How this layer stays honest"
        reasons={[
          "Each desk owns one real decision lane and links only within that lane — no cross-link farming.",
          "Every persona page shows a visible disclosure that it is an editorial guide voice, not a real individual.",
          "Authorship schema mirrors that disclosure exactly: no fake credentials, headshots, social profiles, or lived-experience claims.",
          "Operational desks (e.g. The Dispatcher) use an Organization voice instead of implying a named human.",
        ]}
        watchOutFor={[
          "Never attach persona authorship to checkout or payment pages — those use the brand publisher.",
          "Do not let a desk link outside its declared sites; that is how an editorial layer turns spammy.",
        ]}
        nextStep="Review each desk below, then expose selected public author pages only after sign-off (Phase 15)."
      />

      <section aria-label="Registry summary" className="flex flex-wrap gap-3">
        {[
          { label: "Total desks", value: DCC_AUTHORS.length },
          { label: "Editorial personas", value: personaCount },
          { label: "Organization desks", value: deskCount },
          { label: "Real-person authors", value: 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </section>

      <section aria-label="Editorial desks" className="grid gap-6">
        {DCC_AUTHORS.map((author) => (
          <AuthorCard key={author.id} author={author} sites={resolveAuthorSites(author)} />
        ))}
      </section>

      <DccNetworkBadge variant="authority" satelliteName="Earth OS — Editorial Persona Registry" />
    </main>
  )
}
