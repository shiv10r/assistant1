import { useEffect, useRef, useState } from 'react'
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
import LocationPicker from '../../platform/maps'
import { fileStorage } from './fileStorage'
import { operationsConfig, type OperationsConfig } from './config'
import { getTheme } from '../../theme'
import './operations.css'

type View = 'overview' | 'portfolio' | 'visits' | 'map' | 'attendance' | 'assistant' | 'files'
type WorkItem = { id: string; title: string; customer: string; location: string; status: string; progress: number; value: number; owner: string; dueDate: string; lat: number; lng: number; createdAt: string }
type Visit = { id: string; workId: string; title: string; date: string; time: string; owner: string; status: 'Scheduled' | 'In progress' | 'Completed' | 'Cancelled'; notes: string }
type StoredFile = { id: string; name: string; size: number; type: string; workId: string; uploadedAt: string; storage: 'browser' }

const VIEWS: View[] = ['overview', 'portfolio', 'visits', 'map', 'attendance', 'assistant', 'files']
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
  const workers: AttendanceWorker[] = config.team.map((person, index) => ({ id: `${config.id}-person-${index + 1}`, ...person, status: 'active' }))

  if (view === 'attendance') return <AttendanceModule collection={`${config.id}:operations-team`} seed={workers} backTo={`/${config.id}/operations/overview`} title={`${capitalize(config.people)} attendance`} sub={`Presence, hours, leave and emergency coordination for your ${config.people}.`} />
  if (view === 'portfolio') return <Portfolio config={config} work={work} />
  if (view === 'visits') return <Visits config={config} work={work.items} visits={visits} />
  if (view === 'map') return <OperationsMap config={config} work={work.items} />
  if (view === 'assistant') return <OperationsAssistant config={config} work={work.items} visits={visits.items} />
  if (view === 'files') return <OperationsFiles config={config} work={work.items} files={files} />
  return <Overview config={config} work={work.items} visits={visits.items} files={files.items} />
}

function OperationsHeader({ config, eyebrow, title, action }: { config: OperationsConfig; eyebrow: string; title: string; action?: React.ReactNode }) {
  return <header className="ops-page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{config.description}</p></div>{action}</header>
}

function Overview({ config, work, visits, files }: { config: OperationsConfig; work: WorkItem[]; visits: Visit[]; files: StoredFile[] }) {
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
        <AdvancedPanel title="Delivery velocity" subtitle={`Progress by ${config.item}`} bars={bars} compare={[{ label: 'Portfolio progress', value: `${avgProgress}%` }, { label: `Scheduled ${config.visit}s`, value: String(dueVisits) }, { label: 'Knowledge files', value: String(files.length) }]} />
      </div>
      <div className="ops-side-column">
        <AdvancedPanel title="Portfolio mix" subtitle="Current work by status" donut={donut} />
        <Card><CardHeader><CardTitle className="text-sm">Next on the ground</CardTitle></CardHeader><CardContent className="space-y-3">{nextVisits.length ? nextVisits.map((visit) => <div className="ops-visit-brief" key={visit.id}><span><CalendarDays className="w-4 h-4" /></span><div><strong>{visit.title}</strong><small>{fmtDate(visit.date)} · {visit.time} · {visit.owner}</small></div></div>) : <p className="text-sm text-muted">No upcoming visits.</p>}<Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`${base}/visits`)}>Manage schedule</Button></CardContent></Card>
        <button className="ops-ai-card" onClick={() => navigate(`${base}/assistant`)}><span><Bot className="w-5 h-5" /></span><div><strong>Operations copilot</strong><small>Turn live workspace data into an action brief.</small></div><ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
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

