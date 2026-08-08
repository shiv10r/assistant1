import { useEffect, useState } from 'react'
import { api } from '../api'
import type {
  PlRow, Gstr1Data, CreditRow, ForecastData, StockRow, LabourRow, DelayedRow, AdvanceRow,
} from '../api'
import { Card, CardContent, Badge, Empty, Tabs, TabsList, TabsTrigger, TabsContent, Button } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { cn } from '../lib/utils'
import {
  Wallet, ReceiptText, Landmark, TrendingUp, Package, Users, AlarmClock,
  HandCoins, FileText, HeartPulse, Send, Download, RefreshCw,
} from 'lucide-react'

type TabId = 'pl' | 'gstr1' | 'credit' | 'forecast' | 'stock' | 'labour' | 'delayed' | 'advances' | 'digest' | 'health'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'pl', label: 'P&L', icon: <Wallet className="w-4 h-4" /> },
  { id: 'gstr1', label: 'GSTR-1', icon: <ReceiptText className="w-4 h-4" /> },
  { id: 'credit', label: 'Credit', icon: <Landmark className="w-4 h-4" /> },
  { id: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'stock', label: 'Stock', icon: <Package className="w-4 h-4" /> },
  { id: 'labour', label: 'Labour', icon: <Users className="w-4 h-4" /> },
  { id: 'delayed', label: 'Delayed', icon: <AlarmClock className="w-4 h-4" /> },
  { id: 'advances', label: 'Advances', icon: <HandCoins className="w-4 h-4" /> },
  { id: 'digest', label: 'Digest', icon: <FileText className="w-4 h-4" /> },
  { id: 'health', label: 'AI Health', icon: <HeartPulse className="w-4 h-4" /> },
]

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'red' | 'gold' }) {
  const tones = { green: 'text-emerald-500', red: 'text-red-500', gold: 'text-amber-500' }
  return (
    <Card className="mb-0">
      <CardContent className="p-4">
        <p className="text-xs text-text/50">{label}</p>
        <p className={cn('text-lg font-bold mt-0.5', tone && tones[tone])}>{value}</p>
      </CardContent>
    </Card>
  )
}

