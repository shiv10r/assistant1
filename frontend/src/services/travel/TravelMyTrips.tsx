import { CalendarCheck, Heart, ReceiptText, Users } from 'lucide-react'
import { Badge, PageHead, money } from '../../components/ui'
import { useLocalCollection } from '../../lib/localStore'
import { BOOKING_SEED, PACKAGE_SEED } from './seed'
import { TravelPackageCard } from './TravelPackageCard'
import type { TravelBooking } from './types'
import { useTravelWishlist } from './useTravelWishlist'

const STATUS_TONE = {
  Upcoming: 'info',
  Completed: 'success',
  Cancelled: 'danger',
} as const

export default function TravelMyTrips() {
  const { items: bookings } = useLocalCollection<TravelBooking>('travel:bookings', [...BOOKING_SEED])
  const { savedIds, toggleSaved } = useTravelWishlist()
  const savedPackages = PACKAGE_SEED.filter((item) => savedIds.has(item.id))

  return (
    <div className="space-y-8">
      <PageHead icon={<CalendarCheck className="h-6 w-6" />} title="My trips" sub="Track bookings, balances, travel dates, and saved ideas." />
      <section aria-labelledby="booking-list">
        <h2 id="booking-list" className="mb-4 text-lg font-bold text-text">Bookings</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {bookings.map((booking) => (
            <article key={booking.id} className="grid overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-[190px_1fr]">
              <img src={booking.image} alt={booking.destination} width="560" height="420" className="h-48 w-full object-cover sm:h-full" />
              <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-primary">{booking.bookingNumber}</p><h3 className="mt-1 text-lg font-bold text-text">{booking.packageTitle}</h3><p className="text-sm text-muted">{booking.destination} · {booking.dateLabel}</p></div><Badge variant={STATUS_TONE[booking.status]} size="sm">{booking.status}</Badge></div><div className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-4"><div><Users className="h-4 w-4 text-primary" /><p className="mt-1 text-xs text-muted">Travelers</p><strong className="text-sm text-text">{booking.travelers}</strong></div><div><ReceiptText className="h-4 w-4 text-primary" /><p className="mt-1 text-xs text-muted">Total</p><strong className="text-sm text-text">{money(booking.total)}</strong></div><div><CalendarCheck className="h-4 w-4 text-primary" /><p className="mt-1 text-xs text-muted">Balance</p><strong className="text-sm text-text">{money(booking.total - booking.paid)}</strong></div></div><button type="button" className="mt-4 text-sm font-semibold text-primary hover:underline">View trip details</button></div>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="saved-trips">
        <div className="mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /><h2 id="saved-trips" className="text-lg font-bold text-text">Wishlist</h2><Badge variant="outline" size="sm">{savedPackages.length}</Badge></div>
        {savedPackages.length > 0 ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{savedPackages.map((item) => <TravelPackageCard key={item.id} packageItem={item} saved onToggleSaved={toggleSaved} />)}</div> : <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center"><Heart className="mx-auto h-7 w-7 text-muted" /><p className="mt-3 font-semibold text-text">Your wishlist is empty</p><p className="mt-1 text-sm text-muted">Save package cards to compare them here.</p></div>}
      </section>
    </div>
  )
}
