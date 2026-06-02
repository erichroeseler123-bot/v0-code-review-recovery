import type { BookingProvider } from "@/lib/markets"
import type { BookingProviderAdapter } from "./types"
import { fareHarborAdapter } from "./fareharbor"
import { rezdyAdapter } from "./rezdy"
import { viatorAdapter, getYourGuideAdapter } from "./handoff"

/** Resolve the booking adapter for a given provider. */
export function getAdapter(provider: BookingProvider): BookingProviderAdapter {
  switch (provider) {
    case "fareharbor":
      return fareHarborAdapter
    case "rezdy":
      return rezdyAdapter
    case "viator":
      return viatorAdapter
    case "getyourguide":
      return getYourGuideAdapter
    default:
      throw new Error(`Unknown booking provider: ${provider as string}`)
  }
}

export type { BookingProviderAdapter } from "./types"
