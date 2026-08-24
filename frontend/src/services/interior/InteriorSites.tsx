import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, money, num } from '../../platform/ui'
import { Compass, LocateFixed, MapPin, Navigation, Route, Ruler, Sparkles } from 'lucide-react'
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
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0]

  const ranked = useMemo(() => projects.map((project) => {
    const point = project.latitude && project.longitude ? { lat: Number(project.latitude), lng: Number(project.longitude) } : null
    return { project, distance: current && point ? distanceKm(current, point) : null }
  }).sort((a, b) => (a.distance ?? Number.MAX_VALUE) - (b.distance ?? Number.MAX_VALUE)), [current, projects])

  function locate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setCurrent({ lat: coords.latitude, lng: coords.longitude }); setLocating(false) },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
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
        <Button onClick={locate} disabled={locating}><LocateFixed className="w-4 h-4" /> {locating ? 'Finding location...' : 'Find nearest site'}</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="interior-metrics !grid-cols-2">
            <div className="interior-metric"><p className="interior-metric-label">Mapped sites</p><p className="interior-metric-value">{projects.filter((project) => project.latitude && project.longitude).length}</p></div>
            <div className="interior-metric"><p className="interior-metric-label">Active visits</p><p className="interior-metric-value">{projects.filter((project) => project.status === 'active').length}</p></div>
          </div>
          <div className="interior-site-list">
            {ranked.map(({ project, distance }) => (
              <button key={project.id} className={`interior-site-card ${selected.id === project.id ? 'is-active' : ''}`} onClick={() => setSelectedId(project.id)}>
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-text">{project.name}</p><p className="text-xs text-muted mt-1">{project.location || 'Location not set'}</p></div><Badge variant={project.status === 'active' ? 'success' : 'outline'} size="sm">{project.phase ?? project.status}</Badge></div>
                <div className="flex items-center justify-between mt-3 text-xs"><span className="text-muted">{project.leadDesigner ?? 'Designer unassigned'}</span>{distance !== null && <span className="font-semibold text-primary">{distance.toFixed(1)} km</span>}</div>
              </button>
            ))}
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
