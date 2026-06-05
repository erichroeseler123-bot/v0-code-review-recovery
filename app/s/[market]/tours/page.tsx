import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getMarket } from "@/lib/markets"
import { getToursByMarket } from "@/lib/tours"
import { ToursBrowser } from "@/components/tours-browser"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string }>
}): Promise<Metadata> {
  const { market: marketId } = await params
  const market = getMarket(marketId)
  if (!market) return {}
  return {
    title: `All Tours | ${market.name}`,
    description: `Browse every experience from ${market.name} — ${market.tagline}.`,
  }
}

export default async function MarketToursPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>
  searchParams: Promise<{ port?: string }>
}) {
  const { market: marketId } = await params
  const { port } = await searchParams
  const market = getMarket(marketId)
  if (!market) notFound()

  const tours = getToursByMarket(marketId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-foreground text-balance">
          {market.region} experiences
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">{market.scope}</p>
      </header>
      <ToursBrowser market={market} tours={tours} initialPort={port} />
    </div>
  )
}
