import { useEffect } from 'react'
import { useWeather } from '../hooks/useWeather'
import { conditionMeta, weatherBlurb } from '../lib/weather'
import { cn } from '../lib/utils'
import { Button } from './ui'
import { Loader2, MapPin, Download, RefreshCw } from 'lucide-react'

interface WeatherCardProps {
  latitude?: number
  longitude?: number
  siteName?: string
  className?: string
  onSetLocation?: () => void
  useMyLocation?: boolean
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WeatherCard({ latitude, longitude, siteName, className, onSetLocation, useMyLocation }: WeatherCardProps) {
  const hasCoords = latitude != null && longitude != null && latitude !== 0 && longitude !== 0
  const w = useWeather(useMyLocation ? undefined : (hasCoords ? latitude : undefined), useMyLocation ? undefined : (hasCoords ? longitude : undefined))

  useEffect(() => {
    if (useMyLocation) { w.enable() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const meta = w.weather ? conditionMeta(w.weather.weatherCode, w.weather.isDay) : null
  const updatedAgo = w.weather
    ? Math.max(1, Math.round((Date.now() - new Date(w.weather.updatedAt).getTime()) / 60000))
    : 0

  function download() {
    if (!w.weather) return
    const lines = [
      `Site Weather — ${siteName ?? 'LuxInfra Project'}`,
      `Condition: ${w.weather.condition}`,
      `Temperature: ${Math.round(w.weather.temperature)}°C (feels like ${Math.round(w.weather.feelsLike)}°C)`,
      `Humidity: ${w.weather.humidity}%`,
      `Wind: ${Math.round(w.weather.windSpeed)} km/h`,
      `Rain chance: ${Math.round(w.weather.rainProbability)}%`,
      `Precipitation: ${w.weather.precipitation} mm`,
      `Updated: ${new Date(w.weather.updatedAt).toLocaleString()}`,
      ``,
      `5-Day Forecast`,
      `Day | Hi | Lo | Rain`,
      ...(w.weather.forecast ?? []).map(
        (f) => `${f.date} | ${Math.round(f.tempMax)}°C | ${Math.round(f.tempMin)}°C | ${Math.round(f.rainProbability)}%`
      ),
      ``,
      `Data by Open-Meteo (https://open-meteo.com) — free & open source.`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `weather-${(siteName ?? 'site').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'site'}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className={cn('rounded-xl border border-border bg-surface p-4', className)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-semibold text-text">🌤️ {siteName ? `${siteName} — Site Weather` : 'Site Weather'}</div>
        <div className="flex items-center gap-2">
          {w.weather && (
            <Button size="sm" variant="ghost" onClick={download} title="Download weather report" className="!p-1.5 !h-8 !w-8">
              <Download className="w-4 h-4" />
            </Button>
          )}
          {w.weather && (
            <Button size="sm" variant="ghost" onClick={() => (useMyLocation ? w.enable() : w.refresh(hasCoords ? latitude! : 20.5937, hasCoords ? longitude! : 78.9629))} title="Refresh weather" className="!p-1.5 !h-8 !w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-muted hover:text-primary whitespace-nowrap" title="Weather data by Open-Meteo — free & open source">
            Free data · Open-Meteo
          </a>
        </div>
      </div>

      {!hasCoords && !useMyLocation ? (
        <div className="text-sm text-muted">
          <p className="mb-3">Weather is unavailable because this project has no location set.</p>
          {onSetLocation && (
            <Button size="sm" onClick={onSetLocation}>
              <MapPin className="w-4 h-4" /> Set project location
            </Button>
          )}
        </div>
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

          {(w.weather.forecast ?? []).length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <div className="text-[11px] uppercase tracking-wide text-muted mb-2">5-day forecast</div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {(w.weather.forecast ?? []).slice(0, 5).map((f, i) => {
                  const fm = conditionMeta(f.weatherCode, true)
                  return (
                    <div key={f.date} className={cn('rounded-lg px-1 py-2', i === 0 && 'bg-primary/10')}>
                      <div className="text-[11px] text-muted">{i === 0 ? 'Today' : WEEKDAYS[new Date(f.date + 'T00:00:00').getDay()]}</div>
                      <div className="text-base leading-none my-1">{fm.icon}</div>
                      <div className="text-xs font-semibold text-text">{Math.round(f.tempMax)}°<span className="text-muted font-normal">/{Math.round(f.tempMin)}°</span></div>
                      <div className="text-[10px] text-muted">🌧 {Math.round(f.rainProbability)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted">Updated {updatedAgo} min ago</p>
            <p className="text-[11px] text-muted">Data by <a className="text-primary hover:underline" href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · free &amp; open source</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">Weather unavailable.</p>
      )}
    </div>
  )
}
