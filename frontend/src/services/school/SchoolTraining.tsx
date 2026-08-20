import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { GraduationCap, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { TrainingProgram, StaffMember } from './types'
import { TRAINING_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolTraining() {
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items, add, update, remove } = useLocalCollection<TrainingProgram>('school:trainings', TRAINING_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TrainingProgram | null>(null)
  const [form, setForm] = useState({ name: '', trainer: '', date: '', staffNames: '', status: 'planned' as TrainingProgram['status'] })

  const filtered = useMemo(
    () => items.filter((t) => `${t.name} ${t.trainer}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const staffName = (id: string) => staff.find((s) => s.id === id)?.name ?? id

  const columns: DataColumn<TrainingProgram>[] = [
    { key: 'name', header: 'Program', render: (t) => <span className="font-medium">{t.name}</span>, sortValue: (t) => t.name },
    { key: 'trainer', header: 'Trainer', render: (t) => t.trainer },
    { key: 'date', header: 'Date', render: (t) => t.date.slice(0, 10), sortValue: (t) => t.date },
    { key: 'attendees', header: 'Attendees', render: (t) => t.staffIds.map(staffName).join(', ') || <span className="text-muted text-sm">—</span> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} />, sortValue: (t) => t.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', trainer: '', date: '', staffNames: '', status: 'planned' })
    setModalOpen(true)
  }

  function openEdit(t: TrainingProgram) {
    setEditing(t)
    setForm({ name: t.name, trainer: t.trainer, date: t.date, staffNames: t.staffIds.map(staffName).join('\n'), status: t.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const staffIds = form.staffNames.split('\n').map((s) => s.trim()).filter(Boolean)
      .map((name) => staff.find((s) => s.name === name)?.id ?? name)
    const payload = { ...form, staffIds, date: form.date }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const completed = items.filter((t) => t.status === 'completed').length
  const planned = items.filter((t) => t.status === 'planned').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Programs" value={items.length} icon={<GraduationCap className="w-5 h-5" />} tone="info" />
        <KPICard label="Planned" value={planned} icon={<GraduationCap className="w-5 h-5" />} tone="warning" />
        <KPICard label="Completed" value={completed} icon={<GraduationCap className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Training programs</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add program</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(t) => t.id}
            pageSize={10}
            exportFilename="school-training"
            emptyIcon={<GraduationCap className="w-6 h-6" />}
            emptyTitle="No training programs"
            emptyDescription="Schedule staff training sessions here."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search programs..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(t) => (
              <div className="flex gap-1">
                {t.status === 'planned' && (
                  <Button variant="ghost" size="icon" onClick={() => update(t.id, { status: 'completed' })} aria-label="Complete"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit program' : 'Add program'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Program name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Trainer</Label><Input value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TrainingProgram['status'] })}>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Attendees (one staff name per line)</Label>
            <Textarea value={form.staffNames} onChange={(e) => setForm({ ...form, staffNames: e.target.value })} placeholder={staff.slice(0, 3).map((s) => s.name).join('\n')} />
            <p className="text-xs text-muted mt-1">Available: {staff.map((s) => s.name).join(', ')}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add program'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}