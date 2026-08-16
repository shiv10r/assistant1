import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Bell, CreditCard, FileDown, Landmark, PiggyBank, Plus, Receipt, Send, ShieldAlert, Users, Wallet, Zap } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_ACCOUNTS, BANK_BENEFICIARIES, BANK_CARDS, BANK_NOTIFICATIONS, BANK_SERVICE_REQUESTS, BANK_TRANSACTIONS, bankFormatDateTime } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

function directionIcon(direction: 'credit' | 'debit') {
  return direction === 'credit' ? <ArrowDownLeft aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />
}

export default function BankHome() {
  const store = useBankStore()
  const totalBalance = BANK_ACCOUNTS.reduce((total, account) => total + account.availableBalance, 0)
  const recent = [...BANK_TRANSACTIONS].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt)).slice(0, 8)
  const pendingTransfers = store.transfers.filter((t) => t.status !== 'Completed')
  const alerts = BANK_NOTIFICATIONS.filter((n) => n.type === 'security' && !store.isNotificationRead(n.id))
  const openRequests = BANK_SERVICE_REQUESTS.filter((r) => r.status !== 'resolved')

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <section className="bank-hero">
          <div className="bank-hello">
            <h2>Welcome back, Aarav</h2>
            <p>Here is a secure snapshot of your money today.</p>
            <div className="bank-quick-actions" style={{ marginTop: 18, marginBottom: 0 }}>
              <Link to="/bank/transfers" className="bank-quick-action"><Send aria-hidden="true" /> Transfer</Link>
              <Link to="/bank/bills" className="bank-quick-action"><Receipt aria-hidden="true" /> Pay Bill</Link>
              <Link to="/bank/beneficiaries" className="bank-quick-action"><Users aria-hidden="true" /> Add Beneficiary</Link>
              <Link to="/bank/statements" className="bank-quick-action"><FileDown aria-hidden="true" /> Statement</Link>
              <Link to="/bank/cards" className="bank-quick-action"><CreditCard aria-hidden="true" /> Manage Cards</Link>
            </div>
          </div>
          <div className="bank-balance-card">
            <span className="bank-balance-label"><Wallet aria-hidden="true" /> TOTAL BALANCE</span>
            <div className="bank-balance-amount">{money(totalBalance)}</div>
            <div className="bank-balance-sub">Across {BANK_ACCOUNTS.length} accounts · updated today</div>
            <div className="bank-balance-foot">
              <span className="bank-chip"><Landmark aria-hidden="true" /> Savings •••• 4821</span>
              <span className="bank-chip"><Zap aria-hidden="true" /> Current •••• 9064</span>
            </div>
          </div>
        </section>

        {alerts.length > 0 && (
          <div className="bank-note" style={{ marginBottom: 20 }}>
            <ShieldAlert aria-hidden="true" />
            <span>{alerts[0].title} — {alerts[0].body} <Link to="/bank/notifications" style={{ color: '#9A3412', fontWeight: 800, textDecoration: 'underline' }}>Review alerts</Link></span>
          </div>
        )}

        <div className="bank-dash-grid">
          <div>
            <div className="bank-card" style={{ marginBottom: 20 }}>
              <h2><Wallet aria-hidden="true" /> My accounts</h2>
              <div className="bank-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {BANK_ACCOUNTS.map((account) => (
                  <Link key={account.id} to={`/bank/accounts/${account.id}`} className="bank-account-card">
                    <div className="bank-account-top">
                      <span className="bank-account-name">{account.name}</span>
                      <span className={`bank-status is-${account.status}`}>{account.status}</span>
                    </div>
                    <span className="bank-account-masked">•••• {account.accountLast4}</span>
                    <span className="bank-account-label">Available balance</span>
                    <span className="bank-account-balance">{money(account.availableBalance)}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bank-card">
              <h2><Zap aria-hidden="true" /> Recent activity</h2>
              <div className="bank-txn-list">
                {recent.map((tx) => (
                  <div key={tx.id} className="bank-txn-row">
                    <span className="bank-txn-icon">{directionIcon(tx.direction)}</span>
                    <div className="bank-txn-main">
                      <div className="bank-txn-title">{tx.description}</div>
                      <div className="bank-txn-meta">
                        <span>{bankFormatDateTime(tx.bookedAt)}</span>
                        <span>{tx.category}</span>
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
              <Link to="/bank/accounts" style={{ display: 'inline-flex', marginTop: 14, fontSize: 13, fontWeight: 800, color: 'var(--bank-brand)', textDecoration: 'none' }}>View full history →</Link>
            </div>
          </div>

          <div>
            {pendingTransfers.length > 0 && (
              <div className="bank-card" style={{ marginBottom: 20 }}>
                <h2><Send aria-hidden="true" /> Pending transfers</h2>
                <div className="bank-list-rows">
                  {pendingTransfers.map((t) => (
                    <div key={t.id} className="bank-list-row">
                      <div className="bank-list-row-main">
                        <div className="bank-list-row-title">{t.purpose}</div>
                        <div className="bank-list-row-sub">{store.transferLabel(t)}</div>
                      </div>
                      <div className="bank-list-row-right">
                        <strong>{money(t.amount)}</strong>
                        <span className={`bank-status is-${t.status.toLowerCase()}`}>{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bank-card" style={{ marginBottom: 20 }}>
              <h2><CreditCard aria-hidden="true" /> Cards</h2>
              <div className="bank-list-rows">
                {BANK_CARDS.map((card) => (
                  <div key={card.id} className="bank-list-row">
                    <div className="bank-list-row-main">
                      <div className="bank-list-row-title">{card.network} · {card.kind}</div>
                      <div className="bank-list-row-sub">•••• {card.last4} · expires {card.expiresAt}</div>
                    </div>
                    <span className={`bank-status is-${store.cardStatusOf(card.id)}`}>{store.cardStatusOf(card.id)}</span>
                  </div>
                ))}
              </div>
              <Link to="/bank/cards" style={{ display: 'inline-flex', marginTop: 14, fontSize: 13, fontWeight: 800, color: 'var(--bank-brand)', textDecoration: 'none' }}>Manage cards →</Link>
            </div>

            <div className="bank-card" style={{ marginBottom: 20 }}>
              <h2><PiggyBank aria-hidden="true" /> Savings at a glance</h2>
              <div className="bank-product-rows">
                <div className="bank-product-row"><span>Fixed deposits</span><strong>{money(750000)}</strong></div>
                <div className="bank-product-row"><span>Recurring deposits</span><strong>{money(199500)}</strong></div>
                <div className="bank-product-row"><span>Loans outstanding</span><strong>{money(3487400)}</strong></div>
              </div>
              <div className="bank-account-actions" style={{ marginTop: 14 }}>
                <Link to="/bank/deposits">View deposits</Link>
                <Link to="/bank/loans">View loans</Link>
              </div>
            </div>

            <div className="bank-card">
              <h2><Bell aria-hidden="true" /> Service requests</h2>
              <div className="bank-list-rows">
                {openRequests.map((request) => (
                  <div key={request.id} className="bank-list-row">
                    <div className="bank-list-row-main">
                      <div className="bank-list-row-title">{request.id} · {request.subject}</div>
                      <div className="bank-list-row-sub">{request.type} · opened {request.openedAt}</div>
                    </div>
                    <span className={`bank-status is-${request.status}`}>{request.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bank-card" style={{ marginTop: 20 }}>
              <h2><Plus aria-hidden="true" /> Beneficiaries</h2>
              <div className="bank-list-rows">
                {BANK_BENEFICIARIES.filter((b) => b.status === 'Active').slice(0, 3).map((beneficiary) => (
                  <div key={beneficiary.id} className="bank-list-row">
                    <span className="bank-avatar">{beneficiary.nickname.slice(0, 1).toUpperCase()}</span>
                    <div className="bank-list-row-main">
                      <div className="bank-list-row-title">{beneficiary.name}</div>
                      <div className="bank-list-row-sub">{beneficiary.bank} · {beneficiary.accountNumber}</div>
                    </div>
                    <span className="bank-status is-active">Active</span>
                  </div>
                ))}
              </div>
              <Link to="/bank/beneficiaries" style={{ display: 'inline-flex', marginTop: 14, fontSize: 13, fontWeight: 800, color: 'var(--bank-brand)', textDecoration: 'none' }}>Manage beneficiaries →</Link>
            </div>
          </div>
        </div>
      </div>
    </BankShell>
  )
}