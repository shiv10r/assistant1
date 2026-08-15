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
      `Site Weather — ${siteName ?? 'VSR Systems Project'}`,
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
    <div className={cn('weather-card rounded-2xl border border-border bg-surface overflow-hidden', className)}>
      {!hasCoords && !useMyLocation ? (
        <div className="p-6 text-sm text-muted flex items-center gap-4">
          <MapPin className="w-8 h-8 text-muted flex-shrink-0" />
          <div>
            <p className="mb-2 text-sm">Weather is unavailable because this project has no location set.</p>
            {onSetLocation && (
              <Button size="sm" onClick={onSetLocation}>
                <MapPin className="w-4 h-4" /> Set project location
              </Button>
            )}
          </div>
        </div>
      ) : w.loading ? (
        <div className="flex items-center gap-2 text-sm text-muted p-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading weather…
        </div>
      ) : w.error ? (
        <p className="text-sm text-red-500 p-6">{w.error}</p>
      ) : w.weather && meta ? (
        <>
          {/* Animated hero band — wide, not square */}
          <div className="weather-hero relative flex items-center gap-5 px-6 py-7 text-white overflow-hidden">
            <div className="weather-sheen absolute inset-0 pointer-events-none" aria-hidden />
            {/* floating condition icon */}
            <div className="weather-float text-6xl sm:text-7xl leading-none flex-shrink-0 relative" aria-hidden>{meta.icon}</div>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold drop-shadow-sm">
                  {siteName ? `${siteName} — Site Weather` : 'Site Weather'}
                </div>
                <div className="flex items-center gap-2">
                  {w.weather && (
                    <Button size="sm" variant="ghost" onClick={download} title="Download weather report" className="!p-1.5 !h-8 !w-8 text-white/90 hover:text-white hover:bg-white/15">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {w.weather && (
                    <Button size="sm" variant="ghost" onClick={() => (useMyLocation ? w.enable() : w.refresh(hasCoords ? latitude! : 20.5937, hasCoords ? longitude! : 78.9629))} title="Refresh weather" className="!p-1.5 !h-8 !w-8 text-white/90 hover:text-white hover:bg-white/15">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2 mt-2">
                <div className="text-5xl sm:text-6xl font-extrabold leading-none drop-shadow-sm">{Math.round(w.weather.temperature)}°C</div>
                <div>
                  <div className="text-sm font-medium">{meta.label}</div>
                  <div className="text-xs text-white/80">feels like {Math.round(w.weather.feelsLike)}°C · {w.weather.isDay ? 'Daytime' : 'Night'}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/90 inline-block rounded-lg bg-white/15 backdrop-blur px-3 py-1.5">{weatherBlurb(w.weather)}</p>
            </div>
          </div>

          {/* Stats + forecast */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted"><span>💧</span> Humidity <b className="ml-auto text-text">{w.weather.humidity}%</b></div>
              <div className="flex items-center gap-2 text-muted"><span>💨</span> Wind <b className="ml-auto text-text">{Math.round(w.weather.windSpeed)} km/h</b></div>
              <div className="flex items-center gap-2 text-muted"><span>🌧️</span> Rain chance <b className="ml-auto text-text">{Math.round(w.weather.rainProbability)}%</b></div>
              <div className="flex items-center gap-2 text-muted"><span>☔</span> Precip <b className="ml-auto text-text">{w.weather.precipitation} mm</b></div>
            </div>

            {(w.weather.forecast ?? []).length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="text-[11px] uppercase tracking-wide text-muted mb-3">5-day forecast</div>
                <div className="grid grid-cols-5 gap-2">
                  {(w.weather.forecast ?? []).slice(0, 5).map((f, i) => {
                    const fm = conditionMeta(f.weatherCode, true)
                    return (
                      <div key={f.date} className={cn('rounded-xl px-2 py-3 text-center', i === 0 && 'bg-primary/10')}>
                        <div className="text-[11px] text-muted">{i === 0 ? 'Today' : WEEKDAYS[new Date(f.date + 'T00:00:00').getDay()]}</div>
                        <div className="text-xl leading-none my-2">{fm.icon}</div>
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
          </div>
        </>
      ) : (
        <p className="text-sm text-muted p-6">Weather unavailable.</p>
      )}
    </div>
  )
}
