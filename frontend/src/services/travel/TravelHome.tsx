import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Binoculars, CalendarDays, Compass, Heart, MapPin, Mountain, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { money } from '../../components/ui'
import { DEPARTURE_SEED, DESTINATION_SEED, PACKAGE_SEED } from './seed'
import { TravelPackageCard } from './TravelPackageCard'
import TravelShell from './TravelShell'
import { useTravelWishlist } from './useTravelWishlist'

const CATEGORIES = [
  { label: 'Group trips', icon: Users, to: '/travel/group-trips' },
  { label: 'Honeymoon', icon: Heart, to: '/travel/packages?theme=Romantic' },
  { label: 'Adventure', icon: Mountain, to: '/travel/packages?theme=Adventure' },
  { label: 'Weekend', icon: CalendarDays, to: '/travel/packages?theme=Weekend' },
  { label: 'Custom trip', icon: Sparkles, to: '/travel/customize' },
] as const

export default function TravelHome() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { savedIds, toggleSaved } = useTravelWishlist()

  function searchTrips() {
    const search = query.trim()
    navigate(search ? `/travel/packages?q=${encodeURIComponent(search)}` : '/travel/packages')
  }

  return (
    <TravelShell>
      <section className="travel-hero" aria-label="Travel search">
        <div className="travel-hero-content">
          <p className="travel-eyebrow">Explore more. Plan less.</p>
          <h1>Find your next escape,<br />not another spreadsheet.</h1>
          <p className="travel-hero-copy">Curated holidays, real group departures, dream stays, and custom trips designed around you.</p>
          <div className="travel-search-bar">
            <label htmlFor="travel-search"><Search aria-hidden="true" /><input id="travel-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchTrips() }} placeholder="Where do you want to go?" /></label>
            <button type="button" onClick={searchTrips}>Search trips</button>
          </div>
          <div className="travel-chips">
            {CATEGORIES.map((category) => <Link key={category.label} to={category.to} className="travel-chip"><category.icon aria-hidden="true" />{category.label}</Link>)}
          </div>
        </div>
      </section>

      <div className="travel-main">
        <section className="travel-section" aria-labelledby="trending-destinations">
          <div className="travel-section-head">
            <div><h2 id="trending-destinations">Trending destinations</h2><p>Places travelers are saving right now.</p></div>
            <Link to="/travel/destinations">Explore all</Link>
          </div>
          <div className="travel-cards">
            {DESTINATION_SEED.slice(0, 3).map((destination) => (
              <Link key={destination.id} to={`/travel/packages?q=${encodeURIComponent(destination.name)}`} className="travel-card">
                <div className="travel-card-media"><img src={destination.image} alt={`${destination.name}, ${destination.country}`} width="720" height="560" loading="lazy" /></div>
                <div className="travel-card-body">
                  <div className="travel-card-meta"><span>{destination.country}</span><span className="travel-rating">{destination.packageCount} packages</span></div>
                  <h3>{destination.name}</h3>
                  <p className="travel-card-route"><MapPin aria-hidden="true" />{destination.tagline}</p>
                  <div className="travel-card-footer"><p className="travel-price">From <strong>{money(destination.startingPrice)}</strong></p></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="travel-section" aria-labelledby="popular-packages">
          <div className="travel-section-head">
            <div><h2 id="popular-packages">Trips travelers love</h2><p>Curated itineraries with transparent pricing.</p></div>
            <Link to="/travel/packages">View packages</Link>
          </div>
          <div className="travel-cards">{PACKAGE_SEED.slice(0, 3).map((item) => <TravelPackageCard key={item.id} packageItem={item} saved={savedIds.has(item.id)} onToggleSaved={toggleSaved} />)}</div>
        </section>

        <section className="travel-section" aria-labelledby="group-departures">
          <div className="travel-section-head"><div><h2 id="group-departures">Upcoming group departures</h2><p>Fixed dates, clear seat availability, and hosted experiences.</p></div><Link to="/travel/group-trips">View departures</Link></div>
          <div className="travel-cards">
            {DEPARTURE_SEED.slice(0, 3).map((departure) => (
              <article key={departure.id} className="travel-card">
                <div className="travel-card-media"><img src={departure.image} alt={departure.title} width="600" height="320" loading="lazy" /></div>
                <div className="travel-card-body">
                  <div className="travel-card-meta"><span>{departure.dateLabel}</span><span>{departure.seatsLeft} seats left</span></div>
                  <h3>{departure.title}</h3>
                  <p className="travel-card-route"><MapPin aria-hidden="true" />{departure.departureCity}</p>
                  <div className="travel-card-footer"><p className="travel-price">From <strong>{money(departure.price)}</strong></p><Link to="/travel/group-trips" className="travel-card-cta">View departure</Link></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="travel-cta-band" aria-label="Custom trip planning">
          <div>
            <div className="travel-perk" style={{ width: 'fit-content', padding: '10px 12px' }}><Compass aria-hidden="true" /><p style={{ display: 'inline', marginLeft: 8 }}>Custom trips</p></div>
            <h2>Your trip, designed around you</h2>
            <p>Share your destination, dates, budget, and travel style. A VSR trip specialist will turn it into a practical itinerary.</p>
            <Link to="/travel/customize">Plan my trip</Link>
          </div>
          <div className="travel-perks">
            {[{ icon: ShieldCheck, label: 'Verified partners' }, { icon: Binoculars, label: 'Expert itineraries' }, { icon: Heart, label: 'Personal support' }, { icon: Users, label: 'Trusted groups' }].map((item) => (
              <div key={item.label} className="travel-perk"><item.icon aria-hidden="true" /><p>{item.label}</p></div>
            ))}
          </div>
        </section>
      </div>
    </TravelShell>
  )
}