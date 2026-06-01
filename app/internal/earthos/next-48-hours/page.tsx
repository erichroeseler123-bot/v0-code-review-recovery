/**
 * Internal Earth OS / DCC prototype: "What can I do near me in the next 48 hours?"
 *
 * PHASE 5 — mock data only. No external APIs, no database, no public route.
 * Internal + noindex. Proves the place + time + intent + explanation + tracked-action
 * product concept using the Phase 1 primitives and Phase 3/4 components.
 *
 * Doctrine: v0_memories/user/dcc-place-time-engine.md, earth-os.md
 */

import type { Metadata } from "next"
import { Info } from "lucide-react"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { MOCK_OPPORTUNITIES } from "@/lib/dcc/earthos/mockOpportunities"
import { fetchTicketmasterOpportunities } from "@/lib/dcc/feeds/ticketmaster"
import { OpportunityBoard } from "./components/opportunity-board"
import { TicketmasterDiagnosticsPanel } from "./components/diagnostics-panel"

export const metadata: Metadata = {
  title: "Next 48 Hours — DCC / Earth OS (internal prototype)",
  description: "Internal place-and-time decision prototype. Mock + optional live data.",
  robots: { index: false, follow: false, nocache: true },
}

// Always render fresh diagnostics for this internal prototype.
export const dynamic = "force-dynamic"

export default async function Next48HoursPage() {
  // Phase 6A: attempt a live Ticketmaster pull around the Somerset / Mystic Lake
  // corridor. With no API key this returns [] and the page stays mock-only.
  const { opportunities: liveOpportunities, diagnostics } = await fetchTicketmasterOpportunities({
    latlong: "45.1247,-92.6629", // Somerset, WI area
    radius: 60,
    unit: "miles",
    size: 8,
    satelliteId: "somerset-st-croix",
    satelliteName: "Somerset / St. Croix corridor",
    corridorId: "somerset-mystic-lake-concert",
    region: "Wisconsin",
  })

  // Live rows first so they are visible, then the mock network rows.
  const allOpportunities = [...liveOpportunities, ...MOCK_OPPORTUNITIES]

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive bg-background px-3 py-1 text-xs font-semibold text-destructive">
          INTERNAL · NOINDEX · {diagnostics.fallbackMode === "mock+live" ? "MOCK + LIVE" : "MOCK DATA"}
        </span>
        <span className="text-xs text-muted-foreground">/internal/earthos/next-48-hours</span>
      </div>

      <DecisionHero
        eyebrow="DCC / Earth OS prototype"
        title="What can I do near me in the next 48 hours?"
        description="This is the first place-and-time decision surface for the network. Every card is a place, a time window, an intent, an explanation of why it fits, and one tracked next action — the heart of DCC, proven on sample data before any real feeds are wired."
        primaryCta={{ label: "Jump to opportunities", href: "#opportunities" }}
      />

      <section className="flex gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
        <Info className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            {diagnostics.fallbackMode === "mock+live"
              ? "Mock network rows plus live Ticketmaster events."
              : "Prototype running on mock data (no live feed active)."}
          </p>
          <p>
            {MOCK_OPPORTUNITIES.length} hand-authored mock opportunities are normalized onto the shared DCC schema and
            span the whole network — Wisconsin, Alaska, Colorado, and New Orleans — across concerts, tours, food,
            rides, cabin drops, and cruise shore excursions. Phase 6A adds the first real feed:{" "}
            <span className="font-medium text-foreground">Ticketmaster events</span>, normalized into the same schema
            and merged in when an API key is present. Rows are labeled{" "}
            <span className="font-medium text-foreground">LIVE</span> or{" "}
            <span className="font-medium text-foreground">MOCK</span> so the two are never confused.
          </p>
          <p>
            Still to come: SeatGeek, FareHarbor and Viator for tours, Rezdy for rides, plus Google Places and weather
            for location and risk context. The Party at Red Rocks card is shown as{" "}
            <span className="font-medium text-foreground">protected proven execution</span> — reference only, with no
            checkout link and no PARR code touched.
          </p>
        </div>
      </section>

      <TicketmasterDiagnosticsPanel diagnostics={diagnostics} mockCount={MOCK_OPPORTUNITIES.length} />

      <section id="opportunities" className="scroll-mt-8 flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Opportunities near you</h2>
        <OpportunityBoard opportunities={allOpportunities} />
      </section>

      <DccNetworkBadge variant="footer" satelliteName="Earth OS · place-and-time decision engine (prototype)" />
    </main>
  )
}
