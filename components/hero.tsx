import Image from "next/image"
import Link from "next/link"
import type { Market } from "@/lib/markets"

export function Hero({
  market,
  image,
  headline,
}: {
  market: Market
  /** Optional hero photo; when absent a typographic hero is rendered */
  image?: string
  headline: string
}) {
  const base = `/s/${market.id}`

  if (image) {
    return (
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <Image src={image} alt={`${market.region} — ${market.tagline}`} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-foreground/10" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-background/80">
                  {market.tagline}
                </p>
                <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-background text-balance sm:text-5xl md:text-6xl">
                  {headline}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/90 text-pretty">
                  {market.scope}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`${base}/tours`}
                    className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    Browse all
                  </Link>
                  <Link
                    href="#ports"
                    className="rounded-md bg-background/15 px-6 py-3 text-sm font-semibold text-background backdrop-blur transition-colors hover:bg-background/25"
                  >
                    Shop by location
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Typographic hero (no photo yet) — uses the storefront's brand color.
  return (
    <section className="relative bg-primary">
      <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/80">
          {market.tagline}
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-[1.05] text-primary-foreground text-balance sm:text-5xl md:text-6xl">
          {headline}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-primary-foreground/90 text-pretty">
          {market.scope}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`${base}/tours`}
            className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Browse all
          </Link>
          <Link
            href="#ports"
            className="rounded-md bg-primary-foreground/15 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition-colors hover:bg-primary-foreground/25"
          >
            Shop by location
          </Link>
        </div>
      </div>
    </section>
  )
}
