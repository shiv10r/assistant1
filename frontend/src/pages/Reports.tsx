import { useEffect, useState } from 'react'
import { api } from '../api'
import type { ReportData } from '../api'

const PERIODS = ['Today', 'Week', 'Month', 'All'] as const
type P = typeof PERIODS[number]

export default function Reports() {
  const [period, setPeriod] = useState<P>('Today')
  const [data, setData] = useState<ReportData | null>(null)
  const [dlErr, setDlErr] = useState('')

  useEffect(() => { api.report(period).then(setData).catch(() => setData(null)) }, [period])

  const q = period === 'Today' ? '' : `?period=${period.toLowerCase()}`
  const exportFile = (fmt: string) =>
    api.download(`/api/reports/export/${fmt}${q}`).catch((e) => setDlErr(String(e)))

  const maxCat = Math.max(1, ...(data?.categoryTotals.map((c) => c.total) ?? [0]))

  return (
    <>
      <div className="page-head">
        <div><h1>Reports</h1><div className="muted">{data?.periodLabel}</div></div>
        <div className="total-badge">
          <div className="amount">{data?.totalLabel ?? '₹0'}</div>
          <div className="entries">{data?.count ?? 0} entries</div>
        </div>
      </div>

      <div className="card">
        <div className="periods">
          {PERIODS.map((p) => (
            <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
        <div className="downloads">
          <a className="dl excel" onClick={(e) => { e.preventDefault(); exportFile('xlsx') }} href="#">Excel</a>
          <a className="dl pdf" onClick={(e) => { e.preventDefault(); exportFile('pdf') }} href="#">PDF</a>
          <a className="dl png" onClick={(e) => { e.preventDefault(); exportFile('png') }} href="#">PNG</a>
        </div>
        {dlErr && <div className="backup-msg err" style={{ marginTop: 10 }}>{dlErr}</div>}

        {!data || data.count === 0 ? (
          <div className="empty">No expenses for this period — tell the assistant!</div>
        ) : (
          <div className="table-wrap">
            <table className="main-table">
              <thead><tr><th>Date</th><th>Site</th><th>Client</th><th>Category</th><th className="num">Amount</th></tr></thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="muted">{r.dateLabel}</td><td>{r.site}</td><td className="muted">{r.client}</td>
                    <td className="cat">{r.category}</td><td className="num">{r.amountLabel}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={4}>TOTAL</td><td className="num total">{data.totalLabel}</td></tr></tfoot>
            </table>

            <h3>By category</h3>
            <div className="cat-bars">
              {data.categoryTotals.map((c) => (
                <div className="cat-bar-row" key={c.category}>
                  <div className="cat-bar-label">{c.category}<span className="muted"> · {c.count}</span></div>
                  <div className="cat-bar-track"><div className="cat-bar-fill" style={{ width: `${(c.total / maxCat) * 100}%` }} /></div>
                  <div className="cat-bar-value">{c.totalLabel}</div>
                </div>
              ))}
            </div>

            <table className="main-table">
              <thead><tr><th>Category</th><th>Entries</th><th className="num">Total</th></tr></thead>
              <tbody>
                {data.categoryTotals.map((c, i) => (
                  <tr key={i}><td className="cat">{c.category}</td><td className="muted">{c.count}</td><td className="num">{c.totalLabel}</td></tr>
                ))}
              </tbody>
            </table>

            <h3>By site</h3>
            <table className="main-table">
              <thead><tr><th>Site</th><th>Entries</th><th className="num">Total</th></tr></thead>
              <tbody>
                {data.siteTotals.map((s, i) => (
                  <tr key={i}><td className="cat">{s.category}</td><td className="muted">{s.count}</td><td className="num">{s.totalLabel}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
