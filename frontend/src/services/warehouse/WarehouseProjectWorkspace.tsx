import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, Badge, Button, Input, Textarea, Select, Label, Modal, Empty, money } from '../../components/ui'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ProjectRecord } from './types'
import { PROJECT_SEED } from './seed'
import { fmtDate, cn } from '../../lib/utils'
import LocationPicker from '../../components/LocationPicker'
import WeatherCard from '../../components/WeatherCard'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'
import {
  ArrowLeft, Users, Wallet, Building2, ClipboardList, Clock3, Layers3, FileText, Palette, FolderOpen,
  Plus, TrendingUp, TrendingDown, Target, MapPin, Trash2, Pencil, Briefcase,
} from 'lucide-react'

const STATUS_TONE: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger' | 'outline'> = {
  planned: 'info',
  active: 'default',
  completed: 'success',
}

type Field = { key: string; label: string; type: 'text' | 'number' | 'date' | 'select'; options?: string[]; required?: boolean; step?: string; placeholder?: string }

type ModuleDef = {
  key: string
  label: string
  desc: string
  icon: React.ReactNode
  fields: Field[]
  empty: string
  emptySub: string
}

const MODULES: ModuleDef[] = [
  { key: 'parties', label: 'Party', desc: 'Site staff & vendors', icon: <Users className="w-6 h-6" />, fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Ramesh Kumar' },
    { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 …' },
    { key: 'role', label: 'Role', type: 'select', options: ['Site Staff', 'Supervisor', 'Sub-contractor', 'Material Supplier', 'Vendor'] },
    { key: 'dailyRate', label: 'Daily rate ₹', type: 'number', step: '0.01' },
  ], empty: 'No parties yet', emptySub: 'Add site staff & vendors to track them on this project.' },
  { key: 'txns', label: 'Transaction', desc: 'Payments in & out', icon: <Wallet className="w-6 h-6" />, fields: [
    { key: 'type', label: 'Type', type: 'select', options: ['PAYMENT_IN', 'PAYMENT_OUT'], required: true },
    { key: 'partyName', label: 'Party', type: 'text', placeholder: 'Who is this with?' },
    { key: 'amount', label: 'Amount ₹', type: 'number', step: '0.01', required: true },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
  ], empty: 'No transactions yet', emptySub: 'Record money received (in) and paid out for this project.' },
  { key: 'logs', label: 'Site', desc: 'Daily progress logs', icon: <Building2 className="w-6 h-6" />, fields: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'progressPercent', label: 'Progress %', type: 'number', step: '1', required: true },
    { key: 'note', label: 'Note', type: 'text', placeholder: 'What happened today?' },
  ], empty: 'No site logs yet', emptySub: 'Log daily site progress for this project.' },
  { key: 'tasks', label: 'Task', desc: 'Task management', icon: <ClipboardList className="w-6 h-6" />, fields: [
    { key: 'name', label: 'Task name', type: 'text', required: true, placeholder: 'e.g. Bay 3 rack installation' },
    { key: 'status', label: 'Status', type: 'select', options: ['Not Started', 'Ongoing', 'Completed'] },
    { key: 'progressPercent', label: 'Progress %', type: 'number', step: '1' },
    { key: 'members', label: 'Members', type: 'text', placeholder: 'Who is assigned?' },
  ], empty: 'No tasks yet', emptySub: 'Break the project down into manageable tasks.' },
  { key: 'materials', label: 'Material', desc: 'Material & stock', icon: <Layers3 className="w-6 h-6" />, fields: [
    { key: 'kind', label: 'Kind', type: 'select', options: ['IN', 'OUT'] },
    { key: 'materialName', label: 'Material', type: 'text', required: true, placeholder: 'e.g. Cement bags' },
    { key: 'qty', label: 'Qty', type: 'number', step: '0.01' },
    { key: 'unit', label: 'Unit', type: 'text', placeholder: 'bag, pcs, m…' },
    { key: 'vendorName', label: 'Vendor', type: 'text' },
    { key: 'amount', label: 'Amount ₹', type: 'number', step: '0.01' },
    { key: 'date', label: 'Date', type: 'date' },
  ], empty: 'No materials yet', emptySub: 'Track material & stock movement for this project.' },
  { key: 'mom', label: 'MOM', desc: 'Meeting minutes', icon: <FileText className="w-6 h-6" />, fields: [
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Weekly progress review' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'text' },
  ], empty: 'No meeting minutes yet', emptySub: 'Capture decisions made in project meetings.' },
  { key: 'design', label: 'Design', desc: 'Drawings & designs', icon: <Palette className="w-6 h-6" />, fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Bay layout drawing' },
    { key: 'category', label: 'Category', type: 'select', options: ['Layout', 'Structural', 'Electrical', 'Plumbing', 'Other'] },
    { key: 'note', label: 'Note', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
  ], empty: 'No designs yet', emptySub: 'Keep drawings & design references in one place.' },
  { key: 'files', label: 'Files', desc: 'Folders & docs', icon: <FolderOpen className="w-6 h-6" />, fields: [
    { key: 'name', label: 'File name', type: 'text', required: true, placeholder: 'e.g. Contract PDF' },
    { key: 'folder', label: 'Folder', type: 'text', placeholder: 'e.g. Contracts' },
    { key: 'note', label: 'Note', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
  ], empty: 'No files yet', emptySub: 'Organise project documents & folders.' },
]

