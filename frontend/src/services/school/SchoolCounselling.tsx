import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { HeartHandshake, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { CounsellingSession, Student, StaffMember } from './types'
import { COUNSELLING_SEED, STUDENT_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolCounselling() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items, add, update, remove } = useLocalCollection<CounsellingSession>('school:counselling', COUNSELLING_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CounsellingSession | null>(null)
  const [form, setForm] = useState({ studentId: students[0]?.id ?? '', counsellor: staff[0]?.name ?? '', date: new Date().toISOString().slice(0, 10), reason: '', notes: '', status: 'scheduled' as CounsellingSession['status'] })

  const filtered = useMemo(
    () => items.filter((c) => `${c.studentName} ${c.reason} ${c.counsellor}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<CounsellingSession>[] = [
    { key: 'studentName', header: 'Student', render: (c) => <span className="font-medium">{c.studentName}</span>, sortValue: (c) => c.studentName },
    { key: 'counsellor', header: 'Counsellor', render: (c) => c.counsellor },
    { key: 'date', header: 'Date', render: (c) => c.date.slice(0, 10), sortValue: (c) => c.date },
    { key: 'reason', header: 'Reason', render: (c) => c.reason, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ studentId: students[0]?.id ?? '', counsellor: staff[0]?.name ?? '', date: new Date().toISOString().slice(0, 10), reason: '', notes: '', status: 'scheduled' })
    setModalOpen(true)
  }

  function openEdit(c: CounsellingSession) {
    setEditing(c)
    setForm({ studentId: c.studentId, counsellor: c.counsellor, date: c.date, reason: c.reason, notes: c.notes, status: c.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.reason.trim()) return
    const student = students.find((s) => s.id === form.studentId)
    const payload = { ...form, studentName: student?.name ?? '' }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const scheduled = items.filter((c) => c.status === 'scheduled').length
  const completed = items.filter((c) => c.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Sessions" value={items.length} icon={<HeartHandshake className="w-5 h-5" />} tone="info" />
        <KpiCard label="Scheduled" value={scheduled} icon={<HeartHandshake className="w-5 h-5" />} tone="warning" />
        <KpiCard label="Completed" value={completed} icon={<HeartHandshake className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Counselling sessions</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add session</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id}
            pageSize={10}
            exportFilename="school-counselling"
            emptyIcon={<HeartHandshake className="w-6 h-6" />}
            emptyTitle="No sessions"
            emptyDescription="Schedule counselling sessions for students."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search sessions..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(c) => (
              <div className="flex gap-1">
                {c.status === 'scheduled' && (
                  <Button variant="ghost" size="icon" onClick={() => update(c.id, { status: 'completed' })} aria-label="Complete"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit session' : 'Add session'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Counsellor</Label>
              <Select value={form.counsellor} onValueChange={(v) => setForm({ ...form, counsellor: v })}>
                {staff.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CounsellingSession['status'] })}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
          <div><Label>Reason</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add session'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}