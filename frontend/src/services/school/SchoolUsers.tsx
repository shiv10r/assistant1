import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { UserAccount } from './types'
import { USER_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolUsers() {
  const { items, add, update, remove } = useLocalCollection<UserAccount>('school:users', USER_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserAccount | null>(null)
  const [form, setForm] = useState({ name: '', role: '', email: '', status: 'active' as UserAccount['status'] })

  const filtered = useMemo(
    () => items.filter((u) => `${u.name} ${u.role} ${u.email}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<UserAccount>[] = [
    { key: 'name', header: 'User', render: (u) => <span className="font-medium">{u.name}</span>, sortValue: (u) => u.name },
    { key: 'role', header: 'Role', render: (u) => <span className="capitalize">{u.role}</span>, sortValue: (u) => u.role },
    { key: 'email', header: 'Email', render: (u) => u.email, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} />, sortValue: (u) => u.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', role: '', email: '', status: 'active' })
    setModalOpen(true)
  }

  function openEdit(u: UserAccount) {
    setEditing(u)
    setForm({ name: u.name, role: u.role, email: u.email, status: u.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), ...form })
    setModalOpen(false)
  }

  const active = items.filter((u) => u.status === 'active').length
  const roles = new Set(items.map((u) => u.role).filter(Boolean)).size

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Users" value={items.length} icon={<Users className="w-5 h-5" />} tone="info" />
        <KpiCard label="Active" value={active} icon={<Users className="w-5 h-5" />} tone="success" />
        <KpiCard label="Roles" value={roles} icon={<Users className="w-5 h-5" />} tone="default" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>User accounts</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add user</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(u) => u.id}
            pageSize={10}
            exportFilename="school-users"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No users"
            emptyDescription="Manage staff and admin accounts."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search users..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(u) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => update(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })} aria-label="Toggle"><Pencil className="w-4 h-4 text-muted" /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(u.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit user' : 'Add user'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="admin, teacher, accountant..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as UserAccount['status'] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add user'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}