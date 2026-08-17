import { Link } from 'react-router-dom'
import {
  MdAssignmentTurnedIn, MdAccountBalanceWallet, MdEventAvailable, MdPendingActions,
  MdVerifiedUser, MdWorkspacePremium, MdStar, MdArrowForward, MdCheckCircle, MdCancel,
} from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsSection, HsStatusBadge, HsStars, HsLevelBadge } from '../../hsShared'
import { PROFESSIONALS } from '../../homeServicesData'

const PROFILE = PROFESSIONALS[0] // demo: Ramesh Kumar, active electrician in Delhi

export default function ProDashboard() {
  const store = useHomeServicesStore()
  const myBookings = store.bookingsForProfessional(PROFILE.id)
  const myEarnings = store.earningsFor(PROFILE.id)
  const myPayouts = store.payoutsFor(PROFILE.id)
  const requests = myBookings.filter((b) => b.status === 'AwaitingProvider')
  const upcoming = myBookings.filter((b) => b.status === 'Upcoming')
  const active = myBookings.filter((b) => ['OnTheWay', 'Arrived', 'InService', 'WaitingCustomerApproval'].includes(b.status))
  const completed = myBookings.filter((b) => b.status === 'Completed')

  const eligibleEarnings = myEarnings.filter((e) => e.status === 'Eligible').reduce((sum, e) => sum + e.earningAmount, 0)
  const paidOut = myPayouts.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <div className="hs-card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <img className="hs-avatar hs-avatar--lg" src={PROFILE.image} alt={PROFILE.name} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              {PROFILE.name} <HsLevelBadge level={PROFILE.level} />
            </strong>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
              <HsStars rating={PROFILE.rating} />
              <span style={{ fontSize: 12, color: 'var(--hs-muted)' }}>{PROFILE.completedJobs} jobs</span>
            </div>
          </div>
          <Link to="/home-services/pro/profile" className="hs-btn hs-btn--secondary hs-btn--sm">Profile</Link>
        </div>

        <div className="hs-stat-grid">
          <div className="hs-stat"><small><MdPendingActions aria-hidden="true" /> New requests</small><b>{requests.length}</b></div>
          <div className="hs-stat"><small><MdEventAvailable aria-hidden="true" /> Upcoming</small><b>{upcoming.length}</b></div>
          <div className="hs-stat"><small><MdAssignmentTurnedIn aria-hidden="true" /> Active jobs</small><b>{active.length}</b></div>
          <div className="hs-stat"><small><MdAccountBalanceWallet aria-hidden="true" /> Balance</small><b>{money(eligibleEarnings - paidOut)}</b></div>
        </div>
      </section>

      {requests.length > 0 && (
        <section className="hs-section">
          <HsSection title="New booking requests" action={<Link to="/home-services/pro/requests">Review <MdArrowForward aria-hidden="true" /></Link>} />
          <div className="hs-list">
            {requests.slice(0, 3).map((b) => {
              const service = store.serviceById(b.serviceId)
              return (
                <Link key={b.id} to="/home-services/pro/requests" className="hs-booking-card">
                  <div className="hs-booking-card-top">
                    <b>{service?.name ?? ''}</b>
                    <HsStatusBadge status={b.status} />
                  </div>
                  <div className="hs-booking-meta">
                    <span><MdEventAvailable aria-hidden="true" /> {formatDateTime(b.scheduledStart)}</span>
                    <span>{b.addressLine}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" onClick={(e) => { e.preventDefault(); store.professionalAccept(b.id, PROFILE.id); }}><MdCheckCircle aria-hidden="true" /> Accept</button>
                    <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={(e) => { e.preventDefault(); store.professionalDecline(b.id, PROFILE.id); }}><MdCancel aria-hidden="true" /> Decline</button>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="hs-section">
        <HsSection title="Active & upcoming jobs" action={<Link to="/home-services/pro/jobs">All jobs <MdArrowForward aria-hidden="true" /></Link>} />
        {[...active, ...upcoming].length === 0 ? (
          <div className="hs-alert hs-alert--info">No active jobs right now. New requests appear here instantly.</div>
        ) : (
          <div className="hs-list">
            {[...active, ...upcoming].map((b) => {
              const service = store.serviceById(b.serviceId)
              return (
                <Link key={b.id} to={`/home-services/pro/jobs/${b.id}`} className="hs-booking-card">
                  <div className="hs-booking-card-top">
                    <b>{service?.name ?? ''}</b>
                    <HsStatusBadge status={b.status} />
                  </div>
                  <div className="hs-booking-meta">
                    <span><MdEventAvailable aria-hidden="true" /> {formatDateTime(b.scheduledStart)}</span>
                    <span>{b.addressLine}</span>
                  </div>
                  <b style={{ color: 'var(--hs-brand)' }}>{money(b.currentQuote)}</b>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="hs-section">
        <HsSection title="This week" action={<Link to="/home-services/pro/earnings">Earnings <MdArrowForward aria-hidden="true" /></Link>} />
        <div className="hs-stat-grid">
          <div className="hs-stat"><small>Completed jobs</small><b>{completed.length}</b></div>
          <div className="hs-stat"><small><MdWorkspacePremium aria-hidden="true" /> Level</small><b>{PROFILE.level}</b></div>
          <div className="hs-stat"><small><MdVerifiedUser aria-hidden="true" /> Verified</small><b>{PROFILE.verified ? 'Yes' : 'No'}</b></div>
          <div className="hs-stat"><small><MdStar aria-hidden="true" /> Rating</small><b>{PROFILE.rating.toFixed(1)}</b></div>
        </div>
      </section>
    </HomeServicesShell>
  )
}