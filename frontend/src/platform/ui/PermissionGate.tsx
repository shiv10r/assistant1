import { useEffect, useState } from 'react'
import { getRole } from '../auth/session'

export function PermissionGate({
  allowedRoles,
  children,
  fallback,
}: {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(getRole())
  }, [])

  if (!role) {
    return fallback ?? null
  }

  const hasAccess = allowedRoles.includes(role)

  return hasAccess ? children : fallback ?? null
}