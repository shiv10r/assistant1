import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdEventAvailable, MdLocationOn, MdSchedule } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge } from '../../hsShared'
import { PROFESSIONALS } from '../../homeServicesData'

const PROFILE = PROFESSIONALS[0]
const TABS = ['All', 'Active', 'Completed', 'Cancelled'] as const

export default function ProJobs() {
  const store = useHomeServicesStore()
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const mine = store.bookingsForProfessional(PROFILE.id)
  const visible = tab === 'All' ? mine : mine.filter((b) => b.status === tab)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="My jobs" />
        <div className="hs-tabs" role="tablist" aria-label="Job filters">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`hs-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <HsEmpty icon={<MdEventAvailable aria-hidden="true" />} title="No jobs here" body="Accepted jobs appear in this list." />
        ) : (
          <div className="hs-list">
            {visible.map((b) => {
              const service = store.serviceById(b.serviceId)
              return (
                <Link key={b.id} to={`/home-services/pro/jobs/${b.id}`} className="hs-booking-card">
                  <div className="hs-booking-card-top">
                    <b>{service?.name ?? ''}</b>
                    <HsStatusBadge status={b.status} />
                  </div>
                  <div className="hs-booking-meta">
                    <span><MdSchedule aria-hidden="true" /> {formatDateTime(b.scheduledStart)}</span>
                    <span><MdLocationOn aria-hidden="true" /> {b.addressLine}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--hs-muted)' }}>{b.number}</span>
                    <b style={{ color: 'var(--hs-brand)' }}>{money(b.currentQuote)}</b>
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