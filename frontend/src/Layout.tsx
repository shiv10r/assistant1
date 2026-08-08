import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { getRole, logout } from './api'
import { applyTheme, getTheme } from './theme'
import type { Theme } from './theme'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Database,
  Activity,
  Settings,
  ReceiptText,
  Package,
  Banknote,
  Users,
  Briefcase,
  MessageSquare,
  CreditCard,
  User,
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronRight,
  Map,
  PlugZap,
  ScanBarcode,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import AiWidget from './components/AiWidget'
import { usePlan } from './hooks/usePlan'
import { cn, Button } from './components/ui'
import './Layout.css'

type NavItem = { label: string; to: string; icon: React.ReactNode; end?: boolean; badge?: string; adminOnly?: boolean }
type NavGroup = { title: string; items: NavItem[]; collapsible?: boolean }

const GROUPS: NavGroup[] = [
  { title: 'Assistant', items: [
    { label: 'Chat', to: '/', icon: <MessageSquare className="w-5 h-5" />, end: true },
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Reports', to: '/reports', icon: <FileText className="w-5 h-5" /> },
    { label: 'Analytics', to: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Backup & Sync', to: '/backup', icon: <Database className="w-5 h-5" /> },
    { label: 'Activity', to: '/activity', icon: <Activity className="w-5 h-5" /> },
    { label: 'Settings', to: '/settings', icon: <Settings className="w-5 h-5" /> },
  ]},
  { title: 'Billing', items: [
    { label: 'Transactions', to: '/billing', icon: <ReceiptText className="w-5 h-5" /> },
    { label: 'Items & Catalog', to: '/billing/items', icon: <Package className="w-5 h-5" /> },
    { label: 'Parties', to: '/billing/parties', icon: <Users className="w-5 h-5" /> },
    { label: 'Cash & Bank', to: '/billing/cashbank', icon: <Banknote className="w-5 h-5" /> },
    { label: 'Billing Settings', to: '/billing/settings', icon: <Settings className="w-5 h-5" /> },
  ]},
  { title: 'Projects', items: [
    { label: 'All Projects', to: '/projects', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Site Map', to: '/map', icon: <Map className="w-5 h-5" /> },
  ]},
  { title: 'Automation', items: [
    { label: 'Scan Barcode / QR', to: '/billing/items', icon: <ScanBarcode className="w-5 h-5" /> },
    { label: 'AI Vision Progress', to: '/vision', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Integrations', to: '/integrations', icon: <PlugZap className="w-5 h-5" /> },
    { label: 'Team & Roles', to: '/users', icon: <ShieldCheck className="w-5 h-5" />, adminOnly: true },
  ]},
  { title: 'Account', items: [
    { label: 'Plans & Billing', to: '/plans', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'My Profile', to: '/account', icon: <User className="w-5 h-5" /> },
  ]},
]

const PLAN_LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' }

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getTheme())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const { plan } = usePlan()
  const isAdmin = getRole() === 'admin' || !getRole()

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }
  function signOut() {
    logout()
    window.location.href = '/'
  }
  function toggleGroup(title: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <Menu className="w-6 h-6" />
        </button>
        <div className="logo-mark">
          <svg viewBox="0 0 456 456" width="32" height="32">
            <defs>
              <linearGradient id="lux" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7C4DFF"/><stop offset="0.6" stopColor="#00B8D9"/><stop offset="1" stopColor="#00E5C3"/>
              </linearGradient>
            </defs>
            <rect width="456" height="456" rx="100" fill="url(#lux)"/>
            <path d="M120 210 L228 120 L336 210" fill="none" stroke="#FFF" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M178 206 V330 H300" fill="none" stroke="#FFF" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="318" cy="228" r="17" fill="#0F0F1A"/>
          </svg>
        </div>
        <div className="brand">Lux<span>Infra</span></div>
        <div className="online">● Online</div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <div className="body-row">
        <nav className={cn('sidebar', open && 'open')}>
          {GROUPS.map((g) => {
            const isCollapsed = collapsedGroups.has(g.title)
            return (
              <div className="nav-group" key={g.title}>
                <button
                  className="group-header"
                  onClick={() => toggleGroup(g.title)}
                  aria-expanded={!isCollapsed}
                >
                  <span>{g.title}</span>
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {!isCollapsed && (
                  <div className="nav-items">
                    {g.items.filter((it) => !it.adminOnly || isAdmin).map((it) => (
                      <NavLink
                        key={it.to}
                        to={it.to}
                        end={it.end}
                        className={({ isActive }) => cn(
                          'nav-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                            : 'text-text/80 hover:bg-surface hover:text-text'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span className="flex-shrink-0">{it.icon}</span>
                        <span className="truncate">{it.label}</span>
                        {it.badge && <span className="ml-auto px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{it.badge}</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div className="sidebar-plan">
            <NavLink to="/plans" className="sidebar-plan-link">
              <span className={`sidebar-plan-dot ${plan === 'free' ? '' : 'is-pro'}`} />
              <span className="sidebar-plan-name">{PLAN_LABEL[plan] ?? 'Free'}</span>
              <span className="sidebar-plan-cta">{plan === 'free' ? 'Upgrade' : 'Manage'}</span>
            </NavLink>
          </div>
        </nav>
        {open && <div className="backdrop" onClick={() => setOpen(false)} />}

        <main className="content"><Outlet /></main>
      </div>
      <AiWidget />
    </div>
  )
}