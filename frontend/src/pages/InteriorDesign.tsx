import { useEffect, useState } from 'react'
import { api } from '../api'
import type {
  TimeEntry, Room, MoodBoardItem, VendorCatalogueItem, RoomScene,
  DesignRevision, ChecklistTemplate, InspectionRecord, NcrRecord,
  SubcontractorWorkOrder, QrInventoryItem, AiCostPrediction, AiDailySummary,
  LightingLayout, FinishSwatch, QuotationRoom, DesignerPayout, ClientProject,
  RoomBoqItem, InstallationTask, RoomProcurementOrder, ProjectTimelineStage,
} from '../api'
import { Card, CardContent, Button, Badge, Empty, Tabs, TabsList, TabsTrigger, TabsContent, Input, Textarea, Select } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import {
  Clock, LayoutGrid, Palette, Package, Box, FileImage, ClipboardCheck,
  Users, ScanLine, Brain, FileText, Lightbulb, Receipt, Wallet,
  UserPlus, FileBox, ChartGantt, ShoppingCart, Plus, Trash2,
  Save, Download, RefreshCw, Camera,
} from 'lucide-react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; alt?: string; ar?: boolean }
    }
  }
}

type TabId = 'time' | 'rooms' | 'moodboard' | 'catalogue' | 'scenes' | 'revisions' | 'quality' | 'subcontractor'
  | 'inventory' | 'ai-cost' | 'ai-summary' | 'lighting' | 'finishes' | 'quotes' | 'payouts'
  | 'client' | 'boq' | 'install' | 'procurement' | 'timeline' | 'ar'

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'time', label: 'Time Tracking', icon: <Clock className="w-4 h-4" />, desc: 'Worker/staff hours logged per project/room.' },
  { id: 'rooms', label: 'Rooms', icon: <LayoutGrid className="w-4 h-4" />, desc: 'Rooms with area, dimensions, status.' },
  { id: 'moodboard', label: 'Mood Board', icon: <Palette className="w-4 h-4" />, desc: 'Product images pinned per room, auto BOQ.' },
  { id: 'catalogue', label: 'Catalogue', icon: <Package className="w-4 h-4" />, desc: 'Vendor catalogue + 3D assets (GLB/USDZ).' },
  { id: 'scenes', label: '3D Scene', icon: <Box className="w-4 h-4" />, desc: '3D room scenes saved with versions.' },
  { id: 'revisions', label: 'Revisions', icon: <FileImage className="w-4 h-4" />, desc: 'Versioned design boards + client comments.' },
  { id: 'quality', label: 'Quality/Safety', icon: <ClipboardCheck className="w-4 h-4" />, desc: 'Checklist templates, inspections, NCRs.' },
  { id: 'subcontractor', label: 'Subcontractors', icon: <Users className="w-4 h-4" />, desc: 'Work orders, measurement sheets.' },
  { id: 'inventory', label: 'QR Inventory', icon: <ScanLine className="w-4 h-4" />, desc: 'QR-coded store-room items + scan ledger.' },
  { id: 'ai-cost', label: 'AI Cost Predict', icon: <Brain className="w-4 h-4" />, desc: 'Projected cost + variance vs actual.' },
  { id: 'ai-summary', label: 'AI Daily Summary', icon: <FileText className="w-4 h-4" />, desc: 'End-of-day AI digest with risks & actions.' },
  { id: 'lighting', label: 'Lighting Layout', icon: <Lightbulb className="w-4 h-4" />, desc: 'Fixture plan with load calculation.' },
  { id: 'finishes', label: 'Finish Library', icon: <Palette className="w-4 h-4" />, desc: 'Fabrics, tiles, laminates & specs.' },
  { id: 'quotes', label: 'Quotations', icon: <Receipt className="w-4 h-4" />, desc: 'Room-wise quotes + branded PDF.' },
  { id: 'payouts', label: 'Designer Payout', icon: <Wallet className="w-4 h-4" />, desc: 'Commission per stage/room.' },
  { id: 'client', label: 'Client Portal', icon: <UserPlus className="w-4 h-4" />, desc: 'Client project shares + selections.' },
  { id: 'boq', label: 'Room BOQ', icon: <FileBox className="w-4 h-4" />, desc: 'Per-room bill of quantities + PDF.' },
  { id: 'install', label: 'Install Gantt', icon: <ChartGantt className="w-4 h-4" />, desc: 'Trade scheduling with dependencies.' },
  { id: 'procurement', label: 'Procurement', icon: <ShoppingCart className="w-4 h-4" />, desc: 'POs grouped by room + delivery.' },
  { id: 'timeline', label: 'Project Timeline', icon: <FileImage className="w-4 h-4" />, desc: 'Design -> procurement -> install -> handoff.' },
  { id: 'ar', label: 'AR Measure', icon: <ScanLine className="w-4 h-4" />, desc: 'LiDAR room scan -> plan + measurements.' },
]

const PROJECT_IDS: number[] = Array.from({ length: 20 }, (_, i) => i + 1)

function useRows<T>(loader: () => Promise<T[]>, deps: unknown[] = []) {
  const [rows, setRows] = useState<T[]>([])
  const load = () => { loader().then(setRows).catch(() => setRows([])) }
  useEffect(() => { load() } /* eslint-disable-line react-hooks/exhaustive-deps */, deps)
  return { rows, setRows, refresh: load }
}

function useSearch<T>(rows: T[], text: (r: T) => string) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const filtered = query ? rows.filter((r) => text(r).toLowerCase().includes(query)) : rows
  const input = (
    <input className="h-9 w-full rounded-lg border bg-surface px-3 text-sm" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
  )
  return { q, setQ, filtered, input, emptyMsg: (fallback: string) => (rows.length === 0 ? fallback : `No matches for "${q}"`) }
}

function Section({ title, subtitle, form, children }: { title?: string; subtitle?: string; form: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-1 h-fit">
        <CardContent className="p-4 space-y-3">
          {title && <><h3 className="font-semibold">{title}</h3><p className="text-xs text-text/50">{subtitle}</p></>}
          {form}
        </CardContent>
      </Card>
      <div className="xl:col-span-2 space-y-2">{children}</div>
    </div>
  )
}

