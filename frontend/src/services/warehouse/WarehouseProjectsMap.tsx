import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Badge, Empty, money, Button, Modal } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import LocationPicker from '../../components/LocationPicker'
import { useLocalCollection } from '../../lib/localStore'
import type { ProjectRecord } from './types'
import { PROJECT_SEED } from './seed'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, DonutChart } from '../../components/AdvancedPanel'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, LocateFixed, Search, Route, Crosshair, Radio, Sparkles, Car, ExternalLink } from 'lucide-react'
import { getTheme } from '../../theme'

type Place = { label: string; lat: number; lng: number }
type Tagged = { p: ProjectRecord; lat: number; lng: number; approx: boolean }

function PlaceSearch({ placeholder, onPick }: { placeholder: string; onPick: (p: Place) => void }) {
  const [q, setQ] = useState('')
  const [sugg, setSugg] = useState<Place[]>([])
  const timer = useRef<number | null>(null)
  const pick = (p: Place) => { setQ(p.label); setSugg([]); onPick(p) }
  const search = (v: string) => {
    setQ(v)
    if (timer.current) window.clearTimeout(timer.current)
    if (!v.trim()) { setSugg([]); return }
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(v)}`)
        const data = await res.json()
        setSugg((data ?? []).map((r: { display_name: string; lat: string; lon: string }) => ({
          label: r.display_name, lat: Number(r.lat), lng: Number(r.lon),
        })))
      } catch { setSugg([]) }
    }, 350)
  }
  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm outline-none focus:border-primary"
          value={q}
          placeholder={placeholder}
          onChange={(e) => search(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (sugg[0]) pick(sugg[0]) } }}
        />
      </div>
      {sugg.length > 0 && (
        <div className="absolute z-[1000] mt-1 w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
          {sugg.map((s, i) => (
            <button key={i} type="button" onClick={() => pick(s)}
              className="block w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-hover truncate">
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5

function tileUrl(dark: boolean): string {
  return `https://{s}.basemaps.cartocdn.com/${dark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`
}

function statusColor(status: string): string {
  if (status === 'completed') return '#10B981'
  if (status === 'active') return '#4F6BED'
  if (status === 'planned') return '#F59E0B'
  return '#8E97A8'
}

function leafletIcon(color = '#4F6BED') {
  return L.divIcon({
    className: 'lux-map-marker',
    html: `<span class="lux-pin" style="--pin:${color}"><span class="lux-pin-dot"></span></span>`,
    iconSize: [34, 46],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],
  })
}

