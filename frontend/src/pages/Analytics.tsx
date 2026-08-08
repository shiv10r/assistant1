import { useEffect, useState } from 'react'
import { api } from '../api'
import type { AnalyticsData } from '../api'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.analytics().then(setData).catch((e) => setError(String(e)))
  }, [])

  if (error) return <div className="empty">⚠️ Could not load analytics. <br/><span className="muted">{error}</span></div>
  if (!data) return <div className="empty">Loading…</div>

  const maxSale = Math.max(1, ...data.salesByMonth.map((s) => s.total))
  const maxExp = Math.max(1, ...data.expenseByMonth.map((s) => s.total))

  return (
    <>
      <div className="page-head"><div><h1>Analytics</h1><div className="muted">Projects, billing and spend at a glance</div></div></div>

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">YOU'LL GET</div><div className="kpi-value accent">{inr.format(data.billing.youllGet)}</div></div>
        <div className="kpi"><div className="kpi-label">YOU'LL GIVE</div><div className="kpi-value">{inr.format(data.billing.youllGive)}</div></div>
        <div className="kpi"><div className="kpi-label">THIS MONTH'S SALES</div><div className="kpi-value">{inr.format(data.billing.monthSale)}</div></div>
      </div>

      <div className="card">
        <h2>Project progress &amp; budget</h2>
        {data.projects.length === 0 ? (
          <div className="muted">No projects yet.</div>
        ) : (
          <table className="main-table">
            <thead><tr><th>Project</th><th>Status</th><th className="num">Spent</th><th>Budget used</th></tr></thead>
            <tbody>
              {data.projects.map((p) => (
                <tr key={p.name}>
                  <td className="cat">{p.name}</td>
                  <td className="muted">{p.status}</td>
                  <td className="num">{p.spentLabel}</td>
                  <td>
                    <div className="progress-row">
                      <div className="bar"><div className="fill" style={{ width: `${p.budgetPct}%` }} /></div>
                      <span className="muted">{p.pctLabel}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card-grid">
        <div className="card">
          <h2>Sales by month</h2>
          {data.salesByMonth.length === 0 ? (
            <div className="muted">No sales yet.</div>
          ) : (
            <div className="bar-chart">
              {data.salesByMonth.map((s) => (
                <div className="chart-col" key={s.period} title={`${s.period}: ${inr.format(s.total)}`}>
                  <div className="chart-value">{Math.round(s.total / 1000)}k</div>
                  <div className="chart-bar" style={{ height: `${Math.max(4, (s.total / maxSale) * 100)}%` }} />
                  <div className="chart-label">{s.period}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Expenses by month</h2>
          {data.expenseByMonth.length === 0 ? (
            <div className="muted">No expenses logged.</div>
          ) : (
            <div className="bar-chart">
              {data.expenseByMonth.map((s) => (
                <div className="chart-col" key={s.period} title={`${s.period}: ${inr.format(s.total)}`}>
                  <div className="chart-value">{Math.round(s.total / 1000)}k</div>
                  <div className="chart-bar alt" style={{ height: `${Math.max(4, (s.total / maxExp) * 100)}%` }} />
                  <div className="chart-label">{s.period}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
