"use client"

import Link from "next/link"
import type { Market } from "@/lib/markets"

export function SiteHeader({ market }: { market: Market }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href={`/s/${market.id}`} className="text-xl font-bold">
          {market.brand}
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href={`/s/${market.id}`} className="hover:text-primary">
            Home
          </Link>
          <Link href={`/s/${market.id}/tours`} className="hover:text-primary">
            Tours
          </Link>
        </nav>
      </div>
    </header>
  )
}
