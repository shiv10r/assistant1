import { useMemo, useState } from 'react'
import { Card, CardContent, Button, Badge, Empty, Tabs, TabsList, TabsTrigger, TabsContent, Input, Select, Textarea } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { useLocalCollection, genId } from '../../lib/localStore'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'
import {
  StatStrip, CrudLayout, RowItem, CrudToolbar, EditDel, DatePill, FormField,
} from '../../components/crud'
import { formatNumber as money, toCsv } from '../../lib/utils'
import {
  FileText, Flag, Tag, Cog, Fuel, TriangleAlert, Star, Plus, Download, Building2, TrendingUp, Wallet, Wrench,
  Scale, Check, Gauge,
} from 'lucide-react'

type TabId = 'contracts' | 'milestones' | 'vendors' | 'equipment' | 'fuel' | 'snags' | 'ratings'

const TABS: { id: TabId; label: string; icon: React.ReactNode; tint: string }[] = [
  { id: 'contracts', label: 'Contracts', icon: <FileText className="w-4 h-4" />, tint: 'from-indigo-500 to-violet-600' },
  { id: 'milestones', label: 'Milestones', icon: <Flag className="w-4 h-4" />, tint: 'from-emerald-500 to-teal-600' },
  { id: 'vendors', label: 'Price Book', icon: <Tag className="w-4 h-4" />, tint: 'from-amber-500 to-orange-600' },
  { id: 'equipment', label: 'Equipment', icon: <Cog className="w-4 h-4" />, tint: 'from-sky-500 to-blue-600' },
  { id: 'fuel', label: 'Fuel', icon: <Fuel className="w-4 h-4" />, tint: 'from-lime-500 to-green-600' },
  { id: 'snags', label: 'Snags', icon: <TriangleAlert className="w-4 h-4" />, tint: 'from-rose-500 to-red-600' },
  { id: 'ratings', label: 'Ratings', icon: <Star className="w-4 h-4" />, tint: 'from-fuchsia-500 to-pink-600' },
]

type Rec = { id: string } & Record<string, string>

function useLocalRows(key: string) {
  return useLocalCollection<Rec>(`warehouse:modules:${key}`, [])
}

const CONTRACT_STATUS = ['Draft', 'Active', 'On Hold', 'Completed', 'Terminated']
const SNag_STATUS = ['Open', 'In Progress', 'Resolved']

function starLabel(n: number): string {
  return '★'.repeat(Math.max(0, Math.min(5, n))) + '☆'.repeat(Math.max(0, 5 - n))
}

