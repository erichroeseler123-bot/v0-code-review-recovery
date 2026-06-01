import type { Metadata } from "next"
import { DCC_SATELLITES } from "@/lib/dcc/network/satelliteRegistry"
import { SHARED_DECISION_PROBLEMS } from "@/lib/dcc/decision/sharedProblems"
import { DCC_EVENTS } from "@/lib/dcc/telemetry/events"
import { classifyExternalLink, type LinkPolicy } from "@/lib/dcc/links/linkPolicy"
import { EXAMPLE_ROUTE_RECORD, isPromotable } from "@/lib/dcc/earthos/routeRecord"
import { Section, Card, Tag, FieldList, Pills } from "./components/proof-ui"

/**
 * INTERNAL-ONLY proof surface for the DCC / Earth OS foundation primitives.
 * Not linked from any public navigation. Marked noindex. No API calls, no DB.
 */
export const metadata: Metadata = {
  title: "DCC / Earth OS — Foundation Proof (internal)",
  robots: { index: false, follow: false, nocache: true },
}

const ROLE_TONE: Record<string, "neutral" | "accent" | "warn" | "ok" | "danger"> = {
  authority: "accent",
  operational_governance: "accent",
  satellite_storefront: "ok",
  execution: "neutral",
  protected_execution: "danger",
  separate: "warn",
}

const POLICY_TONE: Record<LinkPolicy, "neutral" | "accent" | "warn" | "ok" | "danger"> = {
  internal_decision_link: "accent",
  tracked_handoff: "ok",
  official_verification_source: "warn",
  blocked: "danger",
}

const LINK_EXAMPLES: {
  label: string
  example: string
  policy: LinkPolicy
}[] = [
  {
    label: "Internal decision link",
    example: "/somerset-wi/concerts → /somerset-wi/transport",
    // Internal links are policy by construction, not via the external classifier.
    policy: "internal_decision_link",
  },
  {
    label: "Tracked handoff (monetized exit)",
    example: "FareHarbor booking widget",
    policy: classifyExternalLink("fareharbor"),
  },
  {
    label: "Official verification source",
    example: "Ticketmaster used only to verify show time (not monetized)",
    policy: classifyExternalLink("ticketmaster", { monetized: false }),
  },
  {
    label: "Blocked external link",
    example: "Raw operator-direct link that was neither chosen nor tracked",
    policy: classifyExternalLink("operator_direct"),
  },
]

export default function FoundationProofPage() {
  const problems = Object.values(SHARED_DECISION_PROBLEMS)
  const record = EXAMPLE_ROUTE_RECORD
  const promotable = isPromotable(record)

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 font-sans">
      <header className="mb-2">
        <Tag tone="danger">INTERNAL · NOINDEX</Tag>
        <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground">
          DCC / Earth OS — Foundation Proof
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Phase 2 proof surface. Renders the Phase 1 primitives working together — the network registry,
          shared decision problems, link policy, telemetry taxonomy, and an Earth OS route record. No
          database, no API calls, not linked from public navigation.
        </p>
      </header>

      {/* 1. Network registry summary */}
      <Section index={1} title="Network registry" subtitle="Every site DCC knows about, with locked scope and guardrails.">
        <div className="grid gap-3">
          {DCC_SATELLITES.map((site) => (
            <Card key={site.id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">{site.name}</span>
                <Tag tone={ROLE_TONE[site.role]}>{site.role}</Tag>
                {site.handoffType ? <Tag>{`handoff: ${site.handoffType}`}</Tag> : null}
                {site.protection ? <Tag tone="danger">protected</Tag> : null}
              </div>
              <FieldList
                items={[
                  { label: "Scope", value: site.scope },
                  { label: "DCC relationship", value: site.dccRelationship ?? "—" },
                  {
                    label: "Must not become",
                    value: <Pills items={site.mustNotBecome ?? []} tone="warn" />,
                  },
                  ...(site.protection ? [{ label: "Protection", value: site.protection }] : []),
                ]}
              />
            </Card>
          ))}
        </div>
      </Section>

      {/* 2. Shared decision problems */}
      <Section
        index={2}
        title="Shared decision problems"
        subtitle="The six reusable problems, each specialized by a local qualifier."
      >
        <div className="grid gap-3">
          {problems.map((p) => (
            <Card key={p.id}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{p.id}</span>
                <Tag tone="ok">{`CTA: ${p.ctaPattern}`}</Tag>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-foreground">{p.problem}</p>
              <FieldList
                items={[
                  { label: "Fit", value: <Pills items={p.fitRules} tone="ok" /> },
                  { label: "Not fit", value: <Pills items={p.notFitRules} tone="warn" /> },
                  { label: "Telemetry", value: <Pills items={p.telemetryExpectation} /> },
                ]}
              />
            </Card>
          ))}
        </div>
      </Section>

      {/* 3. Link policy examples */}
      <Section
        index={3}
        title="Link policy"
        subtitle="Classified via the linkPolicy types/classifier — no untracked monetizable exits."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {LINK_EXAMPLES.map((ex) => (
            <Card key={ex.label}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{ex.label}</span>
                <Tag tone={POLICY_TONE[ex.policy]}>{ex.policy}</Tag>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">{ex.example}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 4. Telemetry taxonomy */}
      <Section
        index={4}
        title="Telemetry taxonomy"
        subtitle="The canonical event vocabulary the whole network maps onto."
      >
        <Card>
          <Pills items={[...DCC_EVENTS]} />
        </Card>
      </Section>

      {/* 5. Earth OS route record example */}
      <Section
        index={5}
        title="Earth OS route record"
        subtitle="Example record + promotion gate evaluated by isPromotable()."
      >
        <Card>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-foreground">{record.route}</span>
            <Tag tone="accent">{record.status}</Tag>
            <Tag tone={promotable ? "ok" : "danger"}>
              {promotable ? "isPromotable: true" : "isPromotable: false"}
            </Tag>
          </div>
          <FieldList
            items={[
              { label: "Scope", value: record.scope },
              { label: "Satellite", value: record.satellite ?? "—" },
              { label: "Corridor", value: record.corridor ?? "—" },
              { label: "Data feeds", value: <Pills items={record.dataFeeds} /> },
              { label: "Internal links", value: <Pills items={record.internalLinks} tone="ok" /> },
              {
                label: "External links",
                value: <Pills items={record.externalLinks.map((l) => `${l.href} (${l.policy})`)} />,
              },
              { label: "Telemetry", value: <Pills items={record.telemetryEvents} /> },
              { label: "Must not claim", value: <Pills items={record.mustNotClaim ?? []} tone="warn" /> },
              { label: "Open issues", value: <Pills items={record.issues} tone="warn" /> },
              { label: "Promotion", value: <Tag>{record.promotion ?? "none"}</Tag> },
            ]}
          />
          <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
            {promotable
              ? "Promotable: live/indexable, measured, and issue-free."
              : `Not promotable: status is "${record.status}", measured=${record.telemetryEvents.length > 0}, but ${record.issues.length} open issue(s) block promotion until resolved.`}
          </p>
        </Card>
      </Section>
    </main>
  )
}
