import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Binoculars, CalendarDays, Compass, Heart, MapPin, Mountain, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Badge, money } from '../../components/ui'
import { DEPARTURE_SEED, DESTINATION_SEED, PACKAGE_SEED } from './seed'
import { TravelPackageCard } from './TravelPackageCard'
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
    <div className="space-y-8 pb-8">
      <section className="relative min-h-[420px] overflow-hidden rounded-2xl border border-border bg-surface">
        <img src={DESTINATION_SEED[0].image} alt="Bali coast and tropical landscape" width="1600" height="900" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/20" />
        <div className="relative flex min-h-[420px] max-w-2xl flex-col justify-center p-6 sm:p-10">
          <Badge variant="warning" className="mb-4 w-fit">VSR Travel</Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl">Explore more.<br />Plan less.</h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-text/80">Curated holidays, real group departures, dream stays, and custom trips designed around you.</p>
          <div className="mt-7 flex max-w-xl flex-col gap-2 rounded-xl border border-border bg-surface/95 p-2 shadow-xl sm:flex-row">
            <label className="sr-only" htmlFor="travel-search">Search destination or trip</label>
            <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input id="travel-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchTrips() }} placeholder="Where do you want to go?" className="h-11 w-full rounded-lg border border-border bg-surface2 pl-10 pr-3 text-sm text-text outline-none focus:ring-2 focus:ring-primary" /></div>
            <button type="button" onClick={searchTrips} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:opacity-90">Search trips</button>
          </div>
        </div>
      </section>

      <section aria-labelledby="travel-categories">
        <div className="mb-4 flex items-end justify-between"><div><h2 id="travel-categories" className="text-xl font-bold text-text">Find your kind of trip</h2><p className="mt-1 text-sm text-muted">Start with how you want to travel.</p></div></div>
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
          {CATEGORIES.map((category) => <Link key={category.label} to={category.to} className="flex min-w-36 snap-start items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-text transition-colors hover:border-primary/60 hover:text-primary"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><category.icon className="h-5 w-5" /></span>{category.label}</Link>)}
        </div>
      </section>

      <section aria-labelledby="trending-destinations">
        <div className="mb-4 flex items-end justify-between"><div><h2 id="trending-destinations" className="text-xl font-bold text-text">Trending destinations</h2><p className="mt-1 text-sm text-muted">Places travelers are saving right now.</p></div><Link to="/travel/destinations" className="text-sm font-semibold text-primary hover:underline">Explore all</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DESTINATION_SEED.map((destination, index) => (
            <Link key={destination.id} to={`/travel/packages?q=${encodeURIComponent(destination.name)}`} className={`group relative min-h-64 overflow-hidden rounded-xl border border-border ${index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
              <img src={destination.image} alt={`${destination.name}, ${destination.country}`} width="720" height="560" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4"><p className="flex items-center gap-1 text-xs font-semibold text-primary-soft"><MapPin className="h-3.5 w-3.5" />{destination.country}</p><h3 className="mt-1 text-xl font-bold text-white">{destination.name}</h3><p className="mt-1 text-xs text-white/75">From {money(destination.startingPrice)} · {destination.packageCount} packages</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="popular-packages">
        <div className="mb-4 flex items-end justify-between"><div><h2 id="popular-packages" className="text-xl font-bold text-text">Trips travelers love</h2><p className="mt-1 text-sm text-muted">Curated itineraries with transparent pricing.</p></div><Link to="/travel/packages" className="text-sm font-semibold text-primary hover:underline">View packages</Link></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{PACKAGE_SEED.slice(0, 3).map((item) => <TravelPackageCard key={item.id} packageItem={item} saved={savedIds.has(item.id)} onToggleSaved={toggleSaved} />)}</div>
      </section>

      <section aria-labelledby="group-departures">
        <div className="mb-4"><h2 id="group-departures" className="text-xl font-bold text-text">Upcoming group departures</h2><p className="mt-1 text-sm text-muted">Fixed dates, clear seat availability, and hosted experiences.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DEPARTURE_SEED.map((departure) => <article key={departure.id} className="overflow-hidden rounded-xl border border-border bg-surface"><img src={departure.image} alt={departure.title} width="600" height="320" loading="lazy" className="aspect-[16/9] w-full object-cover" /><div className="p-4"><p className="text-xs font-semibold text-primary">{departure.dateLabel}</p><h3 className="mt-1 font-bold text-text">{departure.title}</h3><p className="mt-2 text-xs text-muted">From {departure.departureCity} · {departure.seatsLeft} seats left</p><div className="mt-4 flex items-center justify-between"><strong className="text-text">{money(departure.price)}</strong><Link to="/travel/group-trips" className="text-xs font-semibold text-primary hover:underline">View departure</Link></div></div></article>)}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
        <div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Compass className="h-6 w-6" /></div><h2 className="mt-4 text-2xl font-bold text-text">Your trip, designed around you</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Share your destination, dates, budget, and travel style. A VSR trip specialist will turn it into a practical itinerary.</p><Link to="/travel/customize" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Plan my trip</Link></div>
        <div className="grid grid-cols-2 gap-3">{[{ icon: ShieldCheck, label: 'Verified partners' }, { icon: Binoculars, label: 'Expert itineraries' }, { icon: Heart, label: 'Personal support' }, { icon: Users, label: 'Trusted groups' }].map((item) => <div key={item.label} className="rounded-xl bg-surface2 p-4"><item.icon className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold text-text">{item.label}</p></div>)}</div>
      </section>
    </div>
  )
}
