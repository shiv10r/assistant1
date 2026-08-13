import { useWeather } from '../hooks/useWeather'
import { conditionMeta, weatherBlurb } from '../lib/weather'
import { cn } from '../lib/utils'
import { Loader2 } from 'lucide-react'

interface WeatherCardProps {
  latitude?: number
  longitude?: number
  siteName?: string
  className?: string
}

export default function WeatherCard({ latitude, longitude, siteName, className }: WeatherCardProps) {
  const hasCoords = latitude != null && longitude != null
  const w = useWeather(hasCoords ? latitude : undefined, hasCoords ? longitude : undefined)
  const meta = w.weather ? conditionMeta(w.weather.weatherCode, w.weather.isDay) : null
  const updatedAgo = w.weather
    ? Math.max(1, Math.round((Date.now() - new Date(w.weather.updatedAt).getTime()) / 60000))
    : 0

  return (
    <div className={cn('rounded-xl border border-border bg-surface p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-text">{siteName ? `🌤️ ${siteName} — Site Weather` : '🌤️ Site Weather'}</div>
        {w.weather && <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted hover:text-primary" title="Weather data by Open-Meteo">Open-Meteo</a>}
      </div>

      {!hasCoords ? (
        <p className="text-sm text-muted">Set the project location to see its weather.</p>
      ) : w.loading ? (
        <div className="flex items-center gap-2 text-sm text-muted py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading weather…
        </div>
      ) : w.error ? (
        <p className="text-sm text-red-500">{w.error}</p>
      ) : w.weather && meta ? (
        <>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl leading-none">{meta.icon}</span>
            <div>
              <div className="text-3xl font-bold text-text leading-none">{Math.round(w.weather.temperature)}°C</div>
              <div className="text-sm text-muted mt-1">{meta.label} · feels like {Math.round(w.weather.feelsLike)}°C</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted"><span>💧</span> Humidity <b className="ml-auto text-text">{w.weather.humidity}%</b></div>
            <div className="flex items-center gap-2 text-muted"><span>💨</span> Wind <b className="ml-auto text-text">{Math.round(w.weather.windSpeed)} km/h</b></div>
            <div className="flex items-center gap-2 text-muted"><span>🌧️</span> Rain chance <b className="ml-auto text-text">{Math.round(w.weather.rainProbability)}%</b></div>
            <div className="flex items-center gap-2 text-muted"><span>☔</span> Precip <b className="ml-auto text-text">{w.weather.precipitation} mm</b></div>
          </div>

          <p className="mt-3 text-xs rounded-lg bg-primary/10 text-primary px-3 py-2">{weatherBlurb(w.weather)}</p>

          <p className="mt-3 text-[11px] text-muted">Updated {updatedAgo} min ago</p>
        </>
      ) : (
        <p className="text-sm text-muted">Weather unavailable.</p>
      )}
    </div>
  )
}
