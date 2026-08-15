import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, cn,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Boxes, Plus, Search, Pencil, Trash2, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { InventoryItem, PurchaseOrder, StockStatus } from './types'
import { availableOf, stockStatusOf } from './types'
import { INVENTORY_SEED, PO_SEED, WAREHOUSE_SEED, LOCATION_SEED } from './seed'
import { todayISO, money } from '../../lib/utils'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { Drawer } from '../../components/Drawer'
import { useStockLedger, useAdjustments } from './ledger'
import { MOVEMENT_LABEL } from './ledger'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

const emptyForm = {
  sku: '', name: '', category: '', brand: '', description: '', unit: 'pcs',
  qty: '0', reserved: '0', damaged: '0', reorderLevel: '0', minStock: '0', maxStock: '0',
  unitPrice: '0', sellingPrice: '0', hsn: '', gstPct: '18', location: '', warehouseId: '',
  isActive: true, trackBatch: false, trackSerial: false, trackExpiry: false,
}

const ADJUST_REASONS = ['Damaged', 'Lost', 'Found', 'Counting error', 'Other']

export default function WarehouseInventory() {
  const { items, add, update, remove } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: purchaseOrders, add: addPO } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const { movements, logMovement } = useStockLedger()
  const { recordAdjustment } = useAdjustments()
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<'all' | StockStatus>('all')
  const [showFilters, setShowFilters] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const [detail, setDetail] = useState<InventoryItem | null>(null)

  const [adjOpen, setAdjOpen] = useState(false)
  const [adjItem, setAdjItem] = useState<InventoryItem | null>(null)
  const [adjNewQty, setAdjNewQty] = useState('0')
  const [adjReason, setAdjReason] = useState(ADJUST_REASONS[0])
  const [adjRemarks, setAdjRemarks] = useState('')

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return items.filter((it) => {
      const matchesQ = `${it.sku} ${it.name} ${it.category} ${it.brand}`.toLowerCase().includes(q)
      const matchesCat = category === 'all' || it.category === category
      const st = stockStatusOf(it)
      const matchesStatus = status === 'all' || st === status
      return matchesQ && matchesCat && matchesStatus
    })
  }, [items, query, category, status])

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyForm, location: LOCATION_SEED[0]?.code ?? '', warehouseId: WAREHOUSE_SEED[0]?.id ?? '' })
    setModalOpen(true)
  }

  function openEdit(item: InventoryItem) {
    setEditing(item)
    setForm({
      sku: item.sku, name: item.name, category: item.category, brand: item.brand, description: item.description,
      unit: item.unit, qty: String(item.qty), reserved: String(item.reserved), damaged: String(item.damaged),
      reorderLevel: String(item.reorderLevel), minStock: String(item.minStock), maxStock: String(item.maxStock),
      unitPrice: String(item.unitPrice), sellingPrice: String(item.sellingPrice), hsn: item.hsn,
      gstPct: String(item.gstPct), location: item.location, warehouseId: item.warehouseId,
      isActive: item.isActive, trackBatch: item.trackBatch, trackSerial: item.trackSerial, trackExpiry: item.trackExpiry,
    })
    setModalOpen(true)
  }

  function save() {
    if (!form.name.trim() || !form.sku.trim()) {
      toast({ title: 'Name and SKU are required', variant: 'error' })
      return
    }
    const payload = {
      sku: form.sku.trim(), name: form.name.trim(), category: form.category.trim() || 'General',
      brand: form.brand.trim(), description: form.description.trim(), unit: form.unit.trim() || 'pcs',
      qty: Number(form.qty) || 0, reserved: Number(form.reserved) || 0, damaged: Number(form.damaged) || 0,
      quarantine: editing?.quarantine ?? 0, inTransit: editing?.inTransit ?? 0,
      reorderLevel: Number(form.reorderLevel) || 0, minStock: Number(form.minStock) || 0, maxStock: Number(form.maxStock) || 0,
      unitPrice: Number(form.unitPrice) || 0, sellingPrice: Number(form.sellingPrice) || 0,
      hsn: form.hsn.trim(), gstPct: Number(form.gstPct) || 0,
      location: form.location, warehouseId: form.warehouseId,
      isActive: form.isActive, trackBatch: form.trackBatch, trackSerial: form.trackSerial, trackExpiry: form.trackExpiry,
    }
    if (editing) {
      update(editing.id, payload)
      toast({ title: 'Item updated', description: payload.name })
    } else {
      add({ id: genId(), ...payload })
      toast({ title: 'Item added', description: payload.name })
    }
    setModalOpen(false)
  }

  function hasDraftReorder(itemId: string) {
    return purchaseOrders.some((po) => po.status === 'draft' && po.lines.some((l) => l.itemId === itemId))
  }

  function reorder(it: InventoryItem) {
    if (hasDraftReorder(it.id)) return
    const qty = Math.max(it.reorderLevel * 2 - it.qty, it.reorderLevel)
    addPO({
      id: genId(),
      poNumber: `PO-AUTO-${Date.now().toString().slice(-5)}`,
      supplierId: '', supplierName: 'Auto-reorder (assign supplier)',
      date: todayISO(), expectedDelivery: '', warehouseId: it.warehouseId,
      status: 'draft',
      lines: [{ itemId: it.id, itemName: it.name, qty, unitPrice: it.unitPrice }],
      total: qty * it.unitPrice, notes: 'Auto-generated from low-stock reorder',
    })
    toast({ title: 'Draft PO created', description: `${it.name} x ${qty}` })
  }

  function openAdjust(item: InventoryItem) {
    setAdjItem(item)
    setAdjNewQty(String(item.qty))
    setAdjReason(ADJUST_REASONS[0])
    setAdjRemarks('')
    setAdjOpen(true)
  }

  function openAdjustFirst() {
    const item = items[0]
    if (!item) return
    setAdjItem(item)
    setAdjNewQty(String(item.qty))
    setAdjReason(ADJUST_REASONS[0])
    setAdjRemarks('')
    setAdjOpen(true)
  }

  function saveAdjust() {
    if (!adjItem) return
    const newQty = Math.max(0, Number(adjNewQty) || 0)
    const diff = newQty - adjItem.qty
    update(adjItem.id, { qty: newQty })
    recordAdjustment({
      itemId: adjItem.id, itemName: adjItem.name, sku: adjItem.sku, location: adjItem.location,
      oldQty: adjItem.qty, newQty, difference: diff, reason: adjReason, remarks: adjRemarks.trim(),
    })
    logMovement({
      itemId: adjItem.id, itemName: adjItem.name, sku: adjItem.sku, type: 'adjustment',
      qty: diff, from: adjItem.location, to: adjReason, reason: adjReason,
      refNumber: `ADJ-${Date.now().toString().slice(-5)}`, notes: adjRemarks.trim(),
    })
    setAdjOpen(false)
    toast({ title: 'Stock adjusted', description: `${adjItem.name}: ${adjItem.qty} → ${newQty}` })
    setDetail(adjItem)
  }

  const columns: DataColumn<InventoryItem>[] = [
    {
      key: 'name', header: 'Product',
      render: (it) => (
        <div>
          <div className="font-medium">{it.name}</div>
          <div className="text-xs text-muted">{it.brand || it.category}</div>
        </div>
      ),
      sortValue: (it) => it.name,
      csvValue: (it) => it.name,
    },
    { key: 'sku', header: 'SKU', render: (it) => <span className="font-mono text-xs">{it.sku}</span>, sortValue: (it) => it.sku },
    { key: 'location', header: 'Location', render: (it) => <span className="text-xs">{it.location || '—'}</span> },
    {
      key: 'onHand', header: 'On Hand',
      render: (it) => <span className="font-medium">{it.qty} {it.unit}</span>,
      sortValue: (it) => it.qty,
    },
    { key: 'reserved', header: 'Reserved', render: (it) => <span className="text-xs">{it.reserved}</span>, sortValue: (it) => it.reserved },
    {
      key: 'available', header: 'Available',
      render: (it) => <span className="text-sm">{availableOf(it)}</span>,
      sortValue: (it) => availableOf(it),
      csvValue: (it) => availableOf(it),
    },
    {
      key: 'status', header: 'Status',
      render: (it) => <StatusBadge status={stockStatusOf(it)} />,
      sortValue: (it) => stockStatusOf(it),
      csvValue: (it) => stockStatusOf(it),
    },
  ]

  const detailMovements = useMemo(
    () => (detail ? movements.filter((m) => m.itemId === detail.id).slice(0, 8) : []),
    [movements, detail]
  )

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Stock value, health and category mix — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total stock value', value: money(items.reduce((s, i) => s + i.qty * i.unitPrice, 0)), delta: `${items.length} SKUs`, deltaTone: 'flat' },
            { label: 'Total qty on hand', value: items.reduce((s, i) => s + i.qty, 0).toLocaleString('en-IN'), delta: 'across all items', deltaTone: 'flat' },
            { label: 'Low stock', value: String(items.filter((i) => stockStatusOf(i) === 'low_stock').length), delta: 'reorder soon', deltaTone: 'down' },
            { label: 'Out of stock', value: String(items.filter((i) => stockStatusOf(i) === 'out_of_stock').length), delta: 'restock needed', deltaTone: 'down' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Stock value by category</p>
              <BarChart
                data={Array.from(new Set(items.map((i) => i.category)))
                  .map((c) => ({ label: c, value: items.filter((i) => i.category === c).reduce((s, i) => s + i.qty * i.unitPrice, 0) }))
                  .filter((d) => d.value > 0)}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Stock health</p>
              <DonutChart
                data={[
                  { label: 'In stock', value: items.filter((i) => stockStatusOf(i) === 'in_stock').length, color: 'var(--primary)' },
                  { label: 'Low stock', value: items.filter((i) => stockStatusOf(i) === 'low_stock').length, color: '#f59e0b' },
                  { label: 'Out of stock', value: items.filter((i) => stockStatusOf(i) === 'out_of_stock').length, color: '#ef4444' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Inventory & Stock</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            <Button variant="outline" onClick={openAdjustFirst} disabled={items.length === 0}>
              <RefreshCw className="w-4 h-4" /> Stock Adjustment
            </Button>
            <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add item</Button>
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
              <div>
                <Label>Stock status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <option value="all">All statuses</option>
                  <option value="in_stock">In stock</option>
                  <option value="low_stock">Low stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </Select>
              </div>
            </div>
          )}

          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(it) => it.id}
            pageSize={10}
            exportFilename="warehouse-inventory"
            emptyIcon={<Boxes className="w-6 h-6" />}
            emptyTitle="No inventory items"
            emptyDescription="Add your first item to start tracking stock."
            onRowClick={(it) => setDetail(it)}
            actions={(it) => {
              const low = stockStatusOf(it) !== 'in_stock'
              return (
                <div className="flex gap-1">
                  {low && (
                    <Button variant="outline" size="sm" disabled={hasDraftReorder(it.id)} onClick={(e) => { e.stopPropagation(); reorder(it) }}>
                      <RefreshCw className="w-3.5 h-3.5" /> {hasDraftReorder(it.id) ? 'Reorder queued' : 'Reorder'}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openAdjust(it) }} aria-label="Adjust stock" title="Stock adjustment">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(it) }} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(it.id) }} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                </div>
              )
            }}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search SKU, name, brand..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit item' : 'Add item'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div><Label required>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-4 gap-4">
            <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div><Label>HSN</Label><Input value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })} /></div>
            <div><Label>GST %</Label><Input type="number" value={form.gstPct} onChange={(e) => setForm({ ...form, gstPct: e.target.value })} /></div>
            <div><Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                {LOCATION_SEED.map((l) => <option key={l.id} value={l.code}>{l.code}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>On hand</Label><Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></div>
            <div><Label>Reserved</Label><Input type="number" value={form.reserved} onChange={(e) => setForm({ ...form, reserved: e.target.value })} /></div>
            <div><Label>Damaged</Label><Input type="number" value={form.damaged} onChange={(e) => setForm({ ...form, damaged: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Reorder level</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></div>
            <div><Label>Min stock</Label><Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></div>
            <div><Label>Max stock</Label><Input type="number" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Purchase price</Label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
            <div><Label>Selling price</Label><Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></div>
          </div>
          <div className="flex flex-wrap gap-4">
            {(['trackBatch', 'trackSerial', 'trackExpiry'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.checked })} className="accent-[var(--primary)]" />
                {f === 'trackBatch' ? 'Track batch' : f === 'trackSerial' ? 'Track serial number' : 'Track expiry'}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add item'}</Button>
          </div>
        </div>
      </Modal>

      {/* Stock adjustment */}
      <Modal open={adjOpen} onClose={() => setAdjOpen(false)} title="Stock adjustment" size="md">
        {adjItem && (
          <div className="space-y-4">
            <div className="rounded-lg bg-surface2/60 border border-border p-3 text-sm">
              <div className="font-medium">{adjItem.name}</div>
              <div className="text-xs text-muted mt-0.5">{adjItem.sku} · {adjItem.location || 'No location'}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Current qty</Label><Input value={adjItem.qty} disabled /></div>
              <div><Label>New qty</Label><Input type="number" value={adjNewQty} onChange={(e) => setAdjNewQty(e.target.value)} /></div>
              <div>
                <Label>Difference</Label>
                <Input value={String((Number(adjNewQty) || 0) - adjItem.qty)} disabled />
              </div>
            </div>
            <div>
              <Label required>Reason</Label>
              <Select value={adjReason} onValueChange={setAdjReason}>
                {ADJUST_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            <div><Label>Remarks</Label><Input value={adjRemarks} onChange={(e) => setAdjRemarks(e.target.value)} placeholder="Optional notes" /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
              <Button variant="success" onClick={saveAdjust}>Apply adjustment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Product detail drawer */}
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ''}
        description={detail ? `${detail.sku} · ${detail.category}` : undefined}
        width="lg"
      >
        {detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'On hand', value: `${detail.qty} ${detail.unit}` },
                { label: 'Reserved', value: String(detail.reserved) },
                { label: 'Available', value: `${availableOf(detail)} ${detail.unit}` },
                { label: 'Damaged', value: String(detail.damaged) },
              ].map((k) => (
                <div key={k.label} className="rounded-lg bg-surface2/60 border border-border p-3">
                  <div className="text-xs text-muted">{k.label}</div>
                  <div className="text-lg font-semibold text-text mt-1">{k.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-sm font-medium text-text mb-2">Details</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Brand</span><span>{detail.brand || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted">Location</span><span>{detail.location || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted">Unit price</span><span>₹{detail.unitPrice}</span></div>
                <div className="flex justify-between"><span className="text-muted">Selling price</span><span>₹{detail.sellingPrice}</span></div>
                <div className="flex justify-between"><span className="text-muted">Reorder level</span><span>{detail.reorderLevel}</span></div>
                <div className="flex justify-between"><span className="text-muted">Status</span><StatusBadge status={stockStatusOf(detail)} /></div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-text mb-2">Recent movements</div>
              {detailMovements.length === 0 ? (
                <p className="text-sm text-muted">No stock movements recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detailMovements.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-sm rounded-lg border border-border bg-surface p-3">
                      <div>
                        <div className="font-medium">{MOVEMENT_LABEL[m.type]} · {m.refNumber}</div>
                        <div className="text-xs text-muted mt-0.5">{m.from || '—'} → {m.to || '—'} · {m.reason}</div>
                      </div>
                      <span className={cn('font-semibold', m.qty >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                        {m.qty >= 0 ? '+' : ''}{m.qty}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => { setDetail(null); openAdjust(detail) }}>
                <RefreshCw className="w-4 h-4" /> Adjust stock
              </Button>
              <Button variant="outline" onClick={() => { setDetail(null); openEdit(detail) }}>Edit item</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}