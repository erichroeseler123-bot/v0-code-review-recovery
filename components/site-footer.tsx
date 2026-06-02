import Link from "next/link"
import { ACTIVE_MARKET } from "@/lib/markets"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold text-foreground">Welcome to Alaska</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{ACTIVE_MARKET.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Ports</p>
          <ul className="mt-3 flex flex-col gap-2">
            {ACTIVE_MARKET.ports.map((port) => (
              <li key={port}>
                <Link
                  href={`/tours?port=${encodeURIComponent(port)}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {port}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Company</p>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link href="/tours" className="text-sm text-muted-foreground hover:text-foreground">
                All Tours
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="text-sm text-muted-foreground hover:text-foreground">
                Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {ACTIVE_MARKET.name}. All rights reserved.</p>
          <p>{ACTIVE_MARKET.domain}</p>
        </div>
      </div>
    </footer>
  )
}
