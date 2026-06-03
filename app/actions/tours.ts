'use server'

import { fareHarborAdapter } from '@/lib/booking/fareharbor'
import type { Tour } from '@/lib/tours'

/**
 * Batch fetch FareHarbor images and enrich tour objects with real URLs.
 * Runs server-side only to avoid exposing API keys.
 */
export async function enrichToursWithImages(tours: Tour[]): Promise<Tour[]> {
  return Promise.all(
    tours.map(async (tour) => {
      // If tour already has an image, skip fetching
      if (tour.image) {
        return tour
      }

      // Only fetch for FareHarbor tours
      if (!tour.providerRef || !tour.providerCompany) {
        return tour
      }

      try {
        const details = await fareHarborAdapter.getItemDetails?.(tour.providerRef, tour.providerCompany)
        if (details?.imageUrl) {
          return { ...tour, image: details.imageUrl }
        }
      } catch {
        // Silently fail - tour will render without image
      }

      return tour
    })
  )
}

/**
 * Client-side fallback for fetching a single tour image.
 * This is deprecated - use enrichToursWithImages on server instead.
 */
export async function getTourImageUrl(tour: Tour): Promise<string | undefined> {
  if (tour.image || !tour.providerRef || !tour.providerCompany) {
    return tour.image || undefined
  }

  try {
    const details = await fareHarborAdapter.getItemDetails?.(tour.providerRef, tour.providerCompany)
    return details?.imageUrl
  } catch (error) {
    return undefined
  }
}
