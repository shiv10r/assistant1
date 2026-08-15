import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { CalendarDays, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { CalendarEvent } from './types'
import { EVENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'

export default function SchoolEvents() {
  const { items, add, update, remove } = useLocalCollection<CalendarEvent>('school:events', EVENT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState({ title: '', date: '', venue: '', audience: 'all', description: '' })

  const filtered = useMemo(
    () => items.filter((e) => `${e.title} ${e.venue} ${e.description}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<CalendarEvent>[] = [
    { key: 'title', header: 'Event', render: (e) => <span className="font-medium">{e.title}</span>, sortValue: (e) => e.title },
    { key: 'date', header: 'Date', render: (e) => e.date.slice(0, 10), sortValue: (e) => e.date },
    { key: 'venue', header: 'Venue', render: (e) => e.venue || <span className="text-muted text-sm">—</span> },
    { key: 'audience', header: 'Audience', render: (e) => <span className="capitalize">{e.audience}</span>, sortValue: (e) => e.audience },
    { key: 'description', header: 'Description', render: (e) => <span className="text-muted text-sm">{e.description || '—'}</span>, hideOnMobile: true },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ title: '', date: '', venue: '', audience: 'all', description: '' })
    setModalOpen(true)
  }

  function openEdit(e: CalendarEvent) {
    setEditing(e)
    setForm({ title: e.title, date: e.date, venue: e.venue, audience: e.audience, description: e.description })
    setModalOpen(true)
  }

  function save() {
    if (!form.title.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = items.filter((e) => e.date >= today).length
  const thisMonth = items.filter((e) => e.date.startsWith(today.slice(0, 7))).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Events" value={items.length} icon={<CalendarDays className="w-5 h-5" />} tone="info" />
        <KpiCard label="Upcoming" value={upcoming} icon={<CalendarDays className="w-5 h-5" />} tone="success" />
        <KpiCard label="This month" value={thisMonth} icon={<CalendarDays className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>School calendar</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add event</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(e) => e.id}
            pageSize={10}
            exportFilename="school-events"
            emptyIcon={<CalendarDays className="w-6 h-6" />}
            emptyTitle="No events"
            emptyDescription="Add events to the school calendar."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search events..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(e) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(e.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit event' : 'Add event'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="staff">Staff</option>
                <option value="parents">Parents</option>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add event'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}