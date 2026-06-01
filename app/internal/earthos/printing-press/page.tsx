import type { Metadata } from "next"
import { Info } from "lucide-react"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { getSatellite } from "@/lib/dcc/network/satelliteRegistry"
import { eligiblePressKits, ineligiblePressItems, pressSummary } from "@/lib/dcc/earthos/printingPress"
import { PressKitCard } from "./components/press-kit-card"

export const metadata: Metadata = {
  title: "Printing Press Lite — DCC / Earth OS (internal)",
  description: "Internal draft-asset generator. Generation only, no sending.",
  robots: { index: false, follow: false, nocache: true },
}

export default function PrintingPressPage() {
  const eligible = eligiblePressKits()
  const gated = ineligiblePressItems()
  const summary = pressSummary()

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 md:px-6 md:py-14">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive bg-background px-3 py-1 text-xs font-semibold text-destructive">
          INTERNAL · NOINDEX · GENERATION ONLY
        </span>
        <DccNetworkBadge variant="authority" satelliteName="Earth OS — Printing Press Lite" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">Printing Press Lite</h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Drafts the promotion assets for routes that already passed the promotion gate — SEO title, meta
          description, social post, media pitch, and partner blurb. Everything here is a draft for human review.
          Nothing is sent, posted, or saved.
        </p>
      </header>

      <DecisionHero
        eyebrow="Earth OS · publication"
        title="Only promotable routes get copy. Everything else stays gated."
        description="The Printing Press never writes promotion copy for a route that is blocked, in progress, or visually unfinished. It only drafts assets the promotion queue has already cleared, and it grounds every line in real registry and queue data."
        primaryCta={{ label: "See draft kits", href: "#kits" }}
        secondaryCta={{ label: "Back to queue", href: "/internal/earthos/promotion-queue" }}
      />

      <DecisionExplanation
        reasons={[
          "These routes passed the promotion gate (promotable or ready to publish).",
          "Assets are templated from the satellite registry and the promotion queue — not invented.",
          "Each kit carries the site's scope guardrails so messaging cannot drift.",
        ]}
        watchOutFor={[
          "Drafts only — a human reviews and edits before anything goes out.",
          "Fields marked NEEDS INPUT had no source angle in the queue yet; do not fabricate them.",
          "Honest schema: mark up only what is truly on the page.",
        ]}
        nextStep="Review a kit, copy what holds up, then publish or pitch by hand."
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-card-foreground">
          <span className="font-semibold">{summary.eligible}</span> eligible for press
        </span>
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-card-foreground">
          <span className="font-semibold">{summary.gated}</span> gated
        </span>
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-card-foreground">
          <span className="font-semibold">{summary.total}</span> in queue
        </span>
      </div>

      <section id="kits" className="scroll-mt-8 flex flex-col gap-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Draft kits</h2>
        {eligible.length === 0 ? (
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>No routes are currently through the promotion gate, so no assets were drafted.</p>
          </div>
        ) : (
          eligible.map((kit) => (
            <PressKitCard key={kit.itemId} kit={kit} protectionNote={getSatellite(kit.itemId)?.protection} />
          ))
        )}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Gated (no assets generated)</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Shown so nothing is silently skipped. These routes are not eligible for promotion copy until their next
          action is done.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {gated.map((kit) => (
            <PressKitCard key={kit.itemId} kit={kit} protectionNote={getSatellite(kit.itemId)?.protection} />
          ))}
        </div>
      </section>
    </main>
  )
}
