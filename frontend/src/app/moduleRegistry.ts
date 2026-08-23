import type { ComponentType } from 'react'

export type ModuleKey =
  | 'interior'
  | 'warehouse'
  | 'school'
  | 'hotel'
  | 'travel'
  | 'news'
  | 'jobs'
  | 'commerce'
  | 'bank'
  | 'medical'
  | 'home-services'

export type ModuleRegistration = {
  key: ModuleKey
  name: string
  tagline: string
  icon: string
  gradient: string
  baseRoute: string
  entryRoute: string
  navigation: readonly string[]
  permissions: readonly string[]
  lazyRouteLoader: () => Promise<{ default: ComponentType }>
  enabled: boolean
  shell?: 'portal'
}

export const MODULE_REGISTRY = [
  {
    key: 'interior', name: 'VSR Interiors', tagline: 'Spaces, projects, AI designs & estimates', icon: '🏠',
    gradient: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D9 100%)', baseRoute: '/interior', entryRoute: '/interior/dashboard',
    navigation: ['/interior/dashboard', '/interior/projects', '/interior/products'], permissions: [],
    lazyRouteLoader: () => import('../services/interior/routes'), enabled: true,
  },
  {
    key: 'warehouse', name: 'VSR Warehouse', tagline: 'Inventory, suppliers, orders & fulfilment', icon: '📦',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', baseRoute: '/warehouse', entryRoute: '/warehouse/dashboard',
    navigation: ['/warehouse/dashboard', '/warehouse/inventory', '/warehouse/orders'], permissions: [],
    lazyRouteLoader: () => import('../services/warehouse/routes'), enabled: true,
  },
  {
    key: 'school', name: 'VSR School', tagline: 'Students, academics, fees & attendance', icon: '🎓',
    gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', baseRoute: '/school', entryRoute: '/school',
    navigation: ['/school', '/school/students', '/school/attendance', '/school/fees'], permissions: [],
    lazyRouteLoader: () => import('../services/school/routes'), enabled: true,
  },
  {
    key: 'hotel', name: 'VSR Hotels', tagline: 'Reservations, rooms, guests & housekeeping', icon: '', gradient: 'var(--grad)',
    baseRoute: '/hotel', entryRoute: '/hotel', navigation: ['/hotel', '/hotel/reservations', '/hotel/rooms'], permissions: [],
    lazyRouteLoader: () => import('../services/hotel/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'travel', name: 'VSR Travel', tagline: 'Destinations, packages, group trips & custom journeys', icon: '', gradient: 'var(--grad)',
    baseRoute: '/travel', entryRoute: '/travel', navigation: ['/travel', '/travel/destinations', '/travel/packages'], permissions: [],
    lazyRouteLoader: () => import('../services/travel/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'news', name: 'VSR News', tagline: 'Breaking stories, trusted reporting & saved reads', icon: '',
    gradient: 'linear-gradient(135deg, #A62421 0%, #6F1715 100%)', baseRoute: '/news', entryRoute: '/news',
    navigation: ['/news', '/news/latest', '/news/trending'], permissions: [],
    lazyRouteLoader: () => import('../services/news/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'jobs', name: 'VSR Jobs', tagline: 'Search roles, compare employers & save opportunities', icon: '',
    gradient: 'linear-gradient(135deg, #175EAA 0%, #087B70 100%)', baseRoute: '/jobs', entryRoute: '/jobs',
    navigation: ['/jobs', '/jobs/search', '/jobs/applications'], permissions: [],
    lazyRouteLoader: () => import('../services/jobs/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'commerce', name: 'VSR Commerce', tagline: 'Discover, compare & shop quality products', icon: '',
    gradient: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)', baseRoute: '/commerce', entryRoute: '/commerce',
    navigation: ['/commerce', '/commerce/products', '/commerce/cart'], permissions: [],
    lazyRouteLoader: () => import('../services/commerce/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'bank', name: 'VSR Bank', tagline: 'Accounts, transfers, cards & secure banking', icon: '',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0E7490 100%)', baseRoute: '/bank', entryRoute: '/bank',
    navigation: ['/bank', '/bank/accounts', '/bank/transfers'], permissions: [],
    lazyRouteLoader: () => import('../services/bank/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'medical', name: 'VSR Medical', tagline: 'Doctors, appointments, records & prescriptions', icon: '',
    gradient: 'linear-gradient(135deg, #047857 0%, #0E7490 100%)', baseRoute: '/medical', entryRoute: '/medical',
    navigation: ['/medical', '/medical/doctors', '/medical/appointments'], permissions: [],
    lazyRouteLoader: () => import('../services/medical/routes'), enabled: true, shell: 'portal',
  },
  {
    key: 'home-services', name: 'VSR Home Services', tagline: 'Verified pros for repairs, cleaning & home care', icon: '',
    gradient: 'linear-gradient(135deg, #B45309 0%, #DC2626 100%)', baseRoute: '/home-services', entryRoute: '/home-services',
    navigation: ['/home-services', '/home-services/categories', '/home-services/bookings'], permissions: [],
    lazyRouteLoader: () => import('../services/home-services/routes'), enabled: true, shell: 'portal',
  },
] as const satisfies readonly ModuleRegistration[]

export const ENABLED_MODULES = MODULE_REGISTRY.filter((module) => module.enabled)

export const MODULES_BY_KEY = Object.fromEntries(
  MODULE_REGISTRY.map((module) => [module.key, module]),
) as Record<ModuleKey, (typeof MODULE_REGISTRY)[number]>
