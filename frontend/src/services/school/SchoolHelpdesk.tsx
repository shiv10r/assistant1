import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { LifeBuoy, Plus, Pencil, Trash2, Search, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Ticket } from './types'
import { TICKET_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolHelpdesk() {
  const { items, add, update, remove } = useLocalCollection<Ticket>('school:tickets', TICKET_SEED)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ticket | null>(null)
  const [form, setForm] = useState({ title: '', category: '', priority: 'medium' as Ticket['priority'], status: 'open' as Ticket['status'], assignee: '', requester: '', createdAt: new Date().toISOString().slice(0, 10), sla: '' })

  const filtered = useMemo(
    () => items.filter((t) => (statusFilter === 'all' || t.status === statusFilter) && `${t.title} ${t.category} ${t.assignee} ${t.requester}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, statusFilter]
  )

  const columns: DataColumn<Ticket>[] = [
    { key: 'title', header: 'Ticket', render: (t) => <span className="font-medium">{t.title}</span>, sortValue: (t) => t.title },
    { key: 'category', header: 'Category', render: (t) => t.category, sortValue: (t) => t.category },
    { key: 'priority', header: 'Priority', render: (t) => <StatusBadge status={t.priority} />, sortValue: (t) => t.priority },
    { key: 'assignee', header: 'Assignee', render: (t) => t.assignee || <span className="text-muted text-sm">—</span> },
    { key: 'requester', header: 'Requester', render: (t) => t.requester },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} />, sortValue: (t) => t.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', category: '', priority: 'medium', status: 'open', assignee: '', requester: '', createdAt: new Date().toISOString().slice(0, 10), sla: '' })
    setModalOpen(true)
  }

  function openEdit(t: Ticket) {
    setEditing(t)
    setForm({ title: t.title, category: t.category, priority: t.priority, status: t.status, assignee: t.assignee, requester: t.requester, createdAt: t.createdAt, sla: t.sla })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const open = items.filter((t) => t.status === 'open').length
  const inprogress = items.filter((t) => t.status === 'inprogress').length
  const resolved = items.filter((t) => t.status === 'resolved').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tickets" value={items.length} icon={<LifeBuoy className="w-5 h-5" />} tone="info" />
        <KpiCard label="Open" value={open} icon={<LifeBuoy className="w-5 h-5" />} tone="danger" />
        <KpiCard label="In progress" value={inprogress} icon={<LifeBuoy className="w-5 h-5" />} tone="warning" />
        <KpiCard label="Resolved" value={resolved} icon={<LifeBuoy className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Helpdesk tickets</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add ticket</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(t) => t.id}
            pageSize={10}
            exportFilename="school-tickets"
            emptyIcon={<LifeBuoy className="w-6 h-6" />}
            emptyTitle="No tickets"
            emptyDescription="Staff and parent requests land here."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search tickets..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter} className="w-36">
                  <option value="all">All status</option>
                  <option value="open">Open</option>
                  <option value="inprogress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>
            }
            actions={(t) => (
              <div className="flex gap-1">
                {t.status === 'open' && <Button variant="ghost" size="icon" onClick={() => update(t.id, { status: 'inprogress' })} aria-label="Start"><ArrowRight className="w-4 h-4 text-emerald-500" /></Button>}
                {t.status === 'inprogress' && <Button variant="ghost" size="icon" onClick={() => update(t.id, { status: 'resolved' })} aria-label="Resolve"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>}
                {t.status === 'resolved' && <Button variant="ghost" size="icon" onClick={() => update(t.id, { status: 'closed' })} aria-label="Close"><CheckCircle2 className="w-4 h-4 text-muted" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit ticket' : 'Add ticket'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="IT, Maintenance, Transport..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Ticket['priority'] })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Ticket['status'] })}>
                <option value="open">Open</option>
                <option value="inprogress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Assignee</Label><Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} /></div>
            <div><Label>Requester</Label><Input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Created</Label><Input type="date" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} /></div>
            <div><Label>SLA</Label><Input value={form.sla} onChange={(e) => setForm({ ...form, sla: e.target.value })} placeholder="24h" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add ticket'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}