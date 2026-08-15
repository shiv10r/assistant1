import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { ListChecks, Plus, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { PickList, PickLine, SalesOrder, InventoryItem } from './types'
import { PICK_SEED, ORDER_SEED, INVENTORY_SEED } from './seed'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { useStockLedger } from './ledger'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

export default function WarehousePicking() {
  const { items: picks, add, update } = useLocalCollection<PickList>('warehouse:picks', PICK_SEED)
  const { items: orders, update: updateOrder } = useLocalCollection<SalesOrder>('warehouse:orders', ORDER_SEED)
  const { items: inventory, update: updateInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { logMovement } = useStockLedger()
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [orderId, setOrderId] = useState('')

  const filtered = useMemo(
    () => picks.filter((p) => `${p.pickNumber} ${p.orderNumber}`.toLowerCase().includes(query.toLowerCase())),
    [picks, query]
  )

  const reservedOrders = orders.filter((o) => o.status === 'reserved' && !picks.some((p) => p.orderId === o.id))

  function openGenerate() {
    setOrderId(reservedOrders[0]?.id ?? '')
    setGenerateOpen(true)
  }

  function generatePick() {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const items: PickLine[] = order.lines.map((l) => {
      const item = inventory.find((i) => i.id === l.itemId)
      return { itemId: l.itemId, itemName: l.itemName, sku: l.sku, location: item?.location ?? '', requiredQty: l.qty, pickedQty: 0 }
    })
    const number = `PL-2026-${String(picks.length + 1).padStart(3, '0')}`
    add({ id: genId(), pickNumber: number, orderId: order.id, orderNumber: order.orderNumber, status: 'pending', items })
    updateOrder(order.id, { status: 'picking' })
    setGenerateOpen(false)
    toast({ title: 'Pick list generated', description: number })
  }

  function startPick(p: PickList) {
    update(p.id, { status: 'picking' })
    toast({ title: 'Pick started', description: p.pickNumber })
  }

  function confirmPick(p: PickList) {
    const ok = p.items.every((i) => i.pickedQty > 0)
    if (!ok) {
      toast({ title: 'Pick all items before confirming', variant: 'error' })
      return
    }
    p.items.forEach((line) => {
      const item = inventory.find((i) => i.id === line.itemId)
      if (item) {
        updateInventory(item.id, {
          qty: Math.max(0, item.qty - line.pickedQty),
          reserved: Math.max(0, item.reserved - line.pickedQty),
        })
      }
      logMovement({ itemId: line.itemId, itemName: line.itemName, sku: line.sku, type: 'pick', qty: -line.pickedQty, from: line.location || 'Floor', to: 'Picking', reason: 'Picked for order', refNumber: p.pickNumber, notes: p.orderNumber })
    })
    update(p.id, { status: 'picked' })
    updateOrder(p.orderId, { status: 'packed' })
    toast({ title: 'Pick confirmed', description: p.pickNumber })
  }

  const columns: DataColumn<PickList>[] = [
    { key: 'number', header: 'Pick #', render: (p) => <span className="font-mono text-xs">{p.pickNumber}</span>, sortValue: (p) => p.pickNumber, csvValue: (p) => p.pickNumber },
    { key: 'order', header: 'Order', render: (p) => <span className="font-mono text-xs">{p.orderNumber}</span>, sortValue: (p) => p.orderNumber, csvValue: (p) => p.orderNumber },
    { key: 'items', header: 'Items', render: (p) => <span className="text-xs">{p.items.reduce((s, i) => s + i.requiredQty, 0)} pcs</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status, csvValue: (p) => p.status },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Picking throughput and progress — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Pick lists', value: String(picks.length), delta: `${picks.filter((p) => p.status === 'picked').length} picked`, deltaTone: 'flat' },
            { label: 'In progress', value: String(picks.filter((p) => p.status === 'picking').length), delta: 'being picked', deltaTone: 'flat' },
            { label: 'Pending', value: String(picks.filter((p) => p.status === 'pending').length), delta: 'not started', deltaTone: 'flat' },
            { label: 'Units to pick', value: picks.reduce((s, p) => s + p.items.reduce((a, i) => a + (i.requiredQty - i.pickedQty), 0), 0).toLocaleString('en-IN'), delta: 'remaining', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Pick lists by status</p>
              <BarChart
                data={[
                  { label: 'Pending', value: picks.filter((p) => p.status === 'pending').length },
                  { label: 'Picking', value: picks.filter((p) => p.status === 'picking').length },
                  { label: 'Picked', value: picks.filter((p) => p.status === 'picked').length },
                ].filter((d) => d.value > 0)}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Progress mix</p>
              <DonutChart
                data={[
                  { label: 'Picked', value: picks.filter((p) => p.status === 'picked').length, color: 'var(--primary)' },
                  { label: 'Picking', value: picks.filter((p) => p.status === 'picking').length, color: '#f59e0b' },
                  { label: 'Pending', value: picks.filter((p) => p.status === 'pending').length, color: '#3b82f6' },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Picking</CardTitle>
          <Button onClick={openGenerate} disabled={reservedOrders.length === 0}>
            <Plus className="w-4 h-4" /> Generate pick list
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="warehouse-picks"
            emptyIcon={<ListChecks className="w-6 h-6" />}
            emptyTitle="No pick lists yet"
            emptyDescription="Generate a pick list from a reserved order."
            actions={(p) => {
              if (p.status === 'pending') return <Button variant="outline" size="sm" onClick={() => startPick(p)}>Start pick</Button>
              if (p.status === 'picking') return <Button variant="outline" size="sm" onClick={() => confirmPick(p)}>Confirm pick</Button>
              return undefined
            }}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search pick or order..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate pick list" size="md">
        <div className="space-y-4">
          <div>
            <Label required>Reserved order</Label>
            <Select value={orderId} onValueChange={setOrderId}>
              {reservedOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerName}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={generatePick}>Generate</Button>
          </div>
        </div>
      </Modal>

      {picks.filter((p) => p.status === 'picking').length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active pick — record picked quantities</CardTitle></CardHeader>
          <CardContent>
            {picks.filter((p) => p.status === 'picking').map((p) => (
              <ActivePickTable key={p.id} pick={p} onSave={confirmPick} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ActivePickTable({ pick, onSave }: { pick: PickList; onSave: (p: PickList) => void }) {
  const [values, setValues] = useState<Record<string, string>>({})

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{pick.pickNumber} — order {pick.orderNumber}</div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Item</TableHead><TableHead>Location</TableHead><TableHead>Required</TableHead><TableHead>Picked</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {pick.items.map((line) => {
            const value = values[line.itemId] ?? String(line.requiredQty)
            return (
              <TableRow key={line.itemId}>
                <TableCell className="font-medium">{line.itemName}</TableCell>
                <TableCell className="font-mono text-xs">{line.location || '—'}</TableCell>
                <TableCell>{line.requiredQty}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-24"
                    value={value}
                    onChange={(e) => setValues({ ...values, [line.itemId]: e.target.value })}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="flex justify-end">
        <Button
          onClick={() => onSave({ ...pick, items: pick.items.map((i) => ({ ...i, pickedQty: Number(values[i.itemId]) || 0 })) })}
        >
          <CheckCircle2 className="w-4 h-4" /> Confirm pick
        </Button>
      </div>
    </div>
  )
}