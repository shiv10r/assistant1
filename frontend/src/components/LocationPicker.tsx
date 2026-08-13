import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, MapPin, LocateFixed, Loader2 } from 'lucide-react'
import { Button } from './ui'
import { cn } from '../lib/utils'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface LocationPickerProps {
  latitude?: string
  longitude?: string
  onChange: (lat: string, lng: string, address?: string) => void
  onAddressChange?: (address: string) => void
}

let lastSearchTs = 0

async function geocode(query: string): Promise<NominatimResult[]> {
  const now = Date.now()
  const wait = Math.max(0, 1000 - (now - lastSearchTs))
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastSearchTs = Date.now()
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export default function LocationPicker({ latitude, longitude, onChange, onAddressChange }: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [locating, setLocating] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const lat = latitude ? Number(latitude) : null
  const lng = longitude ? Number(longitude) : null
  const hasCoords = lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { center: [20.5937, 78.9629], zoom: 5 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: mlat, lng: mlng } = e.latlng
      setMarker(mlat.toFixed(6), mlng.toFixed(6))
      onChange(mlat.toFixed(6), mlng.toFixed(6))
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
    markerRef.current.bindPopup('Project location').openPopup()
  }

  async function doSearch() {
    if (!query.trim()) return
    setSearching(true)
    setSearchErr('')
    try {
      const r = await geocode(query.trim())
      setResults(r)
      setShowResults(true)
    } catch (e) {
      setSearchErr(String(e instanceof Error ? e.message : e))
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function pick(r: NominatimResult) {
    setQuery(r.display_name)
    setShowResults(false)
    setMarker(r.lat, r.lon)
    onChange(r.lat, r.lon, r.display_name)
    if (onAddressChange) onAddressChange(r.display_name)
    if (mapRef.current) mapRef.current.setView([Number(r.lat), Number(r.lon)], 15)
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mlat = pos.coords.latitude.toFixed(6)
        const mlng = pos.coords.longitude.toFixed(6)
        setMarker(mlat, mlng)
        onChange(mlat, mlng)
        if (mapRef.current) mapRef.current.setView([Number(mlat), Number(mlng)], 15)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
          placeholder="Search place, city, area… e.g. Dadar, Mumbai"
          className="w-full rounded-lg border border-border bg-surface2/60 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={doSearch}
          disabled={searching || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>

        {showResults && results.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl">
            {results.map((r) => (
              <button
                type="button"
                key={r.place_id}
                onClick={() => pick(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="min-w-0">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {searchErr && <p className="text-xs text-red-500">{searchErr}</p>}
      {showResults && results.length === 0 && !searching && <p className="text-xs text-muted">No places found. Try a different name.</p>}

      <div ref={containerRef} style={{ height: '240px', zIndex: 0 }} className="w-full rounded-xl overflow-hidden border border-border" />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
          <LocateFixed className="w-3.5 h-3.5" /> {locating ? 'Locating…' : 'Use my location'}
        </Button>
        <span className={cn('text-xs', hasCoords ? 'text-emerald-600' : 'text-muted')}>
          {hasCoords ? `📍 ${lat}, ${lng}` : 'No coordinates set — search or click the map'}
        </span>
      </div>
    </div>
  )
}
