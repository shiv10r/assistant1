import { useEffect, useState } from 'react'
import { api } from '../api'
import type { SiteContract, ContractMilestone, VendorPrice, EquipmentLog, FuelLog, Snag, ContractorRating } from '../api'
import { Card, CardContent, Button, Badge, Empty, Tabs, TabsList, TabsTrigger, TabsContent, Input, Label, Select, Textarea } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import {
  FileText, Flag, Tag, Cog, Fuel, TriangleAlert, Star, Plus, Trash2, Download, CircleCheck, Circle, RefreshCw,
  CalendarDays, Building2, TrendingUp, Wallet, Users, Package, ClipboardList, Banknote, Gauge, Phone, Wrench,
  Pencil, Search, Scale, Check,
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

function Toolbar({ value, onChange, onCsv, placeholder }: {
  value: string; onChange: (v: string) => void; onCsv: () => void; placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="relative flex-1 max-w-xs">
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-text/40" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? 'Search…'} className="pl-8" />
      </div>
      <div className="flex-1" />
      <Button variant="outline" size="sm" onClick={onCsv}><Download className="w-4 h-4 mr-1.5" /> CSV</Button>
    </div>
  )
}

function EditDel({ onEdit, onDel }: { onEdit: () => void; onDel: () => void }) {
  return <>
    <Button variant="ghost" size="sm" title="Edit" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
    <Button variant="ghost" size="sm" title="Delete" onClick={onDel}><Trash2 className="w-4 h-4 text-red-500" /></Button>
  </>
}

type CsvRow = (string | number)[]
function toCsv(filename: string, headers: string[], rows: CsvRow[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const body = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function Progress({ pct, tone }: { pct: number; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="w-16 h-1.5 rounded-full bg-surface2 border border-border overflow-hidden inline-block">
        <span className={`block h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </span>
      <span className="text-[11px] text-text/50">{pct}%</span>
    </span>
  )
}

/* ---------------- Contracts ---------------- */

const CONTRACT_STATUS = ['Draft', 'Active', 'On Hold', 'Completed', 'Terminated']

function Contracts() {
  const { rows, setRows } = useRows<SiteContract>(() => api.modules.contracts())
  const { rows: milestones } = useRows<ContractMilestone>(() => api.modules.milestones())
  const { toast } = useToast()
  const [f, setF] = useState({ projectId: '', partyName: '', title: '', amount: '', startDate: '', endDate: '', terms: '', escalationClause: '', status: 'Active' })
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ projectId: '', partyName: '', title: '', amount: '', startDate: '', endDate: '', terms: '', escalationClause: '', status: 'Active' })

  const edit = (c: SiteContract) => {
    setEditId(c.id)
    setF({ projectId: String(c.projectId), partyName: c.partyName, title: c.title, amount: String(c.amount), startDate: c.startDate.slice(0, 10), endDate: c.endDate.slice(0, 10), terms: c.terms, escalationClause: c.escalationClause, status: c.status })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async () => {
    if (!f.title || !f.amount) return toast({ title: 'Title and amount are required' })
    try {
      const payload: Partial<SiteContract> = {
        projectId: Number(f.projectId) || 0, partyName: f.partyName, title: f.title, amount: Number(f.amount),
        startDate: f.startDate || new Date().toISOString().slice(0, 10), endDate: f.endDate || new Date().toISOString().slice(0, 10),
        terms: f.terms, escalationClause: f.escalationClause, status: f.status,
      }
      if (editId) payload.id = editId
      const saved = await api.modules.saveContract(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev])
      setEditId(null); clear()
      toast({ title: editId ? 'Contract updated' : 'Contract saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const setStatus = async (c: SiteContract, status: string) => {
    try {
      const saved = await api.modules.saveContract({ ...c, status })
      setRows(prev => prev.map(x => x.id === saved.id ? saved : x))
      toast({ title: `Contract ${status}` })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const statusTone = (s: string): 'success' | 'warning' | 'outline' | 'danger' =>
    s === 'Active' ? 'success' : s === 'On Hold' ? 'warning' : s === 'Terminated' ? 'danger' : 'outline'

  const billedByContract = (contractId: number) => milestones.filter(m => m.contractId === contractId && m.isPaid).reduce((s, m) => s + m.amount, 0)

  const filtered = rows.filter(c =>
    !q || (c.title + ' ' + c.partyName + ' ' + c.status).toLowerCase().includes(q.toLowerCase()))

  const active = rows.filter(c => c.status === 'Active').length
  const total = rows.reduce((s, c) => s + c.amount, 0)
  const draft = rows.filter(c => c.status === 'Draft').length

  return (
    <>
      <StatStrip items={[
        { icon: <FileText className="w-5 h-5" />, label: 'Total contracts', value: String(rows.length), tone: 'from-indigo-500 to-violet-600' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Active', value: String(active), tone: 'from-emerald-500 to-teal-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Contract value', value: `₹${money(total)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <Building2 className="w-5 h-5" />, label: 'Drafts', value: String(draft), tone: 'from-sky-500 to-blue-600' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('contracts.csv', ['Id', 'Party', 'Title', 'Amount', 'Start', 'End', 'Status'], rows.map(c => [c.id, c.partyName, c.title, c.amount, c.startDate, c.endDate, c.status]))} />
      <Layout
        title={editId ? 'Edit contract' : 'New contract'}
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
          <div><Label>Status</Label><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{CONTRACT_STATUS.map((s) => <option key={s}>{s}</option>)}</Select></div>
          <div><Label>Escalation clause</Label><Textarea rows={2} value={f.escalationClause} onChange={(e) => setF({ ...f, escalationClause: e.target.value })} placeholder="e.g. Rates revise +5% after 12 months" /></div>
          <div><Label>Terms</Label><Textarea rows={2} value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} /></div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No contracts yet" description="Create your first contract to get started." />}
        {filtered.map((c) => (
          <RowItem key={c.id} tint="from-indigo-500 to-violet-600" icon={<FileText className="w-5 h-5" />}
            title={c.title}
            badges={<Badge variant={statusTone(c.status)}>{c.status}</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              {c.partyName && <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> {c.partyName}</span>}
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">₹{money(c.amount)}</span>
              {milestones.some(m => m.contractId === c.id) && <Progress pct={c.amount > 0 ? Math.round(billedByContract(c.id) / c.amount * 100) : 0} tone="from-emerald-500 to-teal-600" />}
              <DatePill label="Start" date={c.startDate} />
              <DatePill label="End" date={c.endDate} />
            </span>}
            right={<>
              <Select value={c.status} onChange={(e) => setStatus(c, e.target.value)} className="w-28" aria-label="Contract status">
                {CONTRACT_STATUS.map((s) => <option key={s}>{s}</option>)}
              </Select>
              <Button variant="ghost" size="sm" title="Download PDF" onClick={() => api.download(`/api/modules/contracts/${c.id}/pdf`).catch((e) => toast({ title: String(e), variant: 'error' }))}><Download className="w-4 h-4" /></Button>
              <EditDel onEdit={() => edit(c)} onDel={() => api.modules.deleteContract(c.id).then(() => { setRows(prev => prev.filter(x => x.id !== c.id)) }).catch((e) => toast({ title: String(e), variant: 'error' }))} />
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
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ projectId: '', contractId: '', title: '', amount: '', percentage: '', dueDate: '' })
  const edit = (m: ContractMilestone) => {
    setEditId(m.id)
    setF({ projectId: String(m.projectId), contractId: String(m.contractId), title: m.title, amount: String(m.amount), percentage: String(m.percentage), dueDate: m.dueDate.slice(0, 10) })
  }

  const save = async () => {
    if (!f.title) return toast({ title: 'Title is required' })
    try {
      const payload: Partial<ContractMilestone> = {
        projectId: Number(f.projectId) || 0, contractId: Number(f.contractId) || 0, title: f.title,
        amount: Number(f.amount) || 0, percentage: Number(f.percentage) || 0, dueDate: f.dueDate || new Date().toISOString().slice(0, 10),
      }
      if (editId) payload.id = editId
      const saved = await api.modules.saveMilestone(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev])
      setEditId(null); clear()
      toast({ title: editId ? 'Milestone updated' : 'Milestone added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const paid = rows.filter(m => m.isPaid).reduce((s, m) => s + m.amount, 0)
  const billed = rows.reduce((s, m) => s + m.amount, 0)
  const filtered = rows.filter(m => !q || String(m.title + ' ' + m.contractId).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <StatStrip items={[
        { icon: <Flag className="w-5 h-5" />, label: 'Milestones', value: String(rows.length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <CircleCheck className="w-5 h-5" />, label: 'Paid', value: String(rows.filter(m => m.isPaid).length), tone: 'from-lime-500 to-green-600' },
        { icon: <Wallet className="w-5 h-5" />, label: 'Billed', value: `₹${money(billed)}`, tone: 'from-sky-500 to-blue-600' },
        { icon: <Banknote className="w-5 h-5" />, label: 'Paid amount', value: `₹${money(paid)}`, tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('milestones.csv', ['Id', 'Title', 'Amount', 'Percentage', 'Due', 'Status', 'Paid'], rows.map(m => [m.id, m.title, m.amount, m.percentage, m.dueDate, m.status, m.isPaid ? 1 : 0]))} />
      <Layout
        title={editId ? 'Edit milestone' : 'New milestone'}
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Add'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No milestones yet" description="Break a contract into billable milestones." />}
        {filtered.map((m) => (
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
              <EditDel onEdit={() => edit(m)} onDel={() => api.modules.deleteMilestone(m.id).then(() => setRows(prev => prev.filter(x => x.id !== m.id))).catch((e) => toast({ title: String(e), variant: 'error' }))} />
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
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ vendor: '', item: '', price: '', unit: '', notes: '', date: '' })
  const edit = (v: VendorPrice) => {
    setEditId(v.id)
    setF({ vendor: v.vendor, item: v.item, price: String(v.price), unit: v.unit, notes: v.notes, date: v.date.slice(0, 10) })
  }

  const save = async () => {
    if (!f.vendor || !f.item) return toast({ title: 'Vendor and item are required' })
    try {
      const payload: Partial<VendorPrice> = { vendor: f.vendor, item: f.item, price: Number(f.price) || 0, unit: f.unit, notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) }
      if (editId) payload.id = editId
      const saved = await api.modules.saveVendorPrice(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); setEditId(null); clear()
      toast({ title: editId ? 'Price updated' : 'Price saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const vendors = new Set(rows.map(v => v.vendor)).size
  const items = new Set(rows.map(v => v.item)).size
  const filtered = rows.filter(v => !q || String(v.item + ' ' + v.vendor).toLowerCase().includes(q.toLowerCase()))

  const compare = (() => {
    // Best price per item (min), for comparison panel.
    const best: Record<string, { vendor: string; price: number }> = {}
    for (const v of rows) {
      const cur = best[v.item]
      if (!cur || v.price < cur.price) best[v.item] = { vendor: v.vendor, price: v.price }
    }
    return best
  })()

  const maxItem = new Set(rows.map(v => v.item)).size

  return (
    <>
      <StatStrip items={[
        { icon: <Tag className="w-5 h-5" />, label: 'Price lines', value: String(rows.length), tone: 'from-amber-500 to-orange-600' },
        { icon: <Users className="w-5 h-5" />, label: 'Vendors', value: String(vendors), tone: 'from-sky-500 to-blue-600' },
        { icon: <Package className="w-5 h-5" />, label: 'Items', value: String(items), tone: 'from-violet-500 to-purple-600' },
        { icon: <Scale className="w-5 h-5" />, label: 'Best-price items', value: String(Object.keys(compare).length), tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('pricebook.csv', ['Vendor', 'Item', 'Price', 'Unit', 'Date', 'Notes'], rows.map(v => [v.vendor, v.item, v.price, v.unit, v.date, v.notes]))} />
      <Layout
        title={editId ? 'Edit price' : 'Add vendor price'}
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
        actions={<>
          {maxItem > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow"><Scale className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-sm">Best price comparison</h4>
                    <p className="text-[11px] text-text/50">Lowest quote per item, highlighted.</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {Object.entries(compare).sort((a, b) => a[1].price - b[1].price).map(([item, b]) => (
                    <li key={item} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{item}</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> {b.vendor} · ₹{money(b.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>}
      >
        {filtered.length === 0 && <Empty title="No vendor prices yet" description="Log quotes to compare suppliers." />}
        {filtered.map((v) => (
          <RowItem key={v.id} tint="from-amber-500 to-orange-600" icon={<Tag className="w-5 h-5" />}
            title={<span>{v.item} <span className="text-text/40 font-normal">— {v.vendor}</span></span>}
            badges={<>{<Badge variant="info">{v.unit || 'unit'}</Badge>}{compare[v.item]?.vendor === v.vendor && <Badge variant="success">Best</Badge>}</>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              <span className={compare[v.item]?.vendor === v.vendor ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-amber-600 dark:text-amber-400'}>₹{money(v.price)}</span>
              <DatePill label="" date={v.date} />
              {v.notes && <span className="text-text/50">· {v.notes}</span>}
            </span>}
            right={<EditDel onEdit={() => edit(v)} onDel={() => api.modules.deleteVendorPrice(v.id).then(() => setRows(prev => prev.filter(x => x.id !== v.id))).catch((e) => toast({ title: String(e), variant: 'error' }))} />}
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
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ projectId: '', equipment: '', purpose: '', rentalCost: '', fuelCost: '', notes: '', date: '' })
  const edit = (e: EquipmentLog) => {
    setEditId(e.id)
    setF({ projectId: String(e.projectId), equipment: e.equipment, purpose: e.purpose, rentalCost: String(e.rentalCost), fuelCost: String(e.fuelCost), notes: e.notes, date: e.date.slice(0, 10) })
  }

  const save = async () => {
    if (!f.equipment) return toast({ title: 'Equipment name is required' })
    try {
      const payload: Partial<EquipmentLog> = { projectId: Number(f.projectId) || 0, equipment: f.equipment, purpose: f.purpose, rentalCost: Number(f.rentalCost) || 0, fuelCost: Number(f.fuelCost) || 0, notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) }
      if (editId) payload.id = editId
      const saved = await api.modules.saveEquipment(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); setEditId(null); clear()
      toast({ title: editId ? 'Equipment updated' : 'Equipment logged' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const rental = rows.reduce((s, e) => s + e.rentalCost, 0)
  const fuel = rows.reduce((s, e) => s + e.fuelCost, 0)
  const machines = new Set(rows.map(e => e.equipment)).size
  const filtered = rows.filter(e => !q || String(e.equipment + ' ' + e.purpose).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <StatStrip items={[
        { icon: <Cog className="w-5 h-5" />, label: 'Logs', value: String(rows.length), tone: 'from-sky-500 to-blue-600' },
        { icon: <Wrench className="w-5 h-5" />, label: 'Machines', value: String(machines), tone: 'from-violet-500 to-purple-600' },
        { icon: <Banknote className="w-5 h-5" />, label: 'Rental', value: `₹${money(rental)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <Fuel className="w-5 h-5" />, label: 'Fuel', value: `₹${money(fuel)}`, tone: 'from-lime-500 to-green-600' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('equipment.csv', ['Equipment', 'Purpose', 'Rental', 'Fuel', 'Date', 'Notes'], rows.map(e => [e.equipment, e.purpose, e.rentalCost, e.fuelCost, e.date, e.notes]))} />
      <Layout
        title={editId ? 'Edit log' : 'Log equipment'}
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Log'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No equipment logged" description="Track rental + fuel cost per machine." />}
        {filtered.map((e) => (
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
            right={<EditDel onEdit={() => edit(e)} onDel={() => api.modules.deleteEquipment(e.id).then(() => setRows(prev => prev.filter(x => x.id !== e.id))).catch((err) => toast({ title: String(err), variant: 'error' }))} />}
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
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ vehicle: '', litres: '', cost: '', kms: '', notes: '', date: '' })
  const edit = (v: FuelLog) => {
    setEditId(v.id)
    setF({ vehicle: v.vehicle, litres: String(v.litres), cost: String(v.cost), kms: String(v.kms), notes: v.notes, date: v.date.slice(0, 10) })
  }

  const save = async () => {
    if (!f.vehicle) return toast({ title: 'Vehicle is required' })
    try {
      const payload: Partial<FuelLog> = { vehicle: f.vehicle, litres: Number(f.litres) || 0, cost: Number(f.cost) || 0, kms: Number(f.kms) || 0, notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) }
      if (editId) payload.id = editId
      const saved = await api.modules.saveFuel(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); setEditId(null); clear()
      toast({ title: editId ? 'Fuel updated' : 'Fuel logged' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const litres = rows.reduce((s, v) => s + v.litres, 0)
  const cost = rows.reduce((s, v) => s + v.cost, 0)
  const filtered = rows.filter(v => !q || String(v.vehicle + ' ' + v.notes).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <StatStrip items={[
        { icon: <Fuel className="w-5 h-5" />, label: 'Entries', value: String(rows.length), tone: 'from-lime-500 to-green-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Litres', value: `${litres.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L`, tone: 'from-cyan-500 to-sky-600' },
        { icon: <Banknote className="w-5 h-5" />, label: 'Fuel cost', value: `₹${money(cost)}`, tone: 'from-amber-500 to-orange-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg ₹/L', value: litres > 0 ? `₹${(cost / litres).toFixed(1)}` : '—', tone: 'from-emerald-500 to-teal-600' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('fuel.csv', ['Vehicle', 'Date', 'Litres', 'Cost', 'KM', 'Notes'], rows.map(v => [v.vehicle, v.date, v.litres, v.cost, v.kms, v.notes]))} />
      <Layout
        title={editId ? 'Edit entry' : 'Log fuel'}
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Log'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No fuel entries" description="Log diesel per vehicle." />}
        {filtered.map((v) => (
          <RowItem key={v.id} tint="from-lime-500 to-green-600" icon={<Fuel className="w-5 h-5" />}
            title={v.vehicle}
            badges={<Badge variant="info">{v.litres} L</Badge>}
            meta={<span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lime-600 dark:text-lime-400">₹{money(v.cost)}</span>
              <span className="inline-flex items-center gap-1"><Gauge className="w-3 h-3" /> {v.kms} km</span>
              <DatePill label="" date={v.date} />
              {v.notes && <span className="text-text/50">· {v.notes}</span>}
            </span>}
            right={<EditDel onEdit={() => edit(v)} onDel={() => api.modules.deleteFuel(v.id).then(() => setRows(prev => prev.filter(x => x.id !== v.id))).catch((e) => toast({ title: String(e), variant: 'error' }))} />}
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
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ projectId: '', title: '', severity: 'Medium', assignee: '', dueDate: '', notes: '' })
  const edit = (s: Snag) => {
    setEditId(s.id)
    setF({ projectId: String(s.projectId), title: s.title, severity: s.severity, assignee: s.assignee, dueDate: s.dueDate.slice(0, 10), notes: s.notes })
  }

  const save = async () => {
    if (!f.title) return toast({ title: 'Title is required' })
    try {
      const payload: Partial<Snag> = { projectId: Number(f.projectId) || 0, title: f.title, severity: f.severity, assignee: f.assignee, dueDate: f.dueDate || new Date().toISOString().slice(0, 10), notes: f.notes }
      if (editId) payload.id = editId
      const saved = await api.modules.saveSnag(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); setEditId(null); clear()
      toast({ title: editId ? 'Snag updated' : 'Snag added' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const cycle = (id: number) => api.modules.setSnagStatus(id).then((u) => setRows(prev => prev.map(x => x.id === u.id ? u : x))).catch((e) => toast({ title: String(e), variant: 'error' }))
  const sevTone = (s: string): 'default' | 'warning' | 'danger' => s === 'High' ? 'danger' : s === 'Medium' ? 'warning' : 'default'
  const statusTone = (s: string): 'default' | 'warning' | 'success' => s === 'Fixed' ? 'success' : s === 'In Progress' ? 'warning' : 'default'
  const open = rows.filter(s => s.status !== 'Fixed').length
  const filtered = rows.filter(s => !q || String(s.title + ' ' + s.assignee + ' ' + s.status).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <StatStrip items={[
        { icon: <TriangleAlert className="w-5 h-5" />, label: 'Total', value: String(rows.length), tone: 'from-rose-500 to-red-600' },
        { icon: <ClipboardList className="w-5 h-5" />, label: 'Open', value: String(open), tone: 'from-amber-500 to-orange-600' },
        { icon: <CircleCheck className="w-5 h-5" />, label: 'Fixed', value: String(rows.filter(s => s.status === 'Fixed').length), tone: 'from-emerald-500 to-teal-600' },
        { icon: <TriangleAlert className="w-5 h-5" />, label: 'High severity', value: String(rows.filter(s => s.severity === 'High' && s.status !== 'Fixed').length), tone: 'from-red-600 to-rose-700' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('snags.csv', ['Title', 'Severity', 'Status', 'Assignee', 'Due', 'Notes'], rows.map(s => [s.title, s.severity, s.status, s.assignee, s.dueDate, s.notes]))} />
      <Layout
        title={editId ? 'Edit snag' : 'New snag'}
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Add'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No snags" description="Punch-list items are resolved in order." />}
        {filtered.map((s) => (
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
              <EditDel onEdit={() => edit(s)} onDel={() => api.modules.deleteSnag(s.id).then(() => setRows(prev => prev.filter(x => x.id !== s.id))).catch((e) => toast({ title: String(e), variant: 'error' }))} />
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
  const [editId, setEditId] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const clear = () => setF({ name: '', quality: '5', punctuality: '5', cost: '5', notes: '', date: '' })
  const edit = (r: ContractorRating) => {
    setEditId(r.id)
    setF({ name: r.name, quality: String(r.quality), punctuality: String(r.punctuality), cost: String(r.cost), notes: r.notes, date: r.date.slice(0, 10) })
  }

  const save = async () => {
    if (!f.name) return toast({ title: 'Contractor name is required' })
    try {
      const payload: Partial<ContractorRating> = { name: f.name, quality: Number(f.quality), punctuality: Number(f.punctuality), cost: Number(f.cost), notes: f.notes, date: f.date || new Date().toISOString().slice(0, 10) }
      if (editId) payload.id = editId
      const saved = await api.modules.saveRating(payload)
      setRows(prev => editId ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]); setEditId(null); clear()
      toast({ title: editId ? 'Rating updated' : 'Rating saved' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) }
  }

  const avg = rows.length ? rows.reduce((s, r) => s + r.average, 0) / rows.length : 0
  const filtered = rows.filter(r => !q || String(r.name + ' ' + r.notes).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <StatStrip items={[
        { icon: <Star className="w-5 h-5" />, label: 'Contractors', value: String(rows.length), tone: 'from-fuchsia-500 to-pink-600' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg score', value: rows.length ? `${avg.toFixed(1)}/10` : '—', tone: 'from-emerald-500 to-teal-600' },
        { icon: <Gauge className="w-5 h-5" />, label: 'Top rated', value: rows.length ? `${Math.max(...rows.map(r => r.average))}/10` : '—', tone: 'from-amber-500 to-orange-600' },
        { icon: <Users className="w-5 h-5" />, label: '≥7 score', value: String(rows.filter(r => r.average >= 7).length), tone: 'from-sky-500 to-blue-600' },
      ]} />
      <Toolbar value={q} onChange={setQ} onCsv={() => toCsv('ratings.csv', ['Name', 'Quality', 'Punctuality', 'Cost', 'Average', 'Date', 'Notes'], rows.map(r => [r.name, r.quality, r.punctuality, r.cost, r.average, r.date, r.notes]))} />
      <Layout
        title={editId ? 'Edit rating' : 'Rate contractor'}
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
          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}><Plus className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            {editId != null && <Button variant="outline" onClick={() => { setEditId(null); clear() }}>Cancel</Button>}
          </div>
        </>}
      >
        {filtered.length === 0 && <Empty title="No ratings yet" description="Rate contractors by quality, punctuality & cost." />}
        {filtered.map((r) => (
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
            right={<EditDel onEdit={() => edit(r)} onDel={() => api.modules.deleteRating(r.id).then(() => setRows(prev => prev.filter(x => x.id !== r.id))).catch((e) => toast({ title: String(e), variant: 'error' }))} />}
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