import type { Market } from "./markets"
import type { Tour } from "./tours"

/**
 * Builds the outbound handoff URL for affiliate providers (Viator / GetYourGuide),
 * appending UTM attribution so bookings we send are credited back to the network.
 *
 * The Viator campaign tag comes from NEXT_PUBLIC_VIATOR_UTM_CAMPAIGN (client-safe).
 * If a tour has no bookingUrl, we return "#" so the link is inert rather than broken.
 */
export function bookingHref(tour: Tour, market: Market): string {
  const base = tour.bookingUrl
  if (!base) return "#"

  // Only handoff providers route off-site; on-site providers never call this.
  if (market.onSiteCheckout) return base

  try {
    const url = new URL(base)

    // Standard attribution: identifies the storefront that drove the click.
    url.searchParams.set("utm_source", market.domain || market.id)
    url.searchParams.set("utm_medium", "referral")

    const campaign =
      market.provider === "viator"
        ? process.env.NEXT_PUBLIC_VIATOR_UTM_CAMPAIGN
        : undefined

    if (campaign) {
      url.searchParams.set("utm_campaign", campaign)
    }

    return url.toString()
  } catch {
    // bookingUrl wasn't a valid absolute URL — return as-is rather than crash.
    return base
  }
}
