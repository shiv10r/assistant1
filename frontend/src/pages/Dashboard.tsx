import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { Dashboard as D, ModuleSummary } from '../api'

export default function Dashboard() {
  const [data, setData] = useState<D | null>(null)
  const [mods, setMods] = useState<ModuleSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(String(e)))
    api.modules.summary().then(setMods).catch(() => setMods(null))
  }, [])

  if (error) return <div className="empty">⚠️ Could not reach the API. Start the backend, then refresh. <br/><span className="muted">{error}</span></div>
  if (!data) return <div className="empty">Loading…</div>

  return (
    <>
      <div className="page-head"><div><h1>Dashboard</h1><div className="muted">Your interiors business at a glance</div></div></div>

      {data.isEmpty ? (
        <div className="empty card">🛋️ No expenses yet — tell the assistant on the <Link to="/">Assistant</Link> page, e.g. "site A paint exp = 5k".</div>
      ) : (
        <>
          <div className="kpis">
            <div className="kpi"><div className="kpi-label">TODAY</div><div className="kpi-value">{data.todayLabel}</div></div>
            <div className="kpi"><div className="kpi-label">THIS MONTH</div><div className="kpi-value">{data.monthLabel}</div></div>
            <div className="kpi"><div className="kpi-label">GRAND TOTAL</div><div className="kpi-value accent">{data.grandTotalLabel}</div></div>
            <div className="kpi"><div className="kpi-label">ACTIVE SITES</div><div className="kpi-value">{data.siteCount}</div></div>
          </div>

          <div className="card">
            <h2>By Site</h2>
            <table className="main-table">
              <thead><tr><th>Site</th><th>Entries</th><th className="num">Total</th></tr></thead>
              <tbody>
                {data.groups.map((g) => (
                  <tr key={g.site}><td className="cat">{g.site}</td><td className="muted">{g.count}</td><td className="num">{g.totalLabel}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={2}>GRAND TOTAL</td><td className="num total">{data.grandTotalLabel}</td></tr></tfoot>
            </table>
          </div>
        </>
      )}

      {mods && (
        <div className="card">
          <h2><Link to="/modules" style={{ textDecoration: 'none' }}>Business Modules</Link></h2>
          <div className="kpis">
            <div className="kpi"><div className="kpi-label">ACTIVE CONTRACTS</div><div className="kpi-value">{mods.activeContracts} / {mods.contracts}</div></div>
            <div className="kpi"><div className="kpi-label">OPEN SNAGS</div><div className="kpi-value">{mods.openSnags}{mods.overdueSnags > 0 ? <span className="kpi-label" style={{ color: '#dc2626' }}> ({mods.overdueSnags} overdue)</span> : null}</div></div>
            <div className="kpi"><div className="kpi-label">CONTRACT VALUE</div><div className="kpi-value accent">{mods.contractValueLabel}</div></div>
            <div className="kpi"><div className="kpi-label">FUEL THIS MONTH</div><div className="kpi-value">{mods.fuelSpendMonthLabel}</div></div>
          </div>
        </div>
      )}
    </>
  )
}