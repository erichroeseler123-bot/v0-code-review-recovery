import { BadgeCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react"
import type { Market } from "@/lib/markets"

const ICONS = [BadgeCheck, ShieldCheck, MapPin, Sparkles]

export function TrustBar({ market }: { market: Market }) {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
        {market.trust.map(({ label, note }, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <div key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
