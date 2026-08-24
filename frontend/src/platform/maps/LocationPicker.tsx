import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { IoLocate } from 'react-icons/io5'
import { FiSearch, FiMapPin, FiLoader } from 'react-icons/fi'
import { Button } from '../ui'
import { cn } from '../../lib/utils'
import { getTheme } from '../../theme'
import { api, type MapLocation } from '../api'

interface LocationPickerProps {
  latitude?: string
  longitude?: string
  onChange: (lat: string, lng: string, address?: string) => void
  onAddressChange?: (address: string) => void
  purpose?: string
  markerLabel?: string
}

export default function LocationPicker({ latitude, longitude, onChange, onAddressChange, purpose = 'Set the exact location for this site.', markerLabel = 'Site location' }: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MapLocation[]>([])
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState('Search for a place, use GPS, or click the map to set a precise pin.')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const lat = latitude ? Number(latitude) : null
  const lng = longitude ? Number(longitude) : null
  const hasCoords = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const dark = getTheme() === 'dark'
    const map = L.map(containerRef.current, { center: [20.5937, 78.9629], zoom: 5 })
    L.tileLayer(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: mlat, lng: mlng } = e.latlng
      setMarker(mlat.toFixed(6), mlng.toFixed(6))
      onChange(mlat.toFixed(6), mlng.toFixed(6))
      setAccuracy(null)
      setLocationStatus('Pin placed from the map. Resolving the nearest address...')
      void reverseAddress(mlat, mlng)
    })
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (hasCoords && mapRef.current) {
      mapRef.current.setView([lat!, lng!], 15)
      setMarker(lat!.toFixed(6), lng!.toFixed(6))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude])

  function setMarker(mlat: number | string, mlng: number | string) {
    const map = mapRef.current
    if (!map) return
    const point: [number, number] = [Number(mlat), Number(mlng)]
    if (markerRef.current) markerRef.current.setLatLng(point)
    else markerRef.current = L.marker(point).addTo(map)
    markerRef.current.bindPopup(markerLabel).openPopup()
  }

  async function reverseAddress(mlat: number, mlng: number) {
    try {
      const place = await api.maps.reverse(mlat, mlng)
      setQuery(place.label)
      onChange(mlat.toFixed(6), mlng.toFixed(6), place.label)
      onAddressChange?.(place.label)
      setLocationStatus(`Pin set near ${place.label}`)
    } catch {
      setLocationStatus('Pin set. The address service is unavailable, but the coordinates are saved.')
    }
  }

  async function doSearch() {
    if (!query.trim()) return
    setSearching(true)
    setSearchErr('')
    try {
      const r = await api.maps.search(query.trim())
      setResults(r)
      setShowResults(true)
      if (r.length === 0) setLocationStatus('No matching places found. Try an area, landmark, or postal code.')
    } catch (e) {
      setSearchErr(e instanceof Error ? e.message : 'Place search is temporarily unavailable.')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function pick(r: MapLocation) {
    const latitudeValue = String(r.latitude)
    const longitudeValue = String(r.longitude)
    setQuery(r.label)
    setShowResults(false)
    setMarker(latitudeValue, longitudeValue)
    onChange(latitudeValue, longitudeValue, r.label)
    if (onAddressChange) onAddressChange(r.label)
    if (mapRef.current) mapRef.current.setView([r.latitude, r.longitude], 15)
    setAccuracy(null)
    setLocationStatus(`Selected ${r.label}`)
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) { setLocationStatus('GPS location is not supported by this browser.'); return }
    setLocating(true)
    setLocationStatus('Requesting a high-accuracy GPS fix...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mlat = pos.coords.latitude.toFixed(6)
        const mlng = pos.coords.longitude.toFixed(6)
        setMarker(mlat, mlng)
        onChange(mlat, mlng)
        if (mapRef.current) mapRef.current.setView([Number(mlat), Number(mlng)], 15)
        setAccuracy(pos.coords.accuracy)
        setLocationStatus(`GPS pin set with approximately ${Math.round(pos.coords.accuracy)} m accuracy. Resolving address...`)
        void reverseAddress(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      (error) => { setLocating(false); setLocationStatus(error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Search or click the map instead.' : 'GPS could not get a reliable position. Try again outdoors or set the pin manually.') },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-surface2/50 px-3 py-2"><p className="text-xs font-semibold text-text">Map purpose</p><p className="text-xs text-muted mt-0.5">{purpose}</p></div>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
          placeholder="Search place, city, area... e.g. Dadar, Mumbai"
          maxLength={160}
          className="w-full rounded-lg border border-border bg-surface2/60 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={doSearch}
          disabled={searching || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
        >
          {searching ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>

        {showResults && results.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl">
            {results.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => pick(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 flex items-start gap-2"
              >
                <FiMapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="min-w-0">{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {searchErr && <p className="text-xs text-red-500">{searchErr}</p>}
      {showResults && results.length === 0 && !searching && <p className="text-xs text-muted">No places found. Try a different name.</p>}
      <p className="text-[11px] text-muted">
        Search powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Geoapify</a> and OpenStreetMap contributors.
      </p>

      <div ref={containerRef} style={{ height: '240px', zIndex: 0 }} className="w-full rounded-xl overflow-hidden border border-border" />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
          <IoLocate className="w-3.5 h-3.5" /> {locating ? 'Locating...' : 'Use my location'}
        </Button>
        <span className={cn('text-xs', hasCoords ? 'text-emerald-600' : 'text-muted')}>
          {hasCoords ? `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}${accuracy !== null ? ` · GPS ±${Math.round(accuracy)} m` : ''}` : 'No coordinates set'}
        </span>
      </div>
      <p className="text-xs text-muted" role="status" aria-live="polite">{locationStatus}</p>
    </div>
  )
}
