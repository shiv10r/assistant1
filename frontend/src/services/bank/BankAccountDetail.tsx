import { Link, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Send, Wallet } from 'lucide-react'
import { money } from '../../lib/utils'
import { bankAccountById, bankFormatDateTime, bankTransactionsFor } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

function directionIcon(direction: 'credit' | 'debit') {
  return direction === 'credit' ? <ArrowDownLeft aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />
}

export default function BankAccountDetail() {
  const store = useBankStore()
  const { accountId } = useParams()
  const account = bankAccountById(accountId)
  const transactions = account ? bankTransactionsFor(account.id) : []

  if (!account) {
    return (
      <BankShell unreadCount={store.unreadCount}>
        <div className="bank-main">
          <div className="bank-empty">
            <Wallet aria-hidden="true" />
            <h3>Account not found</h3>
            <p>The account you are looking for does not exist or is no longer visible.</p>
            <Link to="/bank/accounts" className="bank-btn" style={{ marginTop: 6 }}>Back to accounts</Link>
          </div>
        </div>
      </BankShell>
    )
  }

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <Link to="/bank/accounts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 13, fontWeight: 800, color: 'var(--bank-brand)', textDecoration: 'none' }}>
          <ArrowLeft aria-hidden="true" style={{ width: 16 }} /> All accounts
        </Link>

        <div className="bank-page-head">
          <h1>{account.name}</h1>
          <p>•••• {account.accountLast4} · {account.currency} · opened {account.openedAt} · <span className={`bank-status is-${account.status}`}>{account.status}</span></p>
        </div>

        <div className="bank-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <div className="bank-account-label">Available balance</div>
              <div className="bank-account-balance" style={{ fontSize: 30, marginTop: 4 }}>{money(account.availableBalance)}</div>
            </div>
            <div>
              <div className="bank-account-label">Ledger balance</div>
              <div className="bank-account-balance" style={{ fontSize: 30, marginTop: 4 }}>{money(account.ledgerBalance)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginLeft: 'auto' }}>
              <Link to="/bank/transfers" className="bank-btn"><Send aria-hidden="true" /> Transfer</Link>
            </div>
          </div>
        </div>

        <div className="bank-card">
          <h2>Transaction history</h2>
          <div className="bank-txn-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="bank-txn-row">
                <span className="bank-txn-icon">{directionIcon(tx.direction)}</span>
                <div className="bank-txn-main">
                  <div className="bank-txn-title">{tx.description}</div>
                  <div className="bank-txn-meta">
                    <span>{bankFormatDateTime(tx.bookedAt)}</span>
                    <span>{tx.category}</span>
                    <span>{tx.reference}</span>
                    <span className={`bank-status is-${tx.status}`}>{tx.status}</span>
                  </div>
                </div>
                <div className="bank-txn-amount">
                  <strong className={tx.direction === 'credit' ? 'is-credit' : 'is-debit'}>{tx.direction === 'credit' ? '+' : '−'}{money(tx.amount)}</strong>
                  <small>{tx.counterparty}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BankShell>
  )
}