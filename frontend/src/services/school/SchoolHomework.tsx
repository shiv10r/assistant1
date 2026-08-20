import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { ClipboardList, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Homework, SchoolClass } from './types'
import { HOMEWORK_SEED, CLASS_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { fmtDate, todayISO } from '../../lib/utils'

export default function SchoolHomework() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items, add, update, remove } = useLocalCollection<Homework>('school:homework', HOMEWORK_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Homework | null>(null)
  const [form, setForm] = useState({ classId: classes[0]?.id ?? '', subject: '', title: '', description: '', dueDate: todayISO(), status: 'draft' as Homework['status'] })

  const filtered = useMemo(
    () => items.filter((h) => `${h.title} ${h.subject} ${h.className}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Homework>[] = [
    { key: 'title', header: 'Title', render: (h) => <span className="font-medium">{h.title}</span>, sortValue: (h) => h.title },
    { key: 'className', header: 'Class', render: (h) => h.className, sortValue: (h) => h.className },
    { key: 'subject', header: 'Subject', render: (h) => h.subject },
    { key: 'dueDate', header: 'Due', render: (h) => fmtDate(h.dueDate), sortValue: (h) => h.dueDate },
    { key: 'status', header: 'Status', render: (h) => <StatusBadge status={h.status} />, sortValue: (h) => h.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ classId: classes[0]?.id ?? '', subject: '', title: '', description: '', dueDate: todayISO(), status: 'draft' })
    setModalOpen(true)
  }

  function openEdit(h: Homework) {
    setEditing(h)
    setForm({ classId: h.classId, subject: h.subject, title: h.title, description: h.description, dueDate: h.dueDate, status: h.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    const cls = classes.find((c) => c.id === form.classId)
    const payload = { ...form, className: cls ? `${cls.name} - ${cls.section}` : '' }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const published = items.filter((h) => h.status === 'published').length
  const dueSoon = items.filter((h) => h.dueDate >= todayISO() && h.dueDate <= todayISO().slice(0, 8) + '99').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Homework" value={items.length} icon={<ClipboardList className="w-5 h-5" />} tone="info" />
        <KPICard label="Published" value={published} icon={<ClipboardList className="w-5 h-5" />} tone="success" />
        <KPICard label="Due soon" value={dueSoon} icon={<ClipboardList className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Homework & assignments</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add homework</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(h) => h.id}
            pageSize={10}
            exportFilename="school-homework"
            emptyIcon={<ClipboardList className="w-6 h-6" />}
            emptyTitle="No homework yet"
            emptyDescription="Create homework for a class and subject."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search homework..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(h) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(h)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(h.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit homework' : 'Add homework'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div>
              <Label>Due date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Homework['status'] })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add homework'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}