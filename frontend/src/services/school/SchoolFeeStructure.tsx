import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Wallet, Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { FeeStructure, SchoolClass } from './types'
import { FEE_STRUCTURE_SEED, CLASS_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { money } from '../../components/ui'

export default function SchoolFeeStructure() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items, add, update, remove } = useLocalCollection<FeeStructure>('school:fee-structure', FEE_STRUCTURE_SEED)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FeeStructure | null>(null)
  const [form, setForm] = useState({ name: '', className: '', amount: 0, frequency: 'monthly' as FeeStructure['frequency'], dueDay: 10 })

  const monthlyTotal = items.reduce((s, f) => {
    const perMonth = f.frequency === 'monthly' ? f.amount : f.frequency === 'quarterly' ? f.amount / 3 : f.amount / 12
    return s + perMonth
  }, 0)

  const columns: DataColumn<FeeStructure>[] = [
    { key: 'name', header: 'Fee type', render: (f) => <span className="font-medium capitalize">{f.name}</span>, sortValue: (f) => f.name },
    { key: 'className', header: 'Class', render: (f) => f.className, sortValue: (f) => f.className },
    { key: 'amount', header: 'Amount', render: (f) => money(f.amount), sortValue: (f) => f.amount },
    { key: 'frequency', header: 'Frequency', render: (f) => <span className="capitalize">{f.frequency}</span>, sortValue: (f) => f.frequency },
    { key: 'dueDay', header: 'Due day', render: (f) => f.dueDay, sortValue: (f) => f.dueDay },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', className: classes[0]?.name ? `${classes[0].name} - ${classes[0].section}` : '', amount: 0, frequency: 'monthly', dueDay: 10 })
    setModalOpen(true)
  }

  function openEdit(f: FeeStructure) {
    setEditing(f)
    setForm({ name: f.name, className: f.className, amount: f.amount, frequency: f.frequency, dueDay: f.dueDay })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Fee structures" value={items.length} icon={<Wallet className="w-5 h-5" />} tone="info" />
        <KPICard label="Monthly revenue" value={money(Math.round(monthlyTotal))} icon={<Wallet className="w-5 h-5" />} tone="success" />
        <KPICard label="Yearly projection" value={money(Math.round(monthlyTotal * 12))} icon={<Wallet className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Fee structures</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add structure</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(f) => f.id}
            pageSize={10}
            exportFilename="school-fee-structure"
            emptyIcon={<Wallet className="w-6 h-6" />}
            emptyTitle="No fee structures"
            emptyDescription="Define fees for each class and frequency."
            actions={(f) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(f.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit structure' : 'Add structure'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Fee type</Label>
              <Select value={form.name} onValueChange={(v) => setForm({ ...form, name: v })}>
                <option value="">Select type...</option>
                <option value="tuition">Tuition</option>
                <option value="transport">Transport</option>
                <option value="lab">Lab</option>
                <option value="library">Library</option>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={form.className} onValueChange={(v) => setForm({ ...form, className: v })}>
                {classes.map((c) => <option key={c.id} value={`${c.name} - ${c.section}`}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as FeeStructure['frequency'] })}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>
            <div><Label>Due day</Label><Input type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add structure'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}