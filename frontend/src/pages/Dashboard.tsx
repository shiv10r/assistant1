import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { ActivityItem, AnalyticsData, ContractMilestone, ModuleSummary, Snag } from '../api'
import { Card, CardHeader, CardTitle, CardContent, Badge, Empty, money, cn } from '../components/ui'
import {
  Briefcase, TrendingUp, Wallet, HardHat, FileCheck2, Wrench, Users, Fuel,
  ArrowRight, Map, ClipboardList, Activity as ActivityIcon, Package, AlarmClock,
} from 'lucide-react'

const STATUS_TONE: Record<string, 'default' | 'success' | 'info' | 'warning' | 'outline' | 'danger'> = {
  'In Discussion': 'info',
  'Not Started': 'outline',
  Ongoing: 'default',
  'On Hold': 'warning',
  Completed: 'success',
}

interface DashboardData {
  analytics: AnalyticsData | null
  mods: ModuleSummary | null
  snags: Snag[] | null
  milestones: ContractMilestone[] | null
  credit: { receivableLabel: string; overdue: unknown[] } | null
  stock: { rows: { name: string; stockLabel: string; lowStock: boolean }[] } | null
  labour: { totalWorkers: number; totalPresentLabel: string } | null
  activity: ActivityItem[] | null
  procurementPending: number | null
}

