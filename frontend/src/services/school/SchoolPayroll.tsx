import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Banknote, Plus, Pencil, Trash2, Search, BadgeCheck } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { PayrollRecord, StaffMember } from './types'
import { PAYROLL_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { money } from '../../components/ui'

export default function SchoolPayroll() {
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items, add, update, remove } = useLocalCollection<PayrollRecord>('school:payroll', PAYROLL_SEED)
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState('2026-08')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PayrollRecord | null>(null)
  const [form, setForm] = useState({ staffId: staff[0]?.id ?? '', month: month, basic: 0, hra: 0, allowances: 0, deductions: 0, status: 'draft' as PayrollRecord['status'] })

  const filtered = useMemo(
    () => items.filter((p) => (month === 'all' || p.month === month) && `${p.staffName} ${p.month}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, month]
  )

  const net = Number(form.basic) + Number(form.hra) + Number(form.allowances) - Number(form.deductions)

  const columns: DataColumn<PayrollRecord>[] = [
    { key: 'staffName', header: 'Staff', render: (p) => <span className="font-medium">{p.staffName}</span>, sortValue: (p) => p.staffName },
    { key: 'month', header: 'Month', render: (p) => p.month, sortValue: (p) => p.month },
    { key: 'basic', header: 'Basic', render: (p) => money(p.basic), hideOnMobile: true },
    { key: 'deductions', header: 'Deductions', render: (p) => <span className="text-red-600">−{money(p.deductions)}</span>, hideOnMobile: true },
    { key: 'net', header: 'Net pay', render: (p) => <span className="font-semibold text-emerald-600">{money(p.net)}</span>, sortValue: (p) => p.net },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status },
  ]

  const months = useMemo(() => [...new Set(items.map((p) => p.month))].sort().reverse(), [items])

  function openAdd() {
    setEditing(null)
    setForm({ staffId: staff[0]?.id ?? '', month: month === 'all' ? '2026-08' : month, basic: 0, hra: 0, allowances: 0, deductions: 0, status: 'draft' })
    setModalOpen(true)
  }

  function openEdit(p: PayrollRecord) {
    setEditing(p)
    setForm({ staffId: p.staffId, month: p.month, basic: p.basic, hra: p.hra, allowances: p.allowances, deductions: p.deductions, status: p.status })
    setModalOpen(true)
  }

  function save() {
    const person = staff.find((s) => s.id === form.staffId)
    const payload = { ...form, staffName: person?.name ?? '', basic: Number(form.basic), hra: Number(form.hra), allowances: Number(form.allowances), deductions: Number(form.deductions), net: Number(form.basic) + Number(form.hra) + Number(form.allowances) - Number(form.deductions) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const totalNet = items.reduce((s, p) => s + p.net, 0)
  const paid = items.filter((p) => p.status === 'paid').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Payroll records" value={items.length} icon={<Banknote className="w-5 h-5" />} tone="info" />
        <KPICard label="Total net pay" value={money(totalNet)} icon={<Banknote className="w-5 h-5" />} tone="success" />
        <KPICard label="Paid" value={paid} icon={<Banknote className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Payroll</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add record</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="school-payroll"
            emptyIcon={<Banknote className="w-6 h-6" />}
            emptyTitle="No payroll records"
            emptyDescription="Generate payroll for a month to pay staff."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={month} onValueChange={setMonth} className="w-36">
                  <option value="all">All months</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
            }
            actions={(p) => (
              <div className="flex gap-1">
                {p.status === 'draft' && (
                  <Button variant="ghost" size="icon" onClick={() => update(p.id, { status: 'processed' })} aria-label="Process"><BadgeCheck className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit record' : 'Add record'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff member</Label>
              <Select value={form.staffId} onValueChange={(v) => setForm({ ...form, staffId: v })}>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div><Label>Month</Label><Input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="2026-08" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Basic</Label><Input type="number" value={form.basic} onChange={(e) => setForm({ ...form, basic: Number(e.target.value) })} /></div>
            <div><Label>HRA</Label><Input type="number" value={form.hra} onChange={(e) => setForm({ ...form, hra: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Allowances</Label><Input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })} /></div>
            <div><Label>Deductions</Label><Input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })} /></div>
          </div>
          <p className="text-sm"><span className="text-muted">Net pay: </span><span className="font-semibold text-emerald-600">{money(net)}</span></p>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PayrollRecord['status'] })}>
              <option value="draft">Draft</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add record'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}