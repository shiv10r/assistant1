import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ArrowRight, Bot, CalendarDays, Check, CircleAlert, Cloud, Download, FileText, FolderOpen,
  ListChecks, MapPin, Navigation, Plus, Search, Sparkles, Trash2, Upload, X,
} from 'lucide-react'
import { api, type AiChatTurn } from '../../api'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../platform/dashboard'
import AttendanceModule, { type AttendanceWorker } from '../../platform/attendance/AttendanceModule'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Modal, Select, Textarea, money, fmtDate } from '../../platform/ui'
import { genId, useLocalCollection } from '../../lib/localStore'
import { useViewMode } from '../../hooks/useViewMode'
import LocationPicker from '../../platform/maps'
import { fileStorage, fileStorageFor, STORAGE_FILE_ACCEPT, storageFileError } from './fileStorage'
import { operationsConfig, type OperationsConfig } from './config'
import CollaborationWorkspace from './CollaborationWorkspace'
import OperationsCapabilityCards from './OperationsCapabilityCards'
import ProjectLibrary from './ProjectLibrary'
import TeamRoster from './TeamRoster'
import TrackingTimeline from './TrackingTimeline'
import { seedCheckpoints, seedDiscussions, seedLibrary, seedMeetings, seedRoster } from './seedData'
import type { Checkpoint, Discussion, LibraryProject, Meeting, StoredFile, TeamMember, Visit, WorkItem } from './types'
import { getTheme } from '../../theme'
import './operations.css'
import './operations-workspaces.css'

const VisualWorkflowWorkspace = lazy(() => import('./VisualWorkflowWorkspace'))

type View = 'overview' | 'visual-workflow' | 'portfolio' | 'visits' | 'map' | 'attendance' | 'assistant' | 'files' | 'tracking' | 'library' | 'team'

const VIEWS: View[] = ['overview', 'visual-workflow', 'portfolio', 'visits', 'map', 'attendance', 'assistant', 'files', 'tracking', 'library', 'team']
const STATUS_VARIANT = (status: string) => status === 'Completed' || status === 'Confirmed' ? 'success' : status === 'Review' || status === 'Interview' ? 'warning' : status === 'Cancelled' ? 'danger' : 'info'
const futureDate = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10) }

function seededItems(config: OperationsConfig): WorkItem[] {
  return config.seeds.map((item, index) => ({ id: `${config.id}-work-${index + 1}`, ...item, dueDate: futureDate(14 + index * 11), createdAt: new Date().toISOString() }))
}

function seededVisits(config: OperationsConfig): Visit[] {
  return config.seeds.slice(0, 2).map((item, index) => ({
    id: `${config.id}-visit-${index + 1}`, workId: `${config.id}-work-${index + 1}`,
    title: `${config.visit.replace(/\b\w/g, (letter) => letter.toUpperCase())}: ${item.title}`,
    date: futureDate(index + 2), time: index ? '14:30' : '10:00', owner: item.owner, status: 'Scheduled', notes: `Confirm access and priorities for ${item.location}.`,
  }))
}

export default function OperationsWorkspaceRoute() {
  const { service, view = 'overview' } = useParams()
  const config = operationsConfig(service)
  if (!config) return <Navigate to="/" replace />
  if (!VIEWS.includes(view as View) || (view === 'attendance' && !config.attendance) || (view === 'map' && !config.map)) {
    return <Navigate to={`/${config.id}/operations/overview`} replace />
  }
  return <OperationsWorkspace config={config} view={view as View} />
}

