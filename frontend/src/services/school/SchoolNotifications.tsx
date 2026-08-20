import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { Bell, Plus, Pencil, Trash2, Search, CheckCheck, Star } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Notification } from './types'
import { NOTIFICATION_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolNotifications() {
  const { items, add, update, remove } = useLocalCollection<Notification>('school:notifications', NOTIFICATION_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Notification | null>(null)
  const [form, setForm] = useState({ title: '', body: '', type: 'info' as Notification['type'], audience: 'all', important: false, read: false, date: new Date().toISOString().slice(0, 10) })

  const filtered = useMemo(
    () => items.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Notification>[] = [
    { key: 'title', header: 'Title', render: (n) => (
      <div className="flex items-center gap-2"><span className={`font-medium ${!n.read ? 'text-primary' : ''}`}>{n.title}</span>{n.important && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}</div>
    ), sortValue: (n) => n.title },
    { key: 'type', header: 'Type', render: (n) => <StatusBadge status={n.type} />, sortValue: (n) => n.type },
    { key: 'audience', header: 'Audience', render: (n) => <span className="capitalize">{n.audience}</span> },
    { key: 'date', header: 'Date', render: (n) => n.date.slice(0, 10), sortValue: (n) => n.date },
    { key: 'read', header: 'Read', render: (n) => n.read ? <span className="text-emerald-600 text-sm font-medium">Read</span> : <span className="text-amber-600 text-sm font-medium">Unread</span> },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', body: '', type: 'info', audience: 'all', important: false, read: false, date: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }

  function openEdit(n: Notification) {
    setEditing(n)
    setForm({ title: n.title, body: n.body, type: n.type, audience: n.audience, important: n.important, read: n.read, date: n.date })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const unread = items.filter((n) => !n.read).length
  const important = items.filter((n) => n.important).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Notifications" value={items.length} icon={<Bell className="w-5 h-5" />} tone="info" />
        <KPICard label="Unread" value={unread} icon={<Bell className="w-5 h-5" />} tone="warning" />
        <KPICard label="Important" value={important} icon={<Bell className="w-5 h-5" />} tone="danger" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>In-app notifications</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add notification</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(n) => n.id}
            pageSize={10}
            exportFilename="school-notifications"
            emptyIcon={<Bell className="w-6 h-6" />}
            emptyTitle="No notifications"
            emptyDescription="Create notifications for the school app."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(n) => (
              <div className="flex gap-1">
                {!n.read && (
                  <Button variant="ghost" size="icon" onClick={() => update(n.id, { read: true })} aria-label="Mark read"><CheckCheck className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => update(n.id, { important: !n.important })} aria-label="Toggle important"><Star className={`w-4 h-4 ${n.important ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(n)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(n.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit notification' : 'Add notification'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Notification['type'] })}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="alert">Alert</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
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
              <input type="checkbox" checked={form.important} onChange={(e) => setForm({ ...form, important: e.target.checked })} className="w-4 h-4 accent-primary" />
              Important
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add notification'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}