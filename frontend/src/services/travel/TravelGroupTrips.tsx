import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../../components/ui'
import { DEPARTURE_SEED } from './seed'
import TravelShell from './TravelShell'

export default function TravelGroupTrips() {
  return (
    <TravelShell>
      <div className="travel-main">
        <div className="travel-page-head"><h1>Group departures</h1><p>Hosted trips with fixed dates, transparent group sizes, and clear seat availability.</p></div>
        <div className="travel-cards">
          {DEPARTURE_SEED.map((departure) => {
            const booked = departure.totalSeats - departure.seatsLeft
            const fill = Math.round((booked / departure.totalSeats) * 100)
            return (
              <article key={departure.id} className="travel-card">
                <div className="travel-card-media"><img src={departure.image} alt={departure.title} width="600" height="500" loading="lazy" /></div>
                <div className="travel-card-body">
                  <div className="travel-card-meta"><span>Confirmed departure</span><span className="travel-rating">{departure.dateLabel}</span></div>
                  <h3>{departure.title}</h3>
                  <p className="travel-card-route"><MapPin aria-hidden="true" />{departure.departureCity}</p>
                  <div className="travel-seats">
                    <div className="travel-seats-row"><span>{booked} / {departure.totalSeats} travelers booked</span><strong>{departure.seatsLeft} seats left</strong></div>
                    <div className="travel-seats-track"><div className="travel-seats-fill" style={{ width: `${fill}%` }} /></div>
                  </div>
                  <div className="travel-card-footer"><p className="travel-price">From <strong>{money(departure.price)}</strong></p><Link to={`/travel/customize?departure=${departure.id}`} className="travel-card-cta">View departure</Link></div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </TravelShell>
  )
}