import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Label, Select, Modal, Empty } from '../../components/ui'
import { GraduationCap, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Student, SchoolClass } from './types'
import { STUDENT_SEED, CLASS_SEED } from './seed'

export default function SchoolStudents() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items, add, update, remove } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState({ admissionNo: '', name: '', classId: classes[0]?.id ?? '', guardianName: '', phone: '', status: 'active' as Student['status'] })

  const filtered = useMemo(
    () => items.filter((s) => `${s.name} ${s.admissionNo} ${s.className}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  function openAdd() {
    setEditing(null)
    setForm({ admissionNo: '', name: '', classId: classes[0]?.id ?? '', guardianName: '', phone: '', status: 'active' })
    setModalOpen(true)
  }

  function openEdit(s: Student) {
    setEditing(s)
    setForm({ admissionNo: s.admissionNo, name: s.name, classId: s.classId, guardianName: s.guardianName, phone: s.phone, status: s.status })
    setModalOpen(true)
  }

  function save() {
    const cls = classes.find((c) => c.id === form.classId)
    if (!form.name.trim() || !cls) return
    const payload = { ...form, className: `${cls.name} - ${cls.section}` }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Students</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add student</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search name, admission no or class..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<GraduationCap className="w-6 h-6" />} title="No students yet" description="Add a student to start building the roster." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Admission No</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Guardian</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>{s.guardianName}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell><Badge variant={s.status === 'active' ? 'success' : 'outline'} size="sm">{s.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit student' : 'Add student'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Admission No</Label><Input value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} /></div>
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Student['status'] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Guardian name</Label><Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add student'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
