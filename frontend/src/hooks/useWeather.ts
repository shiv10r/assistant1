import { useCallback, useEffect, useRef, useState } from 'react'
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

const WEATHER_CACHE_MS = 5 * 60 * 1000
const weatherCache = new Map<string, { weather: ProjectWeather; fetchedAt: number }>()
const weatherRequests = new Map<string, Promise<ProjectWeather>>()
let locationRequest: Promise<GeolocationPosition> | null = null

function coordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`
}

function currentPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) return Promise.reject(new Error('Location is not supported by this browser.'))
  if (!locationRequest) {
    locationRequest = new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 })
    }).finally(() => { locationRequest = null })
  }
  return locationRequest
}

async function requestWeather(latitude: number, longitude: number, force = false) {
  const key = coordinateKey(latitude, longitude)
  const cached = weatherCache.get(key)
  if (!force && cached && Date.now() - cached.fetchedAt < WEATHER_CACHE_MS) return cached.weather
  const pending = weatherRequests.get(key)
  if (pending) return pending
  const request = api.weather(latitude, longitude).then((response) => {
    if (!response.ok || !response.weather) throw new Error(response.message || 'Weather data is temporarily unavailable.')
    weatherCache.set(key, { weather: response.weather, fetchedAt: Date.now() })
    return response.weather
  }).finally(() => weatherRequests.delete(key))
  weatherRequests.set(key, request)
  return request
}

/**
 * Fetches weather for a site (or the user's location when no coords given) and,
 * when weather app mode is on, applies the matching theme. Shared by the topbar
 * toggle and weather cards so the theme follows the selected site weather.
 */
export function useWeather(lat?: number, lng?: number) {
  const [state, setState] = useState<WeatherState>({ loading: false, weather: null, error: null, mode: isWeatherMode() })
  const requestId = useRef(0)

  const refresh = useCallback(async (l: number, lo: number, force = false) => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const weather = await requestWeather(l, lo, force)
      if (id !== requestId.current) return
      setState((s) => ({ ...s, loading: false, weather, error: null }))
      if (isWeatherMode()) applyWeatherTheme(resolveWeatherTheme(weather))
    } catch (e) {
      if (id !== requestId.current) return
      setState((s) => ({ ...s, loading: false, weather: null, error: e instanceof Error ? e.message : 'Weather data is temporarily unavailable.' }))
    }
  }, [])

  const enable = useCallback(async () => {
    if (lat != null && lng != null) {
      await refresh(lat, lng)
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const position = await currentPosition()
      await refresh(position.coords.latitude, position.coords.longitude)
    } catch (error) {
      const geolocationError = typeof error === 'object' && error !== null && 'code' in error
      setState((s) => ({ ...s, loading: false, weather: null, error: geolocationError
        ? 'Location access is unavailable. Allow location access to view local weather.'
        : error instanceof Error ? error.message : 'Location is unavailable.' }))
    }
  }, [lat, lng, refresh])

  useEffect(() => {
    if (isWeatherMode()) void enable()
    else if (lat != null && lng != null) void refresh(lat, lng)
  }, [enable, lat, lng, refresh])

  useEffect(() => () => { requestId.current += 1 }, [])

  const setMode = useCallback((on: boolean) => {
    setState((s) => ({ ...s, mode: on }))
  }, [])

  return { ...state, refresh, enable, setMode }
}
