import type { Destination, GroupDeparture, TravelBooking, TravelPackage } from './types'

export const DESTINATION_SEED: readonly Destination[] = [
  { id: 'dest-bali', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=82', startingPrice: 32999, packageCount: 14, tagline: 'Temples, rice terraces and island sunsets' },
  { id: 'dest-vietnam', name: 'Vietnam', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=82', startingPrice: 42999, packageCount: 11, tagline: 'Lantern towns, bays and vibrant cities' },
  { id: 'dest-kashmir', name: 'Kashmir', country: 'India', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=82', startingPrice: 24999, packageCount: 9, tagline: 'Alpine valleys and peaceful houseboats' },
  { id: 'dest-dubai', name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=82', startingPrice: 38999, packageCount: 8, tagline: 'Desert adventures and iconic skylines' },
  { id: 'dest-maldives', name: 'Maldives', country: 'Maldives', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=82', startingPrice: 58999, packageCount: 7, tagline: 'Private lagoons and overwater escapes' },
]

export const PACKAGE_SEED: readonly TravelPackage[] = [
  { id: 'pkg-vietnam', slug: 'vietnam-discovery', title: 'Vietnam Discovery', destination: 'Vietnam', image: DESTINATION_SEED[1].image, durationDays: 7, durationNights: 6, route: 'Hanoi · Da Nang · Ho Chi Minh', price: 42999, originalPrice: 47999, rating: 4.8, travelers: 140, departures: 4, badge: 'Best Seller', theme: 'Culture', tripType: 'Group', departureCity: 'Delhi', inclusions: ['Hotels', 'Breakfast', 'Transfers'] },
  { id: 'pkg-bali', slug: 'bali-island-retreat', title: 'Bali Island Retreat', destination: 'Bali', image: DESTINATION_SEED[0].image, durationDays: 6, durationNights: 5, route: 'Ubud · Nusa Dua · Seminyak', price: 36999, rating: 4.9, travelers: 96, departures: 3, badge: 'Trending', theme: 'Beach', tripType: 'Private', departureCity: 'Mumbai', inclusions: ['Resort', 'Breakfast', 'Sightseeing'] },
  { id: 'pkg-kashmir', slug: 'kashmir-valley-escape', title: 'Kashmir Valley Escape', destination: 'Kashmir', image: DESTINATION_SEED[2].image, durationDays: 5, durationNights: 4, route: 'Srinagar · Gulmarg · Pahalgam', price: 24999, originalPrice: 27999, rating: 4.7, travelers: 188, departures: 6, badge: 'Best Seller', theme: 'Family', tripType: 'Private', departureCity: 'Delhi', inclusions: ['Hotels', 'Breakfast', 'Cab'] },
  { id: 'pkg-dubai', slug: 'dazzling-dubai', title: 'Dazzling Dubai', destination: 'Dubai', image: DESTINATION_SEED[3].image, durationDays: 5, durationNights: 4, route: 'Downtown · Marina · Desert', price: 38999, rating: 4.6, travelers: 212, departures: 5, badge: 'Early Bird', theme: 'Family', tripType: 'Group', departureCity: 'Mumbai', inclusions: ['Hotels', 'Visa', 'Transfers'] },
  { id: 'pkg-maldives', slug: 'maldives-for-two', title: 'Maldives for Two', destination: 'Maldives', image: DESTINATION_SEED[4].image, durationDays: 5, durationNights: 4, route: 'Malé · Private Island Resort', price: 58999, originalPrice: 64999, rating: 4.9, travelers: 74, departures: 2, badge: 'Couple Favorite', theme: 'Romantic', tripType: 'Private', departureCity: 'Bengaluru', inclusions: ['Water villa', 'Meals', 'Speedboat'] },
  { id: 'pkg-manali', slug: 'manali-weekend', title: 'Manali Long Weekend', destination: 'Manali', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82', durationDays: 4, durationNights: 3, route: 'Manali · Solang · Atal Tunnel', price: 16999, rating: 4.5, travelers: 260, departures: 8, badge: 'Weekend Pick', theme: 'Weekend', tripType: 'Group', departureCity: 'Delhi', inclusions: ['Hotel', 'Breakfast', 'Volvo'] },
]

export const DEPARTURE_SEED: readonly GroupDeparture[] = [
  { id: 'dep-1', packageId: 'pkg-vietnam', title: 'Vietnam Festive Escape', dateLabel: '28 Dec – 4 Jan', departureCity: 'Delhi', seatsLeft: 12, totalSeats: 30, price: 49999, image: DESTINATION_SEED[1].image },
  { id: 'dep-2', packageId: 'pkg-dubai', title: 'Dubai New Year Group', dateLabel: '29 Dec – 2 Jan', departureCity: 'Mumbai', seatsLeft: 8, totalSeats: 24, price: 46999, image: DESTINATION_SEED[3].image },
  { id: 'dep-3', packageId: 'pkg-manali', title: 'Manali Snow Weekend', dateLabel: '16 Jan – 19 Jan', departureCity: 'Delhi', seatsLeft: 16, totalSeats: 32, price: 18999, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82' },
  { id: 'dep-4', packageId: 'pkg-bali', title: 'Bali Young Travellers', dateLabel: '7 Feb – 12 Feb', departureCity: 'Bengaluru', seatsLeft: 10, totalSeats: 20, price: 41999, image: DESTINATION_SEED[0].image },
]

export const BOOKING_SEED: readonly TravelBooking[] = [
  { id: 'book-1', bookingNumber: 'VSR-TR-10429', packageTitle: 'Vietnam Discovery', destination: 'Vietnam', dateLabel: '12–18 Oct 2026', travelers: 2, total: 89500, paid: 50000, status: 'Upcoming', image: DESTINATION_SEED[1].image },
  { id: 'book-2', bookingNumber: 'VSR-TR-09841', packageTitle: 'Kashmir Valley Escape', destination: 'Kashmir', dateLabel: '4–8 Apr 2026', travelers: 4, total: 99996, paid: 99996, status: 'Completed', image: DESTINATION_SEED[2].image },
]
