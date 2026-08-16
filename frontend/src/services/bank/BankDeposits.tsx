import { PiggyBank } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_DEPOSITS, bankFormatDate } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

export default function BankDeposits() {
  const store = useBankStore()

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><PiggyBank aria-hidden="true" /> Deposits</h1>
          <p>Fixed and recurring deposits. Interest and maturity amounts are calculated server-side.</p>
        </div>

        <div className="bank-grid">
          {BANK_DEPOSITS.map((deposit) => (
            <div key={deposit.id} className="bank-product-card">
              <h3>
                <PiggyBank aria-hidden="true" />
                {deposit.kind === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'}
                <span className={`bank-status is-${deposit.status}`}>{deposit.status}</span>
              </h3>
              <div className="bank-product-rows">
                <div className="bank-product-row"><span>Principal</span><strong>{money(deposit.principal)}</strong></div>
                <div className="bank-product-row"><span>Interest rate</span><strong>{deposit.interestRate}% p.a.</strong></div>
                <div className="bank-product-row"><span>Start date</span><strong>{bankFormatDate(deposit.startDate)}</strong></div>
                <div className="bank-product-row"><span>Maturity date</span><strong>{bankFormatDate(deposit.maturityDate)}</strong></div>
                <div className="bank-product-row"><span>Maturity amount</span><strong>{money(deposit.maturityAmount)}</strong></div>
                <div className="bank-product-row"><span>Nominee</span><strong>{deposit.nominee}</strong></div>
              </div>
              <div className="bank-progress"><span style={{ width: '100%' }} /></div>
            </div>
          ))}
        </div>

        <div className="bank-note" style={{ marginTop: 22 }}>Deposit interest, premature withdrawal penalties, and maturity values are always computed by the bank backend.</div>
      </div>
    </BankShell>
  )
}