const empty: DashboardData = {
  analytics: null, mods: null, snags: null, milestones: null,
  credit: null, stock: null, labour: null, activity: null, procurementPending: null,
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(empty)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.allSettled([
      api.analytics(),
      api.modules.summary(),
      api.modules.snags().catch(() => [] as Snag[]),
      api.modules.milestones().catch(() => [] as ContractMilestone[]),
      api.insights.credit().catch(() => ({ receivableLabel: '', overdue: [] })),
      api.insights.stock().catch(() => ({ rows: [] as { name: string; stockLabel: string; lowStock: boolean }[] })),
      api.insights.labour().catch(() => ({ totalWorkers: 0, totalPresentLabel: '' })),
      api.activity(50).catch(() => [] as ActivityItem[]),
      api.modules.procurementOrders().catch(() => [] as { status: string }[]),
    ]).then(([a, m, s, ms, c, st, l, act, po]) => {
      if (!alive) return
      setData({
        analytics: a.status === 'fulfilled' ? a.value : null,
        mods: m.status === 'fulfilled' ? m.value : null,
        snags: s.status === 'fulfilled' ? s.value : null,
        milestones: ms.status === 'fulfilled' ? ms.value : null,
        credit: c.status === 'fulfilled' ? c.value : null,
        stock: st.status === 'fulfilled' ? st.value : null,
        labour: l.status === 'fulfilled' ? l.value : null,
        activity: act.status === 'fulfilled' ? act.value : null,
        procurementPending: po.status === 'fulfilled' ? po.value.filter((o) => !/done|completed|closed|delivered/i.test(o.status ?? '')).length : null,
      })
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  if (loading) return <div className="empty">Loading…</div>

  const { analytics, mods, snags, milestones, credit, stock, labour, activity, procurementPending } = data
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const activeSites = analytics?.projects.filter((p) => p.status === 'Ongoing').length ?? 0

  const saleTotals = analytics?.salesByMonth ?? []
  const expTotals = analytics?.expenseByMonth ?? []
  const monthDelta = saleTotals.length >= 2 && saleTotals[saleTotals.length - 2].total > 0
    ? Math.round(((saleTotals[saleTotals.length - 1].total - saleTotals[saleTotals.length - 2].total) / saleTotals[saleTotals.length - 2].total) * 100)
    : null

  const openSnags = mods?.openSnags ?? 0
  const clearedSnags = snags ? Math.max(0, snags.length - openSnags) : null

  const upcomingMilestones = (milestones ?? [])
    .filter((m) => !m.isPaid && !/done|completed/i.test(m.status ?? ''))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const lowStockRows = (stock?.rows ?? []).filter((r) => r.lowStock).slice(0, 6)

  const projects = analytics?.projects ?? []
  const grandEntries = projects.reduce((n, p) => n + (p.entries || 0), 0)
  const grandReceived = projects.reduce((n, p) => n + (p.received || 0), 0)
  const grandSpent = projects.reduce((n, p) => n + (p.spent || 0), 0)

  return (
    <>
      {/* Hero — flagship Projects access */}
      <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white">
        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Business Dashboard</h1>
            <p className="text-white/80 mt-1">{today}</p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Link to="/projects" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 text-sm font-semibold hover:bg-white/90 transition-colors">
                <Briefcase className="w-4 h-4" /> Visit Projects
              </Link>
              <Link to="/map" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                <Map className="w-4 h-4" /> Site Map
              </Link>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{mods?.contractValueLabel ?? '—'}</p>
            <p className="text-white/80 text-sm">Total contract value</p>
          </div>
        </CardContent>
      </Card>

      {/* Row 1 — Executive KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <Kpi icon={<Wallet className="w-5 h-5" />} label="Total Contract Value" value={mods?.contractValueLabel ?? '—'} tone="bg-indigo-500/10 text-indigo-500" />
        <Kpi icon={<TrendingUp className="w-5 h-5" />} label="Revenue This Month" value={money(analytics?.billing.monthSale)} sub={monthDelta !== null ? `${monthDelta >= 0 ? '+' : ''}${monthDelta}%` : undefined} subTone={monthDelta !== null && monthDelta < 0 ? 'text-red-500' : 'text-emerald-500'} tone="bg-emerald-500/10 text-emerald-500" />
        <Kpi icon={<ClipboardList className="w-5 h-5" />} label="Pending Receivables" value={credit?.receivableLabel ?? '—'} sub={credit ? `(${credit.overdue.length} invoices)` : undefined} tone="bg-amber-500/10 text-amber-500" />
        <Kpi icon={<HardHat className="w-5 h-5" />} label="Active Sites" value={String(activeSites)} sub={`${analytics?.projects.length ?? 0} total`} tone="bg-cyan-500/10 text-cyan-500" />
      </div>

      {/* Row 2 — Operational KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Kpi icon={<FileCheck2 className="w-5 h-5" />} label="Active Contracts" value={mods ? `${mods.activeContracts} / ${mods.contracts}` : '—'} sub="Running" tone="bg-violet-500/10 text-violet-500" />
        <Kpi icon={<Wrench className="w-5 h-5" />} label="Punch List / Touch-ups" value={String(openSnags)} sub={clearedSnags !== null ? `${clearedSnags} cleared` : undefined} tone="bg-orange-500/10 text-orange-500" />
        <Kpi icon={<Users className="w-5 h-5" />} label="Workforce On Site" value={String(labour?.totalWorkers ?? 0)} sub={labour?.totalPresentLabel ? `${labour.totalPresentLabel} present` : undefined} tone="bg-sky-500/10 text-sky-500" />
        <Kpi icon={<Fuel className="w-5 h-5" />} label="Fuel Expense" value={mods?.fuelSpendMonthLabel ?? '—'} sub="This month" tone="bg-rose-500/10 text-rose-500" />
      </div>

      {/* Mid-page grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* 1. Revenue & cash flow trends */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Revenue &amp; Cash Flow Trends</CardTitle></CardHeader>
          <CardContent>
            {saleTotals.length === 0 && expTotals.length === 0 ? (
              <Empty title="No monthly data yet" description="Sales and expenses will appear here" />
            ) : (
              <GroupedBars sales={saleTotals} expenses={expTotals} />
            )}
          </CardContent>
        </Card>

        {/* 2. Material & stock alerts */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Material &amp; Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            {lowStockRows.length === 0 && (procurementPending ?? 0) === 0 ? (
              <Empty title="No stock alerts" description="Low-stock items and pending orders will appear here" />
            ) : (
              <ul className="space-y-3">
                {lowStockRows.map((r, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-sm text-text flex-1">{r.name} stock low</span>
                    <span className="text-xs text-muted">{r.stockLabel}</span>
                  </li>
                ))}
                {procurementPending !== null && procurementPending > 0 && (
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-sm text-text flex-1">{procurementPending} Material Purchase Orders pending</span>
                    <Link to="/modules" className="text-xs text-primary hover:underline">View</Link>
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 3. Upcoming milestones */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlarmClock className="w-5 h-5 text-primary" /> Upcoming Milestones &amp; Deliverables</CardTitle></CardHeader>
          <CardContent>
            {upcomingMilestones.length === 0 ? (
              <Empty title="No upcoming milestones" />
            ) : (
              <ul className="space-y-3">
                {upcomingMilestones.map((m) => {
                  const days = Math.ceil((new Date(m.dueDate).getTime() - Date.now()) / 86400000)
                  return (
                    <li key={m.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{m.title}</p>
                        <p className="text-xs text-muted">{money(m.amount)}</p>
                      </div>
                      <Badge variant={days < 0 ? 'danger' : days <= 3 ? 'warning' : 'outline'} size="sm">
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `In ${days} days`}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 4. Live site activity feed */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ActivityIcon className="w-5 h-5 text-primary" /> Live Site Activity Feed</CardTitle></CardHeader>
          <CardContent>
            {!activity || activity.length === 0 ? (
              <Empty title="No recent activity" />
            ) : (
              <ul className="space-y-3">
                {activity.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text">{a.detail || a.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" size="sm">{a.source}</Badge>
                        <span className="text-xs text-muted">{a.timeLabel}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main data table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Site Breakdown &amp; Detailed Financials</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {projects.length === 0 ? (
            <div className="p-6"><Empty title="No projects yet" description="Create a project to see the site breakdown here" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-3 font-medium">Site Name</th>
                  <th className="px-4 py-3 font-medium text-right">Entries</th>
                  <th className="px-4 py-3 font-medium text-right">Total Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Budget Spent</th>
                  <th className="px-4 py-3 font-medium">Completion %</th>
                  <th className="px-4 py-3 font-medium">Lead Engineer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/projects/${p.id}`} className="font-medium text-primary hover:underline inline-flex items-center gap-1">
                        {p.name} <ArrowRight className="w-3 h-3" />
                      </Link>
                      <p className="text-xs text-muted">{p.valueLabel}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-muted">{p.entries ?? 0}</td>
                    <td className="px-4 py-3 text-right font-medium">{p.receivedLabel}</td>
                    <td className="px-4 py-3 text-right">{p.spentLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-surface2 overflow-hidden min-w-16">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, p.taskPct)}%` }} />
                        </div>
                        <span className="text-xs text-muted w-10 text-right">{p.pctLabel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.lead || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_TONE[p.status] || 'outline'} size="sm">{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-surface/40">
                  <td className="px-4 py-3 font-semibold text-text">GRAND TOTAL</td>
                  <td className="px-4 py-3 text-right font-semibold">{grandEntries}</td>
                  <td className="px-4 py-3 text-right font-semibold">{money(grandReceived)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{money(grandSpent)}</td>
                  <td className="px-4 py-3" colSpan={3} />
                </tr>
              </tfoot>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function Kpi({ label, value, sub, subTone, icon, tone }: {
  label: string; value: string; sub?: string; subTone?: string; icon: React.ReactNode; tone: string
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-text mt-1 truncate">{value}</p>
          {sub && <p className={cn('text-xs mt-0.5', subTone ?? 'text-muted')}>{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tone)}>{icon}</div>
      </CardContent>
    </Card>
  )
}

function GroupedBars({ sales, expenses }: { sales: { period: string; total: number }[]; expenses: { period: string; total: number }[] }) {
  const periods = Array.from(new Set([...sales.map((s) => s.period), ...expenses.map((e) => e.period)])).slice(-6)
  const all = [...sales.map((s) => s.total), ...expenses.map((e) => e.total)]
  const max = Math.max(1, ...all)
  return (
    <div>
      <div className="flex items-end gap-2 h-40">
        {periods.map((period) => {
          const s = sales.find((x) => x.period === period)?.total ?? 0
          const e = expenses.find((x) => x.period === period)?.total ?? 0
          return (
            <div key={period} className="flex flex-1 flex-col items-center gap-1 justify-end h-full">
              <div className="flex items-end gap-1 w-full justify-center">
                <div className={cn('w-2.5 sm:w-3.5 rounded-t-sm bg-emerald-500')} style={{ height: `${Math.max(4, (s / max) * 100)}%` }} title={`Sales ${period}: ${money(s)}`} />
                <div className={cn('w-2.5 sm:w-3.5 rounded-t-sm bg-rose-400')} style={{ height: `${Math.max(4, (e / max) * 100)}%` }} title={`Expenses ${period}: ${money(e)}`} />
              </div>
              <span className="text-[10px] text-muted">{period}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Sales</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Expenses</span>
      </div>
    </div>
  )
}