interface Rec { id: string }

function ModuleModal({ def, pid, open, onClose, onOpened }: { def: ModuleDef; pid: string; open: boolean; onClose: () => void; onOpened?: () => void }) {
  const col = useLocalCollection<Rec & Record<string, unknown>>(`warehouse:proj:${pid}:${def.key}`, [])
  const [form, setForm] = useState<Record<string, string>>({})
  const [editId, setEditId] = useState<string | null>(null)
  const [err, setErr] = useState('')

  function openAdd() { setEditId(null); setForm({}); setErr(''); onOpened?.() }
  function openEdit(r: Rec & Record<string, unknown>) {
    setEditId(r.id)
    setForm(Object.fromEntries(def.fields.map((f) => [f.key, String(r[f.key] ?? '')])))
    setErr('')
  }

  function save() {
    if (def.fields.some((f) => f.required && !String(form[f.key] ?? '').trim())) {
      setErr('Please fill in the required fields.'); return
    }
    const payload = Object.fromEntries(def.fields.map((f) => [f.key, f.type === 'number' ? Number(form[f.key]) || 0 : (form[f.key] ?? '').trim()]))
    if (editId) col.update(editId, payload)
    else col.add({ id: genId(), ...payload })
    setForm({}); setEditId(null)
  }

  function dateOf(r: Rec & Record<string, unknown>, f: Field): string {
    const v = r[f.key]
    return v ? String(v).slice(0, 10) : ''
  }

  return (
    <Modal open={open} onClose={onClose} title={def.label} description={def.desc} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface2/50 border border-border">
          {def.fields.map((f) => (
            <div key={f.key} className={f.type === 'text' ? 'sm:col-span-1' : ''}>
              <Label>{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</Label>
              {f.type === 'select' ? (
                <Select value={form[f.key] ?? ''} onValueChange={(v) => setForm({ ...form, [f.key]: v })}>
                  <option value="">Select…</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              ) : (
                <Input
                  type={f.type}
                  step={f.step}
                  value={form[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="flex items-end gap-2">
            <Button onClick={save}>{editId ? 'Save changes' : 'Add'}</Button>
            {(editId || Object.keys(form).length > 0) && (
              <Button variant="ghost" onClick={openAdd}>Reset</Button>
            )}
          </div>
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}

        {col.items.length === 0 ? (
          <Empty icon={<div className="text-3xl">{def.icon}</div>} title={def.empty} description={def.emptySub} />
        ) : (
          <div className="space-y-2">
            {col.items.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface2/50 border border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-text">{String(r[def.fields[0].key] ?? '')}</span>
                    {def.key === 'txns' && (
                      <Badge variant={r.type === 'PAYMENT_IN' ? 'success' : 'warning'} size="sm">
                        {r.type === 'PAYMENT_IN' ? 'In' : 'Out'} · {money(Number(r.amount) || 0)}
                      </Badge>
                    )}
                    {def.key === 'logs' && (
                      <Badge variant="info" size="sm">{String(r.progressPercent)}%</Badge>
                    )}
                    {def.key === 'tasks' && (
                      <Badge variant={r.status === 'Completed' ? 'success' : r.status === 'Ongoing' ? 'default' : 'outline'} size="sm">
                        {String(r.status ?? '')}
                      </Badge>
                    )}
                    {def.key === 'materials' && (
                      <Badge variant={r.kind === 'IN' ? 'success' : 'warning'} size="sm">{String(r.kind ?? '')}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5 space-x-2">
                    {def.fields.slice(1).filter((f) => r[f.key] !== '' && r[f.key] !== undefined && r[f.key] !== null).map((f) => (
                      <span key={f.key}>
                        {f.type === 'number' && (f.key === 'amount' || f.key === 'dailyRate') ? money(Number(r[f.key]) || 0)
                          : f.type === 'date' ? fmtDate(dateOf(r, f))
                          : String(r[f.key])}
                      </span>
                    ))}
                    {def.key === 'logs' && String(r.note ?? '') !== '' && <span className="italic">{String(r.note)}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => col.remove(r.id)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function WarehouseProjectWorkspace() {
  const { id } = useParams()
  const pid = id ?? ''
  const nav = useNavigate()
  const { isAdvanced } = useViewMode()
  const projects = useLocalCollection<ProjectRecord>('warehouse:projects', PROJECT_SEED)
  const project = projects.items.find((p) => p.id === pid)

  const [editOpen, setEditOpen] = useState(false)
  const [dprOpen, setDprOpen] = useState(false)
  const [openMod, setOpenMod] = useState<string | null>(null)
  const [pr, setPr] = useState('0')
  const [note, setNote] = useState('')
  const [f, setF] = useState({ name: '', client: '', startDate: '', budget: '', address: '', latitude: '', longitude: '', status: 'active' })

  const logs = useLocalCollection<Rec & Record<string, unknown>>(`warehouse:proj:${pid}:logs`, [])
  const txns = useLocalCollection<Rec & Record<string, unknown>>(`warehouse:proj:${pid}:txns`, [])
  const tasks = useLocalCollection<Rec & Record<string, unknown>>(`warehouse:proj:${pid}:tasks`, [])

  const stats = useMemo(() => {
    const received = txns.items.filter((t) => t.type === 'PAYMENT_IN').reduce((s, t) => s + Number(t.amount || 0), 0)
    const spent = txns.items.filter((t) => t.type === 'PAYMENT_OUT').reduce((s, t) => s + Number(t.amount || 0), 0)
    const taskPct = tasks.items.length
      ? Math.round(tasks.items.reduce((s, t) => s + Number(t.progressPercent || 0), 0) / tasks.items.length)
      : 0
    return { received, spent, taskPct }
  }, [txns.items, tasks.items])

  if (!project) return <Empty icon={<BriefcaseIcon />} title="Project not found" description="This warehouse project may have been deleted." />

  const p = project

  function openEdit() {
    setF({
      name: p.name, client: p.client, startDate: p.startDate, budget: String(p.budget),
      address: p.address ?? '', latitude: p.latitude ? String(p.latitude) : '',
      longitude: p.longitude ? String(p.longitude) : '', status: p.status,
    })
    setEditOpen(true)
  }

  function saveEdit() {
    if (!f.name.trim()) return
    projects.update(p.id, {
      name: f.name.trim(), client: f.client.trim() || 'Internal',
      startDate: f.startDate || p.startDate, budget: Number(f.budget) || 0,
      address: f.address.trim(), latitude: f.latitude ? Number(f.latitude) : undefined,
      longitude: f.longitude ? Number(f.longitude) : undefined, status: f.status as ProjectRecord['status'],
    })
    setEditOpen(false)
  }

  function addDpr() {
    logs.add({
      id: genId(),
      date: new Date().toISOString().slice(0, 10),
      progressPercent: Number(pr) || 0,
      note: note.trim(),
    })
    setDprOpen(false); setNote(''); setPr('0')
  }

  return (
    <>
      <div className="page-head">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav('/warehouse/projects')} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{project.name}</h1>
              <Badge variant={STATUS_TONE[project.status] || 'outline'} size="sm">{project.status}</Badge>
            </div>
            <div className="muted">{project.client}{project.address ? ` · ${project.address}` : ''}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <MapPin className="w-4 h-4" />
            {project.latitude && project.longitude
              ? `📍 ${project.latitude.toFixed(4)}, ${project.longitude.toFixed(4)}`
              : 'Set location'}
          </Button>
          <Button variant="outline" onClick={openEdit}>Edit Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi label="Contract Value" value={money(project.budget)} icon={<Target className="w-5 h-5" />} tone="indigo" />
        <Kpi label="Received" value={money(stats.received)} icon={<TrendingDown className="w-5 h-5 rotate-180" />} tone="emerald" />
        <Kpi label="Spent" value={money(stats.spent)} icon={<TrendingUp className="w-5 h-5" />} tone="amber" />
        <Kpi label="Task Progress" value={`${stats.taskPct}%`} icon={<ClipboardList className="w-5 h-5" />} tone="cyan" />
      </div>

      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Budget vs cashflow · transaction mix · task completion — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Budget utilization', value: project.budget ? `${Math.round((stats.spent / project.budget) * 100)}%` : '—', delta: money(stats.spent), deltaTone: stats.spent > project.budget ? 'down' : 'flat' },
            { label: 'Net position', value: money(stats.received - stats.spent), delta: stats.received - stats.spent >= 0 ? 'positive' : 'negative', deltaTone: stats.received - stats.spent >= 0 ? 'up' : 'down' },
            { label: 'Avg task progress', value: `${stats.taskPct}%`, delta: `${tasks.items.length} task(s)`, deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Budget vs received vs spent</p>
              <BarChart
                data={[
                  { label: 'Budget', value: project.budget },
                  { label: 'Received', value: stats.received },
                  { label: 'Spent', value: stats.spent },
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Transaction mix</p>
              <DonutChart
                data={[
                  { label: 'In', value: txns.items.filter((t) => t.type === 'PAYMENT_IN').length, color: '#10b981' },
                  { label: 'Out', value: txns.items.filter((t) => t.type === 'PAYMENT_OUT').length, color: '#f59e0b' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      <div className="mb-6">
        <WeatherCard
          latitude={project.latitude ?? undefined}
          longitude={project.longitude ?? undefined}
          siteName={project.name}
          onSetLocation={openEdit}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        {MODULES.map((c) => (
          <button
            key={c.key}
            onClick={() => setOpenMod(c.key)}
            className="group bg-surface border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
              {c.icon}
            </div>
            <div className="font-medium text-text">{c.label}</div>
            <div className="text-xs text-muted mt-0.5">{c.desc}</div>
          </button>
        ))}
        <Link
          to={`/warehouse/projects/${pid}/attendance`}
          className="group bg-surface border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <Clock3 className="w-6 h-6" />
          </div>
          <div className="font-medium text-text">Attendance</div>
          <div className="text-xs text-muted mt-0.5">Daily attendance</div>
        </Link>
        <button
          onClick={() => setOpenMod('rollup')}
          className="group bg-surface border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="font-medium text-text">Payroll</div>
          <div className="text-xs text-muted mt-0.5">Salary computation</div>
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold m-0">Daily Progress Reports</h2>
            <Button size="sm" variant="outline" onClick={() => setDprOpen((o) => !o)}>
              <Plus className="w-4 h-4" /> Add DPR
            </Button>
          </div>

          {dprOpen && (
            <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto] items-end mb-4 p-4 bg-surface2/50 rounded-xl border border-border">
              <div>
                <Label>Progress %</Label>
                <Input type="number" min={0} max={100} value={pr} onChange={(e) => setPr(e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label>Note</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened today?" />
              </div>
              <div className="flex gap-2">
                <Button onClick={addDpr}>Save</Button>
                <Button variant="ghost" onClick={() => setDprOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {logs.items.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No daily progress reports yet.</p>
          ) : (
            <div className="space-y-2">
              {[...logs.items].reverse().map((l) => (
                <div key={l.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface2/50 border border-border">
                  <span className="text-xs text-muted w-20">{String(l.date ?? '').slice(8, 10)}/{String(l.date ?? '').slice(5, 7)}/{String(l.date ?? '').slice(2, 4)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-surface overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(100, Number(l.progressPercent) || 0)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-primary w-10 text-right">{String(l.progressPercent)}%</span>
                    </div>
                    {String(l.note ?? '') !== '' && <p className="text-xs text-muted mt-1">{String(l.note)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {MODULES.map((c) => (
        <ModuleModal key={c.key} def={c} pid={pid} open={openMod === c.key} onClose={() => setOpenMod(null)} />
      ))}

      <PayrollModal pid={pid} open={openMod === 'rollup'} onClose={() => setOpenMod(null)} />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Project" size="md">
        <div className="space-y-5">
          <div>
            <Label required>Project Name</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client</Label>
              <Input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} />
            </div>
            <div>
              <Label>Start date</Label>
              <Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contract Value (₹)</Label>
              <Input type="number" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
                {['planned', 'active', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Address / Site</Label>
            <Textarea value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Location <span className="text-xs text-muted">— search the address, use your location, or click the map</span></Label>
            <LocationPicker
              latitude={f.latitude}
              longitude={f.longitude}
              onChange={(lat, lng, addr) => {
                setF((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                if (addr) setF((prev) => ({ ...prev, address: prev.address || addr }))
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function PayrollModal({ pid, open, onClose }: { pid: string; open: boolean; onClose: () => void }) {
  const staff = useLocalCollection<Rec & Record<string, unknown>>(`warehouse:proj:${pid}:parties`, [])
  const attendance = useLocalCollection<Rec & Record<string, unknown>>(`warehouse:proj:${pid}:attendance`, [])

  const rows = useMemo(() => {
    const byWorker = new Map<string, { name: string; rate: number; days: number; wages: number }>()
    for (const a of attendance.items) {
      const sid = String(a.staffId ?? '')
      if (!byWorker.has(sid)) {
        const w = staff.items.find((s) => s.id === sid)
        byWorker.set(sid, { name: String(a.staffName ?? w?.name ?? 'Worker'), rate: Number(w?.dailyRate || 0), days: 0, wages: 0 })
      }
      const row = byWorker.get(sid)!
      const status = String(a.status ?? '')
      const factor = status === 'Present' ? 1 : status === 'Half-Day' ? 0.5 : 0
      row.days += factor
      row.wages += row.rate * factor
    }
    return [...byWorker.values()]
  }, [attendance.items, staff.items])

  const total = rows.reduce((s, r) => s + r.wages, 0)

  return (
    <Modal open={open} onClose={onClose} title="Payroll" description="Salary computation from daily attendance" size="lg">
      {rows.length === 0 ? (
        <Empty icon={<Wallet className="w-6 h-6" />} title="No attendance yet" description="Mark daily attendance (Attendance card) to compute wages." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center gap-3 p-3 rounded-lg bg-surface2/50 border border-border">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text">{r.name}</div>
                <div className="text-xs text-muted">{r.days} day{r.days === 1 ? '' : 's'} @ {money(r.rate)}/day</div>
              </div>
              <span className="font-semibold text-text">{money(Math.round(r.wages))}</span>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="font-semibold text-text">Total wages</span>
            <span className="font-bold text-text">{money(Math.round(total))}</span>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Kpi({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: 'indigo' | 'cyan' | 'amber' | 'emerald' }) {
  const tones = {
    indigo: 'bg-indigo-500/10 text-indigo-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    amber: 'bg-amber-500/10 text-amber-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
  }
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-xl font-bold text-text mt-1">{value}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tones[tone])}>{icon}</div>
      </CardContent>
    </Card>
  )
}

function BriefcaseIcon() {
  return <Briefcase className="w-12 h-12" />
}