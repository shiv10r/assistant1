import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { ShoppingCart, Plus, Search, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { SalesOrder, SalesOrderLine, SalesOrderStatus, InventoryItem, Customer } from './types'
import { ORDER_FLOW, availableOf } from './types'
import { ORDER_SEED, CUSTOMER_SEED, INVENTORY_SEED, WAREHOUSE_SEED } from './seed'
import { todayISO } from '../../lib/utils'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'

interface DraftLine { itemId: string; qty: string; price: string; taxPct: string; discountPct: string }

export default function WarehouseOrders() {
  const { items: orders, add, update } = useLocalCollection<SalesOrder>('warehouse:orders', ORDER_SEED)
  const { items: inventory, update: updateInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: customers } = useLocalCollection<Customer>('warehouse:customers', CUSTOMER_SEED)
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SalesOrderStatus>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [customerId, setCustomerId] = useState('cust-1')
  const [warehouseId, setWarehouseId] = useState('wh-1')
  const [date, setDate] = useState(todayISO())
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return orders.filter((o) => {
      const matchesQ = `${o.orderNumber} ${o.customerName}`.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesQ && matchesStatus
    })
  }, [orders, query, statusFilter])

  const whItems = inventory.filter((i) => i.warehouseId === warehouseId)

  function openCreate() {
    setCustomerId(customers[0]?.id ?? '')
    setWarehouseId('wh-1')
    setDate(todayISO())
    setDeliveryAddress('')
    setNotes('')
    setLines([{ itemId: whItems.find((i) => availableOf(i) > 0)?.id ?? '', qty: '', price: '', taxPct: '18', discountPct: '0' }])
    setModalOpen(true)
  }

  function addLine() {
    const first = whItems.find((i) => availableOf(i) > 0)
    setLines([...lines, { itemId: first?.id ?? '', qty: '', price: '', taxPct: '18', discountPct: '0' }])
  }

  function updateLine(idx: number, patch: Partial<DraftLine>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function setItem(idx: number, itemId: string) {
    const item = inventory.find((i) => i.id === itemId)
    updateLine(idx, { itemId, price: item ? String(item.sellingPrice ?? 0) : '' })
  }

  function lineTotal(l: DraftLine): number {
    const qty = Number(l.qty) || 0
    const price = Number(l.price) || 0
    const sub = qty * price
    const discount = sub * ((Number(l.discountPct) || 0) / 100)
    const taxable = sub - discount
    return taxable + taxable * ((Number(l.taxPct) || 0) / 100)
  }

  function canSave(): boolean {
    return lines.length > 0 && lines.every((l) => l.itemId && Number(l.qty) > 0 && Number(l.price) >= 0)
  }

  function createOrder() {
    if (!canSave()) {
      toast({ title: 'Add at least one line with item and quantity', variant: 'error' })
      return
    }
    const cust = customers.find((c) => c.id === customerId)
    const items: SalesOrderLine[] = lines.map((l) => {
      const item = inventory.find((i) => i.id === l.itemId)!
      const qty = Number(l.qty)
      const price = Number(l.price) || 0
      const discountPct = Number(l.discountPct) || 0
      const taxPct = Number(l.taxPct) || 0
      const sub = qty * price
      const discountTotal = sub * (discountPct / 100)
      const taxable = sub - discountTotal
      return {
        itemId: item.id, itemName: item.name, sku: item.sku, qty, price, taxPct, discountPct,
        total: taxable + taxable * (taxPct / 100),
      }
    })
    const subTotal = items.reduce((s, i) => s + i.qty * i.price, 0)
    const discountTotal = items.reduce((s, i) => s + (i.qty * i.price * i.discountPct) / 100, 0)
    const taxTotal = items.reduce((s, i) => s + i.total - (i.qty * i.price - (i.qty * i.price * i.discountPct) / 100), 0)
    const grandTotal = items.reduce((s, i) => s + i.total, 0)
    const number = `SO-2026-${String(orders.length + 1).padStart(3, '0')}`
    add({
      id: genId(), orderNumber: number, customerId, customerName: cust?.name ?? '', orderDate: date,
      warehouseId, status: 'created', lines: items, subTotal, taxTotal: Math.round(taxTotal), discountTotal, grandTotal: Math.round(grandTotal),
      deliveryAddress, notes,
    })
    setModalOpen(false)
    toast({ title: 'Order created', description: number })
  }

  function nextStatus(s: SalesOrderStatus): SalesOrderStatus | null {
    const idx = ORDER_FLOW.indexOf(s)
    return idx >= 0 && idx < ORDER_FLOW.length - 1 ? ORDER_FLOW[idx + 1] : null
  }

  function advance(o: SalesOrder) {
    const next = nextStatus(o.status)
    if (!next) return
    if (next === 'reserved') {
      o.lines.forEach((line) => {
        const item = inventory.find((i) => i.id === line.itemId)
        if (item) updateInventory(item.id, { reserved: item.reserved + line.qty })
      })
    }
    update(o.id, { status: next })
    toast({ title: `Order ${next}`, description: o.orderNumber })
  }

  const columns: DataColumn<SalesOrder>[] = [
    { key: 'number', header: 'Order #', render: (o) => <span className="font-mono text-xs">{o.orderNumber}</span>, sortValue: (o) => o.orderNumber, csvValue: (o) => o.orderNumber },
    { key: 'customer', header: 'Customer', render: (o) => o.customerName, sortValue: (o) => o.customerName, csvValue: (o) => o.customerName },
    { key: 'date', header: 'Date', render: (o) => o.orderDate.slice(0, 10), sortValue: (o) => o.orderDate },
    { key: 'total', header: 'Total', render: (o) => `₹${o.grandTotal.toLocaleString('en-IN')}`, sortValue: (o) => o.grandTotal, csvValue: (o) => String(o.grandTotal) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} />, sortValue: (o) => o.status, csvValue: (o) => o.status },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Sales Orders</CardTitle>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> New order</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(o) => o.id}
            pageSize={10}
            exportFilename="warehouse-orders"
            emptyIcon={<ShoppingCart className="w-6 h-6" />}
            emptyTitle="No orders yet"
            emptyDescription="Create an order to start the pick, pack and dispatch flow."
            actions={(o) => {
              const next = nextStatus(o.status)
              return next ? (
                <Button variant="outline" size="sm" onClick={() => advance(o)}>
                  Mark {next}
                </Button>
              ) : undefined
            }}
            toolbar={
              <div className="flex flex-wrap gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search order or customer..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="w-40">
                  <option value="all">All statuses</option>
                  {ORDER_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New sales order" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                {WAREHOUSE_SEED.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Order date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_90px_110px_90px_90px_36px] gap-2 items-end">
              <Label>Item</Label><Label>Qty</Label><Label>Price</Label><Label>Tax %</Label><Label>Disc %</Label><span />
            </div>
            {lines.map((l, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_90px_110px_90px_90px_36px] gap-2 items-end">
                <Select value={l.itemId} onValueChange={(v) => setItem(idx, v)}>
                  {whItems.map((i) => <option key={i.id} value={i.id}>{i.name} — avail {availableOf(i)}</option>)}
                </Select>
                <Input type="number" value={l.qty} onChange={(e) => updateLine(idx, { qty: e.target.value })} />
                <Input type="number" value={l.price} onChange={(e) => updateLine(idx, { price: e.target.value })} />
                <Input type="number" value={l.taxPct} onChange={(e) => updateLine(idx, { taxPct: e.target.value })} />
                <Input type="number" value={l.discountPct} onChange={(e) => updateLine(idx, { discountPct: e.target.value })} />
                <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))} aria-label="Remove" disabled={lines.length <= 1}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLine}><Plus className="w-4 h-4" /> Add line</Button>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted">Line total: <span className="font-medium text-foreground">₹{Math.round(lines.reduce((s, l) => s + lineTotal(l), 0)).toLocaleString('en-IN')}</span></div>
          </div>
          <div><Label>Delivery address</Label><Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} /></div>
          <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={createOrder} disabled={!canSave()}>Create order</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}