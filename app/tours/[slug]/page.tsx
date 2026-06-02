import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Clock, Users, Check } from "lucide-react"
import { TOURS, getTour } from "@/lib/tours"
import { TourBookingPanel } from "@/components/tour-booking-panel"

export function generateStaticParams() {
  return TOURS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tour = getTour(slug)
  if (!tour) return { title: "Tour not found" }
  return {
    title: `${tour.title} | Welcome to Alaska Tours`,
    description: tour.shortDescription,
  }
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = getTour(slug)
  if (!tour) notFound()

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <Link
        href="/tours"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {"\u2190 All tours"}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={tour.image || "/placeholder.svg"}
              alt={tour.title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4 text-primary" />
                {tour.port}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4 text-primary" />
                {tour.durationHours} hours
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-4 text-primary" />
                {tour.groupSize}
              </span>
            </div>

            <h1 className="mt-3 text-balance font-serif text-3xl font-semibold md:text-4xl">
              {tour.title}
            </h1>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              {tour.description}
            </p>

            <h2 className="mt-8 font-serif text-xl font-semibold">{"What's included"}</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <TourBookingPanel tour={tour} />
      </div>
    </article>
  )
}
