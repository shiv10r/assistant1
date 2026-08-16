import type { ReactNode } from 'react'
import { Bell, CreditCard, Landmark, LayoutDashboard, Receipt, Send, Users, Wallet, FileText, PiggyBank, FileDown, User, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import './banking.css'

type BankShellProps = {
  readonly children: ReactNode
  readonly unreadCount: number
}

const BANK_NAV = [
  { to: '/bank', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/bank/accounts', label: 'Accounts', icon: Wallet, end: false },
  { to: '/bank/transfers', label: 'Transfers', icon: Send, end: false },
  { to: '/bank/beneficiaries', label: 'Beneficiaries', icon: Users, end: false },
  { to: '/bank/cards', label: 'Cards', icon: CreditCard, end: false },
  { to: '/bank/deposits', label: 'Deposits', icon: PiggyBank, end: false },
  { to: '/bank/loans', label: 'Loans', icon: Landmark, end: false },
  { to: '/bank/statements', label: 'Statements', icon: FileDown, end: false },
  { to: '/bank/bills', label: 'Bills', icon: Receipt, end: false },
] as const

const BANK_TOOLS = [
  { to: '/bank/notifications', label: 'Notifications', icon: Bell },
  { to: '/bank/documents', label: 'Documents', icon: FileText },
  { to: '/bank/profile', label: 'Profile & Security', icon: User },
  { to: '/bank/admin', label: 'Admin Console', icon: ShieldCheck },
] as const

export default function BankShell({ children, unreadCount }: BankShellProps) {
  return (
    <div className="bank-app">
      <header className="bank-header">
        <NavLink className="bank-brand" to="/bank"><Landmark aria-hidden="true" /> <span>VSR</span> Bank</NavLink>
        <nav className="bank-nav" aria-label="Bank navigation">
          {BANK_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('bank-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
            </NavLink>
          ))}
          {BANK_TOOLS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('bank-nav-link', isActive && 'is-active')}>
              <item.icon aria-hidden="true" /> {item.label}
              {item.to === '/bank/notifications' && unreadCount > 0 && <span className="bank-badge">{unreadCount}</span>}
            </NavLink>
          ))}
        </nav>
      </header>
      {children}
    </div>
  )
}