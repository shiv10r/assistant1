import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { CalendarCheck, Plus, Pencil, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { LeaveRequest, StaffMember, Student } from './types'
import { LEAVE_SEED, STAFF_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolLeave() {
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, add, update, remove } = useLocalCollection<LeaveRequest>('school:leave', LEAVE_SEED)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LeaveRequest | null>(null)
  const [form, setForm] = useState({ personType: 'staff' as LeaveRequest['personType'], personId: '', kind: '', dateFrom: '', dateTo: '', reason: '', status: 'pending' as LeaveRequest['status'] })

  const filtered = useMemo(
    () => items.filter((l) => (statusFilter === 'all' || l.status === statusFilter) && `${l.personName} ${l.kind} ${l.reason}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, statusFilter]
  )

  const columns: DataColumn<LeaveRequest>[] = [
    { key: 'personName', header: 'Person', render: (l) => (
      <div><span className="font-medium">{l.personName}</span><p className="text-xs text-muted">{l.personType}</p></div>
    ), sortValue: (l) => l.personName },
    { key: 'kind', header: 'Leave type', render: (l) => l.kind, sortValue: (l) => l.kind },
    { key: 'dateFrom', header: 'From', render: (l) => l.dateFrom.slice(0, 10) },
    { key: 'dateTo', header: 'To', render: (l) => l.dateTo.slice(0, 10) },
    { key: 'reason', header: 'Reason', render: (l) => <span className="text-muted text-sm">{l.reason}</span> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} />, sortValue: (l) => l.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ personType: 'staff', personId: staff[0]?.id ?? '', kind: '', dateFrom: '', dateTo: '', reason: '', status: 'pending' })
    setModalOpen(true)
  }

  function openEdit(l: LeaveRequest) {
    setEditing(l)
    setForm({ personType: l.personType, personId: l.personId, kind: l.kind, dateFrom: l.dateFrom, dateTo: l.dateTo, reason: l.reason, status: l.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.kind.trim()) return
    const pool = form.personType === 'staff' ? staff : students
    const person = pool.find((p) => p.id === form.personId)
    const payload = { ...form, personName: person?.name ?? '' }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const pending = items.filter((l) => l.status === 'pending').length
  const approved = items.filter((l) => l.status === 'approved').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Leave requests" value={items.length} icon={<CalendarCheck className="w-5 h-5" />} tone="info" />
        <KPICard label="Pending" value={pending} icon={<CalendarCheck className="w-5 h-5" />} tone="warning" />
        <KPICard label="Approved" value={approved} icon={<CalendarCheck className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Leave management</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Request leave</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(l) => l.id}
            pageSize={10}
            exportFilename="school-leave"
            emptyIcon={<CalendarCheck className="w-6 h-6" />}
            emptyTitle="No leave requests"
            emptyDescription="Staff and student leave requests will appear here."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search leave..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter} className="w-36">
                  <option value="all">All status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
            }
            actions={(l) => (
              <div className="flex gap-1">
                {l.status === 'pending' && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => update(l.id, { status: 'approved' })} aria-label="Approve"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => update(l.id, { status: 'rejected' })} aria-label="Reject"><XCircle className="w-4 h-4 text-red-500" /></Button>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(l)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit leave request' : 'Request leave'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Person type</Label>
              <Select value={form.personType} onValueChange={(v) => {
                const t = v as LeaveRequest['personType']
                setForm({ ...form, personType: t, personId: (t === 'staff' ? staff : students)[0]?.id ?? '' })
              }}>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
              </Select>
            </div>
            <div>
              <Label>Person</Label>
              <Select value={form.personId} onValueChange={(v) => setForm({ ...form, personId: v })}>
                {(form.personType === 'staff' ? staff : students).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Leave type</Label><Input value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} placeholder="e.g. Sick Leave" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeaveRequest['status'] })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>From</Label><Input type="date" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} /></div>
            <div><Label>To</Label><Input type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} /></div>
          </div>
          <div><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Request leave'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}