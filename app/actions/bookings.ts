'use server'

// import { auth } from '@/lib/auth'
// Auth temporarily disabled - re-enable when custom bookings are implemented
import { db } from '@/lib/db'
import { bookings, gosnoBookings, blueHillsBookings, feastlyBookings, parrBookings, shuttleyaBookings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

/*
async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}
*/

// Create booking (before Stripe payment)
export async function createBooking(data: any) {
  const userId = await getUserId()
  const bookingId = nanoid()

  try {
    // Insert base booking record
    await db.insert(bookings).values({
      id: bookingId,
      userId,
      productType: data.productType,
      market: data.market,
      status: 'pending',
      totalPriceCents: data.totalPriceCents,
      stripePaymentStatus: 'pending',
    })

    // Insert product-specific details
    switch (data.productType) {
      case 'gosno':
        await db.insert(gosnoBookings).values({
          id: nanoid(),
          bookingId,
          userId,
          productCode: data.data.productCode,
          pickupDateTime: data.data.pickupDateTime,
          destination: data.data.destination,
          numVehicles: data.data.numVehicles,
          pricePerVehicleCents: data.data.pricePerVehicleCents,
          notes: data.notes,
        })
        break
      case 'blue_hills':
        await db.insert(blueHillsBookings).values({
          id: nanoid(),
          bookingId,
          userId,
          startDate: data.data.startDate,
          endDate: data.data.endDate,
          items: data.data.items,
          deliveryLocation: data.data.deliveryLocation,
          contactPhone: data.data.contactPhone,
          notes: data.notes,
        })
        break
      // Add other product types similarly
    }

    return { bookingId, success: true }
  } catch (err) {
    console.error('[v0] Booking creation error:', err)
    throw err
  }
}

// Confirm booking after successful Stripe payment
export async function confirmBooking(bookingId: string, stripePaymentId: string) {
  const userId = await getUserId()

  await db
    .update(bookings)
    .set({
      status: 'confirmed',
      stripePaymentId,
      stripePaymentStatus: 'succeeded',
      updatedAt: new Date(),
    })
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))

  revalidatePath('/bookings')
}

// Get all bookings for user
export async function getUserBookings() {
  const userId = await getUserId()
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
}

// Get single booking
export async function getBooking(bookingId: string) {
  const userId = await getUserId()
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .limit(1)
}

// Cancel booking
export async function cancelBooking(bookingId: string) {
  const userId = await getUserId()

  await db
    .update(bookings)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))

  revalidatePath('/bookings')
}
