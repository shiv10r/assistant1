import { useEffect, useState } from 'react'
import { api } from '../api'
import type { BillingKpis, Party, CatalogItem } from '../api'

export default function Billing() {
  const [kpis, setKpis] = useState<BillingKpis | null>(null)
  const [parties, setParties] = useState<Party[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])

  useEffect(() => {
    api.billingKpis().then(setKpis).catch(() => setKpis(null))
    api.parties().then(setParties).catch(() => setParties([]))
    api.items().then(setItems).catch(() => setItems([]))
  }, [])

  return (
    <>
      <div className="page-head"><div><h1>🧾 Billing</h1><div className="muted">Vyapar-style billing</div></div></div>

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">YOU'LL GET</div><div className="kpi-value">{money(kpis?.youllGet)}</div></div>
        <div className="kpi"><div className="kpi-label">YOU'LL GIVE</div><div className="kpi-value">{money(kpis?.youllGive)}</div></div>
        <div className="kpi"><div className="kpi-label">THIS MONTH'S SALE</div><div className="kpi-value accent">{money(kpis?.monthSale)}</div></div>
      </div>

      <div className="card">
        <h2>📦 Items ({items.length})</h2>
        {items.length === 0 ? <div className="empty">No items yet — they're created in the Windows/mobile app.</div> : (
          <table className="main-table"><thead><tr><th>Item</th></tr></thead>
            <tbody>{items.map((i) => <tr key={i.id}><td>{i.name}</td></tr>)}</tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>👥 Parties ({parties.length})</h2>
        {parties.length === 0 ? <div className="empty">No parties yet — they're created in the Windows/mobile app.</div> : (
          <table className="main-table"><thead><tr><th>Name</th></tr></thead>
            <tbody>{parties.map((p) => <tr key={p.id}><td>{p.name}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </>
  )
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const money = (n?: number) => (n == null ? '₹0' : inr.format(n))