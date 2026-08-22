import { api } from '../../api'
import type { Destination, TravelPackage, GroupDeparture } from './types'
import { DESTINATION_SEED, PACKAGE_SEED, DEPARTURE_SEED } from './seed'

type ApiEnvelope<T> = { success: boolean; data: T; message?: string; errors?: string[] }

async function fetchList<T>(url: string, fallback: readonly T[]): Promise<T[]> {
  try {
    const res = await api.get<ApiEnvelope<T[]>>(url)
    if (res?.success && Array.isArray(res.data)) return res.data
    return [...fallback]
  } catch {
    return [...fallback]
  }
}

function mapDestination(d: any): Destination {
  return {
    id: d.id,
    name: d.name,
    country: d.country,
    image: d.imageUrl ?? '',
    startingPrice: d.startingPrice ?? 0,
    packageCount: d.packageCount ?? 0,
    tagline: d.tagline ?? '',
  }
}

function mapPackage(p: any): TravelPackage {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    destination: p.destination,
    image: p.image ?? '',
    durationDays: p.durationDays ?? 0,
    durationNights: p.durationNights ?? 0,
    route: p.route ?? '',
    price: p.price ?? 0,
    originalPrice: p.originalPrice ?? undefined,
    rating: p.rating ?? 0,
    travelers: p.travelers ?? 0,
    departures: p.departures ?? 0,
    badge: (p.badge || 'Best Seller') as TravelPackage['badge'],
    theme: (p.theme || 'Culture') as TravelPackage['theme'],
    tripType: (p.tripType || 'Group') as TravelPackage['tripType'],
    departureCity: p.departureCity ?? '',
    inclusions: p.inclusions ?? [],
  }
}

function mapDeparture(d: any): GroupDeparture {
  return {
    id: d.id,
    packageId: d.packageId,
    title: d.title,
    dateLabel: d.dateLabel ?? '',
    departureCity: d.departureCity ?? '',
    seatsLeft: d.seatsLeft ?? 0,
    totalSeats: d.totalSeats ?? 0,
    price: d.price ?? 0,
    image: d.image ?? '',
  }
}

export async function getDestinations(): Promise<Destination[]> {
  const data = await fetchList<any>('/api/travel/destinations', DESTINATION_SEED)
  return data.map(mapDestination)
}

export async function getPackages(destinationId?: string, theme?: string, sort?: string): Promise<TravelPackage[]> {
  const qs = new URLSearchParams()
  if (destinationId) qs.set('destinationId', destinationId)
  if (theme && theme !== 'all') qs.set('theme', theme)
  if (sort && sort !== 'recommended') qs.set('sort', sort)
  const query = qs.toString()
  const url = `/api/travel/packages${query ? `?${query}` : ''}`
  const data = await fetchList<any>(url, PACKAGE_SEED)
  return data.map(mapPackage)
}

export async function getDepartures(packageId?: string): Promise<GroupDeparture[]> {
  const qs = new URLSearchParams()
  if (packageId) qs.set('packageId', packageId)
  const query = qs.toString()
  const url = `/api/travel/departures${query ? `?${query}` : ''}`
  const data = await fetchList<any>(url, DEPARTURE_SEED)
  return data.map(mapDeparture)
}
