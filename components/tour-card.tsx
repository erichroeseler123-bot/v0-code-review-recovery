"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin, Plus } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice, type Tour } from "@/lib/tours"

export function TourCard({ tour }: { tour: Tour }) {
  const { addItem } = useCart()

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      tourSlug: tour.slug,
      title: tour.title,
      image: tour.image,
      port: tour.port,
      priceCents: tour.priceFromCents,
      travelers: 1,
    })
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/tours/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={tour.image || "/placeholder.svg"}
          alt={tour.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground">
          {tour.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {tour.port}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {tour.durationHours} hrs
          </span>
        </div>

        <Link href={`/tours/${tour.slug}`} className="mt-2">
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
          <button
            type="button"
            onClick={quickAdd}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
