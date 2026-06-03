export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type ProductType = 'gosno' | 'blue_hills' | 'feastly' | 'parr' | 'shuttleya'
export type Market = 'colorado' | 'wisconsin'

export interface GosnoBookingData {
  productCode: string
  destination: string
  pickupDateTime: Date
  numVehicles: number
  pricePerVehicleCents: number
}

export interface BlueHillsBookingData {
  startDate: Date
  endDate: Date
  items: Array<{ name: string; quantity: number; priceCents: number }>
  deliveryLocation: string
  contactPhone: string
}

export interface FeastlyBookingData {
  marketplaceId: string
  eventDateTime: Date
  partySize: number
  cuisine?: string
}

export interface ParrBookingData {
  pickupDateTime: Date
  pickupLocation: string
  eventDateTime: Date
  numAttendees: number
}

export interface ShuttleyaBookingData {
  pickupDateTime: Date
  pickupLocation: string
  numPassengers: number
  pricePerPassengerCents: number
}

export interface BookingRequest {
  productType: ProductType
  market: Market
  totalPriceCents: number
  data: GosnoBookingData | BlueHillsBookingData | FeastlyBookingData | ParrBookingData | ShuttleyaBookingData
  notes?: string
}
