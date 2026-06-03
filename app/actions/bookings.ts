'use server'

// Bookings disabled temporarily - public storefronts only
// Custom booking system will be enabled after auth is fixed

export async function createBooking(data: any) {
  throw new Error('Booking system not yet enabled')
}

export async function updateBooking(id: string, data: any) {
  throw new Error('Booking system not yet enabled')
}

export async function cancelBooking(id: string) {
  throw new Error('Booking system not yet enabled')
}

export async function confirmBooking(bookingId: string, stripePaymentId: string) {
  throw new Error('Booking system not yet enabled')
}

export async function getUserBookings() {
  throw new Error('Booking system not yet enabled')
}

export async function getBooking(bookingId: string) {
  throw new Error('Booking system not yet enabled')
}
