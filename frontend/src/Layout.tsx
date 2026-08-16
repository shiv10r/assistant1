import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getRole, logout } from './api'
import { api } from './api'
import type { Broadcast } from './api'
import { applyTheme, getTheme, isWeatherMode, setWeatherMode } from './theme'
import type { Theme } from './theme'
import { useWeather } from './hooks/useWeather'
import { conditionMeta } from './lib/weather'
import { serviceFromPath, getLastService, type ServiceDef, type ServiceId } from './lib/services'
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
  Search,
  UserPlus,
  BookOpen,
  CalendarDays,
  Monitor,
  Trophy,
  FileText,
  UtensilsCrossed,
  Flag,
  HeartHandshake,
  Bell,
  Award,
  LifeBuoy,
  Scale,
  Siren,
  Newspaper,
  Bookmark,
} from 'lucide-react'
import AiWidget from './components/AiWidget'
import WeatherCard from './components/WeatherCard'
import GlobalSearch from './components/GlobalSearch'
import { VsrLogo } from './components/VsrLogo'
import { Modal } from './components/ui'
import { usePlan } from './hooks/usePlan'
import { useViewMode } from './hooks/useViewMode'
import { cn, Button } from './components/ui'
import './Layout.css'

type NavItem = { label: string; to: string; icon: React.ReactNode; end?: boolean; badge?: string; adminOnly?: boolean; premium?: boolean; hideFor?: ServiceId[] }
type NavGroup = { title: string; items: NavItem[]; collapsible?: boolean }

