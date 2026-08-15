import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { ArrowLeftRight, Plus, Search, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { StockTransfer, StockTransferLine, InventoryItem } from './types'
import { TRANSFER_FLOW } from './types'
import { TRANSFER_SEED, INVENTORY_SEED, WAREHOUSE_SEED, LOCATION_SEED } from './seed'
import { availableOf } from './types'
import { todayISO } from '../../lib/utils'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { Stepper } from '../../components/Stepper'
import { useStockLedger } from './ledger'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

const STEPS = ['Details', 'Confirm']

interface DraftLine { itemId: string; qty: string; fromBin: string; toBin: string }

export default function WarehouseTransfers() {
  const { items: transfers, add, update } = useLocalCollection<StockTransfer>('warehouse:transfers', TRANSFER_SEED)
  const { items: inventory, update: updateInventory, add: addInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { logMovement } = useStockLedger()
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [fromWh, setFromWh] = useState('wh-1')
  const [toWh, setToWh] = useState('wh-2')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])

  const filtered = useMemo(
    () => transfers.filter((t) => `${t.transferNumber}`.toLowerCase().includes(query.toLowerCase())),
    [transfers, query]
  )

  const sourceItems = inventory.filter((i) => i.warehouseId === fromWh && availableOf(i) > 0)
  const destWhName = WAREHOUSE_SEED.find((w) => w.id === toWh)?.name ?? ''
  const destBins = LOCATION_SEED.filter((l) => l.warehouseId === toWh)

  function openWizard() {
    setFromWh('wh-1'); setToWh('wh-2'); setDate(todayISO()); setNotes('')
    setLines([{ itemId: sourceItems[0]?.id ?? '', qty: '', fromBin: sourceItems[0]?.location ?? '', toBin: destBins[0]?.code ?? '' }])
    setStep(0); setWizardOpen(true)
  }

  function addLine() {
    const first = sourceItems[0]
    setLines([...lines, { itemId: first?.id ?? '', qty: '', fromBin: first?.location ?? '', toBin: destBins[0]?.code ?? '' }])
  }

  function updateLine(idx: number, patch: Partial<DraftLine>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function setFrom(v: string) {
    setFromWh(v)
    setLines(lines.map((l) => {
      const item = inventory.find((i) => i.id === l.itemId)
      return { ...l, fromBin: item && item.warehouseId === v ? item.location : '' }
    }))
  }

  function canConfirm(): boolean {
    return lines.length > 0 && lines.every((l) => l.itemId && Number(l.qty) > 0)
  }

  function createTransfer() {
    if (!canConfirm()) {
      toast({ title: 'Add at least one item with a quantity', variant: 'error' })
      return
    }
    const items: StockTransferLine[] = lines.map((l) => {
      const item = inventory.find((i) => i.id === l.itemId)!
      return { itemId: item.id, itemName: item.name, sku: item.sku, qty: Number(l.qty), fromBin: l.fromBin || undefined, toBin: l.toBin || undefined }
    })
    const number = `TR-2026-${String(transfers.length + 1).padStart(3, '0')}`
    add({ id: genId(), transferNumber: number, fromWarehouseId: fromWh, toWarehouseId: toWh, date, status: 'created', items, notes })
    setWizardOpen(false)
    toast({ title: 'Transfer created', description: number })
  }

  function nextStatus(s: StockTransfer['status']): StockTransfer['status'] | null {
    const idx = TRANSFER_FLOW.indexOf(s)
    return idx >= 0 && idx < TRANSFER_FLOW.length - 1 ? TRANSFER_FLOW[idx + 1] : null
  }

  function applyTransfer(t: StockTransfer) {
    const fromName = WAREHOUSE_SEED.find((w) => w.id === t.fromWarehouseId)?.name ?? t.fromWarehouseId
    const toName = WAREHOUSE_SEED.find((w) => w.id === t.toWarehouseId)?.name ?? t.toWarehouseId
    const sameWh = t.fromWarehouseId === t.toWarehouseId
    t.items.forEach((line) => {
      const src = inventory.find((i) => i.id === line.itemId && i.warehouseId === t.fromWarehouseId)
      if (src) {
        updateInventory(src.id, { qty: Math.max(0, src.qty - line.qty) })
      }
      if (sameWh) {
        const same = inventory.find((i) => i.id === line.itemId)
        if (same) updateInventory(same.id, { location: line.toBin ?? same.location })
      } else {
        let dest = inventory.find((i) => i.sku === line.sku && i.warehouseId === t.toWarehouseId)
        if (!dest) {
          const srcFull = inventory.find((i) => i.id === line.itemId)!
          dest = { ...srcFull, id: genId(), qty: 0, reserved: 0, warehouseId: t.toWarehouseId, location: line.toBin ?? '' }
          addInventory(dest)
        }
        updateInventory(dest.id, { qty: dest.qty + line.qty, location: line.toBin ?? dest.location })
      }
      logMovement({ itemId: line.itemId, itemName: line.itemName, sku: line.sku, type: 'transfer_out', qty: -line.qty, from: fromName, to: toName, reason: 'Stock transfer', refNumber: t.transferNumber, notes: t.notes })
      logMovement({ itemId: line.itemId, itemName: line.itemName, sku: line.sku, type: 'transfer_in', qty: line.qty, from: fromName, to: toName, reason: 'Stock transfer', refNumber: t.transferNumber, notes: t.notes })
    })
  }

  function advance(t: StockTransfer) {
    const next = nextStatus(t.status)
    if (!next) return
    if (next === 'received') applyTransfer(t)
    update(t.id, { status: next })
    toast({ title: `Transfer ${next}`, description: t.transferNumber })
  }

  const columns: DataColumn<StockTransfer>[] = [
    { key: 'number', header: 'Transfer #', render: (t) => <span className="font-mono text-xs">{t.transferNumber}</span>, sortValue: (t) => t.transferNumber, csvValue: (t) => t.transferNumber },
    { key: 'from', header: 'From', render: (t) => WAREHOUSE_SEED.find((w) => w.id === t.fromWarehouseId)?.name ?? t.fromWarehouseId, hideOnMobile: true },
    { key: 'to', header: 'To', render: (t) => WAREHOUSE_SEED.find((w) => w.id === t.toWarehouseId)?.name ?? t.toWarehouseId, hideOnMobile: true },
    { key: 'date', header: 'Date', render: (t) => t.date.slice(0, 10), sortValue: (t) => t.date },
    { key: 'items', header: 'Items', render: (t) => <span className="text-xs">{t.items.reduce((s, i) => s + i.qty, 0)} pcs</span> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} />, sortValue: (t) => t.status, csvValue: (t) => t.status },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Inter-warehouse movement pipeline — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total transfers', value: String(transfers.length), delta: `${transfers.filter((t) => t.status === 'completed').length} completed`, deltaTone: 'flat' },
            { label: 'In transit', value: String(transfers.filter((t) => ['dispatched', 'received'].includes(t.status)).length), delta: 'active moves', deltaTone: 'flat' },
            { label: 'Units moved', value: transfers.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0).toLocaleString('en-IN'), delta: 'across all transfers', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Transfers by status</p>
              <BarChart
                data={TRANSFER_FLOW.map((s) => ({ label: s, value: transfers.filter((t) => t.status === s).length })).filter((d) => d.value > 0)}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Movement mix</p>
              <DonutChart
                data={[
                  { label: 'Completed', value: transfers.filter((t) => t.status === 'completed').length, color: 'var(--primary)' },
                  { label: 'In transit', value: transfers.filter((t) => t.status === 'dispatched' || t.status === 'received').length, color: '#f59e0b' },
                  { label: 'Created', value: transfers.filter((t) => t.status === 'created').length, color: '#3b82f6' },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Stock Transfers</CardTitle>
          <Button onClick={openWizard}><Plus className="w-4 h-4" /> New transfer</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(t) => t.id}
            pageSize={10}
            exportFilename="warehouse-transfers"
            emptyIcon={<ArrowLeftRight className="w-6 h-6" />}
            emptyTitle="No transfers yet"
            emptyDescription="Move stock between warehouses or between bins."
            actions={(t) => {
              const next = nextStatus(t.status)
              return next ? (
                <Button variant="outline" size="sm" onClick={() => advance(t)}>
                  Mark {next}
                </Button>
              ) : undefined
            }}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search transfer number..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      {wizardOpen && (
        <Card>
          <CardHeader>
            <CardTitle>New stock transfer</CardTitle>
            <Stepper steps={STEPS} current={step} onStepClick={(i) => i < step && setStep(i)} />
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label required>From warehouse</Label>
                    <Select value={fromWh} onValueChange={setFrom}>
                      {WAREHOUSE_SEED.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label required>To warehouse</Label>
                    <Select value={toWh} onValueChange={setToWh}>
                      {WAREHOUSE_SEED.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
                {fromWh === toWh && (
                  <p className="text-xs text-info">Same-warehouse transfer — this moves stock between bins.</p>
                )}
                <div className="space-y-2">
                  {lines.map((l, idx) => {
                    return (
                      <div key={idx} className="grid grid-cols-[1fr_120px_130px_130px_36px] gap-2 items-end">
                        <div>
                          <Label>Item</Label>
                          <Select value={l.itemId} onValueChange={(v) => {
                            const i = inventory.find((x) => x.id === v)
                            updateLine(idx, { itemId: v, fromBin: i?.location ?? '' })
                          }}>
                            {sourceItems.map((i) => <option key={i.id} value={i.id}>{i.name} — avail {availableOf(i)}</option>)}
                          </Select>
                        </div>
                        <div>
                          <Label>Qty</Label>
                          <Input type="number" value={l.qty} onChange={(e) => updateLine(idx, { qty: e.target.value })} />
                        </div>
                        <div>
                          <Label>From bin</Label>
                          <Input value={l.fromBin} onChange={(e) => updateLine(idx, { fromBin: e.target.value })} />
                        </div>
                        <div>
                          <Label>To bin</Label>
                          {fromWh === toWh ? (
                            <Select value={l.toBin} onValueChange={(v) => updateLine(idx, { toBin: v })}>
                              {destBins.map((b) => <option key={b.id} value={b.code}>{b.code}</option>)}
                            </Select>
                          ) : (
                            <Input value={l.toBin} onChange={(e) => updateLine(idx, { toBin: e.target.value })} placeholder={destWhName} />
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))} aria-label="Remove" disabled={lines.length <= 1}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={addLine}><Plus className="w-4 h-4" /> Add item</Button>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(1)} disabled={!canConfirm()}>Continue to confirm</Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>From bin</TableHead><TableHead>To bin</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((l, idx) => {
                      const item = inventory.find((i) => i.id === l.itemId)
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item?.name ?? l.itemId}</TableCell>
                          <TableCell>{l.qty}</TableCell>
                          <TableCell className="text-xs">{l.fromBin || '—'}</TableCell>
                          <TableCell className="text-xs">{l.toBin || '—'}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" /></div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button onClick={createTransfer}>Create transfer</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}