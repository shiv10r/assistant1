import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { PackageCheck, Plus, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Package as Pkg, SalesOrder } from './types'
import { PACK_SEED, ORDER_SEED } from './seed'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'

export default function WarehousePacking() {
  const { items: packages, add, update } = useLocalCollection<Pkg>('warehouse:packages', PACK_SEED)
  const { items: orders, update: updateOrder } = useLocalCollection<SalesOrder>('warehouse:orders', ORDER_SEED)
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [weight, setWeight] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [boxCount, setBoxCount] = useState('1')
  const [remarks, setRemarks] = useState('')

  const filtered = useMemo(
    () => packages.filter((p) => `${p.packageId} ${p.orderNumber}`.toLowerCase().includes(query.toLowerCase())),
    [packages, query]
  )

  const packableOrders = orders.filter((o) => o.status === 'packed' && !packages.some((p) => p.orderId === o.id))

  function openCreate() {
    setOrderId(packableOrders[0]?.id ?? '')
    setWeight(''); setDimensions(''); setBoxCount('1'); setRemarks('')
    setModalOpen(true)
  }

  function createPackage() {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const number = `PKG-2026-${String(packages.length + 1).padStart(3, '0')}`
    add({
      id: genId(), packageId: number, orderId: order.id, orderNumber: order.orderNumber,
      items: order.lines.map((l) => ({ itemId: l.itemId, itemName: l.itemName, qty: l.qty })),
      totalWeight: weight, dimensions, packageCount: Number(boxCount) || 1, status: 'pending', remarks,
    })
    setModalOpen(false)
    toast({ title: 'Package created', description: number })
  }

  function advance(p: Pkg) {
    const next = p.status === 'pending' ? 'packing' : p.status === 'packing' ? 'packed' : p.status === 'packed' ? 'ready' : null
    if (!next) return
    update(p.id, { status: next })
    if (next === 'ready') {
      updateOrder(p.orderId, { status: 'dispatched' })
      toast({ title: 'Package ready for dispatch', description: p.packageId })
    } else {
      toast({ title: `Package ${next}`, description: p.packageId })
    }
  }

  const columns: DataColumn<Pkg>[] = [
    { key: 'package', header: 'Package #', render: (p) => <span className="font-mono text-xs">{p.packageId}</span>, sortValue: (p) => p.packageId, csvValue: (p) => p.packageId },
    { key: 'order', header: 'Order', render: (p) => <span className="font-mono text-xs">{p.orderNumber}</span>, sortValue: (p) => p.orderNumber, csvValue: (p) => p.orderNumber },
    { key: 'boxes', header: 'Boxes', render: (p) => p.packageCount },
    { key: 'weight', header: 'Weight', render: (p) => p.totalWeight || '—', hideOnMobile: true },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} />, sortValue: (p) => p.status, csvValue: (p) => p.status },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Packing</CardTitle>
          <Button onClick={openCreate} disabled={packableOrders.length === 0}>
            <Plus className="w-4 h-4" /> Create package
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="warehouse-packages"
            emptyIcon={<PackageCheck className="w-6 h-6" />}
            emptyTitle="No packages yet"
            emptyDescription="Package picked orders before dispatch."
            actions={(p) => {
              const next = p.status === 'pending' ? 'Start packing' : p.status === 'packing' ? 'Mark packed' : p.status === 'packed' ? 'Mark ready' : null
              return next ? <Button variant="outline" size="sm" onClick={() => advance(p)}>{next}</Button> : undefined
            }}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search package or order..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create package" size="md">
        <div className="space-y-4">
          <div>
            <Label required>Packed order</Label>
            <Select value={orderId} onValueChange={setOrderId}>
              {packableOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerName}</option>)}
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
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Total weight</Label><Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 50 kg" /></div>
            <div><Label>Dimensions</Label><Input value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g. 30x20x15" /></div>
            <div><Label>Box count</Label><Input type="number" value={boxCount} onChange={(e) => setBoxCount(e.target.value)} /></div>
          </div>
          <div><Label>Remarks</Label><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={createPackage}>Create package</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}