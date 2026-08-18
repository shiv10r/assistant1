import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdEventAvailable } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge } from '../../hsShared'
import type { BookingStatus } from '../../homeServicesData'

const COLUMNS: readonly BookingStatus[] = [
  'AwaitingProvider',
  'Upcoming',
  'OnTheWay',
  'Arrived',
  'InService',
  'WaitingCustomerApproval',
  'Completed',
  'Cancelled',
]

export default function AdminLiveOps() {
  const store = useHomeServicesStore()
  const [autoAssign, setAutoAssign] = useState(true)

  const byStatus = (status: BookingStatus) => store.bookings.filter((b) => b.status === status)
  const total = store.bookings.length

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <HsSection title="Live operations" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--hs-muted)' }}>
            <input type="checkbox" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} />
            Auto-assign enabled
          </label>
        </div>
        <p style={{ fontSize: 12, color: 'var(--hs-muted)', margin: '-8px 0 14px' }}>
          {total} bookings in the pipeline · drag & drop is simulated in this demo — use booking actions instead.
        </p>

        {store.bookings.length === 0 ? (
          <HsEmpty icon={<MdEventAvailable aria-hidden="true" />} title="No bookings yet" body="New bookings will appear here in real time." />
        ) : (
          <div className="hs-kanban">
            {COLUMNS.map((col) => {
              const items = byStatus(col)
              return (
                <div key={col} className="hs-kanban-col">
                  <div className="hs-kanban-head">
                    <HsStatusBadge status={col} />
                    <span className="hs-kanban-count">{items.length}</span>
                  </div>
                  {items.map((b) => {
                    const service = store.serviceById(b.serviceId)
                    return (
                      <div key={b.id} className="hs-kanban-card">
                        <b style={{ fontSize: 13 }}>{service?.name ?? ''}</b>
                        <small style={{ display: 'block', color: 'var(--hs-muted)', margin: '2px 0 6px' }}>{b.number}</small>
                        <div className="hs-booking-meta" style={{ marginBottom: 6 }}>
                          <span>{formatDateTime(b.scheduledStart)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                          <b style={{ color: 'var(--hs-brand)' }}>{money(b.currentQuote)}</b>
                          <Link to="/home-services/admin/bookings" className="hs-btn hs-btn--ghost hs-btn--sm">Manage</Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}