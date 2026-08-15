import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Modal, Switch } from '../../components/ui'
import { Calendar, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { AcademicSession } from './types'
import { SESSION_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'

export default function SchoolSessions() {
  const { items, add, update, remove } = useLocalCollection<AcademicSession>('school:sessions', SESSION_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AcademicSession | null>(null)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false })

  const filtered = useMemo(
    () => items.filter((s) => `${s.name} ${s.startDate} ${s.endDate}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<AcademicSession>[] = [
    { key: 'name', header: 'Session', render: (s) => <span className="font-medium">{s.name}</span>, sortValue: (s) => s.name },
    { key: 'startDate', header: 'Start', render: (s) => s.startDate.slice(0, 10) },
    { key: 'endDate', header: 'End', render: (s) => s.endDate.slice(0, 10) },
    { key: 'isCurrent', header: 'Status', render: (s) => s.isCurrent ? <Badge variant="success" size="sm">Current</Badge> : <Badge variant="outline" size="sm">Past</Badge>, sortValue: (s) => (s.isCurrent ? 1 : 0) },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', startDate: '', endDate: '', isCurrent: false })
    setModalOpen(true)
  }

  function openEdit(s: AcademicSession) {
    setEditing(s)
    setForm({ name: s.name, startDate: s.startDate, endDate: s.endDate, isCurrent: s.isCurrent })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim() || !form.startDate || !form.endDate) return
    const payload = { ...form }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    if (form.isCurrent) {
      for (const s of items) {
        if (s.id !== (editing?.id ?? '') && s.isCurrent) update(s.id, { isCurrent: false })
      }
    }
    setModalOpen(false)
  }

  const current = items.find((s) => s.isCurrent)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Sessions" value={items.length} icon={<Calendar className="w-5 h-5" />} tone="info" />
        <KpiCard label="Current session" value={current?.name ?? '—'} icon={<Calendar className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Academic sessions</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add session</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(s) => s.id}
            pageSize={10}
            exportFilename="school-sessions"
            emptyIcon={<Calendar className="w-6 h-6" />}
            emptyTitle="No sessions yet"
            emptyDescription="Add an academic session to track the school year."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search sessions..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit session' : 'Add session'} size="md">
        <div className="space-y-4">
          <div><Label required>Session name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 2027-28" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><Label required>End date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Mark as current session</Label>
            <Switch checked={form.isCurrent} onCheckedChange={(v) => setForm({ ...form, isCurrent: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add session'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}