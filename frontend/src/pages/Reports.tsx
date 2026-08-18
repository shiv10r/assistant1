import { useEffect, useState } from 'react'
import { api } from '../api'
import type { ReportData, ReportKpis } from '../api'
import { Card, CardContent, Badge, Empty } from '../components/ui'
import { usePlan } from '../hooks/usePlan'
import { cn } from '../lib/utils'
import {
  FiTrendingUp, FiMapPin, FiBriefcase, FiUsers, FiPackage, FiActivity, FiDollarSign, FiArrowDown,
  FiBarChart2
} from 'react-icons/fi'
import { IoWallet, IoSparkles } from 'react-icons/io5'
import { MdCalendarToday, MdWorkspacePremium, MdCurrencyRupee, MdVerifiedUser } from 'react-icons/md'
import { useViewMode } from '../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../components/AdvancedPanel'

const PERIODS = ['Today', 'Week', 'Month', 'All'] as const
type P = typeof PERIODS[number]

function Kpi({ label, value, sub, icon, tone }: { label: string; value: string; sub?: string; icon: React.ReactNode; tone?: 'default' | 'green' | 'red' | 'gold' }) {
  const tones = {
    default: 'bg-primary/10 text-primary',
    green: 'bg-emerald-500/10 text-emerald-500',
    red: 'bg-red-500/10 text-red-500',
    gold: 'bg-amber-500/10 text-amber-500',
  }
  return (
    <Card className="mb-0 report-kpi">
      <CardContent className="p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="report-kpi-label">{label}</p>
          <p className="report-kpi-value truncate">{value}</p>
          {sub && <p className="report-kpi-sub">{sub}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', tones[tone ?? 'default'])}>{icon}</div>
      </CardContent>
    </Card>
  )
}

export default function Reports() {
  const [period, setPeriod] = useState<P>('Today')
  const [data, setData] = useState<ReportData | null>(null)
  const [kpis, setKpis] = useState<ReportKpis | null>(null)
  const [dlErr, setDlErr] = useState('')
  const { isPremium } = usePlan()
  const { isAdvanced } = useViewMode()

  useEffect(() => {
    api.report(period).then(setData).catch(() => setData(null))
    api.reportKpis(period).then(setKpis).catch(() => setKpis(null))
  }, [period])

  const q = period === 'Today' ? '' : `?period=${period.toLowerCase()}`
  const exportFile = (fmt: string) =>
    api.download(`/api/reports/export/${fmt}${q}`).catch((e) => setDlErr(String(e)))

  const maxCat = Math.max(1, ...(data?.categoryTotals.map((c) => c.total) ?? [0]))

  const r = kpis?.report
  const a = kpis?.app

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports & Dashboard</h1>
          <div className="muted">{data?.periodLabel}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['xlsx', 'Excel'], ['pdf', 'PDF'], ['png', 'PNG'], ['csv', 'CSV']].map(([fmt, label]) => (
            <a
              key={fmt}
              className={cn('dl', fmt)}
              href="#"
              onClick={(e) => { e.preventDefault(); exportFile(fmt) }}
            >{label}</a>
          ))}
        </div>
      </div>
      {dlErr && <div className="backup-msg err" style={{ marginBottom: 12 }}>{dlErr}</div>}

      <div className="periods" style={{ marginBottom: 18 }}>
        {PERIODS.map((p) => (
          <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle={`Spend breakdown for ${data?.periodLabel ?? period} — toggled via the Simple/Advanced switch in the top bar.`}
          compare={[
            { label: 'Total spent', value: r?.totalLabel ?? '—', delta: `${r?.count ?? 0} entries`, deltaTone: 'flat' },
            { label: 'Avg per day', value: r?.avgPerDayLabel ?? '—', delta: 'this period', deltaTone: 'flat' },
            { label: 'Top category', value: r?.topCategory ?? '—', delta: r?.topCategoryLabel ?? '', deltaTone: 'flat' },
            { label: 'Top site', value: r?.topSite ?? '—', delta: r?.topSiteLabel ?? '', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Spend by category</p>
              <BarChart
                data={(data?.categoryTotals ?? []).map((c) => ({ label: c.category, value: c.total }))}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Spend by site</p>
              <DonutChart
                data={(data?.siteTotals ?? []).slice(0, 6).map((s, i) => ({ label: s.category, value: s.total, color: ['var(--primary)', '#f59e0b', '#3b82f6', '#a78bfa', '#10b981', '#ef4444'][i] }))}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      {/* Spending KPIs */}
      <div className="report-kpi-grid">
        <Kpi label="Total spent" value={r?.totalLabel ?? '—'} sub={r ? `${r.count} entries · ${r.siteCount} sites` : undefined} icon={<IoWallet className="w-5 h-5" />} />
        <Kpi label="Avg per day" value={r?.avgPerDayLabel ?? '—'} sub="this period" icon={<MdCalendarToday className="w-5 h-5" />} />
        <Kpi label="Top category" value={r?.topCategory ?? '—'} sub={r?.topCategoryLabel} icon={<FiTrendingUp className="w-5 h-5" />} tone="green" />
        <Kpi label="Top site" value={r?.topSite ?? '—'} sub={r?.topSiteLabel} icon={<FiMapPin className="w-5 h-5" />} tone="gold" />
        <Kpi label="Biggest entry" value={r?.biggestEntry?.label ?? '—'} sub={r?.biggestEntry ? `${r.biggestEntry.site} · ${r.biggestEntry.date}` : undefined} icon={<MdWorkspacePremium className="w-5 h-5" />} tone="red" />
        <Kpi label="Categories" value={String(r?.categoryCount ?? '—')} sub={`in ${r?.siteCount ?? '—'} sites`} icon={<FiBarChart2 className="w-5 h-5" />} />
      </div>

      {!isPremium && r && r.count > 0 && (
        <div className="report-pro-banner">
          <IoSparkles className="w-4 h-4" />
          <span>Charts and month-by-month trends unlock on the <b>Analytics</b> page with Pro.</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2 mt-6">
        {/* Detail table */}
        <Card>
          <CardContent className="p-5">
            <h2 className="report-section-title">Expenses this period</h2>
            {!data || data.count === 0 ? (
              <Empty title="No expenses for this period" description="Tell the assistant on the Chat page, e.g. 'site A paint exp = 5k'." />
            ) : (
              <>
                <div className="table-wrap">
                  <table className="main-table">
                    <thead><tr><th>Date</th><th>Site</th><th>Category</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      {data.rows.slice(0, 50).map((r2, i) => (
                        <tr key={i}>
                          <td className="muted">{r2.dateLabel}</td><td>{r2.site}</td>
                          <td className="cat">{r2.category}</td><td className="num">{r2.amountLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr><td colSpan={3}>TOTAL</td><td className="num total">{data.totalLabel}</td></tr></tfoot>
                  </table>
                </div>
                <div className="mt-3 text-xs text-muted">{data.count > 50 ? `Showing 50 of ${data.count} entries` : ''}</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Category + site bars */}
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="report-section-title">By category</h2>
              {!data || data.categoryTotals.length === 0 ? (
                <Empty title="No data" />
              ) : (
                <div className="cat-bars" style={{ marginBottom: 0 }}>
                  {data.categoryTotals.map((c) => (
                    <div className="cat-bar-row" key={c.category}>
                      <div className="cat-bar-label">{c.category}<span className="muted"> · {c.count}</span></div>
                      <div className="cat-bar-track"><div className="cat-bar-fill" style={{ width: `${(c.total / maxCat) * 100}%` }} /></div>
                      <div className="cat-bar-value">{c.totalLabel}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="report-section-title">By site</h2>
              {!data || data.siteTotals.length === 0 ? (
                <Empty title="No data" />
              ) : (
                <div className="cat-bars" style={{ marginBottom: 0 }}>
                  {data.siteTotals.map((s) => (
                    <div className="cat-bar-row" key={s.category}>
                      <div className="cat-bar-label">{s.category}<span className="muted"> · {s.count}</span></div>
                      <div className="cat-bar-track"><div className="cat-bar-fill fill-accent" style={{ width: `${(s.total / maxCat) * 100}%` }} /></div>
                      <div className="cat-bar-value">{s.totalLabel}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application analytics */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChartIcon />
            <h2 className="report-section-title m-0">Application analytics</h2>
            <Badge variant="outline" size="sm" className="ml-auto">{a?.lastActivity ? `Last activity ${a.lastActivity}` : ''}</Badge>
          </div>
          {!a ? (
            <Empty title="Loading analytics…" />
          ) : (
            <div className="report-app-grid">
              <AppKpi label="Projects" value={String(a.projectCount)} sub={`${a.ongoingProjects} ongoing · ${a.completedProjects} done`} icon={<FiBriefcase className="w-4 h-4" />} />
              <AppKpi label="Parties" value={String(a.partyCount)} sub="clients & suppliers" icon={<FiUsers className="w-4 h-4" />} />
              <AppKpi label="Catalog items" value={String(a.itemCount)} sub="products & services" icon={<FiPackage className="w-4 h-4" />} />
              <AppKpi label="Transactions" value={String(a.txnCount)} sub={`sales total ${a.saleTotalLabel}`} icon={<FiBarChart2 className="w-4 h-4" />} />
              <AppKpi label="Receivables" value={a.receivableLabel} sub="to collect from sales" icon={<FiDollarSign className="w-4 h-4" />} />
              <AppKpi label="Expenses all-time" value={a.expenseTotalLabel} sub={`${a.expenseCount} entries`} icon={<FiArrowDown className="w-4 h-4" />} />
              <AppKpi label="Accounts & users" value={String(a.userCount)} sub={`${a.sessionCount} active sessions`} icon={<MdVerifiedUser className="w-4 h-4" />} />
              <AppKpi label="Activity events" value={String(a.activityCount)} sub="recent audit trail" icon={<FiActivity className="w-4 h-4" />} />
              <AppKpi label="Cash & bank" value={String('tracked')} sub="ledger is live" icon={<MdCurrencyRupee className="w-4 h-4" />} />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function AppKpi({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="report-app-kpi">
      <div className="report-app-icon">{icon}</div>
      <div className="min-w-0">
        <p className="report-app-label">{label}</p>
        <p className="report-app-value truncate">{value}</p>
        <p className="report-app-sub truncate">{sub}</p>
      </div>
    </div>
  )
}

function BarChartIcon() {
  return (
    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}
