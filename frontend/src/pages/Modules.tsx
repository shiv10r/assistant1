import { useEffect, useState } from 'react'
import { api } from '../api'
import type { SiteContract, ContractMilestone, VendorPrice, EquipmentLog, FuelLog, Snag, ContractorRating } from '../api'
import { Card, CardContent, Button, Badge, Empty, Tabs, TabsList, TabsTrigger, TabsContent, Input, Label, Select, Textarea } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import {
  FileText, Flag, Tag, Cog, Fuel, TriangleAlert, Star, Plus, Trash2, Download, CircleCheck, Circle, RefreshCw,
} from 'lucide-react'

type TabId = 'contracts' | 'milestones' | 'vendors' | 'equipment' | 'fuel' | 'snags' | 'ratings'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'contracts', label: 'Contracts', icon: <FileText className="w-4 h-4" /> },
  { id: 'milestones', label: 'Milestones', icon: <Flag className="w-4 h-4" /> },
  { id: 'vendors', label: 'Price Book', icon: <Tag className="w-4 h-4" /> },
  { id: 'equipment', label: 'Equipment', icon: <Cog className="w-4 h-4" /> },
  { id: 'fuel', label: 'Fuel', icon: <Fuel className="w-4 h-4" /> },
  { id: 'snags', label: 'Snags', icon: <TriangleAlert className="w-4 h-4" /> },
  { id: 'ratings', label: 'Ratings', icon: <Star className="w-4 h-4" /> },
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

function Section({ title, subtitle, form, children }: { title: string; subtitle: string; form: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-1 h-fit">
        <CardContent className="p-4">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-text/50 mb-3">{subtitle}</p>
          {form}
        </CardContent>
      </Card>
      <div className="xl:col-span-2 space-y-2">{children}</div>
    </div>
  )
}

function RowItem({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Card className="mb-0">
      <CardContent className="p-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">{children}</div>
        <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
      </CardContent>
    </Card>
  )
}

