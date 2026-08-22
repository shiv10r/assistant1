import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { money } from '../../components/ui'
import { getDestinations } from './travelApi'
import type { Destination } from './types'
import TravelShell from './TravelShell'

export default function TravelDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    getDestinations().then((data) => {
      if (active) {
        setDestinations(data)
        setLoaded(true)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <TravelShell>
      <div className="travel-main">
        <div className="travel-page-head"><h1>Destinations</h1><p>Explore handpicked places for holidays, groups, couples, and families.</p></div>
        <div className="travel-cards">
          {destinations.map((destination) => (
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
        {loaded && destinations.length === 0 && <p className="travel-empty">No destinations available right now.</p>}
      </div>
    </TravelShell>
  )
}