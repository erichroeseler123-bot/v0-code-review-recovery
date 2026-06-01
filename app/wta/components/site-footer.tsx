import { Anchor } from "lucide-react"

const PORT_LINKS = ["Juneau", "Skagway", "Ketchikan", "Sitka", "Seward", "Whittier"]
const TYPE_LINKS = ["Whale watching", "Glacier flightseeing", "Scenic rail", "Wildlife tours"]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Anchor className="size-4" aria-hidden="true" />
              </span>
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
                Welcome to Alaska Tours
              </span>
            </div>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              Alaska tours sorted by port, timing, and traveler fit. We help you choose the right tour
              for your day, then hand you to the operator&apos;s live booking. We don&apos;t operate
              tours or hold inventory.
            </p>
          </div>

          <nav aria-label="Tours by port" className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">By port</h2>
            <ul className="flex flex-col gap-2">
              {PORT_LINKS.map((p) => (
                <li key={p}>
                  <a href="#ports" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Tours by type" className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">By tour type</h2>
            <ul className="flex flex-col gap-2">
              {TYPE_LINKS.map((t) => (
                <li key={t}>
                  <a href="#tour-types" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Welcome to Alaska Tours. Tours operated by independent local operators.</p>
          <p>Availability, timing, and pricing confirmed at operator checkout.</p>
        </div>
      </div>
    </footer>
  )
}
