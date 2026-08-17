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
  FiPackage,
  FiTruck,
  FiUsers,
  FiClipboard,
  FiCheckSquare,
  FiShoppingCart,
  FiList,
  FiRotateCcw,
  FiSearch,
  FiUserPlus,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiDatabase,
  FiSettings,
  FiVideo,
  FiZap,
  FiShield,
  FiCreditCard,
  FiUser,
  FiGrid,
  FiMap,
  FiTag,
  FiHeart,
  FiCloud,
  FiArrowRight,
  FiCode,
} from 'react-icons/fi'
import {
  MdDashboard,
  MdBarChart,
  MdReceipt,
  MdInventory,
  MdAccountBalance,
  MdWork,
  MdMenu,
  MdWbSunny,
  MdLogout,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdMonitor,
  MdEmojiEvents,
  MdDescription,
  MdFlag,
  MdNotifications,
  MdScale,
  MdWarning,
  MdBookmarkBorder,
  MdFavorite,
  MdSend,
  MdFileDownload,
  MdMedication,
  MdHelp,
  MdScience,
  MdRestaurant,
  MdAccountBalanceWallet,
  MdCalendarToday,
  MdAccessTime,
  MdSettings,
  MdLocalShipping,
  MdLayers,
  MdBuild,
  MdSchool,
  MdSavings,
} from 'react-icons/md'
import {
  BiBuildingHouse,
} from 'react-icons/bi'
import {
  IoBriefcase,
  IoWallet,
  IoShield,
  IoMegaphone,
  IoSparkles,
  IoNewspaper,
  IoMedical,
  IoVideocam,
  IoMoon,
} from 'react-icons/io5'
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
      { label: 'Overview', to: '/interior/dashboard', icon: <MdDashboard className="w-5 h-5" />, end: true },
      { label: 'Projects', to: '/interior/projects', icon: <MdWork className="w-5 h-5" /> },
      { label: 'Products', to: '/interior/products', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'AI Designs', to: '/interior/projects', icon: <IoSparkles className="w-5 h-5" /> },
    ]},
    { title: 'Transactions', items: [
      { label: 'Invoices & Billing', to: '/billing', icon: <MdReceipt className="w-5 h-5" /> },
      { label: 'Catalog & Quotation', to: '/billing/items', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Cash & Bank', to: '/billing/cashbank', icon: <MdAccountBalance className="w-5 h-5" /> },
      { label: 'Billing Settings', to: '/billing/settings', icon: <MdSettings className="w-5 h-5" /> },
    ]},
  ],
  warehouse: [
    { title: 'Warehouse Store', items: [
      { label: 'Overview', to: '/warehouse/dashboard', icon: <MdDashboard className="w-5 h-5" />, end: true },
    ]},
    { title: 'Retailers & Vendors', items: [
      { label: 'Retailers', to: '/warehouse/customers', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Vendors', to: '/warehouse/suppliers', icon: <MdLocalShipping className="w-5 h-5" /> },
    ]},
    { title: 'Inventory', items: [
      { label: 'Stock', to: '/warehouse/inventory', icon: <MdInventory className="w-5 h-5" /> },
      { label: 'Products', to: '/warehouse/products', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Warehouses & Locations', to: '/warehouse/warehouses', icon: <MdBuild className="w-5 h-5" /> },
      { label: 'Purchase Orders', to: '/warehouse/purchase-orders', icon: <FiClipboard className="w-5 h-5" /> },
      { label: 'Goods Received', to: '/warehouse/grn', icon: <FiTruck className="w-5 h-5" /> },
      { label: 'Stock Transfer', to: '/warehouse/transfers', icon: <FiArrowRight className="w-5 h-5" /> },
      { label: 'Stock Count', to: '/warehouse/stock-count', icon: <FiCheckSquare className="w-5 h-5" /> },
      { label: 'Scan Barcode / QR', to: '/billing/items', icon: <FiCode className="w-5 h-5" /> },
    ]},
    { title: 'Outbound', items: [
      { label: 'Sales Orders', to: '/warehouse/orders', icon: <FiShoppingCart className="w-5 h-5" /> },
      { label: 'Picking', to: '/warehouse/picking', icon: <FiList className="w-5 h-5" /> },
      { label: 'Packing', to: '/warehouse/packing', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Dispatch', to: '/warehouse/dispatch', icon: <MdLocalShipping className="w-5 h-5" /> },
      { label: 'Returns', to: '/warehouse/returns', icon: <FiRotateCcw className="w-5 h-5" /> },
    ]},
    { title: 'Transactions', items: [
      { label: 'Invoices & Billing', to: '/billing', icon: <MdReceipt className="w-5 h-5" /> },
      { label: 'Catalog & Quotation', to: '/billing/items', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Cash & Bank', to: '/billing/cashbank', icon: <MdAccountBalance className="w-5 h-5" /> },
      { label: 'Billing Settings', to: '/billing/settings', icon: <MdSettings className="w-5 h-5" /> },
    ]},
    { title: 'Staff Management', items: [
      { label: 'Staff & Attendance', to: '/warehouse/staff', icon: <MdAccessTime className="w-5 h-5" /> },
    ]},
    { title: 'Project Management', items: [
      { label: 'Projects', to: '/warehouse/projects', icon: <MdWork className="w-5 h-5" /> },
      { label: 'Site Map', to: '/warehouse/map', icon: <FiMap className="w-5 h-5" /> },
      { label: 'Business Modules', to: '/warehouse/modules', icon: <FiGrid className="w-5 h-5" /> },
    ]},
  ],
school: [
    { title: 'Command Center', items: [
      { label: 'Overview', to: '/school', icon: <MdDashboard className="w-5 h-5" />, end: true },
    ]},
    { title: 'People', items: [
      { label: 'Students', to: '/school/students', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Parents', to: '/school/parents', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Directory', to: '/school/directory', icon: <FiSearch className="w-5 h-5" /> },
      { label: 'Staff & Attendance', to: '/school/staff', icon: <FiClock className="w-5 h-5" /> },
    ]},
    { title: 'Admissions & CRM', items: [
      { label: 'Admissions Pipeline', to: '/school/admissions', icon: <FiUserPlus className="w-5 h-5" /> },
    ]},
    { title: 'Academics', items: [
      { label: 'Classes', to: '/school/classes', icon: <MdLayers className="w-5 h-5" /> },
      { label: 'Sessions', to: '/school/sessions', icon: <MdCalendarToday className="w-5 h-5" /> },
      { label: 'Subjects', to: '/school/subjects', icon: <FiBookOpen className="w-5 h-5" /> },
      { label: 'Timetable', to: '/school/timetable', icon: <FiClock className="w-5 h-5" /> },
      { label: 'Homework', to: '/school/homework', icon: <FiClipboard className="w-5 h-5" /> },
      { label: 'LMS', to: '/school/lms', icon: <FiBookOpen className="w-5 h-5" /> },
    ]},
    { title: 'Attendance', items: [
      { label: 'Student Attendance', to: '/school/attendance', icon: <MdCalendarToday className="w-5 h-5" /> },
      { label: 'Attendance Analytics', to: '/school/attendance-analytics', icon: <MdBarChart className="w-5 h-5" /> },
      { label: 'Leave Requests', to: '/school/leave', icon: <FiCalendar className="w-5 h-5" /> },
    ]},
    { title: 'Examination', items: [
      { label: 'Question Bank', to: '/school/questions', icon: <FiClipboard className="w-5 h-5" /> },
      { label: 'Exams & Marks', to: '/school/exams', icon: <FiClipboard className="w-5 h-5" /> },
      { label: 'Online Exams', to: '/school/online-exams', icon: <MdMonitor className="w-5 h-5" /> },
      { label: 'Results', to: '/school/results', icon: <MdEmojiEvents className="w-5 h-5" /> },
    ]},
    { title: 'Finance', items: [
      { label: 'Fees', to: '/school/fees', icon: <IoWallet className="w-5 h-5" /> },
      { label: 'Fee Structure', to: '/school/fee-structure', icon: <MdDescription className="w-5 h-5" /> },
      { label: 'Receipts', to: '/school/receipts', icon: <MdReceipt className="w-5 h-5" /> },
      { label: 'Expenses', to: '/school/expenses', icon: <FiCreditCard className="w-5 h-5" /> },
      { label: 'Payroll', to: '/school/payroll', icon: <MdAccountBalanceWallet className="w-5 h-5" /> },
    ]},
    { title: 'HR', items: [
      { label: 'Recruitment', to: '/school/recruitment', icon: <FiUserPlus className="w-5 h-5" /> },
      { label: 'Performance', to: '/school/performance', icon: <MdBarChart className="w-5 h-5" /> },
      { label: 'Training', to: '/school/training', icon: <MdSchool className="w-5 h-5" /> },
    ]},
    { title: 'Operations', items: [
      { label: 'Stock', to: '/school/inventory', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Transport', to: '/school/transport', icon: <FiTruck className="w-5 h-5" /> },
      { label: 'Library', to: '/school/library', icon: <FiBookOpen className="w-5 h-5" /> },
      { label: 'Procurement', to: '/school/procurement', icon: <FiShoppingCart className="w-5 h-5" /> },
      { label: 'Assets', to: '/school/assets', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Visitors', to: '/school/visitors', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Hostel', to: '/school/hostel', icon: <BiBuildingHouse className="w-5 h-5" /> },
      { label: 'Cafeteria', to: '/school/cafeteria', icon: <MdRestaurant className="w-5 h-5" /> },
    ]},
{ title: 'Student Life', items: [
      { label: 'Clubs', to: '/school/clubs', icon: <IoSparkles className="w-5 h-5" /> },
      { label: 'Sports', to: '/school/sports', icon: <MdEmojiEvents className="w-5 h-5" /> },
      { label: 'Houses', to: '/school/houses', icon: <MdFlag className="w-5 h-5" /> },
      { label: 'Discipline', to: '/school/discipline', icon: <IoShield className="w-5 h-5" /> },
      { label: 'Counselling', to: '/school/counselling', icon: <MdFavorite className="w-5 h-5" /> },
    ]},
    { title: 'Communication', items: [
      { label: 'Notices', to: '/school/notices', icon: <IoMegaphone className="w-5 h-5" /> },
      { label: 'Events', to: '/school/events', icon: <FiCalendar className="w-5 h-5" /> },
      { label: 'Messaging', to: '/school/messaging', icon: <FiMessageSquare className="w-5 h-5" /> },
      { label: 'Notifications', to: '/school/notifications', icon: <MdNotifications className="w-5 h-5" /> },
      { label: 'PTM', to: '/school/ptm', icon: <MdCalendarToday className="w-5 h-5" /> },
      { label: 'Surveys', to: '/school/surveys', icon: <FiClipboard className="w-5 h-5" /> },
    ]},
    { title: 'Documents', items: [
      { label: 'Documents', to: '/school/documents', icon: <MdDescription className="w-5 h-5" /> },
      { label: 'Certificates', to: '/school/certificates', icon: <MdEmojiEvents className="w-5 h-5" /> },
    ]},
    { title: 'Service', items: [
      { label: 'Helpdesk', to: '/school/helpdesk', icon: <MdHelp className="w-5 h-5" /> },
      { label: 'Grievances', to: '/school/grievances', icon: <MdScale className="w-5 h-5" /> },
      { label: 'Incidents', to: '/school/incidents', icon: <MdWarning className="w-5 h-5" /> },
      { label: 'Tasks', to: '/school/tasks', icon: <FiList className="w-5 h-5" /> },
    ]},
    { title: 'System', items: [
      { label: 'Users & Roles', to: '/school/users', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Audit Log', to: '/school/audit', icon: <IoShield className="w-5 h-5" /> },
      { label: 'Settings', to: '/school/settings', icon: <MdSettings className="w-5 h-5" /> },
    ]},
    { title: 'Projects & Events', items: [
      { label: 'Projects', to: '/school/projects', icon: <IoBriefcase className="w-5 h-5" /> },
    ]},
  ],
hotel: [
    { title: 'Hotel Operations', items: [
      { label: 'Overview', to: '/hotel', icon: <MdDashboard className="w-5 h-5" />, end: true },
      { label: 'Reservations', to: '/hotel/reservations', icon: <MdCalendarToday className="w-5 h-5" /> },
      { label: 'Rooms', to: '/hotel/rooms', icon: <BiBuildingHouse className="w-5 h-5" /> },
      { label: 'Guests', to: '/hotel/guests', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Housekeeping', to: '/hotel/housekeeping', icon: <IoSparkles className="w-5 h-5" /> },
    ]},
  ],
  travel: [
    { title: 'Travel & Tours', items: [
      { label: 'Discover', to: '/travel', icon: <MdDashboard className="w-5 h-5" />, end: true },
      { label: 'Destinations', to: '/travel/destinations', icon: <FiMap className="w-5 h-5" /> },
      { label: 'Holiday Packages', to: '/travel/packages', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Group Trips', to: '/travel/group-trips', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Customize Trip', to: '/travel/customize', icon: <IoSparkles className="w-5 h-5" /> },
      { label: 'My Trips', to: '/travel/my-trips', icon: <MdCalendarToday className="w-5 h-5" /> },
    ]},
  ],
  news: [
    { title: 'VSR News', items: [
      { label: 'Top Stories', to: '/news', icon: <IoNewspaper className="w-5 h-5" />, end: true },
      { label: 'Latest', to: '/news/latest', icon: <FiClock className="w-5 h-5" /> },
      { label: 'Trending', to: '/news/trending', icon: <MdBarChart className="w-5 h-5" /> },
      { label: 'Search', to: '/news/search', icon: <FiSearch className="w-5 h-5" /> },
      { label: 'Saved Stories', to: '/news/bookmarks', icon: <MdBookmarkBorder className="w-5 h-5" /> },
    ]},
    { title: 'News Desks', items: [
      { label: 'India', to: '/news/category/india', icon: <MdFlag className="w-5 h-5" /> },
      { label: 'World', to: '/news/category/world', icon: <FiMap className="w-5 h-5" /> },
      { label: 'Business', to: '/news/category/business', icon: <MdAccountBalanceWallet className="w-5 h-5" /> },
      { label: 'Technology', to: '/news/category/technology', icon: <MdMonitor className="w-5 h-5" /> },
      { label: 'Sports', to: '/news/category/sports', icon: <MdEmojiEvents className="w-5 h-5" /> },
      { label: 'Entertainment', to: '/news/category/entertainment', icon: <IoVideocam className="w-5 h-5" /> },
    ]},
  ],
  jobs: [
    { title: 'VSR Jobs', items: [
      { label: 'Discover Jobs', to: '/jobs', icon: <IoBriefcase className="w-5 h-5" />, end: true },
      { label: 'Search Jobs', to: '/jobs/search', icon: <FiSearch className="w-5 h-5" /> },
      { label: 'Companies', to: '/jobs/companies', icon: <BiBuildingHouse className="w-5 h-5" /> },
      { label: 'Applications', to: '/jobs/applications', icon: <FiClipboard className="w-5 h-5" /> },
      { label: 'Profile', to: '/jobs/profile', icon: <FiUser className="w-5 h-5" /> },
      { label: 'Saved Jobs', to: '/jobs/saved', icon: <MdBookmarkBorder className="w-5 h-5" /> },
    ]},
  ],
  commerce: [
    { title: 'VSR Commerce', items: [
      { label: 'Home', to: '/commerce', icon: <FiShoppingCart className="w-5 h-5" />, end: true },
      { label: 'Categories', to: '/commerce/categories', icon: <FiGrid className="w-5 h-5" /> },
      { label: 'Products', to: '/commerce/products', icon: <FiPackage className="w-5 h-5" /> },
      { label: 'Offers', to: '/commerce/offers', icon: <FiTag className="w-5 h-5" /> },
      { label: 'Brands', to: '/commerce/brands', icon: <MdBuild className="w-5 h-5" /> },
      { label: 'Wishlist', to: '/commerce/wishlist', icon: <FiHeart className="w-5 h-5" /> },
      { label: 'Cart', to: '/commerce/cart', icon: <FiShoppingCart className="w-5 h-5" /> },
    ]},
  ],
  bank: [
    { title: 'VSR Bank', items: [
      { label: 'Dashboard', to: '/bank', icon: <MdBuild className="w-5 h-5" />, end: true },
      { label: 'Accounts', to: '/bank/accounts', icon: <IoWallet className="w-5 h-5" /> },
      { label: 'Transactions', to: '/bank/transactions', icon: <FiArrowRight className="w-5 h-5" /> },
      { label: 'Transfers', to: '/bank/transfers', icon: <MdSend className="w-5 h-5" /> },
      { label: 'Beneficiaries', to: '/bank/beneficiaries', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Cards', to: '/bank/cards', icon: <FiCreditCard className="w-5 h-5" /> },
      { label: 'Deposits', to: '/bank/deposits', icon: <MdSavings className="w-5 h-5" /> },
      { label: 'Loans', to: '/bank/loans', icon: <MdBuild className="w-5 h-5" /> },
      { label: 'Statements', to: '/bank/statements', icon: <MdFileDownload className="w-5 h-5" /> },
      { label: 'Bills', to: '/bank/bills', icon: <MdReceipt className="w-5 h-5" /> },
      { label: 'Notifications', to: '/bank/notifications', icon: <MdNotifications className="w-5 h-5" /> },
      { label: 'Documents', to: '/bank/documents', icon: <MdDescription className="w-5 h-5" /> },
      { label: 'Profile & Security', to: '/bank/profile', icon: <IoShield className="w-5 h-5" /> },
      { label: 'Admin Console', to: '/bank/admin', icon: <MdMonitor className="w-5 h-5" /> },
    ]},
  ],
  medical: [
    { title: 'VSR Health', items: [
      { label: 'Dashboard', to: '/medical', icon: <IoMedical className="w-5 h-5" />, end: true },
      { label: 'Doctors', to: '/medical/doctors', icon: <IoMedical className="w-5 h-5" /> },
      { label: 'Appointments', to: '/medical/appointments', icon: <FiCalendar className="w-5 h-5" /> },
      { label: 'Patients', to: '/medical/patients', icon: <FiUsers className="w-5 h-5" /> },
      { label: 'Prescriptions', to: '/medical/prescriptions', icon: <MdMedication className="w-5 h-5" /> },
      { label: 'Lab Results', to: '/medical/labs', icon: <MdScience className="w-5 h-5" /> },
      { label: 'Billing', to: '/medical/billing', icon: <MdReceipt className="w-5 h-5" /> },
      { label: 'Clinical Records', to: '/medical/records', icon: <FiClipboard className="w-5 h-5" /> },
      { label: 'Notifications', to: '/medical/notifications', icon: <MdNotifications className="w-5 h-5" /> },
      { label: 'Admin Console', to: '/medical/admin', icon: <MdSettings className="w-5 h-5" /> },
    ]},
  ],
}

/** Groups shared across every service — kept to the fixed global feature set only. */
const COMMON_GROUPS: NavGroup[] = [
  { title: 'Assistant', items: [
    { label: 'Chat', to: '/assistant', icon: <FiMessageSquare className="w-5 h-5" /> },
    { label: 'Backup & Sync', to: '/backup', icon: <FiDatabase className="w-5 h-5" /> },
    { label: 'Settings', to: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ]},
  { title: 'Business', items: [
    { label: 'Video Call', to: '/video', icon: <FiVideo className="w-5 h-5" /> },
  ]},
  { title: 'More', items: [
    { label: 'Broadcast', to: '/broadcast', icon: <IoMegaphone className="w-5 h-5" />, badge: 'PRO', premium: true },
    { label: 'Upcoming Feature', to: '/integrations', icon: <FiZap className="w-5 h-5" /> },
    { label: 'Team & Roles', to: '/users', icon: <FiShield className="w-5 h-5" />, adminOnly: true },
  ]},
  { title: 'Account', items: [
    { label: 'Plans & Billing', to: '/plans', icon: <FiCreditCard className="w-5 h-5" /> },
    { label: 'My Profile', to: '/account', icon: <FiUser className="w-5 h-5" /> },
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
        <span className="broadcast-ticker-item"><IoMegaphone className="w-4 h-4" /> {active.message}</span>
        <span className="broadcast-ticker-item"><IoMegaphone className="w-4 h-4" /> {active.message}</span>
        <span className="broadcast-ticker-item"><IoMegaphone className="w-4 h-4" /> {active.message}</span>
        <span className="broadcast-ticker-item"><IoMegaphone className="w-4 h-4" /> {active.message}</span>
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
          <MdMenu className="w-6 h-6" />
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
            <FiSearch className="w-5 h-5" />
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
              : <FiCloud className="w-5 h-5" />}
          </Button>
        </>}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <MdWbSunny className="w-5 h-5" /> : <IoMoon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
          <MdLogout className="w-5 h-5" />
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
                  {isCollapsed ? <MdKeyboardArrowRight className="w-4 h-4" /> : <MdKeyboardArrowDown className="w-4 h-4" />}
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
