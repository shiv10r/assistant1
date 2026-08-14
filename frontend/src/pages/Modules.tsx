import { useEffect, useState } from 'react'
import { api } from '../api'
import type { SiteContract, ContractMilestone, VendorPrice, EquipmentLog, FuelLog, Snag, ContractorRating } from '../api'
import { Card, CardContent, Button, Badge, Empty, Tabs, TabsList, TabsTrigger, TabsContent, Input, Label, Select, Textarea } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import {
  FileText, Flag, Tag, Cog, Fuel, TriangleAlert, Star, Plus, Trash2, Download, CircleCheck, Circle, RefreshCw,
  CalendarDays, Building2, TrendingUp, Wallet, Users, Package, ClipboardList, Banknote, Gauge, Phone, Wrench,
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

function money(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function useRows<T>(loader: () => Promise<T[]>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); loader().then(setRows).catch(() => setRows([])).finally(() => setLoading(false)) }
  useEffect(() => { load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [])
  return { rows, setRows, load, loading }
}

/* ---------- shared primitives ---------- */

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center text-white shadow-lg shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-text/50 truncate">{label}</div>
          <div className="text-lg font-bold leading-tight truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatStrip({ items }: { items: { icon: React.ReactNode; label: string; value: string; tone: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {items.map((s, i) => <Stat key={i} {...s} />)}
    </div>
  )
}

function Layout({ title, subtitle, tint, form, children, actions }: {
  title: string; subtitle: string; tint: string; form: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-1">
        <Card className="h-fit sticky top-20">
          <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${tint}`} />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center text-white shadow`}>
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-[15px]">{title}</h3>
            </div>
            <p className="text-xs text-text/50 mb-4">{subtitle}</p>
            <div className="space-y-3">{form}</div>
          </CardContent>
        </Card>
        {actions && <div className="mt-3">{actions}</div>}
      </div>
      <div className="xl:col-span-2 space-y-2.5">{children}</div>
    </div>
  )
}