function OperationsWorkspace({ config, view }: { config: OperationsConfig; view: View }) {
  const work = useLocalCollection<WorkItem>(`${config.id}:operations-work`, seededItems(config))
  const visits = useLocalCollection<Visit>(`${config.id}:operations-visits`, seededVisits(config))
  const files = useLocalCollection<StoredFile>(`${config.id}:operations-files`, [])
  const team = useLocalCollection<TeamMember>(`${config.id}:operations-roster`, seedRoster(config))
  const checkpoints = useLocalCollection<Checkpoint>(`${config.id}:operations-checkpoints`, seedCheckpoints(config, work.items))
  const discussions = useLocalCollection<Discussion>(`${config.id}:operations-discussions`, seedDiscussions(config, work.items, team.items))
  const meetings = useLocalCollection<Meeting>(`${config.id}:operations-meetings`, seedMeetings(config, work.items, team.items))
  const library = useLocalCollection<LibraryProject>(`${config.id}:operations-library`, seedLibrary(config, work.items))
  const { isAdvanced } = useViewMode()
  const workers: AttendanceWorker[] = config.team.map((person, index) => ({ id: `${config.id}-person-${index + 1}`, ...person, status: 'active' }))

  if (view === 'visual-workflow') return <Suspense fallback={<div className="ops-empty" role="status"><Sparkles /><h2>Loading visual workflow</h2><p>Preparing the live operations canvas.</p></div>}><VisualWorkflowWorkspace key={config.id} config={config} /></Suspense>
  if (view === 'attendance') return <AttendanceModule collection={`${config.id}:operations-team`} seed={workers} backTo={`/${config.id}/operations/overview`} title={`${capitalize(config.people)} attendance`} sub={`Presence, hours, leave and emergency coordination for your ${config.people}.`} />
  if (view === 'portfolio') return <Portfolio config={config} work={work} />
  if (view === 'visits') return <Visits config={config} work={work.items} visits={visits} discussions={discussions} meetings={meetings} team={team.items} />
  if (view === 'map') return <OperationsMap config={config} work={work.items} />
  if (view === 'assistant') return <OperationsAssistant config={config} work={work.items} visits={visits.items} />
  if (view === 'files') return <OperationsFiles config={config} work={work.items} files={files} />
  if (view === 'tracking') return <TrackingTimeline config={config} work={work.items} checkpoints={checkpoints} isAdvanced={isAdvanced} />
  if (view === 'library') return <ProjectLibrary config={config} work={work.items} library={library} />
  if (view === 'team') return <TeamRoster config={config} team={team} isAdvanced={isAdvanced} />
  return <Overview config={config} work={work.items} visits={visits.items} files={files.items} discussions={discussions.items} checkpoints={checkpoints.items} team={team.items} library={library.items} isAdvanced={isAdvanced} />
}

function OperationsHeader({ config, eyebrow, title, action }: { config: OperationsConfig; eyebrow: string; title: string; action?: React.ReactNode }) {
  return <header className="ops-page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{config.description}</p></div>{action}</header>
}

