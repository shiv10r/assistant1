import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { ProjectWeather } from '../api'
import { applyWeatherTheme, isWeatherMode } from '../theme'
import { resolveWeatherTheme } from '../lib/weather'

export interface WeatherState {
  loading: boolean
  weather: ProjectWeather | null
  error: string | null
  mode: boolean
}

/**
 * Fetches weather for a site (or the user's location when no coords given) and,
 * when weather app mode is on, applies the matching theme. Shared by the topbar
 * toggle and weather cards so the theme follows the selected site weather.
 */
export function useWeather(lat?: number, lng?: number) {
  const [state, setState] = useState<WeatherState>({ loading: false, weather: null, error: null, mode: isWeatherMode() })

  const refresh = useCallback(async (l: number, lo: number) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const r = await api.integrations.weather(l, lo)
      if (r.ok && r.weather) {
        setState((s) => ({ ...s, loading: false, weather: r.weather! }))
        if (isWeatherMode()) applyWeatherTheme(resolveWeatherTheme(r.weather!))
      } else {        setState((s) => ({ ...s, loading: false, weather: null, error: r.message ?? 'Weather unavailable' }))
      }
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }))
    }
  }, [])

  const enable = useCallback(async () => {
    if (lat != null && lng != null) {
      await refresh(lat, lng)
      return
    }
    if (!navigator.geolocation) {
      await refresh(20.5937, 78.9629)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { void refresh(pos.coords.latitude, pos.coords.longitude) },
      () => { void refresh(20.5937, 78.9629) },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }, [lat, lng, refresh])

  useEffect(() => {
    if (isWeatherMode()) void enable()
    else if (lat != null && lng != null) void refresh(lat, lng)
  }, [enable, lat, lng, refresh])

  const setMode = useCallback((on: boolean) => {
    setState((s) => ({ ...s, mode: on }))
  }, [])

  return { ...state, refresh, enable, setMode }
}
