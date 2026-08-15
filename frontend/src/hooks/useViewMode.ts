import { useCallback, useState } from 'react'

export type ViewMode = 'simple' | 'advanced'

export const VIEW_MODE_KEY = 'lux_view_mode'

export function useViewMode() {
  const [mode, setModeState] = useState<ViewMode>(() => {
    try {
      return localStorage.getItem(VIEW_MODE_KEY) === 'advanced' ? 'advanced' : 'simple'
    } catch {
      return 'simple'
    }
  })

  const setMode = useCallback((m: ViewMode) => {
    setModeState(m)
    try {
      localStorage.setItem(VIEW_MODE_KEY, m)
    } catch {
      /* ignore */
    }
  }, [])

  return { mode, isAdvanced: mode === 'advanced', setMode }
}