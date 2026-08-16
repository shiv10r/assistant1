import { Landmark } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_LOANS, bankFormatDate } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

export default function BankLoans() {
  const store = useBankStore()

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><Landmark aria-hidden="true" /> Loans</h1>
          <p>Overview of active loans, outstanding balances, EMIs and repayment schedules.</p>
        </div>

        <div className="bank-grid">
          {BANK_LOANS.map((loan) => {
            const paidPercent = Math.min(100, Math.round((loan.paidMonths / loan.tenureMonths) * 100))
            return (
              <div key={loan.id} className="bank-product-card">
                <h3>
                  <Landmark aria-hidden="true" />
                  {loan.type}
                  <span className={`bank-status is-${loan.status}`}>{loan.status}</span>
                </h3>
                <div className="bank-product-rows">
                  <div className="bank-product-row"><span>Original amount</span><strong>{money(loan.originalAmount)}</strong></div>
                  <div className="bank-product-row"><span>Outstanding</span><strong>{money(loan.outstanding)}</strong></div>
                  <div className="bank-product-row"><span>EMI</span><strong>{money(loan.emi)} / month</strong></div>
                  <div className="bank-product-row"><span>Interest rate</span><strong>{loan.interestRate}% p.a.</strong></div>
                  <div className="bank-product-row"><span>Next due date</span><strong>{bankFormatDate(loan.nextDueDate)}</strong></div>
                  <div className="bank-product-row"><span>Tenure</span><strong>{loan.paidMonths} / {loan.tenureMonths} months</strong></div>
                </div>
                <div className="bank-progress"><span style={{ width: `${paidPercent}%` }} /></div>
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <button type="button" className="bank-btn is-ghost" style={{ pointerEvents: 'none', opacity: 0.7 }}>Repayment schedule</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bank-note" style={{ marginTop: 22 }}>EMI, interest and outstanding balances are computed by the bank backend. The repayment schedule view arrives with the full loan module.</div>
      </div>
    </BankShell>
  )
}