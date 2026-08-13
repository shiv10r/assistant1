import type { ProjectWeather } from '../api'
import type { WeatherTheme } from '../theme'

/** Maps an Open-Meteo weather code to a LuxInfra condition label + icon. */
export function conditionMeta(code: number, isDay: boolean): { label: string; icon: string } {
  if (code === 0) return { label: isDay ? 'Clear' : 'Clear Night', icon: isDay ? '☀️' : '🌙' }
  if (code === 1) return { label: 'Mainly Clear', icon: isDay ? '🌤️' : '🌙' }
  if (code === 2) return { label: 'Partly Cloudy', icon: '⛅' }
  if (code === 3) return { label: 'Overcast', icon: '☁️' }
  if (code >= 45 && code <= 48) return { label: 'Fog', icon: '🌫️' }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: '🌦️' }
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: '🌧️' }
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: '❄️' }
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: '🌦️' }
  if (code >= 85 && code <= 86) return { label: 'Snow Showers', icon: '🌨️' }
  if (code >= 95) return { label: 'Thunderstorm', icon: '⛈️' }
  return { label: 'Unknown', icon: '🌡️' }
}

/** Resolves a weather payload to a subtle LuxInfra weather theme. */
export function resolveWeatherTheme(w: ProjectWeather): WeatherTheme {
  if (!w.isDay) return 'night'
  const c = w.weatherCode
  if (c >= 95) return 'storm'
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82) || (c >= 51 && c <= 57)) return 'rain'
  if (c >= 71 && c <= 77) return 'snow'
  if (c >= 0 && c <= 1) return 'sunny'
  if (c >= 2 && c <= 3) return 'cloudy'
  return 'default'
}

/** Human description used in the weather banner. */
export function weatherBlurb(w: ProjectWeather): string {
  if (w.rainProbability >= 60) return 'Rain likely — outdoor site work may be affected.'
  if (w.rainProbability >= 30) return 'Chance of rain — keep an eye on site conditions.'
  if (w.weatherCode >= 95) return 'Thunderstorm in the area — take extra site precautions.'
  if (!w.isDay) return 'Night conditions at the site.'
  if (w.temperature >= 35) return 'Hot at the site — hydrate the crew.'
  return 'Conditions look fine for site work.'
}
