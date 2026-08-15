import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Truck, Plus, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Dispatch, SalesOrder } from './types'
import { DISPATCH_SEED, ORDER_SEED } from './seed'
import { todayISO } from '../../lib/utils'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { useStockLedger } from './ledger'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

export default function WarehouseDispatch() {
  const { items: dispatches, add, update } = useLocalCollection<Dispatch>('warehouse:dispatches', DISPATCH_SEED)
  const { items: orders, update: updateOrder } = useLocalCollection<SalesOrder>('warehouse:orders', ORDER_SEED)
  const { logMovement } = useStockLedger()
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [transporter, setTransporter] = useState('')
  const [courier, setCourier] = useState('')
  const [tracking, setTracking] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [driver, setDriver] = useState('')
  const [remarks, setRemarks] = useState('')

  const filtered = useMemo(
    () => dispatches.filter((d) => `${d.dispatchNumber} ${d.orderNumber} ${d.customerName}`.toLowerCase().includes(query.toLowerCase())),
    [dispatches, query]
  )

  const readyOrders = orders.filter((o) => o.status === 'dispatched' && !dispatches.some((d) => d.orderId === o.id))

  function openCreate() {
    setOrderId(readyOrders[0]?.id ?? '')
    setTransporter(''); setCourier(''); setTracking(''); setVehicle(''); setDriver(''); setRemarks('')
    setModalOpen(true)
  }

  function createDispatch() {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const number = `DS-2026-${String(dispatches.length + 1).padStart(3, '0')}`
    add({
      id: genId(), dispatchNumber: number, orderId: order.id, orderNumber: order.orderNumber, customerName: order.customerName,
      packageId: '', transporter, courier, trackingNumber: tracking, dispatchDate: todayISO(), vehicleNumber: vehicle, driver, status: 'dispatched', remarks,
    })
    order.lines.forEach((line) => {
      logMovement({ itemId: line.itemId, itemName: line.itemName, sku: line.sku, type: 'dispatch', qty: -line.qty, from: 'Warehouse', to: order.customerName, reason: 'Dispatched to customer', refNumber: number, notes: order.orderNumber })
    })
    setModalOpen(false)
    toast({ title: 'Dispatch recorded', description: number })
  }

  function complete(d: Dispatch) {
    update(d.id, { status: 'completed' })
    updateOrder(d.orderId, { status: 'completed' })
    toast({ title: 'Dispatch completed', description: d.dispatchNumber })
  }

  const columns: DataColumn<Dispatch>[] = [
    { key: 'number', header: 'Dispatch #', render: (d) => <span className="font-mono text-xs">{d.dispatchNumber}</span>, sortValue: (d) => d.dispatchNumber, csvValue: (d) => d.dispatchNumber },
    { key: 'order', header: 'Order', render: (d) => <span className="font-mono text-xs">{d.orderNumber}</span>, sortValue: (d) => d.orderNumber, csvValue: (d) => d.orderNumber },
    { key: 'customer', header: 'Customer', render: (d) => d.customerName, hideOnMobile: true },
    { key: 'date', header: 'Date', render: (d) => d.dispatchDate.slice(0, 10), sortValue: (d) => d.dispatchDate },
    { key: 'tracking', header: 'Tracking', render: (d) => d.trackingNumber || '—', hideOnMobile: true },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} />, sortValue: (d) => d.status, csvValue: (d) => d.status },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Outbound fulfilment pipeline — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total dispatches', value: String(dispatches.length), delta: `${dispatches.filter((d) => d.status === 'completed').length} completed`, deltaTone: 'flat' },
            { label: 'In transit', value: String(dispatches.filter((d) => d.status === 'dispatched').length), delta: 'on the road', deltaTone: 'flat' },
            { label: 'Ready', value: String(dispatches.filter((d) => d.status === 'ready').length), delta: 'awaiting dispatch', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Dispatches by status</p>
              <BarChart
                data={[
                  { label: 'Ready', value: dispatches.filter((d) => d.status === 'ready').length },
                  { label: 'Dispatched', value: dispatches.filter((d) => d.status === 'dispatched').length },
                  { label: 'Completed', value: dispatches.filter((d) => d.status === 'completed').length },
                ].filter((d) => d.value > 0)}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Fulfilment mix</p>
              <DonutChart
                data={[
                  { label: 'Completed', value: dispatches.filter((d) => d.status === 'completed').length, color: 'var(--primary)' },
                  { label: 'Dispatched', value: dispatches.filter((d) => d.status === 'dispatched').length, color: '#f59e0b' },
                  { label: 'Ready', value: dispatches.filter((d) => d.status === 'ready').length, color: '#3b82f6' },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Dispatch</CardTitle>
          <Button onClick={openCreate} disabled={readyOrders.length === 0}>
            <Plus className="w-4 h-4" /> Record dispatch
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(d) => d.id}
            pageSize={10}
            exportFilename="warehouse-dispatches"
            emptyIcon={<Truck className="w-6 h-6" />}
            emptyTitle="No dispatches yet"
            emptyDescription="Record a dispatch for a ready order."
            actions={(d) => (d.status === 'dispatched' ? <Button variant="outline" size="sm" onClick={() => complete(d)}>Mark delivered</Button> : undefined)}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search dispatch, order, customer..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record dispatch" size="md">
        <div className="space-y-4">
          <div>
            <Label required>Ready order</Label>
            <Select value={orderId} onValueChange={setOrderId}>
              {readyOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerName}</option>)}
            </Select>
          </div>
          {orderId && (
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.find((o) => o.id === orderId)?.lines.map((l) => (
                  <TableRow key={l.itemId}>
                    <TableCell>{l.itemName}</TableCell>
                    <TableCell>{l.qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Transporter</Label><Input value={transporter} onChange={(e) => setTransporter(e.target.value)} /></div>
            <div><Label>Courier</Label><Input value={courier} onChange={(e) => setCourier(e.target.value)} /></div>
          </div>
          <div><Label>Tracking number</Label><Input value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Vehicle number</Label><Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} /></div>
            <div><Label>Driver</Label><Input value={driver} onChange={(e) => setDriver(e.target.value)} /></div>
          </div>
          <div><Label>Remarks</Label><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={createDispatch}>Record dispatch</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}