function Overview({ config, work, visits, files, discussions, checkpoints, team, library, isAdvanced }: { config: OperationsConfig; work: WorkItem[]; visits: Visit[]; files: StoredFile[]; discussions: Discussion[]; checkpoints: Checkpoint[]; team: TeamMember[]; library: LibraryProject[]; isAdvanced: boolean }) {
  const navigate = useNavigate()
  const base = `/${config.id}/operations`
  const active = work.filter((item) => !['Completed', 'Cancelled'].includes(item.status))
  const avgProgress = work.length ? Math.round(work.reduce((sum, item) => sum + item.progress, 0) / work.length) : 0
  const dueVisits = visits.filter((visit) => visit.status === 'Scheduled').length
  const totalValue = work.reduce((sum, item) => sum + item.value, 0)
  const bars: BarDatum[] = work.map((item) => ({ label: item.title, value: item.progress }))
  const statusTotals = new Map<string, number>()
  work.forEach((item) => statusTotals.set(item.status, (statusTotals.get(item.status) ?? 0) + 1))
  const colors = ['#4F86F7', '#2CB5A8', '#F0A34A', '#9B7BFF', '#F0708D']
  const donut: DonutDatum[] = [...statusTotals].map(([label, value], index) => ({ label, value, color: colors[index % colors.length] }))
  const nextVisits = [...visits].filter((visit) => visit.status === 'Scheduled').sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 3)
  const atRiskValue = work.filter((item) => item.progress < 40).reduce((sum, item) => sum + item.value, 0)
  const checkpointCompletion = checkpoints.length ? Math.round(checkpoints.filter((item) => item.status === 'Complete').length / checkpoints.length * 100) : 0
  const openDecisions = discussions.filter((item) => item.status !== 'Resolved').length

  return <div className="operations-page">
    <section className="ops-hero">
      <div><span className="ops-eyebrow"><Sparkles className="w-3.5 h-3.5" /> {config.title}</span><h1>Clarity for every <br />moving part.</h1><p>{config.description}</p></div>
      <div className="ops-hero-actions"><Button onClick={() => navigate(`${base}/portfolio`)}><ListChecks className="w-4 h-4" /> Open {config.items}</Button><Button variant="outline" onClick={() => navigate(`${base}/visits`)}><CalendarDays className="w-4 h-4" /> Plan {config.visit}</Button></div>
    </section>
    <section className="ops-metrics">
      <button onClick={() => navigate(`${base}/portfolio`)}><span>Active {config.items}</span><strong>{active.length}</strong><small>{work.length} total in portfolio</small></button>
      <button onClick={() => navigate(`${base}/portfolio`)}><span>Average progress</span><strong>{avgProgress}%</strong><small>Across the full portfolio</small></button>
      <button onClick={() => navigate(`${base}/visits`)}><span>Upcoming {config.visit}s</span><strong>{dueVisits}</strong><small>Ready for coordination</small></button>
      <button onClick={() => navigate(`${base}/files`)}><span>{capitalize(config.value)}</span><strong>{money(totalValue)}</strong><small>{files.length} shared files</small></button>
    </section>
    <div className="ops-overview-grid">
      <div className="ops-main-column">
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Portfolio pulse</CardTitle><p className="text-xs text-muted mt-1">Live progress across {config.items}</p></div><Button variant="ghost" size="sm" onClick={() => navigate(`${base}/portfolio`)}>View all <ArrowRight className="w-4 h-4" /></Button></CardHeader><CardContent className="space-y-1">
          {work.map((item) => <button className="ops-work-row" key={item.id} onClick={() => navigate(`${base}/portfolio`)}><span><strong>{item.title}</strong><small>{item.customer} · {item.location}</small></span><span className="ops-owner">{item.owner}</span><span className="ops-progress"><i><b style={{ width: `${item.progress}%` }} /></i><small>{item.progress}%</small></span><Badge variant={STATUS_VARIANT(item.status)} size="sm">{item.status}</Badge><ArrowRight className="w-4 h-4 text-muted" /></button>)}
        </CardContent></Card>
        {isAdvanced && <AdvancedPanel title="Delivery intelligence" subtitle={`Progress distribution and operational exposure across every ${config.item}.`} bars={bars} compare={[{ label: 'Value exposed below 40%', value: money(atRiskValue), delta: atRiskValue ? 'Prioritize low-progress work' : 'No value exposed', deltaTone: atRiskValue ? 'down' : 'up' }, { label: 'Checkpoint throughput', value: `${checkpointCompletion}%`, delta: `${checkpoints.filter((item) => item.status === 'Complete').length} verified handoffs`, deltaTone: 'up' }, { label: 'Open coordination load', value: String(openDecisions), delta: `${discussions.filter((item) => item.kind === 'Hurdle' && item.status !== 'Resolved').length} hurdles`, deltaTone: openDecisions ? 'flat' : 'up' }]} />}
      </div>
      <div className="ops-side-column">
        {isAdvanced && <AdvancedPanel title="Portfolio mix" subtitle="Current work distribution by operational status" donut={donut} />}
        <Card><CardHeader><CardTitle className="text-sm">Next on the ground</CardTitle></CardHeader><CardContent className="space-y-3">{nextVisits.length ? nextVisits.map((visit) => <div className="ops-visit-brief" key={visit.id}><span><CalendarDays className="w-4 h-4" /></span><div><strong>{visit.title}</strong><small>{fmtDate(visit.date)} · {visit.time} · {visit.owner}</small></div></div>) : <p className="text-sm text-muted">No upcoming visits.</p>}<Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`${base}/visits`)}>Manage schedule</Button></CardContent></Card>
        <button className="ops-ai-card" onClick={() => navigate(`${base}/assistant`)}><span><Bot className="w-5 h-5" /></span><div><strong>Operations copilot</strong><small>Turn live workspace data into an action brief.</small></div><ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
    <OperationsCapabilityCards config={config} counts={{ discussions: discussions.length, checkpoints: checkpoints.length, library: library.length, team: team.length }} />
  </div>
}

