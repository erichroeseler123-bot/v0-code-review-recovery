import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TOURS } from "@/lib/tours"

const PORT_IMAGES: Record<string, string> = {
  Juneau: "/wta/helicopter-glacier.png",
  Skagway: "/wta/scenic-train.png",
  Ketchikan: "/wta/bear-wildlife.png",
  Sitka: "/wta/whale-watching.png",
  Seward: "/wta/hero-glacier-fjord.png",
}

export function PortsSection() {
  const ports = Array.from(new Set(TOURS.map((t) => t.port))).map((port) => ({
    port,
    count: TOURS.filter((t) => t.port === port).length,
    image: PORT_IMAGES[port] ?? "/wta/port-town.png",
  }))

  return (
    <section id="ports" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">By Cruise Port</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground text-balance">
            Where does your ship dock?
          </h2>
        </div>
        <Link
          href="/tours"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          All tours <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {ports.map(({ port, count, image }) => (
          <Link
            key={port}
            href={`/tours?port=${encodeURIComponent(port)}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${port}, Alaska`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <h3 className="font-serif text-xl font-semibold text-background">{port}</h3>
              <p className="text-sm text-background/80">
                {count} tour{count === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
