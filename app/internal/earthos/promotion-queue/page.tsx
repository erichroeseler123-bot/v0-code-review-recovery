import type { Metadata } from "next"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import { PROMOTION_QUEUE, sortedQueue, queueSummary } from "@/lib/dcc/earthos/promotionQueue"
import { PromotionCard } from "./components/promotion-card"

export const metadata: Metadata = {
  title: "Promotion Queue — DCC / Earth OS (internal)",
  description: "Internal Earth OS module: what is ready to promote, what is blocked, and the next action.",
  robots: { index: false, follow: false, nocache: true },
}

export default function PromotionQueuePage() {
  const items = sortedQueue(PROMOTION_QUEUE)
  const summary = queueSummary(PROMOTION_QUEUE)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive bg-background px-3 py-1 text-xs font-semibold text-destructive">
          INTERNAL · NOINDEX · EARTH OS
        </span>
        <DecisionHero
          eyebrow="Earth OS · Promotion Queue"
          title="What is ready to promote — and what must not move yet."
          description="Before the network promotes anything (Printing Press, Outreach, Media), Earth OS decides what is ready, what is blocked, what needs proof, and what should never be touched. This is the gate that keeps promotion honest."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat label="In queue" value={summary.total} />
          <SummaryStat label="Promotable" value={summary.promotable} tone="ok" />
          <SummaryStat label="Actionable" value={summary.actionable} tone="accent" />
          <SummaryStat label="Blocked" value={summary.blocked} tone="danger" />
        </div>
      </div>

      <DecisionExplanation
        title="How this queue gates promotion"
        reasons={[
          "Promotable means live, scope-clean, and measured — safe for media + outreach.",
          "Ready-to-publish and PR-ready just need a publish or review action to advance.",
          "Each item carries the single next action and who owns it, so nothing stalls silently.",
        ]}
        watchOutFor={[
          "Blocked items (domain mismatch, un-pushed commits, missing telemetry) must be fixed before any promotion.",
          "Protected execution (PARR) is reference-only here — no checkout, payment, or admin changes.",
          "This is a point-in-time view; re-verify against the live network before acting.",
        ]}
        nextStep="Work the promotable and ready items first; clear blockers before promoting anything else."
      />

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Queue</h2>
        <div className="grid gap-5">
          {items.map((item) => (
            <PromotionCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <DccNetworkBadge variant="footer" satelliteName="Earth OS · internal governance" />
    </main>
  )
}

function SummaryStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone?: "neutral" | "ok" | "accent" | "danger"
}) {
  const toneClasses =
    tone === "ok"
      ? "text-primary"
      : tone === "accent"
        ? "text-accent-foreground"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground"
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className={`text-2xl font-bold tabular-nums ${toneClasses}`}>{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}
