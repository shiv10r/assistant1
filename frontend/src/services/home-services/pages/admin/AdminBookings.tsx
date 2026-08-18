import { useState } from 'react'
import { MdEventAvailable, MdSchedule, MdSwapHoriz } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge, HsPaymentBadge } from '../../hsShared'
import type { BookingStatus } from '../../homeServicesData'

const FILTERS: readonly BookingStatus[] = [
  'AwaitingProvider', 'Upcoming', 'OnTheWay', 'Arrived', 'InService', 'WaitingCustomerApproval', 'Completed', 'Cancelled',
]

export default function AdminBookings() {
  const store = useHomeServicesStore()
  const [filter, setFilter] = useState<BookingStatus | 'All'>('All')
  const visible = filter === 'All' ? store.bookings : store.bookings.filter((b) => b.status === filter)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="All bookings" />
        <div className="hs-tabs" role="tablist" aria-label="Booking status filters" style={{ flexWrap: 'wrap' }}>
          <button type="button" role="tab" aria-selected={filter === 'All'} className={`hs-tab ${filter === 'All' ? 'is-active' : ''}`} onClick={() => setFilter('All')}>
            All
          </button>
          {FILTERS.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={`hs-tab ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <HsEmpty icon={<MdEventAvailable aria-hidden="true" />} title="No bookings" body="Bookings with this status will appear here." />
        ) : (
          <div className="hs-list">
            {visible.map((b) => {
              const service = store.serviceById(b.serviceId)
              const pro = b.assignedProfessionalId ? store.professionalById(b.assignedProfessionalId) : null
              return (
                <div key={b.id} className="hs-booking-card">
                  <div className="hs-booking-card-top">
                    <b>{service?.name ?? ''}</b>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <HsPaymentBadge status={b.paymentStatus} />
                      <HsStatusBadge status={b.status} />
                    </div>
                  </div>
                  <div className="hs-booking-meta">
                    <span><MdSchedule aria-hidden="true" /> {formatDateTime(b.scheduledStart)}</span>
                    <span>{b.number} · {b.addressLine}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>
                      {pro ? <>Professional: <b>{pro.name}</b></> : <b style={{ color: '#b45309' }}>Unassigned</b>}
                    </span>
                    <b style={{ color: 'var(--hs-brand)' }}>{money(b.currentQuote)}</b>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {b.status === 'AwaitingProvider' && (
                      <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" onClick={() => store.adminReassign(b.id)}>
                        <MdSwapHoriz aria-hidden="true" /> Reassign professional
                      </button>
                    )}
                    {b.status === 'Upcoming' && (
                      <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => store.adminUpdateStatus(b.id, 'Cancelled', 'Cancelled by operations')}>
                        Cancel booking
                      </button>
                    )}
                    {['OnTheWay', 'Arrived', 'InService'].includes(b.status) && (
                      <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => store.adminUpdateStatus(b.id, 'Completed', 'Closed by operations')}>
                        Force complete
                      </button>
                    )}
                    {b.status === 'PaymentPending' && (
                      <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => store.adminUpdateStatus(b.id, 'Completed', 'Payment reconciled')}>
                        Mark payment received
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}