// ---------------- Contracts ----------------

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

  return (
    <Section
      title="New contract"
      subtitle="Agreements with escalation clauses, printable as PDF."
      form={<>
        <Label>Title *</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Phase-2 structure works" />
        <Label>Client / Party</Label><Input value={f.partyName} onChange={(e) => setF({ ...f, partyName: e.target.value })} placeholder="Client name" />
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} placeholder="0" /></div>
          <div><Label>Amount (₹)</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Start</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
          <div><Label>End</Label><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
        </div>
        <Label>Escalation clause</Label><Textarea rows={2} value={f.escalationClause} onChange={(e) => setF({ ...f, escalationClause: e.target.value })} placeholder="e.g. Rates revise +5% after 12 months" />
        <Label>Terms</Label><Textarea rows={2} value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Save contract</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No contracts yet" />}
      {rows.map((c) => (
        <RowItem key={c.id}  right={<>
          <Badge>{c.status}</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.download(`/api/modules/contracts/${c.id}/pdf`).catch((e) => toast({ title: String(e), variant: 'error' }))}><Download className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteContract(c.id).then(() => { setRows(prev => prev.filter(x => x.id !== c.id)) }).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{c.title}</p>
          <p className="text-xs text-text/50">{c.partyName || '—'} · {money(c.amount)} · {c.startDate.slice(0, 10)} → {c.endDate.slice(0, 10)}</p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---------------- Milestones ----------------

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
  return (
    <Section
      title="New milestone"
      subtitle="% of work vs billed, trackable as paid."
      form={<>
        <Label>Title *</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Foundation complete" />
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} /></div>
          <div><Label>Contract ID</Label><Input type="number" value={f.contractId} onChange={(e) => setF({ ...f, contractId: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Amount (₹)</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
          <div><Label>% of contract</Label><Input type="number" value={f.percentage} onChange={(e) => setF({ ...f, percentage: e.target.value })} /></div>
        </div>
        <Label>Due date</Label><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Add milestone</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No milestones yet" />}
      {rows.map((m) => (
        <RowItem key={m.id}  right={<>
          <Button variant="ghost" size="sm" onClick={() => api.modules.markMilestonePaid(m.id).then((u) => setRows(prev => prev.map(x => x.id === u.id ? u : x))).catch((e) => toast({ title: String(e), variant: 'error' }))}>
            {m.isPaid ? <CircleCheck className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteMilestone(m.id).then(() => setRows(prev => prev.filter(x => x.id !== m.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{m.title}</p>
          <p className="text-xs text-text/50">{money(m.amount)} · {m.percentage}% · due {m.dueDate.slice(0, 10)} · <Badge>{m.isPaid ? 'Paid' : 'Billed'}</Badge></p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---------------- Vendor price book ----------------

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
  return (
    <Section
      title="Add vendor price"
      subtitle="Compare supplier quotes per material."
      form={<>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Vendor *</Label><Input value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} /></div>
          <div><Label>Item *</Label><Input value={f.item} onChange={(e) => setF({ ...f, item: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Price (₹)</Label><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></div>
          <div><Label>Unit</Label><Input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} placeholder="bag/cu.m" /></div>
        </div>
        <Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Rate valid until…" />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Save price</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No vendor prices yet" />}
      {rows.map((v) => (
        <RowItem key={v.id} right={<>
          <Badge>{v.unit || 'unit'}</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteVendorPrice(v.id).then(() => setRows(prev => prev.filter(x => x.id !== v.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{v.item} <span className="text-text/50 font-normal">— {v.vendor}</span></p>
          <p className="text-xs text-text/50">₹{money(v.price)} {v.unit} · {v.date.slice(0, 10)} {v.notes && `· ${v.notes}`}</p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---------------- Equipment ----------------

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
  return (
    <Section
      title="Log equipment"
      subtitle="Rental + fuel cost per machine."
      form={<>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Equipment *</Label><Input value={f.equipment} onChange={(e) => setF({ ...f, equipment: e.target.value })} /></div>
          <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} /></div>
        </div>
        <Label>Purpose</Label><Input value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} placeholder="Excavation…" />
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Rental (₹)</Label><Input type="number" value={f.rentalCost} onChange={(e) => setF({ ...f, rentalCost: e.target.value })} /></div>
          <div><Label>Fuel (₹)</Label><Input type="number" value={f.fuelCost} onChange={(e) => setF({ ...f, fuelCost: e.target.value })} /></div>
        </div>
        <Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Log equipment</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No equipment logged" />}
      {rows.map((e) => (
        <RowItem key={e.id}  right={<>
          <Badge>₹{money(e.rentalCost + e.fuelCost)}</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteEquipment(e.id).then(() => setRows(prev => prev.filter(x => x.id !== e.id))).catch((err) => toast({ title: String(err), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{e.equipment}</p>
          <p className="text-xs text-text/50">{e.purpose || '—'} · rental ₹{money(e.rentalCost)} + fuel ₹{money(e.fuelCost)} · {e.date.slice(0, 10)}</p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---------------- Fuel ----------------

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
  return (
    <Section
      title="Log fuel"
      subtitle="Diesel per vehicle, litres, km, cost."
      form={<>
        <Label>Vehicle *</Label><Input value={f.vehicle} onChange={(e) => setF({ ...f, vehicle: e.target.value })} placeholder="MH-12-AB-1234" />
        <div className="grid grid-cols-3 gap-2">
          <div><Label>Litres</Label><Input type="number" value={f.litres} onChange={(e) => setF({ ...f, litres: e.target.value })} /></div>
          <div><Label>Cost (₹)</Label><Input type="number" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div>
          <div><Label>KM</Label><Input type="number" value={f.kms} onChange={(e) => setF({ ...f, kms: e.target.value })} /></div>
        </div>
        <Label>Date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Log fuel</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No fuel entries" />}
      {rows.map((v) => (
        <RowItem key={v.id} right={<>
          <Badge>{v.litres} L</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteFuel(v.id).then(() => setRows(prev => prev.filter(x => x.id !== v.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{v.vehicle}</p>
          <p className="text-xs text-text/50">{v.date.slice(0, 10)} · {v.litres} L · ₹{money(v.cost)} · {v.kms} km {v.notes && `· ${v.notes}`}</p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---------------- Snags ----------------

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
  return (
    <Section
      title="New snag"
      subtitle="Punch-list items per site, cycle through status."
      form={<>
        <Label>Title *</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Crack in slab…" />
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Severity</Label><Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>{SEVERITY.map((s) => <option key={s}>{s}</option>)}</Select></div>
          <div><Label>Project ID</Label><Input type="number" value={f.projectId} onChange={(e) => setF({ ...f, projectId: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Assignee</Label><Input value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} /></div>
          <div><Label>Due</Label><Input type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
        </div>
        <Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Add snag</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No snags" />}
      {rows.map((s) => (
        <RowItem key={s.id} right={<>
          <Badge variant={sevTone(s.severity)}>{s.severity}</Badge>
          <Badge variant={statusTone(s.status)}>{s.status}</Badge>
          <Button variant="ghost" size="sm" onClick={() => cycle(s.id)}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteSnag(s.id).then(() => setRows(prev => prev.filter(x => x.id !== s.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{s.title}</p>
          <p className="text-xs text-text/50">{s.assignee || '—'} · due {s.dueDate.slice(0, 10)}</p>
        </RowItem>
      ))}
    </Section>
  )
}

// ---------------- Ratings ----------------

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
  return (
    <Section
      title="Rate contractor"
      subtitle="Score quality, punctuality, cost out of 10."
      form={<>
        <Label>Name *</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
          <div><Label>Quality</Label><Input type="number" min={1} max={10} value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })} /></div>
          <div><Label>Punctuality</Label><Input type="number" min={1} max={10} value={f.punctuality} onChange={(e) => setF({ ...f, punctuality: e.target.value })} /></div>
          <div><Label>Cost</Label><Input type="number" min={1} max={10} value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div>
        </div>
        <Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <Button className="w-full mt-2" onClick={save}><Plus className="w-4 h-4" /> Save rating</Button>
      </>}
    >
      {rows.length === 0 && <Empty title="No ratings yet" />}
      {rows.map((r) => (
        <RowItem key={r.id}  right={<>
          <Badge variant={r.average >= 7 ? 'success' : r.average >= 4 ? 'warning' : 'danger'}>{r.average}/10</Badge>
          <Button variant="ghost" size="sm" onClick={() => api.modules.deleteRating(r.id).then(() => setRows(prev => prev.filter(x => x.id !== r.id))).catch((e) => toast({ title: String(e), variant: 'error' }))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </>}>
          <p className="font-semibold truncate">{r.name}</p>
          <p className="text-xs text-text/50">Q {r.quality} · P {r.punctuality} · C {r.cost} · {r.date.slice(0, 10)}</p>
        </RowItem>
      ))}
    </Section>
  )
}

export default function Modules() {
  const [tab, setTab] = useState<TabId>('contracts')
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="text-2xl font-bold">Business Modules</h1>
          <p className="text-text/60 text-sm mt-1">Contracts, milestones, price book, equipment, fuel, snags &amp; contractor ratings.</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex-wrap">
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
    </>
  )
}
