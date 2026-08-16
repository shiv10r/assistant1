import type { ReactNode } from 'react'
import { CalendarDays, Compass, Heart, Map, Package, Plane, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './travel.css'

type TravelShellProps = {
  readonly children: ReactNode
}

const TRAVEL_NAV = [
  { to: '/travel', label: 'Discover', icon: Compass, end: true },
  { to: '/travel/destinations', label: 'Destinations', icon: Map, end: false },
  { to: '/travel/packages', label: 'Packages', icon: Package, end: false },
  { to: '/travel/group-trips', label: 'Group trips', icon: CalendarDays, end: false },
  { to: '/travel/customize', label: 'Custom trip', icon: Sparkles, end: false },
  { to: '/travel/my-trips', label: 'My trips', icon: Heart, end: false },
] as const

export default function TravelShell({ children }: TravelShellProps) {
  return (
    <div className="travel-app">
      <header className="travel-header">
        <NavLink className="travel-brand" to="/travel"><Plane aria-hidden="true" /> <span>VSR</span> Travel</NavLink>
        <nav className="travel-nav" aria-label="Travel navigation">
          {TRAVEL_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('travel-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink className="travel-plan-link" to="/travel/customize">Plan my trip</NavLink>
      </header>
      {children}
    </div>
  )
}
