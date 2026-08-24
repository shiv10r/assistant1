import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, money, num } from '../../platform/ui'
import { Compass, LocateFixed, MapPin, Navigation, Route, Ruler, Search, Sparkles } from 'lucide-react'
import { LocationPicker } from '../../platform/maps'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom } from './types'
import { PROJECT_SEED, ROOM_SEED } from './seed'

type Point = { lat: number; lng: number }

function distanceKm(from: Point, to: Point) {
  const radius = 6371
  const dLat = (to.lat - from.lat) * Math.PI / 180
  const dLng = (to.lng - from.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function InteriorSites() {
  const navigate = useNavigate()
  const { items: storedProjects, update } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const projects = useMemo(() => storedProjects.map((project) => ({ ...PROJECT_SEED.find((seed) => seed.id === project.id), ...project })), [storedProjects])
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')
  const [current, setCurrent] = useState<Point | null>(null)
  const [locating, setLocating] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [locationMessage, setLocationMessage] = useState('Use your location to rank sites by travel distance.')
  const [query, setQuery] = useState('')
  const [showMappedOnly, setShowMappedOnly] = useState(false)
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0]

  const ranked = useMemo(() => projects.map((project) => {
    const point = project.latitude && project.longitude ? { lat: Number(project.latitude), lng: Number(project.longitude) } : null
    return { project, distance: current && point ? distanceKm(current, point) : null }
  }).sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE)), [current, projects])
  const visibleSites = ranked.filter(({ project }) => {
    if (showMappedOnly && (!project.latitude || !project.longitude)) return false
    const search = query.trim().toLowerCase()
    return !search || `${project.name} ${project.location} ${project.clientName ?? ''} ${project.leadDesigner ?? ''}`.toLowerCase().includes(search)
  })

  function locate() {
    if (!navigator.geolocation) { setLocationMessage('GPS is not supported by this browser.'); return }
    setLocating(true)
    setLocationMessage('Getting a high-accuracy position...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setCurrent({ lat: coords.latitude, lng: coords.longitude }); setAccuracy(coords.accuracy); setLocationMessage('Sites are ranked from your current position.'); setLocating(false) },
      (error) => { setLocating(false); setLocationMessage(error.code === error.PERMISSION_DENIED ? 'Location permission denied. You can still select and map sites manually.' : 'Could not get a reliable GPS position. Try again outdoors.') },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    )
  }

  function navigateTo(project: InteriorProject) {
    const destination = project.latitude && project.longitude
      ? `${project.latitude},${project.longitude}`
      : project.location
    const origin = current ? `&origin=${current.lat},${current.lng}` : ''
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${origin}`, '_blank', 'noopener,noreferrer')
  }

  if (!selected) return <Card><CardContent className="py-12 text-center text-sm text-muted">Create a project before planning site visits.</CardContent></Card>

  const selectedRooms = rooms.filter((room) => room.projectId === selected.id)

  return (
    <div className="interior-page space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><span className="interior-eyebrow !text-primary"><Compass className="w-3.5 h-3.5" /> Field intelligence</span><h1 className="text-3xl font-semibold text-text mt-2">Site planner</h1><p className="text-sm text-muted mt-1">Pin project sites, identify the nearest visit and open turn-by-turn navigation.</p></div>
        <div className="text-right"><Button onClick={locate} disabled={locating}><LocateFixed className="w-4 h-4" /> {locating ? 'Finding location...' : current ? 'Refresh my position' : 'Find nearest site'}</Button><p className="text-xs text-muted mt-2" role="status">{locationMessage}{accuracy !== null && current ? ` GPS ±${Math.round(accuracy)} m.` : ''}</p></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="interior-metrics !grid-cols-2">
            <div className="interior-metric"><p className="interior-metric-label">Mapped sites</p><p className="interior-metric-value">{projects.filter((project) => project.latitude && project.longitude).length}</p></div>
            <div className="interior-metric"><p className="interior-metric-label">Active visits</p><p className="interior-metric-value">{projects.filter((project) => project.status === 'active').length}</p></div>
          </div>
          <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search site, client or designer" maxLength={120} className="w-full rounded-lg border border-border bg-surface2 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary" /></div>
            <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" checked={showMappedOnly} onChange={(event) => setShowMappedOnly(event.target.checked)} className="accent-[var(--primary)]" /> Show mapped sites only</label>
          </div>
          <div className="interior-site-list">
            {visibleSites.map(({ project, distance }) => (
              <button key={project.id} className={`interior-site-card ${selected.id === project.id ? 'is-active' : ''}`} onClick={() => setSelectedId(project.id)}>
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-text">{project.name}</p><p className="text-xs text-muted mt-1">{project.location || 'Location not set'}</p></div><Badge variant={project.status === 'active' ? 'success' : 'outline'} size="sm">{project.phase ?? project.status}</Badge></div>
                <div className="flex items-center justify-between mt-3 text-xs"><span className="text-muted">{project.leadDesigner ?? 'Designer unassigned'}</span>{distance !== null && <span className="font-semibold text-primary">{distance.toFixed(1)} km</span>}</div>
              </button>
            ))}
            {visibleSites.length === 0 && <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted">No sites match these filters.</div>}
          </div>
        </div>

        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div><CardTitle>{selected.name}</CardTitle><p className="text-xs text-muted mt-1">Click the map or search to improve the saved site position.</p></div>
            <Button size="sm" onClick={() => navigateTo(selected)}><Navigation className="w-4 h-4" /> Navigate</Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <LocationPicker
              latitude={selected.latitude}
              longitude={selected.longitude}
              onChange={(latitude, longitude, address) => update(selected.id, { latitude, longitude, ...(address ? { location: address } : {}) })}
              onAddressChange={(location) => update(selected.id, { location })}
              markerLabel={`${selected.name} interior site`}
              purpose={`Pin ${selected.name} for client visits, room surveys, deliveries, and on-site design reviews.`}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface2 border border-border"><MapPin className="w-4 h-4 text-primary" /><p className="text-[11px] text-muted mt-2">Client</p><p className="text-xs font-semibold mt-1">{selected.clientName ?? 'Not assigned'}</p></div>
              <div className="p-3 rounded-lg bg-surface2 border border-border"><Ruler className="w-4 h-4 text-primary" /><p className="text-[11px] text-muted mt-2">Planned area</p><p className="text-xs font-semibold mt-1">{num(selected.totalArea)} sq ft</p></div>
              <div className="p-3 rounded-lg bg-surface2 border border-border"><Route className="w-4 h-4 text-primary" /><p className="text-[11px] text-muted mt-2">Rooms</p><p className="text-xs font-semibold mt-1">{selectedRooms.length} surveyed</p></div>
              <div className="p-3 rounded-lg bg-surface2 border border-border"><Sparkles className="w-4 h-4 text-primary" /><p className="text-[11px] text-muted mt-2">Budget</p><p className="text-xs font-semibold mt-1">{money(selected.budget)}</p></div>
            </div>
            <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => navigate(`/interior/projects/${selected.id}`)}>Open project</Button><Button variant="outline" onClick={() => navigate(`/interior/projects/${selected.id}/generate`)}><Sparkles className="w-4 h-4" /> Create site concept</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
