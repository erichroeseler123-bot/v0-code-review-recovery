import type { BookingProvider } from "@/lib/markets"
import type { BookingProviderAdapter } from "./types"
import { fareHarborAdapter } from "./fareharbor"
import { viatorAdapter, getYourGuideAdapter } from "./handoff"

/** Resolve the booking adapter for a given provider. */
export function getAdapter(provider: BookingProvider): BookingProviderAdapter {
  switch (provider) {
    case "fareharbor":
      return fareHarborAdapter
    case "viator":
      return viatorAdapter
    case "getyourguide":
      return getYourGuideAdapter
    case "custom":
      throw new Error("Custom booking provider is handled via server actions, not adapters")
    default:
      throw new Error(`Unknown booking provider: ${provider as string}`)
  }
}

export type { BookingProviderAdapter } from "./types"
