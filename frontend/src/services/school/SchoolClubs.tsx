import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Club } from './types'
import { CLUB_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolClubs() {
  const { items, add, update, remove } = useLocalCollection<Club>('school:clubs', CLUB_SEED)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Club | null>(null)
  const [form, setForm] = useState({ name: '', coordinator: '', category: '', members: 0, schedule: '', status: 'active' as Club['status'] })

  const columns: DataColumn<Club>[] = [
    { key: 'name', header: 'Club', render: (c) => <span className="font-medium">{c.name}</span>, sortValue: (c) => c.name },
    { key: 'category', header: 'Category', render: (c) => c.category, sortValue: (c) => c.category },
    { key: 'coordinator', header: 'Coordinator', render: (c) => c.coordinator },
    { key: 'members', header: 'Members', render: (c) => c.members, sortValue: (c) => c.members },
    { key: 'schedule', header: 'Schedule', render: (c) => c.schedule, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', coordinator: '', category: '', members: 0, schedule: '', status: 'active' })
    setModalOpen(true)
  }

  function openEdit(c: Club) {
    setEditing(c)
    setForm({ name: c.name, coordinator: c.coordinator, category: c.category, members: c.members, schedule: c.schedule, status: c.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { ...form, members: Number(form.members) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const active = items.filter((c) => c.status === 'active').length
  const totalMembers = items.reduce((s, c) => s + c.members, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Clubs" value={items.length} icon={<Users className="w-5 h-5" />} tone="info" />
        <KPICard label="Active" value={active} icon={<Users className="w-5 h-5" />} tone="success" />
        <KPICard label="Total members" value={totalMembers} icon={<Users className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Student clubs</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add club</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(c) => c.id}
            pageSize={10}
            exportFilename="school-clubs"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No clubs yet"
            emptyDescription="Create clubs for student activities."
            actions={(c) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit club' : 'Add club'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Club name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="STEM, Arts, Sports..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Coordinator</Label><Input value={form.coordinator} onChange={(e) => setForm({ ...form, coordinator: e.target.value })} /></div>
            <div><Label>Members</Label><Input type="number" value={form.members} onChange={(e) => setForm({ ...form, members: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Schedule</Label><Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Wed 4-5 PM" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Club['status'] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add club'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}