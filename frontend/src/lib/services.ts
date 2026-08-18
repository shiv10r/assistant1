export type ServiceId = 'interior' | 'warehouse' | 'school' | 'hotel' | 'travel' | 'news' | 'jobs' | 'commerce' | 'bank' | 'medical' | 'home-services'

export type ServiceDef = {
  id: ServiceId
  label: string
  tagline: string
  icon: string
  gradient: string
  home: string
  shell?: 'portal'
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'interior',
    label: 'VSR Interiors',
    tagline: 'Spaces, projects, AI designs & estimates',
    icon: '🏠',
    gradient: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D9 100%)',
    home: '/interior/dashboard',
  },
  {
    id: 'warehouse',
    label: 'VSR Warehouse',
    tagline: 'Inventory, suppliers, orders & fulfilment',
    icon: '📦',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    home: '/warehouse/dashboard',
  },
  {
    id: 'school',
    label: 'VSR School',
    tagline: 'Students, academics, fees & attendance',
    icon: '🎓',
    gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
    home: '/school',
  },
  {
    id: 'hotel',
    label: 'VSR Hotels',
    tagline: 'Reservations, rooms, guests & housekeeping',
    icon: '',
    gradient: 'var(--grad)',
    home: '/hotel',
  },
  {
    id: 'travel',
    label: 'VSR Travel',
    tagline: 'Destinations, packages, group trips & custom journeys',
    icon: '',
    gradient: 'var(--grad)',
    home: '/travel',
    shell: 'portal',
  },
  {
    id: 'news',
    label: 'VSR News',
    tagline: 'Breaking stories, trusted reporting & saved reads',
    icon: '',
    gradient: 'linear-gradient(135deg, #A62421 0%, #6F1715 100%)',
    home: '/news',
    shell: 'portal',
  },
  {
    id: 'jobs',
    label: 'VSR Jobs',
    tagline: 'Search roles, compare employers & save opportunities',
    icon: '',
    gradient: 'linear-gradient(135deg, #175EAA 0%, #087B70 100%)',
    home: '/jobs',
    shell: 'portal',
  },
  {
    id: 'commerce',
    label: 'VSR Commerce',
    tagline: 'Discover, compare & shop quality products',
    icon: '',
    gradient: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)',
    home: '/commerce',
    shell: 'portal',
  },
  {
    id: 'bank',
    label: 'VSR Bank',
    tagline: 'Accounts, transfers, cards & secure banking',
    icon: '',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0E7490 100%)',
    home: '/bank',
    shell: 'portal',
  },
  {
    id: 'medical',
    label: 'VSR Medical',
    tagline: 'Doctors, appointments, records & prescriptions',
    icon: '',
    gradient: 'linear-gradient(135deg, #047857 0%, #0E7490 100%)',
    home: '/medical',
    shell: 'portal',
  },
  {
    id: 'home-services',
    label: 'VSR Home Services',
    tagline: 'Verified pros for repairs, cleaning & home care',
    icon: '',
    gradient: 'linear-gradient(135deg, #B45309 0%, #DC2626 100%)',
    home: '/home-services',
    shell: 'portal',
  },
]

const LAST_SERVICE_KEY = 'lux_last_service'

export function serviceById(id: string | undefined): ServiceDef | null {
  if (!id) return null
  return SERVICES.find((s) => s.id === id) ?? null
}

/** Persist the last-picked service so the chooser can offer "go straight there". */
export function getLastService(): ServiceDef | null {
  const id = localStorage.getItem(LAST_SERVICE_KEY)
  return id ? serviceById(id) : null
}

export function setLastService(id: ServiceId | null) {
  if (id) localStorage.setItem(LAST_SERVICE_KEY, id)
  else localStorage.removeItem(LAST_SERVICE_KEY)
}

/** Derive the active service from the current path, or null when on a common page. */
export function serviceFromPath(pathname: string): ServiceDef | null {
  const match = pathname.split('/').filter(Boolean)[0]
  return serviceById(match)
}
