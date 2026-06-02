import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/hero"
import { TrustBar } from "@/components/trust-bar"
import { PortsSection } from "@/components/ports-section"
import { TourCard } from "@/components/tour-card"
import { TOURS } from "@/lib/tours"

export default function HomePage() {
  const featured = TOURS.slice(0, 6)

  return (
    <>
      <Hero />
      <TrustBar />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Most Popular</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground text-balance">
              Signature Alaska excursions
            </h2>
          </div>
          <Link
            href="/tours"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      </section>

      <PortsSection />
    </>
  )
}
