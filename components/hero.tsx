import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <Image
          src="/wta/hero-glacier-fjord.png"
          alt="A tidewater glacier meeting a calm Alaskan fjord at golden hour"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-foreground/10" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-background/80">
                Alaska Cruise-Port Shore Excursions
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-background text-balance sm:text-5xl md:text-6xl">
                Your day in port, unforgettable.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/90 text-pretty">
                Glacier flightseeing, whale watching, scenic rail, and wildlife — booked in minutes,
                guided by locals, and timed to your ship.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/tours"
                  className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Browse all tours
                </Link>
                <Link
                  href="#ports"
                  className="rounded-md bg-background/15 px-6 py-3 text-sm font-semibold text-background backdrop-blur transition-colors hover:bg-background/25"
                >
                  Shop by port
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
