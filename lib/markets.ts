/**
 * MARKETS CONFIG — the network registry.
 * --------------------------------------
 * This is the "add a new area" system. To launch a new storefront, add one
 * entry here and point it at a booking provider. Everything else (storefront
 * layout, cart, checkout shell) is shared by the engine.
 *
 * Booking providers:
 *  - "fareharbor"   : on-site cart + checkout via FareHarbor API
 *  - "rezdy"        : on-site cart + checkout via Rezdy API
 *  - "viator"       : affiliate handoff (Viator takes payment)
 *  - "getyourguide" : affiliate handoff (GetYourGuide takes payment)
 */

export type BookingProvider = "fareharbor" | "rezdy" | "viator" | "getyourguide"

export type MarketStatus = "live" | "building" | "protected"

export interface Market {
  id: string
  /** Full site name */
  name: string
  /** Short brand label shown in the header */
  brand: string
  domain: string
  provider: BookingProvider
  /** True = checkout happens on our own site. False = partner handoff. */
  onSiteCheckout: boolean
  region: string
  tagline: string
  /** One-line description of the single question this site answers */
  scope: string
  ports: string[]
  /** Accent hue (oklch hue angle) so each storefront feels local but on-brand */
  accentHue: number
  status: MarketStatus
}

export const MARKETS: Record<string, Market> = {
  alaska: {
    id: "alaska",
    name: "Welcome to Alaska Tours",
    brand: "Welcome to Alaska",
    domain: "welcometoalaskatours.com",
    provider: "fareharbor",
    onSiteCheckout: true,
    region: "Alaska",
    tagline: "Cruise-port shore excursions across Alaska",
    scope: "What shore excursion should I book at my Alaska cruise port?",
    ports: ["Juneau", "Ketchikan", "Skagway"],
    accentHue: 232,
    status: "live",
  },
  "last-frontier": {
    id: "last-frontier",
    name: "Last Frontier Shore Excursions",
    brand: "Last Frontier",
    domain: "lastfrontiershore.com",
    provider: "viator",
    onSiteCheckout: false,
    region: "Alaska",
    tagline: "Hand-picked Alaska cruise-port shore excursions",
    scope: "Which vetted shore excursion fits my Alaska port stop?",
    ports: ["Juneau", "Ketchikan", "Skagway", "Sitka"],
    accentHue: 200,
    status: "building",
  },
  "new-orleans": {
    id: "new-orleans",
    name: "Welcome to New Orleans Tours",
    brand: "Welcome to the Swamp",
    domain: "welcometotheswamp.com",
    provider: "viator",
    onSiteCheckout: false,
    region: "Louisiana",
    tagline: "Swamp tours and New Orleans experiences",
    scope: "Which swamp or New Orleans tour should I book?",
    ports: ["New Orleans"],
    accentHue: 145,
    status: "building",
  },
  dells: {
    id: "dells",
    name: "Welcome to the Dells",
    brand: "The Dells",
    domain: "welcometothedells.com",
    provider: "getyourguide",
    onSiteCheckout: false,
    region: "Wisconsin",
    tagline: "Group trips and getaways in Wisconsin Dells",
    scope: "What should our group do in the Wisconsin Dells?",
    ports: ["Wisconsin Dells"],
    accentHue: 95,
    status: "building",
  },
  gosno: {
    id: "gosno",
    name: "GoSno",
    brand: "GoSno",
    domain: "gosno.co",
    provider: "rezdy",
    onSiteCheckout: true,
    region: "Colorado",
    tagline: "Private mountain transportation in Colorado",
    scope: "How do I get a private ride to the Colorado mountains?",
    ports: ["Denver", "Summit County"],
    accentHue: 250,
    status: "building",
  },
  shuttleya: {
    id: "shuttleya",
    name: "Shuttleya",
    brand: "Shuttleya",
    domain: "shuttleya.com",
    provider: "rezdy",
    onSiteCheckout: true,
    region: "Colorado",
    tagline: "Shuttle service to the Mighty Argo Cable Car",
    scope: "How do I get a shuttle to the Mighty Argo Cable Car?",
    ports: ["Idaho Springs"],
    accentHue: 40,
    status: "building",
  },
}

/** Sites that exist in the network but are intentionally NOT run by this engine. */
export const PROTECTED_SITES = [
  {
    name: "Party at Red Rocks",
    domain: "partyatredrocks.com",
    note: "Proven, own checkout. Protected — not managed by the engine.",
  },
] as const

export function getMarket(id: string): Market | undefined {
  return MARKETS[id]
}

export const ALL_MARKETS = Object.values(MARKETS)

/** The flagship market (used where a single default is needed). */
export const FLAGSHIP_MARKET = MARKETS.alaska
