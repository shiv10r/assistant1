import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Subject, SchoolClass, StaffMember } from './types'
import { SUBJECT_SEED, CLASS_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'

export default function SchoolSubjects() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items, add, update, remove } = useLocalCollection<Subject>('school:subjects', SUBJECT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [form, setForm] = useState({ name: '', code: '', classId: classes[0]?.id ?? '', teacherId: staff[0]?.id ?? '' })

  const filtered = useMemo(
    () => items.filter((s) => `${s.name} ${s.code} ${s.className} ${s.teacherName}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Subject>[] = [
    { key: 'name', header: 'Subject', render: (s) => <span className="font-medium">{s.name}</span>, sortValue: (s) => s.name },
    { key: 'code', header: 'Code', render: (s) => <span className="font-mono text-xs">{s.code}</span> },
    { key: 'className', header: 'Class', render: (s) => s.className, sortValue: (s) => s.className },
    { key: 'teacherName', header: 'Teacher', render: (s) => s.teacherName, sortValue: (s) => s.teacherName },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', code: '', classId: classes[0]?.id ?? '', teacherId: staff[0]?.id ?? '' })
    setModalOpen(true)
  }

  function openEdit(s: Subject) {
    setEditing(s)
    setForm({ name: s.name, code: s.code, classId: s.classId, teacherId: s.teacherId })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim() || !form.code.trim()) return
    const cls = classes.find((c) => c.id === form.classId)
    const teacher = staff.find((t) => t.id === form.teacherId)
    const payload = { ...form, className: cls ? `${cls.name} - ${cls.section}` : '', teacherName: teacher?.name ?? '' }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const teacherCount = new Set(items.map((s) => s.teacherId)).size
  const classCount = new Set(items.map((s) => s.classId)).size

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Subjects" value={items.length} icon={<BookOpen className="w-5 h-5" />} tone="info" />
        <KPICard label="Classes covered" value={classCount} icon={<BookOpen className="w-5 h-5" />} tone="default" />
        <KPICard label="Teachers" value={teacherCount} icon={<BookOpen className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Subjects</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add subject</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(s) => s.id}
            pageSize={10}
            exportFilename="school-subjects"
            emptyIcon={<BookOpen className="w-6 h-6" />}
            emptyTitle="No subjects yet"
            emptyDescription="Add subjects and assign them to classes and teachers."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search subjects..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(s) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit subject' : 'Add subject'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Subject name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label required>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
            <div>
              <Label>Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({ ...form, teacherId: v })}>
                {staff.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add subject'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}