function Portfolio({ config, work }: { config: OperationsConfig; work: ReturnType<typeof useLocalCollection<WorkItem>> }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', customer: '', location: '', owner: '', value: '', dueDate: '', lat: '', lng: '' })
  const filtered = work.items.filter((item) => `${item.title} ${item.customer} ${item.location} ${item.owner}`.toLowerCase().includes(query.toLowerCase()))
  const save = () => {
    if (!form.title.trim()) return
    work.add({ id: genId(), title: form.title.trim(), customer: form.customer.trim() || `Unassigned ${config.customer}`, location: form.location.trim() || `No ${config.location}`, status: 'Planning', progress: 5, value: Number(form.value) || 0, owner: form.owner.trim() || 'Unassigned', dueDate: form.dueDate || futureDate(30), lat: Number(form.lat) || 0, lng: Number(form.lng) || 0, createdAt: new Date().toISOString() })
    setOpen(false); setForm({ title: '', customer: '', location: '', owner: '', value: '', dueDate: '', lat: '', lng: '' })
  }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Portfolio control" title={capitalize(config.items)} action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add {config.item}</Button>} />
    <div className="ops-toolbar"><div><Search className="w-4 h-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.items}, ${config.customer}s or places`} /></div><span>{filtered.length} of {work.items.length}</span></div>
    <div className="ops-portfolio-grid">{filtered.map((item) => <Card key={item.id} className="ops-project-card"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><span className="ops-project-index">{item.title.slice(0, 2).toUpperCase()}</span><Badge variant={STATUS_VARIANT(item.status)} size="sm">{item.status}</Badge></div><h2>{item.title}</h2><p>{item.customer} · {item.location}</p><div className="ops-project-details"><span><small>Owner</small><strong>{item.owner}</strong></span><span><small>Due</small><strong>{fmtDate(item.dueDate)}</strong></span><span><small>{config.value}</small><strong>{money(item.value)}</strong></span></div><div className="ops-project-progress"><div><span>Progress</span><strong>{item.progress}%</strong></div><i><b style={{ width: `${item.progress}%` }} /></i></div><div className="ops-project-actions"><Button variant="outline" size="sm" onClick={() => work.update(item.id, { progress: Math.min(100, item.progress + 10), status: item.progress >= 90 ? 'Completed' : 'Active' })}><Check className="w-3.5 h-3.5" /> Advance</Button><Button variant="ghost" size="icon" aria-label={`Delete ${item.title}`} onClick={() => work.remove(item.id)}><Trash2 className="w-4 h-4" /></Button></div></CardContent></Card>)}</div>
    {!filtered.length && <div className="ops-empty"><ListChecks /><h2>No matching {config.items}</h2><p>Adjust the search or add a new {config.item}.</p></div>}
    <Modal open={open} onClose={() => setOpen(false)} title={`Add ${config.item}`} size="lg"><div className="space-y-4"><div><Label required>Name</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={`New ${config.item}`} /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>{capitalize(config.customer)}</Label><Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div><div><Label>Owner</Label><Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></div><div><Label>{capitalize(config.value)}</Label><Input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} /></div><div><Label>Target date</Label><Input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></div></div><div><Label>{capitalize(config.location)}</Label><LocationPicker latitude={form.lat} longitude={form.lng} onChange={(lat, lng, address) => setForm((current) => ({ ...current, lat, lng, location: address || current.location }))} onAddressChange={(location) => setForm((current) => ({ ...current, location }))} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.title.trim()}>Create {config.item}</Button></div></div></Modal>
  </div>
}

