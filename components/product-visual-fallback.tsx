import type { CSSProperties } from "react"
import { Compass, MapPin, Route } from "lucide-react"
import type { Market } from "@/lib/markets"
import type { Tour } from "@/lib/tours"
import { cn } from "@/lib/utils"

export function ProductVisualFallback({
  market,
  tour,
  className,
}: {
  market: Market
  tour: Tour
  className?: string
}) {
  const hue = market.accentHue || 210
  const style = {
    backgroundColor: `oklch(0.9 0.045 ${hue})`,
    backgroundImage: [
      `linear-gradient(135deg, oklch(0.95 0.03 ${hue}) 0%, oklch(0.78 0.08 ${hue}) 100%)`,
      "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.78) 0 1px, transparent 1px)",
      "linear-gradient(90deg, rgba(255,255,255,0.34) 1px, transparent 1px)",
      "linear-gradient(0deg, rgba(255,255,255,0.24) 1px, transparent 1px)",
    ].join(", "),
    backgroundSize: "auto, 18px 18px, 32px 32px, 32px 32px",
    color: `oklch(0.25 0.06 ${hue})`,
  } satisfies CSSProperties

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[180px] w-full overflow-hidden p-4 sm:p-5",
        className,
      )}
      style={style}
      aria-label={`${tour.title} product information`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.55),transparent_44%,rgba(0,0,0,0.08))]" />
      <div className="absolute -right-8 top-6 h-28 w-28 rounded-full border border-current/15" />
      <div className="absolute -right-3 top-11 h-16 w-16 rounded-full border border-current/10" />
      <div className="absolute bottom-8 left-6 right-6 h-px bg-current/25" />
      <div className="absolute bottom-8 left-6 h-2 w-2 -translate-y-1/2 rounded-full bg-current/55" />
      <div className="absolute bottom-8 right-6 h-2 w-2 -translate-y-1/2 rounded-full border border-current/55 bg-white/35" />

      <div className="relative z-10 flex min-h-full w-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white/35 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
            <Compass className="h-3 w-3" />
            Field note
          </span>
          <span className="rounded-full border border-current/15 bg-white/25 px-2.5 py-1 text-xs font-medium">
            {tour.category}
          </span>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] opacity-75">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{tour.location || market.region}</span>
          </div>
          <p className="max-w-[18rem] font-serif text-2xl font-semibold leading-tight text-balance sm:text-3xl">
            {tour.title}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/30 px-2.5 py-1">
            <Route className="h-3.5 w-3.5" />
            Product details
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] opacity-70">
            {market.brand}
          </span>
        </div>
      </div>
    </div>
  )
}
