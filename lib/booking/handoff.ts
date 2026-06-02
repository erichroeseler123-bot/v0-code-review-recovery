import type { BookingProviderAdapter } from "./types"

/**
 * Handoff adapters: Viator and GetYourGuide.
 *
 * These partners take the payment on their own site. We do not run an on-site
 * cart for them — the storefront links out to the partner's booking page
 * (each tour carries a `bookingUrl`). These adapters exist so the engine has a
 * uniform shape for every market.
 *
 * Optional env vars (for affiliate attribution, not required to function):
 *   VIATOR_PARTNER_ID
 *   GETYOURGUIDE_PARTNER_ID
 */

function makeHandoffAdapter(name: string): BookingProviderAdapter {
  return {
    name,
    onSiteCheckout: false,
    isConfigured: () => true, // affiliate links always work; no secret keys required
    async getAvailability() {
      return []
    },
    async createBooking() {
      return {
        ok: false,
        error: `${name} bookings are completed on the partner site, not on-site.`,
      }
    },
  }
}

export const viatorAdapter = makeHandoffAdapter("viator")
export const getYourGuideAdapter = makeHandoffAdapter("getyourguide")
