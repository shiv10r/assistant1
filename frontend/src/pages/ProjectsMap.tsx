import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { Project } from '../api'
import { Card, CardContent, Badge, Empty, money, Button } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629] // India
const DEFAULT_ZOOM = 5

function leafletIcon(color = '#4F6BED') {
  return L.divIcon({
    className: 'lux-map-marker',
    html: `<svg width="30" height="42" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40],
  })
}

export default function ProjectsMap() {
  const { toast } = useToast()
  const nav = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    api.projects.list().then(setProjects).catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    if (markers.length === 0) return
    markers.forEach((p) => {
      const status = p.status === 'Completed' ? '#10B981' : p.status === 'Ongoing' ? '#4F6BED' : p.status === 'On Hold' ? '#F59E0B' : '#8E97A8'
      const marker = L.marker([p.latitude!, p.longitude!], { icon: leafletIcon(status) }).addTo(map)
      const popup = L.popup().setContent(`
        <div style="font-family:sans-serif;font-size:13px;min-width:180px">
          <b style="font-size:14px">${p.name}</b>
          <div style="color:#666;margin:2px 0 6px">${p.address || 'No address'}</div>
          <div style="margin-bottom:6px">${money(p.value)} · <span style="color:#888">${p.status}</span></div>
          <button data-project="${p.id}" style="background:#4F6BED;color:#fff;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-weight:600">Open project →</button>
        </div>`)
      marker.bindPopup(popup)
      marker.on('popupopen', () => {
        popup.getElement()?.querySelector('button')?.addEventListener('click', () => nav(`/projects/${p.id}`))
      })
    })
    if (markers.length === 1) {
      map.setView([markers[0].latitude!, markers[0].longitude!], 13)
    } else {
      const bounds = L.latLngBounds(markers.map((p) => [p.latitude!, p.longitude!]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [projects, nav])

  const locate = () => {
    if (!('geolocation' in navigator)) { toast({ title: 'Geolocation not supported', variant: 'error' }); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 13)
        setLocating(false)
      },
      () => { setLocating(false); toast({ title: 'Could not get your location', variant: 'error' }) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const withCoords = projects.filter((p) => p.latitude && p.longitude)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Site Map</h1>
          <div className="muted">Project locations on the map</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={locate} disabled={locating}>
            <Navigation className="w-4 h-4" /> {locating ? 'Locating…' : 'My location'}
          </Button>
          <Button variant="ghost" onClick={() => { api.projects.list().then(setProjects).catch(() => {}) }}>
            <MapPin className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

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
          <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
            {withCoords.map((p) => (
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
          <Card className="mb-0 overflow-hidden">
            <div ref={containerRef} style={{ height: '520px', zIndex: 0 }} className="w-full" />
          </Card>
        </>
      )}
    </>
  )
}
