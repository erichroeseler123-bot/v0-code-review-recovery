"use client"

import type { Market } from "@/lib/markets"

export function SiteFooter({ market }: { market: Market }) {
  return (
    <footer className="border-t bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 {market.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
