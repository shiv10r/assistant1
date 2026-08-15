import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Modal } from '../../components/ui'
import { Boxes, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { StockItem } from './types'
import { STOCK_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'

const emptyForm = { sku: '', name: '', category: '', qty: '0', unit: 'pcs', reorderLevel: '0', unitPrice: '0' }

export default function SchoolInventory() {
  const { items, add, update, remove } = useLocalCollection<StockItem>('school:inventory', STOCK_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StockItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(
    () => items.filter((it) => `${it.sku} ${it.name} ${it.category}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<StockItem>[] = [
    { key: 'sku', header: 'SKU', render: (it) => <span className="font-mono text-xs">{it.sku}</span> },
    { key: 'name', header: 'Name', render: (it) => <span className="font-medium">{it.name}</span>, sortValue: (it) => it.name },
    { key: 'category', header: 'Category', render: (it) => it.category, sortValue: (it) => it.category },
    {
      key: 'stock', header: 'Stock', sortValue: (it) => it.qty,
      render: (it) => (
        <div className="flex items-center gap-2">
          <span>{it.qty} {it.unit}</span>
          {it.qty <= it.reorderLevel && <Badge variant="warning">reorder</Badge>}
        </div>
      ),
    },
    { key: 'unitPrice', header: 'Unit price', render: (it) => `₹${it.unitPrice}`, sortValue: (it) => it.unitPrice },
  ]

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(item: StockItem) {
    setEditing(item)
    setForm({ sku: item.sku, name: item.name, category: item.category, qty: String(item.qty), unit: item.unit, reorderLevel: String(item.reorderLevel), unitPrice: String(item.unitPrice) })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim() || !form.sku.trim()) return
    const payload = {
      sku: form.sku.trim(), name: form.name.trim(), category: form.category.trim() || 'General',
      qty: Number(form.qty) || 0, unit: form.unit.trim() || 'pcs', reorderLevel: Number(form.reorderLevel) || 0, unitPrice: Number(form.unitPrice) || 0,
    }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Inventory & Stock</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add item</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(it) => it.id}
            pageSize={10}
            exportFilename="school-inventory"
            emptyIcon={<Boxes className="w-6 h-6" />}
            emptyTitle="No inventory items"
            emptyDescription="Add your first item to start tracking stock."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search SKU, name or category..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(it) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(it)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit item' : 'Add item'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Quantity</Label><Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></div>
            <div><Label>Reorder level</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></div>
            <div><Label>Unit price</Label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add item'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
