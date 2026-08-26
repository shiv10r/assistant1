import React from 'react'
import { railwayPermissions } from './railwayPermissions'

type RailwayPageStateProps = {
  railwayEnabled: boolean
  onEnable?: () => void
  children?: React.ReactNode
  fallback?: React.ReactNode
}

type RailwayPageStateState = {
  enabled: boolean
  loading: boolean
}

export function RailwayPageState({
  railwayEnabled,
  onEnable,
  children,
  fallback,
}: RailwayPageStateProps) {
  if (!railwayEnabled) {
    return fallback || (
      <div>
        <h2>Railway Not Enabled</h2>
        <p>This railway module is not enabled for your organization.</p>
        {onEnable && <button onClick={onEnable}>Enable Railway</button>}
      </div>
    )
  }

  return children || fallback
}