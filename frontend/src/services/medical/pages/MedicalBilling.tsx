import { useState } from 'react'
import { CheckCircle2, CreditCard, Receipt } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_INVOICES, medicalFormatDate, medicalInvoiceTotal, medicalPatientById } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalBilling() {
  const store = useMedicalStore()
  const [paidInvoices, setPaidInvoices] = useState<readonly string[]>([])

  function payInvoice(invoiceId: string) {
    if (paidInvoices.includes(invoiceId)) return
    setPaidInvoices([...paidInvoices, invoiceId])
  }

  const totalDue = MEDICAL_INVOICES.filter((invoice) => invoice.status === 'due' || invoice.status === 'overdue')
    .reduce((total, invoice) => total + medicalInvoiceTotal(invoice), 0)

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><CreditCard aria-hidden="true" /> Billing</h1>
        <p>View your invoices, break down charges and settle outstanding balances securely.</p>
      </div>

      <div className="med-hero">
        <div className="med-hello">
          <h2>Outstanding balance: ₹{totalDue.toLocaleString('en-IN')}</h2>
          <p>Payments clear instantly and an updated receipt is issued to your records.</p>
        </div>
        <div className="med-balance-card">
          <div className="med-balance-label"><Receipt aria-hidden="true" /> TOTAL INVOICES</div>
          <div className="med-balance-amount">{MEDICAL_INVOICES.length}</div>
          <div className="med-balance-sub">Across your visits and diagnostic orders</div>
        </div>
      </div>

      <div className="med-appt-list">
        {MEDICAL_INVOICES.map((invoice) => {
          const patient = medicalPatientById(invoice.patientId)
          const effectiveStatus = paidInvoices.includes(invoice.id) ? 'paid' : invoice.status
          return (
            <div key={invoice.id} className="med-invoice">
              <div className="med-invoice-head">
                <h3>{invoice.id}</h3>
                <span className={cn('med-status', `is-${effectiveStatus}`)}>{effectiveStatus}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--med-muted)', marginBottom: 12 }}>
                Patient: <strong style={{ color: 'var(--med-ink)' }}>{patient?.name ?? 'Unknown'}</strong> · Issued {medicalFormatDate(invoice.issuedAt)}
              </div>
              <div className="med-invoice-rows">
                {invoice.items.map((item) => (
                  <div key={item.description} className="med-invoice-row">
                    <span>{item.description}</span>
                    <strong>₹{item.amount.toLocaleString('en-IN')}</strong>
                  </div>
                ))}
                {invoice.discount > 0 && (
                  <div className="med-invoice-row">
                    <span>Discount</span>
                    <strong>-₹{invoice.discount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <div className="med-invoice-row">
                  <span>Tax</span>
                  <strong>₹{invoice.tax.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <div className="med-invoice-total">Total: ₹{medicalInvoiceTotal(invoice).toLocaleString('en-IN')}</div>
              {(invoice.status === 'due' || invoice.status === 'overdue') && !paidInvoices.includes(invoice.id) && (
                <div style={{ marginTop: 14 }}>
                  <button className="med-btn" type="button" onClick={() => payInvoice(invoice.id)}>
                    <CreditCard aria-hidden="true" /> Pay Now
                  </button>
                </div>
              )}
              {paidInvoices.includes(invoice.id) && (
                <div className="med-note" style={{ marginTop: 14 }}>
                  <CheckCircle2 aria-hidden="true" /> Payment received. A receipt has been added to your records.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
    </MedicalShell>
  )
}