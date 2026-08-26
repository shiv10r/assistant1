import RailwayPageState from '../shared/RailwayPageState'
import { railwayPermissions } from '../shared/railwayPermissions'

type RailwayNavigationItem = {
  label: string
  to: string
  iconKey: string
  end?: boolean
  permission?: string
}

type RailwayNavigationGroup = {
  title: string
  items: readonly RailwayNavigationItem[]
}

// Base railway routes that always exist
export const railwayBaseRoutes = [
  { label: 'Network Overview', to: '/railway', iconKey: 'R', end: true },
  { label: 'Routes & Timetable', to: '/railway/routes', iconKey: 'Clock' },
  { label: 'Stations', to: '/railway/stations', iconKey: 'Map' },
  { label: 'Fleet Readiness', to: '/railway/fleet', iconKey: 'Truck' },
]

// Capability route groups - enabled based on feature flags
export const railwayCapabilityRoutes = {
  inspections: [
    { label: 'Inspections', to: '/railway/inspections', iconKey: 'Clipboard', permission: railwayPermissions.INSPECTIONS_READ },
    { label: 'Defects', to: '/railway/defects', iconKey: 'Warning', permission: railwayPermissions.DEFECTS_READ },
  ],
  maintenance: [
    { label: 'Maintenance', to: '/railway/maintenance', iconKey: 'Tools', permission: railwayPermissions.MAINTENANCE_READ },
  ],
  crowd: [
    { label: 'Crowd', to: '/railway/crowd', iconKey: 'People', permission: railwayPermissions.CROWD_READ },
  ],
}

// Export the combined navigation for the module registry
export const railwayNavigation: RailwayNavigationGroup[] = [
  { title: 'Network', items: railwayBaseRoutes },
  { title: 'Inspections', items: railwayCapabilityRoutes.inspections, permission: railwayPermissions.INSPECTIONS_READ },
  { title: 'Maintenance', items: railwayCapabilityRoutes.maintenance, permission: railwayPermissions.MAINTENANCE_READ },
  { title: 'Crowd Operations', items: railwayCapabilityRoutes.crowd, permission: railwayPermissions.CROWD_READ },
]