function Visits({ config, work, visits }: { config: OperationsConfig; work: WorkItem[]; visits: ReturnType<typeof useLocalCollection<Visit>> }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ workId: work[0]?.id ?? '', title: '', date: futureDate(1), time: '10:00', owner: '', notes: '' })
  const sorted = [...visits.items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const save = () => { if (!form.title.trim()) return; visits.add({ id: genId(), ...form, title: form.title.trim(), owner: form.owner.trim() || 'Unassigned', status: 'Scheduled' }); setOpen(false) }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Field coordination" title={`${capitalize(config.visit)} schedule`} action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Schedule</Button>} />
    <section className="ops-visit-timeline">{sorted.map((visit) => { const item = work.find((candidate) => candidate.id === visit.workId); return <article key={visit.id} className={visit.status === 'Completed' ? 'is-complete' : ''}><div className="ops-date-block"><strong>{new Date(`${visit.date}T00:00:00`).getDate()}</strong><span>{new Date(`${visit.date}T00:00:00`).toLocaleDateString([], { month: 'short' })}</span></div><div className="ops-timeline-line"><i /></div><div className="ops-visit-card"><div><span className="ops-visit-time">{visit.time} · {item?.location ?? config.location}</span><h2>{visit.title}</h2><p>{item?.title ?? `General ${config.visit}`} · {visit.owner}</p>{visit.notes && <small>{visit.notes}</small>}</div><div className="ops-visit-actions"><Select value={visit.status} onValueChange={(status) => visits.update(visit.id, { status: status as Visit['status'] })}><option>Scheduled</option><option>In progress</option><option>Completed</option><option>Cancelled</option></Select><Button variant="ghost" size="icon" onClick={() => visits.remove(visit.id)} aria-label="Delete visit"><X className="w-4 h-4" /></Button></div></div></article> })}</section>
    {!sorted.length && <div className="ops-empty"><CalendarDays /><h2>No {config.visit}s scheduled</h2><p>Add the next customer or field touchpoint.</p></div>}
    <Modal open={open} onClose={() => setOpen(false)} title={`Schedule ${config.visit}`} size="md"><div className="space-y-4"><div><Label required>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div><Label>{capitalize(config.item)}</Label><Select value={form.workId} onValueChange={(workId) => setForm({ ...form, workId })}>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div><div className="grid grid-cols-2 gap-4"><div><Label>Date</Label><Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div><div><Label>Time</Label><Input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></div></div><div><Label>Owner</Label><Input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} /></div><div><Label>Brief</Label><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Schedule</Button></div></div></Modal>
  </div>
}

