import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { ClipboardList, Plus, Search, Pencil, Trash2, X, ArrowRight } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { PurchaseOrder, POLine, POStatus, InventoryItem } from './types'
import { PO_FLOW } from './types'
import { SUPPLIER_SEED, PO_SEED, INVENTORY_SEED, WAREHOUSE_SEED } from './seed'
import { fmtDate, todayISO, money } from '../../lib/utils'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'

type LineDraft = { itemId: string; itemName: string; qty: string; unitPrice: string }
const emptyLine: LineDraft = { itemId: '', itemName: '', qty: '1', unitPrice: '0' }

export default function WarehousePurchaseOrders() {
  const { items: suppliers } = useLocalCollection('warehouse:suppliers', SUPPLIER_SEED)
  const { items: inventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: pos, add, update, remove } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | POStatus>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseOrder | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [status, setStatus] = useState<POStatus>('draft')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([{ ...emptyLine }])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return pos.filter((po) => {
      const matchesQ = `${po.poNumber} ${po.supplierName}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter
      return matchesQ && matchesStatus
    })
  }, [pos, query, statusFilter])

  const nextStatus = (s: POStatus): POStatus | null => {
    if (s === 'cancelled' || s === 'closed') return null
    const idx = PO_FLOW.indexOf(s)
    return idx >= 0 && idx < PO_FLOW.length - 1 ? PO_FLOW[idx + 1] : null
  }

  function openAdd() {
    setEditing(null)
    setSupplierId(suppliers[0]?.id ?? '')
    setDate(todayISO())
    setExpectedDelivery('')
    setWarehouseId(WAREHOUSE_SEED[0]?.id ?? '')
    setStatus('draft')
    setNotes('')
    setLines([{ ...emptyLine }])
    setModalOpen(true)
  }

  function openEdit(po: PurchaseOrder) {
    setEditing(po)
    setSupplierId(po.supplierId)
    setDate(po.date)
    setExpectedDelivery(po.expectedDelivery)
    setWarehouseId(po.warehouseId)
    setStatus(po.status)
    setNotes(po.notes)
    setLines(po.lines.map((l) => ({ itemId: l.itemId, itemName: l.itemName, qty: String(l.qty), unitPrice: String(l.unitPrice) })))
    setModalOpen(true)
  }

  function save() {
    const supplier = suppliers.find((s) => s.id === supplierId)
    if (!supplier) {
      toast({ title: 'Select a supplier', variant: 'error' })
      return
    }
    const finalLines: POLine[] = lines
      .filter((l) => l.itemName.trim())
      .map((l) => ({ itemId: l.itemId, itemName: l.itemName.trim(), qty: Number(l.qty) || 0, unitPrice: Number(l.unitPrice) || 0 }))
    if (finalLines.length === 0) {
      toast({ title: 'Add at least one line item', variant: 'error' })
      return
    }
    const total = finalLines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
    if (editing) {
      update(editing.id, { supplierId, supplierName: supplier.name, date, expectedDelivery, warehouseId, status, lines: finalLines, total, notes })
      toast({ title: 'Purchase order updated', description: editing.poNumber })
    } else {
      add({
        id: genId(),
        poNumber: `PO-${new Date().getFullYear()}-${String(pos.length + 1).padStart(3, '0')}`,
        supplierId, supplierName: supplier.name, date, expectedDelivery, warehouseId, status, lines: finalLines, total, notes,
      })
      toast({ title: 'Purchase order created', description: `PO-${new Date().getFullYear()}-${String(pos.length + 1).padStart(3, '0')}` })
    }
    setModalOpen(false)
  }

  function advance(po: PurchaseOrder) {
    const next = nextStatus(po.status)
    if (!next) return
    update(po.id, { status: next })
    toast({ title: `PO moved to ${next}`, description: po.poNumber })
  }

  function setLineItem(idx: number, itemId: string) {
    const item = inventory.find((i) => i.id === itemId)
    setLines(lines.map((l, i) =>
      i === idx ? { ...l, itemId, itemName: item?.name ?? '', unitPrice: item ? String(item.unitPrice) : l.unitPrice } : l
    ))
  }

  const columns: DataColumn<PurchaseOrder>[] = [
    { key: 'poNumber', header: 'PO #', render: (po) => <span className="font-mono text-xs">{po.poNumber}</span>, sortValue: (po) => po.poNumber },
    { key: 'supplier', header: 'Supplier', render: (po) => <span className="font-medium">{po.supplierName}</span>, sortValue: (po) => po.supplierName },
    { key: 'date', header: 'Date', render: (po) => fmtDate(po.date), sortValue: (po) => po.date },
    { key: 'expected', header: 'Expected', render: (po) => (po.expectedDelivery ? fmtDate(po.expectedDelivery) : '—') },
    {
      key: 'status', header: 'Status',
      render: (po) => <StatusBadge status={po.status} />,
      sortValue: (po) => po.status,
      csvValue: (po) => po.status,
    },
    { key: 'total', header: 'Total', render: (po) => <span className="font-medium">{money(po.total)}</span>, sortValue: (po) => po.total },
    { key: 'lines', header: 'Items', render: (po) => <span className="text-xs">{po.lines.length}</span>, sortValue: (po) => po.lines.length },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Purchase Orders</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> New PO</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(po) => po.id}
            pageSize={10}
            exportFilename="warehouse-purchase-orders"
            emptyIcon={<ClipboardList className="w-6 h-6" />}
            emptyTitle="No purchase orders"
            emptyDescription="Create a PO to start ordering stock from suppliers."
            actions={(po) => (
              <div className="flex gap-1">
                {nextStatus(po.status) && (
                  <Button variant="outline" size="sm" onClick={() => advance(po)}>
                    {po.status === 'draft' ? 'Submit' : 'Move to ' + nextStatus(po.status)} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(po)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(po.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
            toolbar={
              <div className="flex flex-wrap gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search PO number or supplier..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="w-44">
                  <option value="all">All statuses</option>
                  {PO_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="cancelled">cancelled</option>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit purchase order' : 'New purchase order'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                {WAREHOUSE_SEED.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Expected delivery</Label><Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as POStatus)}>
                {PO_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="cancelled">cancelled</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Line items</Label>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_120px_100px_90px_36px] gap-2 items-center">
                  <Select value={line.itemId} onValueChange={(v) => setLineItem(idx, v)}>
                    <option value="">— select item —</option>
                    {inventory.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                  </Select>
                  <Input type="number" placeholder="Qty" value={line.qty} onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, qty: e.target.value } : l))} />
                  <Input type="number" placeholder="Unit price" value={line.unitPrice} onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, unitPrice: e.target.value } : l))} />
                  <span className="text-xs text-muted">{money((Number(line.qty) || 0) * (Number(line.unitPrice) || 0))}</span>
                  <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))} aria-label="Remove line"><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setLines([...lines, { ...emptyLine }])}><Plus className="w-4 h-4" /> Add line</Button>
          </div>

          <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" /></div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted">
              Total: <span className="text-text font-semibold">{money(lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0))}</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={!supplierId}>{editing ? 'Save changes' : 'Create PO'}</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}