function Visits({ config, work, visits, discussions, meetings, team }: { config: OperationsConfig; work: WorkItem[]; visits: ReturnType<typeof useLocalCollection<Visit>>; discussions: ReturnType<typeof useLocalCollection<Discussion>>; meetings: ReturnType<typeof useLocalCollection<Meeting>>; team: TeamMember[] }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ workId: work[0]?.id ?? '', title: '', date: futureDate(1), time: '10:00', owner: '', notes: '' })
  const sorted = [...visits.items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const save = () => { if (!form.title.trim()) return; visits.add({ id: genId(), ...form, title: form.title.trim(), owner: form.owner.trim() || 'Unassigned', status: 'Scheduled' }); setOpen(false) }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Field coordination" title={`${capitalize(config.visit)} schedule`} action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Schedule</Button>} />
    <section className="ops-visit-timeline">{sorted.map((visit) => { const item = work.find((candidate) => candidate.id === visit.workId); return <article key={visit.id} className={visit.status === 'Completed' ? 'is-complete' : ''}><div className="ops-date-block"><strong>{new Date(`${visit.date}T00:00:00`).getDate()}</strong><span>{new Date(`${visit.date}T00:00:00`).toLocaleDateString([], { month: 'short' })}</span></div><div className="ops-timeline-line"><i /></div><div className="ops-visit-card"><div><span className="ops-visit-time">{visit.time} · {item?.location ?? config.location}</span><h2>{visit.title}</h2><p>{item?.title ?? `General ${config.visit}`} · {visit.owner}</p>{visit.notes && <small>{visit.notes}</small>}</div><div className="ops-visit-actions"><Select value={visit.status} onValueChange={(status) => visits.update(visit.id, { status: status as Visit['status'] })}><option>Scheduled</option><option>In progress</option><option>Completed</option><option>Cancelled</option></Select><Button variant="ghost" size="icon" onClick={() => visits.remove(visit.id)} aria-label="Delete visit"><X className="w-4 h-4" /></Button></div></div></article> })}</section>
    {!sorted.length && <div className="ops-empty"><CalendarDays /><h2>No {config.visit}s scheduled</h2><p>Add the next customer or field touchpoint.</p></div>}
    <CollaborationWorkspace embedded config={config} work={work} discussions={discussions} meetings={meetings} team={team} />
    <Modal open={open} onClose={() => setOpen(false)} title={`Schedule ${config.visit}`} size="md"><div className="space-y-4"><div><Label required>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div><Label>{capitalize(config.item)}</Label><Select value={form.workId} onValueChange={(workId) => setForm({ ...form, workId })}>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div><div className="grid grid-cols-2 gap-4"><div><Label>Date</Label><Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div><div><Label>Time</Label><Input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></div></div><div><Label>Owner</Label><Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></div><div><Label>Brief</Label><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Schedule</Button></div></div></Modal>
  </div>
}

