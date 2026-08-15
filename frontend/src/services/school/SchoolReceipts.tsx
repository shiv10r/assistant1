import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Textarea } from '../../components/ui'
import { ReceiptText, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Receipt, Student } from './types'
import { RECEIPT_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { money } from '../../components/ui'

export default function SchoolReceipts() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, add, update, remove } = useLocalCollection<Receipt>('school:receipts', RECEIPT_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Receipt | null>(null)
  const [form, setForm] = useState({ studentId: students[0]?.id ?? '', amount: 0, method: 'cash' as Receipt['method'], date: new Date().toISOString().slice(0, 10), items: '' })

  const filtered = useMemo(
    () => items.filter((r) => `${r.receiptNo} ${r.studentName}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<Receipt>[] = [
    { key: 'receiptNo', header: 'Receipt no', render: (r) => <span className="font-medium">{r.receiptNo}</span>, sortValue: (r) => r.receiptNo },
    { key: 'studentName', header: 'Student', render: (r) => r.studentName, sortValue: (r) => r.studentName },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">{money(r.amount)}</span>, sortValue: (r) => r.amount },
    { key: 'method', header: 'Method', render: (r) => <span className="uppercase text-xs text-muted">{r.method}</span>, sortValue: (r) => r.method },
    { key: 'date', header: 'Date', render: (r) => r.date.slice(0, 10), sortValue: (r) => r.date },
    { key: 'items', header: 'Items', render: (r) => r.items.join(', ') || <span className="text-muted text-sm">—</span>, hideOnMobile: true },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ studentId: students[0]?.id ?? '', amount: 0, method: 'cash', date: new Date().toISOString().slice(0, 10), items: '' })
    setModalOpen(true)
  }

  function openEdit(r: Receipt) {
    setEditing(r)
    setForm({ studentId: r.studentId, amount: r.amount, method: r.method, date: r.date, items: r.items.join('\n') })
    setModalOpen(true)
  }

  function save() {
    const student = students.find((s) => s.id === form.studentId)
    const payload = {
      ...form,
      studentName: student?.name ?? '',
      amount: Number(form.amount),
      items: form.items.split('\n').map((s) => s.trim()).filter(Boolean),
      receiptNo: editing?.receiptNo ?? `RCPT-2026-${String(items.length + 1).padStart(4, '0')}`,
    }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const totalCollected = items.reduce((s, r) => s + r.amount, 0)
  const thisMonth = items.filter((r) => r.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Receipts" value={items.length} icon={<ReceiptText className="w-5 h-5" />} tone="info" />
        <KpiCard label="Total collected" value={money(totalCollected)} icon={<ReceiptText className="w-5 h-5" />} tone="success" />
        <KpiCard label="This month" value={money(thisMonth)} icon={<ReceiptText className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Receipts</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add receipt</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(r) => r.id}
            pageSize={10}
            exportFilename="school-receipts"
            emptyIcon={<ReceiptText className="w-6 h-6" />}
            emptyTitle="No receipts yet"
            emptyDescription="Record fee payments to generate receipts."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search receipts..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit receipt' : 'Add receipt'} size="md">
        <div className="space-y-4">
          <div>
            <Label>Student</Label>
            <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div>
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as Receipt['method'] })}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
              </Select>
            </div>
          </div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div><Label>Items (one per line)</Label><Textarea value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder={'Tuition - Term 1\nTransport - August'} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add receipt'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}