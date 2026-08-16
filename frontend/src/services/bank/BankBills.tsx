import { useState } from 'react'
import { CheckCircle2, Receipt } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_BILLS, bankFormatDate } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

export default function BankBills() {
  const store = useBankStore()
  const [paid, setPaid] = useState<string[]>([])

  const bills = BANK_BILLS.map((bill) => paid.includes(bill.id) ? { ...bill, status: 'paid' as const } : bill)
  const dueTotal = bills.filter((bill) => bill.status === 'due').reduce((total, bill) => total + bill.amount, 0)

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><Receipt aria-hidden="true" /> Bill payments</h1>
          <p>Pay utilities and bills from your accounts. Provider integrations plug in later.</p>
        </div>

        <div className="bank-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div className="bank-account-label">Total due</div>
            <div className="bank-account-balance" style={{ fontSize: 26, marginTop: 4 }}>{money(dueTotal)}</div>
          </div>
          <div className="bank-secure-chip"><CheckCircle2 aria-hidden="true" /> Backend-verified payments</div>
        </div>

        <div className="bank-card">
          <h2>Bills</h2>
          <div className="bank-list-rows">
            {bills.map((bill) => (
              <div key={bill.id} className="bank-list-row">
                <div className="bank-list-row-main">
                  <div className="bank-list-row-title">{bill.provider} <span style={{ fontWeight: 700, color: 'var(--bank-muted)' }}>· {bill.category}</span></div>
                  <div className="bank-list-row-sub">Ref {bill.accountRef} · due {bankFormatDate(bill.dueDate)}</div>
                </div>
                <div className="bank-list-row-right">
                  <strong>{money(bill.amount)}</strong>
                  <small><span className={`bank-status is-${bill.status}`}>{bill.status}</span></small>
                </div>
                {bill.status === 'due' ? (
                  <button type="button" className="bank-btn" onClick={() => setPaid([...paid, bill.id])}>Pay now</button>
                ) : (
                  <span className="bank-secure-chip"><CheckCircle2 aria-hidden="true" /> Paid</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BankShell>
  )
}