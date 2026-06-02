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
  /** Geographic center of the market — where it sits on the EarthOS world map */
  coords: { lat: number; lng: number }
  /** Hero banner image for the storefront */
  heroImage: string
  /** Accent hue (oklch hue angle) so each storefront feels local but on-brand */
  accentHue: number
  status: MarketStatus
  /** Four short trust badges shown under the hero */
  trust: { label: string; note: string }[]
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
    coords: { lat: 58.3019, lng: -134.4197 },
    heroImage: "/wta/hero-glacier-fjord.png",
    accentHue: 232,
    status: "live",
    trust: [
      { label: "Timed to your ship", note: "Tours built around cruise schedules" },
      { label: "Back-on-board guarantee", note: "We get you back before departure" },
      { label: "Local expert guides", note: "Small groups, real Alaskans" },
      { label: "Free dock pickup", note: "Meet steps from your ship" },
    ],
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
    coords: { lat: 57.0531, lng: -135.33 },
    heroImage: "/markets/last-frontier.png",
    accentHue: 200,
    status: "building",
    trust: [
      { label: "Hand-picked operators", note: "Only vetted, top-rated excursions" },
      { label: "Cruise-port timed", note: "Back before your ship departs" },
      { label: "Secure booking", note: "Reserved through trusted partners" },
      { label: "Free cancellation", note: "On most excursions" },
    ],
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
    coords: { lat: 29.9511, lng: -90.0715 },
    heroImage: "/markets/new-orleans.png",
    accentHue: 145,
    status: "building",
    trust: [
      { label: "Real Cajun guides", note: "Locals who know the bayou" },
      { label: "Small-group boats", note: "Up close to the wildlife" },
      { label: "Hotel pickup options", note: "Easy transport from the Quarter" },
      { label: "Vetted operators", note: "Hand-picked, top-rated tours" },
    ],
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
    coords: { lat: 43.6275, lng: -89.771 },
    heroImage: "/markets/dells.png",
    accentHue: 95,
    status: "building",
    trust: [
      { label: "Built for groups", note: "Plans that scale to the whole crew" },
      { label: "Family friendly", note: "Something for every age" },
      { label: "Instant confirmation", note: "Lock it in before you arrive" },
      { label: "Vetted operators", note: "Hand-picked Dells classics" },
    ],
  },
  gosno: {
    id: "gosno",
    name: "GoSno",
    brand: "GoSno",
    domain: "gosno.co",
    provider: "rezdy",
    onSiteCheckout: true,
    region: "Colorado",
    tagline: "Private Denver airport rides to Colorado resorts",
    scope: "How do I get a private ride from Denver to my Colorado resort?",
    ports: [
      "Breckenridge",
      "Vail",
      "Keystone",
      "Winter Park",
      "Copper Mountain",
      "Aspen",
      "Steamboat Springs",
      "Beaver Creek",
    ],
    coords: { lat: 39.7392, lng: -104.9903 },
    heroImage: "/markets/gosno.png",
    accentHue: 250,
    status: "building",
    trust: [
      { label: "Private, not shared", note: "Your group, your vehicle" },
      { label: "4WD mountain-ready", note: "Built for Colorado weather" },
      { label: "Flat, fixed rates", note: "No surge, no surprises" },
      { label: "Gear & ski space", note: "Room for all your equipment" },
    ],
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
    coords: { lat: 39.7425, lng: -105.5136 },
    heroImage: "/markets/shuttleya.png",
    accentHue: 40,
    status: "building",
    trust: [
      { label: "On-time pickups", note: "Reliable round-trip service" },
      { label: "Reserved seats", note: "Your spot is guaranteed" },
      { label: "Easy online booking", note: "Reserve in under a minute" },
      { label: "Local drivers", note: "They know the canyon" },
    ],
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
