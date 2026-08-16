import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Filter, Search } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_TRANSACTIONS, bankFormatDateTime, type BankTransaction } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

function directionIcon(direction: 'credit' | 'debit') {
  return direction === 'credit' ? <ArrowDownLeft aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />
}

type FilterState = {
  readonly query: string
  readonly direction: '' | 'credit' | 'debit'
  readonly status: '' | 'booked' | 'pending'
}

const EMPTY_FILTERS: FilterState = { query: '', direction: '', status: '' }

function matches(tx: BankTransaction, filters: FilterState): boolean {
  if (filters.direction && tx.direction !== filters.direction) return false
  if (filters.status && tx.status !== filters.status) return false
  if (filters.query) {
    const q = filters.query.toLowerCase()
    const haystack = `${tx.description} ${tx.counterparty} ${tx.category} ${tx.reference}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}

export default function BankTransactions() {
  const store = useBankStore()
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const filtered = [...BANK_TRANSACTIONS]
    .filter((tx) => matches(tx, filters))
    .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1>Transactions</h1>
          <p>Full history across all accounts with search and filters.</p>
        </div>

        <div className="bank-filters">
          <label htmlFor="bank-txn-search"><Search aria-hidden="true" /><input id="bank-txn-search" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Search description, payee, reference" /></label>
          <label htmlFor="bank-txn-direction"><Filter aria-hidden="true" />
            <select id="bank-txn-direction" value={filters.direction} onChange={(event) => setFilters({ ...filters, direction: event.target.value as FilterState['direction'] })}>
              <option value="">All directions</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </label>
          <label htmlFor="bank-txn-status"><Filter aria-hidden="true" />
            <select id="bank-txn-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as FilterState['status'] })}>
              <option value="">All statuses</option>
              <option value="booked">Booked</option>
              <option value="pending">Pending</option>
            </select>
          </label>
          <button type="button" className="bank-btn is-ghost" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
        </div>

        <div className="bank-card">
          <div className="bank-txn-list">
            {filtered.length === 0 && (
              <div className="bank-empty">
                <Filter aria-hidden="true" />
                <h3>No transactions match</h3>
                <p>Try changing the search text or clearing the filters.</p>
              </div>
            )}
            {filtered.map((tx) => (
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