function OperationsMap({ config, work }: { config: OperationsConfig; work: WorkItem[] }) {
  const mapNode = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const [selected, setSelected] = useState(work[0]?.id ?? '')
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [maximized, setMaximized] = useState(false)
  const located = work.filter((item) => item.lat && item.lng && (statusFilter === 'All' || item.status === statusFilter))
  const chosen = work.find((item) => item.id === selected)
  const statuses = [...new Set(work.map((item) => item.status))]
  useEffect(() => { if (!mapNode.current || map.current) return; const instance = L.map(mapNode.current).setView([20.5937, 78.9629], 5); const tiles = getTheme() === 'dark' ? 'dark_all' : 'light_all'; L.tileLayer(`https://{s}.basemaps.cartocdn.com/${tiles}/{z}/{x}/{y}{r}.png`, { attribution: '(c) OpenStreetMap', maxZoom: 19 }).addTo(instance); map.current = instance; return () => { instance.remove(); map.current = null } }, [])
  useEffect(() => { if (!map.current) return; layer.current?.remove(); const next = L.layerGroup().addTo(map.current); layer.current = next; located.forEach((item) => { const node = document.createElement('div'); node.className = 'ops-map-tooltip'; const strong = document.createElement('strong'); strong.textContent = item.title; const small = document.createElement('small'); small.textContent = `${item.status} · ${item.progress}%`; node.append(strong, small); const marker = L.circleMarker([item.lat, item.lng], { radius: selected === item.id ? 11 : 8, color: '#fff', weight: 3, fillColor: selected === item.id ? '#0F8F83' : '#2563EB', fillOpacity: 1 }).addTo(next).bindTooltip(node); marker.on('click', () => setSelected(item.id)) }); if (position) L.circleMarker([position.lat, position.lng], { radius: 7, color: '#fff', weight: 3, fillColor: '#D94F70', fillOpacity: 1 }).addTo(next).bindTooltip('Your location'); if (located.length) map.current.fitBounds(L.latLngBounds(located.map((item) => [item.lat, item.lng])), { padding: [50, 50], maxZoom: 12 }); return () => { next.remove() } }, [located, position, selected])
  useEffect(() => { const timer = window.setTimeout(() => map.current?.invalidateSize(), 260); return () => window.clearTimeout(timer) }, [detailsOpen, maximized])
  const locate = () => navigator.geolocation?.getCurrentPosition((result) => { const next = { lat: result.coords.latitude, lng: result.coords.longitude }; setPosition(next); map.current?.setView([next.lat, next.lng], 11) })
  const directions = () => { if (!chosen) return; window.open(`https://www.google.com/maps/dir/?api=1&destination=${chosen.lat},${chosen.lng}`, '_blank', 'noopener') }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Location intelligence" title={capitalize(config.mapNetworkLabel)} action={<Button variant="outline" onClick={locate}><Navigation className="w-4 h-4" /> Find me</Button>} />
    <section className="ops-map-summary"><div><MapPin /><span><strong>{located.length}</strong><small>mapped {config.mapPointLabel}s</small></span></div><div><span className="ops-map-dot is-active" /><span><strong>{work.filter((item) => !['Completed', 'Cancelled'].includes(item.status)).length}</strong><small>active locations</small></span></div><div><span className="ops-map-dot is-progress" /><span><strong>{work.length ? Math.round(work.reduce((sum, item) => sum + item.progress, 0) / work.length) : 0}%</strong><small>network progress</small></span></div><div className="ops-map-filters"><button className={statusFilter === 'All' ? 'is-active' : ''} onClick={() => setStatusFilter('All')}>All</button>{statuses.map((status) => <button key={status} className={statusFilter === status ? 'is-active' : ''} onClick={() => setStatusFilter(status)}>{status}</button>)}</div></section>
    <div className={`ops-map-layout${detailsOpen ? '' : ' is-panel-hidden'}${maximized ? ' is-expanded' : ''}`}><div className="ops-map-stage"><div ref={mapNode} className="ops-map-canvas" /><div className="ops-map-view-controls"><button onClick={() => setMaximized((value) => !value)}>{maximized ? 'Restore map' : 'Maximize map'}</button><button onClick={() => setDetailsOpen((value) => !value)}>{detailsOpen ? 'Hide details' : 'Show details'}</button></div><div className="ops-map-legend"><span><i className="is-work" /> {capitalize(config.mapPointLabel)}</span>{position && <span><i className="is-you" /> Your location</span>}</div></div><aside><span className="ops-map-count">{located.length} {config.mapPointLabel}{located.length === 1 ? '' : 's'} in view</span>{located.map((item) => <button key={item.id} className={selected === item.id ? 'is-active' : ''} onClick={() => { setSelected(item.id); map.current?.setView([item.lat, item.lng], 13) }}><MapPin className="w-4 h-4" /><span><strong>{item.title}</strong><small>{item.location} · {item.progress}% complete</small><i><b style={{ width: `${item.progress}%` }} /></i></span></button>)}{chosen && <div className="ops-map-selected"><span>Selected {config.mapPointLabel}</span><h3>{chosen.title}</h3><p>{chosen.customer} · {chosen.owner}</p><div><Badge variant={STATUS_VARIANT(chosen.status)} size="sm">{chosen.status}</Badge><strong>{money(chosen.value)}</strong></div><Button className="w-full" onClick={directions} disabled={!chosen.lat || !chosen.lng}><Navigation className="w-4 h-4" /> Directions to {config.mapPointLabel}</Button></div>}</aside></div>
  </div>
}

