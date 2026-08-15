import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { MessageSquare, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Message } from './types'
import { MESSAGE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolMessaging() {
  const { items, add, update, remove } = useLocalCollection<Message>('school:messages', MESSAGE_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Message | null>(null)
  const [form, setForm] = useState({ to: '', subject: '', body: '', channel: 'email' as Message['channel'], status: 'sent' as Message['status'], sentAt: new Date().toISOString().slice(0, 10) })

  const filtered = useMemo(
    () => items.filter((m) => `${m.to} ${m.subject}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Message>[] = [
    { key: 'to', header: 'To', render: (m) => <span className="font-medium">{m.to}</span>, sortValue: (m) => m.to },
    { key: 'subject', header: 'Subject', render: (m) => m.subject },
    { key: 'channel', header: 'Channel', render: (m) => <span className="uppercase text-xs text-muted">{m.channel}</span>, sortValue: (m) => m.channel },
    { key: 'sentAt', header: 'Date', render: (m) => m.sentAt.slice(0, 10), sortValue: (m) => m.sentAt },
    { key: 'status', header: 'Status', render: (m) => <StatusBadge status={m.status} />, sortValue: (m) => m.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ to: '', subject: '', body: '', channel: 'email', status: 'sent', sentAt: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }

  function openEdit(m: Message) {
    setEditing(m)
    setForm({ to: m.to, subject: m.subject, body: m.body, channel: m.channel, status: m.status, sentAt: m.sentAt })
    setModalOpen(true)
  }

  function save() {
    if (!form.subject.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const sent = items.filter((m) => m.status === 'sent').length
  const failed = items.filter((m) => m.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Messages" value={items.length} icon={<MessageSquare className="w-5 h-5" />} tone="info" />
        <KpiCard label="Sent" value={sent} icon={<MessageSquare className="w-5 h-5" />} tone="success" />
        <KpiCard label="Failed" value={failed} icon={<MessageSquare className="w-5 h-5" />} tone="danger" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Bulk messaging</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> New message</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(m) => m.id}
            pageSize={10}
            exportFilename="school-messages"
            emptyIcon={<MessageSquare className="w-6 h-6" />}
            emptyTitle="No messages"
            emptyDescription="Send emails, SMS or WhatsApp to parents and staff."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search messages..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(m) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(m.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit message' : 'New message'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Recipient(s)</Label><Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="All Parents" /></div>
            <div>
              <Label>Channel</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v as Message['channel'] })}>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="inapp">In-app</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Message['status'] })}>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </Select>
            </div>
          </div>
          <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Send message'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}