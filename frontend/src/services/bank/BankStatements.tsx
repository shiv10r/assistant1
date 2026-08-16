import { FileDown } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_ACCOUNTS, BANK_TRANSACTIONS } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

const STATEMENTS = [
  { id: 'st-2026-07', period: 'July 2026', range: '01 Jul – 31 Jul 2026', account: 'Savings •••• 4821', downloaded: false },
  { id: 'st-2026-06', period: 'June 2026', range: '01 Jun – 30 Jun 2026', account: 'Savings •••• 4821', downloaded: false },
  { id: 'st-2026-q2', period: 'Q2 2026', range: '01 Apr – 30 Jun 2026', account: 'Current •••• 9064', downloaded: true },
  { id: 'st-2026-05', period: 'May 2026', range: '01 May – 31 May 2026', account: 'Savings •••• 4821', downloaded: true },
] as const

export default function BankStatements() {
  const store = useBankStore()

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><FileDown aria-hidden="true" /> Statements</h1>
          <p>Download monthly, quarterly or custom-range statements in PDF or CSV. Generated server-side.</p>
        </div>

        <div className="bank-card" style={{ marginBottom: 20 }}>
          <h2>Request a statement</h2>
          <div className="bank-form">
            <div className="bank-form-row">
              <label htmlFor="st-account">
                Account
                <select id="st-account">
                  {BANK_ACCOUNTS.map((account) => (
                    <option key={account.id} value={account.id}>{account.name} · •••• {account.accountLast4}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="st-format">
                Format
                <select id="st-format">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
            </div>
            <div className="bank-form-row">
              <label htmlFor="st-from">From<input id="st-from" type="date" defaultValue="2026-07-01" /></label>
              <label htmlFor="st-to">To<input id="st-to" type="date" defaultValue="2026-07-31" /></label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="bank-btn" style={{ alignSelf: 'start' }}>Request statement</button>
              <button type="button" className="bank-btn is-ghost" style={{ alignSelf: 'start' }}>Export transactions CSV</button>
            </div>
          </div>
        </div>

        <div className="bank-card">
          <h2>Recent statements</h2>
          <div className="bank-list-rows">
            {STATEMENTS.map((statement) => (
              <div key={statement.id} className="bank-list-row">
                <div className="bank-list-row-main">
                  <div className="bank-list-row-title">{statement.period} · {statement.account}</div>
                  <div className="bank-list-row-sub">{statement.range}</div>
                </div>
                <button type="button" className="bank-btn is-outline"><FileDown aria-hidden="true" /> {statement.downloaded ? 'Download again' : 'Download'}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bank-card" style={{ marginTop: 20 }}>
          <h2>July 2026 — quick view</h2>
          <div className="bank-txn-list">
            {[...BANK_TRANSACTIONS].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt)).slice(0, 4).map((tx) => (
              <div key={tx.id} className="bank-txn-row">
                <div className="bank-txn-main">
                  <div className="bank-txn-title">{tx.description}</div>
                  <div className="bank-txn-meta"><span>{tx.bookedAt.slice(0, 10)}</span><span>{tx.category}</span></div>
                </div>
                <div className="bank-txn-amount">
                  <strong className={tx.direction === 'credit' ? 'is-credit' : 'is-debit'}>{tx.direction === 'credit' ? '+' : '−'}{money(tx.amount)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BankShell>
  )
}