import type { CSSProperties } from "react"
import { Compass } from "lucide-react"
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
      `linear-gradient(135deg, oklch(0.96 0.025 ${hue}) 0%, oklch(0.82 0.055 ${hue}) 100%)`,
      "linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
      "linear-gradient(0deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
    ].join(", "),
    backgroundSize: "auto, 38px 38px, 38px 38px",
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
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.58),transparent_52%,rgba(0,0,0,0.05))]" />
      <div className="absolute right-5 top-5 h-8 w-8 border-r border-t border-current/18" />
      <Compass className="absolute bottom-5 right-5 h-14 w-14 text-current/10" />

      <div className="relative z-10 flex min-h-full w-full flex-col justify-between gap-8">
        <span className="w-fit rounded-full border border-current/15 bg-white/28 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
          {tour.category}
        </span>

        <p className="max-w-[19rem] font-serif text-2xl font-semibold leading-tight text-balance sm:text-3xl">
          {tour.title}
        </p>
      </div>
    </div>
  )
}
