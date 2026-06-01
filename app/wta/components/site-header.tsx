"use client"

import { useState } from "react"
import { Menu, X, Anchor } from "lucide-react"

const NAV = [
  { label: "Tours by port", href: "#ports" },
  { label: "Tours by type", href: "#tour-types" },
  { label: "Is it for you?", href: "#fit" },
  { label: "How booking works", href: "#booking" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Anchor className="size-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-lg font-semibold leading-none tracking-tight text-foreground">
            Welcome to Alaska Tours
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#ports"
          className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
        >
          Find cruise-safe tours
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col px-5 py-2" aria-label="Mobile">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#ports"
              onClick={() => setOpen(false)}
              className="mt-2 mb-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-base font-semibold text-primary-foreground"
            >
              Find cruise-safe tours
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
