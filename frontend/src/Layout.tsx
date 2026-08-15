import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getRole, logout } from './api'
import { api } from './api'
import type { Broadcast } from './api'
import { applyTheme, getTheme, isWeatherMode, setWeatherMode } from './theme'
import type { Theme } from './theme'
import { useWeather } from './hooks/useWeather'
import { conditionMeta } from './lib/weather'
import { serviceFromPath, getLastService, type ServiceId } from './lib/services'
import {
  LayoutDashboard,
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
  ChartSpline,
  Boxes,
  Video,
  CloudSun,
  Megaphone,
  ClipboardList,
  Truck,
  GraduationCap,
  Layers,
  Wallet,
  CalendarCheck,
  Clock,
  ArrowLeftRight,
  ClipboardCheck,
  Building2,
  ShoppingCart,
  ListChecks,
  PackageCheck,
  RotateCcw,
} from 'lucide-react'
import AiWidget from './components/AiWidget'
import WeatherCard from './components/WeatherCard'
import { Modal } from './components/ui'
import { usePlan } from './hooks/usePlan'
import { cn, Button } from './components/ui'
import './Layout.css'

type NavItem = { label: string; to: string; icon: React.ReactNode; end?: boolean; badge?: string; adminOnly?: boolean; premium?: boolean }
type NavGroup = { title: string; items: NavItem[]; collapsible?: boolean }

