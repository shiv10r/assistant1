import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { Scale, Plus, Pencil, Trash2, Search, Eye, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Grievance } from './types'
import { GRIEVANCE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolGrievances() {
  const { items, add, update, remove } = useLocalCollection<Grievance>('school:grievances', GRIEVANCE_SEED)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Grievance | null>(null)
  const [form, setForm] = useState({ title: '', category: '', anonymous: false, raisedBy: '', date: new Date().toISOString().slice(0, 10), status: 'open' as Grievance['status'], resolution: '' })

  const filtered = useMemo(
    () => items.filter((g) => (statusFilter === 'all' || g.status === statusFilter) && `${g.title} ${g.category} ${g.raisedBy}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, statusFilter]
  )

  const columns: DataColumn<Grievance>[] = [
    { key: 'title', header: 'Grievance', render: (g) => <span className="font-medium">{g.title}</span>, sortValue: (g) => g.title },
    { key: 'category', header: 'Category', render: (g) => g.category, sortValue: (g) => g.category },
    { key: 'raisedBy', header: 'Raised by', render: (g) => <span>{g.raisedBy}{g.anonymous && <span className="ml-1 text-xs text-muted">(anonymous)</span>}</span> },
    { key: 'date', header: 'Date', render: (g) => g.date.slice(0, 10), sortValue: (g) => g.date },
    { key: 'status', header: 'Status', render: (g) => <StatusBadge status={g.status} />, sortValue: (g) => g.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', category: '', anonymous: false, raisedBy: '', date: new Date().toISOString().slice(0, 10), status: 'open', resolution: '' })
    setModalOpen(true)
  }

  function openEdit(g: Grievance) {
    setEditing(g)
    setForm({ title: g.title, category: g.category, anonymous: g.anonymous, raisedBy: g.raisedBy, date: g.date, status: g.status, resolution: g.resolution })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    const payload = { ...form, raisedBy: form.anonymous ? 'Anonymous' : form.raisedBy }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const open = items.filter((g) => g.status === 'open').length
  const investigating = items.filter((g) => g.status === 'investigating').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Grievances" value={items.length} icon={<Scale className="w-5 h-5" />} tone="info" />
        <KPICard label="Open" value={open} icon={<Scale className="w-5 h-5" />} tone="danger" />
        <KPICard label="Investigating" value={investigating} icon={<Scale className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Grievance redressal</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add grievance</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(g) => g.id}
            pageSize={10}
            exportFilename="school-grievances"
            emptyIcon={<Scale className="w-6 h-6" />}
            emptyTitle="No grievances"
            emptyDescription="Track and resolve student and staff grievances."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter} className="w-36">
                  <option value="all">All status</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </div>
            }
            actions={(g) => (
              <div className="flex gap-1">
                {g.status === 'open' && <Button variant="ghost" size="icon" onClick={() => update(g.id, { status: 'investigating' })} aria-label="Investigate"><Eye className="w-4 h-4 text-emerald-500" /></Button>}
                {g.status !== 'resolved' && <Button variant="ghost" size="icon" onClick={() => update(g.id, { status: 'resolved', resolution: g.resolution || 'Resolved after review.' })} aria-label="Resolve"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => openEdit(g)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(g.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit grievance' : 'Add grievance'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Canteen, Academics, Discipline..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Grievance['status'] })}>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <Label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} className="w-4 h-4 accent-primary" />
            Keep anonymous
          </Label>
          {!form.anonymous && (
            <div><Label>Raised by</Label><Input value={form.raisedBy} onChange={(e) => setForm({ ...form, raisedBy: e.target.value })} /></div>
          )}
          <div><Label>Resolution</Label><Textarea value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add grievance'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}