/**
 * Booking provider abstraction.
 * Every market plugs into one of these. The storefront only ever talks to
 * this interface, so swapping FareHarbor <-> Rezdy <-> Viator is a config change.
 */

export interface AvailabilitySlot {
  /** Provider-specific availability id (e.g. FareHarbor availability pk) */
  id: string
  /** ISO datetime of the start */
  startsAt: string
  /** Human label, e.g. "Tue, Jun 10 · 9:00 AM" */
  label: string
  /** Spaces remaining */
  capacityRemaining: number
  /** Price per traveler in cents */
  priceCents: number
  /**
   * True for date-marker availability (e.g. Rezdy transfers), where the slot
   * represents a bookable DATE rather than a specific departure time. The UI
   * shows an "Available / Sold out" date chip instead of a clock time.
   */
  dateOnly?: boolean
}

export interface BookingCustomer {
  name: string
  email: string
  phone?: string
}

export interface CreateBookingInput {
  tourId: string
  availabilityId: string
  travelers: number
  customer: BookingCustomer
}

export interface BookingResult {
  ok: boolean
  bookingId?: string
  /** Confirmation/receipt url if the provider returns one */
  confirmationUrl?: string
  error?: string
}

export interface BookingProviderAdapter {
  name?: string
  /** Whether checkout/payment happens on our own site */
  onSiteCheckout: boolean
  /** Whether the provider's credentials are present in the environment */
  isConfigured(): boolean
  /**
   * Fetch tour/item details including images. Optional; only FareHarbor uses it.
   */
  getItemDetails?(tourId: string, operatorShortname?: string): Promise<{ title: string; description: string; imageUrl?: string } | null>
  /**
   * Live availability for an item. `operatorShortname` lets affiliate accounts
   * resell inventory that lives under another operator's company shortname.
   */
  getAvailability(
    tourId: string,
    fromISO: string,
    toISO: string,
    operatorShortname?: string,
  ): Promise<AvailabilitySlot[]>
  createBooking(input: CreateBookingInput, operatorShortname?: string): Promise<BookingResult>
}

/** A single cart line as sent from the checkout form. */
export interface CheckoutItem {
  tourSlug: string
  /** ISO date (yyyy-mm-dd) the guest wants to travel */
  date: string
  travelers: number
  /** Provider-specific availability/time selected before checkout. Required for FareHarbor. */
  availabilityId?: string
  startsAt?: string
}

/** The full checkout payload posted to /api/checkout. */
export interface CheckoutRequest {
  items: CheckoutItem[]
  contact: BookingCustomer
}
