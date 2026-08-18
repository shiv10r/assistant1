import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdArrowBack, MdCall, MdCancel, MdCheckCircle, MdChat, MdEventAvailable, MdLocationOn, MdSend, MdStar, MdVerifiedUser } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, formatDateTime, HsEmpty, HsSection, HsStatusBadge, HsStars, HsPaymentBadge } from '../hsShared'

export default function BookingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const store = useHomeServicesStore()
  const booking = store.bookings.find((b) => b.id === bookingId)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewPosted, setReviewPosted] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('Changed my mind')
  const [disputeReason, setDisputeReason] = useState('')

  const service = booking ? store.serviceById(booking.serviceId) : null
  const pkg = booking ? store.packageById(booking.packageId) : null
  const professional = booking?.assignedProfessionalId ? store.professionalById(booking.assignedProfessionalId) : null
  const existingReview = booking ? store.reviewForBooking(booking.id) : null

  if (!booking || !service || !pkg) {
    return (
      <HomeServicesShell>
        <HsEmpty title="Booking not found" action={<Link className="hs-btn hs-btn--primary" to="/home-services/bookings">My bookings</Link>} />
      </HomeServicesShell>
    )
  }

  const timeline = [...booking.history].reverse()
  const canCancel = !['Completed', 'Cancelled'].includes(booking.status)
  const canReview = booking.status === 'Completed' && !existingReview && !reviewPosted
  const proName = professional?.name ?? 'Finding a professional…'

  function submitReview() {
    if (!booking || !professional) return
    const ok = store.addReview({
      bookingId: booking.id,
      customer: store.activeCustomer,
      professionalId: professional.id,
      rating,
      comment,
    })
    if (ok) setReviewPosted(true)
  }

  return (
    <HomeServicesShell>
      <div className="hs-section">
        <Link to="/home-services/bookings" className="hs-btn hs-btn--ghost hs-btn--sm" style={{ marginBottom: 12 }}>
          <MdArrowBack aria-hidden="true" /> My bookings
        </Link>

        <div className="hs-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>{service.name}</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--hs-muted)', fontSize: 12 }}>{booking.number} · {pkg.name}</p>
            </div>
            <HsStatusBadge status={booking.status} />
          </div>
          <div className="hs-booking-meta">
            <span><MdEventAvailable aria-hidden="true" /> {formatDateTime(booking.scheduledStart)}</span>
            <span><MdLocationOn aria-hidden="true" /> {booking.addressLine}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <HsPaymentBadge status={booking.paymentStatus} />
            <b style={{ fontSize: 16, color: 'var(--hs-brand)' }}>{money(booking.currentQuote)}</b>
          </div>
        </div>

        {professional && (
          <div className="hs-card" style={{ marginBottom: 12 }}>
            <HsSection title="Your professional" />
            <div className="hs-pro-card-head" style={{ marginBottom: 10 }}>
              <img className="hs-avatar hs-avatar--lg" src={professional.image} alt={professional.name} />
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {professional.name} <MdVerifiedUser aria-hidden="true" style={{ color: '#15803d' }} />
                </strong>
                <HsStars rating={professional.rating} />
                <small style={{ display: 'block', color: 'var(--hs-muted)' }}>{professional.completedJobs} jobs · {professional.experienceYears} yrs exp</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a className="hs-btn hs-btn--secondary hs-btn--sm" href={`tel:${professional.phone}`}><MdCall aria-hidden="true" /> Call</a>
              <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => { /* masked chat */ }}><MdChat aria-hidden="true" /> Chat</button>
            </div>
          </div>
        )}

        {booking.status === 'WaitingCustomerApproval' && booking.additionalQuote && booking.additionalQuoteStatus === 'Requested' && (
          <div className="hs-card" style={{ borderColor: '#fbbf24', marginBottom: 12 }}>
            <h3 style={{ margin: '0 0 6px' }}>Additional work needs approval</h3>
            <p style={{ fontSize: 13, color: '#44403c', margin: '0 0 10px' }}>
              The professional found additional work. Approving adds <b>{money(booking.additionalQuote)}</b> to your booking.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" onClick={() => store.approveAdditionalQuote(booking.id, store.activeCustomer.id)}>
                Approve {money(booking.additionalQuote)}
              </button>
              <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => store.declineAdditionalQuote(booking.id, store.activeCustomer.id)}>
                Decline
              </button>
            </div>
          </div>
        )}

        <div className="hs-card" style={{ marginBottom: 12 }}>
          <HsSection title="Timeline" />
          <div className="hs-timeline">
            {timeline.map((entry, index) => (
              <div key={`${entry.changedAt}-${index}`} className={`hs-timeline-item ${index === 0 ? 'is-current' : ''}`}>
                {entry.to === 'AwaitingProvider' ? `Matched with ${proName}` : entry.reason ? `${entry.to} — ${entry.reason}` : entry.to}
                <small>{formatDateTime(entry.changedAt)} · by {entry.changedBy}</small>
              </div>
            ))}
          </div>
        </div>

        {booking.serviceReport && (
          <div className="hs-card" style={{ marginBottom: 12 }}>
            <HsSection title="Service report" />
            <p style={{ fontSize: 13, margin: 0 }}>{booking.serviceReport}</p>
            {booking.checklist.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {booking.checklist.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, padding: '4px 0' }}>
                    <MdCheckCircle aria-hidden="true" style={{ color: '#15803d' }} /> {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {canReview && (
          <div className="hs-card" style={{ marginBottom: 12 }}>
            <HsSection title="Review this service" />
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="hs-slot" style={{ minWidth: 44 }} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <MdStar aria-hidden="true" style={{ color: n <= rating ? '#f59e0b' : '#d6d3d1' }} />
                </button>
              ))}
            </div>
            <div className="hs-field">
              <textarea className="hs-textarea" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <button type="button" className="hs-btn hs-btn--primary" onClick={submitReview} disabled={comment.trim().length === 0}>
              <MdSend aria-hidden="true" /> Submit review
            </button>
          </div>
        )}

        {reviewPosted && (
          <div className="hs-alert hs-alert--success">Thanks! Your review helps other customers.</div>
        )}

        {!cancelOpen && canCancel && (
          <button type="button" className="hs-btn hs-btn--secondary hs-btn--block" onClick={() => setCancelOpen(true)}>
            <MdCancel aria-hidden="true" /> Cancel booking
          </button>
        )}

        {cancelOpen && canCancel && (
          <div className="hs-card" style={{ borderColor: '#fecaca' }}>
            <h3 style={{ margin: '0 0 8px' }}>Cancel booking {booking.number}?</h3>
            <div className="hs-field">
              <select className="hs-select" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                <option>Changed my mind</option>
                <option>Found another provider</option>
                <option>Booked by mistake</option>
                <option>Service no longer needed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="hs-btn hs-btn--primary"
                onClick={() => {
                  store.cancelBooking(booking.id, store.activeCustomer.id, cancelReason)
                  setCancelOpen(false)
                }}
              >
                Confirm cancellation
              </button>
              <button type="button" className="hs-btn hs-btn--secondary" onClick={() => setCancelOpen(false)}>Keep booking</button>
            </div>
          </div>
        )}

        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--hs-muted)', fontWeight: 700 }}>Having a problem? Open a dispute</summary>
          <div className="hs-card" style={{ marginTop: 10 }}>
            <div className="hs-field">
              <textarea className="hs-textarea" placeholder="Describe the issue..." value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
            </div>
            <button
              type="button"
              className="hs-btn hs-btn--secondary"
              disabled={disputeReason.trim().length === 0 || !professional}
              onClick={() => {
                if (!professional) return
                store.openDispute({ bookingId: booking.id, customer: store.activeCustomer, professionalId: professional.id, reason: disputeReason })
                setDisputeReason('')
                alert('Dispute submitted. Our operations team will review it.')
              }}
            >
              Submit dispute
            </button>
          </div>
        </details>
      </div>
    </HomeServicesShell>
  )
}