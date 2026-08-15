import { useEffect, useState } from 'react'
import { api } from '../api'
import type { AnalyticsData } from '../api'
import { PageHead } from '../ui'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Empty, money } from '../components/ui'
import { usePlan } from '../hooks/usePlan'
import { TrendingUp, TrendingDown, BarChart3, Wallet, Lock, Crown } from 'lucide-react'
import { cn } from '../lib/utils'
import { useViewMode } from '../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../components/AdvancedPanel'

const STATUS_TONE: Record<string, 'default' | 'success' | 'info' | 'warning' | 'outline' | 'danger'> = {
  'In Discussion': 'info',
  'Not Started': 'outline',
  Ongoing: 'default',
  'On Hold': 'warning',
  Completed: 'success',
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState('')
  const { isPremium, plan, setPlan } = usePlan()
  const { isAdvanced } = useViewMode()

  useEffect(() => {
    api.analytics().then(setData).catch((e) => setError(String(e)))
  }, [])

  if (error) return <div className="empty">⚠️ Could not load analytics. <br/><span className="muted">{error}</span></div>
  if (!data) return <div className="empty">Loading…</div>

  const maxSale = Math.max(1, ...data.salesByMonth.map((s) => s.total))
  const maxExp = Math.max(1, ...data.expenseByMonth.map((s) => s.total))

  return (
    <>
      <PageHead
        icon="📊"
        title="Analytics"
        sub="Projects, billing and spend at a glance"
        right={<Badge variant={isPremium ? 'success' : 'outline'}>{isPremium ? `${plan} plan` : 'Free plan'}</Badge>}
      />

      {!isPremium && (
        <Card className="mb-6 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Lock className="w-5 h-5" /></div>
              <div>
                <p className="font-semibold text-text">Monthly charts are a Pro feature</p>
                <p className="text-sm text-muted">Upgrade to unlock month-by-month sales & expense charts.</p>
              </div>
            </div>
            <Button onClick={() => setPlan('pro')}><Crown className="w-4 h-4" /> Activate Pro (free trial)</Button>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Kpi label="You'll Get" value={money(data.billing.youllGet)} tone="emerald" icon={<TrendingUp className="w-5 h-5" />} />
        <Kpi label="You'll Give" value={money(data.billing.youllGive)} tone="red" icon={<TrendingDown className="w-5 h-5" />} />
        <Kpi label="This Month's Sales" value={money(data.billing.monthSale)} tone="indigo" icon={<Wallet className="w-5 h-5" />} />
      </div>

      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Project portfolio and revenue mix — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: "You'll get", value: money(data.billing.youllGet), delta: 'receivables', deltaTone: 'flat' },
            { label: "You'll give", value: money(data.billing.youllGive), delta: 'payables', deltaTone: 'flat' },
            { label: 'Month sales', value: money(data.billing.monthSale), delta: 'this month', deltaTone: 'flat' },
            { label: 'Projects', value: String(data.projects.length), delta: 'portfolio', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Projects by status</p>
              <BarChart
                data={Array.from(new Set(data.projects.map((p) => p.status)))
                  .map((s) => ({ label: s, value: data.projects.filter((p) => p.status === s).length }))}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Budget used by project</p>
              <DonutChart
                data={data.projects.slice(0, 6).map((p, i) => ({ label: p.name.slice(0, 14), value: p.budgetPct, color: ['var(--primary)', '#f59e0b', '#3b82f6', '#a78bfa', '#10b981', '#ef4444'][i] }))}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      {/* Project progress & budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Project progress &amp; budget</CardTitle>
        </CardHeader>
        <CardContent>
          {data.projects.length === 0 ? (
            <Empty title="No projects yet" description="Create a project to see progress tracking here" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted text-xs uppercase tracking-wider border-b border-border">
                    <th className="pb-2 font-medium">Project</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Spent</th>
                    <th className="pb-2 font-medium">Budget used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.projects.map((p) => (
                    <tr key={p.name}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-text">{p.name}</p>
                        <p className="text-xs text-muted">{p.valueLabel}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_TONE[p.status] || 'outline'} size="sm">{p.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">{p.spentLabel}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-surface2 overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, p.budgetPct)}%` }} />
                          </div>
                          <span className="text-xs text-muted w-10 text-right">{p.pctLabel}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly charts */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by month</CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesByMonth.length === 0 ? (
              <Empty title="No sales yet" />
            ) : (
              <Chart data={data.salesByMonth} max={maxSale} color="bg-primary" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by month</CardTitle>
          </CardHeader>
          <CardContent>
            {data.expenseByMonth.length === 0 ? (
              <Empty title="No expenses logged" />
            ) : (
              <Chart data={data.expenseByMonth} max={maxExp} color="bg-accent" />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Chart({ data, max, color }: { data: { period: string; total: number }[]; max: number; color: string }) {
  return (
    <div className="flex items-end gap-3 h-44">
      {data.map((s) => (
        <div key={s.period} className="flex flex-1 flex-col items-center gap-1.5 justify-end h-full" title={`${s.period}: ${money(s.total)}`}>
          <span className="text-[10px] text-muted">{s.total >= 1000 ? `${Math.round(s.total / 1000)}k` : Math.round(s.total)}</span>
          <div className={cn('w-full max-w-10 rounded-t-md', color)} style={{ height: `${Math.max(4, (s.total / max) * 100)}%` }} />
          <span className="text-[10px] text-muted">{s.period}</span>
        </div>
      ))}
    </div>
  )
}

function Kpi({ label, value, tone, icon }: { label: string; value: string; tone: 'emerald' | 'red' | 'indigo'; icon: React.ReactNode }) {
  const tones = {
    emerald: 'bg-emerald-500/10 text-emerald-500',
    red: 'bg-red-500/10 text-red-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
  }
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-2xl font-bold text-text mt-1">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', tones[tone])}>{icon}</div>
      </CardContent>
    </Card>
  )
}
