import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Users, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { PTMSession, StaffMember } from './types'
import { PTM_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolPTM() {
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items, add, update, remove } = useLocalCollection<PTMSession>('school:ptm', PTM_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PTMSession | null>(null)
  const [form, setForm] = useState({ teacherId: staff[0]?.id ?? '', date: '', timeSlot: '', room: '', status: 'open' as PTMSession['status'] })

  const filtered = useMemo(
    () => items.filter((p) => `${p.teacherName} ${p.room} ${p.date}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<PTMSession>[] = [
    { key: 'teacherName', header: 'Teacher', render: (p) => <span className="font-medium">{p.teacherName}</span>, sortValue: (p) => p.teacherName },
    { key: 'date', header: 'Date', render: (p) => p.date.slice(0, 10), sortValue: (p) => p.date },
    { key: 'timeSlot', header: 'Time slot', render: (p) => p.timeSlot },
    { key: 'room', header: 'Room', render: (p) => p.room },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ teacherId: staff[0]?.id ?? '', date: '', timeSlot: '', room: '', status: 'open' })
    setModalOpen(true)
  }

  function openEdit(p: PTMSession) {
    setEditing(p)
    setForm({ teacherId: p.teacherId, date: p.date, timeSlot: p.timeSlot, room: p.room, status: p.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.timeSlot.trim()) return
    const teacher = staff.find((s) => s.id === form.teacherId)
    const payload = { ...form, teacherName: teacher?.name ?? '' }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const open = items.filter((p) => p.status === 'open').length
  const booked = items.filter((p) => p.status === 'booked').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Slots" value={items.length} icon={<Users className="w-5 h-5" />} tone="info" />
        <KpiCard label="Open" value={open} icon={<Users className="w-5 h-5" />} tone="success" />
        <KpiCard label="Booked" value={booked} icon={<Users className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Parent-teacher meetings</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add slot</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="school-ptm"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No PTM slots"
            emptyDescription="Create parent-teacher meeting slots."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search slots..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(p) => (
              <div className="flex gap-1">
                {p.status === 'open' && (
                  <Button variant="ghost" size="icon" onClick={() => update(p.id, { status: 'booked' })} aria-label="Book"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                )}
                {p.status === 'booked' && (
                  <Button variant="ghost" size="icon" onClick={() => update(p.id, { status: 'completed' })} aria-label="Complete"><CheckCircle2 className="w-4 h-4 text-primary" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit slot' : 'Add slot'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Time slot</Label><Input value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} placeholder="09:00 - 09:15" /></div>
            <div><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="R-101" /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PTMSession['status'] })}>
              <option value="open">Open</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add slot'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}