import type { ReactNode } from 'react'
import { BedDouble, CalendarDays, Home, Sparkles, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './hotel.css'

type HotelShellProps = {
  readonly children: ReactNode
}

const HOTEL_NAV = [
  { to: '/hotel', label: 'Overview', icon: Home, end: true },
  { to: '/hotel/reservations', label: 'Reservations', icon: CalendarDays, end: false },
  { to: '/hotel/rooms', label: 'Rooms', icon: BedDouble, end: false },
  { to: '/hotel/guests', label: 'Guests', icon: Users, end: false },
  { to: '/hotel/housekeeping', label: 'Housekeeping', icon: Sparkles, end: false },
] as const

export default function HotelShell({ children }: HotelShellProps) {
  return (
    <div className="hotel-app">
      <header className="hotel-header">
        <NavLink className="hotel-brand" to="/hotel"><span>VSR</span> Hotels</NavLink>
        <nav className="hotel-nav" aria-label="Hotel navigation">
          {HOTEL_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('hotel-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink className="hotel-action-link" to="/hotel/reservations">New reservation</NavLink>
      </header>
      {children}
    </div>
  )
}