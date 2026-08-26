import type { ReactNode } from 'react'

type RailwayPageStateProps = {
  railwayEnabled: boolean
  onEnable?: () => void
  children?: ReactNode
  fallback?: ReactNode
}

export function RailwayPageState({
  railwayEnabled,
  onEnable,
  children,
  fallback,
}: RailwayPageStateProps) {
  if (!railwayEnabled) {
    return (
      fallback ?? (
        <div>
          <h2>Railway Not Enabled</h2>
          <p>This railway module is not enabled for your organization.</p>
          {onEnable && <button onClick={onEnable}>Enable Railway</button>}
        </div>
      )
    )
  }

  return <>{children}</>
}

export default RailwayPageState
