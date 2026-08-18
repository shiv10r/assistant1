import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdEventAvailable, MdLocationOn, MdSchedule } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge, HsPaymentBadge } from '../hsShared'
import type { BookingStatus } from '../homeServicesData'

const FILTERS: readonly { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Cancelled', label: 'Cancelled' },
]

function isActive(status: BookingStatus) {
  return !['Completed', 'Cancelled'].includes(status)
}

export default function Bookings() {
  const store = useHomeServicesStore()
  const [filter, setFilter] = useState('all')
  const mine = useMemo(() => store.bookingsForCustomer(store.activeCustomer.id), [store])

  const visible = mine.filter((b) => {
    if (filter === 'all') return true
    if (filter === 'active') return isActive(b.status)
    return b.status === filter
  })

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="My bookings" />
        <div className="hs-tabs" role="tablist" aria-label="Booking filters">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={`hs-tab ${filter === f.id ? 'is-active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <HsEmpty
            icon={<MdEventAvailable aria-hidden="true" />}
            title="No bookings here yet"
            body="Book a service and it will show up in this list."
            action={<Link className="hs-btn hs-btn--primary" to="/home-services/categories">Book a service</Link>}
          />
        ) : (
          <div className="hs-list">
            {visible.map((b) => {
              const service = store.serviceById(b.serviceId)
              return (
                <Link key={b.id} to={`/home-services/bookings/${b.id}`} className="hs-booking-card">
                  <div className="hs-booking-card-top">
                    <b>{service?.name ?? b.serviceId}</b>
                    <HsStatusBadge status={b.status} />
                  </div>
                  <div className="hs-booking-meta">
                    <span><MdSchedule aria-hidden="true" /> {formatDateTime(b.scheduledStart)}</span>
                    <span><MdLocationOn aria-hidden="true" /> {b.addressLine}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--hs-muted)' }}>{b.number}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HsPaymentBadge status={b.paymentStatus} />
                      <b style={{ color: 'var(--hs-brand)', fontSize: 15 }}>{money(b.currentQuote)}</b>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}