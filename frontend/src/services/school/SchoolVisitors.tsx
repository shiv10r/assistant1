import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Modal } from '../../components/ui'
import { DoorOpen, Plus, Pencil, Trash2, Search, LogOut } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { VisitorLog } from './types'
import { VISITOR_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'

export default function SchoolVisitors() {
  const { items, add, update, remove } = useLocalCollection<VisitorLog>('school:visitors', VISITOR_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<VisitorLog | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', personToMeet: '', inTime: new Date().toISOString().slice(0, 16), outTime: '', badge: '' })

  const filtered = useMemo(
    () => items.filter((v) => `${v.name} ${v.purpose} ${v.personToMeet}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const onSite = items.filter((v) => !v.outTime).length

  const columns: DataColumn<VisitorLog>[] = [
    { key: 'name', header: 'Visitor', render: (v) => <span className="font-medium">{v.name}</span>, sortValue: (v) => v.name },
    { key: 'purpose', header: 'Purpose', render: (v) => v.purpose },
    { key: 'personToMeet', header: 'Meeting', render: (v) => v.personToMeet || <span className="text-muted text-sm">—</span> },
    { key: 'inTime', header: 'In', render: (v) => v.inTime.slice(0, 16).replace('T', ' ') },
    { key: 'outTime', header: 'Out', render: (v) => v.outTime ? v.outTime.slice(0, 16).replace('T', ' ') : <span className="text-emerald-600 font-medium">On site</span> },
    { key: 'badge', header: 'Badge', render: (v) => <span className="font-mono text-xs">{v.badge}</span> },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', phone: '', purpose: '', personToMeet: '', inTime: new Date().toISOString().slice(0, 16), outTime: '', badge: `V-${items.length + 102}` })
    setModalOpen(true)
  }

  function openEdit(v: VisitorLog) {
    setEditing(v)
    setForm({ name: v.name, phone: v.phone, purpose: v.purpose, personToMeet: v.personToMeet, inTime: v.inTime, outTime: v.outTime ?? '', badge: v.badge })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { ...form, outTime: form.outTime || undefined }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Visitors" value={items.length} icon={<DoorOpen className="w-5 h-5" />} tone="info" />
        <KpiCard label="On site now" value={onSite} icon={<DoorOpen className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Visitor log</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Check in</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(v) => v.id}
            pageSize={10}
            exportFilename="school-visitors"
            emptyIcon={<DoorOpen className="w-6 h-6" />}
            emptyTitle="No visitors yet"
            emptyDescription="Check visitors in and out at the gate."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search visitors..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(v) => (
              <div className="flex gap-1">
                {!v.outTime && (
                  <Button variant="ghost" size="icon" onClick={() => update(v.id, { outTime: new Date().toISOString().slice(0, 16) })} aria-label="Check out"><LogOut className="w-4 h-4 text-amber-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(v.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit visitor' : 'Check in visitor'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Purpose</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
            <div><Label>Person to meet</Label><Input value={form.personToMeet} onChange={(e) => setForm({ ...form, personToMeet: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>In time</Label><Input type="datetime-local" value={form.inTime} onChange={(e) => setForm({ ...form, inTime: e.target.value })} /></div>
            <div><Label>Out time</Label><Input type="datetime-local" value={form.outTime} onChange={(e) => setForm({ ...form, outTime: e.target.value })} /></div>
          </div>
          <div><Label>Badge no</Label><Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Check in'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}