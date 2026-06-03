"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, ExternalLink, MapPin, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import type { Market } from "@/lib/markets"
import { formatPrice, type Tour } from "@/lib/tours"
import { bookingHref } from "@/lib/links"

export function TourCard({ tour, market }: { tour: Tour; market: Market }) {
  const { addItem } = useCart()
  const href = `/s/${market.id}/tours/${tour.slug}`

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      tourSlug: tour.slug,
      marketId: market.id,
      title: tour.title,
      image: tour.image,
      port: tour.location,
      priceCents: tour.priceFromCents,
      travelers: 1,
    })
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {tour.image ? (
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-between bg-primary p-4">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/80">
              {tour.location}
            </span>
            <span className="font-serif text-2xl font-semibold leading-tight text-primary-foreground text-balance">
              {tour.category}
            </span>
          </div>
        )}
        {tour.image ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground">
            {tour.category}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {tour.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {tour.durationHours} hrs
          </span>
        </div>

        <Link href={href} className="mt-2">
          <h3 className="font-serif text-lg font-semibold leading-snug text-foreground text-balance">
            {tour.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tour.shortDescription}</p>

        <div className="mt-4 flex items-end justify-between pt-2">
          <div>
            <span className="text-xs text-muted-foreground">From</span>
            <p className="font-serif text-xl font-semibold text-foreground">
              {formatPrice(tour.priceFromCents)}
            </p>
          </div>
          {market.onSiteCheckout ? (
            <button
              type="button"
              onClick={quickAdd}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          ) : (
            <a
              href={bookingHref(tour, market)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