function Pl() {
  const [rows, setRows] = useState<PlRow[]>([])
  const [totals, setTotals] = useState<{ receivedLabel: string; spentLabel: string; profitLabel: string } | null>(null)
  useEffect(() => { api.insights.pl().then((d) => { setRows(d.rows); setTotals(d.totals) }).catch(() => {}) }, [])
  return (
    <div className="space-y-4">
      {totals && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Received" value={totals.receivedLabel} tone="green" />
          <Stat label="Spent" value={totals.spentLabel} tone="red" />
          <Stat label="Net Profit" value={totals.profitLabel} tone="gold" />
        </div>
      )}
      {rows.length === 0 ? <Empty title="No projects yet" /> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-text/50">
              <tr><th className="p-3">Project</th><th className="p-3 text-right">Value</th><th className="p-3 text-right">Received</th><th className="p-3 text-right">Spent</th><th className="p-3 text-right">Profit</th><th className="p-3 text-right">Margin</th></tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.name}<span className="block text-xs text-text/40">{r.status}</span></td>
                  <td className="p-3 text-right">{r.valueLabel}</td>
                  <td className="p-3 text-right text-emerald-500">{r.receivedLabel}</td>
                  <td className="p-3 text-right text-red-500">{r.spentLabel}</td>
                  <td className={cn('p-3 text-right font-semibold', r.profit >= 0 ? 'text-emerald-500' : 'text-red-500')}>{r.profitLabel}</td>
                  <td className="p-3 text-right">{r.marginPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Gstr1() {
  const [data, setData] = useState<Gstr1Data | null>(null)
  const [period, setPeriod] = useState('Month')
  useEffect(() => { api.insights.gstr1(period).then(setData).catch(() => setData(null)) }, [period])
  if (!data) return <Empty title="No sales yet" />
  const s = data.summary
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select className="h-9 rounded-lg border bg-surface px-3 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="Month">This month</option>
          <option value="Today">Today</option>
          <option value="Week">Last 7 days</option>
          <option value="All">All time</option>
        </select>
        <span className="text-xs text-text/50">{data.periodLabel} · {s.invoiceCount} invoice(s)</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Taxable" value={s.taxableLabel} />
        <Stat label="Tax" value={s.taxLabel} />
        <Stat label="CGST" value={s.cgst} />
        <Stat label="SGST" value={s.sgst} />
      </div>
      {data.hsnRows.length === 0 ? <Empty title="No HSN lines" /> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-text/50">
              <tr><th className="p-3">HSN</th><th className="p-3 text-right">Lines</th><th className="p-3 text-right">Taxable</th><th className="p-3 text-right">Tax</th></tr>
            </thead>
            <tbody className="divide-y">
              {data.hsnRows.map((h) => (
                <tr key={h.hsn}>
                  <td className="p-3">{h.hsn}<span className="block text-xs text-text/40">@{h.rateLabel}</span></td>
                  <td className="p-3 text-right">{h.count}</td>
                  <td className="p-3 text-right">{h.taxableLabel}</td>
                  <td className="p-3 text-right">{h.taxLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Credit() {
  const [buckets, setBuckets] = useState<{ bucket: string; total: string; count: number }[]>([])
  const [overdue, setOverdue] = useState<CreditRow[]>([])
  const [net, setNet] = useState('')
  const [parties, setParties] = useState<{ id: number; name: string; phone: string; balanceLabel: string; direction: string }[]>([])
  useEffect(() => {
    api.insights.credit().then((d) => { setBuckets(d.buckets); setOverdue(d.overdue); setNet(d.netReceivableLabel); setParties(d.parties) }).catch(() => {})
  }, [])
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Stat label="Net Receivable" value={net} />
        {buckets.map((b) => (
          <Stat key={b.bucket} label={`${b.bucket} days overdue`} value={b.total} tone={b.bucket === '90+' ? 'red' : 'gold'} />
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs text-text/50">
            <tr><th className="p-3">Invoice</th><th className="p-3">Party</th><th className="p-3 text-right">Balance</th><th className="p-3">Due</th><th className="p-3 text-right">Overdue</th><th className="p-3">Bucket</th></tr>
          </thead>
          <tbody className="divide-y">
            {overdue.map((o) => (
              <tr key={o.id}>
                <td className="p-3">{o.refLabel}</td>
                <td className="p-3">{o.party}</td>
                <td className="p-3 text-right font-semibold text-red-500">{o.balanceLabel}</td>
                <td className="p-3">{o.due}</td>
                <td className="p-3 text-right">{o.daysOverdue}d</td>
                <td className="p-3"><Badge variant={o.bucket === '90+' ? 'danger' : 'warning'}>{o.bucket}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {overdue.length === 0 && <Empty title="No overdue invoices" />}
      </div>
      {parties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {parties.map((p) => (
            <Badge key={p.id} variant={p.direction === "You'll Get" ? 'success' : 'warning'}>
              {p.name}: {p.balanceLabel} ({p.direction})
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function Forecast() {
  const [data, setData] = useState<ForecastData | null>(null)
  useEffect(() => { api.insights.forecast().then(setData).catch(() => setData(null)) }, [])
  if (!data) return <Empty title="No data" />
  return (
    <div className="space-y-4">
      <Stat label="Cash in hand today" value={data.cashNowLabel} tone="green" />
      <div className="grid grid-cols-3 gap-3">
        {data.buckets.map((b) => (
          <Card key={b.window} className="mb-0">
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold">{b.window}</p>
              <p className="text-xs text-emerald-500">In: {b.inflow}</p>
              <p className="text-xs text-red-500">Out: {b.outflow}</p>
              <p className={cn('font-bold', b.net >= 0 ? 'text-emerald-500' : 'text-red-500')}>{b.netLabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Stock() {
  const [data, setData] = useState<{ totalValueLabel: string; lowStockCount: number; deadStockCount: number; rows: StockRow[] } | null>(null)
  useEffect(() => { api.insights.stock().then(setData).catch(() => setData(null)) }, [])
  if (!data) return <Empty title="No stock items" />
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Stat label="Stock Value" value={data.totalValueLabel} tone="gold" />
        <Stat label="Low Stock" value={String(data.lowStockCount)} tone="red" />
        <Stat label="Dead Stock" value={String(data.deadStockCount)} tone="gold" />
      </div>
      {data.rows.length === 0 ? <Empty title="Nothing in stock" /> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-text/50">
              <tr><th className="p-3">Item</th><th className="p-3 text-right">Stock</th><th className="p-3 text-right">Rate</th><th className="p-3 text-right">Value</th><th className="p-3">Flags</th></tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.name}<span className="block text-xs text-text/40">{r.category}</span></td>
                  <td className="p-3 text-right">{r.stockLabel}</td>
                  <td className="p-3 text-right">{r.rate.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right">{r.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  <td className="p-3">
                    {r.lowStock && <Badge variant="warning">Low</Badge>}
                    {r.dead && <Badge variant="danger" className="ml-1">Dead</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Labour() {
  const [data, setData] = useState<{ totalPresentLabel: string; totalWagesLabel: string; rows: LabourRow[] } | null>(null)
  useEffect(() => { api.insights.labour().then(setData).catch(() => setData(null)) }, [])
  if (!data) return <Empty title="No attendance data" />
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Stat label="Man-days (30 days)" value={data.totalPresentLabel} />
        <Stat label="Wages (30 days)" value={data.totalWagesLabel} tone="gold" />
      </div>
      {data.rows.length === 0 ? <Empty title="No projects" /> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-text/50">
              <tr><th className="p-3">Project</th><th className="p-3 text-right">Workers</th><th className="p-3 text-right">Man-days</th><th className="p-3 text-right">Wages</th><th className="p-3 text-right">Days/worker</th></tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 text-right">{r.workers}</td>
                  <td className="p-3 text-right">{r.presentDays}</td>
                  <td className="p-3 text-right">{r.wagesLabel}</td>
                  <td className="p-3 text-right">{r.avgPerWorker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Delayed() {
  const [data, setData] = useState<{ rate: number; totalInterestLabel: string; rows: DelayedRow[] } | null>(null)
  useEffect(() => { api.insights.delayed().then(setData).catch(() => setData(null)) }, [])
  if (!data) return <Empty title="No delayed payments" />
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Stat label="Interest @ 12%/yr" value={data.totalInterestLabel} tone="gold" />
        <Stat label="Overdue invoices" value={String(data.rows.length)} tone="red" />
      </div>
      {data.rows.length === 0 ? <Empty title="Nothing overdue" /> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-text/50">
              <tr><th className="p-3">Invoice</th><th className="p-3">Party</th><th className="p-3 text-right">Balance</th><th className="p-3 text-right">Days</th><th className="p-3 text-right">Interest</th></tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">{r.refLabel}</td>
                  <td className="p-3">{r.party}</td>
                  <td className="p-3 text-right text-red-500">{r.balanceLabel}</td>
                  <td className="p-3 text-right">{r.daysOverdue}d</td>
                  <td className="p-3 text-right font-semibold">{r.interestLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Advances() {
  const [data, setData] = useState<{ totalAdvanceLabel: string; totalSpentLabel: string; netAdvanceLabel: string; rows: AdvanceRow[] } | null>(null)
  useEffect(() => { api.insights.advances().then(setData).catch(() => setData(null)) }, [])
  if (!data) return <Empty title="No projects" />
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Stat label="Advance Received" value={data.totalAdvanceLabel} tone="green" />
        <Stat label="Spent" value={data.totalSpentLabel} tone="red" />
        <Stat label="Balance to Use" value={data.netAdvanceLabel} tone="gold" />
      </div>
      {data.rows.length === 0 ? <Empty title="No projects" /> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-text/50">
              <tr><th className="p-3">Project</th><th className="p-3 text-right">Advance</th><th className="p-3 text-right">Spent</th><th className="p-3 text-right">Remaining</th></tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.name}<span className="block text-xs text-text/40">{r.status}</span></td>
                  <td className="p-3 text-right text-emerald-500">{r.advanceLabel}</td>
                  <td className="p-3 text-right text-red-500">{r.spentLabel}</td>
                  <td className={cn('p-3 text-right font-semibold', r.remaining >= 0 ? 'text-emerald-500' : 'text-red-500')}>{r.remainingLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Digest() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const load = () => { setLoading(true); api.insights.digest().then((d) => setText(d.text)).catch((e) => setText(String(e))).finally(() => setLoading(false)) }
  useEffect(load, [])
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-text/60">Daily cash book &amp; sales summary for today.</p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh</Button>
      </div>
      <Card><CardContent className="p-5"><pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{text || '…'}</pre></CardContent></Card>
    </div>
  )
}

function Health() {
  const [data, setData] = useState<{ ok: boolean; configured: boolean; model: string; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const load = () => { setLoading(true); api.insights.health().then(setData).catch((e) => setData({ ok: false, configured: false, model: '', text: String(e) })).finally(() => setLoading(false)) }
  useEffect(load, [])
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant={data?.configured ? 'success' : 'warning'}>{data?.configured ? 'AI enabled' : 'Rule-based mode'}</Badge>
        {data?.model && <span className="text-xs text-text/40">model: {data.model}</span>}
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Re-analyse</Button>
      </div>
      <Card><CardContent className="p-5"><pre className="whitespace-pre-wrap text-sm leading-relaxed">{data?.text || '…'}</pre></CardContent></Card>
    </div>
  )
}

function ActionPanel() {
  const [busy, setBusy] = useState('')
  const { toast } = useToast()
  const run = async (kind: 'reminders' | 'backup') => {
    setBusy(kind)
    try {
      const r = kind === 'reminders' ? await api.insights.sendReminders() : await api.insights.backupEmail()
      if (!r.ok && r.code) { toast({ title: r.message || r.code, variant: 'error' }); return }
      if (kind === 'reminders') toast({ title: `Reminders sent: ${(r as { sent: number }).sent}` })
      else toast({ title: 'Backup emailed' })
    } catch (e) { toast({ title: String(e), variant: 'error' }) } finally { setBusy('') }
  }
  return (
    <Card className="mb-0">
      <CardContent className="p-4 flex flex-wrap items-center gap-3">
        <Button onClick={() => run('reminders')} disabled={!!busy}><Send className="w-4 h-4" /> Send due reminders</Button>
        <Button variant="outline" onClick={() => run('backup')} disabled={!!busy}><Download className="w-4 h-4" /> Email DB backup</Button>
        <span className="text-xs text-text/50">Reminders email overdue invoices; backup attaches the full database.</span>
      </CardContent>
    </Card>
  )
}

export default function Insights() {
  const [tab, setTab] = useState<TabId>('pl')
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-text/60 text-sm mt-1">Financial &amp; operational intelligence across all sites.</p>
        </div>
      </div>
      <ActionPanel />
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>{t.icon}<span className="ml-1.5">{t.label}</span></TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="pl"><Pl /></TabsContent>
        <TabsContent value="gstr1"><Gstr1 /></TabsContent>
        <TabsContent value="credit"><Credit /></TabsContent>
        <TabsContent value="forecast"><Forecast /></TabsContent>
        <TabsContent value="stock"><Stock /></TabsContent>
        <TabsContent value="labour"><Labour /></TabsContent>
        <TabsContent value="delayed"><Delayed /></TabsContent>
        <TabsContent value="advances"><Advances /></TabsContent>
        <TabsContent value="digest"><Digest /></TabsContent>
        <TabsContent value="health"><Health /></TabsContent>
      </Tabs>
    </>
  )
}
