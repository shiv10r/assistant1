import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Input, Label, Select, Empty,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Truck, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { GrnRecord, GrnLine, PurchaseOrder, InventoryItem, PutawayBin } from './types'
import { PO_SEED, GRN_SEED, INVENTORY_SEED, LOCATION_SEED, WAREHOUSE_SEED } from './seed'
import { fmtDate, todayISO } from '../../lib/utils'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'
import { Stepper } from './components/Stepper'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'
import { useStockLedger } from './ledger'

const STEPS = ['Purchase Order', 'Receive Items', 'Inspection', 'Put-away', 'Complete']

export default function WarehouseGrn() {
  const { items: pos, update: updatePO } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const { items: inventory, update: updateInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: grns, add, remove } = useLocalCollection<GrnRecord>('warehouse:grn', GRN_SEED)
  const { logMovement } = useStockLedger()
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [poId, setPoId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<GrnLine[]>([])

  const filtered = useMemo(
    () => grns.filter((g) => `${g.grnNumber} ${g.poNumber}`.toLowerCase().includes(query.toLowerCase())),
    [grns, query]
  )

  // POs that can be received: submitted / approved / partially received
  const receivablePOs = pos.filter((p) => p.status === 'submitted' || p.status === 'approved' || p.status === 'partial')

  function linesForPo(id: string): GrnLine[] {
    const po = pos.find((p) => p.id === id)
    if (!po) return []
    return po.lines.map((l) => {
      const loc = LOCATION_SEED.find((x) => x.warehouseId === po.warehouseId)?.code ?? LOCATION_SEED[0]?.code ?? ''
      return {
        itemId: l.itemId, itemName: l.itemName,
        orderedQty: l.qty, receivedQty: l.qty, damagedQty: 0, rejectedQty: 0, acceptedQty: l.qty,
        putaway: [{ location: loc, qty: l.qty }],
      }
    })
  }

  function openWizard() {
    const po = receivablePOs[0]
    setPoId(po?.id ?? '')
    setDate(todayISO())
    setNotes('')
    setLines(po ? linesForPo(po.id) : [])
    setStep(0)
    setWizardOpen(true)
  }

  function onPoChange(id: string) {
    setPoId(id)
    setLines(linesForPo(id))
    setStep(1)
  }

  function updateLine(idx: number, patch: Partial<GrnLine>) {
    setLines(lines.map((l, i) => {
      if (i !== idx) return l
      const next = { ...l, ...patch }
      // accepted = received - damaged - rejected (never negative)
      next.acceptedQty = Math.max(0, next.receivedQty - next.damagedQty - next.rejectedQty)
      // keep put-away total in sync with accepted when not manually split
      if (next.putaway.length <= 1) {
        next.putaway = [{ location: next.putaway[0]?.location ?? LOCATION_SEED[0]?.code ?? '', qty: next.acceptedQty }]
      }
      return next
    }))
  }

  function updatePutaway(idx: number, binIdx: number, patch: Partial<PutawayBin>) {
    setLines(lines.map((l, i) => {
      if (i !== idx) return l
      const putaway = l.putaway.map((b, bi) => (bi === binIdx ? { ...b, ...patch } : b))
      return { ...l, putaway }
    }))
  }

  function addPutawayBin(idx: number) {
    setLines(lines.map((l, i) => {
      if (i !== idx) return l
      const loc = LOCATION_SEED.find((x) => x.code === l.putaway[0]?.location) ?? LOCATION_SEED[0]
      const code = loc?.code ?? ''
      return { ...l, putaway: [...l.putaway, { location: code, qty: 0 }] }
    }))
  }

  function removePutawayBin(idx: number, binIdx: number) {
    setLines(lines.map((l, i) => (i !== idx ? l : { ...l, putaway: l.putaway.filter((_, bi) => bi !== binIdx) })))
  }

  function putawayTotal(line: GrnLine): number {
    return line.putaway.reduce((sum, b) => sum + (Number(b.qty) || 0), 0)
  }

  function canFinish(): boolean {
    return lines.every((l) => putawayTotal(l) === l.acceptedQty)
  }

  function finish() {
    const po = pos.find((p) => p.id === poId)
    if (!po || !canFinish()) {
      toast({ title: 'Put-away quantities must match accepted quantities', variant: 'error' })
      return
    }
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(grns.length + 1).padStart(3, '0')}`
    add({ id: genId(), grnNumber, poId: po.id, poNumber: po.poNumber, date, lines, notes })

    // Update inventory: add accepted to on-hand, damaged to damaged pool, per put-away bin
    lines.forEach((line) => {
      const item = inventory.find((i) => i.id === line.itemId)
      if (item) {
        updateInventory(item.id, {
          qty: item.qty + line.acceptedQty,
          damaged: (item.damaged || 0) + line.damagedQty,
          location: line.putaway[0]?.location ?? item.location,
        })
        line.putaway.forEach((b) => {
          if ((Number(b.qty) || 0) > 0) {
            logMovement({
              itemId: item.id, itemName: item.name, sku: item.sku, type: 'GRN',
              qty: Number(b.qty) || 0, from: 'Supplier', to: b.location,
              reason: 'Goods received', refNumber: grnNumber, notes: notes,
            })
          }
        })
      }
    })

    // Advance PO status: fully received -> received, else partial
    const allReceived = lines.every((l) => l.acceptedQty >= l.orderedQty)
    const nextStatus = allReceived ? 'received' : 'partial'
    updatePO(po.id, { status: nextStatus })

    setWizardOpen(false)
    toast({ title: 'GRN saved', description: `${grnNumber} — inventory updated, PO moved to ${nextStatus}` })
  }

  const columns: DataColumn<GrnRecord>[] = [
    { key: 'grnNumber', header: 'GRN #', render: (g) => <span className="font-mono text-xs">{g.grnNumber}</span>, sortValue: (g) => g.grnNumber },
    { key: 'poNumber', header: 'PO #', render: (g) => g.poNumber, sortValue: (g) => g.poNumber },
    { key: 'date', header: 'Date', render: (g) => fmtDate(g.date), sortValue: (g) => g.date },
    { key: 'lines', header: 'Lines', render: (g) => <span className="text-xs">{g.lines.length} item(s)</span>, sortValue: (g) => g.lines.length },
    { key: 'received', header: 'Received', render: (g) => <span className="text-xs">{g.lines.reduce((s, l) => s + l.acceptedQty, 0)} pcs</span> },
  ]

  const currentPO = pos.find((p) => p.id === poId)
  const activeWarehouse = WAREHOUSE_SEED.find((w) => w.id === currentPO?.warehouseId)
  const availableBins = LOCATION_SEED.filter((l) => l.warehouseId === currentPO?.warehouseId)

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Goods receiving volume and quality — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total GRNs', value: String(grns.length), delta: 'receipts recorded', deltaTone: 'flat' },
            { label: 'Units received', value: grns.reduce((s, g) => s + g.lines.reduce((a, l) => a + l.receivedQty, 0), 0).toLocaleString('en-IN'), delta: 'across all GRNs', deltaTone: 'flat' },
            { label: 'Damaged units', value: String(grns.reduce((s, g) => s + g.lines.reduce((a, l) => a + l.damagedQty, 0), 0)), delta: 'quality issues', deltaTone: 'down' },
            { label: 'Rejected units', value: String(grns.reduce((s, g) => s + g.lines.reduce((a, l) => a + l.rejectedQty, 0), 0)), delta: 'not accepted', deltaTone: 'down' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Received vs rejected by GRN</p>
              <BarChart
                data={grns.slice(0, 8).map((g) => ({
                  label: g.grnNumber,
                  value: g.lines.reduce((s, l) => s + l.acceptedQty, 0),
                }))}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Receipt quality mix</p>
              <DonutChart
                data={[
                  { label: 'Accepted', value: grns.reduce((s, g) => s + g.lines.reduce((a, l) => a + l.acceptedQty, 0), 0), color: 'var(--primary)' },
                  { label: 'Damaged', value: grns.reduce((s, g) => s + g.lines.reduce((a, l) => a + l.damagedQty, 0), 0), color: '#f59e0b' },
                  { label: 'Rejected', value: grns.reduce((s, g) => s + g.lines.reduce((a, l) => a + l.rejectedQty, 0), 0), color: '#ef4444' },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Goods Received Notes</CardTitle>
          <Button onClick={openWizard} disabled={receivablePOs.length === 0}><Plus className="w-4 h-4" /> Receive Goods</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(g) => g.id}
            pageSize={10}
            exportFilename="warehouse-grn"
            emptyIcon={<Truck className="w-6 h-6" />}
            emptyTitle="No goods received yet"
            emptyDescription="Record a GRN once stock arrives against a purchase order."
            actions={(g) => (
              <Button variant="ghost" size="icon" onClick={() => remove(g.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
            )}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search GRN or PO number..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      {wizardOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Receive goods — new GRN</CardTitle>
            <Stepper steps={STEPS} current={step} onStepClick={(i) => i < step && setStep(i)} />
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="space-y-4">
                <Label required>Purchase order</Label>
                {receivablePOs.length === 0 ? (
                  <Empty icon={<Truck className="w-6 h-6" />} title="No receivable POs" description="Create and approve a purchase order first." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {receivablePOs.map((po) => (
                      <button
                        key={po.id}
                        onClick={() => onPoChange(po.id)}
                        className="text-left rounded-lg border border-border bg-surface2/50 hover:border-primary/60 p-4 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold">{po.poNumber}</span>
                          <StatusBadge status={po.status} />
                        </div>
                        <div className="text-sm font-medium mt-1">{po.supplierName}</div>
                        <div className="text-xs text-muted mt-1">
                          {po.lines.length} item(s) · {WAREHOUSE_SEED.find((w) => w.id === po.warehouseId)?.name ?? '—'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setWizardOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted">PO: </span><span className="font-mono">{currentPO?.poNumber}</span>
                    <span className="text-muted ml-4">Supplier: </span><span>{currentPO?.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="mb-0">Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Product</TableHead><TableHead>Ordered</TableHead><TableHead>Received</TableHead><TableHead>Damaged</TableHead><TableHead>Rejected</TableHead><TableHead>Accepted</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, idx) => (
                      <TableRow key={line.itemId}>
                        <TableCell className="font-medium">{line.itemName}</TableCell>
                        <TableCell>{line.orderedQty}</TableCell>
                        <TableCell className="w-24">
                          <Input type="number" value={line.receivedQty} onChange={(e) => updateLine(idx, { receivedQty: Number(e.target.value) || 0 })} />
                        </TableCell>
                        <TableCell className="w-24">
                          <Input type="number" value={line.damagedQty} onChange={(e) => updateLine(idx, { damagedQty: Number(e.target.value) || 0 })} />
                        </TableCell>
                        <TableCell className="w-24">
                          <Input type="number" value={line.rejectedQty} onChange={(e) => updateLine(idx, { rejectedQty: Number(e.target.value) || 0 })} />
                        </TableCell>
                        <TableCell><span className="font-semibold text-emerald-600">{line.acceptedQty}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button onClick={() => setStep(2)}>Continue to inspection <Truck className="w-4 h-4" /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted">Review accepted, damaged and rejected quantities. Accepted stock will be put away in the next step.</p>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Product</TableHead><TableHead>Received</TableHead><TableHead>Damaged</TableHead><TableHead>Rejected</TableHead><TableHead>Accepted</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.itemId}>
                        <TableCell className="font-medium">{line.itemName}</TableCell>
                        <TableCell>{line.receivedQty}</TableCell>
                        <TableCell className="text-amber-600">{line.damagedQty}</TableCell>
                        <TableCell className="text-red-500">{line.rejectedQty}</TableCell>
                        <TableCell className="font-semibold text-emerald-600">{line.acceptedQty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Continue to put-away</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-muted">
                  Assign accepted stock to bins in <span className="font-medium text-text">{activeWarehouse?.name ?? 'warehouse'}</span>.
                  A single item may be split across multiple bins.
                </p>
                {lines.map((line, idx) => (
                  <div key={line.itemId} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-sm">{line.itemName}</div>
                        <div className="text-xs text-muted mt-0.5">Accepted: {line.acceptedQty} · Put-away total: {putawayTotal(line)}</div>
                      </div>
                      {line.acceptedQty > 0 && putawayTotal(line) !== line.acceptedQty && (
                        <span className="text-xs text-amber-600 font-medium">Quantity mismatch</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {line.putaway.map((bin, bi) => (
                        <div key={bi} className="grid grid-cols-[1fr_120px_36px] gap-2 items-center">
                          <Select value={bin.location} onValueChange={(v) => updatePutaway(idx, bi, { location: v })}>
                            {availableBins.map((l) => <option key={l.id} value={l.code}>{l.code} — {l.zone}/{l.rack}/{l.bin}</option>)}
                          </Select>
                          <Input type="number" placeholder="Qty" value={bin.qty} onChange={(e) => updatePutaway(idx, bi, { qty: Number(e.target.value) || 0 })} />
                          <Button variant="ghost" size="icon" onClick={() => removePutawayBin(idx, bi)} aria-label="Remove bin" disabled={line.putaway.length <= 1}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => addPutawayBin(idx)} disabled={putawayTotal(line) >= line.acceptedQty}>
                      <Plus className="w-4 h-4" /> Add bin
                    </Button>
                  </div>
                ))}
                <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for this GRN" /></div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)} disabled={!canFinish()}>Review & complete</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <div className="text-sm">
                    <div className="font-medium text-text">Ready to commit GRN</div>
                    <div className="text-muted mt-0.5">Stock movements will be recorded in the ledger and inventory updated on completion.</div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Product</TableHead><TableHead>Accepted</TableHead><TableHead>Damaged</TableHead><TableHead>Put-away</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.itemId}>
                        <TableCell className="font-medium">{line.itemName}</TableCell>
                        <TableCell>{line.acceptedQty}</TableCell>
                        <TableCell className="text-amber-600">{line.damagedQty}</TableCell>
                        <TableCell className="text-xs">{line.putaway.map((b) => `${b.location}:${b.qty}`).join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button onClick={finish} disabled={!canFinish()}>Complete GRN</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}