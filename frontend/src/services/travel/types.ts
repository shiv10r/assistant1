export type TravelTheme = 'Beach' | 'Adventure' | 'Culture' | 'Romantic' | 'Family' | 'Weekend'
export type TripType = 'Group' | 'Private' | 'Custom'
export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled'

export type Destination = {
  readonly id: string
  readonly name: string
  readonly country: string
  readonly image: string
  readonly startingPrice: number
  readonly packageCount: number
  readonly tagline: string
}

export type TravelPackage = {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly destination: string
  readonly image: string
  readonly durationDays: number
  readonly durationNights: number
  readonly route: string
  readonly price: number
  readonly originalPrice?: number
  readonly rating: number
  readonly travelers: number
  readonly departures: number
  readonly badge: 'Trending' | 'Best Seller' | 'Early Bird' | 'Couple Favorite' | 'Weekend Pick'
  readonly theme: TravelTheme
  readonly tripType: TripType
  readonly departureCity: string
  readonly inclusions: readonly string[]
}

export type GroupDeparture = {
  readonly id: string
  readonly packageId: string
  readonly title: string
  readonly dateLabel: string
  readonly departureCity: string
  readonly seatsLeft: number
  readonly totalSeats: number
  readonly price: number
  readonly image: string
}

export type TravelBooking = {
  readonly id: string
  readonly bookingNumber: string
  readonly packageTitle: string
  readonly destination: string
  readonly dateLabel: string
  readonly travelers: number
  readonly total: number
  readonly paid: number
  readonly status: BookingStatus
  readonly image: string
}

export type TravelLead = {
  readonly id: string
  readonly destination: string
  readonly travelMonth: string
  readonly travelers: number
  readonly budgetPerPerson: number
  readonly theme: TravelTheme
  readonly name: string
  readonly phone: string
  readonly status: 'New'
}
