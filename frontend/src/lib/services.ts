import { ENABLED_MODULES } from '../app/moduleRegistry'

// Service modules are registry-driven; consumers should not need exhaustive
// updates merely to render navigation or a generic service icon.
export type ServiceId = string

export type ServiceDef = {
  id: ServiceId
  label: string
  tagline: string
  category: 'operations' | 'travel' | 'marketplace' | 'personal'
  icon: string
  gradient: string
  home: string
  shell?: 'portal'
}

export const SERVICES: ServiceDef[] = ENABLED_MODULES.map((module) => ({
  id: module.key,
  label: module.name,
  tagline: module.tagline,
  category: module.category,
  icon: module.icon,
  gradient: module.gradient,
  home: module.entryRoute,
  shell: 'shell' in module ? module.shell : undefined,
}))

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
