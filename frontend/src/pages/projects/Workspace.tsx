import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectDetail } from '../../api'
import { Card, CardContent, Badge, Button, Input, Textarea, Select, Label, Modal, Empty, money } from '../../components/ui'
import LocationPicker from '../../components/LocationPicker'
import {
  ArrowLeft, Users, Wallet, Building2, ClipboardList, Clock3, Layers3, FileText, Palette, FolderOpen,
  Plus, TrendingUp, TrendingDown, Target, MapPin,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const STATUSES = ['In Discussion', 'Not Started', 'Ongoing', 'On Hold', 'Completed']
const STATUS_TONE: Record<string, 'default' | 'info' | 'warning' | 'danger' | 'success' | 'outline'> = {
  'In Discussion': 'info',
  'Not Started': 'outline',
  Ongoing: 'default',
  'On Hold': 'warning',
  Completed: 'success',
}

const CARDS: { to: string; icon: React.ReactNode; label: string; desc: string }[] = [
  { to: '/party', icon: <Users className="w-6 h-6" />, label: 'Party', desc: 'Site staff & vendors' },
  { to: '/txn', icon: <Wallet className="w-6 h-6" />, label: 'Transaction', desc: 'Payments in & out' },
  { to: '/site', icon: <Building2 className="w-6 h-6" />, label: 'Site', desc: 'Daily progress logs' },
  { to: '/tasks', icon: <ClipboardList className="w-6 h-6" />, label: 'Task', desc: 'Task management' },
  { to: '/attendance', icon: <Clock3 className="w-6 h-6" />, label: 'Attendance', desc: 'Daily attendance' },
  { to: '/material', icon: <Layers3 className="w-6 h-6" />, label: 'Material', desc: 'Material & stock' },
  { to: '/mom', icon: <FileText className="w-6 h-6" />, label: 'MOM', desc: 'Meeting minutes' },
  { to: '/design', icon: <Palette className="w-6 h-6" />, label: 'Design', desc: 'Drawings & designs' },
  { to: '/files', icon: <FolderOpen className="w-6 h-6" />, label: 'Files', desc: 'Folders & docs' },
  { to: '/payroll', icon: <Wallet className="w-6 h-6" />, label: 'Payroll', desc: 'Salary computation' },
]

export default function Workspace() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [d, setD] = useState<ProjectDetail | null>(null)
  const [err, setErr] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [dprOpen, setDprOpen] = useState(false)
  const [pr, setPr] = useState('0')
  const [note, setNote] = useState('')
  const [f, setF] = useState({ name: '', address: '', value: '', status: 'Ongoing', latitude: '', longitude: '' })

  const load = () => api.projects.detail(pid).then(setD).catch((e) => setErr(String(e)))
  useEffect(() => { load() }, [pid])

  const openEdit = () => {
    if (!d) return
    setF({
      name: d.project.name, address: d.project.address, value: String(d.project.value || ''), status: d.project.status,
      latitude: d.project.latitude ? String(d.project.latitude) : '', longitude: d.project.longitude ? String(d.project.longitude) : '',
    })
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!d || !f.name.trim()) { setErr('Project name is required'); return }
    try {
      await api.projects.update({
        ...d.project, name: f.name.trim(), address: f.address, value: Number(f.value) || 0, status: f.status,
        latitude: Number(f.latitude) || 0, longitude: Number(f.longitude) || 0,
      })
      setEditOpen(false)
      load()
    } catch (e) { setErr(String(e)) }
  }

  const addDpr = async () => {
    try {
      await api.projects.saveLog(pid, { id: 0, projectId: pid, date: new Date().toISOString().slice(0, 10), progressPercent: Number(pr), note })
      setDprOpen(false); setNote(''); setPr('0'); load()
    } catch (e) { setErr(String(e)) }
  }

  const stats = useMemo(() => {
    if (!d) return { value: 0, received: 0, spent: 0, taskPct: 0, parties: 0, tasks: 0 }
    const received = d.txns.filter((t) => t.type === 'PAYMENT_IN').reduce((s, t) => s + t.amount, 0)
    const spent = d.txns.filter((t) => t.type === 'PAYMENT_OUT').reduce((s, t) => s + t.amount, 0)
      + d.materials.reduce((s, m) => s + m.amount, 0)
    const taskPct = d.tasks.length
      ? Math.round(d.tasks.reduce((s, t) => s + t.progressPercent, 0) / d.tasks.length)
      : 0
    return { value: d.project.value, received, spent, taskPct, parties: d.parties.length, tasks: d.tasks.length }
  }, [d])

  if (err) return <Empty title="Something went wrong" description={err} />
  if (!d) return <Empty title="Loading…" description="Please wait" />

  const p = d.project

  return (
    <>
      <div className="page-head">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav('/projects')} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{p.name}</h1>
              <Badge variant={STATUS_TONE[p.status] || 'outline'} size="sm">{p.status}</Badge>
            </div>
            <div className="muted">{p.address || 'No address'}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <MapPin className="w-4 h-4" /> {p.latitude && p.longitude ? '📍 ' + p.latitude.toFixed(4) + ', ' + p.longitude.toFixed(4) : 'Set location'}
          </Button>
          <Button variant="outline" onClick={openEdit}>Edit Project</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi label="Contract Value" value={money(p.value)} icon={<Target className="w-5 h-5" />} tone="indigo" />
        <Kpi label="Received" value={money(stats.received)} icon={<TrendingDown className="w-5 h-5 rotate-180" />} tone="emerald" />
        <Kpi label="Spent" value={money(stats.spent)} icon={<TrendingUp className="w-5 h-5" />} tone="amber" />
        <Kpi label="Task Progress" value={`${stats.taskPct}%`} icon={<ClipboardList className="w-5 h-5" />} tone="cyan" />
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={`/projects/${pid}${c.to}`}
            className="group bg-surface border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
              {c.icon}
            </div>
            <div className="font-medium text-text">{c.label}</div>
            <div className="text-xs text-muted mt-0.5">{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* DPR */}
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

          {d.logs.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No daily progress reports yet.</p>
          ) : (
            <div className="space-y-2">
              {[...d.logs].reverse().map((l) => (
                <div key={l.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface2/50 border border-border">
                  <span className="text-xs text-muted w-20">{l.date.slice(8, 10)}/{l.date.slice(5, 7)}/{l.date.slice(2, 4)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-surface overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${Math.min(100, l.progressPercent)}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-primary w-10 text-right">{l.progressPercent}%</span>
                    </div>
                    {l.note && <p className="text-xs text-muted mt-1">{l.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Project" size="md">
        <form onSubmit={(e) => { e.preventDefault(); saveEdit() }} className="space-y-5">
          <div>
            <Label htmlFor="ename" required>Project Name</Label>
            <Input id="ename" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="eaddr">Address / Site</Label>
            <Textarea id="eaddr" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="evalue">Contract Value (₹)</Label>
              <Input id="evalue" type="number" min="0" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="estatus">Status</Label>
              <Select id="estatus" value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Location (search or click the map)</Label>
            <LocationPicker
              latitude={f.latitude}
              longitude={f.longitude}
              onChange={(lat, lng, addr) => {
                setF((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                if (addr) setF((prev) => ({ ...prev, address: prev.address || addr }))
              }}
            />
          </div>
          {err && <div className={cn('p-3 rounded-lg text-sm border', 'bg-red-500/10 border-red-500/20 text-red-500')}>{err}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </>
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