function OperationsAssistant({ config, work, visits }: { config: OperationsConfig; work: WorkItem[]; visits: Visit[] }) {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<AiChatTurn[]>([])
  const localBrief = () => { const avg = work.length ? Math.round(work.reduce((sum, item) => sum + item.progress, 0) / work.length) : 0; const lower = [...work].sort((a, b) => a.progress - b.progress)[0]; const upcoming = visits.filter((visit) => visit.status === 'Scheduled').length; return `${capitalize(config.items)} are ${avg}% complete on average. ${lower ? `${lower.title} needs the most attention at ${lower.progress}%.` : ''} ${upcoming} ${config.visit}${upcoming === 1 ? '' : 's'} are scheduled. Recommended next action: confirm ownership and due dates for the lowest-progress work.` }
  const ask = async (question = prompt) => { if (!question.trim()) return; setPrompt(question); setBusy(true); const context = `You are an operations copilot for ${config.title}. Domain: ${config.description}. Current data: ${JSON.stringify({ work, visits })}. Answer concisely and suggest concrete actions.\n\nQuestion: ${question}`; try { const response = await api.aiChat(context, history); const text = response.configured && response.text ? response.text : localBrief(); setAnswer(text); setHistory((current) => [...current, { role: 'user', content: question }, { role: 'assistant', content: text }]) } catch { setAnswer(localBrief()) } finally { setBusy(false) } }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Decision intelligence" title="Operations copilot" /><div className="ops-ai-layout"><section className="ops-ai-console"><div className="ops-ai-intro"><span><Bot className="w-6 h-6" /></span><div><h2>Ask from live workspace context</h2><p>The copilot uses your {config.items} and schedule. When cloud AI is unavailable, it returns a private on-device operational brief.</p></div></div><div className="ops-prompt-list">{config.aiPrompts.map((item) => <button key={item} onClick={() => void ask(item)}>{item}<ArrowRight className="w-4 h-4" /></button>)}</div>{answer && <div className="ops-ai-answer"><span>Brief</span><p>{answer}</p></div>}<div className="ops-ai-input"><Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={`Ask about risks, priorities or your next ${config.visit}...`} /><Button onClick={() => void ask()} disabled={!prompt.trim() || busy}>{busy ? 'Thinking...' : 'Generate brief'} <Sparkles className="w-4 h-4" /></Button></div></section><aside className="ops-ai-signals"><h3>Live context</h3><div><ListChecks /><span><strong>{work.length}</strong><small>{config.items}</small></span></div><div><CalendarDays /><span><strong>{visits.filter((visit) => visit.status === 'Scheduled').length}</strong><small>scheduled {config.visit}s</small></span></div><div><CircleAlert /><span><strong>{work.filter((item) => item.progress < 40).length}</strong><small>low-progress items</small></span></div><p>AI responses can be inaccurate. Verify important operational decisions.</p></aside></div></div>
}

