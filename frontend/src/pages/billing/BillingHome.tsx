import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import type { BizTxn, BillingKpis, Party, CatalogItem, CashData, BankAccount } from '../../api'
import { Badge, Empty, money, shortDate, PageHead, inputStyle, ghostStyle } from '../../ui'
import { useToast } from '../../components/ui/Toast'

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

export default function BillingHome({ initialTab = 'txns' }: { initialTab?: 'txns' | 'parties' }) {
  const { toast } = useToast()
  const [kpis, setKpis] = useState<BillingKpis | null>(null)
  const [tab, setTab] = useState<'txns' | 'parties'>(initialTab)
  const [txns, setTxns] = useState<BizTxn[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [cash, setCash] = useState<CashData | null>(null)
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [q, setQ] = useState('')

  const load = () => {
    api.billing.kpis().then(setKpis).catch(() => setKpis(null))
    api.billing.txns().then(setTxns).catch(() => setTxns([]))
    api.billing.parties().then(setParties).catch(() => setParties([]))
    api.billing.items().then(setItems).catch(() => setItems([]))
    api.billing.cash().then(setCash).catch(() => setCash(null))
    api.billing.banks().then(setBanks).catch(() => setBanks([]))
  }
  useEffect(load, [])

  const lowStock = items.filter((i) => i.type !== 'Service' && i.minStock > 0 && i.stockQty <= i.minStock)
  const bankTotal = banks.reduce((s, b) => s + b.openingBalance, 0)

  const query = q.trim().toLowerCase()
  const filteredTxns = query
    ? txns.filter((t) =>
        (t.partyName || '').toLowerCase().includes(query) ||
        (t.prefix || '').toLowerCase().includes(query) ||
        String(t.refNo).includes(query) ||
        txnTypeLabel(t.type).toLowerCase().includes(query))
    : txns
  const filteredParties = query
    ? parties.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        (p.phone || '').toLowerCase().includes(query) ||
        (p.email || '').toLowerCase().includes(query))
    : parties

  const removeTxn = async (t: BizTxn) => {
    if (!confirm(`Delete ${txnTypeLabel(t.type)} ${t.refNo ? '#' + t.refNo : ''} — ${t.partyName || 'Walk-in'} (${money(t.total)})?`)) return
    try {
      await api.billing.deleteTxn(t.id)
      load()
      toast({ title: 'Transaction deleted', description: `${t.partyName || 'Walk-in'} ${money(t.total)}`, variant: 'error' })
    } catch (e) { toast({ title: 'Could not delete transaction', description: String(e), variant: 'error' }) }
  }

  const removeParty = async (p: Party) => {
    if (!confirm(`Delete party "${p.name}"?`)) return
    try {
      await api.billing.deleteParty(p.id)
      load()
      toast({ title: 'Party deleted', description: p.name, variant: 'error' })
    } catch (e) {
      const msg = String(e).replace(/^API error \d+: /, '').trim()
      toast({ title: 'Could not delete party', description: msg || String(e), variant: 'error' })
    }
  }

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
        <div className="kpi"><div className="kpi-label">CASH IN HAND</div><div className="kpi-value">{money(cash?.balance)}</div></div>
      </div>

      <div className="quick-actions">
        <Link to="/billing/sale" className="qa-btn">＋ Sale</Link>
        <Link to="/billing/sale" className="qa-btn alt">＋ Purchase</Link>
        <Link to="/billing/sale" className="qa-btn alt2">＋ Estimate</Link>
        <Link to="/billing/party" className="qa-btn alt3">＋ Party</Link>
      </div>

      {(lowStock.length > 0 || banks.length > 0) && (
        <div className="card-grid" style={{ marginBottom: 16 }}>
          {lowStock.length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <h2>Low stock</h2>
              {lowStock.map((i) => (
                <div className="backup-row" key={i.id}>
                  <span>{i.name}</span>
                  <span className="muted">{i.stockQty} {i.unit} left (min {i.minStock})</span>
                </div>
              ))}
            </div>
          )}
          {banks.length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <h2>Bank balance</h2>
              {banks.map((b) => (
                <div className="backup-row" key={b.id}>
                  <span>{b.name}</span>
                  <span>{money(b.openingBalance)}</span>
                </div>
              ))}
              <div className="backup-row"><b>Total</b><b>{money(bankTotal)}</b></div>
            </div>
          )}
        </div>
      )}

      <div className="tabs">
        <button className={tab === 'txns' ? 'active' : ''} onClick={() => setTab('txns')}>Transaction Details</button>
        <button className={tab === 'parties' ? 'active' : ''} onClick={() => setTab('parties')}>Party Details</button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={tab === 'txns' ? 'Search transactions (party, ref, type)…' : 'Search parties (name, phone, email)…'}
        style={{ ...inputStyle, width: '100%', margin: '8px 0 16px' }}
      />

      {tab === 'txns' ? (
        filteredTxns.length === 0 ? <Empty>{q ? `No transactions match "${q}".` : 'No transactions yet — tap "Add New Sale".'}</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Party</th><th>Type</th><th>Ref</th><th>Date</th><th className="num">Total</th><th className="num">Balance</th><th /></tr></thead>
              <tbody>
                {filteredTxns.map((tx) => (
                  <tr key={tx.id}>
                    <td className="cat">{tx.partyName || 'Cash'}</td>
                    <td><Badge tone={TYPE_BADGE[tx.type]}>{txnTypeLabel(tx.type)}</Badge></td>
                    <td className="muted">{tx.prefix || '#'}{tx.refNo}</td>
                    <td className="muted">{shortDate(tx.date)}</td>
                    <td className="num">{money(tx.total)}</td>
                    <td className="num" style={{ color: tx.balance > 0 ? '#E05C7A' : 'var(--dim)' }}>{money(tx.balance)}</td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <Link to={`/billing/sale?id=${tx.id}`} style={ghostStyle} title="Edit">✎</Link>{' '}
                      <button style={ghostStyle} onClick={() => removeTxn(tx)} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="muted" style={{ padding: '8px 12px' }}>{filteredTxns.length} transaction{filteredTxns.length === 1 ? '' : 's'}{q ? ` matching "${q}"` : ''}.</div>
          </div>
        )
      ) : (
        filteredParties.length === 0 ? <Empty>{q ? `No parties match "${q}".` : 'No parties yet — tap "Add New Party".'}</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Party</th><th>Phone</th><th className="num">Balance</th><th>Direction</th><th /></tr></thead>
              <tbody>
                {filteredParties.map((p) => (
                  <tr key={p.id}>
                    <td className="cat">{p.name}</td>
                    <td className="muted">{p.phone || '—'}</td>
                    <td className="num" style={{ color: p.currentBalance >= 0 ? '#2E8B57' : '#E05C7A' }}>{money(Math.abs(p.currentBalance))}</td>
                    <td><Badge tone={p.currentBalance >= 0 ? 'green' : 'pink'}>{p.currentBalance >= 0 ? "You'll Get" : "You'll Give"}</Badge></td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <Link to={`/billing/party?id=${p.id}`} style={ghostStyle} title="Edit">✎</Link>{' '}
                      <button style={ghostStyle} onClick={() => removeParty(p)} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="muted" style={{ padding: '8px 12px' }}>{filteredParties.length} part{filteredParties.length === 1 ? 'y' : 'ies'}{q ? ` matching "${q}"` : ''}.</div>
          </div>
        )
      )}
    </>
  )
}
