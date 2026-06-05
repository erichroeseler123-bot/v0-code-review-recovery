"use client"

import Script from "next/script"

const SOMERSET_REZDY_SCRIPT = "https://gosnotransportation58.rezdy.com/pluginJs"
const SOMERSET_REZDY_IFRAME =
  "https://gosnotransportation58.rezdy.com/766964/somerset-ampitheater-shuttle?iframe=true"

export function SomersetRezdyBooking() {
  return (
    <div className="grid gap-5">
      <Script src={SOMERSET_REZDY_SCRIPT} strategy="afterInteractive" />

      <div>
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          Book your Somerset Amphitheater ride online
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose your date/time and complete booking in Rezdy. Rezdy handles payment and
          confirmation for this private Suburban ride.
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <iframe
          title="Somerset Amphitheater Rezdy booking widget"
          seamless
          width="100%"
          height="1000"
          frameBorder="0"
          className="rezdy block min-h-[1000px] w-full max-w-full border-0"
          src={SOMERSET_REZDY_IFRAME}
        />
      </div>
    </div>
  )
}

