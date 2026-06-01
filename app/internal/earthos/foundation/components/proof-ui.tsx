import type { ReactNode } from "react"

/**
 * Tiny presentational primitives for the internal Earth OS / DCC proof surface.
 * Internal tooling look: dense, monospace labels, neutral tokens. No behavior.
 */

export function Section({
  index,
  title,
  subtitle,
  children,
}: {
  index: number
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-border py-8">
      <header className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, "0")}</span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">{children}</div>
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "neutral" | "accent" | "warn" | "ok" | "danger"
}) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    warn: "bg-secondary text-secondary-foreground",
    ok: "bg-primary text-primary-foreground",
    danger: "border border-destructive bg-background text-destructive",
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function FieldList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[10rem_1fr]">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-subgrid sm:col-span-2">
          <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="text-sm leading-relaxed text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Pills({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "warn" | "ok" }) {
  if (items.length === 0) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <Tag key={i} tone={tone}>
          {item}
        </Tag>
      ))}
    </div>
  )
}
