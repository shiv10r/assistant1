import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Label, Modal, Empty } from '../../components/ui'
import { Users, Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { StaffMember } from './types'
import { STAFF_SEED } from './seed'
import { todayISO } from '../../lib/utils'

const emptyForm = { name: '', role: '', phone: '' }

export default function WarehouseStaff() {
  const { items, add, update, remove } = useLocalCollection<StaffMember>('warehouse:staff', STAFF_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(
    () => items.filter((s) => `${s.name} ${s.role}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(s: StaffMember) { setEditing(s); setForm({ name: s.name, role: s.role, phone: s.phone }); setModalOpen(true) }

  function save() {
    if (!form.name.trim()) return
    if (editing) update(editing.id, form)
    else add({ id: genId(), status: 'active', ...form })
    setModalOpen(false)
  }

  function markAttendance(s: StaffMember, status: 'present' | 'absent') {
    update(s.id, { lastAttendance: status, lastAttendanceDate: todayISO() })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Staff Management</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add staff</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search staff..." className="pl-12" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<Users className="w-6 h-6" />} title="No staff yet" description="Add your first staff member." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Phone</TableHead><TableHead>Today's attendance</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const markedToday = s.lastAttendanceDate === todayISO()
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>
                        {markedToday ? (
                          <Badge variant={s.lastAttendance === 'present' ? 'success' : 'danger'}>{s.lastAttendance}</Badge>
                        ) : (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => markAttendance(s, 'present')}><Check className="w-3.5 h-3.5" /> Present</Button>
                            <Button variant="outline" size="sm" onClick={() => markAttendance(s, 'absent')}><X className="w-3.5 h-3.5" /> Absent</Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit staff' : 'Add staff'} size="md">
        <div className="space-y-4">
          <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add staff'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
