/**
 * MARKETS CONFIG — the network registry.
 * --------------------------------------
 * This is the "add a new area" system. To launch a new storefront, add one
 * entry here and point it at a booking provider. Everything else (storefront
 * layout, cart, checkout shell) is shared by the engine.
 *
 * Booking providers:
 *  - "fareharbor"   : on-site cart + checkout via FareHarbor API
 *  - "custom"       : custom booking system (Neon database, Stripe checkout)
 *  - "viator"       : affiliate handoff (Viator takes payment)
 *  - "getyourguide" : affiliate handoff (GetYourGuide takes payment)
 *  - "partner"      : tracked handoff to a sibling site we own that runs the
 *                     conversion/checkout. DCC owns the decision/guide pages;
 *                     the partner site converts.
 */

export type BookingProvider = "fareharbor" | "custom" | "viator" | "getyourguide" | "partner"

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
    domain: "lastfrontiershoreexcursions.com",
    provider: "viator",
    onSiteCheckout: false,
    region: "Alaska",
    tagline: "Hand-picked Alaska cruise-port shore excursions",
    scope: "Which vetted shore excursion fits my Alaska port stop?",
    ports: ["Juneau", "Ketchikan", "Skagway", "Sitka"],
    coords: { lat: 57.0531, lng: -135.33 },
    heroImage: "/markets/last-frontier.png",
    accentHue: 200,
    status: "live",
    trust: [
      { label: "Hand-picked operators", note: "Only vetted, top-rated excursions" },
      { label: "Cruise-port timed", note: "Back before your ship departs" },
      { label: "Secure booking", note: "Reserved through trusted partners" },
      { label: "Free cancellation", note: "On most excursions" },
    ],
  },
  "new-orleans": {
    id: "new-orleans",
    name: "Welcome to the Swamp",
    brand: "Welcome to the Swamp",
    domain: "welcometotheswamp.com",
    provider: "viator",
    onSiteCheckout: false,
    region: "Louisiana",
    tagline: "New Orleans swamp tours and bayou experiences",
    scope: "Which swamp tour should I book in New Orleans?",
    ports: ["New Orleans"],
    coords: { lat: 29.9511, lng: -90.0715 },
    heroImage: "/swamp/hero-bayou.png",
    accentHue: 145,
    status: "live",
    trust: [
      { label: "Real Cajun guides", note: "Locals who know the bayou" },
      { label: "Small-group boats", note: "Up close to the wildlife" },
      { label: "Hotel pickup options", note: "Easy from the French Quarter" },
      { label: "Vetted operators", note: "Hand-picked, top-rated tours" },
    ],
  },
  "juneau-flight-deck": {
    id: "juneau-flight-deck",
    name: "Juneau Flight Deck",
    brand: "Juneau Flight Deck",
    domain: "juneauflightdeck.com",
    provider: "fareharbor",
    onSiteCheckout: true,
    region: "Alaska",
    tagline: "Juneau helicopter and floatplane tours",
    scope: "Which Juneau helicopter or floatplane tour fits my port day?",
    ports: ["Juneau"],
    coords: { lat: 58.3019, lng: -134.4197 },
    heroImage: "/juneau/hero-floatplane-dock.png",
    accentHue: 210,
    status: "live",
    trust: [
      { label: "Port-day timed", note: "Scheduled around your ship's clock" },
      { label: "Back-on-board guarantee", note: "Never miss your departure" },
      { label: "Experienced pilots", note: "Certified Alaska bush pilots" },
      { label: "Dock-to-dock service", note: "Steps from the cruise terminal" },
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
    status: "live",
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
    provider: "custom",
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
    status: "live",
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
    provider: "custom",
    onSiteCheckout: true,
    region: "Colorado",
    tagline: "Shuttle service to the Mighty Argo Cable Car",
    scope: "How do I get a shuttle to the Mighty Argo Cable Car?",
    ports: ["Idaho Springs"],
    coords: { lat: 39.7425, lng: -105.5136 },
    heroImage: "/markets/shuttleya.png",
    accentHue: 40,
    status: "live",
    trust: [
      { label: "On-time pickups", note: "Reliable round-trip service" },
      { label: "Reserved seats", note: "Your spot is guaranteed" },
      { label: "Easy online booking", note: "Reserve in under a minute" },
      { label: "Local drivers", note: "They know the canyon" },
    ],
  },
  somerset: {
    id: "somerset",
    name: "Private Somerset Amphitheater Transportation",
    brand: "Somerset Amphitheater",
    domain: "shuttletosomersetamphitheater.com",
    provider: "partner",
    onSiteCheckout: false,
    region: "Somerset, Wisconsin",
    tagline: "New to Somerset. Proven at Red Rocks.",
    scope:
      "Private Somerset Amphitheater transportation from the team behind an established Red Rocks shuttle operation. $399 private ride. Questions? Text 612-564-6025.",
    ports: ["Somerset Amphitheater"],
    coords: { lat: 45.1247, lng: -92.6754 },
    heroImage: "",
    accentHue: 150,
    status: "live",
    trust: [
      { label: "New to Somerset", note: "Western Wisconsin service" },
      { label: "Proven at Red Rocks", note: "Colorado concert shuttle background" },
      { label: "Show-night ready", note: "Pickup and return after the show" },
      { label: "Rezdy booking", note: "Rezdy handles payment and confirmation" },
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

/**
 * DOMAIN → MARKET ROUTING TABLE
 * -----------------------------
 * Maps every hostname (apex + www, plus known aliases) to its market id.
 * The middleware uses this to rewrite "/" on a brand domain to "/s/{market}".
 * Add new hostnames here when a market gets a domain or alias.
 */
export const DOMAIN_TO_MARKET: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const market of ALL_MARKETS) {
    if (!market.domain) continue
    const bare = market.domain.toLowerCase()
    map[bare] = market.id
    map[`www.${bare}`] = market.id
  }
  return map
})()

/** Resolve a request hostname to a market id, or undefined if unmapped. */
export function getMarketIdForHost(host: string | null | undefined): string | undefined {
  if (!host) return undefined
  // Strip port and lowercase
  const clean = host.split(":")[0].toLowerCase().trim()
  return DOMAIN_TO_MARKET[clean]
}

/** The flagship market (used where a single default is needed). */
export const FLAGSHIP_MARKET = MARKETS.alaska
