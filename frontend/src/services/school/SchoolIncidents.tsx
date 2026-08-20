import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { Siren, Plus, Pencil, Trash2, Search, Eye, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { IncidentRecord } from './types'
import { INCIDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolIncidents() {
  const { items, add, update, remove } = useLocalCollection<IncidentRecord>('school:incidents', INCIDENT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<IncidentRecord | null>(null)
  const [form, setForm] = useState({ type: '', severity: 'medium' as IncidentRecord['severity'], date: new Date().toISOString().slice(0, 10), location: '', description: '', actions: '', status: 'reported' as IncidentRecord['status'] })

  const filtered = useMemo(
    () => items.filter((i) => `${i.type} ${i.location} ${i.description}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<IncidentRecord>[] = [
    { key: 'type', header: 'Type', render: (i) => <span className="font-medium">{i.type}</span>, sortValue: (i) => i.type },
    { key: 'severity', header: 'Severity', render: (i) => <StatusBadge status={i.severity} />, sortValue: (i) => i.severity },
    { key: 'date', header: 'Date', render: (i) => i.date.slice(0, 10), sortValue: (i) => i.date },
    { key: 'location', header: 'Location', render: (i) => i.location, hideOnMobile: true },
    { key: 'description', header: 'Description', render: (i) => <span className="text-muted text-sm">{i.description.length > 40 ? i.description.slice(0, 40) + '…' : i.description}</span>, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} />, sortValue: (i) => i.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ type: '', severity: 'medium', date: new Date().toISOString().slice(0, 10), location: '', description: '', actions: '', status: 'reported' })
    setModalOpen(true)
  }

  function openEdit(i: IncidentRecord) {
    setEditing(i)
    setForm({ type: i.type, severity: i.severity, date: i.date, location: i.location, description: i.description, actions: i.actions, status: i.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.type.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const open = items.filter((i) => i.status === 'reported').length
  const critical = items.filter((i) => i.severity === 'critical').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Incidents" value={items.length} icon={<Siren className="w-5 h-5" />} tone="info" />
        <KPICard label="Reported" value={open} icon={<Siren className="w-5 h-5" />} tone="danger" />
        <KPICard label="Critical" value={critical} icon={<Siren className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Incident reporting</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Report incident</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(i) => i.id}
            pageSize={10}
            exportFilename="school-incidents"
            emptyIcon={<Siren className="w-6 h-6" />}
            emptyTitle="No incidents"
            emptyDescription="Record safety and security incidents."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search incidents..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(i) => (
              <div className="flex gap-1">
                {i.status === 'reported' && <Button variant="ghost" size="icon" onClick={() => update(i.id, { status: 'investigating' })} aria-label="Investigate"><Eye className="w-4 h-4 text-emerald-500" /></Button>}
                {i.status !== 'resolved' && <Button variant="ghost" size="icon" onClick={() => update(i.id, { status: 'resolved' })} aria-label="Resolve"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => openEdit(i)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(i.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit incident' : 'Report incident'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Medical, Fire, Bullying..." /></div>
            <div>
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as IncidentRecord['severity'] })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Actions taken</Label><Textarea value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as IncidentRecord['status'] })}>
              <option value="reported">Reported</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Report incident'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}