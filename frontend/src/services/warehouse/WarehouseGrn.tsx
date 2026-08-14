import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Input, Label, Select, Modal, Empty, fmtDate, todayISO,
} from '../../components/ui'
import { Truck, Plus, Search, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { GrnRecord, GrnLine, PurchaseOrder, InventoryItem } from './types'
import { PO_SEED, GRN_SEED, INVENTORY_SEED } from './seed'

export default function WarehouseGrn() {
  const { items: pos } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const { items: inventory, update: updateInventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: grns, add, remove } = useLocalCollection<GrnRecord>('warehouse:grn', GRN_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [poId, setPoId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<GrnLine[]>([])

  const filtered = useMemo(
    () => grns.filter((g) => `${g.grnNumber} ${g.poNumber}`.toLowerCase().includes(query.toLowerCase())),
    [grns, query]
  )

  const receivablePOs = pos.filter((po) => po.status === 'sent' || po.status === 'received')

  function linesForPo(id: string): GrnLine[] {
    const po = pos.find((p) => p.id === id)
    return po ? po.lines.map((l) => ({ itemId: l.itemId, itemName: l.itemName, orderedQty: l.qty, receivedQty: l.qty })) : []
  }

  function openAdd() {
    const po = receivablePOs[0]
    setPoId(po?.id ?? '')
    setDate(todayISO())
    setNotes('')
    setLines(po ? linesForPo(po.id) : [])
    setModalOpen(true)
  }

  function onPoChange(id: string) {
    setPoId(id)
    setLines(linesForPo(id))
  }

  function save() {
    const po = pos.find((p) => p.id === poId)
    if (!po || lines.length === 0) return
    add({
      id: genId(),
      grnNumber: `GRN-${new Date().getFullYear()}-${String(grns.length + 1).padStart(3, '0')}`,
      poId: po.id, poNumber: po.poNumber, date, lines, notes,
    })
    // bump matching inventory items by received qty (best-effort match by name)
    lines.forEach((line) => {
      const match = inventory.find((i) => i.name === line.itemName)
      if (match) updateInventory(match.id, { qty: match.qty + line.receivedQty })
    })
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Goods Received Notes</CardTitle>
          <Button onClick={openAdd} disabled={receivablePOs.length === 0}><Plus className="w-4 h-4" /> New GRN</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search GRN or PO number..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<Truck className="w-6 h-6" />} title="No goods received yet" description="Record a GRN once stock arrives against a purchase order." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN #</TableHead>
                  <TableHead>PO #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lines</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono text-xs">{g.grnNumber}</TableCell>
                    <TableCell>{g.poNumber}</TableCell>
                    <TableCell>{fmtDate(g.date)}</TableCell>
                    <TableCell>{g.lines.length} item(s)</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => remove(g.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New goods received note" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Purchase order</Label>
              <Select value={poId} onValueChange={onPoChange}>
                {receivablePOs.map((po) => <option key={po.id} value={po.id}>{po.poNumber} — {po.supplierName}</option>)}
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>

          {lines.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Item</TableHead><TableHead>Ordered</TableHead><TableHead>Received</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, idx) => (
                  <TableRow key={line.itemId}>
                    <TableCell>{line.itemName}</TableCell>
                    <TableCell>{line.orderedQty}</TableCell>
                    <TableCell>
                      <Input type="number" value={line.receivedQty} onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, receivedQty: Number(e.target.value) || 0 } : l))} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" /></div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!poId}>Save GRN</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
