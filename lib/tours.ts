export interface Tour {
  slug: string
  title: string
  port: string
  category: "Flightseeing" | "Wildlife" | "Rail" | "Cruise" | "Walking"
  /** FareHarbor item pk — used by the booking adapter to fetch availability */
  fareHarborItemId: string
  shortDescription: string
  description: string
  durationHours: number
  priceFromCents: number
  image: string
  highlights: string[]
  groupSize: string
}

export const TOURS: Tour[] = [
  {
    slug: "mendenhall-glacier-helicopter",
    title: "Mendenhall Glacier Helicopter & Glacier Walk",
    port: "Juneau",
    category: "Flightseeing",
    fareHarborItemId: "100001",
    shortDescription: "Soar over the icefield and step out onto a living glacier.",
    description:
      "Lift off from Juneau and fly over the vast Juneau Icefield before landing on Mendenhall Glacier itself. With crampons fitted and a certified guide leading the way, you'll walk among blue crevasses and meltwater pools high above the tree line. This is the single most requested shore excursion in Southeast Alaska — and with good reason.",
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
    title: "Juneau Whale Watching & Wildlife Cruise",
    port: "Juneau",
    category: "Wildlife",
    fareHarborItemId: "100002",
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
    title: "White Pass & Yukon Route Scenic Railway",
    port: "Skagway",
    category: "Rail",
    fareHarborItemId: "100003",
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
    title: "Ketchikan Black Bear & Rainforest Wildlife Tour",
    port: "Ketchikan",
    category: "Wildlife",
    fareHarborItemId: "100004",
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
    title: "Tracy Arm Fjord & Sawyer Glacier Cruise",
    port: "Juneau",
    category: "Cruise",
    fareHarborItemId: "100005",
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
    title: "Skagway Gold-Rush Historic Walking Tour",
    port: "Skagway",
    category: "Walking",
    fareHarborItemId: "100006",
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
]

export function getTour(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug)
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export const PORTS = Array.from(new Set(TOURS.map((t) => t.port)))
