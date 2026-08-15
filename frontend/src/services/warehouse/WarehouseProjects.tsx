import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Label, Modal, Empty, money, Textarea, Select } from '../../components/ui'
import { Briefcase, Plus, Search, Pencil, Trash2, ArrowRight, MapPin } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ProjectRecord, ProjectStatus } from './types'
import { PROJECT_SEED } from './seed'
import { fmtDate } from '../../lib/utils'
import LocationPicker from '../../components/LocationPicker'

const emptyForm = { name: '', client: '', startDate: '', budget: '0', address: '', latitude: '', longitude: '' }
const STATUS_BADGE: Record<ProjectStatus, 'default' | 'success' | 'info'> = { planned: 'info', active: 'default', completed: 'success' }

export default function WarehouseProjects() {
  const { items, add, update, remove } = useLocalCollection<ProjectRecord>('warehouse:projects', PROJECT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const nav = useNavigate()

  const filtered = useMemo(
    () => items.filter((p) => `${p.name} ${p.client}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(p: ProjectRecord) {
    setEditing(p)
    setForm({
      name: p.name, client: p.client, startDate: p.startDate, budget: String(p.budget),
      address: p.address ?? '', latitude: p.latitude ? String(p.latitude) : '', longitude: p.longitude ? String(p.longitude) : '',
    })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = {
      name: form.name.trim(), client: form.client.trim() || 'Internal',
      startDate: form.startDate || new Date().toISOString().slice(0, 10), budget: Number(form.budget) || 0,
      address: form.address.trim(), latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
    }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), status: 'planned', ...payload })
    setModalOpen(false)
  }

  function cycleStatus(p: ProjectRecord) {
    const order: ProjectStatus[] = ['planned', 'active', 'completed']
    const next = order[(order.indexOf(p.status) + 1) % order.length]
    update(p.id, { status: next })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Project Management</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add project</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search projects..." className="pl-12" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<Briefcase className="w-6 h-6" />} title="No projects yet" description="Add a warehouse project to track it here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Client</TableHead><TableHead>Start</TableHead><TableHead>Budget</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} clickable onClick={() => nav(`/warehouse/projects/${p.id}`)}>
                    <TableCell className="font-medium">
                      <Link to={`/warehouse/projects/${p.id}`} onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">{p.name}</Link>
                      {p.address && <p className="text-xs text-muted mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.address}</p>}
                    </TableCell>
                    <TableCell>{p.client}</TableCell>
                    <TableCell>{fmtDate(p.startDate)}</TableCell>
                    <TableCell>{money(p.budget)}</TableCell>
                    <TableCell>
                      <button onClick={(e) => { e.stopPropagation(); cycleStatus(p) }}>
                        <Badge variant={STATUS_BADGE[p.status]}>{p.status}</Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); nav(`/warehouse/projects/${p.id}`) }} aria-label="Open workspace"><ArrowRight className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(p) }} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(p.id) }} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit project' : 'Add project'} size="md">
        <div className="space-y-4">
          <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Client</Label><Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
            <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Budget</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={editing?.status ?? 'planned'} onValueChange={(v) => { if (editing) update(editing.id, { status: v as ProjectStatus }) }}>
                {['planned', 'active', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Address / Site</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
          <div>
            <Label>Location <span className="text-xs text-muted">— for the site map &amp; weather card</span></Label>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng, addr) => {
                setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                if (addr) setForm((prev) => ({ ...prev, address: prev.address || addr }))
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add project'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
