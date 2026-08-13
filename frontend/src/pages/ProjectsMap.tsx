import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { Project } from '../api'
import { Card, CardContent, Badge, Empty, money, Button } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, Car, Navigation2, LocateFixed, Search, Route } from 'lucide-react'
import { getTheme } from '../theme'

type Place = { label: string; lat: number; lng: number }

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

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629] // India
const DEFAULT_ZOOM = 5

function tileUrl(dark: boolean): string {
  return `https://{s}.basemaps.cartocdn.com/${dark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`
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

export default function ProjectsMap() {
  const { toast } = useToast()
  const nav = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [locating, setLocating] = useState(false)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [fromLoc, setFromLoc] = useState<Place | null>(null)
  const [toLoc, setToLoc] = useState<Place | null>(null)
  const [routing, setRouting] = useState(false)
  const [route, setRoute] = useState<{ km: number; min: number } | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    api.projects.list().then(setProjects).catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    const dark = getTheme() === 'dark'
    L.tileLayer(tileUrl(dark), {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const markers = projects.filter((p) => p.latitude && p.longitude)
    markers.forEach((p) => {
      const status = p.status === 'Completed' ? '#10B981' : p.status === 'Ongoing' ? '#4F6BED' : p.status === 'On Hold' ? '#F59E0B' : '#8E97A8'
      const marker = L.marker([p.latitude!, p.longitude!], { icon: leafletIcon(status) }).addTo(map)
      const popup = L.popup({ className: 'lux-map-popup' }).setContent(`
        <div class="lux-popwrap">
          <b>${p.name}</b>
          <div class="pop-addr">${p.address || 'No address'}</div>
          <div class="pop-val">${money(p.value)} · <span class="pop-status">${p.status}</span></div>` +
          (userLoc ? `<div class="pop-dist">📍 ${distLabel(haversineKm(userLoc.lat, userLoc.lng, p.latitude!, p.longitude!))} from you</div>` : '') +
          `<div class="pop-actions">
            <button data-project="${p.id}" class="pop-open">Open project →</button>
            ${userLoc
              ? `<a href="${gmapsUrl(userLoc, { latitude: p.latitude!, longitude: p.longitude! })}" target="_blank" rel="noopener" class="pop-visit">Plan visit</a>`
              : ''}
          </div>
        </div>`)
      marker.bindPopup(popup)
      marker.on('popupopen', () => {
        popup.getElement()?.querySelector('button')?.addEventListener('click', () => nav(`/projects/${p.id}`))
      })
    })
    if (markers.length === 1) {
      map.setView([markers[0].latitude!, markers[0].longitude!], 13)
    } else if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((p) => [p.latitude!, p.longitude!]))
      if (userLoc) bounds.extend([userLoc.lat, userLoc.lng])
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [projects, nav, userLoc])

  // Lines from user location to each site
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLoc) return
    const layer = L.layerGroup().addTo(map)
    projects.filter((p) => p.latitude && p.longitude).forEach((p) => {
      L.polyline(
        [[userLoc.lat, userLoc.lng], [p.latitude!, p.longitude!]],
        { color: '#4F6BED', weight: 2, dashArray: '6 8', opacity: 0.45 }
      ).addTo(layer)
    })
    L.marker([userLoc.lat, userLoc.lng], { icon: userIcon() }).addTo(layer)
    L.circle([userLoc.lat, userLoc.lng], { radius: 60, color: '#4F6BED', weight: 1, opacity: 0.3, fillOpacity: 0.08 }).addTo(layer)
    return () => { layer.remove() }
  }, [projects, userLoc])

  const withCoords = projects.filter((p) => p.latitude && p.longitude)

  const distances = useMemo(() => {
    if (!userLoc) return []
    return withCoords
      .map((p) => ({ p, km: haversineKm(userLoc.lat, userLoc.lng, p.latitude!, p.longitude!) }))
      .sort((a, b) => a.km - b.km)
  }, [userLoc, withCoords])

  const locate = () => {
    if (!('geolocation' in navigator)) { toast({ title: 'Geolocation not supported', variant: 'error' }); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 12)
        setLocating(false)
      },
      () => { setLocating(false); toast({ title: 'Could not get your location', variant: 'error' }) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function gmapsUrl(origin: { lat: number; lng: number }, dest: { latitude: number; longitude: number }) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.latitude},${dest.longitude}&travelmode=driving`
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Site Map</h1>
          <div className="muted">{userLoc ? 'Distances from your live location' : 'Project locations on the map — locate yourself to plan visits'}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={locate} disabled={locating}>
            {userLoc ? <LocateFixed className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
            {locating ? 'Locating…' : userLoc ? 'Recenter' : 'My location'}
          </Button>
          <Button variant="ghost" onClick={() => { api.projects.list().then(setProjects).catch(() => {}) }}>
            <MapPin className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

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
                <Button variant="ghost" onClick={clearRoute}>Clear</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {withCoords.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <Empty
              icon={<MapPin className="w-12 h-12" />}
              title="No site coordinates yet"
              description="Set latitude & longitude on a project (or its address) to plot it here. Edit a project to add coordinates."
              action={<Link to="/projects"><Button>Go to Projects</Button></Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3 mb-4">
            <div className="lg:col-span-1 space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {!userLoc && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted mb-3">Tap <b>My location</b> to see how far each site is and plan your next visit.</p>
                    <Button onClick={locate} disabled={locating} className="w-full">
                      <Navigation2 className="w-4 h-4" /> {locating ? 'Locating…' : 'Use my location'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {distances.map(({ p, km }, i) => (
                <Card key={p.id} className="mb-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Link to={`/projects/${p.id}`} className="font-medium text-text hover:text-primary hover:underline truncate">{p.name}</Link>
                      {userLoc && <Badge variant="outline" size="sm" className="flex-shrink-0">#{i + 1}</Badge>}
                    </div>
                    <p className="text-xs text-muted truncate mb-2">{p.address || 'No address'} · {money(p.value)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {userLoc ? distLabel(km) : p.status}
                      </span>
                      {userLoc && (
                        <a
                          href={gmapsUrl(userLoc, { latitude: p.latitude!, longitude: p.longitude! })}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          <Car className="w-3.5 h-3.5" /> Plan visit
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!userLoc && withCoords.map((p) => (
                <Card key={p.id} className="mb-0">
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link to={`/projects/${p.id}`} className="font-medium text-text hover:text-primary hover:underline block truncate">{p.name}</Link>
                      <p className="text-xs text-muted truncate">{p.address || 'No address'} · {money(p.value)}</p>
                    </div>
                    <Badge variant="outline" size="sm">{p.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-0 overflow-hidden lg:col-span-2">
              <div ref={containerRef} style={{ height: '560px', zIndex: 0 }} className="w-full" />
            </Card>
          </div>
        </>
      )}
    </>
  )
}
