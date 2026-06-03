/**
 * Canonical Rezdy product definitions — the CODEBASE is the source of truth.
 *
 * These describe the products we create in Rezdy via POST /api/rezdy/products.
 * After creation, Rezdy returns a productCode which we paste into the matching
 * tour's `providerRef` in lib/tours.ts. Availability schedules are finished in
 * the Rezdy dashboard; everything customer-facing lives here.
 *
 * Pricing mirrors the real GoSno account:
 *   - GoSno airport transfers price PER VEHICLE ("Suburban"); `maxUnits` is the
 *     number of vehicles a booking can reserve.
 *   - Shuttleya / Argo is a shared shuttle priced PER PASSENGER ("Seat").
 *
 * `slug` matches the tour slug in lib/tours.ts so the two stay linked.
 */

export interface RezdyProductDef {
  /** Matches the tour slug in lib/tours.ts */
  slug: string
  name: string
  shortDescription: string
  description: string
  /** Advertised price in cents (USD) per priceOption unit */
  priceCents: number
  /** Label for the priced unit, e.g. "Suburban" (per vehicle) or "Seat" */
  unitLabel: string
  unitLabelPlural: string
  /** Max units (vehicles or seats) a single booking can reserve */
  maxUnits: number
  /** Pickup / origin shown on the product */
  pickup: string
  /** Drop-off / destination */
  dropoff: string
}

/**
 * Rezdy product types: ACTIVITY, DAYTOUR, MULTIDAYTOUR, PRIVATE_TOUR, TICKET,
 * RENTAL, GIFT_CARD, TRANSFER, LESSON, EVENT. Airport transfers use TRANSFER.
 */
const PRODUCT_TYPE = "TRANSFER"
const CURRENCY = "USD"

