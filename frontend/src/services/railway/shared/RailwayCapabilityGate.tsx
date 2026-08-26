import { useEffect, useState, type ReactNode } from 'react'
import { railwayRequest } from '../api/railwayApi'
import type { RailwayCapabilities } from '../api/railwayApi.types'

type Capability = 'railwayEnabled' | 'inspectionEnabled' | 'maintenanceEnabled' | 'crowdEnabled'

export default function RailwayCapabilityGate({
  capability,
  permission,
  children,
}: {
  capability: Capability
  permission?: string
  children: ReactNode
}) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; capabilities: RailwayCapabilities }
  >({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    railwayRequest<RailwayCapabilities>('/api/railway/capabilities', { signal: controller.signal })
      .then(({ data, error }) => {
        if (error || !data) {
          setState({ status: 'error', message: error?.message ?? 'Railway capabilities are unavailable.' })
          return
        }
        setState({ status: 'ready', capabilities: data })
      })
    return () => controller.abort()
  }, [])

  if (state.status === 'loading') return <div role="status">Loading Railway capabilities...</div>
  if (state.status === 'error') return <div role="alert">{state.message}</div>
  if (!state.capabilities.railwayEnabled || !state.capabilities[capability]) {
    return <div role="status">This Railway capability is not enabled for your organization.</div>
  }
  if (permission && !state.capabilities.permissions.includes(permission)) {
    return <div role="alert">You do not have permission to access this Railway capability.</div>
  }
  return <>{children}</>
}