function OperationsFiles({ config, work, files }: { config: OperationsConfig; work: WorkItem[]; files: ReturnType<typeof useLocalCollection<StoredFile>> }) {
  const input = useRef<HTMLInputElement>(null)
  const [workId, setWorkId] = useState(work[0]?.id ?? '')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null)
  const cloudEnabled = fileStorage.kind === 'supabase'

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = [...(event.target.files ?? [])]
    if (!selected.length) return
    setBusy(true)
    setNotice(null)
    const errors: string[] = []
    let uploaded = 0
    try {
      for (const file of selected) {
        const validationError = storageFileError(file)
        if (validationError) {
          errors.push(validationError)
          continue
        }
        try {
          const id = genId()
          await fileStorage.upload(id, file)
          files.add({ id, name: file.name, size: file.size, type: file.type || 'application/octet-stream', workId, uploadedAt: new Date().toISOString(), storage: fileStorage.kind })
          uploaded += 1
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed.'}`)
        }
      }
      const uploadedText = uploaded ? `${uploaded} file${uploaded === 1 ? '' : 's'} uploaded.` : ''
      setNotice({ text: [uploadedText, ...errors].filter(Boolean).join(' '), error: errors.length > 0 })
    } finally {
      event.target.value = ''
      setBusy(false)
    }
  }

  const download = async (file: StoredFile) => {
    setNotice(null)
    try {
      await fileStorageFor(file.storage).download(file.id, file.name)
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'The file could not be downloaded.', error: true })
    }
  }

  const remove = async (file: StoredFile) => {
    setNotice(null)
    try {
      await fileStorageFor(file.storage).remove(file.id)
      files.remove(file.id)
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'The file could not be deleted.', error: true })
    }
  }

  return <div className="operations-page">
    <OperationsHeader config={config} eyebrow="Knowledge and records" title="Workspace files" action={<><input ref={input} hidden type="file" multiple accept={STORAGE_FILE_ACCEPT} onChange={(event) => void upload(event)} /><Button onClick={() => input.current?.click()} disabled={busy}><Upload className="w-4 h-4" /> {busy ? 'Uploading...' : 'Upload files'}</Button></>} />
    <div className="ops-files-banner"><span><Cloud className="w-5 h-5" /></span><div><strong>{cloudEnabled ? 'Cloud storage enabled' : 'Private browser storage'}</strong><p>{cloudEnabled ? 'Files are stored in managed project media using short-lived signed upload and download links.' : 'Files stay private to this browser. Enable the Supabase provider to use managed cloud storage.'} Supported images, documents, spreadsheets, presentations, text and ZIP files can be up to 25 MB.</p></div></div>
    {notice && <div role={notice.error ? 'alert' : 'status'} className={notice.error ? 'mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600' : 'mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700'}>{notice.text}</div>}
    <div className="ops-file-filter"><Label>Attach uploads to</Label><Select value={workId} onValueChange={setWorkId}><option value="">General workspace</option>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div>
    <Card><CardContent className="p-0"><div className="ops-file-table ops-file-head"><span>Name</span><span>{capitalize(config.item)}</span><span>Size</span><span>Uploaded</span><span /></div>{files.items.map((file) => <div className="ops-file-table" key={file.id}><span className="ops-file-name"><i><FileText className="w-4 h-4" /></i><span><strong>{file.name}</strong><small className="block text-[10px] text-muted">{file.storage === 'supabase' ? 'Cloud' : 'This browser'}</small></span></span><span>{work.find((item) => item.id === file.workId)?.title ?? 'General workspace'}</span><span>{formatBytes(file.size)}</span><span>{fmtDate(file.uploadedAt)}</span><span className="ops-file-actions"><Button variant="ghost" size="icon" onClick={() => void download(file)} aria-label={`Download ${file.name}`}><Download className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => void remove(file)} aria-label={`Delete ${file.name}`}><Trash2 className="w-4 h-4" /></Button></span></div>)}{!files.items.length && <div className="ops-empty"><FolderOpen /><h2>No files yet</h2><p>Upload briefs, records, contracts, images or supporting documents.</p></div>}</CardContent></Card>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function formatBytes(value: number) { if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; return `${(value / (1024 * 1024)).toFixed(1)} MB` }
