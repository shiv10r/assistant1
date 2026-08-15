import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { UtensilsCrossed, Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { MealPlan } from './types'
import { MEAL_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'
import { money } from '../../components/ui'

export default function SchoolCafeteria() {
  const { items, add, update, remove } = useLocalCollection<MealPlan>('school:meals', MEAL_SEED)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MealPlan | null>(null)
  const [form, setForm] = useState({ name: '', type: 'lunch' as MealPlan['type'], items: '', costPerMeal: 0, status: 'active' as MealPlan['status'] })

  const columns: DataColumn<MealPlan>[] = [
    { key: 'name', header: 'Meal plan', render: (m) => <span className="font-medium">{m.name}</span>, sortValue: (m) => m.name },
    { key: 'type', header: 'Type', render: (m) => <span className="capitalize">{m.type}</span>, sortValue: (m) => m.type },
    { key: 'items', header: 'Menu', render: (m) => m.items },
    { key: 'costPerMeal', header: 'Cost/meal', render: (m) => money(m.costPerMeal), sortValue: (m) => m.costPerMeal },
    { key: 'status', header: 'Status', render: (m) => <StatusBadge status={m.status} />, sortValue: (m) => m.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ name: '', type: 'lunch', items: '', costPerMeal: 0, status: 'active' })
    setModalOpen(true)
  }

  function openEdit(m: MealPlan) {
    setEditing(m)
    setForm({ name: m.name, type: m.type, items: m.items, costPerMeal: m.costPerMeal, status: m.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim()) return
    const payload = { ...form, costPerMeal: Number(form.costPerMeal) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const active = items.filter((m) => m.status === 'active').length
  const avgCost = active ? Math.round(items.filter((m) => m.status === 'active').reduce((s, m) => s + m.costPerMeal, 0) / active) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Meal plans" value={items.length} icon={<UtensilsCrossed className="w-5 h-5" />} tone="info" />
        <KpiCard label="Active" value={active} icon={<UtensilsCrossed className="w-5 h-5" />} tone="success" />
        <KpiCard label="Avg cost/meal" value={money(avgCost)} icon={<UtensilsCrossed className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Menu & meal plans</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add meal plan</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(m) => m.id}
            pageSize={10}
            exportFilename="school-meals"
            emptyIcon={<UtensilsCrossed className="w-6 h-6" />}
            emptyTitle="No meal plans"
            emptyDescription="Define cafeteria menus and pricing."
            actions={(m) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(m.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit meal plan' : 'Add meal plan'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MealPlan['type'] })}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
              </Select>
            </div>
          </div>
          <div><Label>Menu items</Label><Input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Cost per meal</Label><Input type="number" value={form.costPerMeal} onChange={(e) => setForm({ ...form, costPerMeal: Number(e.target.value) })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MealPlan['status'] })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add meal plan'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}