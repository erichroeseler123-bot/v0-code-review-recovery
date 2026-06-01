import Image from "next/image"
import { ArrowRight, Ship } from "lucide-react"

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <Image
        src="/wta/hero-glacier-fjord.png"
        alt="An Alaskan tidewater glacier meeting deep blue-green fjord water at golden hour, framed by snow-capped peaks"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/45 to-foreground/75" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-7 px-5 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-background backdrop-blur-sm">
          <Ship className="size-3.5" aria-hidden="true" />
          Built for cruise travelers &amp; Alaska planners
        </span>

        <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-background sm:text-5xl md:text-6xl">
          Alaska tours, sorted by port, timing, and traveler fit.
        </h1>

        <p className="max-w-xl text-pretty text-base leading-relaxed text-background/85 md:text-lg">
          Tell us your port and how much time you have on shore. We&apos;ll point you to the tours
          that actually fit your day, then hand you to the operator&apos;s live booking to confirm
          availability and timing.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <a
            href="#ports"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            Find tours by port
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a
            href="#tour-types"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-background/40 bg-background/5 px-6 py-3.5 text-base font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/15"
          >
            Browse by tour type
          </a>
        </div>

        <p className="text-xs leading-relaxed text-background/70">
          Availability, departure times, and pricing are confirmed at operator checkout. Weather can
          affect flightseeing and water tours.
        </p>
      </div>
    </section>
  )
}
