import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { ALL_MARKETS, getMarket } from "@/lib/markets"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export function generateStaticParams() {
  return ALL_MARKETS.map((m) => ({ market: m.id }))
}

export default async function MarketLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ market: string }>
}) {
  const { market: marketId } = await params
  const market = getMarket(marketId)
  if (!market) notFound()

  // Re-tint the storefront's primary color to this market's accent hue,
  // so each site feels local while sharing one design system.
  const hue = market.accentHue
  const themeVars = {
    "--primary": `oklch(0.44 0.085 ${hue})`,
    "--ring": `oklch(0.44 0.085 ${hue})`,
    "--sidebar-primary": `oklch(0.44 0.085 ${hue})`,
  } as React.CSSProperties

  return (
    <div style={themeVars}>
      <SiteHeader market={market} />
      {children}
      <SiteFooter market={market} />
    </div>
  )
}
