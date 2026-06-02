import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ALL_MARKETS, PROTECTED_SITES, type BookingProvider, type MarketStatus } from "@/lib/markets"
import { getToursByMarket } from "@/lib/tours"

const PROVIDER_LABEL: Record<BookingProvider, string> = {
  fareharbor: "FareHarbor",
  rezdy: "Rezdy",
  viator: "Viator",
  getyourguide: "GetYourGuide",
}

const STATUS_STYLE: Record<MarketStatus, string> = {
  live: "bg-primary/10 text-primary",
  building: "bg-accent/15 text-accent-foreground",
  protected: "bg-secondary text-secondary-foreground",
}

export default function NetworkHub() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">The Network</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] text-foreground text-balance sm:text-5xl md:text-6xl">
            Focused storefronts. One engine behind them.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Each site answers exactly one question for one place, and books through the right provider —
            FareHarbor, Rezdy, or a vetted affiliate. Add a new area by adding one entry to the registry.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Storefronts</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ALL_MARKETS.map((market) => {
            const tourCount = getToursByMarket(market.id).length
            return (
              <Link
                key={market.id}
                href={`/s/${market.id}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {market.region}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLE[market.status]}`}
                  >
                    {market.status}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-xl font-semibold text-foreground text-balance">
                  {market.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {market.scope}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">
                    {PROVIDER_LABEL[market.provider]}
                    {market.onSiteCheckout ? " · on-site cart" : " · partner"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    {tourCount > 0 ? `${tourCount} tours` : "Soon"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <h2 className="mt-16 font-serif text-2xl font-semibold text-foreground">Protected sites</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live and proven — intentionally run on their own, outside this engine.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROTECTED_SITES.map((site) => (
            <div key={site.domain} className="rounded-xl border border-dashed border-border bg-secondary/30 p-6">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE.protected}`}>
                Protected
              </span>
              <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">{site.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{site.note}</p>
              <p className="mt-3 text-xs text-muted-foreground">{site.domain}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} The Network. {ALL_MARKETS.length} storefronts · one engine.
        </div>
      </footer>
    </div>
  )
}
