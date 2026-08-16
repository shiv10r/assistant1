import { Link } from 'react-router-dom'
import { ArrowUpRight, FileDown, Send, Wallet } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_ACCOUNTS, bankFormatDate } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

export default function BankAccounts() {
  const store = useBankStore()

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><Wallet aria-hidden="true" /> Accounts</h1>
          <p>Your savings and current accounts. Numbers are masked for security.</p>
        </div>

        <div className="bank-grid">
          {BANK_ACCOUNTS.map((account) => (
            <Link key={account.id} to={`/bank/accounts/${account.id}`} className="bank-account-card">
              <div className="bank-account-top">
                <span className="bank-account-name">{account.name}</span>
                <span className={`bank-status is-${account.status}`}>{account.status}</span>
              </div>
              <span className="bank-account-masked">•••• {account.accountLast4}</span>
              <span className="bank-account-label">Ledger balance</span>
              <span className="bank-account-balance">{money(account.ledgerBalance)}</span>
              <span className="bank-account-label">Available balance</span>
              <span className="bank-account-balance" style={{ fontSize: 17 }}>{money(account.availableBalance)}</span>
              <div className="bank-account-meta" style={{ fontSize: 12, color: 'var(--bank-muted)', marginTop: 4 }}>
                {account.currency} · opened {bankFormatDate(account.openedAt)}
              </div>
              <div className="bank-account-actions" style={{ marginTop: 12 }}>
                <span><ArrowUpRight aria-hidden="true" /> View transactions</span>
                <span><Send aria-hidden="true" /> Transfer</span>
                <span><FileDown aria-hidden="true" /> Statement</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bank-note" style={{ marginTop: 22 }}>
          <span>Account numbers, balances, and limits are always verified by the bank backend. What you see here is a demo of the customer experience.</span>
        </div>
      </div>
    </BankShell>
  )
}