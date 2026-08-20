import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { Scale, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { DisciplineRecord, Student } from './types'
import { DISCIPLINE_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolDiscipline() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, add, update, remove } = useLocalCollection<DisciplineRecord>('school:discipline', DISCIPLINE_SEED)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DisciplineRecord | null>(null)
  const [form, setForm] = useState({ studentId: students[0]?.id ?? '', type: 'merit' as DisciplineRecord['type'], description: '', date: new Date().toISOString().slice(0, 10), points: 10, status: 'open' as DisciplineRecord['status'] })

  const filtered = useMemo(
    () => items.filter((d) => (typeFilter === 'all' || d.type === typeFilter) && `${d.studentName} ${d.description}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, typeFilter]
  )

  const columns: DataColumn<DisciplineRecord>[] = [
    { key: 'studentName', header: 'Student', render: (d) => <span className="font-medium">{d.studentName}</span>, sortValue: (d) => d.studentName },
    { key: 'type', header: 'Type', render: (d) => <StatusBadge status={d.type} />, sortValue: (d) => d.type },
    { key: 'description', header: 'Description', render: (d) => d.description, hideOnMobile: true },
    { key: 'points', header: 'Points', render: (d) => <span className={`font-semibold ${d.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{d.points > 0 ? `+${d.points}` : d.points}</span>, sortValue: (d) => d.points },
    { key: 'date', header: 'Date', render: (d) => d.date.slice(0, 10), sortValue: (d) => d.date },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} />, sortValue: (d) => d.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ studentId: students[0]?.id ?? '', type: 'merit', description: '', date: new Date().toISOString().slice(0, 10), points: 10, status: 'open' })
    setModalOpen(true)
  }

  function openEdit(d: DisciplineRecord) {
    setEditing(d)
    setForm({ studentId: d.studentId, type: d.type, description: d.description, date: d.date, points: d.points, status: d.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.description.trim()) return
    const student = students.find((s) => s.id === form.studentId)
    const payload = { ...form, studentName: student?.name ?? '', points: Number(form.points) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const open = items.filter((d) => d.status === 'open').length
  const positive = items.filter((d) => d.points > 0).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Records" value={items.length} icon={<Scale className="w-5 h-5" />} tone="info" />
        <KPICard label="Open cases" value={open} icon={<Scale className="w-5 h-5" />} tone="warning" />
        <KPICard label="Positive entries" value={positive} icon={<Scale className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Discipline & achievements</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add record</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(d) => d.id}
            pageSize={10}
            exportFilename="school-discipline"
            emptyIcon={<Scale className="w-6 h-6" />}
            emptyTitle="No records"
            emptyDescription="Track achievements and disciplinary actions."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter} className="w-36">
                  <option value="all">All types</option>
                  <option value="achievement">Achievement</option>
                  <option value="merit">Merit</option>
                  <option value="incident">Incident</option>
                  <option value="warning">Warning</option>
                </Select>
              </div>
            }
            actions={(d) => (
              <div className="flex gap-1">
                {d.status === 'open' && (
                  <Button variant="ghost" size="icon" onClick={() => update(d.id, { status: 'resolved' })} aria-label="Resolve"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(d)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(d.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit record' : 'Add record'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as DisciplineRecord['type'] })}>
                <option value="achievement">Achievement</option>
                <option value="merit">Merit</option>
                <option value="incident">Incident</option>
                <option value="warning">Warning</option>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Points</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DisciplineRecord['status'] })}>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add record'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}