export const REZDY_PRODUCT_DEFS: RezdyProductDef[] = [
  // ── GoSno: private Denver-airport mountain transfers (priced per vehicle) ──
  {
    slug: "denver-to-breckenridge-private-suv",
    name: "Denver Airport to Breckenridge — Private SUV Transfer",
    shortDescription:
      "Private SUV transfer from Denver International (DEN) to Breckenridge with flight tracking and room for ski gear.",
    description:
      "A private SUV picks you up curbside at Denver International (DEN) and drives your group straight to Breckenridge. Flight tracking is included so we are there when you land, with room for ski bags and winter luggage. Pre-book your return to Denver at the same time. Priced per vehicle.",
    priceCents: 39900,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 3,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Breckenridge, CO",
  },
  {
    slug: "denver-to-vail-private-suv",
    name: "Denver Airport to Vail — Private SUV Transfer",
    shortDescription: "Private SUV transfer from DEN to Vail with timing handled before you land.",
    description:
      "Private transportation from Denver International (DEN) to Vail, built for travelers who want the logistics solved before they arrive. Includes flight tracking, ski-gear space, and a pre-bookable return ride to Denver. Priced per vehicle.",
    priceCents: 39900,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 3,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Vail, CO",
  },
  {
    slug: "denver-to-keystone-private-suv",
    name: "Denver Airport to Keystone — Private SUV Transfer",
    shortDescription: "Direct private Summit County transfer from DEN to Keystone lodging.",
    description:
      "A clean Summit County transfer from Denver International (DEN) to Keystone, with room for ski gear, curbside airport pickup, and direct drop-off at your lodging. Pre-book your return ride at the same time. Priced per vehicle.",
    priceCents: 29900,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 6,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Keystone, CO",
  },
  {
    slug: "denver-to-winter-park-private-suv",
    name: "Denver Airport to Winter Park — Private SUV Transfer",
    shortDescription: "Private Winter Park transport for couples, families, and weekends.",
    description:
      "Private Winter Park transportation from Denver International (DEN) for couples, families, and weekend ski trips. Includes flight tracking, ski-gear space, and a pre-bookable return to Denver. Priced per vehicle.",
    priceCents: 49900,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 3,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Winter Park, CO",
  },
  {
    slug: "denver-to-copper-mountain-private-suv",
    name: "Denver Airport to Copper Mountain — Private SUV Transfer",
    shortDescription: "Private rides into Copper with no parking or rental-car stress.",
    description:
      "Private transportation into Copper Mountain from Denver International (DEN) — no parking stress and no rental-car guessing. Includes flight tracking, ski-gear room, and a return ride you can book up front. Priced per vehicle.",
    priceCents: 35000,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 6,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Copper Mountain, CO",
  },
  {
    slug: "denver-to-aspen-private-suv",
    name: "Denver Airport to Aspen — Private SUV Transfer",
    shortDescription: "Premium long-distance private transfer for Aspen and Snowmass trips.",
    description:
      "Premium long-distance private transportation for Aspen and Snowmass trips that need direct control from Denver International (DEN). Includes flight tracking, ski-gear space, and a pre-bookable return to Denver. Priced per vehicle.",
    priceCents: 69900,
    unitLabel: "Vehicle",
    unitLabelPlural: "Vehicles",
    maxUnits: 2,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Aspen / Snowmass, CO",
  },
  {
    slug: "denver-to-steamboat-springs-private-suv",
    name: "Denver Airport to Steamboat Springs — Private SUV Transfer",
    shortDescription: "Long-route private transfer for Steamboat arrivals and returns.",
    description:
      "A long-route airport transfer with direct private ride options for Steamboat Springs arrivals and return trips from Denver International (DEN). Includes flight tracking, ski-gear space, and a return booked in advance. Priced per vehicle.",
    priceCents: 59900,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 6,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Steamboat Springs, CO",
  },
  {
    slug: "denver-to-beaver-creek-private-suv",
    name: "Denver Airport to Beaver Creek — Private SUV Transfer",
    shortDescription: "Private resort transportation for smoother premium arrivals.",
    description:
      "Private resort transportation built for smoother, premium arrivals into Beaver Creek from Denver International (DEN). Includes flight tracking, ski-gear space, and a pre-bookable return ride. Priced per vehicle.",
    priceCents: 49900,
    unitLabel: "Suburban",
    unitLabelPlural: "Suburbans",
    maxUnits: 3,
    pickup: "Denver International Airport (DEN)",
    dropoff: "Beaver Creek, CO",
  },

  // ── Shuttleya: Mighty Argo Cable Car shared shuttle (priced per passenger) ──
  {
    slug: "argo-cable-car-shuttle",
    name: "9AM Argo Express — Mighty Argo Cable Car Shuttle",
    shortDescription: "$35 round-trip shared shuttle from Denver or Golden, timed to the first cable car.",
    description:
      "One shared shuttle with one job: catch the 10AM first run of the Mighty Argo Cable Car without driving, parking, or guessing your return. Depart Denver or Golden at 9:00 AM sharp, arrive for the first cable car run at 10:00 AM, and you are back in Denver by 12:30–12:45 PM. Seats are limited and departures can fill the night before. Priced per passenger, round trip.",
    priceCents: 3500,
    unitLabel: "Seat",
    unitLabelPlural: "Seats",
    maxUnits: 14,
    pickup: "Denver or Golden, CO",
    dropoff: "Mighty Argo Cable Car, Idaho Springs, CO",
  },
]

/**
 * Build the Rezdy POST /products payload from a canonical definition.
 * Shape follows the Rezdy product object: one priced unit (vehicle or seat),
 * quantity limits, and the pickup/dropoff surfaced in the description.
 */
export function toRezdyProductPayload(def: RezdyProductDef) {
  return {
    name: def.name,
    shortDescription: def.shortDescription,
    description: def.description,
    productType: PRODUCT_TYPE,
    currency: CURRENCY,
    advertisedPrice: def.priceCents / 100,
    // Our own stable reference so we can find these later in Rezdy.
    internalCode: def.slug,
    quantityRequiredMin: 1,
    quantityRequiredMax: def.maxUnits,
    unitLabel: def.unitLabel,
    unitLabelPlural: def.unitLabelPlural,
    priceOptions: [
      {
        label: def.unitLabel,
        price: def.priceCents / 100,
        seatsUsed: 1,
      },
    ],
  }
}
