import { ALL_MARKETS, type Market } from "@/lib/markets"
import { getToursByMarket, type Tour } from "@/lib/tours"

export interface Coords {
  lat: number
  lng: number
}

export interface RankedMarket {
  market: Market
  /** Distance from the origin in miles */
  miles: number
  tourCount: number
  /** Cheapest tour price in the market, in cents (or undefined if none) */
  fromCents?: number
  tours: Tour[]
}

/**
 * Haversine great-circle distance between two points, in miles.
 * Pure math — no external API needed.
 */
export function distanceMiles(a: Coords, b: Coords): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Rank every market by distance from an origin point.
 * Works for EarthOS ("where I am") or a storefront ("assume I'm in this market").
 */
export function rankMarketsByDistance(origin: Coords): RankedMarket[] {
  return ALL_MARKETS.map((market) => {
    const tours = getToursByMarket(market.id)
    const prices = tours.map((t) => t.priceFromCents).filter((c) => c > 0)
    return {
      market,
      miles: distanceMiles(origin, market.coords),
      tourCount: tours.length,
      fromCents: prices.length ? Math.min(...prices) : undefined,
      tours,
    }
  }).sort((a, b) => a.miles - b.miles)
}

/** Human-friendly distance label. */
export function formatMiles(miles: number): string {
  if (miles < 1) return "less than a mile away"
  if (miles < 10) return `${miles.toFixed(1)} mi away`
  if (miles < 1000) return `${Math.round(miles)} mi away`
  return `${Math.round(miles).toLocaleString()} mi away`
}

/**
 * Quick-pick origins so a planner can preview a place before they travel
 * (no geocoding API needed). These are well-known anchor cities.
 */
export const QUICK_ORIGINS: { label: string; coords: Coords }[] = [
  { label: "Denver, CO", coords: { lat: 39.7392, lng: -104.9903 } },
  { label: "Chicago, IL", coords: { lat: 41.8781, lng: -87.6298 } },
  { label: "New Orleans, LA", coords: { lat: 29.9511, lng: -90.0715 } },
  { label: "Seattle, WA", coords: { lat: 47.6062, lng: -122.3321 } },
  { label: "Wisconsin Dells, WI", coords: { lat: 43.6275, lng: -89.771 } },
  { label: "Juneau, AK", coords: { lat: 58.3019, lng: -134.4197 } },
]
