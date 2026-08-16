import { Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../../components/ui'
import type { TravelPackage } from './types'

type TravelPackageCardProps = {
  readonly packageItem: TravelPackage
  readonly saved: boolean
  readonly onToggleSaved: (packageId: string) => void
}

export function TravelPackageCard({ packageItem, saved, onToggleSaved }: TravelPackageCardProps) {
  return (
    <article className="travel-card">
      <div className="travel-card-media">
        <img src={packageItem.image} alt={`${packageItem.destination} travel package`} width="640" height="400" loading="lazy" />
        <span className="travel-badge">{packageItem.badge}</span>
        <button type="button" onClick={() => onToggleSaved(packageItem.id)} aria-label={saved ? `Remove ${packageItem.title} from wishlist` : `Save ${packageItem.title} to wishlist`} className={`travel-save ${saved ? 'is-saved' : ''}`}>
          <Heart aria-hidden="true" />
        </button>
      </div>
      <div className="travel-card-body">
        <div className="travel-card-meta">
          <span>{packageItem.durationDays}D / {packageItem.durationNights}N · {packageItem.tripType}</span>
          <span className="travel-rating"><Star aria-hidden="true" />{packageItem.rating}</span>
        </div>
        <h3><Link to={`/travel/customize?package=${packageItem.slug}`}>{packageItem.title}</Link></h3>
        <p className="travel-card-route"><MapPin aria-hidden="true" />{packageItem.route}</p>
        <div className="travel-inclusions">
          {packageItem.inclusions.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="travel-card-footer">
          <p className="travel-price">From <strong>{money(packageItem.price)}</strong>{packageItem.originalPrice && <s>{money(packageItem.originalPrice)}</s>}</p>
          <Link to={`/travel/customize?package=${packageItem.slug}`} className="travel-card-cta">View trip</Link>
        </div>
      </div>
    </article>
  )
}