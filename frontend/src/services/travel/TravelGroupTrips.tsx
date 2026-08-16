import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, PageHead, money } from '../../components/ui'
import { DEPARTURE_SEED } from './seed'

export default function TravelGroupTrips() {
  return (
    <div className="space-y-6">
      <PageHead icon={<Users className="h-6 w-6" />} title="Group departures" sub="Hosted trips with fixed dates, transparent group sizes, and clear seat availability." right={<Link to="/travel/customize" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:border-primary/60">Request a private trip</Link>} />
      <div className="grid gap-5 md:grid-cols-2">
        {DEPARTURE_SEED.map((departure) => {
          const booked = departure.totalSeats - departure.seatsLeft
          const fill = Math.round((booked / departure.totalSeats) * 100)
          return (
            <article key={departure.id} className="grid overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-[220px_1fr]">
              <img src={departure.image} alt={departure.title} width="600" height="500" className="h-56 w-full object-cover sm:h-full" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div><Badge variant="info" size="sm">Confirmed departure</Badge><h2 className="mt-2 text-lg font-bold text-text">{departure.title}</h2></div><strong className="text-text">{money(departure.price)}</strong></div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p className="flex items-center gap-2 text-muted"><CalendarDays className="h-4 w-4 text-primary" />{departure.dateLabel}</p><p className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4 text-primary" />{departure.departureCity}</p></div>
                <div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-muted">{booked} / {departure.totalSeats} travelers booked</span><span className="font-semibold text-warning">{departure.seatsLeft} seats left</span></div><div className="h-2 overflow-hidden rounded-full bg-surface2"><div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} /></div></div>
                <Link to={`/travel/customize?departure=${departure.id}`} className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">View departure</Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
