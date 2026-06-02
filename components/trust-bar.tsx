import { Anchor, ShieldCheck, Ship, Users } from "lucide-react"

const ITEMS = [
  { icon: Ship, label: "Timed to your ship", note: "Tours built around cruise schedules" },
  { icon: ShieldCheck, label: "Back-on-board guarantee", note: "We get you back before departure" },
  { icon: Users, label: "Local expert guides", note: "Small groups, real Alaskans" },
  { icon: Anchor, label: "Free dock pickup", note: "Meet steps from your ship" },
]

export function TrustBar() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, label, note }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
