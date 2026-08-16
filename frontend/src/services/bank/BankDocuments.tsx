import { FileText, ShieldCheck } from 'lucide-react'
import { bankFormatDate } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

const DOCUMENTS = [
  { id: 'doc-001', title: 'KYC verification — Aadhaar', type: 'Identity', at: '2026-03-12', secure: true },
  { id: 'doc-002', title: 'Account opening form', type: 'Account', at: '2026-03-12', secure: true },
  { id: 'doc-003', title: 'July 2026 statement', type: 'Statement', at: '2026-08-02', secure: true },
  { id: 'doc-004', title: 'FD certificate — dep-001', type: 'Deposit', at: '2025-09-01', secure: true },
  { id: 'doc-005', title: 'Loan agreement — Home Loan', type: 'Loan', at: '2024-07-10', secure: true },
] as const

export default function BankDocuments() {
  const store = useBankStore()

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><FileText aria-hidden="true" /> Documents</h1>
          <p>Securely stored account documents and certificates. Downloads are audit-logged.</p>
        </div>

        <div className="bank-card">
          <div className="bank-list-rows">
            {DOCUMENTS.map((document) => (
              <div key={document.id} className="bank-list-row">
                <span className="bank-txn-icon"><FileText aria-hidden="true" /></span>
                <div className="bank-list-row-main">
                  <div className="bank-list-row-title">{document.title}</div>
                  <div className="bank-list-row-sub">{document.type} · {bankFormatDate(document.at)}</div>
                </div>
                <span className="bank-secure-chip"><ShieldCheck aria-hidden="true" /> Secure</span>
                <button type="button" className="bank-btn is-outline">Download</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bank-note" style={{ marginTop: 20 }}><ShieldCheck aria-hidden="true" /> Documents are encrypted at rest and every access is recorded in the audit log. Full document center arrives with the backend.</div>
      </div>
    </BankShell>
  )
}