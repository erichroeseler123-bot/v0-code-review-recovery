import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import type { Market } from "@/lib/markets"
import type { Tour } from "@/lib/tours"

const PORT_IMAGES: Record<string, string> = {
  Juneau: "/wta/helicopter-glacier.png",
  Skagway: "/wta/scenic-train.png",
  Ketchikan: "/wta/bear-wildlife.png",
  Sitka: "/wta/whale-watching.png",
  Seward: "/wta/hero-glacier-fjord.png",
}

export function PortsSection({ market, tours }: { market: Market; tours: Tour[] }) {
  const base = `/s/${market.id}`
  const locations = Array.from(new Set(tours.map((t) => t.location))).map((loc) => ({
    loc,
    count: tours.filter((t) => t.location === loc).length,
    image: PORT_IMAGES[loc],
  }))

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
        {locations.map(({ loc, count, image }) => (
          <Link
            key={loc}
            href={`${base}/tours?port=${encodeURIComponent(loc)}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            {image ? (
              <>
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${loc}, ${market.region}`}
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
            ) : (
              <div className="flex h-full w-full flex-col justify-between bg-primary p-4 transition-colors group-hover:bg-primary/90">
                <MapPin className="h-5 w-5 text-primary-foreground/80" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-primary-foreground">{loc}</h3>
                  <p className="text-sm text-primary-foreground/80">
                    {count} tour{count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
