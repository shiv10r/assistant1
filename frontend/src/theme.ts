export type Theme = 'dark' | 'light'
export type WeatherTheme = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'night' | 'default'
export type AccentId = 'cobalt' | 'violet' | 'teal' | 'rose' | 'amber' | 'ink' | 'paper'

export const ACCENT_OPTIONS: readonly { id: AccentId; label: string; color: string }[] = [
  { id: 'cobalt', label: 'Cobalt', color: '#2563EB' },
  { id: 'violet', label: 'Violet', color: '#7C3AED' },
  { id: 'teal', label: 'Teal', color: '#0F8F83' },
  { id: 'rose', label: 'Rose', color: '#D94F70' },
  { id: 'amber', label: 'Amber', color: '#D97706' },
  { id: 'ink', label: 'Ink', color: '#111827' },
  { id: 'paper', label: 'Paper', color: '#F8FAFC' },
]

const KEY = 'lux_theme'
const WEATHER_MODE_KEY = 'lux_weather_mode'
const WEATHER_KEY = 'lux_weather_theme'
const ACCENT_KEY = 'lux_ui_accent'

export function getTheme(): Theme {
  return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  localStorage.setItem(KEY, t)
}

export function initTheme(): Theme {
  const t = getTheme()
  document.documentElement.dataset.theme = t
  return t
}

/** Weather app mode: when on, the app theme follows the current site weather. */
export function isWeatherMode(): boolean {
  return localStorage.getItem(WEATHER_MODE_KEY) === '1'
}

export function setWeatherMode(on: boolean) {
  localStorage.setItem(WEATHER_MODE_KEY, on ? '1' : '0')
  if (!on) applyWeatherTheme('default')
}

export function applyWeatherTheme(t: WeatherTheme) {
  document.documentElement.dataset.weather = t
  localStorage.setItem(WEATHER_KEY, t)
}

export function initWeatherTheme(): WeatherTheme {
  const t = (localStorage.getItem(WEATHER_KEY) as WeatherTheme) || 'default'
  document.documentElement.dataset.weather = t
  return t
}

export function getAccent(): AccentId {
  const stored = localStorage.getItem(ACCENT_KEY)
  return ACCENT_OPTIONS.some((option) => option.id === stored) ? stored as AccentId : 'cobalt'
}

export function applyAccent(accent: AccentId) {
  document.documentElement.dataset.accent = accent
  localStorage.setItem(ACCENT_KEY, accent)
}

export function initAccent(): AccentId {
  const accent = getAccent()
  document.documentElement.dataset.accent = accent
  return accent
}
