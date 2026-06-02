/**
 * MARKETS CONFIG
 * --------------
 * This is the "add a new area" system. To launch a new storefront market,
 * add one entry here and point it at a booking provider. Everything else
 * (storefront layout, cart, checkout shell) is shared.
 *
 * Booking providers:
 *  - "fareharbor" : on-site cart + checkout via FareHarbor API (Alaska / WTA)
 *  - "rezdy"      : on-site cart + checkout via Rezdy API
 *  - "viator"     : affiliate handoff (Viator takes payment)
 *  - "getyourguide": affiliate handoff (GetYourGuide takes payment)
 */

export type BookingProvider = "fareharbor" | "rezdy" | "viator" | "getyourguide"

export interface Market {
  id: string
  name: string
  /** Short brand label shown in the header */
  brand: string
  domain: string
  provider: BookingProvider
  /** Whether checkout happens on our own site (true) or via partner handoff (false) */
  onSiteCheckout: boolean
  tagline: string
  ports: string[]
}

export const MARKETS: Record<string, Market> = {
  alaska: {
    id: "alaska",
    name: "Welcome to Alaska Tours",
    brand: "Welcome to Alaska",
    domain: "welcometoalaskatours.com",
    provider: "fareharbor",
    onSiteCheckout: true,
    tagline: "Cruise-port shore excursions across Alaska",
    ports: ["Juneau", "Ketchikan", "Skagway", "Sitka", "Seward"],
  },
}

/** The active market for this storefront build. */
export const ACTIVE_MARKET = MARKETS.alaska
