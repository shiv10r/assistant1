import { CalendarCheck, Heart, ReceiptText, Users } from 'lucide-react'
import { money } from '../../components/ui'
import { useLocalCollection } from '../../lib/localStore'
import { BOOKING_SEED, PACKAGE_SEED } from './seed'
import { TravelPackageCard } from './TravelPackageCard'
import TravelShell from './TravelShell'
import type { TravelBooking } from './types'
import { useTravelWishlist } from './useTravelWishlist'

const STATUS_TONE = {
  Upcoming: 'bg-[var(--travel-lagoon)] text-white',
  Completed: 'bg-[var(--travel-ocean)] text-white',
  Cancelled: 'bg-[var(--travel-coral)] text-white',
} as const

export default function TravelMyTrips() {
  const { items: bookings } = useLocalCollection<TravelBooking>('travel:bookings', [...BOOKING_SEED])
  const { savedIds, toggleSaved } = useTravelWishlist()
  const savedPackages = PACKAGE_SEED.filter((item) => savedIds.has(item.id))

  return (
    <TravelShell>
      <div className="travel-main">
        <div className="travel-page-head"><h1>My trips</h1><p>Track bookings, balances, travel dates, and saved ideas.</p></div>

        <section className="travel-section" aria-labelledby="booking-list">
          <div className="travel-section-head"><div><h2 id="booking-list">Bookings</h2><p>Your upcoming and past travel.</p></div></div>
          <div className="travel-cards">
            {bookings.map((booking) => (
              <article key={booking.id} className="travel-card">
                <div className="travel-card-media"><img src={booking.image} alt={booking.destination} width="560" height="420" loading="lazy" /></div>
                <div className="travel-card-body">
                  <p className="travel-ref">{booking.bookingNumber}</p>
                  <h3>{booking.packageTitle}</h3>
                  <p className="travel-booking-dest">{booking.destination} · {booking.dateLabel}</p>
                  <span className={`mt-2 w-fit rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_TONE[booking.status]}`}>{booking.status}</span>
                  <div className="travel-booking-stats">
                    <div><Users aria-hidden="true" /><p>Travelers</p><strong>{booking.travelers}</strong></div>
                    <div><ReceiptText aria-hidden="true" /><p>Total</p><strong>{money(booking.total)}</strong></div>
                    <div><CalendarCheck aria-hidden="true" /><p>Balance</p><strong>{money(booking.total - booking.paid)}</strong></div>
                  </div>
                  <button type="button" className="travel-card-cta" style={{ alignSelf: 'flex-start' }}>View trip details</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="travel-section" aria-labelledby="saved-trips">
          <div className="travel-section-head"><div><h2 id="saved-trips">Wishlist</h2><p>{savedPackages.length} saved ideas</p></div></div>
          {savedPackages.length > 0
            ? <div className="travel-cards">{savedPackages.map((item) => <TravelPackageCard key={item.id} packageItem={item} saved onToggleSaved={toggleSaved} />)}</div>
            : <div className="travel-empty"><Heart aria-hidden="true" /><h2>Your wishlist is empty</h2><p>Save package cards to compare them here.</p></div>}
        </section>
      </div>
    </TravelShell>
  )
}