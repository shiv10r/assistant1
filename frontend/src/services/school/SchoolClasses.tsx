import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Modal } from '../../components/ui'
import { Layers, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { SchoolClass } from './types'
import { CLASS_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'

const emptyForm = { name: '', section: '', teacher: '', capacity: '40', studentCount: '0' }

export default function SchoolClasses() {
  const { items, add, update, remove } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolClass | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(
    () => items.filter((c) => `${c.name} ${c.section} ${c.teacher}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<SchoolClass>[] = [
    { key: 'name', header: 'Class', render: (c) => <span className="font-medium">{c.name}</span>, sortValue: (c) => c.name },
    { key: 'section', header: 'Section', render: (c) => c.section, sortValue: (c) => c.section },
    { key: 'teacher', header: 'Teacher', render: (c) => c.teacher },
    {
      key: 'strength', header: 'Strength', sortValue: (c) => c.studentCount,
      render: (c) => (
        <>
          {c.studentCount} / {c.capacity}{' '}
          {c.studentCount >= c.capacity && <Badge variant="warning" size="sm">Full</Badge>}
        </>
      ),
    },
  ]

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(c: SchoolClass) {
    setEditing(c)
    setForm({ name: c.name, section: c.section, teacher: c.teacher, capacity: String(c.capacity), studentCount: String(c.studentCount) })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { name: form.name.trim(), section: form.section.trim(), teacher: form.teacher.trim(), capacity: Number(form.capacity) || 0, studentCount: Number(form.studentCount) || 0 }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Classes</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add class</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id}
            pageSize={10}
            exportFilename="school-classes"
            emptyIcon={<Layers className="w-6 h-6" />}
            emptyTitle="No classes yet"
            emptyDescription="Add a class to start enrolling students."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search class, section or teacher..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(c) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit class' : 'Add class'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
          </div>
          <div><Label>Class teacher</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
            <div><Label>Current strength</Label><Input type="number" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add class'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
