import type { ReactNode } from 'react'
import { Activity, Bell, CalendarDays, ClipboardList, CreditCard, FlaskConical, HeartPulse, LayoutDashboard, Pill, Stethoscope, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './medical.css'

type MedicalShellProps = {
  readonly children: ReactNode
  readonly unreadCount: number
}

const MEDICAL_NAV = [
  { to: '/medical', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/medical/doctors', label: 'Doctors', icon: Stethoscope, end: false },
  { to: '/medical/appointments', label: 'Appointments', icon: CalendarDays, end: false },
  { to: '/medical/patients', label: 'Patients', icon: Users, end: false },
  { to: '/medical/prescriptions', label: 'Prescriptions', icon: Pill, end: false },
  { to: '/medical/labs', label: 'Lab Results', icon: FlaskConical, end: false },
  { to: '/medical/billing', label: 'Billing', icon: CreditCard, end: false },
] as const

const MEDICAL_TOOLS = [
  { to: '/medical/records', label: 'Clinical Records', icon: ClipboardList },
  { to: '/medical/notifications', label: 'Notifications', icon: Bell },
  { to: '/medical/admin', label: 'Admin Console', icon: Activity },
] as const

export default function MedicalShell({ children, unreadCount }: MedicalShellProps) {
  return (
    <div className="med-app">
      <header className="med-header">
        <NavLink className="med-brand" to="/medical"><HeartPulse aria-hidden="true" /> <span>VSR</span> Health</NavLink>
        <nav className="med-nav" aria-label="Medical navigation">
          {MEDICAL_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('med-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
          {MEDICAL_TOOLS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('med-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
              {item.to === '/medical/notifications' && unreadCount > 0 && <span className="med-badge">{unreadCount}</span>}
            </NavLink>
          ))}
        </nav>
      </header>
      {children}
    </div>
  )
}