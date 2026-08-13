import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { Project } from '../../api'
import { Card, CardContent, Badge, Button, Input, Textarea, Select, Label, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Empty, money } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import LocationPicker from '../../components/LocationPicker'
import { Plus, Search, FolderKanban, Trash2, ArrowRight, Calendar } from 'lucide-react'
import { cn, fmtDate } from '../../lib/utils'

const STATUSES = ['In Discussion', 'Not Started', 'Ongoing', 'On Hold', 'Completed']

const STATUS_TONE: Record<string, 'default' | 'info' | 'warning' | 'danger' | 'success' | 'outline'> = {
  'In Discussion': 'info',
  'Not Started': 'outline',
  Ongoing: 'default',
  'On Hold': 'warning',
  Completed: 'success',
}

export default function ProjectsList() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', address: '', value: '', status: 'In Discussion', latitude: '', longitude: '' })

  const load = () => api.projects.list().then(setProjects).catch(() => setProjects([]))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (search && !`${p.name} ${p.address}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [projects, search, statusFilter])

  const create = async () => {
    try {
      if (!f.name.trim()) { setErr('Project name is required'); return }
      const p = await api.projects.save({
        id: 0, name: f.name.trim(), address: f.address, value: Number(f.value) || 0, status: f.status,
        latitude: f.latitude ? Number(f.latitude) : 0, longitude: f.longitude ? Number(f.longitude) : 0,
        createdAt: new Date().toISOString().slice(0, 10),
      })
      toast({ title: 'Project created', description: p.name })
      nav(`/projects/${p.id}`)
    } catch (e) { setErr(String(e)); toast({ title: 'Could not create project', description: String(e), variant: 'error' }) }
  }

  const remove = async (p: Project) => {
    if (!confirm(`Delete project "${p.name}" and all its data?`)) return
    try {
      await api.projects.remove(p.id)
      load()
      toast({ title: 'Project deleted', description: p.name, variant: 'error' })
    } catch (e) { setErr(String(e)); toast({ title: 'Could not delete project', description: String(e), variant: 'error' }) }
  }

  const counts = useMemo(() => {
    const by = (s: string) => projects.filter((p) => p.status === s).length
    return {
      total: projects.length,
      discussion: by('In Discussion'),
      ongoing: by('Ongoing'),
      completed: by('Completed'),
      totalValue: projects.reduce((s, p) => s + p.value, 0),
    }
  }, [projects])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <div className="muted">Track construction & interior-design jobs end to end</div>
        </div>
        <Button onClick={() => { setErr(''); setF({ name: '', address: '', value: '', status: 'In Discussion', latitude: '', longitude: '' }); setOpen(true) }}>
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi label="Total Projects" value={String(counts.total)} />
        <Kpi label="In Discussion" value={String(counts.discussion)} />
        <Kpi label="Ongoing" value={String(counts.ongoing)} />
        <Kpi label="Completed" value={String(counts.completed)} />
      </div>

      {/* Toolbar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} className="w-48">
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        {filtered.length === 0 ? (
          <Empty
            icon={<FolderKanban className="w-12 h-12" />}
            title="No projects found"
            description={projects.length === 0 ? 'Create your first project to start tracking jobs' : 'Try adjusting your search or filter'}
            action={projects.length === 0 ? <Button onClick={() => setOpen(true)}>New Project</Button> : undefined}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} clickable onClick={() => nav(`/projects/${p.id}`)}>
                  <TableCell>
                    <div>
                      <Link to={`/projects/${p.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-primary hover:underline">{p.name}</Link>
                      {p.address && <p className="text-xs text-muted mt-0.5">{p.address}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_TONE[p.status] || 'outline'} size="sm">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(p.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{money(p.value)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); nav(`/projects/${p.id}`) }} aria-label="Open">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(p) }} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* New Project Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Project" description="Add a new job to track" size="md">
        <form onSubmit={(e) => { e.preventDefault(); create() }} className="space-y-5">
          <div>
            <Label htmlFor="pname" required>Project Name</Label>
            <Input id="pname" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Villa Interior – Whitefield" autoFocus />
          </div>
          <div>
            <Label htmlFor="paddr">Address / Site</Label>
            <Textarea id="paddr" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Site address, city" rows={2} />
          </div>
          <div>
            <Label>Location <span className="text-xs text-muted">— search the address, use your location, or click the map</span></Label>
            <LocationPicker
              latitude={f.latitude}
              longitude={f.longitude}
              onChange={(lat, lng, addr) => setF((prev) => ({ ...prev, latitude: lat, longitude: lng, address: addr || prev.address }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pvalue">Contract Value (₹)</Label>
              <Input id="pvalue" type="number" min="0" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="0" />
            </div>
            <div>
              <Label htmlFor="pstatus">Status</Label>
              <Select id="pstatus" value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          {err && <div className={cn('p-3 rounded-lg text-sm border', 'bg-red-500/10 border-red-500/20 text-red-500')}>{err}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted">{label}</p>
        <span className="text-2xl font-bold text-text mt-1 inline-block">{value}</span>
      </CardContent>
    </Card>
  )
}
