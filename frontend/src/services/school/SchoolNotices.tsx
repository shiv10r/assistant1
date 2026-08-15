import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { Megaphone, Plus, Pencil, Trash2, Search, Pin, Send } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Notice } from './types'
import { NOTICE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolNotices() {
  const { items, add, update, remove } = useLocalCollection<Notice>('school:notices', NOTICE_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' as Notice['audience'], category: '', date: new Date().toISOString().slice(0, 10), pinned: false, status: 'draft' as Notice['status'] })

  const filtered = useMemo(
    () => items.filter((n) => `${n.title} ${n.category}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Notice>[] = [
    { key: 'title', header: 'Title', render: (n) => (
      <div className="flex items-center gap-2"><span className="font-medium">{n.title}</span>{n.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}</div>
    ), sortValue: (n) => n.title },
    { key: 'category', header: 'Category', render: (n) => n.category || <span className="text-muted text-sm">—</span> },
    { key: 'audience', header: 'Audience', render: (n) => <span className="capitalize">{n.audience}</span>, sortValue: (n) => n.audience },
    { key: 'date', header: 'Date', render: (n) => n.date.slice(0, 10), sortValue: (n) => n.date },
    { key: 'status', header: 'Status', render: (n) => <StatusBadge status={n.status} />, sortValue: (n) => n.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', body: '', audience: 'all', category: '', date: new Date().toISOString().slice(0, 10), pinned: false, status: 'draft' })
    setModalOpen(true)
  }

  function openEdit(n: Notice) {
    setEditing(n)
    setForm({ title: n.title, body: n.body, audience: n.audience, category: n.category, date: n.date, pinned: n.pinned, status: n.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const published = items.filter((n) => n.status === 'published').length
  const pinned = items.filter((n) => n.pinned).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Notices" value={items.length} icon={<Megaphone className="w-5 h-5" />} tone="info" />
        <KpiCard label="Published" value={published} icon={<Megaphone className="w-5 h-5" />} tone="success" />
        <KpiCard label="Pinned" value={pinned} icon={<Megaphone className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Notices & announcements</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add notice</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(n) => n.id}
            pageSize={10}
            exportFilename="school-notices"
            emptyIcon={<Megaphone className="w-6 h-6" />}
            emptyTitle="No notices"
            emptyDescription="Publish notices for students, staff and parents."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search notices..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(n) => (
              <div className="flex gap-1">
                {n.status === 'draft' && (
                  <Button variant="ghost" size="icon" onClick={() => update(n.id, { status: 'published' })} aria-label="Publish"><Send className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => update(n.id, { pinned: !n.pinned })} aria-label="Toggle pin"><Pin className={`w-4 h-4 ${n.pinned ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(n)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(n.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit notice' : 'Add notice'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Event, Exam, Holiday..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v as Notice['audience'] })}>
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="staff">Staff</option>
                <option value="parents">Parents</option>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="flex items-center gap-6">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="w-4 h-4 accent-primary" />
              Pin to top
            </Label>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Notice['status'] })} className="w-36">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add notice'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}