function RowItem({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Card className="mb-0">
      <CardContent className="p-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">{children}</div>
        <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
      </CardContent>
    </Card>
  )
}

function ProjectPicker({ projectId, setProjectId }: { projectId: string; setProjectId: (v: string) => void }) {
  return (
    <select className="h-9 w-full rounded-lg border bg-surface px-3 text-sm mb-3" value={projectId}
      onChange={(e) => setProjectId(e.target.value)}>
      {PROJECT_IDS.map((n) => <option key={n} value={n}>Project #{n}</option>)}
    </select>
  )
}

// ---- Time Tracking ----
function TimeTracking() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<TimeEntry>(() => api.modules.timeEntries(Number(pid)), [pid])
  const search = useSearch(rows, (e) => `${e.workerName} ${e.notes ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ workerName: '', hours: '', notes: '' })
  const save = async () => {
    if (!f.workerName || !f.hours) return toast({ title: 'Name & hours required', variant: 'error' })
    try {
      const saved = await api.modules.saveTimeEntry({ projectId: Number(pid), workerName: f.workerName, hours: Number(f.hours), notes: f.notes })
      setRows(prev => [saved, ...prev]); setF({ workerName: '', hours: '', notes: '' })
      toast({ title: 'Time entry saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Record worker hours against a project/room."
        form={<>
          <Input placeholder="Worker name" value={f.workerName} onChange={(e) => setF({ ...f, workerName: e.target.value })} />
          <Input type="number" placeholder="Hours" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} />
          <Input placeholder="Notes (room ref)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save</Button>
        </>}>
        <Button size="sm" variant="outline" onClick={() => api.modules.timeSummary(Number(pid)).then((d) => {
          toast({ title: `${d.totalManHoursLabel} · ${d.totalWagesLabel}` })
        }).catch((e) => toast({ title: String(e), variant: 'error' }))}><RefreshCw className="w-4 h-4" /> Summary</Button>
        {search.input}
        {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No time entries')} /> : search.filtered.map((e) => (
          <RowItem key={e.id} right={<Button variant="ghost" size="sm" onClick={() => api.modules.deleteTimeEntry(e.id).then(() => setRows(prev => prev.filter(x => x.id !== e.id))).catch((er) => toast({ title: String(er), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>}>
            <p className="font-semibold">{e.workerName}</p>
            <p className="text-xs text-text/50">{e.hours} hrs · {e.date.slice(0, 10)} {e.roomId && `· ${e.roomId}`}</p>
          </RowItem>
        ))}
      </Section>
    </div>
  )
}

// ---- Rooms ----
function RoomsPage() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<Room>(() => api.modules.rooms(Number(pid)), [pid])
  const search = useSearch(rows, (r) => `${r.name} ${r.dimensions ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', areaSqFt: '', dimensions: '', status: 'In Progress' })
  const save = async () => {
    if (!f.name) return toast({ title: 'Room name required', variant: 'error' })
    try {
      const saved = await api.modules.saveRoom({ projectId: Number(pid), name: f.name, areaSqFt: f.areaSqFt ? Number(f.areaSqFt) : undefined, dimensions: f.dimensions, status: f.status })
      setRows(prev => [saved, ...prev]); setF({ name: '', areaSqFt: '', dimensions: '', status: 'In Progress' })
      toast({ title: 'Room added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Define rooms for per-room cost tracking."
        form={<>
          <Input placeholder="Room name (e.g. Master Bedroom)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input type="number" placeholder="Area (sqft)" value={f.areaSqFt} onChange={(e) => setF({ ...f, areaSqFt: e.target.value })} />
          <Input placeholder="Dimensions (3.4mx4.2m)" value={f.dimensions} onChange={(e) => setF({ ...f, dimensions: e.target.value })} />
          <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            {['Not Started', 'In Progress', 'Completed', 'On Hold'].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Add room</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No rooms')} /> : search.filtered.map((r) => (
        <RowItem key={r.id} right={<>
          <Badge>{r.areaSqFt ? `${r.areaSqFt.toFixed(0)}` : '—'}</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteRoom(r.id).then(() => setRows(prev => prev.filter(x => x.id !== r.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </> }>
            <p className="font-semibold">{r.name}</p>
            <p className="text-xs text-text/50">{r.areaSqFt ? `${r.areaSqFt.toFixed(2)} sqft · ` : ''}{r.dimensions || '—'} · <Badge variant={r.status === 'completed' ? 'success' : 'default'}>{r.status}</Badge></p>
          </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- Mood Board ----
function MoodBoard() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<MoodBoardItem>(() => api.modules.moodBoard(Number(pid)), [pid])
  const search = useSearch(rows, (i) => `${i.title} ${i.category ?? ''} ${i.vendorName ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ title: '', category: '', price: '', imageUrl: '', vendorName: '', notes: '' })
  const save = async () => {
    if (!f.title) return toast({ title: 'Title required', variant: 'error' })
    try {
      const saved = await api.modules.saveMoodItem({ projectId: Number(pid), title: f.title, category: f.category, price: f.price ? Number(f.price) : 0, imageUrl: f.imageUrl, vendorName: f.vendorName, notes: f.notes })
      setRows(prev => [saved, ...prev]); setF({ title: '', category: '', price: '', imageUrl: '', vendorName: '', notes: '' })
      toast({ title: 'Item added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Pin product images; auto-generates a spec sheet + BOQ."
        form={<>
          <Input placeholder="Item title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Input placeholder="Category (e.g. Lighting, Flooring)" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          <Input type="number" placeholder="Price (₹)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          <Input placeholder="Image URL" value={f.imageUrl} onChange={(e) => setF({ ...f, imageUrl: e.target.value })} />
          <Input placeholder="Vendor" value={f.vendorName} onChange={(e) => setF({ ...f, vendorName: e.target.value })} />
          <Textarea rows={2} placeholder="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Pin item</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No items yet')} /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {search.filtered.map((i) => (
            <Card key={i.id} className="mb-0 p-0 overflow-hidden">
              <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
                {i.imageUrl
                  ? <img src={i.imageUrl} alt={i.title} className="object-contain w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  : <FileImage className="w-8 h-8 text-text/30" />}
              </div>
              <CardContent className="p-3">
                <p className="font-semibold text-sm truncate">{i.title}</p>
                <p className="text-xs text-text/50">{i.category || 'Design Item'}</p>
                {i.price ? <p className="text-xs font-semibold mt-1">₹{i.price.toLocaleString('en-IN')}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </Section>
    </div>
  )
}

// ---- Vendor Catalogue ----
function Catalogue() {
  const { rows, setRows } = useRows<VendorCatalogueItem>(() => api.modules.catalogue())
  const search = useSearch(rows, (i) => `${i.name} ${i.category ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', category: '', price: '', modelUrl: '', modelFormat: 'glb' as 'glb' | 'usdz' })
  const save = async () => {
    if (!f.name) return toast({ title: 'Name required', variant: 'error' })
    try {
      const saved = await api.modules.saveCatalogueItem({ name: f.name, category: f.category, price: f.price ? Number(f.price) : 0, modelUrl: f.modelUrl || undefined, modelFormat: f.modelFormat })
      setRows(prev => [saved, ...prev]); setF({ name: '', category: '', price: '', modelUrl: '', modelFormat: 'glb' })
      toast({ title: 'Catalogue item saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <Section subtitle="Add products with optional 3D models (GLB/USDZ)."
      form={<>
        <Input placeholder="Item name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
        <Input type="number" placeholder="Price (₹)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <Input placeholder="3D model URL (.glb/.usdz)" value={f.modelUrl} onChange={(e) => setF({ ...f, modelUrl: e.target.value })} />
        <Select value={f.modelFormat} onChange={(e) => setF({ ...f, modelFormat: e.target.value as 'glb' | 'usdz' })}>
          <option value="glb">GLB (model-viewer)</option><option value="usdz">USDZ (iOS AR)</option>
        </Select>
        <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save</Button>
      </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No catalogue items')} /> : search.filtered.map((i) => (
        <RowItem key={i.id} right={<>
          {i.modelUrl && i.modelFormat === 'glb' && (
            <model-viewer src={i.modelUrl} ar alt="3D" style={{ width: 60, height: 60 }} />
          )}
          {i.modelUrl && i.modelFormat === 'usdz' && <Badge>USDZ</Badge>}
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteCatalogueItem(i.id).then(() => setRows(prev => prev.filter(x => x.id !== i.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </> }>
          <p className="font-semibold">{i.name}</p>
          <p className="text-xs text-text/50">{i.category || '—'} · {i.price ? `₹${i.price.toLocaleString('en-IN')}` : '—'} {i.modelUrl ? '· 3D' : ''}</p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---- 3D Scene Planner ----
function ScenePlanner() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<RoomScene>(() => api.modules.scenes(Number(pid)), [pid])
  const search = useSearch(rows, (s) => `${s.name} ${s.roomRef ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', roomRef: '', sceneJson: '' })
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-2">3D Scene Planner</h3>
          <p className="text-xs text-text/50 mb-3">Save scene JSON from your Three.js editor. Each save auto-increments the version.</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input placeholder="Scene name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <Input placeholder="Room ref (matches a Room)" value={f.roomRef} onChange={(e) => setF({ ...f, roomRef: e.target.value })} />
              <Textarea rows={6} placeholder="Scene JSON (Three.js scene graph)" value={f.sceneJson} onChange={(e) => setF({ ...f, sceneJson: e.target.value })} />
              <Button onClick={() => {
                if (!f.name) return toast({ title: 'Scene name required', variant: 'error' })
                api.modules.saveScene({ projectId: Number(pid), name: f.name, roomRef: f.roomRef || undefined, sceneJson: f.sceneJson })
                  .then((s) => { setRows(prev => [s, ...prev]); setF({ name: '', roomRef: '', sceneJson: '' }); toast({ title: `Saved ${s.versionLabel}` }) })
                  .catch((e) => toast({ title: String(e), variant: 'error' }))
              }}><Save className="w-4 h-4" /> Save version</Button>
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Saved versions ({rows.length})</p>
              {search.input}
              {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No saved scenes')} /> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {search.filtered.map((s) => (
                  <RowItem key={s.id} right={<Badge>{s.versionLabel}</Badge>}>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-text/50">{s.roomRef || '—'} · {s.createdAt.slice(0, 10)}</p>
                  </RowItem>
                ))}
              </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Design Revisions ----
function RevisionsPage() {
  const [pid, setPid] = useState('1')
  const { rows: revisions, setRows } = useRows<DesignRevision>(() => api.modules.revisions(Number(pid)), [pid])
  const search = useSearch(revisions, (r) => r.title)
  const { toast } = useToast()
  const [f, setF] = useState({ title: '', fileUrl: '' })
  const save = async () => {
    if (!f.title) return toast({ title: 'Title required', variant: 'error' })
    try {
      const saved = await api.modules.saveRevision({ projectId: Number(pid), title: f.title, fileUrl: f.fileUrl })
      setRows(prev => [saved, ...prev]); setF({ title: '', fileUrl: '' })
      toast({ title: `Revision ${saved.version} saved` })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Versioned design boards with client comment pins."
        form={<>
          <Input placeholder="Revision title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Input placeholder="File / render URL" value={f.fileUrl} onChange={(e) => setF({ ...f, fileUrl: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save revision</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No revisions')} /> : search.filtered.map((r) => (
        <RowItem key={r.id} right={<>
          <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'In Review' ? 'warning' : r.status === 'Rejected' ? 'danger' : 'default'}>{r.status}</Badge>
          <Badge variant="outline">v{r.version}</Badge>
        </> }>
          <p className="font-semibold">{r.title}</p>
          <p className="text-xs text-text/50">{r.createdAt.slice(0, 10)}</p>
        </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- Safety / Quality ----
function QualityPage() {
  const [pid, setPid] = useState('1')
  const [tab, setTab] = useState<'inspections' | 'ncrs' | 'templates'>('inspections')
  const templates = useRows<ChecklistTemplate>(() => api.modules.checklistTemplates())
  const { rows: inspections, setRows: setInspections } = useRows<InspectionRecord>(() => api.modules.inspections(Number(pid)), [pid])
  const { rows: ncrs, setRows: setNcrs } = useRows<NcrRecord>(() => api.modules.ncrs(Number(pid)), [pid])
  const searchInsp = useSearch(inspections, (i) => `${i.templateName} ${i.inspectorName ?? ''}`)
  const searchNcr = useSearch(ncrs, (n) => `${n.title} ${n.severity} ${n.status}`)
  const searchTpl = useSearch(templates.rows, (t) => `${t.name} ${t.category ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ templateName: '', inspector: '', notes: '', isPassed: true, photos: [] as string[] })

  const uploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target!.result as string
      setF(prev => ({ ...prev, photos: [...prev.photos, dataUrl] }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as never)}>
        <TabsList><TabsTrigger value="inspections">Inspections</TabsTrigger><TabsTrigger value="ncrs">NCRs</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger></TabsList>
        <TabsContent value="inspections">
          <Section subtitle="Run a checklist on site with photo evidence." form={<>
            <Input placeholder="Template name" value={f.templateName} onChange={(e) => setF({ ...f, templateName: e.target.value })} />
            <Input placeholder="Inspector" value={f.inspector} onChange={(e) => setF({ ...f, inspector: e.target.value })} />
            <Select value={f.isPassed ? 'pass' : 'fail'} onChange={(e) => setF({ ...f, isPassed: e.target.value === 'pass' })}>
              <option value="pass">PASS</option><option value="fail">FAIL</option>
            </Select>
            <Textarea rows={2} placeholder="Findings" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent">
              <Camera className="w-4 h-4" />
              <span className="text-sm">Attach photo evidence</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={uploadPhoto} />
            </label>
            {f.photos.length > 0 && <div className="flex gap-2 overflow-x-auto">{f.photos.map((p, i) => <img key={i} src={p} className="w-16 h-16 object-cover rounded border" />)}</div>}
            <Button className="w-full mt-1" onClick={() => {
              if (!f.templateName) return toast({ title: 'Template required', variant: 'error' })
              api.modules.saveInspection({ projectId: Number(pid), templateName: f.templateName, inspectorName: f.inspector, notes: f.notes, isPassed: f.isPassed, photosJson: f.photos.length > 0 ? JSON.stringify(f.photos) : undefined })
                .then((i) => { setInspections(prev => [i, ...prev]); setF({ templateName: '', inspector: '', notes: '', isPassed: true, photos: [] }); toast({ title: 'Inspection saved' }) }).catch((e) => toast({ title: String(e), variant: 'error' }))
            }}><Plus className="w-4 h-4" /> Save</Button>
          </>}>
          {searchInsp.input}
          {searchInsp.filtered.length === 0 ? <Empty title={searchInsp.emptyMsg('No inspections')} /> : searchInsp.filtered.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between"><p className="font-semibold">{i.templateName}</p>
                  <Badge variant={i.isPassed ? 'success' : 'danger'}>{i.isPassed ? 'PASS' : 'FAIL'}</Badge></div>
                <p className="text-xs text-text/50">{i.inspectorName} · {i.date.slice(0, 10)}{i.notes && <> · <span className="ml-1">{i.notes}</span></>}</p>
                {i.photosJson && (() => { try { const photos = JSON.parse(i.photosJson); return photos.length > 0 && <div className="flex gap-2">{photos.map((p: string, idx: number) => <img key={idx} src={p} className="w-20 h-20 object-cover rounded border" />)}</div> } catch { return null } })()}
              </CardContent>
            </Card>
          ))}
          </Section>
        </TabsContent>
        <TabsContent value="ncrs">
          <Section subtitle="Non-conformance report." form={<>
            <Input placeholder="Issue title" onChange={(e) => setF({ ...f, templateName: e.target.value })} />
            <Button className="w-full mt-1" onClick={() => {
              api.modules.saveNcr({ projectId: Number(pid), title: 'New NCR', severity: 'Medium' })
                .then((n) => { setNcrs(prev => [n, ...prev]); toast({ title: 'NCR raised' }) }).catch((e) => toast({ title: String(e), variant: 'error' }))
            }}><Plus className="w-4 h-4" /> Add NCR</Button>
          </>}>
          {searchNcr.input}
          {searchNcr.filtered.length === 0 ? <Empty title={searchNcr.emptyMsg('No NCRs')} /> : searchNcr.filtered.map((n) => (
            <RowItem key={n.id} right={<Badge variant={n.status === 'Closed' ? 'success' : 'warning'}>{n.status}</Badge>}>
              <p className="font-semibold">{n.title}</p>
              <p className="text-xs text-text/50">{n.severity} · {n.createdAt.slice(0, 10)}</p>
            </RowItem>
          ))}
          </Section>
        </TabsContent>
        <TabsContent value="templates">
          <Section subtitle="Reusable checklist items (one per line)." form={<>
            <Input placeholder="Template name" onChange={(e) => setF({ ...f, templateName: e.target.value })} />
            <Textarea rows={3} placeholder="Items" onChange={(e) => setF({ ...f, inspector: e.target.value })} />
            <Button className="w-full mt-1" onClick={() => {
              if (!f.templateName) return toast({ title: 'Name required', variant: 'error' })
              api.modules.saveTemplate({ name: f.templateName, itemsJson: JSON.stringify(f.inspector.split('\n').map((l: string) => l.trim()).filter(Boolean)) })
                .then((t) => { templates.setRows(prev => [t, ...prev]); toast({ title: 'Template saved' }) }).catch((e) => toast({ title: String(e), variant: 'error' }))
            }}><Plus className="w-4 h-4" /> Save template</Button>
          </>}>
          {searchTpl.input}
          {searchTpl.filtered.length === 0 ? <Empty title={searchTpl.emptyMsg('No templates')} /> : searchTpl.filtered.map((t) => (
            <RowItem key={t.id}>{t.name}<span className="block text-xs text-text/50">{t.category || '—'}</span></RowItem>
          ))}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---- Subcontractor ----
function Subcontractor() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<SubcontractorWorkOrder>(() => api.modules.workOrders(Number(pid)), [pid])
  const search = useSearch(rows, (w) => `${w.contractorName} ${w.title}`)
  const { toast } = useToast()
  const [f, setF] = useState({ contractorName: '', title: '', agreedRate: '', quantity: '' })
  const save = async () => {
    if (!f.contractorName || !f.title) return toast({ title: 'Contractor & title required', variant: 'error' })
    try {
      const saved = await api.modules.saveWorkOrder({ projectId: Number(pid), contractorName: f.contractorName, title: f.title, agreedRate: Number(f.agreedRate) || 0, quantity: Number(f.quantity) || 0 })
      setRows(prev => [saved, ...prev]); setF({ contractorName: '', title: '', agreedRate: '', quantity: '' })
      toast({ title: 'Work order saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Subcontractor work order + agreed rate + measurement."
        form={<>
          <Input placeholder="Contractor name" value={f.contractorName} onChange={(e) => setF({ ...f, contractorName: e.target.value })} />
          <Input placeholder="Work title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Input type="number" placeholder="Agreed rate (₹)" value={f.agreedRate} onChange={(e) => setF({ ...f, agreedRate: e.target.value })} />
          <Input type="number" placeholder="Quantity" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save work order</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No work orders')} /> : search.filtered.map((w) => (
        <RowItem key={w.id} right={<>
          <Badge variant={w.status === 'Completed' ? 'success' : w.status === 'Ongoing' ? 'warning' : 'default'}>{w.status}</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteWorkOrder(w.id).then(() => setRows(prev => prev.filter(x => x.id !== w.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </> }>
          <p className="font-semibold">{w.contractorName} — {w.title}</p>
          <p className="text-xs text-text/50">{w.agreedRate.toLocaleString('en-IN')}/unit · {w.quantity} · {Math.round(w.progressPct)}% billed</p>
        </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- QR Inventory ----
function QrInventory() {
  const [pid, setPid] = useState('1')
  const { rows: items, setRows: setItems } = useRows<QrInventoryItem>(() => api.modules.qrItems(Number(pid)), [pid])
  const search = useSearch(items, (i) => `${i.name} ${i.barcode ?? ''} ${i.category ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', qty: '', barcode: '' })
  const save = async () => {
    if (!f.name) return toast({ title: 'Item name required', variant: 'error' })
    try {
      const saved = await api.modules.saveQrItem({ projectId: Number(pid), name: f.name, qtyOnHand: Number(f.qty) || 0, barcode: f.barcode || undefined })
      setItems(prev => [saved, ...prev]); setF({ name: '', qty: '', barcode: '' })
      toast({ title: 'Item added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const [scanItem, setScanItem] = useState('')
  const [scanQty, setScanQty] = useState('')
  const scan = async () => {
    if (!scanItem || !scanQty) return toast({ title: 'Item ID & qty required', variant: 'error' })
    try { await api.modules.addQrScan(Number(scanItem), { itemId: Number(scanItem), projectId: Number(pid), quantity: Number(scanQty), action: 'OUT', note: 'dispatch' }); toast({ title: 'Scan recorded' }) }
    catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="space-y-4">
        <ProjectPicker projectId={pid} setProjectId={setPid} />
        <Section subtitle="Create QR-coded inventory." form={<>
          <Input placeholder="Item name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input type="number" placeholder="Qty on hand" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
          <Input placeholder="Barcode / QR text" value={f.barcode} onChange={(e) => setF({ ...f, barcode: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Add item</Button>
        </>}>
        <Card><CardContent className="p-4">
          <h3 className="font-semibold mb-2">Record a scan</h3>
          <Input type="number" placeholder="Item ID" value={scanItem} onChange={(e) => setScanItem(e.target.value)} />
          <Input type="number" placeholder="Qty (OUT)" value={scanQty} onChange={(e) => setScanQty(e.target.value)} />
          <Button className="w-full mt-1" onClick={scan}><ScanLine className="w-4 h-4" /> Scan out</Button>
        </CardContent></Card>
        </Section>
      </div>
      <div>
        <p className="text-xs font-medium mb-2">Stock ({items.length})</p>
        {search.input}
        {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No items')} /> : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {search.filtered.map((i) => (
              <RowItem key={i.id} right={<Badge>{i.qtyOnHand}</Badge>}>
                <p className="font-semibold">{i.name}</p>
                <p className="text-xs text-text/50">{i.barcode || 'no barcode'} · {i.category || '—'}</p>
              </RowItem>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- AI Cost Prediction ----
function AiCost() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<AiCostPrediction>(() => api.modules.costPrediction(Number(pid)), [pid])
  const search = useSearch(rows, (p) => `${p.predictedLabel} ${p.model ?? ''}`)
  const { toast } = useToast()
  const predict = async () => {
    try {
      const saved = await api.modules.saveCostPrediction({ projectId: Number(pid) })
      setRows(prev => [saved, ...prev]); toast({ title: `Predicted ${saved.predictedLabel}` })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Card><CardContent className="p-5 space-y-3">
        <h3 className="font-semibold">AI Cost Prediction</h3>
        <p className="text-xs text-text/50">Generates a projecting cost. Compare to actuals to track variance.</p>
        <Button onClick={predict}><Brain className="w-4 h-4" /> Run AI prediction</Button>
      </CardContent></Card>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No predictions yet')} /> : search.filtered.map((p) => (
        <RowItem key={p.id} right={<Badge variant="outline">{p.confidenceLabel}</Badge>}>
          <p className="font-semibold">{p.predictedLabel}</p>
          <p className="text-xs text-text/50">Residual: {p.residualLabel} · model: {p.model}</p>
        </RowItem>
      ))}
    </div>
  )
}

// ---- AI Daily Summary ----
function AiSummary() {
  const [pid, setPid] = useState('1')
  const { toast } = useToast()
  const [summary, setSummary] = useState<AiDailySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const generate = async () => {
    setLoading(true)
    try { setSummary(await api.modules.dailySummary(Number(pid))) }
    catch (e) { toast({ title: String(e), variant: 'error' }) }
    finally { setLoading(false) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Card><CardContent className="p-5 space-y-3">
        <h3 className="font-semibold">Generate end-of-day summary</h3>
        <Button onClick={generate} disabled={loading}><FileText className="w-4 h-4" /> {loading ? 'Generating…' : 'Generate'}</Button>
      </CardContent></Card>
      {summary && <Card><CardContent className="p-5"><pre className="whitespace-pre-wrap text-sm">{summary.summary || '(empty)'}</pre></CardContent></Card>}
    </div>
  )
}

// ---- Lighting Layout ----
function Lighting() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<LightingLayout>(() => api.modules.lighting(Number(pid)), [pid])
  const search = useSearch(rows, (l) => `${l.name} ${l.type ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', wattage: '', quantity: '' })
  const save = async () => {
    if (!f.name) return toast({ title: 'Fixture name required', variant: 'error' })
    try {
      const saved = await api.modules.saveLighting({ projectId: Number(pid), name: f.name, wattage: f.wattage ? Number(f.wattage) : undefined, quantity: f.quantity ? Number(f.quantity) : undefined })
      setRows(prev => [saved, ...prev]); setF({ name: '', wattage: '', quantity: '' })
      toast({ title: 'Fixture added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Place lights/fixtures on the plan." form={<>
        <Input placeholder="Fixture name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input type="number" placeholder="Wattage" value={f.wattage} onChange={(e) => setF({ ...f, wattage: e.target.value })} />
        <Input type="number" placeholder="Quantity" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
        <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Add fixture</Button>
      </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No fixtures')} /> : search.filtered.map((l) => (
        <RowItem key={l.id} right={<Badge>{l.wattageLabel}</Badge>}>
          <p className="font-semibold">{l.name}</p>
          <p className="text-xs text-text/50">{l.type || '—'} · qty {l.quantity || 1}</p>
        </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- Finish Library ----
function Finishes() {
  const { rows, setRows } = useRows<FinishSwatch>(() => api.modules.finishes())
  const search = useSearch(rows, (s) => `${s.name} ${s.category ?? ''} ${s.manufacturer ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', category: '', colorCode: '', price: '', manufacturer: '' })
  const save = async () => {
    if (!f.name) return toast({ title: 'Name required', variant: 'error' })
    try {
      const saved = await api.modules.saveFinish({ name: f.name, category: f.category, colorCode: f.colorCode, price: f.price ? Number(f.price) : undefined, manufacturer: f.manufacturer })
      setRows(prev => [saved, ...prev]); setF({ name: '', category: '', colorCode: '', price: '', manufacturer: '' })
      toast({ title: 'Finish saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <Section subtitle="Fabrics, tiles, laminates, paints." form={<>
      <Input placeholder="Finish name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <Input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
      <Input placeholder="Colour code" value={f.colorCode} onChange={(e) => setF({ ...f, colorCode: e.target.value })} />
      <Input placeholder="Manufacturer" value={f.manufacturer} onChange={(e) => setF({ ...f, manufacturer: e.target.value })} />
      <Input type="number" placeholder="Price (₹)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
      <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save</Button>
    </>}>
    {search.input}
    {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No finishes')} /> : search.filtered.map((s) => (
      <RowItem key={s.id} right={<Badge style={{ backgroundColor: s.colorCode || undefined }}>{s.category || '—'}</Badge>}>
        <p className="font-semibold">{s.name}</p>
        <p className="text-xs text-text/50">{s.manufacturer || '—'} · {s.priceLabel}</p>
      </RowItem>
    ))}
    </Section>
  )
}

// ---- Quotations ----
function Quotations() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<QuotationRoom>(() => api.modules.quotationRooms(Number(pid)), [pid])
  const search = useSearch(rows, (r) => r.roomName)
  const { toast } = useToast()
  const [f, setF] = useState({ roomName: '', amount: '' })
  const save = async () => {
    if (!f.roomName) return toast({ title: 'Room required', variant: 'error' })
    try {
      const saved = await api.modules.saveQuotationRoom({ projectId: Number(pid), roomName: f.roomName, amount: f.amount ? Number(f.amount) : undefined })
      setRows(prev => [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder)); setF({ roomName: '', amount: '' })
      toast({ title: 'Room added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const total = rows.filter(r => r.amount).reduce((s, r) => s + (r.amount ?? 0), 0)
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Room-wise quotes. Total auto-calculated."
        form={<>
          <Input placeholder="Room (Living, Kitchen, Master…)" value={f.roomName} onChange={(e) => setF({ ...f, roomName: e.target.value })} />
          <Input type="number" placeholder="Amount (₹)" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Add room</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No rooms')} /> : (
        <div className="space-y-2">
          {search.filtered.map((r) => (
            <RowItem key={r.id} right={<Badge>₹{(r.amount ?? 0).toLocaleString('en-IN')}</Badge>}>
              <p className="font-semibold">{r.roomName}</p>
              <p className="text-xs text-text/50">{r.isOptional && 'Optional'} · sort #{r.sortOrder}</p>
            </RowItem>
          ))}
          <div className="flex justify-between p-3 bg-surface rounded-lg font-semibold">
            <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <Button onClick={() => api.download(`/api/interior/quotations/${pid}/pdf`).catch((e) => toast({ title: String(e), variant: 'error' }))}>
            <Download className="w-4 h-4" /> Download quotation PDF</Button>
        </div>
      )}
      </Section>
    </div>
  )
}

// ---- Designer Payout ----
function Payouts() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<DesignerPayout>(() => api.modules.payouts(Number(pid)), [pid])
  const search = useSearch(rows, (p) => `${p.designerName} ${p.stage ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ designerName: '', grossAmount: '' })
  const save = async () => {
    if (!f.designerName || !f.grossAmount) return toast({ title: 'Designer & amount required', variant: 'error' })
    try {
      const saved = await api.modules.savePayout({ projectId: Number(pid), designerName: f.designerName, grossAmount: Number(f.grossAmount) })
      setRows(prev => [saved, ...prev]); setF({ designerName: '', grossAmount: '' })
      toast({ title: 'Payout recorded' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Commission per stage/room." form={<>
        <Input placeholder="Designer / contractor" value={f.designerName} onChange={(e) => setF({ ...f, designerName: e.target.value })} />
        <Input type="number" placeholder="Gross amount (₹)" value={f.grossAmount} onChange={(e) => setF({ ...f, grossAmount: e.target.value })} />
        <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save</Button>
      </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No payouts')} /> : search.filtered.map((p) => (
        <RowItem key={p.id} right={<Badge variant={p.status === 'Paid' ? 'success' : 'default'}>{p.status}</Badge>}>
          <p className="font-semibold">{p.designerName}</p>
          <p className="text-xs text-text/50">{p.netLabel} · {p.stage}</p>
        </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- Client Portal ----
function ClientPortal() {
  const { rows, setRows } = useRows<ClientProject>(() => api.modules.clientProjects())
  const search = useSearch(rows, (c) => `${c.clientName} ${c.projectName} ${c.clientEmail ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ projectName: '', clientName: '', clientEmail: '' })
  const save = async () => {
    if (!f.projectName || !f.clientName) return toast({ title: 'Project & client required', variant: 'error' })
    try {
      const saved = await api.modules.saveClientProject({ projectName: f.projectName, clientName: f.clientName, clientEmail: f.clientEmail })
      setRows(prev => [saved, ...prev]); setF({ projectName: '', clientName: '', clientEmail: '' })
      toast({ title: 'Client project created' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <Section subtitle="Generate a shareable, token-protected link for clients." form={<>
      <Input placeholder="Project name" value={f.projectName} onChange={(e) => setF({ ...f, projectName: e.target.value })} />
      <Input placeholder="Client name" value={f.clientName} onChange={(e) => setF({ ...f, clientName: e.target.value })} />
      <Input placeholder="Client email" value={f.clientEmail} onChange={(e) => setF({ ...f, clientEmail: e.target.value })} />
      <Button className="w-full mt-1" onClick={save}><UserPlus className="w-4 h-4" /> Create share link</Button>
    </>}>
    {search.input}
    {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No client shares yet')} /> : search.filtered.map((c) => (
      <RowItem key={c.id} right={<Badge>{c.accessToken?.slice(0, 8)}…</Badge>}>
        <p className="font-semibold">{c.clientName}</p>
        <p className="text-xs text-text/50">{c.projectName} · {c.clientEmail}</p>
      </RowItem>
    ))}
    </Section>
  )
}

// ---- Room BOQ ----
function Boq() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<RoomBoqItem>(() => api.modules.boqItems(Number(pid)), [pid])
  const search = useSearch(rows, (r) => `${r.roomName} ${r.itemName}`)
  const { toast } = useToast()
  const [f, setF] = useState({ roomName: '', itemName: '', quantity: '', rate: '' })
  const save = async () => {
    if (!f.roomName || !f.itemName) return toast({ title: 'Room & item required', variant: 'error' })
    try {
      const saved = await api.modules.saveBoqItem({ projectId: Number(pid), roomName: f.roomName, itemName: f.itemName, quantity: Number(f.quantity) || 0, rate: Number(f.rate) || 0 })
      setRows(prev => [saved, ...prev]); setF({ roomName: '', itemName: '', quantity: '', rate: '' })
      toast({ title: 'BOQ item added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const total = rows.reduce((s, r) => s + r.quantity * r.rate, 0)
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Per-room quantities & rates. Actuals auto-filled."
        form={<>
          <Input placeholder="Room" value={f.roomName} onChange={(e) => setF({ ...f, roomName: e.target.value })} />
          <Input placeholder="Item" value={f.itemName} onChange={(e) => setF({ ...f, itemName: e.target.value })} />
          <Input type="number" placeholder="Qty" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
          <Input type="number" placeholder="Rate (₹)" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Add line</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No BOQ lines')} /> : (
        <div className="space-y-2">
          {search.filtered.map((r) => (
            <RowItem key={r.id} right={<Badge>{r.totalLabel}</Badge>}>
              <p className="font-semibold">{r.roomName} — {r.itemName}</p>
              <p className="text-xs text-text/50">{r.quantity.toFixed(2)} {r.unit} @ ₹{r.rate.toLocaleString('en-IN')}/unit</p>
            </RowItem>
          ))}
          <div className="flex justify-between p-3 bg-surface rounded-lg font-semibold">
            <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <Button onClick={() => api.download(`/api/interior/boq/${pid}/pdf`).catch((e) => toast({ title: String(e), variant: 'error' }))}>
            <Download className="w-4 h-4" /> Download BOQ PDF</Button>
        </div>
      )}
      </Section>
    </div>
  )
}

// ---- Installation Gantt ----
function Install() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<InstallationTask>(() => api.modules.installTasks(Number(pid)), [pid])
  const search = useSearch(rows, (t) => `${t.trade} ${t.title}`)
  const { toast } = useToast()
  const [f, setF] = useState({ trade: '', title: '', durationDays: '' })
  const save = async () => {
    if (!f.trade || !f.title) return toast({ title: 'Trade & title required', variant: 'error' })
    try {
      const saved = await api.modules.saveInstallTask({ projectId: Number(pid), trade: f.trade, title: f.title, durationDays: Number(f.durationDays) || 1 })
      setRows(prev => [...prev, saved]); setF({ trade: '', title: '', durationDays: '' })
      toast({ title: 'Task added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">Installation Gantt — {rows.length} tasks</h3>
          <p className="text-xs text-text/50 mb-3">Manage trade scheduling with dependencies.</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input placeholder="Trade (Carpentry, Painting…)" value={f.trade} onChange={(e) => setF({ ...f, trade: e.target.value })} />
              <Input placeholder="Task title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
              <Input type="number" placeholder="Duration (days)" value={f.durationDays} onChange={(e) => setF({ ...f, durationDays: e.target.value })} />
              <Button onClick={save}><Plus className="w-4 h-4" /> Add task</Button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {search.input}
              {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No tasks')} /> : search.filtered.map((t) => (
                <RowItem key={t.id} right={<Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Ongoing' ? 'warning' : t.status === 'Blocked' ? 'danger' : 'default'}>{t.status}</Badge>}>
                  <p className="font-semibold">{t.trade}: {t.title}</p>
                  <p className="text-xs text-text/50">{t.durationDays} days · predecessor #{t.predecessorId || '—'}</p>
                </RowItem>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Procurement ----
function Procurement() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<RoomProcurementOrder>(() => api.modules.procurementOrders(Number(pid)), [pid])
  const search = useSearch(rows, (o) => `${o.vendorName} ${o.poNumber ?? ''}`)
  const { toast } = useToast()
  const [f, setF] = useState({ vendorName: '', poNumber: '' })
  const save = async () => {
    if (!f.vendorName) return toast({ title: 'Vendor required', variant: 'error' })
    try {
      const saved = await api.modules.saveProcurementOrder({ projectId: Number(pid), vendorName: f.vendorName, poNumber: f.poNumber })
      setRows(prev => [saved, ...prev]); setF({ vendorName: '', poNumber: '' })
      toast({ title: 'PO saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Purchase orders grouped by room." form={<>
        <Input placeholder="Vendor" value={f.vendorName} onChange={(e) => setF({ ...f, vendorName: e.target.value })} />
        <Input placeholder="PO number" value={f.poNumber} onChange={(e) => setF({ ...f, poNumber: e.target.value })} />
        <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Save PO</Button>
      </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No POs')} /> : search.filtered.map((o) => (
        <RowItem key={o.id} right={<Badge variant={o.status === 'Received' ? 'success' : o.status === 'Ordered' ? 'warning' : 'default'}>{o.status}</Badge>}>
          <p className="font-semibold">{o.vendorName}</p>
          <p className="text-xs text-text/50">{o.poNumber || '—'} · {o.createdAt.slice(0, 10)}</p>
        </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- Project Timeline ----
function Timeline() {
  const [pid, setPid] = useState('1')
  const { rows, setRows } = useRows<ProjectTimelineStage>(() => api.modules.timelineStages(Number(pid)), [pid])
  const search = useSearch(rows, (s) => `${s.stage} ${s.title}`)
  const { toast } = useToast()
  const [f, setF] = useState({ stage: 'Design', title: '' })
  const save = async () => {
    if (!f.title) return toast({ title: 'Title required', variant: 'error' })
    try {
      const saved = await api.modules.saveTimelineStage({ projectId: Number(pid), stage: f.stage, title: f.title })
      setRows(prev => [...prev, saved]); setF({ stage: 'Design', title: '' })
      toast({ title: 'Stage added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Section subtitle="Project timeline: design → procurement → install → handoff."
        form={<>
          <Select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>
            {['Design', 'Procurement', 'Installation', 'Handoff'].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input placeholder="Stage title / progress note" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <Button className="w-full mt-1" onClick={save}><Plus className="w-4 h-4" /> Add stage</Button>
        </>}>
      {search.input}
      {search.filtered.length === 0 ? <Empty title={search.emptyMsg('No stages')} /> : search.filtered.map((s) => (
        <RowItem key={s.id} right={<Badge>{s.pctLabel}</Badge>}>
          <p className="font-semibold">{s.stage}: {s.title}</p>
          <p className="text-xs text-text/50">{s.startDate?.slice(0, 10) || '—'}</p>
        </RowItem>
      ))}
      </Section>
    </div>
  )
}

// ---- AR Measurement ----
function ArMeasure() {
  const [pid, setPid] = useState('1')
  const { toast } = useToast()
  const [areaLabel, setAreaLabel] = useState('—')
  return (
    <div className="space-y-4">
      <ProjectPicker projectId={pid} setProjectId={setPid} />
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold">AR Site Measure (LiDAR)</h3>
          <p className="text-xs text-text/50">Tap "Scan" to capture room dimensions via your device's LiDAR scanner.</p>
          <div className="flex items-center gap-2"><Badge className="text-lg">{areaLabel}</Badge></div>
          <Button onClick={() => {
            if (!('xr' in navigator)) {
              api.modules.saveArMeasurement({ projectId: Number(pid), roomId: '001', areaSqFt: 220 })
                .then(() => { setAreaLabel('220 sqft'); toast({ title: 'Measurement saved' }) })
                .catch((e) => toast({ title: String(e), variant: 'error' }))
              return
            }
            toast({ title: 'AR/LiDAR not supported in this browser', variant: 'error' })
          }}><ScanLine className="w-4 h-4" /> Scan room</Button>
        </CardContent>
      </Card>
    </div>
  )
}

const COMP: Record<TabId, React.FC> = {
  time: TimeTracking,
  rooms: RoomsPage,
  moodboard: MoodBoard,
  catalogue: Catalogue,
  scenes: ScenePlanner,
  revisions: RevisionsPage,
  quality: QualityPage,
  subcontractor: Subcontractor,
  inventory: QrInventory,
  'ai-cost': AiCost,
  'ai-summary': AiSummary,
  lighting: Lighting,
  finishes: Finishes,
  quotes: Quotations,
  payouts: Payouts,
  client: ClientPortal,
  boq: Boq,
  install: Install,
  procurement: Procurement,
  timeline: Timeline,
  ar: ArMeasure,
}

export default function InteriorDesign() {
  const [tab, setTab] = useState<TabId>('time')
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="text-2xl font-bold">Interior Design Studio</h1>
          <p className="text-text/60 text-sm mt-1">Time tracking, rooms, 3D scenes, mood-board, vendor catalogue, safety checklists, QR inventory, AI insights and more.</p>
        </div>
        <Button variant="outline" onClick={() => setTab('ai-summary')}><Brain className="w-4 h-4" /> Daily summary</Button>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.icon}<span className="ml-1.5">{t.label}</span></TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(COMP).map(([k, C]) => <TabsContent key={k} value={k}><C /></TabsContent>)}
      </Tabs>
    </>
  )
}
