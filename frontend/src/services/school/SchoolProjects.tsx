import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Label, Modal, Empty, money } from '../../components/ui'
import { Briefcase, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { SchoolProject, SchoolProjectStatus } from './types'
import { PROJECT_SEED } from './seed'
import { fmtDate } from '../../lib/utils'

const emptyForm = { name: '', incharge: '', startDate: '', budget: '0' }
const STATUS_BADGE: Record<SchoolProjectStatus, 'default' | 'success' | 'info'> = { planned: 'info', active: 'default', completed: 'success' }

export default function SchoolProjects() {
  const { items, add, update, remove } = useLocalCollection<SchoolProject>('school:projects', PROJECT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolProject | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(
    () => items.filter((p) => `${p.name} ${p.incharge}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(p: SchoolProject) { setEditing(p); setForm({ name: p.name, incharge: p.incharge, startDate: p.startDate, budget: String(p.budget) }); setModalOpen(true) }

  function save() {
    if (!form.name.trim()) return
    const payload = { name: form.name.trim(), incharge: form.incharge.trim() || 'Unassigned', startDate: form.startDate || new Date().toISOString().slice(0, 10), budget: Number(form.budget) || 0 }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), status: 'planned', ...payload })
    setModalOpen(false)
  }

  function cycleStatus(p: SchoolProject) {
    const order: SchoolProjectStatus[] = ['planned', 'active', 'completed']
    const next = order[(order.indexOf(p.status) + 1) % order.length]
    update(p.id, { status: next })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Project Management</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add project</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search projects..." className="pl-12" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<Briefcase className="w-6 h-6" />} title="No projects yet" description="Add a school project or event to track it here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>In-charge</TableHead><TableHead>Start</TableHead><TableHead>Budget</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.incharge}</TableCell>
                    <TableCell>{fmtDate(p.startDate)}</TableCell>
                    <TableCell>{money(p.budget)}</TableCell>
                    <TableCell>
                      <button onClick={() => cycleStatus(p)}>
                        <Badge variant={STATUS_BADGE[p.status]}>{p.status}</Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit project' : 'Add project'} size="md">
        <div className="space-y-4">
          <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>In-charge</Label><Input value={form.incharge} onChange={(e) => setForm({ ...form, incharge: e.target.value })} /></div>
            <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
          </div>
          <div><Label>Budget</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add project'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