function userIcon() {
  return L.divIcon({
    className: 'lux-user-marker',
    html: `<span class="user-dot"></span><span class="user-pulse"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function distLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export default function WarehouseProjectsMap() {
  const { toast } = useToast()
  const nav = useNavigate()
  const { isAdvanced } = useViewMode()
  const { items: projects, update: updateProject } = useLocalCollection<ProjectRecord>('warehouse:projects', PROJECT_SEED)

  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRefs = useRef<Map<string, L.Marker>>(new Map())
  const projectLayerRef = useRef<L.LayerGroup | null>(null)
  const userLayerRef = useRef<L.LayerGroup | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const watchRef = useRef<number | null>(null)
  const fittedRef = useRef(false)

  const [locating, setLocating] = useState(false)
  const [live, setLive] = useState(false)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [userAcc, setUserAcc] = useState<number | null>(null)
  const [geocoded, setGeocoded] = useState<Map<string, { lat: number; lng: number }>>(new Map())
  const [fromLoc, setFromLoc] = useState<Place | null>(null)
  const [toLoc, setToLoc] = useState<Place | null>(null)
  const [routing, setRouting] = useState(false)
  const [route, setRoute] = useState<{ km: number; min: number } | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const [locModal, setLocModal] = useState<ProjectRecord | null>(null)
  const [locBusy, setLocBusy] = useState(false)
  const [locF, setLocF] = useState({ latitude: '', longitude: '', address: '' })

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    const dark = getTheme() === 'dark'
    L.tileLayer(tileUrl(dark), {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    return () => { watchRef.current && navigator.geolocation.clearWatch(watchRef.current); map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const todo = projects.filter((p) => !p.latitude && !p.longitude && p.address?.trim())
    if (!todo.length) return
    let cancelled = false
    ;(async () => {
      for (const p of todo) {
        if (cancelled) return
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(p.address ?? '')}`)
          const data = await res.json()
          if (!cancelled && data?.[0]) {
            setGeocoded((prev) => new Map(prev).set(p.id, { lat: Number(data[0].lat), lng: Number(data[0].lon) }))
          }
        } catch { /* geocoder down — tag manually instead */ }
        await new Promise((r) => setTimeout(r, 1150))
      }
    })()
    return () => { cancelled = true }
  }, [projects])

  const tagged = useMemo<Tagged[]>(() => {
    return projects
      .map((p) => {
        if (p.latitude && p.longitude) return { p, lat: p.latitude, lng: p.longitude, approx: false }
        const g = geocoded.get(p.id)
        if (g) return { p, lat: g.lat, lng: g.lng, approx: true }
        return null
      })
      .filter((x): x is Tagged => !!x)
  }, [projects, geocoded])

  const taggedIds = useMemo(() => new Set(tagged.map((t) => t.p.id)), [tagged])
  const untagged = projects.filter((p) => !taggedIds.has(p.id))
  const approxCount = tagged.filter((t) => t.approx).length

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    userLayerRef.current?.remove()
    userLayerRef.current = null
    if (!userLoc) return
    const layer = L.layerGroup().addTo(map)
    userLayerRef.current = layer
    tagged.forEach((t) => {
      L.polyline(
        [[userLoc.lat, userLoc.lng], [t.lat, t.lng]],
        { color: '#4F6BED', weight: 2, dashArray: '6 8', opacity: 0.45 }
      ).addTo(layer)
    })
    L.marker([userLoc.lat, userLoc.lng], { icon: userIcon() }).addTo(layer)
    L.circle([userLoc.lat, userLoc.lng], {
      radius: userAcc && userAcc > 0 ? userAcc : 60,
      color: live ? '#10B981' : '#4F6BED', weight: 1, opacity: 0.35, fillOpacity: live ? 0.12 : 0.08,
    }).addTo(layer)
    if (live) {
      L.circle([userLoc.lat, userLoc.lng], { radius: 9, color: '#fff', weight: 2, fillOpacity: 1, fillColor: '#10B981' }).addTo(layer)
    }
    return () => { layer.remove() }
  }, [userLoc, userAcc, live, tagged])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    projectLayerRef.current?.remove()
    projectLayerRef.current = null
    markerRefs.current = new Map()
    if (!tagged.length) return
    const layer = L.layerGroup().addTo(map)
    projectLayerRef.current = layer
    tagged.forEach(({ p, lat, lng, approx }) => {
      const marker = L.marker([lat, lng], { icon: leafletIcon(statusColor(p.status)) }).addTo(layer)
      markerRefs.current.set(p.id, marker)
      const popup = L.popup({ className: 'lux-map-popup' }).setContent(`
        <div class="lux-popwrap">
          <b>${p.name}</b>` +
          (approx ? `<div class="pop-chip pop-approx">≈ tagged from address</div>` : `<div class="pop-chip pop-exact">live coordinates</div>`) +
          `<div class="pop-addr">${p.address || 'No address'}</div>
          <div class="pop-val">${money(p.budget)} · <span class="pop-status">${p.status}</span></div>` +
          (userLoc ? `<div class="pop-dist">📍 ${distLabel(haversineKm(userLoc.lat, userLoc.lng, lat, lng))} from you</div>` : '') +
          `<div class="pop-actions">
            <button data-project="${p.id}" class="pop-open">Open project →</button>
            ${userLoc
              ? `<a href="${gmapsUrl(userLoc, { lat, lng })}" target="_blank" rel="noopener" class="pop-visit">Plan visit</a>`
              : ''}
          </div>
        </div>`)
      marker.bindPopup(popup)
      marker.on('click', () => setSelectedProject(p))
      marker.on('popupopen', () => {
        popup.getElement()?.querySelector('button')?.addEventListener('click', () => nav(`/warehouse/projects/${p.id}`))
      })
    })
    if (!fittedRef.current) {
      const bounds = L.latLngBounds(tagged.map((t) => [t.lat, t.lng]))
      if (userLoc) bounds.extend([userLoc.lat, userLoc.lng])
      map.fitBounds(bounds, { padding: [40, 40] })
      fittedRef.current = true
    }
    return () => { layer.remove() }
  }, [tagged, nav, userLoc])

  useEffect(() => {
    const marker = selectedProject ? markerRefs.current.get(selectedProject.id) : null
    if (marker) {
      mapRef.current?.panTo(marker.getLatLng())
      marker.openPopup()
    }
  }, [selectedProject, tagged])

  const openLocator = (p: ProjectRecord) => {
    setLocF({ latitude: p.latitude ? String(p.latitude) : '', longitude: p.longitude ? String(p.longitude) : '', address: p.address ?? '' })
    setLocModal(p)
  }

  const saveLocation = async () => {
    if (!locModal) return
    if (!locF.latitude || !locF.longitude) { toast({ title: 'Set a location first', description: 'Search a place, use your location, or click the map.', variant: 'error' }); return }
    setLocBusy(true)
    try {
      updateProject(locModal.id, {
        latitude: Number(locF.latitude), longitude: Number(locF.longitude),
        address: locF.address || locModal.address,
      })
      setLocBusy(false)
      setLocModal(null)
      fittedRef.current = false
      toast({ title: 'Location saved', description: `${locModal.name} is now tagged on the map.`, variant: 'success' })
    } catch (e) {
      setLocBusy(false)
      toast({ title: 'Could not save location', description: String(e), variant: 'error' })
    }
  }

  const sortedTags = useMemo(() => {
    if (!userLoc) return tagged
    return [...tagged]
      .map((t) => ({ t, km: haversineKm(userLoc.lat, userLoc.lng, t.lat, t.lng) }))
      .sort((a, b) => a.km - b.km)
      .map((x) => x.t)
  }, [tagged, userLoc])

  const locate = (watch: boolean) => {
    if (watch) {
      if (live) {
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
        setLive(false)
        toast({ title: 'Live tracking off', variant: 'info' })
        return
      }
      if (!('geolocation' in navigator)) { toast({ title: 'Geolocation not supported', variant: 'error' }); return }
      setLive(true)
      const onPos = (pos: GeolocationPosition) => {
        const u = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLoc(u)
        setUserAcc(pos.coords.accuracy)
        mapRef.current?.setView([u.lat, u.lng], 15)
      }
      navigator.geolocation.getCurrentPosition(onPos, () => { setLive(false); toast({ title: 'Could not start tracking', variant: 'error' }) }, { enableHighAccuracy: true, timeout: 10000 })
      watchRef.current = navigator.geolocation.watchPosition(onPos, () => { setLive(false); toast({ title: 'Tracking stopped', variant: 'error' }) }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 })
      toast({ title: 'Live tracking on', description: 'Following your position in real time.', variant: 'success' })
      return
    }
    if (!('geolocation' in navigator)) { toast({ title: 'Geolocation not supported', variant: 'error' }); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const u = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLoc(u)
        setUserAcc(pos.coords.accuracy)
        mapRef.current?.setView([u.lat, u.lng], 12)
        setLocating(false)
      },
      () => { setLocating(false); toast({ title: 'Could not get your location', variant: 'error' }) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function gmapsUrl(origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=driving`
  }

  const useMyLocForFrom = () => {
    if (!('geolocation' in navigator)) { toast({ title: 'Geolocation not supported', variant: 'error' }); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setFromLoc({ label: 'My location', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast({ title: 'Could not get your location', variant: 'error' }),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const showRoute = async () => {
    if (!fromLoc || !toLoc) { toast({ title: 'Set both From and To', variant: 'error' }); return }
    setRouting(true); setRoute(null)
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.code !== 'Ok' || !data.routes?.[0]) { toast({ title: 'No route found between these places', variant: 'error' }); return }
      const r = data.routes[0] as { distance: number; duration: number; geometry: GeoJSON.GeoJSON }
      setRoute({ km: r.distance / 1000, min: r.duration / 60 })
      const map = mapRef.current
      if (map) {
        routeLayerRef.current?.remove()
        const layer = L.layerGroup().addTo(map)
        routeLayerRef.current = layer
        L.geoJSON(r.geometry, { style: { color: '#4F6BED', weight: 5, opacity: 0.85 } }).addTo(layer)
        L.marker([fromLoc.lat, fromLoc.lng], { icon: L.divIcon({ className: 'lux-route-marker', html: '<span class="route-pt pt-a">A</span>', iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(layer)
        L.marker([toLoc.lat, toLoc.lng], { icon: L.divIcon({ className: 'lux-route-marker', html: '<span class="route-pt pt-b">B</span>', iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(layer)
        map.fitBounds(L.geoJSON(r.geometry).getBounds(), { padding: [40, 40] })
      }
    } catch {
      toast({ title: 'Route service unreachable', variant: 'error' })
    } finally {
      setRouting(false)
    }
  }

  const clearRoute = () => {
    routeLayerRef.current?.remove(); routeLayerRef.current = null
    setRoute(null); setFromLoc(null); setToLoc(null)
  }

  const openProject = (p: ProjectRecord) => {
    setSelectedProject(p)
    const marker = markerRefs.current.get(p.id)
    if (marker) {
      mapRef.current?.panTo(marker.getLatLng())
      marker.openPopup()
    } else {
      openLocator(p)
    }
  }

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {}
    projects.forEach((p) => { c[p.status] = (c[p.status] ?? 0) + 1 })
    return c
  }, [projects])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Site Map</h1>
          <div className="muted">
            {tagged.length > 0
              ? `${tagged.length} project${tagged.length === 1 ? '' : 's'} on the map${approxCount > 0 ? ` · ${approxCount} tagged from address` : ''}${userLoc ? ' · distances from your live location' : ''}`
              : 'Project locations on the map — locate yourself to plan visits'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => locate(true)} className={live ? '!text-emerald-500 !border-emerald-500/50' : ''}>
            <span className="flex items-center gap-1.5">
              {live && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
              <Radio className="w-4 h-4" />
              {live ? 'Live · on' : 'Live tracking'}
            </span>
          </Button>
          <Button variant="outline" onClick={() => locate(false)} disabled={locating}>
            {userLoc ? <LocateFixed className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
            {locating ? 'Locating…' : userLoc ? 'Recenter' : 'My location'}
          </Button>
          <Button variant="ghost" onClick={() => { fittedRef.current = false; window.dispatchEvent(new Event('storage')) }}>
            <MapPin className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {isAdvanced && projects.length > 0 && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Site portfolio at a glance — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total sites', value: String(projects.length), delta: `${tagged.length} on map`, deltaTone: 'flat' },
            { label: 'Total contract value', value: money(totalBudget), delta: 'across all sites', deltaTone: 'flat' },
            { label: 'Untagged sites', value: String(untagged.length), delta: untagged.length ? 'add locations below' : 'all located', deltaTone: untagged.length ? 'down' : 'up' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Sites by status</p>
              <DonutChart
                data={[
                  { label: 'Active', value: statusCounts.active ?? 0, color: 'var(--primary)' },
                  { label: 'Planned', value: statusCounts.planned ?? 0, color: '#f59e0b' },
                  { label: 'Completed', value: statusCounts.completed ?? 0, color: '#10b981' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      <Card className="mb-4">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">Plan a route<br /><span className="text-xs font-normal text-muted">Search a From & To location — or tap "From: my location"</span></h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PlaceSearch placeholder="From — search a place, e.g. Delhi" onPick={(p) => { setFromLoc(p); mapRef.current?.setView([p.lat, p.lng], 13) }} />
            <PlaceSearch placeholder="To — search a place or site address" onPick={(p) => { setToLoc(p); mapRef.current?.setView([p.lat, p.lng], 13) }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={showRoute} disabled={routing || !fromLoc || !toLoc}>
              <Navigation className="w-4 h-4" /> {routing ? 'Routing…' : 'Show route'}
            </Button>
            <Button variant="outline" onClick={useMyLocForFrom}><LocateFixed className="w-4 h-4" /> From: my location</Button>
            {route && (
              <>
                <span className="text-sm font-semibold text-primary">{route.km.toFixed(1)} km · {Math.round(route.min)} min</span>
                {fromLoc && toLoc && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${fromLoc.lat},${fromLoc.lng}&destination=${toLoc.lat},${toLoc.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Route in Google Maps
                  </a>
                )}
                <Button variant="ghost" onClick={clearRoute}>Clear</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        <div className="lg:col-span-1 space-y-3 max-h-[620px] overflow-y-auto pr-1">
          {!userLoc && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted mb-3">Tap <b>Live tracking</b> to follow your position and see how far every site is in real time.</p>
                <Button onClick={() => locate(true)} disabled={locating} className="w-full">
                  <Radio className="w-4 h-4" /> {live ? 'Live · on' : 'Start live tracking'}
                </Button>
              </CardContent>
            </Card>
          )}

          {tagged.length === 0 && untagged.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-text mb-3">
                  <b>No sites on the map yet.</b> Add a location to each project below — search the address, use your location, or auto-tag from the project addresses.
                </p>
                <Button variant="outline" onClick={() => { const todo = untagged.filter((p) => p.address?.trim()); if (!todo.length) { toast({ title: 'Nothing to tag', description: 'Add an address to a project first.', variant: 'info' }); return } }} className="w-full">
                  <Sparkles className="w-4 h-4" /> Auto-tag from addresses
                </Button>
              </CardContent>
            </Card>
          )}

          {sortedTags.map(({ p, lat, lng, approx }, i) => (
            <Card key={p.id} className="mb-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <button type="button" onClick={() => openProject(p)} className="font-medium text-text hover:text-primary hover:underline truncate text-left">{p.name}</button>
                  {userLoc && <Badge variant="outline" size="sm" className="flex-shrink-0">#{i + 1}</Badge>}
                </div>
                <p className="text-xs text-muted truncate mb-1">{p.address || 'No address'} · {money(p.budget)}</p>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {approx
                    ? <span className="pop-chip pop-approx">≈ from address</span>
                    : <span className="pop-chip pop-exact">live coordinates</span>}
                  <Badge variant="outline" size="sm" className="flex-shrink-0">{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {userLoc ? distLabel(haversineKm(userLoc.lat, userLoc.lng, lat, lng)) : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openProject(p)}><Crosshair className="w-3.5 h-3.5" /> View</Button>
                    {userLoc && (
                      <a
                        href={gmapsUrl(userLoc, { lat, lng })}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <Car className="w-3.5 h-3.5" /> Plan visit
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {untagged.map((p) => (
            <Card key={p.id} className="mb-0">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => openProject(p)} className="font-medium text-text hover:text-primary hover:underline block truncate text-left">{p.name}</button>
                  <p className="text-xs text-muted truncate">{p.address || 'No address'} · {money(p.budget)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openLocator(p)}>
                  <MapPin className="w-3.5 h-3.5" /> Set location
                </Button>
              </CardContent>
            </Card>
          ))}

          {projects.length === 0 && (
            <Empty
              icon={<MapPin className="w-12 h-12" />}
              title="No projects yet"
              description="Create a warehouse project first — then tag its location here to plot it on the map."
            />
          )}
        </div>

        <Card className="mb-0 overflow-hidden lg:col-span-2 relative">
          <div ref={containerRef} style={{ height: '620px', zIndex: 0 }} className="w-full" />
        </Card>
      </div>

      <Modal open={locModal !== null} onClose={() => setLocModal(null)} title="Set project location" description={locModal ? `${locModal.name} — search the address, use your location, or click the map.` : ''} size="md">
        <div className="space-y-4">
          <LocationPicker
            latitude={locF.latitude}
            longitude={locF.longitude}
            onChange={(lat, lng, addr) => setLocF((prev) => ({ ...prev, latitude: lat, longitude: lng, address: addr || prev.address }))}
          />
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <p className="text-xs text-muted">Coordinates are saved to the project and shown on the map.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setLocModal(null)}>Cancel</Button>
              <Button onClick={saveLocation} disabled={locBusy || !locF.latitude || !locF.longitude}>
                <MapPin className="w-4 h-4" /> {locBusy ? 'Saving…' : 'Save location'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}