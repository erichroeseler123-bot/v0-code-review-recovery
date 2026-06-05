import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Market } from "@/lib/markets"
import { getProductFeatureImage, type Tour } from "@/lib/tours"
import { ProductVisualFallback } from "@/components/product-visual-fallback"

export function PortsSection({ market, tours }: { market: Market; tours: Tour[] }) {
  const base = `/s/${market.id}`
  const locations = Array.from(new Set(tours.map((t) => t.location))).map((loc) => {
    const locationTours = tours.filter((t) => t.location === loc)
    const featuredTour = locationTours.find((tour) => getProductFeatureImage(tour)) ?? locationTours[0]
    return {
      loc,
      count: locationTours.length,
      tour: featuredTour,
      image: featuredTour ? getProductFeatureImage(featuredTour) : undefined,
    }
  })

  return (
    <section id="ports" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">By Location</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground text-balance">
            Where are you headed?
          </h2>
        </div>
        <Link
          href={`${base}/tours`}
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          All tours <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {locations.map(({ loc, count, tour, image }) => {
          const fallbackTour = tour ? { ...tour, title: loc, location: market.region } : undefined
          return (
            <Link
              key={loc}
              href={`${base}/tours?port=${encodeURIComponent(loc)}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              {image ? (
                <>
                  <Image
                    src={image.storedImageUrl}
                    alt={image.imageAlt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-serif text-xl font-semibold text-background">{loc}</h3>
                    <p className="text-sm text-background/80">
                      {count} tour{count === 1 ? "" : "s"}
                    </p>
                  </div>
                </>
              ) : fallbackTour ? (
                <ProductVisualFallback market={market} tour={fallbackTour} />
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
