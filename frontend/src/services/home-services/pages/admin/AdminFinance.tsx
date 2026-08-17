import { useState } from 'react'
import { MdAccountBalanceWallet, MdCheckCircle, MdPayments } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsSection, HsEmpty } from '../../hsShared'

const TABS = ['Payouts', 'Payments', 'Commissions'] as const
type Tab = (typeof TABS)[number]

export default function AdminFinance() {
  const store = useHomeServicesStore()
  const [tab, setTab] = useState<Tab>('Payouts')

  const pendingPayouts = store.payouts.filter((p) => p.status === 'Pending')
  const paidPayouts = store.payouts.filter((p) => p.status === 'Paid')
  const totalPaid = paidPayouts.reduce((s, p) => s + p.amount, 0)

  const completedBookings = store.bookings.filter((b) => b.status === 'Completed')
  const totalGmv = completedBookings.reduce((s, b) => s + b.currentQuote, 0)
  const totalCommissions = Math.round(totalGmv * 0.15)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="Finance" />
        <div className="hs-stat-grid">
          <div className="hs-stat"><small><MdPayments aria-hidden="true" /> GMV (completed)</small><b>{money(totalGmv)}</b></div>
          <div className="hs-stat"><small>Commission (15%)</small><b>{money(totalCommissions)}</b></div>
          <div className="hs-stat"><small><MdAccountBalanceWallet aria-hidden="true" /> Total paid out</small><b>{money(totalPaid)}</b></div>
          <div className="hs-stat"><small>Pending payout</small><b>{money(pendingPayouts.reduce((s, p) => s + p.amount, 0))}</b></div>
        </div>

        <div className="hs-tabs" role="tablist" aria-label="Finance sections" style={{ margin: '16px 0' }}>
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`hs-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Payouts' && (
          <div className="hs-list">
            {pendingPayouts.length === 0 && paidPayouts.length === 0 && <HsEmpty title="No payouts yet" />}
            {[...pendingPayouts, ...paidPayouts].map((p) => {
              const pro = store.professionalById(p.professionalId)
              return (
                <div key={p.id} className="hs-list-row">
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>{pro?.name ?? 'Professional'} — {p.reference}</strong>
                    <small>Requested {formatDateTime(p.createdAt)}{p.paidAt ? ` · paid ${formatDateTime(p.paidAt)}` : ''}</small>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <b>{money(p.amount)}</b>
                    {p.status === 'Pending' && (
                      <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" style={{ display: 'block', marginTop: 4 }} onClick={() => store.adminProcessPayout(p.id)}>
                        <MdCheckCircle aria-hidden="true" /> Approve & pay
                      </button>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'Payments' && (
          <div className="hs-list">
            {completedBookings.length === 0 && <HsEmpty title="No payments yet" />}
            {completedBookings.map((b) => {
              const service = store.serviceById(b.serviceId)
              return (
                <div key={b.id} className="hs-list-row">
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>{service?.name ?? ''} · {b.number}</strong>
                    <small>{b.paymentMethod} · {formatDateTime(b.createdAt)}</small>
                  </span>
                  <b>{money(b.currentQuote)}</b>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'Commissions' && (
          <div>
            <div className="hs-alert hs-alert--info" style={{ marginBottom: 12 }}>
              VSR retains a 15% platform commission on every completed booking; professionals receive 85% after GST.
            </div>
            <div className="hs-list">
              {completedBookings.map((b) => {
                const service = store.serviceById(b.serviceId)
                const pro = b.assignedProfessionalId ? store.professionalById(b.assignedProfessionalId) : null
                return (
                  <div key={b.id} className="hs-list-row">
                    <span>
                      <strong style={{ display: 'block', fontSize: 13 }}>{service?.name ?? ''} · {b.number}</strong>
                      <small>{pro?.name ?? 'Unassigned'}</small>
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <b>{money(Math.round(b.currentQuote * 0.15))}</b>
                      <small style={{ display: 'block' }}>commission</small>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}