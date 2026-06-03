'use server'

import { fareHarborAdapter } from '@/lib/booking/fareharbor'
import type { Tour } from '@/lib/tours'

/**
 * Server action to fetch tour image from FareHarbor API.
 * This runs server-side only to avoid exposing API keys.
 */
export async function getTourImageUrl(tour: Tour): Promise<string | undefined> {
  if (tour.image || !tour.providerRef) {
    return tour.image || undefined
  }

  // Only fetch FareHarbor images
  if (!tour.providerCompany) {
    return undefined
  }

  try {
    const details = await fareHarborAdapter.getItemDetails?.(tour.providerRef, tour.providerCompany)
    return details?.imageUrl
  } catch {
    return undefined
  }
}
