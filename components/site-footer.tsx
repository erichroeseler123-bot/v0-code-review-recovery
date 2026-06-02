import Link from "next/link"
import type { Market } from "@/lib/markets"
import { portsForMarket } from "@/lib/tours"

export function SiteFooter({ market }: { market: Market }) {
  const base = `/s/${market.id}`
  const ports = portsForMarket(market.id)

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold text-foreground">{market.brand}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{market.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Locations</p>
          <ul className="mt-3 flex flex-col gap-2">
            {ports.map((port) => (
              <li key={port}>
                <Link
                  href={`${base}/tours?port=${encodeURIComponent(port)}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {port}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Explore</p>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link href={`${base}/tours`} className="text-sm text-muted-foreground hover:text-foreground">
                Browse all
              </Link>
            </li>
            <li>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                All network sites
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {market.name}. All rights reserved.</p>
          <p>{market.domain}</p>
        </div>
      </div>
    </footer>
  )
}
