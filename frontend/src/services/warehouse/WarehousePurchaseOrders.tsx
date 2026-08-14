import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge, Button, Input, Label, Select, Modal, Empty, money, fmtDate, todayISO,
} from '../../components/ui'
import { ClipboardList, Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { PurchaseOrder, POLine, POStatus } from './types'
import { SUPPLIER_SEED, PO_SEED } from './seed'

const STATUS_TONE: Record<POStatus, 'outline' | 'info' | 'success' | 'danger'> = {
  draft: 'outline', sent: 'info', received: 'success', cancelled: 'danger',
}

type LineDraft = { itemName: string; qty: string; unitPrice: string }
const emptyLine: LineDraft = { itemName: '', qty: '1', unitPrice: '0' }

export default function WarehousePurchaseOrders() {
  const { items: suppliers } = useLocalCollection('warehouse:suppliers', SUPPLIER_SEED)
  const { items: pos, add, update, remove } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseOrder | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [status, setStatus] = useState<POStatus>('draft')
  const [lines, setLines] = useState<LineDraft[]>([{ ...emptyLine }])

  const filtered = useMemo(
    () => pos.filter((po) => `${po.poNumber} ${po.supplierName}`.toLowerCase().includes(query.toLowerCase())),
    [pos, query]
  )

  function openAdd() {
    setEditing(null)
    setSupplierId(suppliers[0]?.id ?? '')
    setDate(todayISO())
    setStatus('draft')
    setLines([{ ...emptyLine }])
    setModalOpen(true)
  }

  function openEdit(po: PurchaseOrder) {
    setEditing(po)
    setSupplierId(po.supplierId)
    setDate(po.date)
    setStatus(po.status)
    setLines(po.lines.map((l) => ({ itemName: l.itemName, qty: String(l.qty), unitPrice: String(l.unitPrice) })))
    setModalOpen(true)
  }

  function save() {
    const supplier = suppliers.find((s) => s.id === supplierId)
    if (!supplier) return
    const finalLines: POLine[] = lines
      .filter((l) => l.itemName.trim())
      .map((l) => ({ itemId: genId(), itemName: l.itemName.trim(), qty: Number(l.qty) || 0, unitPrice: Number(l.unitPrice) || 0 }))
    const total = finalLines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
    if (editing) {
      update(editing.id, { supplierId, supplierName: supplier.name, date, status, lines: finalLines, total })
    } else {
      add({
        id: genId(),
        poNumber: `PO-${new Date().getFullYear()}-${String(pos.length + 1).padStart(3, '0')}`,
        supplierId, supplierName: supplier.name, date, status, lines: finalLines, total,
      })
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Purchase Orders</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> New PO</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search PO number or supplier..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<ClipboardList className="w-6 h-6" />} title="No purchase orders" description="Create a PO to start ordering stock from suppliers." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">{po.poNumber}</TableCell>
                    <TableCell className="font-medium">{po.supplierName}</TableCell>
                    <TableCell>{fmtDate(po.date)}</TableCell>
                    <TableCell><Badge variant={STATUS_TONE[po.status]} size="sm">{po.status}</Badge></TableCell>
                    <TableCell>{money(po.total)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(po)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(po.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit purchase order' : 'New purchase order'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label required>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as POStatus)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Line items</Label>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_90px_110px_36px] gap-2 items-center">
                  <Input placeholder="Item name" value={line.itemName} onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, itemName: e.target.value } : l))} />
                  <Input type="number" placeholder="Qty" value={line.qty} onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, qty: e.target.value } : l))} />
                  <Input type="number" placeholder="Unit price" value={line.unitPrice} onChange={(e) => setLines(lines.map((l, i) => i === idx ? { ...l, unitPrice: e.target.value } : l))} />
                  <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))} aria-label="Remove line"><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setLines([...lines, { ...emptyLine }])}><Plus className="w-4 h-4" /> Add line</Button>
          </div>

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
