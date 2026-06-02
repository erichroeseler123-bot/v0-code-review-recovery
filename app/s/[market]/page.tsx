import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getMarket } from "@/lib/markets"
import { getToursByMarket } from "@/lib/tours"
import { Hero } from "@/components/hero"
import { TrustBar } from "@/components/trust-bar"
import { PortsSection } from "@/components/ports-section"
import { TourCard } from "@/components/tour-card"
import { NearMe } from "@/components/near-me"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string }>
}): Promise<Metadata> {
  const { market: marketId } = await params
  const market = getMarket(marketId)
  if (!market) return {}
  return {
    title: `${market.name} | ${market.tagline}`,
    description: market.scope,
  }
}

export default async function MarketHome({
  params,
}: {
  params: Promise<{ market: string }>
}) {
  const { market: marketId } = await params
  const market = getMarket(marketId)
  if (!market) notFound()

  const tours = getToursByMarket(marketId)
  const heroImage = market.heroImage || tours.find((t) => t.image)?.image
  const featured = tours.slice(0, 6)

  return (
    <>
      <Hero market={market} image={heroImage} headline={market.tagline} />
      <TrustBar market={market} />
      {tours.length > 0 && <PortsSection market={market} tours={tours} />}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Featured</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground text-balance">
            Popular right now
          </h2>
        </div>
        {featured.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
            Tours for this storefront are being added.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tour) => (
              <TourCard key={tour.slug} tour={tour} market={market} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">EarthOS</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground text-balance">
            Also near {market.region}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Other experiences in the network, ranked by distance from {market.ports[0]}. Planning a
            trip? Preview now, book when you&apos;re ready.
          </p>
          <div className="mt-6">
            <NearMe defaultOrigin={market.coords} originLabel={market.ports[0]} excludeMarketId={market.id} />
          </div>
        </div>
      </section>
    </>
  )
}