function RowItem({ tint, icon, title, meta, badges, right }: {
  tint: string; icon: React.ReactNode; title: React.ReactNode; meta: React.ReactNode; badges?: React.ReactNode; right?: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tint} flex items-center justify-center text-white shadow-lg shrink-0`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{title}</p>
            {badges}
          </div>
          <p className="text-xs text-text/50 truncate">{meta}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
      </CardContent>
    </Card>
  )
}

function DatePill({ label, date }: { label: string; date: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface2 border border-border text-text/70">
      <CalendarDays className="w-3 h-3" /> {label} {date.slice(0, 10)}
    </span>
  )
}

/* ---------------- Contracts ---------------- */

function Contracts() {
  const { rows, setRows } = useRows<SiteContract>(() => api.modules.contracts())
  const { toast } = useToast()
  const [f, setF] = useState({ projectId: '', partyName: '', title: '', amount: '', startDate: '', endDate: '', terms: '', escalationClause: '', status: 'Active' })

  const save = async () => {
    if (!f.title || !f.amount) return toast({ title: 'Title and amount are required' })
    try {
      const saved = await api.modules.saveContract({
        projectId: Number(f.projectId) || 0, partyName: f.partyName, title: f.title, amount: Number(f.amount),
        startDate: f.startDate || new Date().toISOString().slice(0, 10), endDate: f.endDate || new Date().toISOString().slice(0, 10),
        terms: f.terms, escalationClause: f.escalationClause, status: f.status,
      })
      setRows(prev => [saved, ...prev])
      setF({ projectId: '', partyName: '', title: '', amount: '', startDate: '', endDate: '', terms: '', escalationClause: '', status: 'Active' })
      toast({ title: 'Contract saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const active = rows.filter(c => c.status === 'Active')
  const total = rows.reduce((s, c) => s + c.amount, 0)

  return (
    <>
      <StatStrip items={[
        { icon: <FileText className="w-5 h-5" />, label: 'Total contracts', value: String(rows.length), tone: 'from-indigo-500 to-violet-600' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Active', value: String(active.length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Contract value', value: `₹${money(total)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <Building2 className="w-5 h-5" />, label: 'Clients', value: String(new Set(rows.map(c => c.partyName).filter(Boolean)).size), tone: 'from-sky-500 to-blue-600' },
      ]} />
      <Layout
        title="New contract"
        subtitle="Agreements with escalation clauses, printable as PDF."
        tint="from-indigo-500 to-violet-600"
        form={<>
          <div><Label>Title *</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Phase-2 structure works" /></div>
          <div><Label>Client / Party</Label><Input value={f.partyName} onChange={(e) => setF({ ...f, partyName: e.target.value })} placeholder="Client name" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} placeholder="0" /></div>
            <div><Label>Amount (₹)</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Start</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
            <div><Label>End</Label><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
          </div>
          <div><Label>Escalation clause</Label><Textarea rows={2} value={f.escalationClause} onChange={(e) => setF({ ...f, escalationClause: e.target.value })} placeholder="e.g. Rates revise +5% after 12 months" /></div>
          <div><Label>Terms</Label><Textarea rows={2} value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Save contract</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No contracts yet" description="Create your first contract to get started." />}
        {rows.map((c) => (
          <RowItem key={c.id} tint="from-indigo-500 to-violet-600" icon={<FileText className="w-5 h-5" />}
            title={c.title}
            badges={<Badge variant={c.status === 'Active' ? 'success' : 'outline'}>{c.status}</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              {c.partyName && <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> {c.partyName}</span>}
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">₹{money(c.amount)}</span>
              <DatePill label="Start" date={c.startDate} />
              <DatePill label="End" date={c.endDate} />
            </span>}
            right={<>
              <Button variant="ghost" size="sm" title="Download PDF" onClick={() => api.download(`/api/modules/contracts/${c.id}/pdf`).catch((e) => toast({ title: String(e), variant: 'error' }))}><Download className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteContract(c.id).then(() => { setRows(prev => prev.filter(x => x.id !== c.id)) }).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- Milestones ---------------- */

function Milestones() {
  const { rows, setRows } = useRows<ContractMilestone>(() => api.modules.milestones())
  const { toast } = useToast()
  const [f, setF] = useState({ projectId: '', contractId: '', title: '', amount: '', percentage: '', dueDate: '' })
  const save = async () => {
    if (!f.title) return toast({ title: 'Title is required' })
    try {
      const saved = await api.modules.saveMilestone({
        projectId: Number(f.projectId) || 0, contractId: Number(f.contractId) || 0, title: f.title,
        amount: Number(f.amount) || 0, percentage: Number(f.percentage) || 0, dueDate: f.dueDate || new Date().toISOString().slice(0, 10),
      })
      setRows(prev => [saved, ...prev])
      setF({ projectId: '', contractId: '', title: '', amount: '', percentage: '', dueDate: '' })
      toast({ title: 'Milestone added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const paid = rows.filter(m => m.isPaid).reduce((s, m) => s + m.amount, 0)
  const billed = rows.reduce((s, m) => s + m.amount, 0)

  return (
    <>
      <StatStrip items={[
        { icon: <Flag className="w-5 h-5" />, label: 'Milestones', value: String(rows.length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <CircleCheck className="w-5 h-5" />, label: 'Paid', value: String(rows.filter(m => m.isPaid).length), tone: 'from-lime-500 to-green-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Billed', value: `₹${money(billed)}`, tone: 'from-sky-500 to-blue-600' },
        { icon: <Banknote className="w-5 h-5" />, label: 'Paid amount', value: `₹${money(paid)}`, tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <Layout
        title="New milestone"
        subtitle="% of work vs billed, trackable as paid."
        tint="from-emerald-500 to-teal-600"
        form={<>
          <div><Label>Title *</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Foundation complete" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} /></div>
            <div><Label>Contract ID</Label><Input type="number" value={f.contractId} onChange={(e) => setF({ ...f, contractId: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Amount (₹)</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
            <div><Label>% of contract</Label><Input type="number" value={f.percentage} onChange={(e) => setF({ ...f, percentage: e.target.value })} /></div>
          </div>
          <div><Label>Due date</Label><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Add milestone</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No milestones yet" description="Break a contract into billable milestones." />}
        {rows.map((m) => (
          <RowItem key={m.id} tint="from-emerald-500 to-teal-600" icon={<Flag className="w-5 h-5" />}
            title={m.title}
            badges={m.isPaid ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Billed</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">₹{money(m.amount)}</span>
              <span className="inline-flex items-center gap-1"><Gauge className="w-3 h-3" /> {m.percentage}%</span>
              {m.contractId > 0 && <Badge variant="outline">Contract #{m.contractId}</Badge>}
              <DatePill label="Due" date={m.dueDate} />
            </span>}
            right={<>
              <Button variant="ghost" size="sm" title={m.isPaid ? 'Mark billed' : 'Mark paid'} onClick={() => api.modules.markMilestonePaid(m.id).then((u) => setRows(prev => prev.map(x => x.id === u.id ? u : x))).catch((e) => toast({ title: String(e), variant: 'error' }))}>
                {m.isPaid ? <CircleCheck className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteMilestone(m.id).then(() => setRows(prev => prev.filter(x => x.id !== m.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- Vendor price book ---------------- */

function Vendors() {
  const { rows, setRows } = useRows<VendorPrice>(() => api.modules.vendorPrices())
  const { toast } = useToast()
  const [f, setF] = useState({ vendor: '', item: '', price: '', unit: '', notes: '', date: '' })
  const save = async () => {
    if (!f.vendor || !f.item) return toast({ title: 'Vendor and item are required' })
    try {
      const saved = await api.modules.saveVendorPrice({ vendor: f.vendor, item: f.item, price: Number(f.price) || 0, unit: f.unit, notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) })
      setRows(prev => [saved, ...prev]); setF({ vendor: '', item: '', price: '', unit: '', notes: '', date: '' })
      toast({ title: 'Price saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const vendors = new Set(rows.map(v => v.vendor)).size
  const items = new Set(rows.map(v => v.item)).size

  return (
    <>
      <StatStrip items={[
        { icon: <Tag className="w-5 h-5" />, label: 'Price lines', value: String(rows.length), tone: 'from-amber-500 to-orange-600' },
        { icon: <Users className="w-5 h-5" />, label: 'Vendors', value: String(vendors), tone: 'from-sky-500 to-blue-600' },
        { icon: <Package className="w-5 h-5" />, label: 'Items', value: String(items), tone: 'from-violet-500 to-purple-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg price', value: rows.length ? `₹${money(rows.reduce((s, v) => s + v.price, 0) / rows.length)}` : '—', tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <Layout
        title="Add vendor price"
        subtitle="Compare supplier quotes per material."
        tint="from-amber-500 to-orange-600"
        form={<>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Vendor *</Label><Input value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} /></div>
            <div><Label>Item *</Label><Input value={f.item} onChange={(e) => setF({ ...f, item: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Price (₹)</Label><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
            <div><Label>Unit</Label><Input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} placeholder="bag/cu.m" /></div>
          </div>
          <div><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div><Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Rate valid until…" /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Save price</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No vendor prices yet" description="Log quotes to compare suppliers." />}
        {rows.map((v) => (
          <RowItem key={v.id} tint="from-amber-500 to-orange-600" icon={<Tag className="w-5 h-5" />}
            title={<span>{v.item} <span className="text-text/40 font-normal">— {v.vendor}</span></span>}
            badges={<Badge variant="info">{v.unit || 'unit'}</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-amber-600 dark:text-amber-400">₹{money(v.price)}</span>
              <DatePill label="" date={v.date} />
              {v.notes && <span className="text-text/50">· {v.notes}</span>}
            </span>}
            right={<Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteVendorPrice(v.id).then(() => setRows(prev => prev.filter(x => x.id !== v.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- Equipment ---------------- */

function Equipment() {
  const { rows, setRows } = useRows<EquipmentLog>(() => api.modules.equipment())
  const { toast } = useToast()
  const [f, setF] = useState({ projectId: '', equipment: '', purpose: '', rentalCost: '', fuelCost: '', notes: '', date: '' })
  const save = async () => {
    if (!f.equipment) return toast({ title: 'Equipment name is required' })
    try {
      const saved = await api.modules.saveEquipment({ projectId: Number(f.projectId) || 0, equipment: f.equipment, purpose: f.purpose, rentalCost: Number(f.rentalCost) || 0, fuelCost: Number(f.fuelCost) || 0, notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) })
      setRows(prev => [saved, ...prev]); setF({ projectId: '', equipment: '', purpose: '', rentalCost: '', fuelCost: '', notes: '', date: '' })
      toast({ title: 'Equipment logged' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const rental = rows.reduce((s, e) => s + e.rentalCost, 0)
  const fuel = rows.reduce((s, e) => s + e.fuelCost, 0)
  const machines = new Set(rows.map(e => e.equipment)).size

  return (
    <>
      <StatStrip items={[
        { icon: <Cog className="w-5 h-5" />, label: 'Logs', value: String(rows.length), tone: 'from-sky-500 to-blue-600' },
        { icon: <Wrench className="w-5 h-5" />, label: 'Machines', value: String(machines), tone: 'from-violet-500 to-purple-600' },
        { icon: <Banknote className="w-5 h-5" />, label: 'Rental', value: `₹${money(rental)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <Fuel className="w-5 h-5" />, label: 'Fuel', value: `₹${money(fuel)}`, tone: 'from-lime-500 to-green-600' },
      ]} />
      <Layout
        title="Log equipment"
        subtitle="Rental + fuel cost per machine."
        tint="from-sky-500 to-blue-600"
        form={<>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Equipment *</Label><Input value={f.equipment} onChange={(e) => setF({ ...f, equipment: e.target.value })} /></div>
            <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} /></div>
          </div>
          <div><Label>Purpose</Label><Input value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} placeholder="Excavation…" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Rental (₹)</Label><Input type="number" value={f.rentalCost} onChange={(e) => setF({ ...f, rentalCost: e.target.value })} /></div>
            <div><Label>Fuel (₹)</Label><Input type="number" value={f.fuelCost} onChange={(e) => setF({ ...f, fuelCost: e.target.value })} /></div>
          </div>
          <div><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div><Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Log equipment</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No equipment logged" description="Track rental + fuel cost per machine." />}
        {rows.map((e) => (
          <RowItem key={e.id} tint="from-sky-500 to-blue-600" icon={<Cog className="w-5 h-5" />}
            title={e.equipment}
            badges={<Badge variant="info">₹{money(e.rentalCost + e.fuelCost)}</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              {e.purpose && <span>{e.purpose}</span>}
              <span className="inline-flex items-center gap-1"><Banknote className="w-3 h-3" /> ₹{money(e.rentalCost)} rental</span>
              <span className="inline-flex items-center gap-1"><Fuel className="w-3 h-3" /> ₹{money(e.fuelCost)} fuel</span>
              {e.projectId > 0 && <Badge variant="outline">Project #{e.projectId}</Badge>}
              <DatePill label="" date={e.date} />
            </span>}
            right={<Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteEquipment(e.id).then(() => setRows(prev => prev.filter(x => x.id !== e.id))).catch((err) => toast({ title: String(err), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- Fuel ---------------- */

function FuelLogs() {
  const { rows, setRows } = useRows<FuelLog>(() => api.modules.fuel())
  const { toast } = useToast()
  const [f, setF] = useState({ vehicle: '', litres: '', cost: '', kms: '', notes: '', date: '' })
  const save = async () => {
    if (!f.vehicle) return toast({ title: 'Vehicle is required' })
    try {
      const saved = await api.modules.saveFuel({ vehicle: f.vehicle, litres: Number(f.litres) || 0, cost: Number(f.cost) || 0, kms: Number(f.kms) || 0, notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) })
      setRows(prev => [saved, ...prev]); setF({ vehicle: '', litres: '', cost: '', kms: '', notes: '', date: '' })
      toast({ title: 'Fuel logged' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const litres = rows.reduce((s, v) => s + v.litres, 0)
  const cost = rows.reduce((s, v) => s + v.cost, 0)

  return (
    <>
      <StatStrip items={[
        { icon: <Fuel className="w-5 h-5" />, label: 'Entries', value: String(rows.length), tone: 'from-lime-500 to-green-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Litres', value: `${litres.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L`, tone: 'from-cyan-500 to-sky-600' },
        { icon: <Banknote className="w-5 h-5" />, label: 'Fuel cost', value: `₹${money(cost)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg ₹/L', value: litres > 0 ? `₹${(cost / litres).toFixed(1)}` : '—', tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <Layout
        title="Log fuel"
        subtitle="Diesel per vehicle, litres, km, cost."
        tint="from-lime-500 to-green-600"
        form={<>
          <div><Label>Vehicle *</Label><Input value={f.vehicle} onChange={(e) => setF({ ...f, vehicle: e.target.value })} placeholder="MH-12-AB-1234" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Litres</Label><Input type="number" value={f.litres} onChange={(e) => setF({ ...f, litres: e.target.value })} /></div>
            <div><Label>Cost (₹)</Label><Input type="number" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div>
            <div><Label>KM</Label><Input type="number" value={f.kms} onChange={(e) => setF({ ...f, kms: e.target.value })} /></div>
          </div>
          <div><Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div><Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Log fuel</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No fuel entries" description="Log diesel per vehicle." />}
        {rows.map((v) => (
          <RowItem key={v.id} tint="from-lime-500 to-green-600" icon={<Fuel className="w-5 h-5" />}
            title={v.vehicle}
            badges={<Badge variant="info">{v.litres} L</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lime-600 dark:text-lime-400">₹{money(v.cost)}</span>
              <span className="inline-flex items-center gap-1"><Gauge className="w-3 h-3" /> {v.kms} km</span>
              <DatePill label="" date={v.date} />
              {v.notes && <span className="text-text/50">· {v.notes}</span>}
            </span>}
            right={<Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteFuel(v.id).then(() => setRows(prev => prev.filter(x => x.id !== v.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- Snags ---------------- */

const SEVERITY = ['Low', 'Medium', 'High']

function Snags() {
  const { rows, setRows } = useRows<Snag>(() => api.modules.snags())
  const { toast } = useToast()
  const [f, setF] = useState({ projectId: '', title: '', severity: 'Medium', assignee: '', dueDate: '', notes: '' })
  const save = async () => {
    if (!f.title) return toast({ title: 'Title is required' })
    try {
      const saved = await api.modules.saveSnag({ projectId: Number(f.projectId) || 0, title: f.title, severity: f.severity, assignee: f.assignee, dueDate: f.dueDate || new Date().toISOString().slice(0, 10), notes: f.notes })
      setRows(prev => [saved, ...prev]); setF({ projectId: '', title: '', severity: 'Medium', assignee: '', dueDate: '', notes: '' })
      toast({ title: 'Snag added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const cycle = (id: number) => api.modules.setSnagStatus(id).then((u) => setRows(prev => prev.map(x => x.id === u.id ? u : x))).catch((e) => toast({ title: String(e), variant: 'error' }))
  const sevTone = (s: string): 'default' | 'warning' | 'danger' => s === 'High' ? 'danger' : s === 'Medium' ? 'warning' : 'default'
  const statusTone = (s: string): 'default' | 'warning' | 'success' => s === 'Fixed' ? 'success' : s === 'In Progress' ? 'warning' : 'default'
  const open = rows.filter(s => s.status !== 'Fixed').length

  return (
    <>
      <StatStrip items={[
        { icon: <TriangleAlert className="w-5 h-5" />, label: 'Total', value: String(rows.length), tone: 'from-rose-500 to-red-600' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Open', value: String(open), tone: 'from-amber-500 to-orange-600' },
        { icon: <CircleCheck className="w-5 h-5" />, label: 'Fixed', value: String(rows.filter(s => s.status === 'Fixed').length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <TriangleAlert className="w-5 h-5" />, label: 'High severity', value: String(rows.filter(s => s.severity === 'High' && s.status !== 'Fixed').length), tone: 'from-red-600 to-rose-700' },
      ]} />
      <Layout
        title="New snag"
        subtitle="Punch-list items per site, cycle through status."
        tint="from-rose-500 to-red-600"
        form={<>
          <div><Label>Title *</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Crack in slab…" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Severity</Label><Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>{SEVERITY.map((s) => <option key={s}>{s}</option>)}</Select></div>
            <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Assignee</Label><Input value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} /></div>
            <div><Label>Due</Label><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
          </div>
          <div><Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Add snag</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No snags" description="Punch-list items are resolved in order." />}
        {rows.map((s) => (
          <RowItem key={s.id} tint="from-rose-500 to-red-600" icon={<TriangleAlert className="w-5 h-5" />}
            title={s.title}
            badges={<><Badge variant={sevTone(s.severity)}>{s.severity}</Badge><Badge variant={statusTone(s.status)}>{s.status}</Badge></>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              {s.assignee && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {s.assignee}</span>}
              {s.projectId > 0 && <Badge variant="outline">Project #{s.projectId}</Badge>}
              <DatePill label="Due" date={s.dueDate} />
            </span>}
            right={<>
              <Button variant="ghost" size="sm" title="Cycle status" onClick={() => cycle(s.id)}><RefreshCw className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteSnag(s.id).then(() => setRows(prev => prev.filter(x => x.id !== s.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- Ratings ---------------- */

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value / 2) ? 'fill-current' : 'opacity-30'}`} />
      ))}
    </span>
  )
}

function Ratings() {
  const { rows, setRows } = useRows<ContractorRating>(() => api.modules.ratings())
  const { toast } = useToast()
  const [f, setF] = useState({ name: '', quality: '5', punctuality: '5', cost: '5', notes: '', date: '' })
  const save = async () => {
    if (!f.name) return toast({ title: 'Contractor name is required' })
    try {
      const saved = await api.modules.saveRating({ name: f.name, quality: Number(f.quality), punctuality: Number(f.punctuality), cost: Number(f.cost), notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) })
      setRows(prev => [saved, ...prev]); setF({ name: '', quality: '5', punctuality: '5', cost: '5', notes: '', date: '' })
      toast({ title: 'Rating saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }
  const avg = rows.length ? rows.reduce((s, r) => s + r.average, 0) / rows.length : 0

  return (
    <>
      <StatStrip items={[
        { icon: <Star className="w-5 h-5" />, label: 'Contractors', value: String(rows.length), tone: 'from-fuchsia-500 to-pink-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg score', value: rows.length ? `${avg.toFixed(1)}/10` : '—', tone: 'from-emerald-500 to-teal-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Top rated', value: rows.length ? `${Math.max(...rows.map(r => r.average))}/10` : '—', tone: 'from-amber-500 to-orange-600' },
        { icon: <Users className="w-5 h-5" />, label: '≥7 score', value: String(rows.filter(r => r.average >= 7).length), tone: 'from-sky-500 to-blue-600' },
      ]} />
      <Layout
        title="Rate contractor"
        subtitle="Score quality, punctuality, cost out of 10."
        tint="from-fuchsia-500 to-pink-600"
        form={<>
          <div><Label>Name *</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Contractor name" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Quality</Label><Input type="number" min={1} max={10} value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })} /></div>
            <div><Label>Punctuality</Label><Input type="number" min={1} max={10} value={f.punctuality} onChange={(e) => setF({ ...f, punctuality: e.target.value })} /></div>
            <div><Label>Cost</Label><Input type="number" min={1} max={10} value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div>
          </div>
          <div><Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Reliable, good finishing…" /></div>
          <Button className="w-full" onClick={save}><Plus className="w-4 h-4" /> Save rating</Button>
        </>}
      >
        {rows.length === 0 && <Empty title="No ratings yet" description="Rate contractors by quality, punctuality & cost." />}
        {rows.map((r) => (
          <RowItem key={r.id} tint="from-fuchsia-500 to-pink-600" icon={<Star className="w-5 h-5" />}
            title={r.name}
            badges={<Stars value={r.average} />}
            meta={<span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-400">{r.average}/10</span>
              <Badge variant="outline">Q {r.quality}</Badge>
              <Badge variant="outline">P {r.punctuality}</Badge>
              <Badge variant="outline">C {r.cost}</Badge>
              <DatePill label="" date={r.date} />
            </span>}
            right={<Button variant="ghost" size="sm" title="Delete" onClick={() => api.modules.deleteRating(r.id).then(() => setRows(prev => prev.filter(x => x.id !== r.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
          />
        ))}
      </Layout>
    </>
  )
}

/* ---------------- page ---------------- */

export default function Modules() {
  const [tab, setTab] = useState<TabId>('contracts')
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Business Modules</h1>
          </div>
          <p className="text-text/60 text-sm mt-1">Contracts, milestones, price book, equipment, fuel, snags &amp; contractor ratings.</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex-wrap mb-5">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.icon}<span className="ml-1.5">{t.label}</span></TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="contracts"><Contracts /></TabsContent>
        <TabsContent value="milestones"><Milestones /></TabsContent>
        <TabsContent value="vendors"><Vendors /></TabsContent>
        <TabsContent value="equipment"><Equipment /></TabsContent>
        <TabsContent value="fuel"><FuelLogs /></TabsContent>
        <TabsContent value="snags"><Snags /></TabsContent>
        <TabsContent value="ratings"><Ratings /></TabsContent>
      </Tabs>
    </div>
  )
}
