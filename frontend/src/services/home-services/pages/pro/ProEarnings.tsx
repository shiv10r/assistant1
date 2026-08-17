import { useState } from 'react'
import { MdAccountBalanceWallet, MdPayments, MdTrendingUp } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsSection, HsEmpty } from '../../hsShared'
import { PROFESSIONALS } from '../../homeServicesData'

const PROFILE = PROFESSIONALS[0]

export default function ProEarnings() {
  const store = useHomeServicesStore()
  const [tab, setTab] = useState<'earnings' | 'payouts'>('earnings')
  const earnings = store.earningsFor(PROFILE.id)
  const payouts = store.payoutsFor(PROFILE.id)

  const eligible = earnings.filter((e) => e.status === 'Eligible').reduce((s, e) => s + e.earningAmount, 0)
  const paid = payouts.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0)
  const pending = payouts.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="Earnings" />
        <div className="hs-stat-grid">
          <div className="hs-stat"><small><MdAccountBalanceWallet aria-hidden="true" /> Available balance</small><b>{money(eligible - paid - pending)}</b></div>
          <div className="hs-stat"><small><MdPayments aria-hidden="true" /> Pending payout</small><b>{money(pending)}</b></div>
          <div className="hs-stat"><small><MdTrendingUp aria-hidden="true" /> Total paid out</small><b>{money(paid)}</b></div>
        </div>

        <div className="hs-tabs" role="tablist" aria-label="Earnings sections" style={{ margin: '16px 0' }}>
          {(['earnings', 'payouts'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`hs-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
              {t === 'earnings' ? 'Earning history' : 'Payouts'}
            </button>
          ))}
        </div>

        {tab === 'earnings' && (
          <div className="hs-list">
            {earnings.length === 0 && <HsEmpty title="No earnings yet" body="Complete jobs to start earning." />}
            {earnings.map((e) => {
              const b = store.bookings.find((x) => x.id === e.bookingId)
              return (
                <div key={e.id} className="hs-list-row">
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>{b ? store.serviceById(b.serviceId)?.name ?? 'Job' : 'Job'}</strong>
                    <small>{e.bookingNumber} · {formatDateTime(e.createdAt)}</small>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <b style={{ color: '#15803d' }}>+ {money(e.earningAmount)}</b>
                    <small style={{ display: 'block' }}>GST included · {e.status}</small>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'payouts' && (
          <div>
            {eligible - paid - pending > 0 && (
              <button type="button" className="hs-btn hs-btn--primary hs-btn--block" style={{ marginBottom: 12 }} onClick={() => store.requestPayout(PROFILE.id, eligible - paid - pending)}>
                <MdAccountBalanceWallet aria-hidden="true" /> Request payout of {money(eligible - paid - pending)}
              </button>
            )}
            <div className="hs-list">
              {payouts.length === 0 && <HsEmpty title="No payouts yet" body="Request a payout from your available balance." />}
              {payouts.map((p) => (
                <div key={p.id} className="hs-list-row">
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>{p.reference || p.id}</strong>
                    <small>Requested {formatDateTime(p.createdAt)}{p.paidAt ? ` · paid ${formatDateTime(p.paidAt)}` : ''}</small>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <b>{money(p.amount)}</b>
                    <small style={{ display: 'block' }}>{p.status}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}