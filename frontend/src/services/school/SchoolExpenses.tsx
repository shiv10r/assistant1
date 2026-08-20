import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { TrendingDown, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ExpenseRecord } from './types'
import { EXPENSE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { money } from '../../components/ui'
import { AdvancedPanel, type DonutDatum } from '../../components/AdvancedPanel'

export default function SchoolExpenses() {
  const { items, add, update, remove } = useLocalCollection<ExpenseRecord>('school:expenses', EXPENSE_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseRecord | null>(null)
  const [form, setForm] = useState({ category: '', description: '', amount: 0, paidTo: '', date: new Date().toISOString().slice(0, 10), method: 'cash' as ExpenseRecord['method'] })

  const filtered = useMemo(
    () => items.filter((e) => `${e.category} ${e.description} ${e.paidTo}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const categories = useMemo(() => [...new Set(items.map((e) => e.category).filter(Boolean))], [items])

  const donut: DonutDatum[] = useMemo(() => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    return categories.slice(0, 6).map((c, i) => ({
      label: c,
      value: items.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
      color: colors[i % colors.length],
    }))
  }, [categories, items])

  const columns: DataColumn<ExpenseRecord>[] = [
    { key: 'category', header: 'Category', render: (e) => <span className="font-medium capitalize">{e.category}</span>, sortValue: (e) => e.category },
    { key: 'description', header: 'Description', render: (e) => e.description, hideOnMobile: true },
    { key: 'amount', header: 'Amount', render: (e) => <span className="font-semibold text-red-600">{money(e.amount)}</span>, sortValue: (e) => e.amount },
    { key: 'paidTo', header: 'Paid to', render: (e) => e.paidTo || <span className="text-muted text-sm">—</span> },
    { key: 'date', header: 'Date', render: (e) => e.date.slice(0, 10), sortValue: (e) => e.date },
    { key: 'method', header: 'Method', render: (e) => <span className="uppercase text-xs text-muted">{e.method}</span> },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ category: '', description: '', amount: 0, paidTo: '', date: new Date().toISOString().slice(0, 10), method: 'cash' })
    setModalOpen(true)
  }

  function openEdit(e: ExpenseRecord) {
    setEditing(e)
    setForm({ category: e.category, description: e.description, amount: e.amount, paidTo: e.paidTo, date: e.date, method: e.method })
    setModalOpen(true)
  }

  function save() {
    if (!form.category.trim()) return
    const payload = { ...form, amount: Number(form.amount) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const total = items.reduce((s, e) => s + e.amount, 0)
  const thisMonth = items.filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Expenses" value={items.length} icon={<TrendingDown className="w-5 h-5" />} tone="info" />
        <KPICard label="Total spent" value={money(total)} icon={<TrendingDown className="w-5 h-5" />} tone="danger" />
        <KPICard label="This month" value={money(thisMonth)} icon={<TrendingDown className="w-5 h-5" />} tone="warning" />
      </div>

      {donut.length > 0 && (
        <AdvancedPanel title="Spend by category" subtitle="Where money is going" donut={donut} />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Expenses</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add expense</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(e) => e.id}
            pageSize={10}
            exportFilename="school-expenses"
            emptyIcon={<TrendingDown className="w-6 h-6" />}
            emptyTitle="No expenses"
            emptyDescription="Record school expenses to track spend."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search expenses..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit expense' : 'Add expense'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Maintenance" /></div>
            <div><Label>Paid to</Label><Input value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div>
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as ExpenseRecord['method'] })}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add expense'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}