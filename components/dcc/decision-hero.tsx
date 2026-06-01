/**
 * DecisionHero — the shared top section for any DCC decision surface.
 *
 * "Same DNA, different local costume": every satellite uses this structure
 * (eyebrow → decision title → why-it-matters → safe next action) while keeping
 * its own imagery and voice. Presentational only.
 */

import Image from "next/image"

export type DecisionHeroProps = {
  eyebrow: string
  title: string
  description: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  image?: { src: string; alt: string }
}

export function DecisionHero({ eyebrow, title, description, primaryCta, secondaryCta, image }: DecisionHeroProps) {
  return (
    <section className="grid items-center gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</span>
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="max-w-prose text-pretty text-base leading-relaxed text-muted-foreground">{description}</p>
        {(primaryCta || secondaryCta) && (
          <div className="mt-2 flex flex-wrap gap-3">
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}
      </div>
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
          <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
        </div>
      )}
    </section>
  )
}