/** Groups shown only while inside a given service's workspace — everything service-specific lives here. */
const SERVICE_GROUPS: Record<ServiceId, NavGroup[]> = {
  interior: [
    { title: 'Interior Design', items: [
      { label: 'Overview', to: '/interior/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { label: 'Projects', to: '/interior/projects', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Products', to: '/interior/products', icon: <Package className="w-5 h-5" /> },
      { label: 'AI Designs', to: '/interior/projects', icon: <Sparkles className="w-5 h-5" /> },
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
    { title: 'Retailers & Vendors', items: [
      { label: 'Retailers', to: '/warehouse/customers', icon: <Users className="w-5 h-5" /> },
      { label: 'Vendors', to: '/warehouse/suppliers', icon: <Users className="w-5 h-5" /> },
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
      { label: 'Site Map', to: '/warehouse/map', icon: <Map className="w-5 h-5" /> },
      { label: 'Business Modules', to: '/warehouse/modules', icon: <Boxes className="w-5 h-5" /> },
    ]},
  ],
  school: [
    { title: 'Command Center', items: [
      { label: 'Overview', to: '/school', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    ]},
    { title: 'People', items: [
      { label: 'Students', to: '/school/students', icon: <Users className="w-5 h-5" /> },
      { label: 'Parents', to: '/school/parents', icon: <Users className="w-5 h-5" /> },
      { label: 'Directory', to: '/school/directory', icon: <Search className="w-5 h-5" /> },
      { label: 'Staff & Attendance', to: '/school/staff', icon: <Clock className="w-5 h-5" /> },
    ]},
    { title: 'Admissions & CRM', items: [
      { label: 'Admissions Pipeline', to: '/school/admissions', icon: <UserPlus className="w-5 h-5" /> },
    ]},
    { title: 'Academics', items: [
      { label: 'Classes', to: '/school/classes', icon: <Layers className="w-5 h-5" /> },
      { label: 'Sessions', to: '/school/sessions', icon: <CalendarCheck className="w-5 h-5" /> },
      { label: 'Subjects', to: '/school/subjects', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Timetable', to: '/school/timetable', icon: <Clock className="w-5 h-5" /> },
      { label: 'Homework', to: '/school/homework', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'LMS', to: '/school/lms', icon: <BookOpen className="w-5 h-5" /> },
    ]},
    { title: 'Attendance', items: [
      { label: 'Student Attendance', to: '/school/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
      { label: 'Attendance Analytics', to: '/school/attendance-analytics', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Leave Requests', to: '/school/leave', icon: <CalendarDays className="w-5 h-5" /> },
    ]},
    { title: 'Examination', items: [
      { label: 'Question Bank', to: '/school/questions', icon: <ClipboardCheck className="w-5 h-5" /> },
      { label: 'Exams & Marks', to: '/school/exams', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Online Exams', to: '/school/online-exams', icon: <Monitor className="w-5 h-5" /> },
      { label: 'Results', to: '/school/results', icon: <Trophy className="w-5 h-5" /> },
    ]},
    { title: 'Finance', items: [
      { label: 'Fees', to: '/school/fees', icon: <Wallet className="w-5 h-5" /> },
      { label: 'Fee Structure', to: '/school/fee-structure', icon: <FileText className="w-5 h-5" /> },
      { label: 'Receipts', to: '/school/receipts', icon: <ReceiptText className="w-5 h-5" /> },
      { label: 'Expenses', to: '/school/expenses', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'Payroll', to: '/school/payroll', icon: <Banknote className="w-5 h-5" /> },
    ]},
    { title: 'HR', items: [
      { label: 'Recruitment', to: '/school/recruitment', icon: <UserPlus className="w-5 h-5" /> },
      { label: 'Performance', to: '/school/performance', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Training', to: '/school/training', icon: <GraduationCap className="w-5 h-5" /> },
    ]},
    { title: 'Operations', items: [
      { label: 'Stock', to: '/school/inventory', icon: <Package className="w-5 h-5" /> },
      { label: 'Transport', to: '/school/transport', icon: <Truck className="w-5 h-5" /> },
      { label: 'Library', to: '/school/library', icon: <BookOpen className="w-5 h-5" /> },
      { label: 'Procurement', to: '/school/procurement', icon: <ShoppingCart className="w-5 h-5" /> },
      { label: 'Assets', to: '/school/assets', icon: <Package className="w-5 h-5" /> },
      { label: 'Visitors', to: '/school/visitors', icon: <Users className="w-5 h-5" /> },
      { label: 'Hostel', to: '/school/hostel', icon: <Building2 className="w-5 h-5" /> },
      { label: 'Cafeteria', to: '/school/cafeteria', icon: <UtensilsCrossed className="w-5 h-5" /> },
    ]},
    { title: 'Student Life', items: [
      { label: 'Clubs', to: '/school/clubs', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'Sports', to: '/school/sports', icon: <Trophy className="w-5 h-5" /> },
      { label: 'Houses', to: '/school/houses', icon: <Flag className="w-5 h-5" /> },
      { label: 'Discipline', to: '/school/discipline', icon: <ShieldCheck className="w-5 h-5" /> },
      { label: 'Counselling', to: '/school/counselling', icon: <HeartHandshake className="w-5 h-5" /> },
    ]},
    { title: 'Communication', items: [
      { label: 'Notices', to: '/school/notices', icon: <Megaphone className="w-5 h-5" /> },
      { label: 'Events', to: '/school/events', icon: <CalendarDays className="w-5 h-5" /> },
      { label: 'Messaging', to: '/school/messaging', icon: <MessageSquare className="w-5 h-5" /> },
      { label: 'Notifications', to: '/school/notifications', icon: <Bell className="w-5 h-5" /> },
      { label: 'PTM', to: '/school/ptm', icon: <CalendarCheck className="w-5 h-5" /> },
      { label: 'Surveys', to: '/school/surveys', icon: <ClipboardCheck className="w-5 h-5" /> },
    ]},
    { title: 'Documents', items: [
      { label: 'Documents', to: '/school/documents', icon: <FileText className="w-5 h-5" /> },
      { label: 'Certificates', to: '/school/certificates', icon: <Award className="w-5 h-5" /> },
    ]},
    { title: 'Service', items: [
      { label: 'Helpdesk', to: '/school/helpdesk', icon: <LifeBuoy className="w-5 h-5" /> },
      { label: 'Grievances', to: '/school/grievances', icon: <Scale className="w-5 h-5" /> },
      { label: 'Incidents', to: '/school/incidents', icon: <Siren className="w-5 h-5" /> },
      { label: 'Tasks', to: '/school/tasks', icon: <ListChecks className="w-5 h-5" /> },
    ]},
    { title: 'System', items: [
      { label: 'Users & Roles', to: '/school/users', icon: <Users className="w-5 h-5" /> },
      { label: 'Audit Log', to: '/school/audit', icon: <ShieldCheck className="w-5 h-5" /> },
      { label: 'Settings', to: '/school/settings', icon: <Settings className="w-5 h-5" /> },
    ]},
    { title: 'Projects & Events', items: [
      { label: 'Projects', to: '/school/projects', icon: <Briefcase className="w-5 h-5" /> },
    ]},
  ],
  hotel: [
    { title: 'Hotel Operations', items: [
      { label: 'Overview', to: '/hotel', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { label: 'Reservations', to: '/hotel/reservations', icon: <CalendarCheck className="w-5 h-5" /> },
      { label: 'Rooms', to: '/hotel/rooms', icon: <Building2 className="w-5 h-5" /> },
      { label: 'Guests', to: '/hotel/guests', icon: <Users className="w-5 h-5" /> },
      { label: 'Housekeeping', to: '/hotel/housekeeping', icon: <Sparkles className="w-5 h-5" /> },
    ]},
  ],
  travel: [
    { title: 'Travel & Tours', items: [
      { label: 'Discover', to: '/travel', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
      { label: 'Destinations', to: '/travel/destinations', icon: <Map className="w-5 h-5" /> },
      { label: 'Holiday Packages', to: '/travel/packages', icon: <Package className="w-5 h-5" /> },
      { label: 'Group Trips', to: '/travel/group-trips', icon: <Users className="w-5 h-5" /> },
      { label: 'Customize Trip', to: '/travel/customize', icon: <Sparkles className="w-5 h-5" /> },
      { label: 'My Trips', to: '/travel/my-trips', icon: <CalendarCheck className="w-5 h-5" /> },
    ]},
  ],
  news: [
    { title: 'VSR News', items: [
      { label: 'Top Stories', to: '/news', icon: <Newspaper className="w-5 h-5" />, end: true },
      { label: 'Latest', to: '/news/latest', icon: <Clock className="w-5 h-5" /> },
      { label: 'Trending', to: '/news/trending', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Search', to: '/news/search', icon: <Search className="w-5 h-5" /> },
      { label: 'Saved Stories', to: '/news/bookmarks', icon: <Bookmark className="w-5 h-5" /> },
    ]},
    { title: 'News Desks', items: [
      { label: 'India', to: '/news/category/india', icon: <Flag className="w-5 h-5" /> },
      { label: 'World', to: '/news/category/world', icon: <Map className="w-5 h-5" /> },
      { label: 'Business', to: '/news/category/business', icon: <Banknote className="w-5 h-5" /> },
      { label: 'Technology', to: '/news/category/technology', icon: <Monitor className="w-5 h-5" /> },
      { label: 'Sports', to: '/news/category/sports', icon: <Trophy className="w-5 h-5" /> },
      { label: 'Entertainment', to: '/news/category/entertainment', icon: <Video className="w-5 h-5" /> },
    ]},
  ],
  jobs: [
    { title: 'VSR Jobs', items: [
      { label: 'Discover Jobs', to: '/jobs', icon: <Briefcase className="w-5 h-5" />, end: true },
      { label: 'Search Jobs', to: '/jobs/search', icon: <Search className="w-5 h-5" /> },
      { label: 'Companies', to: '/jobs/companies', icon: <Building2 className="w-5 h-5" /> },
{ label: 'Applications', to: '/jobs/applications', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Profile', to: '/jobs/profile', icon: <User className="w-5 h-5" /> },
      { label: 'Saved Jobs', to: '/jobs/saved', icon: <Bookmark className="w-5 h-5" /> },
    ]},
  ],
}

/** Groups shared across every service — kept to the fixed global feature set only. */
const COMMON_GROUPS: NavGroup[] = [
  { title: 'Assistant', items: [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { label: 'Chat', to: '/assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Analytics', to: '/analytics', icon: <BarChart3 className="w-5 h-5" />, hideFor: ['warehouse'] },
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
function navGroupsFor(service: ServiceDef | null): NavGroup[] {
  const serviceGroups = service ? SERVICE_GROUPS[service.id] : []
  return service?.shell === 'portal' ? serviceGroups : [...serviceGroups, ...COMMON_GROUPS]
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
  const [searchOpen, setSearchOpen] = useState(false)
  const { plan } = usePlan()
  const { mode, setMode } = useViewMode()
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
  const groups = navGroupsFor(service)
  const isPortal = service?.shell === 'portal'

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
        <VsrLogo size={38} wordmark className="logo-mark" />
        {!isPortal && <>
          <div className="online">● Online</div>
          <NavLink
            to="/plans"
            className={`plan-pill ${plan === 'free' ? '' : 'is-pro'}`}
            title={`Current plan: ${PLAN_LABEL[plan] ?? 'Free'}`}
          >
            <span className="plan-pill-dot" />
            <span>{PLAN_LABEL[plan] ?? 'Free'}</span>
          </NavLink>
          <button className="topbar-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Global search" title="Search anything (Ctrl+K)">
            <Search className="w-5 h-5" />
          </button>
          <div className="view-mode-switch" title="Simple / Advanced view">
            <button className={mode === 'simple' ? 'active' : ''} onClick={() => setMode('simple')} aria-label="Simple view">Simple</button>
            <button className={mode === 'advanced' ? 'active' : ''} onClick={() => setMode('advanced')} aria-label="Advanced view">Advanced</button>
          </div>
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
        </>}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {!isPortal && <BroadcastTicker />}

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
                    {g.items.filter((it) => (!it.adminOnly || isAdmin) && (!it.premium || plan !== 'free') && (!it.hideFor || !service || !it.hideFor.includes(service.id))).map((it) => (
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
          {!isPortal && <div className="sidebar-plan">
            <NavLink to="/plans" className="sidebar-plan-link">
              <span className={`sidebar-plan-dot ${plan === 'free' ? '' : 'is-pro'}`} />
              <span className="sidebar-plan-name">{PLAN_LABEL[plan] ?? 'Free'}</span>
              <span className="sidebar-plan-cta">{plan === 'free' ? 'Upgrade' : 'Manage'}</span>
            </NavLink>
          </div>}
        </nav>
        {open && isMobile() && <div className="backdrop" onClick={() => setOpen(false)} />}

        <main className="content"><Outlet /></main>
      </div>
      {!isPortal && <>
        <AiWidget />
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
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
      </>}
    </div>
  )
}
