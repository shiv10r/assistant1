import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { ClipboardCheck, Plus, Search, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { StockCount, StockCountLine, InventoryItem } from './types'
import { STOCK_COUNT_SEED, INVENTORY_SEED, WAREHOUSE_SEED } from './seed'
import { todayISO } from '../../lib/utils'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { useStockLedger, useAdjustments } from './ledger'

interface DraftLine { itemId: string; physicalQty: string; reason: string }

export default function WarehouseStockCount() {
  const { items: counts, add, update } = useLocalCollection<StockCount>('warehouse:stockcounts', STOCK_COUNT_SEED)
  const { items: inventory, update: updateInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { logMovement } = useStockLedger()
  const { recordAdjustment } = useAdjustments()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [warehouseId, setWarehouseId] = useState('wh-1')
  const [location, setLocation] = useState('A01-01')
  const [date, setDate] = useState(todayISO())
  const [lines, setLines] = useState<DraftLine[]>([])

  const filtered = useMemo(
    () => counts.filter((c) => `${c.countNumber} ${c.location}`.toLowerCase().includes(query.toLowerCase())),
    [counts, query]
  )

  const whItems = inventory.filter((i) => i.warehouseId === warehouseId)

  function openCreate() {
    setWarehouseId('wh-1'); setLocation('A01-01'); setDate(todayISO())
    setLines(whItems.map((i) => ({ itemId: i.id, physicalQty: String(i.qty), reason: '' })))
    setModalOpen(true)
  }

  function updateLine(idx: number, patch: Partial<DraftLine>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function createCount() {
    const items: StockCountLine[] = lines.map((l) => {
      const item = inventory.find((i) => i.id === l.itemId)!
      const physicalQty = Number(l.physicalQty) || 0
      return { itemId: item.id, itemName: item.name, systemQty: item.qty, physicalQty, difference: physicalQty - item.qty, reason: l.reason }
    })
    const number = `SC-2026-${String(counts.length + 1).padStart(3, '0')}`
    add({ id: genId(), countNumber: number, location, warehouseId, date, items, status: 'open' })
    setModalOpen(false)
    toast({ title: 'Stock count created', description: number })
  }

  function approve(c: StockCount) {
    c.items.forEach((line) => {
      const diff = line.difference
      if (diff !== 0) {
        const item = inventory.find((i) => i.id === line.itemId)
        if (item) updateInventory(item.id, { qty: line.physicalQty })
        recordAdjustment({
          itemId: line.itemId, itemName: line.itemName, sku: item?.sku ?? '', location: c.location,
          oldQty: line.systemQty, newQty: line.physicalQty, difference: diff,
          reason: line.reason || 'Stock count adjustment', remarks: c.countNumber,
        })
        logMovement({ itemId: line.itemId, itemName: line.itemName, sku: item?.sku ?? '', type: 'stock_count', qty: diff, from: 'System', to: 'Physical', reason: 'Stock count', refNumber: c.countNumber, notes: line.reason })
      }
    })
    update(c.id, { status: 'approved' })
    toast({ title: 'Stock count approved', description: c.countNumber })
  }

  const columns: DataColumn<StockCount>[] = [
    { key: 'number', header: 'Count #', render: (c) => <span className="font-mono text-xs">{c.countNumber}</span>, sortValue: (c) => c.countNumber, csvValue: (c) => c.countNumber },
    { key: 'location', header: 'Location', render: (c) => <span className="font-mono text-xs">{c.location}</span>, sortValue: (c) => c.location },
    { key: 'date', header: 'Date', render: (c) => c.date.slice(0, 10), sortValue: (c) => c.date },
    { key: 'items', header: 'Items', render: (c) => <span className="text-xs">{c.items.length} lines</span> },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status, csvValue: (c) => c.status },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Stock Counts</CardTitle>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> New count</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id}
            pageSize={10}
            exportFilename="warehouse-stockcounts"
            emptyIcon={<ClipboardCheck className="w-6 h-6" />}
            emptyTitle="No stock counts yet"
            emptyDescription="Count a location to reconcile physical vs system stock."
            actions={(c) => (c.status === 'open' ? <Button variant="outline" size="sm" onClick={() => approve(c)}>Approve count</Button> : undefined)}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search count number or location..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New stock count" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>Warehouse</Label>
              <Select value={warehouseId} onValueChange={(v) => {
                setWarehouseId(v)
                const items = inventory.filter((i) => i.warehouseId === v)
                setLines(items.map((i) => ({ itemId: i.id, physicalQty: String(i.qty), reason: '' })))
              }}>
                {WAREHOUSE_SEED.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </Select>
            </div>
            <div><Label required>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_120px_120px_36px] gap-2 items-end">
              <Label>Item</Label><Label>System qty</Label><Label>Physical qty</Label><span />
            </div>
            {lines.map((l, idx) => {
              const item = inventory.find((i) => i.id === l.itemId)
              return (
                <div key={idx} className="grid grid-cols-[1fr_120px_120px_36px] gap-2 items-end">
                  <Select value={l.itemId} onValueChange={(v) => updateLine(idx, { itemId: v })}>
                    {whItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </Select>
                  <div className="text-sm py-2 text-muted">{item?.qty ?? 0}</div>
                  <Input type="number" value={l.physicalQty} onChange={(e) => updateLine(idx, { physicalQty: e.target.value })} />
                  <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))} aria-label="Remove" disabled={lines.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={createCount}>Create count</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}