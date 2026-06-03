import { text, boolean, timestamp, integer, date, jsonb } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'

// Better Auth tables (required)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  accountId: text('accountId').notNull(),
  provider: text('provider').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Booking tables
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  productType: text('productType').notNull(),
  market: text('market').notNull(),
  status: text('status').notNull().default('pending'),
  totalPriceCents: integer('totalPriceCents').notNull(),
  stripePaymentId: text('stripePaymentId'),
  stripePaymentStatus: text('stripePaymentStatus'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const gosnoBookings = pgTable('gosno_bookings', {
  id: text('id').primaryKey(),
  bookingId: text('bookingId').notNull(),
  userId: text('userId').notNull(),
  productCode: text('productCode').notNull(),
  pickupDateTime: timestamp('pickupDateTime').notNull(),
  destination: text('destination').notNull(),
  numVehicles: integer('numVehicles').notNull(),
  pricePerVehicleCents: integer('pricePerVehicleCents').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const blueHillsBookings = pgTable('blue_hills_bookings', {
  id: text('id').primaryKey(),
  bookingId: text('bookingId').notNull(),
  userId: text('userId').notNull(),
  startDate: date('startDate').notNull(),
  endDate: date('endDate').notNull(),
  items: jsonb('items').notNull(),
  deliveryLocation: text('deliveryLocation').notNull(),
  contactPhone: text('contactPhone').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const feastlyBookings = pgTable('feastly_bookings', {
  id: text('id').primaryKey(),
  bookingId: text('bookingId').notNull(),
  userId: text('userId').notNull(),
  marketplaceId: text('marketplaceId').notNull(),
  eventDateTime: timestamp('eventDateTime').notNull(),
  partySize: integer('partySize').notNull(),
  cuisine: text('cuisine'),
  totalPriceCents: integer('totalPriceCents').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const parrBookings = pgTable('parr_bookings', {
  id: text('id').primaryKey(),
  bookingId: text('bookingId').notNull(),
  userId: text('userId').notNull(),
  pickupDateTime: timestamp('pickupDateTime').notNull(),
  pickupLocation: text('pickupLocation').notNull(),
  eventDateTime: timestamp('eventDateTime').notNull(),
  numAttendees: integer('numAttendees').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const shuttleyaBookings = pgTable('shuttleya_bookings', {
  id: text('id').primaryKey(),
  bookingId: text('bookingId').notNull(),
  userId: text('userId').notNull(),
  pickupDateTime: timestamp('pickupDateTime').notNull(),
  pickupLocation: text('pickupLocation').notNull(),
  numPassengers: integer('numPassengers').notNull(),
  pricePerPassengerCents: integer('pricePerPassengerCents').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const marketplaceProfiles = pgTable('marketplace_profiles', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  businessName: text('businessName').notNull(),
  market: text('market').notNull(),
  noticeMinutesRequired: integer('noticeMinutesRequired').notNull(),
  availabilityWindows: jsonb('availabilityWindows'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
