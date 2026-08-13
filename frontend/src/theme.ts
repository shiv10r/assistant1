export type Theme = 'dark' | 'light'
export type WeatherTheme = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'night' | 'default'

const KEY = 'lux_theme'
const WEATHER_MODE_KEY = 'lux_weather_mode'
const WEATHER_KEY = 'lux_weather_theme'

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
