import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Users, Phone, Plus, Pencil, Trash2, Search, Mail } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ParentRecord, Student } from './types'
import { PARENT_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolParents() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, add, update, remove } = useLocalCollection<ParentRecord>('school:parents', PARENT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ParentRecord | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', occupation: '', address: '', childIds: [] as string[], status: 'active' as ParentRecord['status'] })

  const filtered = useMemo(
    () => items.filter((p) => `${p.name} ${p.phone} ${p.email ?? ''}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? id

  const columns: DataColumn<ParentRecord>[] = [
    { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span>, sortValue: (p) => p.name },
    { key: 'phone', header: 'Phone', render: (p) => <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted" />{p.phone}</span> },
    { key: 'email', header: 'Email', render: (p) => p.email ? <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted" />{p.email}</span> : '—' },
    { key: 'occupation', header: 'Occupation', render: (p) => p.occupation ?? '—' },
    { key: 'children', header: 'Children', render: (p) => (
      <div className="flex flex-wrap gap-1">
        {p.childIds.map((id) => <Badge key={id} variant="outline" size="sm">{nameOf(id)}</Badge>)}
        {p.childIds.length === 0 && <span className="text-muted text-sm">—</span>}
      </div>
    ) },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', phone: '', email: '', occupation: '', address: '', childIds: [], status: 'active' })
    setModalOpen(true)
  }

  function openEdit(p: ParentRecord) {
    setEditing(p)
    setForm({ name: p.name, phone: p.phone, email: p.email ?? '', occupation: p.occupation ?? '', address: p.address ?? '', childIds: p.childIds, status: p.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim() || !form.phone.trim()) return
    const payload = { ...form, childIds: form.childIds }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const activeCount = items.filter((p) => p.status === 'active').length
  const linkedStudents = items.reduce((s, p) => s + p.childIds.length, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Parents" value={items.length} icon={<Users className="w-5 h-5" />} tone="info" />
        <KpiCard label="Active" value={activeCount} icon={<Users className="w-5 h-5" />} tone="success" />
        <KpiCard label="Student links" value={linkedStudents} icon={<Users className="w-5 h-5" />} tone="default" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Parents</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add parent</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="school-parents"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No parents yet"
            emptyDescription="Add a parent to link them with students."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search name, phone or email..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(p) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit parent' : 'Add parent'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label required>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} /></div>
          </div>
          <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div>
            <Label>Linked students</Label>
            <Select value={form.childIds[0] ?? ''} onValueChange={(v) => setForm({ ...form, childIds: v ? [v] : [] })}>
              <option value="">None</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.className}</option>)}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ParentRecord['status'] })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add parent'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}