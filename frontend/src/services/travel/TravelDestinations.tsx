import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { money } from '../../components/ui'
import { DESTINATION_SEED } from './seed'
import TravelShell from './TravelShell'

export default function TravelDestinations() {
  return (
    <TravelShell>
      <div className="travel-main">
        <div className="travel-page-head"><h1>Destinations</h1><p>Explore handpicked places for holidays, groups, couples, and families.</p></div>
        <div className="travel-cards">
          {DESTINATION_SEED.map((destination) => (
            <Link key={destination.id} to={`/travel/packages?q=${encodeURIComponent(destination.name)}`} className="travel-card">
              <div className="travel-card-media"><img src={destination.image} alt={`${destination.name}, ${destination.country}`} width="800" height="500" loading="lazy" /></div>
              <div className="travel-card-body">
                <div className="travel-card-meta"><span>{destination.country}</span><span className="travel-rating">{destination.packageCount} packages</span></div>
                <h3>{destination.name}</h3>
                <p className="travel-card-route"><MapPin aria-hidden="true" />{destination.tagline}</p>
                <div className="travel-card-footer"><p className="travel-price">From <strong>{money(destination.startingPrice)}</strong></p></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </TravelShell>
  )
}