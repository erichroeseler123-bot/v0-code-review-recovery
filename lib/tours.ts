export type TourCategory =
  | "Flightseeing"
  | "Wildlife"
  | "Rail"
  | "Cruise"
  | "Walking"
  | "Swamp"
  | "Adventure"
  | "Transport"
  | "Group"

export interface Tour {
  slug: string
  /** Which market/storefront this tour belongs to */
  marketId: string
  title: string
  /** Port / town / pickup location */
  location: string
  category: TourCategory
  /**
   * Provider reference:
   *  - fareharbor: item pk
   *  - rezdy: product code
   *  - viator/getyourguide: not used (see bookingUrl)
   */
  providerRef?: string
  /** Affiliate deep link for handoff providers (viator / getyourguide) */
  bookingUrl?: string
  shortDescription: string
  description: string
  durationHours: number
  priceFromCents: number
  /** Empty string => card renders a designed typographic tile */
  image: string
  highlights: string[]
  groupSize: string
}

export const TOURS: Tour[] = [
  // ───────────────────────────── ALASKA (FareHarbor, on-site) ─────────────────────────────
  {
    slug: "mendenhall-glacier-helicopter",
    marketId: "alaska",
    title: "Mendenhall Glacier Helicopter & Glacier Walk",
    location: "Juneau",
    category: "Flightseeing",
    providerRef: "100001",
    shortDescription: "Soar over the icefield and step out onto a living glacier.",
    description:
      "Lift off from Juneau and fly over the vast Juneau Icefield before landing on Mendenhall Glacier itself. With crampons fitted and a certified guide leading the way, you'll walk among blue crevasses and meltwater pools high above the tree line. This is the single most requested shore excursion in Southeast Alaska.",
    durationHours: 3,
    priceFromCents: 54900,
    image: "/wta/helicopter-glacier.png",
    highlights: [
      "Helicopter flightseeing over the Juneau Icefield",
      "Guided glacier walk with all gear provided",
      "Small groups, expert pilots and guides",
      "Round-trip transport from the cruise dock",
    ],
    groupSize: "Up to 6 per helicopter",
  },
  {
    slug: "juneau-whale-watching",
    marketId: "alaska",
    title: "Juneau Whale Watching & Wildlife Cruise",
    location: "Juneau",
    category: "Wildlife",
    providerRef: "100002",
    shortDescription: "Humpbacks, orcas, and eagles in the waters of Auke Bay.",
    description:
      "Cruise the rich feeding grounds of Auke Bay aboard a heated, stabilized vessel built for wildlife viewing. Naturalist guides help you spot humpback whales bubble-net feeding, orca pods, sea lions, and bald eagles. We guarantee whale sightings — if you don't see one, you get a refund.",
    durationHours: 3.5,
    priceFromCents: 18900,
    image: "/wta/whale-watching.png",
    highlights: [
      "Whale sighting guarantee",
      "Heated cabin and outdoor viewing decks",
      "Onboard naturalist guide",
      "Hotel and dock pickup included",
    ],
    groupSize: "Small group, up to 30",
  },
  {
    slug: "white-pass-scenic-railway",
    marketId: "alaska",
    title: "White Pass & Yukon Route Scenic Railway",
    location: "Skagway",
    category: "Rail",
    providerRef: "100003",
    shortDescription: "Ride the historic gold-rush railway into the mountains.",
    description:
      "Climb nearly 3,000 feet in just 20 miles aboard vintage rail cars on one of the most scenic railways in the world. Built during the Klondike Gold Rush, the White Pass route carries you past waterfalls, gorges, and the original Trail of '98, with narration that brings the history to life.",
    durationHours: 4,
    priceFromCents: 15900,
    image: "/wta/scenic-train.png",
    highlights: [
      "Historic narrow-gauge railway",
      "Panoramic gorge and waterfall views",
      "Climate-controlled vintage cars",
      "Live gold-rush history narration",
    ],
    groupSize: "Open seating",
  },
  {
    slug: "ketchikan-bear-wildlife",
    marketId: "alaska",
    title: "Ketchikan Black Bear & Rainforest Wildlife Tour",
    location: "Ketchikan",
    category: "Wildlife",
    providerRef: "100004",
    shortDescription: "Watch wild black bears fish for salmon in the Tongass.",
    description:
      "Travel into the Tongass National Forest, the largest temperate rainforest in the country, to a protected salmon stream where black bears gather to feed. From elevated boardwalks, watch bears, eagles, and salmon in their natural habitat alongside an expert wildlife guide.",
    durationHours: 3,
    priceFromCents: 21900,
    image: "/wta/bear-wildlife.png",
    highlights: [
      "Wild black bear viewing from safe boardwalks",
      "Old-growth rainforest setting",
      "Expert wildlife guide",
      "Round-trip transport from the pier",
    ],
    groupSize: "Small group, up to 12",
  },
  {
    slug: "tracy-arm-fjord-cruise",
    marketId: "alaska",
    title: "Tracy Arm Fjord & Sawyer Glacier Cruise",
    location: "Juneau",
    category: "Cruise",
    providerRef: "100005",
    shortDescription: "Sail a narrow fjord to a tidewater glacier face.",
    description:
      "Cruise deep into Tracy Arm, a steep-walled fjord lined with waterfalls and floating ice, all the way to the face of Sawyer Glacier. Watch for harbor seals resting on icebergs and listen for the thunder of calving ice. A full-day signature experience for those who want the real Alaska.",
    durationHours: 6,
    priceFromCents: 24900,
    image: "/wta/hero-glacier-fjord.png",
    highlights: [
      "Up-close tidewater glacier viewing",
      "Waterfalls and iceberg-filled fjord",
      "Light lunch and hot drinks included",
      "Naturalist narration throughout",
    ],
    groupSize: "Small group, up to 40",
  },
  {
    slug: "skagway-historic-walking",
    marketId: "alaska",
    title: "Skagway Gold-Rush Historic Walking Tour",
    location: "Skagway",
    category: "Walking",
    providerRef: "100006",
    shortDescription: "Walk the boardwalks of a preserved gold-rush town.",
    description:
      "Step back to 1898 on a guided walk through Skagway's historic district, part of the Klondike Gold Rush National Historical Park. Hear the stories of stampeders, saloons, and con men as you explore preserved storefronts and boardwalks just steps from the ship.",
    durationHours: 2,
    priceFromCents: 6900,
    image: "/wta/port-town.png",
    highlights: [
      "Guided tour of the historic district",
      "National Historical Park sites",
      "Easy walking, steps from the dock",
      "Great for all ages",
    ],
    groupSize: "Small group, up to 16",
  },

  // ─────────────────────── LAST FRONTIER (Viator, handoff) ───────────────────────
  {
    slug: "sitka-sea-otter-wildlife-quest",
    marketId: "last-frontier",
    title: "Sitka Sea Otter & Wildlife Quest",
    location: "Sitka",
    category: "Wildlife",
    bookingUrl: "https://www.viator.com/",
    shortDescription: "Sea otters, whales, and eagles on a Sitka Sound cruise.",
    description:
      "A hand-picked Sitka favorite: cruise the protected waters of Sitka Sound in search of sea otters, humpback whales, puffins, and bald eagles, with a naturalist narrating the whole way. Booked and fulfilled through our vetted Viator partner.",
    durationHours: 3,
    priceFromCents: 16900,
    image: "/wta/whale-watching.png",
    highlights: ["Sea otter viewing", "Naturalist guide", "Protected-water cruising", "Vetted operator"],
    groupSize: "Small group",
  },
  {
    slug: "ketchikan-misty-fjords-flightseeing",
    marketId: "last-frontier",
    title: "Misty Fjords Flightseeing by Floatplane",
    location: "Ketchikan",
    category: "Flightseeing",
    bookingUrl: "https://www.viator.com/",
    shortDescription: "A floatplane flight into the Misty Fjords wilderness.",
    description:
      "Soar over granite cliffs and waterfalls into Misty Fjords National Monument, with a water landing on a remote alpine lake. A vetted, top-rated Ketchikan experience booked through our Viator partner.",
    durationHours: 2,
    priceFromCents: 28900,
    image: "/wta/hero-glacier-fjord.png",
    highlights: ["Floatplane flightseeing", "Remote water landing", "Misty Fjords National Monument", "Vetted operator"],
    groupSize: "Up to 8",
  },

  // ─────────────────────── NEW ORLEANS / SWAMP (Viator, handoff) ───────────────────────
  {
    slug: "honey-island-swamp-boat-tour",
    marketId: "new-orleans",
    title: "Honey Island Swamp Boat Tour",
    location: "New Orleans",
    category: "Swamp",
    bookingUrl: "https://www.viator.com/",
    shortDescription: "Glide through one of the most pristine swamps in America.",
    description:
      "Board a small boat and glide into the Honey Island Swamp to see alligators, herons, wild boar, and cypress draped in Spanish moss. Local Cajun guides share the stories of the bayou. Booked through our vetted Viator partner.",
    durationHours: 2.5,
    priceFromCents: 7900,
    image: "",
    highlights: ["Alligator and wildlife viewing", "Cajun local guides", "Small-boat access", "Round-trip transport option"],
    groupSize: "Small group",
  },
  {
    slug: "new-orleans-cemetery-history-walk",
    marketId: "new-orleans",
    title: "New Orleans Cemetery & History Walking Tour",
    location: "New Orleans",
    category: "Walking",
    bookingUrl: "https://www.viator.com/",
    shortDescription: "Above-ground tombs and the stories behind them.",
    description:
      "Walk a historic New Orleans cemetery with a licensed guide and hear the real history behind the city's famous above-ground tombs, voodoo legends, and founding families. Booked through our vetted Viator partner.",
    durationHours: 2,
    priceFromCents: 3900,
    image: "",
    highlights: ["Licensed local guide", "Historic above-ground tombs", "City history and legends", "Easy walking"],
    groupSize: "Small group",
  },

  // ─────────────────────── THE DELLS (GetYourGuide, handoff) ───────────────────────
  {
    slug: "wisconsin-dells-duck-tour",
    marketId: "dells",
    title: "Original Wisconsin Ducks Land & Water Tour",
    location: "Wisconsin Dells",
    category: "Adventure",
    bookingUrl: "https://www.getyourguide.com/",
    shortDescription: "The classic amphibious tour over land and river.",
    description:
      "Ride a genuine WWII amphibious 'Duck' over wooded trails and splash straight into the Wisconsin River. A Dells classic the whole group will love, booked through our GetYourGuide partner.",
    durationHours: 1,
    priceFromCents: 3500,
    image: "",
    highlights: ["Land-and-water amphibious ride", "Great for groups and families", "Scenic river and trails", "Vetted operator"],
    groupSize: "Group friendly",
  },
  {
    slug: "dells-boat-tour-upper-dells",
    marketId: "dells",
    title: "Upper Dells Boat Tour with Shore Landings",
    location: "Wisconsin Dells",
    category: "Group",
    bookingUrl: "https://www.getyourguide.com/",
    shortDescription: "Sandstone cliffs and famous shore landings by boat.",
    description:
      "Cruise the Upper Dells past towering sandstone formations with guided shore landings at Witches Gulch and Stand Rock. An easy, scenic outing ideal for larger groups. Booked through our GetYourGuide partner.",
    durationHours: 2.5,
    priceFromCents: 4200,
    image: "",
    highlights: ["Iconic sandstone gorges", "Guided shore landings", "Relaxed pace", "Group friendly"],
    groupSize: "Group friendly",
  },

  // ─────────────────────── GOSNO (Rezdy, on-site) ───────────────────────
  {
    slug: "denver-airport-to-summit-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Summit County Private SUV",
    location: "Denver",
    category: "Transport",
    providerRef: "GOSNO-DEN-SUMMIT",
    shortDescription: "Private door-to-door mountain transfer in a 4WD SUV.",
    description:
      "Skip the shared shuttle. A private 4WD SUV picks you up curbside at DEN and takes your group straight to your Summit County lodging, with room for gear. Booked and paid on-site through our Rezdy system.",
    durationHours: 2,
    priceFromCents: 39900,
    image: "",
    highlights: ["Private door-to-door", "4WD mountain-ready vehicles", "Gear and ski space", "Fixed flat rate"],
    groupSize: "Up to 6 + luggage",
  },

  // ─────────────────────── SHUTTLEYA (Rezdy, on-site) ───────────────────────
  {
    slug: "argo-cable-car-shuttle",
    marketId: "shuttleya",
    title: "Mighty Argo Cable Car Shuttle",
    location: "Idaho Springs",
    category: "Transport",
    providerRef: "SHUTTLEYA-ARGO",
    shortDescription: "Round-trip shuttle to the Mighty Argo Cable Car.",
    description:
      "A simple, reliable round-trip shuttle to the Mighty Argo Cable Car in Idaho Springs. Reserve your seats and pay on-site through our Rezdy system.",
    durationHours: 1,
    priceFromCents: 2900,
    image: "",
    highlights: ["Round-trip shuttle", "Reserved seats", "On-time pickups", "Easy online booking"],
    groupSize: "Per seat",
  },
]

export function getTour(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug)
}

export function getToursByMarket(marketId: string): Tour[] {
  return TOURS.filter((t) => t.marketId === marketId)
}

export function portsForMarket(marketId: string): string[] {
  return Array.from(new Set(getToursByMarket(marketId).map((t) => t.location)))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100)
}
