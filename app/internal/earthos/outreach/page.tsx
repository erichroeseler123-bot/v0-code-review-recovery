import type { Metadata } from "next"
import { DecisionHero } from "@/components/dcc/decision-hero"
import { DecisionExplanation } from "@/components/dcc/decision-explanation"
import { DccNetworkBadge } from "@/components/dcc/dcc-network-badge"
import {
  OUTREACH_LOG,
  groupedOutreach,
  outreachSummary,
  outreachStatusLabel,
} from "@/lib/dcc/earthos/outreachLog"
import { OutreachCard } from "./components/outreach-card"

export const metadata: Metadata = {
  title: "Outreach Log — DCC / Earth OS (internal)",
  description: "Internal Earth OS module: proposed and completed outreach, gated by promotion readiness. Record only.",
  robots: { index: false, follow: false, nocache: true },
}

export default function OutreachLogPage() {
  const groups = groupedOutreach(OUTREACH_LOG)
  const summary = outreachSummary(OUTREACH_LOG)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive bg-background px-3 py-1 text-xs font-semibold text-destructive">
          INTERNAL · NOINDEX · EARTH OS · RECORD ONLY
        </span>
        <DecisionHero
          eyebrow="Earth OS · Outreach Log"
          title="Who we plan to contact — and what must not be sent yet."
          description="A manual record of proposed and completed outreach tied to Promotion Queue items. Nothing here sends email, posts, or automates anything — it records who, what kit, which corridor, the ask, and what happened, so media and partner relationships become part of Earth OS."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryStat label="Logged" value={summary.total} />
          <SummaryStat label="Ready to send" value={summary.readyToSend} tone="ok" />
          <SummaryStat label="In flight" value={summary.inFlight} tone="accent" />
          <SummaryStat label="Draft" value={summary.draft} />
          <SummaryStat label="Blocked" value={summary.blocked} tone="danger" />
        </div>
      </div>

      <DecisionExplanation
        title="How the outreach log stays honest"
        reasons={[
          "Every item ties back to a Promotion Queue item and a Printing Press asset — outreach uses drafted copy, never improvised claims.",
          "Status moves draft → ready_to_send → sent → replied → follow_up_needed → closed, so nothing is forgotten or double-sent.",
          "Each item carries the single next action, the channel, and the asset used.",
        ]}
        watchOutFor={[
          "Blocked promotion = blocked outreach. If the related queue item is not actionable, the outreach must not go outbound (the card flags any mismatch).",
          "No sending here — this is a record. Email, posting, CRM, and automation are deliberately out of scope.",
          "Protected/separate sites (PARR, Last Dollar) are never the subject of promotional outreach.",
        ]}
        nextStep="Work ready-to-send items first; clear the blockers before promoting or contacting anyone else."
      />

      {groups.map((group) => (
        <section key={group.status} className="flex flex-col gap-5">
          <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground">
            {outreachStatusLabel(group.status)}
            <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
              {group.items.length}
            </span>
          </h2>
          <div className="grid gap-5">
            {group.items.map((item) => (
              <OutreachCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

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
