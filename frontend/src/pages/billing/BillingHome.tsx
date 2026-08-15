import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import type { BizTxn, BillingKpis, CatalogItem, CashData, BankAccount } from '../../api'
import { Badge, Empty, money, shortDate, PageHead, inputStyle, ghostStyle } from '../../ui'
import { useToast } from '../../components/ui/Toast'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

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
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()
  const [kpis, setKpis] = useState<BillingKpis | null>(null)
  const [txns, setTxns] = useState<BizTxn[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [cash, setCash] = useState<CashData | null>(null)
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [q, setQ] = useState('')

  const load = () => {
    api.billing.kpis().then(setKpis).catch(() => setKpis(null))
    api.billing.txns().then(setTxns).catch(() => setTxns([]))
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

  const removeTxn = async (t: BizTxn) => {
    if (!confirm(`Delete ${txnTypeLabel(t.type)} ${t.refNo ? '#' + t.refNo : ''} — ${t.partyName || 'Walk-in'} (${money(t.total)})?`)) return
    try {
      await api.billing.deleteTxn(t.id)
      load()
      toast({ title: 'Transaction deleted', description: `${t.partyName || 'Walk-in'} ${money(t.total)}`, variant: 'error' })
    } catch (e) { toast({ title: 'Could not delete transaction', description: String(e), variant: 'error' }) }
  }

  const sendEmail = async (t: BizTxn) => {
    try {
      const r = await api.integrations.emailInvoice(t.id)
      if (!r.ok) {
        toast({ title: 'Email not sent', description: r.message || r.error || 'Unknown error', variant: 'error' })
        return
      }
      toast({ title: 'Invoice emailed', description: `Sent to ${r.to}`, variant: 'success' })
    } catch (e) { toast({ title: 'Could not email invoice', description: String(e), variant: 'error' }) }
  }

  const sendWhatsApp = async (t: BizTxn) => {
    try {
      const r = await api.integrations.whatsappLink(t.id)
      if (!r.ok) {
        toast({ title: 'WhatsApp not available', description: r.error || 'Unknown error', variant: 'error' })
        return
      }
      window.open(r.url, '_blank', 'noopener')
    } catch (e) { toast({ title: 'Could not open WhatsApp', description: String(e), variant: 'error' }) }
  }

  const payOnline = async (t: BizTxn) => {
    try {
      const r = await api.integrations.razorpayPaymentLink(t.balance, `txn-${t.id}`)
      if (!r.ok) {
        toast({ title: 'Payment link failed', description: r.message || r.error || 'Unknown error', variant: 'error' })
        return
      }
      await navigator.clipboard.writeText(r.shortUrl || '')
      toast({ title: 'Payment link ready', description: 'Copied to clipboard — share it with the customer.', variant: 'success' })
    } catch (e) { toast({ title: 'Could not create payment link', description: String(e), variant: 'error' }) }
  }

  return (
    <>
      <PageHead
        icon="🧾" title="Billing" sub="Vyapar-style billing"
        right={<Link className="btn" style={{ textDecoration: 'none' }} to="/billing/sale">＋ Add New Sale</Link>}
      />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">YOU'LL GET</div><div className="kpi-value" style={{ color: '#2E8B57' }}>{money(kpis?.youllGet)}</div></div>
        <div className="kpi"><div className="kpi-label">YOU'LL GIVE</div><div className="kpi-value" style={{ color: '#E05C7A' }}>{money(kpis?.youllGive)}</div></div>
        <div className="kpi"><div className="kpi-label">THIS MONTH'S SALE</div><div className="kpi-value accent">{money(kpis?.monthSale)}</div></div>
        <div className="kpi"><div className="kpi-label">CASH IN HAND</div><div className="kpi-value">{money(cash?.balance)}</div></div>
      </div>

      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Cash position, receivables and txn mix — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: "You'll get", value: money(kpis?.youllGet), delta: 'receivables', deltaTone: 'flat' },
            { label: "You'll give", value: money(kpis?.youllGive), delta: 'payables', deltaTone: 'flat' },
            { label: 'Month sale', value: money(kpis?.monthSale), delta: 'this month', deltaTone: 'flat' },
            { label: 'Cash in hand', value: money(cash?.balance), delta: 'register', deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Transactions by type</p>
              <BarChart
                data={Array.from(new Set(txns.map((t) => t.type)))
                  .map((type) => ({ label: txnTypeLabel(type), value: txns.filter((t) => t.type === type).length }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 8)}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Value by txn type</p>
              <DonutChart
                data={Array.from(new Set(txns.map((t) => t.type)))
                  .map((type) => ({ label: txnTypeLabel(type), value: txns.filter((t) => t.type === type).reduce((s, t) => s + t.total, 0) }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 6)
                  .map((d, i) => ({ ...d, color: ['var(--primary)', '#f59e0b', '#3b82f6', '#a78bfa', '#10b981', '#ef4444'][i] }))}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      <div className="quick-actions">
        <Link to="/billing/sale" className="qa-btn">＋ Sale</Link>
        <Link to="/billing/sale" className="qa-btn alt">＋ Purchase</Link>
        <Link to="/billing/sale" className="qa-btn alt2">＋ Estimate</Link>
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

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search transactions (party, ref, type)…"
        style={{ ...inputStyle, width: '100%', margin: '8px 0 16px' }}
      />

      {filteredTxns.length === 0 ? <Empty>{q ? `No transactions match "${q}".` : 'No transactions yet — tap "Add New Sale".'}</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Party</th><th>Type</th><th>Ref</th><th>Date</th><th className="num">Total</th><th className="num">Balance</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filteredTxns.map((tx) => (
                  <tr key={tx.id}>
                    <td className="cat">{tx.partyName || 'Cash'}</td>
                    <td><Badge tone={TYPE_BADGE[tx.type]}>{txnTypeLabel(tx.type)}</Badge></td>
                    <td className="muted">{tx.prefix || '#'}{tx.refNo}</td>
                    <td className="muted">{shortDate(tx.date)}</td>
                    <td className="num">{money(tx.total)}</td>
                    <td className="num" style={{ color: tx.balance > 0 ? '#E05C7A' : 'var(--dim)' }}>{money(tx.balance)}</td>
                    <td>
                      {tx.balance <= 0 ? <Badge tone="green">Paid</Badge>
                        : tx.received > 0 ? <Badge tone="accent">Partial</Badge>
                        : <Badge tone="pink">Pending</Badge>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <Link to={`/billing/sale?id=${tx.id}`} style={ghostStyle} title="Edit">✎</Link>{' '}
                      {tx.balance > 0 && (['SALE', 'SALE_ORDER'].includes(tx.type)) && (
                        <>
                          <button style={ghostStyle} onClick={() => sendEmail(tx)} title="Email invoice">✉</button>{' '}
                          <button style={ghostStyle} onClick={() => sendWhatsApp(tx)} title="WhatsApp invoice">💬</button>{' '}
                          <button style={ghostStyle} onClick={() => payOnline(tx)} title="Copy payment link">🔗</button>{' '}
                        </>
                      )}
                      <button style={ghostStyle} onClick={() => removeTxn(tx)} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="muted" style={{ padding: '8px 12px' }}>{filteredTxns.length} transaction{filteredTxns.length === 1 ? '' : 's'}{q ? ` matching "${q}"` : ''}.</div>
          </div>
        )}
    </>
  )
}
