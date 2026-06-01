import type { Metadata } from "next"
import { SiteHeader } from "./components/site-header"
import { Hero } from "./components/hero"
import { PortsSection } from "./components/ports-section"
import { TourTypesSection } from "./components/tour-types-section"
import { FitSection } from "./components/fit-section"
import { BookingSection } from "./components/booking-section"
import { SiteFooter } from "./components/site-footer"
import { wtaThemeStyle } from "./wta-theme"

export const metadata: Metadata = {
  title: "Welcome to Alaska Tours — Alaska tours by port, timing & traveler fit",
  description:
    "Alaska tours sorted by cruise port, time ashore, and traveler fit. We help you pick the right tour for your day, then hand you to the operator's live booking to confirm availability.",
}

export default function WtaStorefrontPage() {
  return (
    <div className="wta min-h-screen bg-background font-sans text-foreground" style={wtaThemeStyle}>
      <SiteHeader />
      <main>
        <Hero />
        <PortsSection />
        <TourTypesSection />
        <FitSection />
        <BookingSection />
      </main>
      <SiteFooter />
    </div>
  )
}
