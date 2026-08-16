import { Link } from 'react-router-dom'
import { MapPinned } from 'lucide-react'
import { PageHead, money } from '../../components/ui'
import { DESTINATION_SEED } from './seed'

export default function TravelDestinations() {
  return (
    <div className="space-y-6">
      <PageHead icon={<MapPinned className="h-6 w-6" />} title="Destinations" sub="Explore handpicked places for holidays, groups, couples, and families." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {DESTINATION_SEED.map((destination) => (
          <Link key={destination.id} to={`/travel/packages?q=${encodeURIComponent(destination.name)}`} className="group overflow-hidden rounded-xl border border-border bg-surface">
            <div className="aspect-[16/10] overflow-hidden"><img src={destination.image} alt={`${destination.name}, ${destination.country}`} width="800" height="500" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
            <div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{destination.country}</p><h2 className="mt-1 text-xl font-bold text-text">{destination.name}</h2><p className="mt-2 text-sm text-muted">{destination.tagline}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-4"><span className="text-sm font-semibold text-text">From {money(destination.startingPrice)}</span><span className="text-xs text-primary">{destination.packageCount} packages</span></div></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
