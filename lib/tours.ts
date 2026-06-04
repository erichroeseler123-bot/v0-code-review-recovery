import type { Market } from "@/lib/markets"

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

export type TourImageSourceType = "provider" | "operator" | "owned" | "generic" | "unverified"

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
  /**
   * Operator company shortname for affiliate/agent resale. FareHarbor affiliates
   * sell inventory that lives under each operator's own shortname
   * (e.g. "coastalhelicopters"). Omit to use our own company shortname.
   */
  providerCompany?: string
  /** Affiliate deep link for handoff providers (viator / getyourguide) */
  bookingUrl?: string
  shortDescription: string
  description: string
  durationHours: number
  priceFromCents: number
  /** Empty string => card renders a designed typographic tile */
  image: string
  imageSourceType?: TourImageSourceType
  imageVerified?: boolean
  isGenericDestinationImage?: boolean
  imageAlt?: string
  highlights: string[]
  groupSize: string
  /** Approx one-way road distance in miles (transfers). Renders a distance chip. */
  distanceMiles?: number
  /** Short scheduling note, e.g. "Pickup timed to your flight · 24/7". */
  pickupNote?: string
}

export function hasVerifiedProductImage(tour: Tour): boolean {
  return Boolean(
    tour.image &&
      tour.imageVerified === true &&
      (tour.imageSourceType === "provider" ||
        tour.imageSourceType === "operator" ||
        tour.imageSourceType === "owned"),
  )
}

/** Human duration: 1.75 => "1h 45m", 3 => "3h". */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/** Pickup / departure times — explicit pickupNote, or a sensible default per category. */
export function getDepartures(tour: Tour): string {
  if (tour.pickupNote) return tour.pickupNote
  switch (tour.category) {
    case "Transport":
      return "Pickup timed to your flight \u00b7 runs 24/7"
    case "Flightseeing":
      return "Daily \u00b7 8:00 AM, 10:30 AM & 1:00 PM"
    case "Wildlife":
      return "Daily \u00b7 8:00 AM & 1:30 PM"
    case "Cruise":
      return "Daily \u00b7 9:00 AM & 2:00 PM"
    case "Rail":
      return "Daily \u00b7 8:15 AM & 12:45 PM"
    case "Walking":
      return "Daily \u00b7 10:00 AM & 2:00 PM"
    case "Swamp":
      return "Daily \u00b7 9:00 AM, 12:00 PM & 3:00 PM"
    case "Adventure":
      return "Daily \u00b7 9:00 AM & 1:00 PM"
    case "Group":
      return "Daily \u00b7 10:00 AM & 2:30 PM"
    default:
      return "Daily departures"
  }
}

