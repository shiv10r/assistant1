import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  MdArrowBack, MdCheckCircle, MdDirectionsWalk, MdEventAvailable, MdHandshake,
  MdLocationOn, MdSchedule, MdWarning,
} from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge } from '../../hsShared'
import { PROFESSIONALS } from '../../homeServicesData'

const PROFILE = PROFESSIONALS[0]

export default function ProJobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const store = useHomeServicesStore()
  const booking = store.bookings.find((b) => b.id === jobId)
  const [report, setReport] = useState('')
  const [addlQuote, setAddlQuote] = useState('')
  const service = booking ? store.serviceById(booking.serviceId) : null
  const pkg = booking ? store.packageById(booking.packageId) : null

  if (!booking || !service || !pkg) {
    return (
      <HomeServicesShell>
        <HsEmpty title="Job not found" action={<Link className="hs-btn hs-btn--primary" to="/home-services/pro/jobs">My jobs</Link>} />
      </HomeServicesShell>
    )
  }

  const timeline = [...booking.history].reverse()
  const isUpcoming = booking.status === 'Upcoming'
  const isActive = ['OnTheWay', 'Arrived', 'InService', 'WaitingCustomerApproval'].includes(booking.status)
  const awaitingApproval = booking.additionalQuoteStatus === 'Requested' && booking.status === 'WaitingCustomerApproval'

  return (
    <HomeServicesShell>
      <div className="hs-section">
        <Link to="/home-services/pro/jobs" className="hs-btn hs-btn--ghost hs-btn--sm" style={{ marginBottom: 12 }}>
          <MdArrowBack aria-hidden="true" /> My jobs
        </Link>

        <div className="hs-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>{service.name}</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--hs-muted)', fontSize: 12 }}>{booking.number} · {pkg.name} · {booking.emergency ? 'Emergency' : 'Standard'}</p>
            </div>
            <HsStatusBadge status={booking.status} />
          </div>
          <div className="hs-booking-meta">
            <span><MdSchedule aria-hidden="true" /> {formatDateTime(booking.scheduledStart)}</span>
            <span><MdLocationOn aria-hidden="true" /> {booking.addressLine}</span>
          </div>
          <b style={{ color: 'var(--hs-brand)' }}>{money(booking.currentQuote)}</b>
          <p style={{ fontSize: 12, color: 'var(--hs-muted)', margin: '6px 0 0' }}>
            Your earnings: <b style={{ color: '#15803d' }}>{money(Math.round((booking.currentQuote * 85) / 100))}</b> (85% after platform fee)
          </p>
        </div>

        {isUpcoming && (
          <div className="hs-alert hs-alert--info" style={{ marginBottom: 12 }}>
            <MdEventAvailable aria-hidden="true" />
            <span>Customer confirmed. Start travelling when you are on your way.</span>
          </div>
        )}

        {isActive && (
          <div className="hs-card" style={{ marginBottom: 12 }}>
            <HsSection title="Job actions" />
            {booking.status === 'OnTheWay' && (
              <button type="button" className="hs-btn hs-btn--primary hs-btn--block" onClick={() => store.professionalTransition(booking.id, PROFILE.id, 'Arrived', 'Professional reached the location')}>
                <MdDirectionsWalk aria-hidden="true" /> I have arrived
              </button>
            )}
            {booking.status === 'Arrived' && (
              <button type="button" className="hs-btn hs-btn--primary hs-btn--block" onClick={() => store.professionalTransition(booking.id, PROFILE.id, 'InService', 'Work started')}>
                <MdHandshake aria-hidden="true" /> Start service
              </button>
            )}
            {booking.status === 'InService' && (
              <div>
                <div className="hs-field">
                  <label htmlFor="hs-addl-quote">Additional work quote (₹) — optional</label>
                  <input id="hs-addl-quote" type="number" className="hs-input" value={addlQuote} onChange={(e) => setAddlQuote(e.target.value)} placeholder="e.g. 500 for extra fittings" />
                </div>
                {addlQuote && Number(addlQuote) > 0 && (
                  <button type="button" className="hs-btn hs-btn--secondary" onClick={() => { store.requestAdditionalQuote(booking.id, PROFILE.id, Number(addlQuote)); setAddlQuote(''); }}>
                    <MdWarning aria-hidden="true" /> Request customer approval
                  </button>
                )}
                <div className="hs-field" style={{ marginTop: 12 }}>
                  <label htmlFor="hs-report">Service report</label>
                  <textarea id="hs-report" className="hs-textarea" value={report} onChange={(e) => setReport(e.target.value)} placeholder="What did you complete?" />
                </div>
                <button type="button" className="hs-btn hs-btn--primary hs-btn--block" disabled={report.trim().length === 0} onClick={() => store.completeBooking(booking.id, PROFILE.id, report.trim(), [])}>
                  <MdCheckCircle aria-hidden="true" /> Mark completed
                </button>
              </div>
            )}
            {awaitingApproval && (
              <div className="hs-alert hs-alert--warning">
                <MdWarning aria-hidden="true" />
                <span>Waiting for customer to approve additional work of {money(booking.additionalQuote ?? 0)}.</span>
              </div>
            )}
          </div>
        )}

        <div className="hs-card" style={{ marginBottom: 12 }}>
          <HsSection title="Timeline" />
          <div className="hs-timeline">
            {timeline.map((entry, index) => (
              <div key={`${entry.changedAt}-${index}`} className={`hs-timeline-item ${index === 0 ? 'is-current' : ''}`}>
                {entry.reason ? `${entry.to} — ${entry.reason}` : entry.to}
                <small>{formatDateTime(entry.changedAt)} · by {entry.changedBy}</small>
              </div>
            ))}
          </div>
        </div>

        {booking.serviceReport && (
          <div className="hs-card">
            <HsSection title="Service report" />
            <p style={{ fontSize: 13, margin: 0 }}>{booking.serviceReport}</p>
          </div>
        )}
      </div>
    </HomeServicesShell>
  )
}