function OperationsMap({ config, work }: { config: OperationsConfig; work: WorkItem[] }) {
  const mapNode = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const [selected, setSelected] = useState(work[0]?.id ?? '')
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const located = work.filter((item) => item.lat && item.lng)
  const chosen = work.find((item) => item.id === selected)
  useEffect(() => { if (!mapNode.current || map.current) return; const instance = L.map(mapNode.current).setView([20.5937, 78.9629], 5); const tiles = getTheme() === 'dark' ? 'dark_all' : 'light_all'; L.tileLayer(`https://{s}.basemaps.cartocdn.com/${tiles}/{z}/{x}/{y}{r}.png`, { attribution: '(c) OpenStreetMap', maxZoom: 19 }).addTo(instance); map.current = instance; return () => { instance.remove(); map.current = null } }, [])
  useEffect(() => { if (!map.current) return; layer.current?.remove(); const next = L.layerGroup().addTo(map.current); layer.current = next; located.forEach((item) => { const node = document.createElement('div'); node.className = 'ops-map-tooltip'; const strong = document.createElement('strong'); strong.textContent = item.title; const small = document.createElement('small'); small.textContent = `${item.status} · ${item.progress}%`; node.append(strong, small); const marker = L.circleMarker([item.lat, item.lng], { radius: selected === item.id ? 11 : 8, color: '#fff', weight: 3, fillColor: selected === item.id ? '#0F8F83' : '#2563EB', fillOpacity: 1 }).addTo(next).bindTooltip(node); marker.on('click', () => setSelected(item.id)) }); if (position) L.circleMarker([position.lat, position.lng], { radius: 7, color: '#fff', weight: 3, fillColor: '#D94F70', fillOpacity: 1 }).addTo(next).bindTooltip('Your location'); if (located.length) map.current.fitBounds(L.latLngBounds(located.map((item) => [item.lat, item.lng])), { padding: [50, 50], maxZoom: 12 }); return () => { next.remove() } }, [located, position, selected])
  const locate = () => navigator.geolocation?.getCurrentPosition((result) => { const next = { lat: result.coords.latitude, lng: result.coords.longitude }; setPosition(next); map.current?.setView([next.lat, next.lng], 11) })
  const directions = () => { if (!chosen) return; window.open(`https://www.google.com/maps/dir/?api=1&destination=${chosen.lat},${chosen.lng}`, '_blank', 'noopener') }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Location intelligence" title={`${capitalize(config.location)} network`} action={<Button variant="outline" onClick={locate}><Navigation className="w-4 h-4" /> Find me</Button>} /><div className="ops-map-layout"><div ref={mapNode} className="ops-map-canvas" /><aside><span className="ops-map-count">{located.length} mapped locations</span>{located.map((item) => <button key={item.id} className={selected === item.id ? 'is-active' : ''} onClick={() => { setSelected(item.id); map.current?.setView([item.lat, item.lng], 13) }}><MapPin className="w-4 h-4" /><span><strong>{item.title}</strong><small>{item.location} · {item.progress}% complete</small></span></button>)}{chosen && <Button className="w-full mt-3" onClick={directions}><Navigation className="w-4 h-4" /> Open directions</Button>}</aside></div></div>
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
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => { const selected = [...(event.target.files ?? [])]; if (!selected.length) return; setBusy(true); for (const file of selected) { const id = genId(); await fileStorage.upload(id, file); files.add({ id, name: file.name, size: file.size, type: file.type || 'application/octet-stream', workId, uploadedAt: new Date().toISOString(), storage: 'browser' }) } event.target.value = ''; setBusy(false) }
  const remove = async (file: StoredFile) => { await fileStorage.remove(file.id).catch(() => undefined); files.remove(file.id) }
  return <div className="operations-page"><OperationsHeader config={config} eyebrow="Knowledge and records" title="Workspace files" action={<><input ref={input} hidden type="file" multiple onChange={(event) => void upload(event)} /><Button onClick={() => input.current?.click()} disabled={busy}><Upload className="w-4 h-4" /> {busy ? 'Uploading...' : 'Upload files'}</Button></>} /><div className="ops-files-banner"><span><Cloud className="w-5 h-5" /></span><div><strong>Storage-ready architecture</strong><p>Files are currently private to this browser. The provider boundary is ready for managed cloud storage without changing this workspace.</p></div></div><div className="ops-file-filter"><Label>Attach uploads to</Label><Select value={workId} onValueChange={setWorkId}><option value="">General workspace</option>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div><Card><CardContent className="p-0"><div className="ops-file-table ops-file-head"><span>Name</span><span>{capitalize(config.item)}</span><span>Size</span><span>Uploaded</span><span /></div>{files.items.map((file) => <div className="ops-file-table" key={file.id}><span className="ops-file-name"><i><FileText className="w-4 h-4" /></i><strong>{file.name}</strong></span><span>{work.find((item) => item.id === file.workId)?.title ?? 'General workspace'}</span><span>{formatBytes(file.size)}</span><span>{fmtDate(file.uploadedAt)}</span><span className="ops-file-actions"><Button variant="ghost" size="icon" onClick={() => void fileStorage.download(file.id, file.name)} aria-label="Download"><Download className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => void remove(file)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button></span></div>)}{!files.items.length && <div className="ops-empty"><FolderOpen /><h2>No files yet</h2><p>Upload briefs, records, contracts, images or supporting documents.</p></div>}</CardContent></Card></div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function formatBytes(value: number) { if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; return `${(value / (1024 * 1024)).toFixed(1)} MB` }
