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
  name: string
  /** Whether checkout/payment happens on our own site */
  onSiteCheckout: boolean
  getAvailability(tourId: string, fromISO: string, toISO: string): Promise<AvailabilitySlot[]>
  createBooking(input: CreateBookingInput): Promise<BookingResult>
}
