"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, ShoppingBag, X } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { ACTIVE_MARKET, PORTS_NAV } from "@/lib/nav"

export function SiteHeader() {
  const { count, setOpen } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            Welcome to Alaska
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Shore Excursions
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/tours" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
            All Tours
          </Link>
          {PORTS_NAV.map((port) => (
            <Link
              key={port}
              href={`/tours?port=${encodeURIComponent(port)}`}
              className="text-sm text-foreground/80 transition-colors hover:text-foreground"
            >
              {port}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/tours"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                All Tours
              </Link>
            </li>
            {PORTS_NAV.map((port) => (
              <li key={port}>
                <Link
                  href={`/tours?port=${encodeURIComponent(port)}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                >
                  {port}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 px-3 text-xs text-muted-foreground">{ACTIVE_MARKET.tagline}</p>
        </nav>
      )}
    </header>
  )
}
