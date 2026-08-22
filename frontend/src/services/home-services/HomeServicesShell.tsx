import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import {
  MdAccountBalanceWallet, MdAddCircle, MdAdminPanelSettings, MdAssignmentTurnedIn, MdBarChart,
  MdBuild, MdDashboard, MdEventAvailable, MdGroups, MdHome, MdHomeWork, MdInventory, MdPayments,
  MdPendingActions, MdPerson, MdPriceChange, MdRedeem, MdVerifiedUser, MdViewKanban,
  MdWorkspacePremium, MdSupportAgent, MdReportGmailerrorred,
} from 'react-icons/md'
import { cn } from '../../lib/utils'
import { usePersona, setPersona, type HsPersona } from './hsShared'
import './home-services.css'

const CUSTOMER_NAV = [
  { to: '/home-services', label: 'Home', icon: MdHome, end: true },
  { to: '/home-services/categories', label: 'Services', icon: MdBuild, end: false },
  { to: '/home-services/bookings', label: 'Bookings', icon: MdEventAvailable, end: false },
  { to: '/home-services/addresses', label: 'Addresses', icon: MdHomeWork, end: false },
  { to: '/home-services/offers', label: 'Offers', icon: MdRedeem, end: false },
  { to: '/home-services/account', label: 'Account', icon: MdPerson, end: false },
] as const

const PROFESSIONAL_NAV = [
  { to: '/home-services/pro', label: 'Home', icon: MdHome, end: true },
  { to: '/home-services/pro/requests', label: 'Requests', icon: MdPendingActions, end: false },
  { to: '/home-services/pro/jobs', label: 'Jobs', icon: MdAssignmentTurnedIn, end: false },
  { to: '/home-services/pro/earnings', label: 'Earnings', icon: MdAccountBalanceWallet, end: false },
  { to: '/home-services/pro/profile', label: 'Account', icon: MdPerson, end: false },
] as const

const ADMIN_NAV = [
  { to: '/home-services/admin', label: 'Dashboard', icon: MdDashboard, end: true },
  { to: '/home-services/admin/live', label: 'Live Ops', icon: MdViewKanban, end: false },
  { to: '/home-services/admin/bookings', label: 'Bookings', icon: MdEventAvailable, end: false },
  { to: '/home-services/admin/professionals', label: 'Professionals', icon: MdVerifiedUser, end: false },
  { to: '/home-services/admin/finance', label: 'Finance', icon: MdPayments, end: false },
  { to: '/home-services/database-check', label: 'Database', icon: MdInventory, end: false },
  { to: '/home-services/categories/add', label: 'Add Category', icon: MdAddCircle, end: false },
] as const

const PERSONAS: readonly { id: HsPersona; label: string }[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'professional', label: 'Professional' },
  { id: 'admin', label: 'Admin' },
]

export function personaFromPath(pathname: string): HsPersona {
  if (pathname.startsWith('/home-services/admin') || pathname.startsWith('/home-services/database-check') || pathname.startsWith('/home-services/categories/add')) return 'admin'
  if (pathname.startsWith('/home-services/pro')) return 'professional'
  return 'customer'
}

export default function HomeServicesShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const persona = usePersona()
  // Keep persona state in sync with the actual route so deep links behave.
  const routedPersona = personaFromPath(location.pathname)
  const nav = routedPersona === 'professional' ? PROFESSIONAL_NAV : routedPersona === 'admin' ? ADMIN_NAV : CUSTOMER_NAV

  return (
    <div className="hs-app">
      <header className="hs-header">
        <NavLink to="/home-services" className="hs-brand" onClick={() => setPersona('customer')}>
          <span className="hs-brand-mark"><MdWorkspacePremium aria-hidden="true" /></span>
          <span>
            VSR Home Services
            <br />
            <small>Verified pros at your door</small>
          </span>
        </NavLink>

        <nav className="hs-persona-switch" aria-label="Switch application persona">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              data-persona={p.id}
              className={cn('hs-persona-btn', (routedPersona === p.id || persona === p.id) && 'is-active')}
              onClick={() => setPersona(p.id)}
            >
              {p.id === 'customer' ? <MdPerson aria-hidden="true" /> : p.id === 'professional' ? <MdVerifiedUser aria-hidden="true" /> : <MdAdminPanelSettings aria-hidden="true" />}
              {p.label}
            </button>
          ))}
        </nav>
      </header>

      <nav className="hs-nav" aria-label="Primary navigation">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('hs-nav-link', isActive && 'is-active')}>
            <item.icon aria-hidden="true" /> {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="hs-main">{children}</main>

      <nav className="hs-bottom-nav" aria-label="Mobile navigation">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('hs-bottom-link', isActive && 'is-active')}>
            <item.icon aria-hidden="true" /> {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

// Icons kept referenced here so tree-shaking never drops them from shared bundles.
export const _icons = { MdBarChart, MdGroups, MdInventory, MdPriceChange, MdReportGmailerrorred, MdSupportAgent }