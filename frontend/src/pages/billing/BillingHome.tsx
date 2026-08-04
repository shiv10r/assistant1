import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import type { BizTxn, BillingKpis, Party } from '../../api'
import { Badge, Empty, money, shortDate, PageHead } from '../../ui'

const TYPE_BADGE: Record<string, 'green' | 'pink' | 'gray' | 'accent'> = {
  SALE: 'green', PURCHASE: 'pink', SALE_RETURN: 'pink', PURCHASE_RETURN: 'green',
  PAYMENT_IN: 'green', PAYMENT_OUT: 'pink', ESTIMATE: 'gray', SALE_ORDER: 'accent',
  PURCHASE_ORDER: 'gray', DELIVERY_CHALLAN: 'accent',
}
export const txnTypeLabel = (t: string) =>
  t === 'SALE' ? 'Sale' : t === 'PURCHASE' ? 'Purchase' : t === 'SALE_RETURN' ? 'Sale Return'
  : t === 'PURCHASE_RETURN' ? 'Purchase Return' : t === 'PAYMENT_IN' ? 'Payment-In'
  : t === 'PAYMENT_OUT' ? 'Payment-Out' : t === 'ESTIMATE' ? 'Estimate' : t === 'SALE_ORDER' ? 'Sale Order'
  : t === 'PURCHASE_ORDER' ? 'Purchase Order' : t === 'DELIVERY_CHALLAN' ? 'Delivery Challan' : t

export default function BillingHome() {
  const [kpis, setKpis] = useState<BillingKpis | null>(null)
  const [tab, setTab] = useState<'txns' | 'parties'>('txns')
  const [txns, setTxns] = useState<BizTxn[]>([])
  const [parties, setParties] = useState<Party[]>([])

  const load = () => {
    api.billing.kpis().then(setKpis).catch(() => setKpis(null))
    api.billing.txns().then(setTxns).catch(() => setTxns([]))
    api.billing.parties().then(setParties).catch(() => setParties([]))
  }
  useEffect(load, [])

  return (
    <>
      <PageHead
        icon="🧾" title="Billing" sub="Vyapar-style billing"
        right={<Link className="btn" style={{ textDecoration: 'none' }} to="/billing/sale">＋ Add New {tab === 'txns' ? 'Sale' : 'Party'}</Link>}
      />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">YOU'LL GET</div><div className="kpi-value" style={{ color: '#2E8B57' }}>{money(kpis?.youllGet)}</div></div>
        <div className="kpi"><div className="kpi-label">YOU'LL GIVE</div><div className="kpi-value" style={{ color: '#E05C7A' }}>{money(kpis?.youllGive)}</div></div>
        <div className="kpi"><div className="kpi-label">THIS MONTH'S SALE</div><div className="kpi-value accent">{money(kpis?.monthSale)}</div></div>
      </div>

      <div className="tabs">
        <button className={tab === 'txns' ? 'active' : ''} onClick={() => setTab('txns')}>Transaction Details</button>
        <button className={tab === 'parties' ? 'active' : ''} onClick={() => setTab('parties')}>Party Details</button>
      </div>

      {tab === 'txns' ? (
        txns.length === 0 ? <Empty>No transactions yet — tap "Add New Sale".</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Party</th><th>Type</th><th>Ref</th><th>Date</th><th className="num">Total</th><th className="num">Balance</th></tr></thead>
              <tbody>
                {txns.map((tx) => (
                  <tr key={tx.id}>
                    <td className="cat">{tx.partyName || 'Cash'}</td>
                    <td><Badge tone={TYPE_BADGE[tx.type]}>{txnTypeLabel(tx.type)}</Badge></td>
                    <td className="muted">{tx.prefix || '#'}{tx.refNo}</td>
                    <td className="muted">{shortDate(tx.date)}</td>
                    <td className="num">{money(tx.total)}</td>
                    <td className="num" style={{ color: tx.balance > 0 ? '#E05C7A' : 'var(--dim)' }}>{money(tx.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        parties.length === 0 ? <Empty>No parties yet — tap "Add New Party".</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Party</th><th>Phone</th><th className="num">Balance</th><th>Direction</th></tr></thead>
              <tbody>
                {parties.map((p) => (
                  <tr key={p.id}>
                    <td className="cat">{p.name}</td>
                    <td className="muted">{p.phone || '—'}</td>
                    <td className="num" style={{ color: p.currentBalance >= 0 ? '#2E8B57' : '#E05C7A' }}>{money(Math.abs(p.currentBalance))}</td>
                    <td><Badge tone={p.currentBalance >= 0 ? 'green' : 'pink'}>{p.currentBalance >= 0 ? "You'll Get" : "You'll Give"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  )
}