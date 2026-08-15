import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { RotateCcw, Plus, Search, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { ReturnRecord, ReturnLine, ReturnStatus, InventoryItem } from './types'
import { RETURN_FLOW } from './types'
import { RETURN_SEED, INVENTORY_SEED } from './seed'
import { todayISO } from '../../lib/utils'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useStockLedger } from './ledger'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

interface DraftLine { itemId: string; qty: string; reason: string; condition: 'good' | 'damaged'; action: 'restock' | 'quarantine' | 'return_to_supplier' }

const emptyLine: DraftLine = { itemId: '', qty: '', reason: '', condition: 'good', action: 'restock' }

export default function WarehouseReturns() {
  const { items: returns, add, update } = useLocalCollection<ReturnRecord>('warehouse:returns', RETURN_SEED)
  const { items: inventory, update: updateInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { logMovement } = useStockLedger()
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'customer' | 'supplier'>('customer')
  const [modalOpen, setModalOpen] = useState(false)
  const [type, setType] = useState<'customer' | 'supplier'>('customer')
  const [partyName, setPartyName] = useState('')
  const [originalRef, setOriginalRef] = useState('')
  const [date, setDate] = useState(todayISO())
  const [remarks, setRemarks] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([{ ...emptyLine }])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return returns.filter((r) => {
      const matchesQ = `${r.returnNumber} ${r.partyName} ${r.originalRef}`.toLowerCase().includes(q)
      const matchesType = r.type === tab
      return matchesQ && matchesType
    })
  }, [returns, query, tab])

  function openCreate(t: 'customer' | 'supplier') {
    setType(t); setPartyName(''); setOriginalRef(''); setDate(todayISO()); setRemarks('')
    setLines([{ ...emptyLine, itemId: inventory[0]?.id ?? '' }])
    setModalOpen(true)
  }

  function updateLine(idx: number, patch: Partial<DraftLine>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  function canSave(): boolean {
    return lines.length > 0 && lines.every((l) => l.itemId && Number(l.qty) > 0)
  }

  function createReturn() {
    if (!canSave()) {
      toast({ title: 'Add at least one item with a quantity', variant: 'error' })
      return
    }
    const items: ReturnLine[] = lines.map((l) => {
      const item = inventory.find((i) => i.id === l.itemId)!
      return { itemId: item.id, itemName: item.name, qty: Number(l.qty), reason: l.reason, condition: l.condition, action: l.action }
    })
    const number = `RET-2026-${String(returns.length + 1).padStart(3, '0')}`
    add({ id: genId(), returnNumber: number, type, partyName, originalRef, date, items, status: 'requested', remarks })
    setModalOpen(false)
    toast({ title: 'Return recorded', description: number })
  }

  function nextStatus(s: ReturnStatus): ReturnStatus | null {
    const idx = RETURN_FLOW.indexOf(s)
    return idx >= 0 && idx < RETURN_FLOW.length - 1 ? RETURN_FLOW[idx + 1] : null
  }

  function advance(r: ReturnRecord) {
    const next = nextStatus(r.status)
    if (!next) return
    if (next === 'inspected') {
      r.items.forEach((line) => {
        const item = inventory.find((i) => i.id === line.itemId)
        const sku = item?.sku ?? ''
        if (line.action === 'restock') {
          if (item) updateInventory(item.id, { qty: item.qty + line.qty })
          logMovement({ itemId: line.itemId, itemName: line.itemName, sku, type: 'return', qty: line.qty, from: 'Customer', to: 'Stock', reason: 'Return restocked', refNumber: r.returnNumber, notes: r.originalRef })
        } else if (line.action === 'quarantine') {
          if (item) updateInventory(item.id, { quarantine: item.quarantine + line.qty })
          logMovement({ itemId: line.itemId, itemName: line.itemName, sku, type: 'return', qty: 0, from: 'Customer', to: 'Quarantine', reason: 'Return quarantined', refNumber: r.returnNumber, notes: r.originalRef })
        }
      })
    }
    update(r.id, { status: next })
    toast({ title: `Return ${next}`, description: r.returnNumber })
  }

  const columns: DataColumn<ReturnRecord>[] = [
    { key: 'number', header: 'Return #', render: (r) => <span className="font-mono text-xs">{r.returnNumber}</span>, sortValue: (r) => r.returnNumber, csvValue: (r) => r.returnNumber },
    { key: 'party', header: tab === 'customer' ? 'Customer' : 'Supplier', render: (r) => r.partyName, sortValue: (r) => r.partyName, csvValue: (r) => r.partyName },
    { key: 'ref', header: 'Original ref', render: (r) => <span className="font-mono text-xs">{r.originalRef}</span>, hideOnMobile: true },
    { key: 'date', header: 'Date', render: (r) => r.date.slice(0, 10), sortValue: (r) => r.date },
    { key: 'items', header: 'Items', render: (r) => <span className="text-xs">{r.items.reduce((s, i) => s + i.qty, 0)} pcs</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status, csvValue: (r) => r.status },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Returns pipeline and reason mix — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Total returns', value: String(returns.length), delta: `${returns.filter((r) => r.status === 'completed').length} completed`, deltaTone: 'flat' },
            { label: 'Customer', value: String(returns.filter((r) => r.type === 'customer').length), delta: 'customer returns', deltaTone: 'flat' },
            { label: 'Supplier', value: String(returns.filter((r) => r.type === 'supplier').length), delta: 'supplier returns', deltaTone: 'flat' },
            { label: 'Units returned', value: returns.reduce((s, r) => s + r.items.reduce((a, i) => a + i.qty, 0), 0).toLocaleString('en-IN'), delta: 'across all returns', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Returns by status</p>
              <BarChart
                data={RETURN_FLOW.map((s) => ({ label: s, value: returns.filter((r) => r.status === s).length })).filter((d) => d.value > 0)}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Return type mix</p>
              <DonutChart
                data={[
                  { label: 'Customer', value: returns.filter((r) => r.type === 'customer').length, color: 'var(--primary)' },
                  { label: 'Supplier', value: returns.filter((r) => r.type === 'supplier').length, color: '#f59e0b' },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Returns</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openCreate('customer')}><Plus className="w-4 h-4" /> Customer return</Button>
            <Button variant="outline" onClick={() => openCreate('supplier')}><Plus className="w-4 h-4" /> Supplier return</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'customer' | 'supplier')}>
            <TabsList>
              <TabsTrigger value="customer">Customer returns</TabsTrigger>
              <TabsTrigger value="supplier">Supplier returns</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" className="pt-4">
              <ReturnTable tab={tab} filtered={filtered} query={query} setQuery={setQuery} columns={columns} nextStatus={nextStatus} advance={advance} />
            </TabsContent>
            <TabsContent value="supplier" className="pt-4">
              <ReturnTable tab={tab} filtered={filtered} query={query} setQuery={setQuery} columns={columns} nextStatus={nextStatus} advance={advance} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={type === 'customer' ? 'Customer return' : 'Supplier return'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>{type === 'customer' ? 'Customer name' : 'Supplier name'}</Label>
              <Input value={partyName} onChange={(e) => setPartyName(e.target.value)} />
            </div>
            <div>
              <Label>Original reference</Label>
              <Input value={originalRef} onChange={(e) => setOriginalRef(e.target.value)} placeholder={type === 'customer' ? 'SO number' : 'GRN number'} />
            </div>
          </div>
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_1fr_120px_150px_36px] gap-2 items-end">
              <Label>Item</Label><Label>Qty</Label><Label>Reason</Label><Label>Condition</Label><Label>Action</Label><span />
            </div>
            {lines.map((l, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_1fr_120px_150px_36px] gap-2 items-end">
                <Select value={l.itemId} onValueChange={(v) => updateLine(idx, { itemId: v })}>
                  {inventory.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </Select>
                <Input type="number" value={l.qty} onChange={(e) => updateLine(idx, { qty: e.target.value })} />
                <Input value={l.reason} onChange={(e) => updateLine(idx, { reason: e.target.value })} />
                <Select value={l.condition} onValueChange={(v) => updateLine(idx, { condition: v as 'good' | 'damaged' })}>
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                </Select>
                <Select value={l.action} onValueChange={(v) => updateLine(idx, { action: v as DraftLine['action'] })}>
                  <option value="restock">Restock</option>
                  <option value="quarantine">Quarantine</option>
                  <option value="return_to_supplier">Return to supplier</option>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))} aria-label="Remove" disabled={lines.length <= 1}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setLines([...lines, { ...emptyLine, itemId: inventory[0]?.id ?? '' }])}>
              <Plus className="w-4 h-4" /> Add line
            </Button>
          </div>
          <div><Label>Remarks</Label><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={createReturn} disabled={!canSave()}>Record return</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ReturnTable({
  tab, filtered, query, setQuery, columns, nextStatus, advance,
}: {
  tab: 'customer' | 'supplier'
  filtered: ReturnRecord[]
  query: string
  setQuery: (v: string) => void
  columns: DataColumn<ReturnRecord>[]
  nextStatus: (s: ReturnStatus) => ReturnStatus | null
  advance: (r: ReturnRecord) => void
}) {
  return (
    <DataTable
      columns={columns}
      rows={filtered}
      rowKey={(r) => r.id}
      pageSize={10}
      exportFilename={`warehouse-returns-${tab}`}
      emptyIcon={<RotateCcw className="w-6 h-6" />}
      emptyTitle="No returns here"
      emptyDescription="Record a return to start the inspection flow."
      actions={(r) => {
        const next = nextStatus(r.status)
        return next ? <Button variant="outline" size="sm" onClick={() => advance(r)}>Mark {next}</Button> : undefined
      }}
      toolbar={
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Search returns..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      }
    />
  )
}