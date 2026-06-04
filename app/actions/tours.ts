'use server'

import { fareHarborAdapter } from '@/lib/booking/fareharbor'
import type { Tour } from '@/lib/tours'

async function enrichTourWithImage(tour: Tour): Promise<Tour> {
  if (!tour.providerRef || !tour.providerCompany) {
    return tour
  }

  try {
    const details = await fareHarborAdapter.getItemDetails?.(tour.providerRef, tour.providerCompany)
    if (details?.imageUrl) {
      return {
        ...tour,
        image: details.imageUrl,
        imageSourceType: "provider",
        imageVerified: true,
        imageAlt: details.title || tour.title,
      }
    }
  } catch {
    // Keep the tour renderable; unverified static images are filtered in UI.
  }

  return tour
}

/**
 * Batch fetch FareHarbor images and enrich tour objects with real URLs.
 * Runs server-side only to avoid exposing API keys.
 */
export async function enrichToursWithImages(tours: Tour[]): Promise<Tour[]> {
  return Promise.all(tours.map(enrichTourWithImage))
}

/**
 * Client-side fallback for fetching a single tour image.
 * This is deprecated - use enrichToursWithImages on server instead.
 */
export async function getTourImageUrl(tour: Tour): Promise<string | undefined> {
  const enriched = await enrichTourWithImage(tour)
  return enriched.imageVerified ? enriched.image : undefined
}

export async function enrichTourImage(tour: Tour): Promise<Tour> {
  return enrichTourWithImage(tour)
}
