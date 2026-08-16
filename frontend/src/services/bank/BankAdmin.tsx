import { useState } from 'react'
import { Activity, AlertTriangle, FileWarning, ScrollText, Search, ShieldCheck, UserCheck, Users } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_ADMIN_STATS, BANK_AUDIT_LOGS, bankFormatDateTime } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

const ADMIN_STAT_CARDS = [
  { label: 'Active customers', value: BANK_ADMIN_STATS.activeCustomers.toLocaleString('en-IN'), icon: Users },
  { label: 'New KYC cases', value: String(BANK_ADMIN_STATS.newKycCases), icon: UserCheck },
  { label: 'Transfers today', value: BANK_ADMIN_STATS.transfersToday.toLocaleString('en-IN'), icon: Activity },
  { label: 'Failed transfers', value: String(BANK_ADMIN_STATS.failedTransfers), icon: FileWarning, tone: 'bad' as const },
  { label: 'High-risk events', value: String(BANK_ADMIN_STATS.highRiskEvents), icon: AlertTriangle, tone: 'bad' as const },
  { label: 'Blocked accounts', value: String(BANK_ADMIN_STATS.blockedAccounts), icon: ShieldCheck },
  { label: 'Open service requests', value: String(BANK_ADMIN_STATS.openServiceRequests), icon: ScrollText },
]

const CUSTOMERS = [
  { id: 'CUS-2210', name: 'Aarav Sharma', kyc: 'Approved', accounts: 2, status: 'active' },
  { id: 'CUS-2209', name: 'Meera Krishnan', kyc: 'Pending', accounts: 1, status: 'active' },
  { id: 'CUS-2208', name: 'Kabir Malhotra', kyc: 'Approved', accounts: 1, status: 'blocked' },
  { id: 'CUS-2207', name: 'Sanya Kapoor', kyc: 'Approved', accounts: 3, status: 'active' },
] as const

const MONITORED_TRANSFERS = [
  { id: 'TRF/VSR/884421', from: 'Savings •••• 4821', amount: 27500, risk: 'StepUpAuth', status: 'pending' },
  { id: 'TRF/VSR/880012', from: 'Savings •••• 4821', amount: 480000, risk: 'ManualReview', status: 'pending' },
  { id: 'TRF/VSR/879901', from: 'Current •••• 9064', amount: 9200, risk: 'Allow', status: 'completed' },
  { id: 'TRF/VSR/879555', from: 'Current •••• 9064', amount: 610000, risk: 'Block', status: 'failed' },
] as const

export default function BankAdmin() {
  const store = useBankStore()
  const [customerQuery, setCustomerQuery] = useState('')

  const filteredCustomers = CUSTOMERS.filter((customer) =>
    customerQuery.trim() === '' || `${customer.id} ${customer.name}`.toLowerCase().includes(customerQuery.toLowerCase())
  )

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><ShieldCheck aria-hidden="true" /> Admin console</h1>
          <p>Operations portal — customer search, transfer monitoring and audit logs. Operations role required.</p>
        </div>

        <div className="bank-admin-stats">
          {ADMIN_STAT_CARDS.map((stat) => (
            <div key={stat.label} className="bank-admin-stat">
              <small style={stat.tone === 'bad' ? { color: 'var(--bank-bad)' } : undefined}><stat.icon aria-hidden="true" /> {stat.label}</small>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>

        <div className="bank-card" style={{ marginBottom: 20 }}>
          <h2><Users aria-hidden="true" /> Customer search</h2>
          <div className="bank-filters" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <label htmlFor="admin-customer"><Search aria-hidden="true" /><input id="admin-customer" value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Search by customer ID or name" /></label>
          </div>
          <div className="bank-table-wrap">
            <table className="bank-table">
              <thead>
                <tr><th>Customer ID</th><th>Name</th><th>KYC</th><th>Accounts</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="mono">{customer.id}</td>
                    <td>{customer.name}</td>
                    <td><span className={`bank-status is-${customer.kyc === 'Approved' ? 'booked' : 'pending'}`}>{customer.kyc}</span></td>
                    <td>{customer.accounts}</td>
                    <td><span className={`bank-status is-${customer.status}`}>{customer.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bank-card" style={{ marginBottom: 20 }}>
          <h2><Activity aria-hidden="true" /> Transfer monitoring</h2>
          <div className="bank-table-wrap">
            <table className="bank-table">
              <thead>
                <tr><th>Reference</th><th>From</th><th>Amount</th><th>Risk decision</th><th>Status</th></tr>
              </thead>
              <tbody>
                {MONITORED_TRANSFERS.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="mono">{transfer.id}</td>
                    <td>{transfer.from}</td>
                    <td>{money(transfer.amount)}</td>
                    <td><span className={`bank-status is-${transfer.risk === 'Allow' ? 'completed' : transfer.risk === 'Block' ? 'blocked' : 'pending'}`}>{transfer.risk}</span></td>
                    <td><span className={`bank-status is-${transfer.status}`}>{transfer.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bank-card">
          <h2><ScrollText aria-hidden="true" /> Audit log</h2>
          <div className="bank-table-wrap">
            <table className="bank-table">
              <thead>
                <tr><th>Time</th><th>Actor</th><th>Action</th><th>Resource</th><th>Outcome</th></tr>
              </thead>
              <tbody>
                {BANK_AUDIT_LOGS.map((log) => (
                  <tr key={log.id}>
                    <td className="mono">{bankFormatDateTime(log.at)}</td>
                    <td>{log.actor}</td>
                    <td>{log.action}</td>
                    <td>{log.resource}</td>
                    <td><span className={`bank-status is-${log.outcome === 'success' ? 'booked' : log.outcome === 'failed' ? 'blocked' : 'warning'}`}>{log.outcome}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BankShell>
  )
}