import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Badge,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Boxes, Plus, Search, Pencil, SlidersHorizontal, History, Package, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { InventoryItem } from './types'
import { stockStatusOf, availableOf } from './types'
import { INVENTORY_SEED } from './seed'
import { money } from '../../lib/utils'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { Drawer } from './components/Drawer'
import { useStockLedger } from './ledger'
import { MOVEMENT_LABEL } from './ledger'

const emptyForm = {
  name: '', sku: '', category: '', brand: '', description: '', unit: 'pcs',
  barcode: '', weight: '', dimensions: '',
  unitPrice: '0', sellingPrice: '0', hsn: '', gstPct: '18',
  reorderLevel: '0', minStock: '0', maxStock: '0',
  isActive: true, trackBatch: false, trackSerial: false, trackExpiry: false,
}

export default function WarehouseProducts() {
  const { items, add, update, remove } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { movements } = useStockLedger()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [detail, setDetail] = useState<InventoryItem | null>(null)

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))), [items])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return items.filter((i) => {
      const matchesQ = `${i.name} ${i.sku} ${i.barcode ?? ''} ${i.category} ${i.brand}`.toLowerCase().includes(q)
      const matchesC = category === 'all' || i.category === category
      return matchesQ && matchesC
    })
  }, [items, query, category])

  const detailMovements = useMemo(
    () => (detail ? movements.filter((m) => m.itemId === detail.id).slice(0, 8) : []),
    [movements, detail]
  )

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(i: InventoryItem) {
    setEditing(i)
    setForm({
      name: i.name, sku: i.sku, category: i.category, brand: i.brand, description: i.description, unit: i.unit,
      barcode: i.barcode ?? '', weight: i.weight ?? '', dimensions: i.dimensions ?? '',
      unitPrice: String(i.unitPrice), sellingPrice: String(i.sellingPrice), hsn: i.hsn, gstPct: String(i.gstPct),
      reorderLevel: String(i.reorderLevel), minStock: String(i.minStock), maxStock: String(i.maxStock),
      isActive: i.isActive, trackBatch: i.trackBatch, trackSerial: i.trackSerial, trackExpiry: i.trackExpiry,
    })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim() || !form.sku.trim()) {
      toast({ title: 'Product name and SKU are required', variant: 'error' })
      return
    }
    const patch = {
      name: form.name.trim(), sku: form.sku.trim(), category: form.category.trim(), brand: form.brand.trim(),
      description: form.description.trim(), unit: form.unit.trim() || 'pcs',
      barcode: form.barcode.trim() || undefined, weight: form.weight.trim() || undefined, dimensions: form.dimensions.trim() || undefined,
      unitPrice: Number(form.unitPrice) || 0, sellingPrice: Number(form.sellingPrice) || 0, hsn: form.hsn.trim(), gstPct: Number(form.gstPct) || 0,
      reorderLevel: Number(form.reorderLevel) || 0, minStock: Number(form.minStock) || 0, maxStock: Number(form.maxStock) || 0,
      isActive: form.isActive, trackBatch: form.trackBatch, trackSerial: form.trackSerial, trackExpiry: form.trackExpiry,
    }
    if (editing) {
      update(editing.id, patch)
      toast({ title: 'Product updated', description: patch.name })
    } else {
      const loc = items[0]?.location ?? 'A01-01'
      const wh = items[0]?.warehouseId ?? 'wh-1'
      add({ id: genId(), qty: 0, reserved: 0, damaged: 0, quarantine: 0, inTransit: 0, location: loc, warehouseId: wh, ...patch })
      toast({ title: 'Product added', description: patch.name })
    }
    setModalOpen(false)
  }

  const columns: DataColumn<InventoryItem>[] = [
    {
      key: 'product', header: 'Product',
      render: (i) => (
        <div>
          <div className="font-medium">{i.name}</div>
          {i.brand && <div className="text-xs text-muted">{i.brand}</div>}
        </div>
      ),
      sortValue: (i) => i.name,
      csvValue: (i) => i.name,
    },
    { key: 'sku', header: 'SKU', render: (i) => <span className="font-mono text-xs">{i.sku}</span>, sortValue: (i) => i.sku, csvValue: (i) => i.sku },
    { key: 'barcode', header: 'Barcode', render: (i) => <span className="font-mono text-xs">{i.barcode || '—'}</span>, hideOnMobile: true },
    { key: 'category', header: 'Category', render: (i) => i.category || '—', sortValue: (i) => i.category },
    { key: 'stock', header: 'Stock', render: (i) => <span className="text-xs">{i.qty} {i.unit} · avail {availableOf(i)}</span>, sortValue: (i) => i.qty, hideOnMobile: true },
    { key: 'price', header: 'Selling price', render: (i) => money(i.sellingPrice), sortValue: (i) => i.sellingPrice, hideOnMobile: true },
    {
      key: 'status', header: 'Status',
      render: (i) => <StatusBadge status={stockStatusOf(i)} />,
      sortValue: (i) => stockStatusOf(i),
      csvValue: (i) => stockStatusOf(i),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Products</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add product</Button>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 rounded-lg bg-surface2/50 border border-border">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <option value="all">All categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            </div>
          )}

          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(i) => i.id}
            pageSize={10}
            exportFilename="warehouse-products"
            emptyIcon={<Boxes className="w-6 h-6" />}
            emptyTitle="No products yet"
            emptyDescription="Add your first product to start building the catalog."
            onRowClick={(i) => setDetail(i)}
            actions={(i) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(i) }} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(i.id) }} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search name, SKU, barcode..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit product' : 'Add product'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Product name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label required>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Barcode / QR</Label><Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Optional" /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Weight</Label><Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 50 kg" /></div>
            <div><Label>Dimensions</Label><Input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 60x40x40 cm" /></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><Label>Purchase price</Label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
            <div><Label>Selling price</Label><Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></div>
            <div><Label>HSN</Label><Input value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })} /></div>
            <div>
              <Label>GST %</Label>
              <Select value={form.gstPct} onValueChange={(v) => setForm({ ...form, gstPct: v })}>
                {['0', '5', '12', '18', '28'].map((g) => <option key={g} value={g}>{g}%</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Min stock</Label><Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></div>
            <div><Label>Reorder level</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></div>
            <div><Label>Max stock</Label><Input type="number" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex items-center gap-4 text-sm">
            {(['trackBatch', 'trackSerial', 'trackExpiry'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[f]} onChange={() => setForm({ ...form, [f]: !form[f] })} className="accent-[var(--primary)]" />
                {f === 'trackBatch' ? 'Track batch' : f === 'trackSerial' ? 'Track serial number' : 'Track expiry'}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add product'}</Button>
          </div>
        </div>
      </Modal>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''} description={detail ? `${detail.sku} · ${detail.category || 'Uncategorised'}` : ''} width="lg">
        {detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'On hand', value: `${detail.qty} ${detail.unit}` },
                { label: 'Available', value: `${availableOf(detail)} ${detail.unit}` },
                { label: 'Damaged', value: String(detail.damaged) },
                { label: 'Quarantine', value: String(detail.quarantine) },
                { label: 'Selling price', value: money(detail.sellingPrice) },
                { label: 'Purchase price', value: money(detail.unitPrice) },
                { label: 'Barcode', value: detail.barcode || '—' },
                { label: 'HSN / GST', value: `${detail.hsn || '—'} / ${detail.gstPct}%` },
                { label: 'Weight', value: detail.weight || '—' },
                { label: 'Dimensions', value: detail.dimensions || '—' },
                { label: 'Location', value: detail.location },
                { label: 'Stock status', value: <StatusBadge status={stockStatusOf(detail)} /> },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-border bg-surface2/40 p-3">
                  <div className="text-xs text-muted">{f.label}</div>
                  <div className="text-sm font-medium mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-3"><History className="w-4 h-4" /> Recent movements</div>
              {detailMovements.length === 0 ? (
                <p className="text-sm text-muted">No movements recorded for this product yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detailMovements.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-sm rounded-lg border border-border bg-surface2/40 p-3">
                      <div className="min-w-0">
                        <div className="font-medium">{MOVEMENT_LABEL[m.type]}</div>
                        <div className="text-xs text-muted mt-0.5">{m.from || '—'} → {m.to || '—'} · {m.date.slice(0, 10)} · {m.refNumber}</div>
                      </div>
                      <Badge variant={m.qty >= 0 ? 'success' : 'danger'} size="sm">{m.qty >= 0 ? '+' : ''}{m.qty}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted"><Package className="w-4 h-4" /> Full stock management lives in Inventory & Stock.</div>
          </div>
        )}
      </Drawer>
    </div>
  )
}