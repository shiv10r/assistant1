import { Link } from 'react-router-dom'
import { MdCancel, MdCheckCircle, MdEventAvailable, MdLocationOn, MdSchedule } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge } from '../../hsShared'
import { PROFESSIONALS } from '../../homeServicesData'

const PROFILE = PROFESSIONALS[0]

export default function ProRequests() {
  const store = useHomeServicesStore()
  const requests = store.bookingsForProfessional(PROFILE.id).filter((b) => b.status === 'AwaitingProvider')

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="New booking requests" />
        {requests.length === 0 ? (
          <HsEmpty icon={<MdEventAvailable aria-hidden="true" />} title="No pending requests" body="You're all caught up. New requests will appear here." />
        ) : (
          <div className="hs-list">
            {requests.map((b) => {
              const service = store.serviceById(b.serviceId)
              const pkg = store.packageById(b.packageId)
              return (
                <div key={b.id} className="hs-booking-card">
                  <div className="hs-booking-card-top">
                    <b>{service?.name ?? ''}</b>
                    <HsStatusBadge status={b.status} />
                  </div>
                  <div className="hs-booking-meta">
                    <span><MdSchedule aria-hidden="true" /> {formatDateTime(b.scheduledStart)}</span>
                    <span><MdLocationOn aria-hidden="true" /> {b.addressLine}</span>
                  </div>
                  <div className="hs-booking-meta">
                    <span>{pkg?.name ?? ''} package</span>
                    <span>{b.emergency ? 'Emergency' : 'Standard'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <b style={{ color: 'var(--hs-brand)' }}>{money(b.currentQuote)}</b>
                    <span style={{ fontSize: 11, color: 'var(--hs-muted)' }}>Estimated earnings: {money(Math.round((b.currentQuote * 85) / 100))}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button type="button" className="hs-btn hs-btn--primary" style={{ flex: 1 }} onClick={() => store.professionalAccept(b.id, PROFILE.id)}>
                      <MdCheckCircle aria-hidden="true" /> Accept job
                    </button>
                    <button type="button" className="hs-btn hs-btn--secondary" onClick={() => store.professionalDecline(b.id, PROFILE.id)}>
                      <MdCancel aria-hidden="true" /> Decline
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--hs-muted)', marginTop: 8 }}>
                    Accepting keeps your acceptance rate healthy. Declining reassigns the booking to another professional.
                  </p>
                </div>
              )
            })}
          </div>
        )}
        <Link to="/home-services/pro" className="hs-btn hs-btn--secondary hs-btn--block" style={{ marginTop: 12 }}>Back to dashboard</Link>
      </section>
    </HomeServicesShell>
  )
}