/** Groups shown only while inside a given service's workspace — everything service-specific lives here. */
const SERVICE_GROUPS: Record<ServiceId, NavGroup[]> = {
  interior: [
    { title: 'Interior Design', items: [
      { label: 'Overview', to: '/interior/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { label: 'All Projects', to: '/interior/projects', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Site Map', to: '/interior/map', icon: <Map className="w-5 h-5" /> },
      { label: 'AI Vision Progress', to: '/interior/vision', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'Modules', to: '/interior/modules', icon: <Boxes className="w-5 h-5" /> },
    ]},
    { title: 'Transactions', items: [
      { label: 'Invoices & Billing', to: '/billing', icon: <ReceiptText className="w-5 h-5" /> },
      { label: 'Catalog & Quotation', to: '/billing/items', icon: <Package className="w-5 h-5" /> },
      { label: 'Cash & Bank', to: '/billing/cashbank', icon: <Banknote className="w-5 h-5" /> },
      { label: 'Billing Settings', to: '/billing/settings', icon: <Settings className="w-5 h-5" /> },
    ]},
  ],
  warehouse: [
    { title: 'Warehouse Store', items: [
      { label: 'Overview', to: '/warehouse/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    ]},
    { title: 'Customer & Retailer', items: [
      { label: 'Customers', to: '/warehouse/customers', icon: <Users className="w-5 h-5" /> },
      { label: 'Customers & Suppliers', to: '/warehouse/suppliers', icon: <Users className="w-5 h-5" /> },
      { label: 'Parties Ledger', to: '/billing/parties', icon: <Users className="w-5 h-5" /> },
    ]},
    { title: 'Inventory', items: [
      { label: 'Stock', to: '/warehouse/inventory', icon: <Package className="w-5 h-5" /> },
      { label: 'Products', to: '/warehouse/products', icon: <Boxes className="w-5 h-5" /> },
      { label: 'Warehouses & Locations', to: '/warehouse/warehouses', icon: <Building2 className="w-5 h-5" /> },
      { label: 'Purchase Orders', to: '/warehouse/purchase-orders', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Goods Received', to: '/warehouse/grn', icon: <Truck className="w-5 h-5" /> },
      { label: 'Stock Transfer', to: '/warehouse/transfers', icon: <ArrowLeftRight className="w-5 h-5" /> },
      { label: 'Stock Count', to: '/warehouse/stock-count', icon: <ClipboardCheck className="w-5 h-5" /> },
      { label: 'Scan Barcode / QR', to: '/billing/items', icon: <ScanBarcode className="w-5 h-5" /> },
    ]},
    { title: 'Outbound', items: [
      { label: 'Sales Orders', to: '/warehouse/orders', icon: <ShoppingCart className="w-5 h-5" /> },
      { label: 'Picking', to: '/warehouse/picking', icon: <ListChecks className="w-5 h-5" /> },
      { label: 'Packing', to: '/warehouse/packing', icon: <PackageCheck className="w-5 h-5" /> },
      { label: 'Dispatch', to: '/warehouse/dispatch', icon: <Truck className="w-5 h-5" /> },
      { label: 'Returns', to: '/warehouse/returns', icon: <RotateCcw className="w-5 h-5" /> },
    ]},
    { title: 'Transactions', items: [
      { label: 'Invoices & Billing', to: '/billing', icon: <ReceiptText className="w-5 h-5" /> },
      { label: 'Catalog & Quotation', to: '/billing/items', icon: <Package className="w-5 h-5" /> },
      { label: 'Cash & Bank', to: '/billing/cashbank', icon: <Banknote className="w-5 h-5" /> },
      { label: 'Billing Settings', to: '/billing/settings', icon: <Settings className="w-5 h-5" /> },
    ]},
    { title: 'Staff Management', items: [
      { label: 'Staff & Attendance', to: '/warehouse/staff', icon: <Clock className="w-5 h-5" /> },
    ]},
    { title: 'Project Management', items: [
      { label: 'Projects', to: '/warehouse/projects', icon: <Briefcase className="w-5 h-5" /> },
    ]},
  ],
  school: [
    { title: 'School Management', items: [
      { label: 'Overview', to: '/school', icon: <GraduationCap className="w-5 h-5" />, end: true },
    ]},
    { title: 'Customer & Retailer', items: [
      { label: 'Students', to: '/school/students', icon: <Users className="w-5 h-5" /> },
      { label: 'Classes', to: '/school/classes', icon: <Layers className="w-5 h-5" /> },
    ]},
    { title: 'Inventory', items: [
      { label: 'Stock', to: '/school/inventory', icon: <Package className="w-5 h-5" /> },
    ]},
    { title: 'Transactions', items: [
      { label: 'Fees', to: '/school/fees', icon: <Wallet className="w-5 h-5" /> },
      { label: 'Invoices & Billing', to: '/billing', icon: <ReceiptText className="w-5 h-5" /> },
      { label: 'Catalog & Quotation', to: '/billing/items', icon: <Package className="w-5 h-5" /> },
      { label: 'Cash & Bank', to: '/billing/cashbank', icon: <Banknote className="w-5 h-5" /> },
    ]},
    { title: 'Staff Management', items: [
      { label: 'Staff & Attendance', to: '/school/staff', icon: <Clock className="w-5 h-5" /> },
      { label: 'Student Attendance', to: '/school/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
    ]},
    { title: 'Project Management', items: [
      { label: 'Projects & Events', to: '/school/projects', icon: <Briefcase className="w-5 h-5" /> },
    ]},
  ],
}

/** Groups shared across every service — kept to the fixed global feature set only. */
const COMMON_GROUPS: NavGroup[] = [
  { title: 'Assistant', items: [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { label: 'Chat', to: '/assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Analytics', to: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Backup & Sync', to: '/backup', icon: <Database className="w-5 h-5" /> },
    { label: 'Activity', to: '/activity', icon: <Activity className="w-5 h-5" /> },
    { label: 'Settings', to: '/settings', icon: <Settings className="w-5 h-5" /> },
  ]},
  { title: 'Business', items: [
    { label: 'Insights', to: '/insights', icon: <ChartSpline className="w-5 h-5" /> },
    { label: 'Video Call', to: '/video', icon: <Video className="w-5 h-5" /> },
  ]},
  { title: 'More', items: [
    { label: 'Broadcast', to: '/broadcast', icon: <Megaphone className="w-5 h-5" />, badge: 'PRO', premium: true },
    { label: 'Upcoming Feature', to: '/integrations', icon: <PlugZap className="w-5 h-5" /> },
    { label: 'Team & Roles', to: '/users', icon: <ShieldCheck className="w-5 h-5" />, adminOnly: true },
  ]},
  { title: 'Account', items: [
    { label: 'Plans & Billing', to: '/plans', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'My Profile', to: '/account', icon: <User className="w-5 h-5" /> },
  ]},
]

/** Service-specific groups first, then the groups common to every workspace. */
function navGroupsFor(serviceId: ServiceId | undefined): NavGroup[] {
  const serviceGroups = serviceId ? SERVICE_GROUPS[serviceId] : []
  return [...serviceGroups, ...COMMON_GROUPS]
}

const PLAN_LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', business: 'Business' }

const SIDEBAR_KEY = 'lux_sidebar_open'

function BroadcastTicker() {
  const [active, setActive] = useState<Broadcast | null>(null)

  useEffect(() => {
    const load = () => api.modules.broadcastActive().then((r) => setActive(r.active)).catch(() => {})
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  if (!active) return null
  return (
    <div className="broadcast-ticker">
      <div className="broadcast-ticker-track">
        <span className="broadcast-ticker-item"><Megaphone className="w-4 h-4" /> {active.message}</span>
        <span className="broadcast-ticker-item"><Megaphone className="w-4 h-4" /> {active.message}</span>
        <span className="broadcast-ticker-item"><Megaphone className="w-4 h-4" /> {active.message}</span>
        <span className="broadcast-ticker-item"><Megaphone className="w-4 h-4" /> {active.message}</span>
      </div>
    </div>
  )
}

function defaultSidebarOpen(): boolean {
  const saved = localStorage.getItem(SIDEBAR_KEY)
  if (saved !== null) return saved === '1'
  return window.innerWidth > 900
}

export default function Layout() {
  const [open, setOpen] = useState(defaultSidebarOpen)
  const [theme, setTheme] = useState<Theme>(getTheme())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [weatherOn, setWeatherOn] = useState(isWeatherMode())
  const [weatherOpen, setWeatherOpen] = useState(false)
  const { plan } = usePlan()
  const isAdmin = getRole() === 'admin' || !getRole()
  const weather = useWeather()

  function toggleWeatherMode() {
    const next = !weatherOn
    setWeatherOn(next)
    setWeatherMode(next)
    setWeatherOpen(true)
    if (next) {
      weather.setMode(true)
      weather.enable()
    } else {
      applyTheme(theme)
      weather.setMode(false)
    }
  }

  function toggleSidebar() {
    setOpen(prev => {
      const next = !prev
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0')
      return next
    })
  }

  function isMobile() {
    return typeof window !== 'undefined' && window.innerWidth <= 900
  }

  function navClicked() {
    if (isMobile()) setOpen(false)
  }

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

  const location = useLocation()
  const navigate = useNavigate()
  const service = serviceFromPath(location.pathname) ?? getLastService()
  const groups = navGroupsFor(service?.id)

  return (
    <div className="app">
      <header className="topbar">
        <button className="hamburger" onClick={toggleSidebar} aria-label="Menu" title={open ? 'Hide menu' : 'Show menu'}>
          <Menu className="w-6 h-6" />
        </button>
        {service && (
          <button className="service-pill" onClick={() => navigate('/')} title="Switch service">
            <span className="pill-label">{service.label}</span>
            <span className="pill-switch">Switch service</span>
          </button>
        )}
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeatherOpen(true)}
          aria-label="Weather"
          title={weatherOn ? `Weather: ${weather.weather?.condition ?? 'loading…'}` : 'Weather'}
          className={weatherOn ? '!text-amber-400 !border !border-amber-400/40 rounded-lg' : ''}
        >
          {weatherOn && weather.weather
            ? <span className="text-base leading-none">{conditionMeta(weather.weather.weatherCode, weather.weather.isDay).icon}</span>
            : <CloudSun className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <BroadcastTicker />

      <div className="body-row">
        <nav className={cn('sidebar', open ? 'open' : 'collapsed')}>
          {groups.map((g) => {
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
                    {g.items.filter((it) => (!it.adminOnly || isAdmin) && (!it.premium || plan !== 'free')).map((it) => (
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
                        onClick={navClicked}
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
        {open && isMobile() && <div className="backdrop" onClick={() => setOpen(false)} />}

        <main className="content"><Outlet /></main>
      </div>
      <AiWidget />

      <Modal open={weatherOpen} onClose={() => setWeatherOpen(false)} title="Weather" description={weatherOn ? 'Weather app mode is on — theme follows site weather' : 'View weather for your location'}>
        <div className="space-y-4">
          <WeatherCard useMyLocation siteName="Your location" className="w-full" />
          <div className="flex items-center gap-2 text-xs text-muted">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={weatherOn} onChange={() => toggleWeatherMode()} className="accent-[var(--primary)]" />
              Weather app mode — theme follows current weather
            </label>
          </div>
          <p className="text-[11px] text-muted">Weather data by <a className="text-primary hover:underline" href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a> — free &amp; open source, no API key needed.</p>
        </div>
      </Modal>
    </div>
  )
}