export const TOURS: Tour[] = [
  // ───────────────────────────── ALASKA (FareHarbor, on-site) ─────────────────────────────
  {
    slug: "mendenhall-glacier-helicopter",
    marketId: "alaska",
    title: "Mendenhall Glacier Helicopter & Glacier Walk",
    location: "Juneau",
    category: "Flightseeing",
    // Live FareHarbor inventory: TEMSCO Juneau "Mendenhall Glacier and Guided Walk"
    providerCompany: "temscoair-juneau",
    providerRef: "214803",
    shortDescription: "Soar over the icefield and step out onto a living glacier.",
    description:
      "Lift off from Juneau and fly over the vast Juneau Icefield before landing on Mendenhall Glacier itself. With crampons fitted and a certified guide leading the way, you'll walk among blue crevasses and meltwater pools high above the tree line. This is the single most requested shore excursion in Southeast Alaska.",
    durationHours: 3,
    priceFromCents: 54900,
    image: "/wta/mendenhall-helicopter.png",
    highlights: [
      "Helicopter flightseeing over the Juneau Icefield",
      "Guided glacier walk with all gear provided",
      "Small groups, expert pilots and guides",
      "Round-trip transport from the cruise dock",
    ],
    groupSize: "Up to 6 per helicopter",
  },
  {
    slug: "five-glacier-seaplane",
    marketId: "alaska",
    title: "5-Glacier Seaplane Flightseeing",
    location: "Juneau",
    category: "Flightseeing",
    // Live FareHarbor inventory: Wings Airways "5-Glacier Seaplane Exploration"
    providerCompany: "wingsairways",
    providerRef: "256881",
    shortDescription: "Fly over five glaciers and the Juneau Icefield by floatplane.",
    description:
      "Take off from the water in a classic floatplane and soar over five named glaciers spilling out of the vast Juneau Icefield. From the air you'll see crevasse fields, meltwater pools, and snow-capped peaks no road can reach — then touch back down on the water at the harbor. A cruise-guest favorite that fits neatly inside a port day.",
    durationHours: 1.5,
    priceFromCents: 32900,
    image: "/wta/seaplane-glacier.png",
    highlights: [
      "Floatplane flight over five glaciers",
      "Aerial views of the Juneau Icefield",
      "Cruise-timed to fit your port day",
      "Round-trip transport from the dock",
    ],
    groupSize: "Small group floatplane",
  },
  {
    slug: "juneau-whale-watching",
    marketId: "alaska",
    title: "Juneau Whale Watching & Wildlife Cruise",
    location: "Juneau",
    category: "Wildlife",
    // Live FareHarbor inventory: Dolphin Jet Boat Tours "Whale Watching Adventure"
    providerRef: "2436",
    providerCompany: "dolphintours",
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
    // Pending operator mapping (White Pass railway is not on FareHarbor)
    shortDescription: "Ride the historic gold-rush railway into the mountains.",
    description:
      "Climb nearly 3,000 feet in just 20 miles aboard vintage rail cars on one of the most scenic railways in the world. Built during the Klondike Gold Rush, the White Pass route carries you past waterfalls, gorges, and the original Trail of '98, with narration that brings the history to life.",
    durationHours: 4,
    priceFromCents: 15900,
    image: "/wta/white-pass-train.png",
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
    // Live FareHarbor inventory: Taquan Air "Anan Creek Bear Adventure & Flightseeing" (seasonal, opens July)
    providerRef: "560411",
    providerCompany: "taquanair",
    shortDescription: "Watch wild black bears fish for salmon in the Tongass.",
    description:
      "Travel into the Tongass National Forest, the largest temperate rainforest in the country, to a protected salmon stream where black bears gather to feed. From elevated boardwalks, watch bears, eagles, and salmon in their natural habitat alongside an expert wildlife guide.",
    durationHours: 3,
    priceFromCents: 21900,
    image: "/wta/ketchikan-wildlife.png",
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
    // Pending operator mapping
    shortDescription: "Sail a narrow fjord to a tidewater glacier face.",
    description:
      "Cruise deep into Tracy Arm, a steep-walled fjord lined with waterfalls and floating ice, all the way to the face of Sawyer Glacier. Watch for harbor seals resting on icebergs and listen for the thunder of calving ice. A full-day signature experience for those who want the real Alaska.",
    durationHours: 6,
    priceFromCents: 24900,
    image: "/wta/juneau-cruise.png",
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
    // Pending operator mapping
    shortDescription: "Walk the boardwalks of a preserved gold-rush town.",
    description:
      "Step back to 1898 on a guided walk through Skagway's historic district, part of the Klondike Gold Rush National Historical Park. Hear the stories of stampeders, saloons, and con men as you explore preserved storefronts and boardwalks just steps from the ship.",
    durationHours: 2,
    priceFromCents: 6900,
    image: "/wta/skagway.png",
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
    image: "/last-frontier/glacier-bay-kayaking.png",
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
    image: "/last-frontier/ketchikan-totem-poles.png",
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
    image: "/nola/honey-island-swamp.png",
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
    image: "/nola/french-quarter-walking-tour.png",
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
    image: "/dells/wisconsin-dells-boat-tour.png",
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
    image: "/dells/upper-dells-shore-landing.png",
    highlights: ["Iconic sandstone gorges", "Guided shore landings", "Relaxed pace", "Group friendly"],
    groupSize: "Group friendly",
  },

  // ─────────────────────── GOSNO (Custom booking system, on-site) ───────────────────────
  {
    slug: "denver-to-breckenridge-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Breckenridge Private SUV",
    location: "Breckenridge",
    category: "Transport",
    shortDescription: "Private airport transfer for ski weekends and direct arrivals.",
    description:
      "A private 4WD SUV picks you up curbside at DEN and drives your group straight to Breckenridge — flight tracking included, room for ski bags and winter luggage, and your return to Denver booked at the same time. Reserved and paid on-site.",
    durationHours: 2,
    priceFromCents: 44900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 104,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-vail-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Vail Private SUV",
    location: "Vail",
    category: "Transport",
    shortDescription: "Longer resort transfer with timing handled before you land.",
    description:
      "Private transportation from Denver International to Vail, built for travelers who want the logistics solved before they arrive. Flight tracking, ski-gear space, and a pre-booked return ride to Denver. Reserved and paid on-site.",
    durationHours: 2,
    priceFromCents: 44900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 120,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-keystone-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Keystone Private SUV",
    location: "Keystone",
    category: "Transport",
    shortDescription: "Simple Summit County transfer with direct drop-off.",
    description:
      "A clean Summit County transfer from DEN to Keystone with room for ski gear, curbside airport pickup, and direct drop-off at your lodging. Return ride booked at the same time. Reserved and paid on-site.",
    durationHours: 1.75,
    priceFromCents: 34900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 95,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-winter-park-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Winter Park Private SUV",
    location: "Winter Park",
    category: "Transport",
    shortDescription: "Clean Winter Park transport for couples, families, and weekends.",
    description:
      "Private Winter Park transportation from Denver International for couples, families, and weekend ski trips. Flight tracking, gear space, and a pre-booked return to Denver. Reserved and paid on-site.",
    durationHours: 1.75,
    priceFromCents: 34900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 85,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-copper-mountain-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Copper Mountain Private SUV",
    location: "Copper Mountain",
    category: "Transport",
    shortDescription: "Private rides into Copper with no parking or rental-car stress.",
    description:
      "Private transportation into Copper Mountain from DEN — no parking stress, no rental-car guessing. Flight tracking, ski-gear room, and a return ride booked up front. Reserved and paid on-site.",
    durationHours: 1.83,
    priceFromCents: 44900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 100,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-aspen-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Aspen Private SUV",
    location: "Aspen",
    category: "Transport",
    shortDescription: "Premium long-distance transfer for Aspen and Snowmass trips.",
    description:
      "Premium long-distance private transportation for Aspen and Snowmass trips that need direct control. Flight tracking, gear space, and a pre-booked return to Denver. Reserved and paid on-site.",
    durationHours: 3.75,
    priceFromCents: 69900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 200,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-steamboat-springs-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Steamboat Springs Private SUV",
    location: "Steamboat Springs",
    category: "Transport",
    shortDescription: "Long-route transfer with direct ride options for Steamboat.",
    description:
      "A long-route airport transfer with direct private ride options for Steamboat Springs arrivals and return trips. Flight tracking, ski-gear space, and a return booked in advance. Reserved and paid on-site.",
    durationHours: 3,
    priceFromCents: 69900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 157,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },
  {
    slug: "denver-to-beaver-creek-private-suv",
    marketId: "gosno",
    title: "Denver Airport → Beaver Creek Private SUV",
    location: "Beaver Creek",
    category: "Transport",
    shortDescription: "Private resort transportation for smoother premium arrivals.",
    description:
      "Private resort transportation built for smoother, premium arrivals into Beaver Creek from Denver International. Flight tracking, gear space, and a pre-booked return ride. Reserved and paid on-site.",
    durationHours: 2.25,
    priceFromCents: 44900,
    image: "/gosno/suburban.jpg",
    distanceMiles: 135,
    pickupNote: "Pickup timed to your flight · 24/7",
    highlights: ["Private door-to-door", "Flight tracking included", "Room for ski gear", "Round-trip planning"],
    groupSize: "Up to 6 + luggage",
  },

  // ─────────────────────── SHUTTLEYA (Custom booking system, on-site) ───────────────────────
  {
    slug: "argo-cable-car-shuttle",
    marketId: "shuttleya",
    title: "9AM Argo Express — Mighty Argo Cable Car Shuttle",
    location: "Idaho Springs",
    category: "Transport",
    shortDescription: "$35 round-trip from Denver or Golden, timed to the first cable car.",
    description:
      "One shared shuttle, one job: catch the 10AM first run of the Mighty Argo Cable Car without driving, parking, or guessing your return. Depart Denver or Golden at 9:00 AM sharp, arrive for the first cable car run at 10:00 AM, and you're back in Denver by 12:30–12:45 PM. Seats are limited and departures can fill the night before. Reserve and pay on-site.",
    durationHours: 4,
    priceFromCents: 3500,
    image: "/markets/argo-shuttle.png",
    highlights: [
      "9:00 AM sharp departure",
      "Arrive for the 10AM first cable car run",
      "Denver or Golden pickup, confirmed before the trip",
      "Back in Denver by 12:45 PM",
    ],
    groupSize: "$35 per person, round-trip",
  },

  // ─────────────────────── WELCOME TO THE SWAMP extra tours ───────────────────────
  {
    slug: "swamp-airboat-adventure",
    marketId: "new-orleans",
    title: "New Orleans Airboat Swamp Adventure",
    location: "New Orleans",
    category: "Airboat",
    bookingUrl: "https://www.viator.com/tours/New-Orleans/Airboat-Swamp-Tour-from-New-Orleans/d945-5479AIRBOAT",
    shortDescription: "Fly across the Louisiana marsh on a flat-bottom airboat.",
    description:
      "Hold on tight as a fan-powered airboat rockets you through the Louisiana marsh. See alligators, egrets, and nutria up close while a Cajun guide explains life on the bayou. Hotel pickup available from the French Quarter. Booked through our vetted Viator partner.",
    durationHours: 3,
    priceFromCents: 8900,
    image: "/swamp/airboat-tour.png",
    highlights: ["Airboat ride", "Alligator encounters", "Hotel pickup available", "Cajun guide"],
    groupSize: "Small group",
  },
  {
    slug: "new-orleans-jazz-food-tour",
    marketId: "new-orleans",
    title: "New Orleans Jazz & Food Walking Tour",
    location: "New Orleans",
    category: "Food & Jazz",
    bookingUrl: "https://www.viator.com/tours/New-Orleans/New-Orleans-Jazz-and-Food-Tour/d945-3762JAZZFOOD",
    shortDescription: "Eat your way through the Quarter with live jazz stops.",
    description:
      "Hit six iconic spots in the French Quarter — beignets, po-boys, gumbo, and pralines — while your local guide weaves in the history of jazz that was born on these streets. An easy, delicious introduction to the city. Booked through our vetted Viator partner.",
    durationHours: 2.5,
    priceFromCents: 6900,
    image: "/swamp/french-quarter-night.png",
    highlights: ["Six food stops", "Live jazz venues", "Local guide", "French Quarter history"],
    groupSize: "Small group",
  },
  {
    slug: "swamp-alligator-feeding-tour",
    marketId: "new-orleans",
    title: "Bayou Alligator & Wildlife Small Boat Tour",
    location: "New Orleans",
    category: "Swamp",
    bookingUrl: "https://www.viator.com/tours/New-Orleans/Swamp-and-Bayou-Boat-Tour-from-New-Orleans/d945-5479SWAMP",
    shortDescription: "Small flat-bottom boat deep into true Louisiana bayou.",
    description:
      "Board a small, shallow-draft boat with a licensed Cajun guide and push deep into the Atchafalaya Basin — America's largest river swamp. See wild alligators, watch for black bears, and learn how people have lived on the water for generations. Booked through our vetted Viator partner.",
    durationHours: 2,
    priceFromCents: 5900,
    image: "/swamp/alligator.png",
    highlights: ["Wild alligator viewing", "Deep bayou access", "Small boat, close encounters", "Expert Cajun guide"],
    groupSize: "Up to 8",
  },

  // ─────────────────────── JUNEAU FLIGHT DECK (FareHarbor, on-site) ───────────────────────
  {
    slug: "juneau-helicopter-glacier-walk",
    marketId: "juneau-flight-deck",
    title: "Mendenhall Glacier Helicopter & Walk",
    location: "Juneau",
    category: "Helicopter",
    providerCompany: "temscoair-juneau",
    providerRef: "214803",
    shortDescription: "Land on the glacier and walk with a certified guide.",
    description:
      "Lift off from the Juneau waterfront, cross the icefield, and set down on Mendenhall Glacier. With crampons and a guide, walk among blue crevasses and meltwater pools no road can reach. The signature Juneau shore excursion, timed precisely to your port day.",
    durationHours: 3,
    priceFromCents: 54900,
    image: "/juneau/helicopter-glacier-walk.png",
    highlights: ["Glacier landing", "Guided walk on ice", "Certified pilot & guide", "Port-day timed"],
    groupSize: "Up to 8 per helicopter",
  },
  {
    slug: "juneau-dog-sled-glacier",
    marketId: "juneau-flight-deck",
    title: "Helicopter to Dog Sled Camp on the Glacier",
    location: "Juneau",
    category: "Dog Sled",
    providerCompany: "temscoair-juneau",
    providerRef: "214804",
    shortDescription: "Fly to the glacier, then mush your own dog sled team.",
    description:
      "Helicopter up to the glacier, then take the controls of a real sled dog team on a working Alaskan mushing camp. The dogs are born and trained up here — meet the puppies, hear the mushers, then hold the reins and feel what the Iditarod starts from. Back to the dock before your ship leaves.",
    durationHours: 3.5,
    priceFromCents: 64900,
    image: "/juneau/dog-sled.png",
    highlights: ["Helicopter to glacier camp", "Drive your own dog sled", "Meet sled dog puppies", "Port-day timed"],
    groupSize: "Up to 8 per helicopter",
  },
  {
    slug: "juneau-5-glacier-seaplane",
    marketId: "juneau-flight-deck",
    title: "5-Glacier Seaplane Flightseeing",
    location: "Juneau",
    category: "Floatplane",
    providerCompany: "wingsairways",
    providerRef: "256881",
    shortDescription: "Floatplane over five glaciers and the Juneau Icefield.",
    description:
      "Take off from the harbor and soar over five named glaciers pouring off the Juneau Icefield. Water takeoff, open cockpit views, and a pilot narrating every peak and crevasse below. Lands back on the harbor — under two hours, perfect for a port day.",
    durationHours: 1.5,
    priceFromCents: 32900,
    image: "/wta/seaplane-glacier.png",
    highlights: ["Five glaciers in one flight", "Water takeoff and landing", "Pilot narration", "Under 2 hours"],
    groupSize: "Up to 5 per plane",
  },
  {
    slug: "juneau-whale-watching-wildlife",
    marketId: "juneau-flight-deck",
    title: "Juneau Whale Watching & Wildlife Cruise",
    location: "Juneau",
    category: "Wildlife",
    providerCompany: "dolphintours",
    providerRef: "2436",
    shortDescription: "Humpbacks, orcas, and eagles in Auke Bay.",
    description:
      "Cruise Auke Bay on a stabilized wildlife vessel with naturalist guides on board. Humpback whales bubble-net feed in these waters — if you don't see a whale, you get a refund. Eagles, sea lions, and orcas are regular sightings too. Back to the dock well before departure.",
    durationHours: 3.5,
    priceFromCents: 18900,
    image: "/juneau/whale-fluke.png",
    highlights: ["Whale sighting guarantee", "Naturalist guide on board", "Heated enclosed vessel", "Port-day timed"],
    groupSize: "Up to 30",
  },

  // ─────────────── ST. CROIX VALLEY / SOMERSET (partner handoff — DCC guide layer) ───────────────
  // DCC owns these decision/guide pages. The shuttle entry hands off to the SEPARATE
  // conversion site (shuttletosomersetamphitheater.com) with tracked UTM attribution.
  {
    slug: "somerset-amphitheater-shuttle",
    marketId: "somerset",
    title: "Shuttle to Somerset Amphitheater",
    location: "Somerset",
    category: "Transport",
    bookingUrl: "https://shuttletosomersetamphitheater.com",
    shortDescription: "Skip the parking and the post-show traffic — ride to the show.",
    description:
      "The cleanest way to do a show night at Somerset Amphitheater: reserve a round-trip shuttle and skip the parking lot, the walk, and the post-show traffic crawl. Booking and payment are handled on our dedicated shuttle site — this guide just points you to the right place.",
    durationHours: 5,
    priceFromCents: 4500,
    image: "/somerset/amphitheater-shuttle.png",
    highlights: ["Round-trip to the venue", "No parking or traffic", "Group-friendly", "Booked on the shuttle site"],
    groupSize: "Groups welcome",
  },
  {
    slug: "apple-river-tubing-day",
    marketId: "somerset",
    title: "Apple River Tubing Day",
    location: "Apple River",
    category: "Adventure",
    bookingUrl: "https://shuttletosomersetamphitheater.com",
    shortDescription: "Float the Apple River — the classic Somerset summer day.",
    description:
      "The signature Somerset summer outing: float the Apple River with your crew, sun and water all afternoon. Use this guide to plan your day, then book tubes and transport through our partner so you're not driving and parking twice.",
    durationHours: 4,
    priceFromCents: 3000,
    image: "/somerset/apple-river-tubing.png",
    highlights: ["Classic river float", "Built for groups", "Plan the whole day", "Partner booking"],
    groupSize: "Groups welcome",
  },
  {
    slug: "stillwater-riverfront-evening",
    marketId: "somerset",
    title: "Stillwater Riverfront Evening",
    location: "Stillwater",
    category: "Walking",
    bookingUrl: "https://shuttletosomersetamphitheater.com",
    shortDescription: "Dinner, patios, and the lift bridge in historic Stillwater.",
    description:
      "Make a night of it in historic Stillwater: riverfront patios, local restaurants, and the iconic lift bridge over the St. Croix. A self-guided evening plan for couples and groups — pair it with a show or a river day for the full St. Croix Valley weekend.",
    durationHours: 3,
    priceFromCents: 0,
    image: "/somerset/stillwater-riverfront.png",
    highlights: ["Riverfront dining", "Historic downtown", "Lift bridge views", "Self-guided plan"],
    groupSize: "Couples & groups",
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
  if (cents <= 0) return "Free"
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
}
