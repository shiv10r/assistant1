import { Heart, MapPin, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, money } from '../../components/ui'
import type { TravelPackage } from './types'

type TravelPackageCardProps = {
  readonly packageItem: TravelPackage
  readonly saved: boolean
  readonly onToggleSaved: (packageId: string) => void
}

export function TravelPackageCard({ packageItem, saved, onToggleSaved }: TravelPackageCardProps) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-transform hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface2">
        <img src={packageItem.image} alt={`${packageItem.destination} travel package`} width="640" height="400" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <Badge variant="warning" size="sm" className="absolute left-3 top-3">{packageItem.badge}</Badge>
        <button type="button" onClick={() => onToggleSaved(packageItem.id)} aria-label={saved ? `Remove ${packageItem.title} from wishlist` : `Save ${packageItem.title} to wishlist`} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-transform active:scale-95">
          <Heart className={`h-4 w-4 ${saved ? 'fill-white' : ''}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
          <span>{packageItem.durationDays}D / {packageItem.durationNights}N · {packageItem.tripType}</span>
          <span className="inline-flex items-center gap-1 text-text"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{packageItem.rating}</span>
        </div>
        <h2 className="text-base font-bold text-text">{packageItem.title}</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3.5 w-3.5" />{packageItem.route}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {packageItem.inclusions.map((item) => <span key={item} className="rounded-full bg-surface2 px-2 py-1 text-[11px] text-muted">{item}</span>)}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div><p className="text-[11px] text-muted">From</p><p className="font-bold text-text">{money(packageItem.price)} <span className="text-[11px] font-normal text-muted">/ person</span></p>{packageItem.originalPrice && <p className="text-[11px] text-muted line-through">{money(packageItem.originalPrice)}</p>}</div>
          <div className="text-right"><p className="mb-2 flex items-center justify-end gap-1 text-[11px] text-muted"><Users className="h-3 w-3" />{packageItem.travelers} travelers</p><Link to={`/travel/customize?package=${packageItem.slug}`} className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:opacity-90">View trip</Link></div>
        </div>
      </div>
    </article>
  )
}