/* ---------------- Contracts ---------------- */
function Contracts() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('contracts')
  const [f, setF] = useState({ vendor: '', title: '', amount: '', startDate: '', endDate: '', terms: '', escalationClause: '', status: 'Active' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ vendor: '', title: '', amount: '', startDate: '', endDate: '', terms: '', escalationClause: '', status: 'Active' })

  const save = () => {
    if (!f.title || !f.amount) { toast({ title: 'Title and amount are required', variant: 'error' }); return }
    const payload: Rec = {
      id: editId ?? genId(), vendor: f.vendor, title: f.title, amount: f.amount,
      startDate: f.startDate || new Date().toISOString().slice(0, 10), endDate: f.endDate || new Date().toISOString().slice(0, 10),
      terms: f.terms, escalationClause: f.escalationClause, status: f.status,
    }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Contract updated' : 'Contract saved' })
  }

  const filtered = items.filter(c => !q || (c.title + ' ' + c.vendor + ' ' + c.status).toLowerCase().includes(q.toLowerCase()))
  const active = items.filter(c => c.status === 'Active').length
  const total = items.reduce((s, c) => s + Number(c.amount || 0), 0)
  const statusTone = (s: string): 'success' | 'warning' | 'outline' | 'danger' =>
    s === 'Active' ? 'success' : s === 'On Hold' ? 'warning' : s === 'Terminated' ? 'danger' : 'outline'

  return (
    <>
      <StatStrip items={[
        { icon: <FileText className="w-5 h-5" />, label: 'Total contracts', value: String(items.length), tone: 'from-indigo-500 to-violet-600' },
        { icon: <Check className="w-5 h-5" />, label: 'Active', value: String(active), tone: 'from-emerald-500 to-teal-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Contract value', value: `₹${money(total)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Avg contract', value: items.length ? `₹${money(Math.round(total / items.length))}` : '—', tone: 'from-sky-500 to-blue-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('contracts.csv', ['Vendor', 'Title', 'Amount', 'Start', 'End', 'Status'], filtered.map(c => [c.vendor, c.title, Number(c.amount || 0), c.startDate, c.endDate, c.status]))} />
      <CrudLayout
        title={editId ? 'Edit contract' : 'New contract'}
        subtitle="Supplier agreements with escalation clauses."
        tint="from-indigo-500 to-violet-600"
        form={<>
          <FormField label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Cement supply agreement" /></FormField>
          <FormField label="Supplier / Vendor"><Input value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} placeholder="Vendor name" /></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Amount (₹)"><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" /></FormField>
            <FormField label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{CONTRACT_STATUS.map((s) => <option key={s}>{s}</option>)}</Select></FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Start"><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></FormField>
            <FormField label="End"><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></FormField>
          </div>
          <FormField label="Escalation clause"><Textarea rows={2} value={f.escalationClause} onChange={(e) => setF({ ...f, escalationClause: e.target.value })} placeholder="e.g. Rates revise +5% after 12 months" /></FormField>
          <FormField label="Terms"><Textarea rows={2} value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} /></FormField>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No contracts yet" description="Create your first supplier contract to get started." />}
        {filtered.map((c) => (
          <RowItem key={c.id} tint="from-indigo-500 to-violet-600" icon={<FileText className="w-5 h-5" />}
            title={c.title}
            badges={<Badge variant={statusTone(c.status)} size="sm">{c.status}</Badge>}
            meta={<><span className="font-medium">{c.vendor}</span> · ₹{money(Number(c.amount || 0))} · {c.escalationClause || 'no escalation clause'}</>}
            right={<>
              <DatePill label="Start" date={c.startDate} />
              <EditDel
                onEdit={() => { setEditId(c.id); setF({ vendor: c.vendor, title: c.title, amount: c.amount, startDate: c.startDate, endDate: c.endDate, terms: c.terms, escalationClause: c.escalationClause, status: c.status }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDel={() => { remove(c.id); toast({ title: 'Contract deleted', variant: 'error' }) }}
              />
            </>} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Milestones ---------------- */
function Milestones() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('milestones')
  const [f, setF] = useState({ title: '', amount: '', dueDate: '', status: 'Pending', contract: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ title: '', amount: '', dueDate: '', status: 'Pending', contract: '' })

  const save = () => {
    if (!f.title || !f.amount) { toast({ title: 'Title and amount are required', variant: 'error' }); return }
    const payload: Rec = { id: editId ?? genId(), title: f.title, amount: f.amount, dueDate: f.dueDate || new Date().toISOString().slice(0, 10), status: f.status, contract: f.contract }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Milestone updated' : 'Milestone saved' })
  }

  const filtered = items.filter(m => !q || (m.title + ' ' + m.status + ' ' + m.contract).toLowerCase().includes(q.toLowerCase()))
  const total = items.reduce((s, m) => s + Number(m.amount || 0), 0)
  const paid = items.filter(m => m.status === 'Paid').reduce((s, m) => s + Number(m.amount || 0), 0)

  return (
    <>
      <StatStrip items={[
        { icon: <Flag className="w-5 h-5" />, label: 'Milestones', value: String(items.length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Total value', value: `₹${money(total)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <Check className="w-5 h-5" />, label: 'Paid', value: `₹${money(paid)}`, tone: 'from-lime-500 to-green-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Outstanding', value: `₹${money(total - paid)}`, tone: 'from-rose-500 to-red-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('milestones.csv', ['Title', 'Amount', 'Due', 'Status', 'Contract'], filtered.map(m => [m.title, Number(m.amount || 0), m.dueDate, m.status, m.contract]))} />
      <CrudLayout
        title={editId ? 'Edit milestone' : 'New milestone'}
        subtitle="Payment milestones tied to supplier contracts."
        tint="from-emerald-500 to-teal-600"
        form={<>
          <FormField label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. 50% on delivery" /></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Amount (₹)"><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" /></FormField>
            <FormField label="Due date"><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{['Pending', 'Paid', 'Overdue'].map((s) => <option key={s}>{s}</option>)}</Select></FormField>
            <FormField label="Contract"><Input value={f.contract} onChange={(e) => setF({ ...f, contract: e.target.value })} placeholder="e.g. Cement supply" /></FormField>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No milestones yet" description="Break contracts into payable milestones." />}
        {filtered.map((m) => (
          <RowItem key={m.id} tint="from-emerald-500 to-teal-600" icon={<Flag className="w-5 h-5" />}
            title={m.title}
            badges={<Badge variant={m.status === 'Paid' ? 'success' : m.status === 'Overdue' ? 'danger' : 'outline'} size="sm">{m.status}</Badge>}
            meta={`₹${money(Number(m.amount || 0))} · ${m.contract || 'no contract'}`}
            right={<>
              <DatePill label="Due" date={m.dueDate} />
              <EditDel
                onEdit={() => { setEditId(m.id); setF({ title: m.title, amount: m.amount, dueDate: m.dueDate, status: m.status, contract: m.contract }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDel={() => { remove(m.id); toast({ title: 'Milestone deleted', variant: 'error' }) }}
              />
            </>} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Price Book ---------------- */
function Vendors() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('vendors')
  const [f, setF] = useState({ vendor: '', item: '', price: '', uom: '', validUntil: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ vendor: '', item: '', price: '', uom: '', validUntil: '' })

  const save = () => {
    if (!f.vendor || !f.item || !f.price) { toast({ title: 'Vendor, item and price are required', variant: 'error' }); return }
    const payload: Rec = { id: editId ?? genId(), vendor: f.vendor, item: f.item, price: f.price, uom: f.uom, validUntil: f.validUntil }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Price updated' : 'Price saved' })
  }

  const filtered = items.filter(v => !q || (v.vendor + ' ' + v.item).toLowerCase().includes(q.toLowerCase()))
  const totalVendors = new Set(items.map(v => v.vendor)).size
  const totalPrices = items.length

  return (
    <>
      <StatStrip items={[
        { icon: <Tag className="w-5 h-5" />, label: 'Price entries', value: String(totalPrices), tone: 'from-amber-500 to-orange-600' },
        { icon: <Building2 className="w-5 h-5" />, label: 'Vendors', value: String(totalVendors), tone: 'from-sky-500 to-blue-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg unit price', value: totalPrices ? `₹${money(Math.round(items.reduce((s, v) => s + Number(v.price || 0), 0) / totalPrices))}` : '—', tone: 'from-emerald-500 to-teal-600' },
        { icon: <Download className="w-5 h-5" />, label: 'Export ready', value: 'CSV', tone: 'from-violet-500 to-purple-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('price-book.csv', ['Vendor', 'Item', 'Price', 'UOM', 'Valid until'], filtered.map(v => [v.vendor, v.item, Number(v.price || 0), v.uom, v.validUntil]))} />
      <CrudLayout
        title={editId ? 'Edit price' : 'Add price'}
        subtitle="Vendor price book — compare suppliers at a glance."
        tint="from-amber-500 to-orange-600"
        form={<>
          <FormField label="Vendor *"><Input value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} placeholder="Vendor name" /></FormField>
          <FormField label="Item *"><Input value={f.item} onChange={(e) => setF({ ...f, item: e.target.value })} placeholder="e.g. Cement Bag 50kg" /></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Price (₹) *"><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="0" /></FormField>
            <FormField label="UOM"><Input value={f.uom} onChange={(e) => setF({ ...f, uom: e.target.value })} placeholder="bag / pcs / coil" /></FormField>
          </div>
          <FormField label="Valid until"><Input type="date" value={f.validUntil} onChange={(e) => setF({ ...f, validUntil: e.target.value })} /></FormField>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No price entries yet" description="Add vendor prices to build your price book." />}
        {filtered.map((v) => (
          <RowItem key={v.id} tint="from-amber-500 to-orange-600" icon={<Tag className="w-5 h-5" />}
            title={v.item}
            badges={<Badge variant="outline" size="sm">₹{money(Number(v.price || 0))}/{v.uom || 'unit'}</Badge>}
            meta={v.vendor}
            right={<>
              {v.validUntil && <DatePill label="Valid until" date={v.validUntil} />}
              <EditDel
                onEdit={() => { setEditId(v.id); setF({ vendor: v.vendor, item: v.item, price: v.price, uom: v.uom, validUntil: v.validUntil }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDel={() => { remove(v.id); toast({ title: 'Price deleted', variant: 'error' }) }}
              />
            </>} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Equipment ---------------- */
function Equipment() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('equipment')
  const [f, setF] = useState({ name: '', type: '', make: '', status: 'Operational', lastService: '', nextService: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ name: '', type: '', make: '', status: 'Operational', lastService: '', nextService: '' })

  const save = () => {
    if (!f.name) { toast({ title: 'Equipment name is required', variant: 'error' }); return }
    const payload: Rec = { id: editId ?? genId(), name: f.name, type: f.type, make: f.make, status: f.status, lastService: f.lastService, nextService: f.nextService }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Equipment updated' : 'Equipment saved' })
  }

  const filtered = items.filter(e => !q || (e.name + ' ' + e.type + ' ' + e.status).toLowerCase().includes(q.toLowerCase()))
  const operational = items.filter(e => e.status === 'Operational').length

  return (
    <>
      <StatStrip items={[
        { icon: <Cog className="w-5 h-5" />, label: 'Equipment', value: String(items.length), tone: 'from-sky-500 to-blue-600' },
        { icon: <Check className="w-5 h-5" />, label: 'Operational', value: String(operational), tone: 'from-emerald-500 to-teal-600' },
        { icon: <Wrench className="w-5 h-5" />, label: 'In maintenance', value: String(items.filter(e => e.status === 'Maintenance').length), tone: 'from-amber-500 to-orange-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Downtime risk', value: String(items.filter(e => e.status === 'Breakdown').length), tone: 'from-rose-500 to-red-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('equipment.csv', ['Name', 'Type', 'Make', 'Status', 'Last service', 'Next service'], filtered.map(e => [e.name, e.type, e.make, e.status, e.lastService, e.nextService]))} />
      <CrudLayout
        title={editId ? 'Edit equipment' : 'Add equipment'}
        subtitle="Warehouse machinery & vehicles with service schedules."
        tint="from-sky-500 to-blue-600"
        form={<>
          <FormField label="Name *"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Forklift FL-02" /></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Type"><Input value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder="Forklift / Pallet jack / Truck" /></FormField>
            <FormField label="Make"><Input value={f.make} onChange={(e) => setF({ ...f, make: e.target.value })} placeholder="Brand" /></FormField>
          </div>
          <FormField label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{['Operational', 'Maintenance', 'Breakdown', 'Retired'].map((s) => <option key={s}>{s}</option>)}</Select></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Last service"><Input type="date" value={f.lastService} onChange={(e) => setF({ ...f, lastService: e.target.value })} /></FormField>
            <FormField label="Next service"><Input type="date" value={f.nextService} onChange={(e) => setF({ ...f, nextService: e.target.value })} /></FormField>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No equipment yet" description="Track machinery, vehicles & service schedules." />}
        {filtered.map((e) => (
          <RowItem key={e.id} tint="from-sky-500 to-blue-600" icon={<Cog className="w-5 h-5" />}
            title={e.name}
            badges={<Badge variant={e.status === 'Operational' ? 'success' : e.status === 'Maintenance' ? 'warning' : e.status === 'Breakdown' ? 'danger' : 'outline'} size="sm">{e.status}</Badge>}
            meta={`${e.type || 'Equipment'} · ${e.make || '—'}`}
            right={<>
              {e.nextService && <DatePill label="Next service" date={e.nextService} />}
              <EditDel
                onEdit={() => { setEditId(e.id); setF({ name: e.name, type: e.type, make: e.make, status: e.status, lastService: e.lastService, nextService: e.nextService }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDel={() => { remove(e.id); toast({ title: 'Equipment deleted', variant: 'error' }) }}
              />
            </>} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Fuel ---------------- */
function FuelLogs() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('fuel')
  const [f, setF] = useState({ vehicle: '', date: '', litres: '', rate: '', total: '', odo: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ vehicle: '', date: '', litres: '', rate: '', total: '', odo: '' })

  const save = () => {
    if (!f.vehicle || !f.litres) { toast({ title: 'Vehicle and litres are required', variant: 'error' }); return }
    const payload: Rec = { id: editId ?? genId(), vehicle: f.vehicle, date: f.date || new Date().toISOString().slice(0, 10), litres: f.litres, rate: f.rate, total: f.total, odo: f.odo }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Fuel entry updated' : 'Fuel entry saved' })
  }

  const filtered = items.filter(e => !q || e.vehicle.toLowerCase().includes(q.toLowerCase()))
  const totalLitres = items.reduce((s, e) => s + Number(e.litres || 0), 0)
  const totalCost = items.reduce((s, e) => s + Number(e.total || 0) || (Number(e.litres || 0) * Number(e.rate || 0)), 0)

  return (
    <>
      <StatStrip items={[
        { icon: <Fuel className="w-5 h-5" />, label: 'Entries', value: String(items.length), tone: 'from-lime-500 to-green-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Litres logged', value: `${totalLitres.toFixed(1)} L`, tone: 'from-cyan-500 to-teal-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Fuel spend', value: `₹${money(totalCost)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg price', value: totalLitres ? `₹${(totalCost / totalLitres).toFixed(1)}/L` : '—', tone: 'from-violet-500 to-purple-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('fuel.csv', ['Vehicle', 'Date', 'Litres', 'Rate', 'Total', 'Odometer'], filtered.map(e => [e.vehicle, e.date, Number(e.litres || 0), Number(e.rate || 0), Number(e.total || 0), e.odo]))} />
      <CrudLayout
        title={editId ? 'Edit fuel entry' : 'Log fuel'}
        subtitle="Vehicle fuel purchases & odometer readings."
        tint="from-lime-500 to-green-600"
        form={<>
          <FormField label="Vehicle *"><Input value={f.vehicle} onChange={(e) => setF({ ...f, vehicle: e.target.value })} placeholder="e.g. Truck HR-55-1234" /></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></FormField>
            <FormField label="Litres *"><Input type="number" value={f.litres} onChange={(e) => setF({ ...f, litres: e.target.value })} placeholder="0" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Rate (₹/L)"><Input type="number" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} placeholder="0" /></FormField>
            <FormField label="Total (₹)"><Input type="number" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} placeholder="auto from litres × rate" /></FormField>
          </div>
          <FormField label="Odometer (km)"><Input type="number" value={f.odo} onChange={(e) => setF({ ...f, odo: e.target.value })} placeholder="0" /></FormField>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No fuel logged yet" description="Record vehicle fuel purchases to track spend." />}
        {filtered.map((e) => (
          <RowItem key={e.id} tint="from-lime-500 to-green-600" icon={<Fuel className="w-5 h-5" />}
            title={e.vehicle}
            badges={<Badge variant="outline" size="sm">{Number(e.litres || 0)} L</Badge>}
            meta={`₹${money(Number(e.total || 0) || (Number(e.litres || 0) * Number(e.rate || 0)))}${e.odo ? ` · ${e.odo} km` : ''}`}
            right={<>
              <DatePill label="Date" date={e.date} />
              <EditDel
                onEdit={() => { setEditId(e.id); setF({ vehicle: e.vehicle, date: e.date, litres: e.litres, rate: e.rate, total: e.total, odo: e.odo }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDel={() => { remove(e.id); toast({ title: 'Fuel entry deleted', variant: 'error' }) }}
              />
            </>} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Snags ---------------- */
function Snags() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('snags')
  const [f, setF] = useState({ title: '', location: '', severity: 'Low', status: 'Open', assignee: '', note: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ title: '', location: '', severity: 'Low', status: 'Open', assignee: '', note: '' })

  const save = () => {
    if (!f.title) { toast({ title: 'Snag title is required', variant: 'error' }); return }
    const payload: Rec = { id: editId ?? genId(), title: f.title, location: f.location, severity: f.severity, status: f.status, assignee: f.assignee, note: f.note }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Snag updated' : 'Snag logged' })
  }

  const filtered = items.filter(s => !q || (s.title + ' ' + s.location + ' ' + s.status).toLowerCase().includes(q.toLowerCase()))
  const open = items.filter(s => s.status === 'Open').length

  return (
    <>
      <StatStrip items={[
        { icon: <TriangleAlert className="w-5 h-5" />, label: 'Total snags', value: String(items.length), tone: 'from-rose-500 to-red-600' },
        { icon: <Check className="w-5 h-5" />, label: 'Open', value: String(open), tone: 'from-amber-500 to-orange-600' },
        { icon: <Check className="w-5 h-5" />, label: 'Resolved', value: String(items.filter(s => s.status === 'Resolved').length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'High severity', value: String(items.filter(s => s.severity === 'High').length), tone: 'from-rose-500 to-red-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('snags.csv', ['Title', 'Location', 'Severity', 'Status', 'Assignee'], filtered.map(s => [s.title, s.location, s.severity, s.status, s.assignee]))} />
      <CrudLayout
        title={editId ? 'Edit snag' : 'Log snag'}
        subtitle="Quality issues found at the warehouse or on received goods."
        tint="from-rose-500 to-red-600"
        form={<>
          <FormField label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Damaged pallet in Bay 3" /></FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Location"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="e.g. A01-01" /></FormField>
            <FormField label="Severity"><Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>{['Low', 'Medium', 'High', 'Critical'].map((s) => <option key={s}>{s}</option>)}</Select></FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Status"><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{SNag_STATUS.map((s) => <option key={s}>{s}</option>)}</Select></FormField>
            <FormField label="Assignee"><Input value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} placeholder="Who fixes this?" /></FormField>
          </div>
          <FormField label="Note"><Textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></FormField>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No snags logged" description="Log quality issues to keep the warehouse audit-ready." />}
        {filtered.map((s) => (
          <RowItem key={s.id} tint="from-rose-500 to-red-600" icon={<TriangleAlert className="w-5 h-5" />}
            title={s.title}
            badges={<>
              <Badge variant={s.status === 'Resolved' ? 'success' : s.status === 'In Progress' ? 'info' : 'warning'} size="sm">{s.status}</Badge>
              <Badge variant={s.severity === 'Critical' || s.severity === 'High' ? 'danger' : 'outline'} size="sm">{s.severity}</Badge>
            </>}
            meta={`${s.location || '—'} · ${s.assignee || 'unassigned'}${s.note ? ` · ${s.note}` : ''}`}
            right={<EditDel
              onEdit={() => { setEditId(s.id); setF({ title: s.title, location: s.location, severity: s.severity, status: s.status, assignee: s.assignee, note: s.note }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              onDel={() => { remove(s.id); toast({ title: 'Snag deleted', variant: 'error' }) }}
            />} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Ratings ---------------- */
function Ratings() {
  const { toast } = useToast()
  const { items, add, update, remove } = useLocalRows('ratings')
  const [f, setF] = useState({ vendor: '', rating: '3', review: '', date: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const clear = () => setF({ vendor: '', rating: '3', review: '', date: '' })

  const save = () => {
    if (!f.vendor) { toast({ title: 'Vendor name is required', variant: 'error' }); return }
    const payload: Rec = { id: editId ?? genId(), vendor: f.vendor, rating: f.rating, review: f.review, date: f.date || new Date().toISOString().slice(0, 10) }
    if (editId) update(editId, payload)
    else add(payload)
    setEditId(null); clear()
    toast({ title: editId ? 'Rating updated' : 'Rating saved' })
  }

  const filtered = items.filter(r => !q || r.vendor.toLowerCase().includes(q.toLowerCase()))
  const avg = items.length ? items.reduce((s, r) => s + Number(r.rating || 0), 0) / items.length : 0

  return (
    <>
      <StatStrip items={[
        { icon: <Star className="w-5 h-5" />, label: 'Rated vendors', value: String(new Set(items.map(r => r.vendor)).size), tone: 'from-fuchsia-500 to-pink-600' },
        { icon: <Star className="w-5 h-5" />, label: 'Avg rating', value: items.length ? `${avg.toFixed(1)} ★` : '—', tone: 'from-amber-500 to-orange-600' },
        { icon: <Scale className="w-5 h-5" />, label: 'Reviews', value: String(items.length), tone: 'from-violet-500 to-purple-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: '5-star vendors', value: String(items.filter(r => Number(r.rating) >= 5).length), tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <CrudToolbar value={q} onChange={setQ} onCsv={() => toCsv('ratings.csv', ['Vendor', 'Rating', 'Review', 'Date'], filtered.map(r => [r.vendor, Number(r.rating || 0), r.review, r.date]))} />
      <CrudLayout
        title={editId ? 'Edit rating' : 'Rate a vendor'}
        subtitle="Contractor & supplier ratings — build a trusted vendor list."
        tint="from-fuchsia-500 to-pink-600"
        form={<>
          <FormField label="Vendor *"><Input value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} placeholder="Vendor name" /></FormField>
          <FormField label="Rating"><Select value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })}>{['1', '2', '3', '4', '5'].map((s) => <option key={s} value={s}>{starLabel(Number(s))}</option>)}</Select></FormField>
          <FormField label="Review"><Textarea rows={2} value={f.review} onChange={(e) => setF({ ...f, review: e.target.value })} placeholder="Delivery time, quality, pricing…" /></FormField>
          <FormField label="Date"><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></FormField>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No ratings yet" description="Rate suppliers & contractors to build a trusted list." />}
        {filtered.map((r) => (
          <RowItem key={r.id} tint="from-fuchsia-500 to-pink-600" icon={<Star className="w-5 h-5" />}
            title={r.vendor}
            badges={<Badge variant="outline" size="sm">{starLabel(Number(r.rating || 0))}</Badge>}
            meta={r.review || 'No review'}
            right={<>
              <DatePill label="Date" date={r.date} />
              <EditDel
                onEdit={() => { setEditId(r.id); setF({ vendor: r.vendor, rating: r.rating, review: r.review, date: r.date }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDel={() => { remove(r.id); toast({ title: 'Rating deleted', variant: 'error' }) }}
              />
            </>} />
        ))}
      </CrudLayout>
    </>
  )
}

/* ---------------- Page ---------------- */
export default function WarehouseModules() {
  const { isAdvanced } = useViewMode()
  const [tab, setTab] = useState<TabId>('contracts')
  const contractRows = useLocalCollection<Rec>('warehouse:modules:contracts', [])
  const milestoneRows = useLocalCollection<Rec>('warehouse:modules:milestones', [])
  const vendorRows = useLocalCollection<Rec>('warehouse:modules:vendors', [])
  const equipmentRows = useLocalCollection<Rec>('warehouse:modules:equipment', [])
  const fuelRows = useLocalCollection<Rec>('warehouse:modules:fuel', [])
  const snagRows = useLocalCollection<Rec>('warehouse:modules:snags', [])
  const ratingRows = useLocalCollection<Rec>('warehouse:modules:ratings', [])

  const counts = useMemo(() => ({
    contracts: contractRows.items.length,
    milestones: milestoneRows.items.length,
    vendors: vendorRows.items.length,
    equipment: equipmentRows.items.length,
    fuel: fuelRows.items.length,
    snags: snagRows.items.filter((s) => s.status !== 'Resolved').length,
    ratings: ratingRows.items.length,
  }), [contractRows.items, milestoneRows.items, vendorRows.items, equipmentRows.items, fuelRows.items, snagRows.items, ratingRows.items])

  const contractValue = contractRows.items.reduce((s, c) => s + Number(c.amount || 0), 0)
  const fuelSpend = fuelRows.items.reduce((s, e) => s + Number(e.total || 0) || (Number(e.litres || 0) * Number(e.rate || 0)), 0)
  const openSnags = counts.snags

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Business Modules</h1>
          <div className="muted">Contracts, milestones, price book, equipment, fuel, snags & vendor ratings</div>
        </div>
      </div>

      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Business module health — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Contract value', value: `₹${money(contractValue)}`, delta: `${counts.contracts} contract(s)`, deltaTone: 'flat' },
            { label: 'Fuel spend', value: `₹${money(fuelSpend)}`, delta: `${counts.fuel} entry(ies)`, deltaTone: 'flat' },
            { label: 'Open snags', value: String(openSnags), delta: openSnags ? 'action needed' : 'all clear', deltaTone: openSnags ? 'down' : 'up' },
            { label: 'Rated vendors', value: String(counts.ratings), delta: 'in price book', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Records per module</p>
              <BarChart
                data={[
                  { label: 'Contracts', value: counts.contracts },
                  { label: 'Milestones', value: counts.milestones },
                  { label: 'Price Book', value: counts.vendors },
                  { label: 'Equipment', value: counts.equipment },
                  { label: 'Fuel', value: counts.fuel },
                  { label: 'Snags', value: counts.snags },
                  { label: 'Ratings', value: counts.ratings },
                ]}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Module mix</p>
              <DonutChart
                data={[
                  { label: 'Contracts', value: counts.contracts, color: '#6366f1' },
                  { label: 'Milestones', value: counts.milestones, color: '#10b981' },
                  { label: 'Price Book', value: counts.vendors, color: '#f59e0b' },
                  { label: 'Equipment', value: counts.equipment, color: '#0ea5e9' },
                  { label: 'Fuel', value: counts.fuel, color: '#84cc16' },
                  { label: 'Snags', value: counts.snags, color: '#f43f5e' },
                  { label: 'Ratings', value: counts.ratings, color: '#d946ef' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      <Card>
        <CardContent className="p-0">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <TabsList className="w-full justify-start border-b border-border rounded-none px-2">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                  {t.icon} {t.label}
                  <span className="ml-0.5 text-[10px] text-text/40">{counts[t.id] ?? 0}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="contracts"><div className="p-4"><Contracts /></div></TabsContent>
            <TabsContent value="milestones"><div className="p-4"><Milestones /></div></TabsContent>
            <TabsContent value="vendors"><div className="p-4"><Vendors /></div></TabsContent>
            <TabsContent value="equipment"><div className="p-4"><Equipment /></div></TabsContent>
            <TabsContent value="fuel"><div className="p-4"><FuelLogs /></div></TabsContent>
            <TabsContent value="snags"><div className="p-4"><Snags /></div></TabsContent>
            <TabsContent value="ratings"><div className="p-4"><Ratings /></div></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
