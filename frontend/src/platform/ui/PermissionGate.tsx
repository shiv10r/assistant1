import type { ReactNode } from 'react'
import { getRole } from '../auth/session'

export function PermissionGate({
  allowedRoles,
  children,
  fallback,
}: {
  allowedRoles: string[]
  children: ReactNode
  fallback?: ReactNode
}) {
  return allowedRoles.includes(getRole()) ? children : fallback ?? null
}
