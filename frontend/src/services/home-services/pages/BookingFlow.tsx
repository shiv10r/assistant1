import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MdArrowBack, MdArrowForward, MdCheckCircle, MdLocationOn, MdSchedule, MdSecurity } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, HsSection, HsEmpty, formatDateTime } from '../hsShared'
import { CITIES } from '../homeServicesData'

type BookState = {
  serviceId: string
  packageId: string
  addOnIds: readonly string[]
  emergency: boolean
  couponCode: string | null
}

type BookingFlowProps = {
  readonly state?: BookState | null
}

function StepBadge({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return <span className={`hs-step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>{done ? <MdCheckCircle aria-hidden="true" /> : <span>{step}</span>} {label}</span>
}

export default function BookingFlow({ state }: BookingFlowProps) {
  const location = useLocation()
  const store = useHomeServicesStore()
  const flowState: BookState | null = state ?? (location.state as BookState | null)

  const service = flowState ? store.serviceById(flowState.serviceId) : null
  const pkg = flowState ? store.packageById(flowState.packageId) : null

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [cityId, setCityId] = useState(store.activeCustomer.cityId)
  const [localityId, setLocalityId] = useState('')
  const [addressLine, setAddressLine] = useState('Flat 101, Green Heights Apartments')
  const [date, setDate] = useState('')
  const [slotStart, setSlotStart] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [processing, setProcessing] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const city = CITIES.find((c) => c.id === cityId)
  const availableDates = useMemo(() => {
    const dates: string[] = []
    const base = new Date()
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      dates.push(d.toISOString().slice(0, 10))
    }
    return dates
  }, [])

  const slots = useMemo(() => {
    if (!flowState || !date || !localityId) return []
    return store.availableSlotsFor(flowState.serviceId, cityId, localityId, date).filter((s) => s.status === 'Available')
  }, [flowState, date, cityId, localityId, store])

  const quote = useMemo(() => {
    if (!flowState || !date || !slotStart) return null
    try {
      return store.computeQuote({
        serviceId: flowState.serviceId,
        packageId: flowState.packageId,
        addOnIds: flowState.addOnIds,
        cityId,
        date,
        emergency: flowState.emergency,
        couponCode: flowState.couponCode,
        membershipId: store.activeCustomer.membershipId,
      })
    } catch {
      return null
    }
  }, [flowState, date, slotStart, cityId, store])

  if (!flowState || !service || !pkg) {
    return (
      <HomeServicesShell>
        <HsEmpty
          title="No booking in progress"
          body="Pick a service and package first, then book a professional."
          action={<Link className="hs-btn hs-btn--primary" to="/home-services/categories">Browse services</Link>}
        />
      </HomeServicesShell>
    )
  }

  const slotDateTime = date && slotStart ? `${date}T${slotStart}:00` : null

  function next() {
    setError(null)
    if (step === 1 && !localityId) { setError('Please choose your locality so we can check serviceability.'); return }
    if (step === 2 && !slotDateTime) { setError('Please pick a date and time slot.'); return }
    setStep((s) => (s + 1) as 1 | 2 | 3 | 4)
  }

  function confirmBooking() {
    if (!flowState || !quote || !slotDateTime || !localityId) return
    setProcessing(true)
    setError(null)
    setTimeout(() => {
      try {
        const booking = store.createBooking({
          customer: store.activeCustomer,
          serviceId: flowState.serviceId,
          packageId: flowState.packageId,
          addOnIds: flowState.addOnIds,
          cityId,
          localityId,
          addressLine,
          scheduledStart: slotDateTime,
          quote,
          paymentMethod,
          customerNotes: '',
          emergency: flowState.emergency,
          couponCode: flowState.couponCode,
        })
        setCreatedBookingId(booking.id)
        setStep(4)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not create the booking. Please try again.')
      } finally {
        setProcessing(false)
      }
    }, 600)
  }

  if (createdBookingId) {
    const booking = store.bookings.find((b) => b.id === createdBookingId)
    return (
      <HomeServicesShell>
        <div className="hs-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <MdCheckCircle aria-hidden="true" style={{ fontSize: 48, color: '#15803d', marginBottom: 12 }} />
          <h2 style={{ margin: '0 0 8px' }}>Booking confirmed!</h2>
          <p style={{ color: 'var(--hs-muted)', fontSize: 13, margin: '0 0 18px' }}>
            {booking ? `Booking ${booking.number} · ${formatDateTime(booking.scheduledStart)}` : 'We are finding you a professional.'}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="hs-btn hs-btn--primary" to={`/home-services/bookings/${createdBookingId}`}>Track booking</Link>
            <Link className="hs-btn hs-btn--secondary" to="/home-services">Back home</Link>
          </div>
        </div>
      </HomeServicesShell>
    )
  }

  return (
    <HomeServicesShell>
      <div className="hs-section">
        <Link to={`/home-services/services/${service.slug}`} className="hs-btn hs-btn--ghost hs-btn--sm" style={{ marginBottom: 12 }}>
          <MdArrowBack aria-hidden="true" /> {service.name}
        </Link>

        <div className="hs-stepper" aria-label="Booking steps">
          <StepBadge step={1} label="Address" active={step === 1} done={step > 1} />
          <StepBadge step={2} label="Slot" active={step === 2} done={step > 2} />
          <StepBadge step={3} label="Quote" active={step === 3} done={step > 3} />
          <StepBadge step={4} label="Done" active={step === 4} done={false} />
        </div>

        {error && <div className="hs-alert hs-alert--error">{error}</div>}

        {step === 1 && (
          <section className="hs-section">
            <HsSection title="Where should we come?" />
            <div className="hs-card">
              <div className="hs-field">
                <label htmlFor="hs-city">City</label>
                <select id="hs-city" className="hs-select" value={cityId} onChange={(e) => { setCityId(e.target.value); setLocalityId('') }}>
                  {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="hs-field">
                <label htmlFor="hs-locality">Locality</label>
                <select id="hs-locality" className="hs-select" value={localityId} onChange={(e) => setLocalityId(e.target.value)}>
                  <option value="">Select locality</option>
                  {city?.localities.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.pincode}</option>)}
                </select>
              </div>
              <div className="hs-field">
                <label htmlFor="hs-address">Address</label>
                <textarea id="hs-address" className="hs-textarea" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--hs-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdLocationOn aria-hidden="true" /> We check availability of professionals in this area before booking.
              </p>
              <button type="button" className="hs-btn hs-btn--primary hs-btn--block" onClick={next}>Continue <MdArrowForward aria-hidden="true" /></button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="hs-section">
            <HsSection title="Pick a date & time" />
            <div className="hs-card">
              <div className="hs-field">
                <label htmlFor="hs-date">Date</label>
                <select id="hs-date" className="hs-select" value={date} onChange={(e) => { setDate(e.target.value); setSlotStart('') }}>
                  <option value="">Select date</option>
                  {availableDates.map((d) => (
                    <option key={d} value={d}>{new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</option>
                  ))}
                </select>
              </div>
              {date && (
                <div className="hs-field">
                  <label>Available slots</label>
                  {slots.length === 0 ? (
                    <div className="hs-alert hs-alert--warning"><MdSchedule aria-hidden="true" /> No professionals available on this date yet. Try another day.</div>
                  ) : (
                    <div className="hs-slot-grid">
                      {slots.map((s) => (
                        <button key={s.id} type="button" className={`hs-slot ${slotStart === s.start ? 'is-selected' : ''}`} onClick={() => setSlotStart(s.start)}>
                          {s.start}
                          <small>available</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button type="button" className="hs-btn hs-btn--primary hs-btn--block" onClick={next} disabled={!slotDateTime}>Continue <MdArrowForward aria-hidden="true" /></button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="hs-section">
            <HsSection title="Review your quote" />
            {quote ? (
              <div className="hs-quote">
                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--hs-muted)' }}>
                  {service.name} — {pkg.name} · {slotDateTime ? formatDateTime(slotDateTime) : ''}
                </p>
                {quote.lines.map((line) => (
                  <div key={line.label} className={`hs-quote-row ${line.amount < 0 ? 'hs-quote-row--discount' : ''}`}>
                    <span>{line.label}</span>
                    <span>{line.amount < 0 ? `- ${money(-line.amount)}` : money(line.amount)}</span>
                  </div>
                ))}
                <div className="hs-quote-row hs-quote-row--total">
                  <span>Total</span>
                  <span>{money(quote.total)}</span>
                </div>

                <div className="hs-field" style={{ marginTop: 14 }}>
                  <label htmlFor="hs-payment">Payment method</label>
                  <select id="hs-payment" className="hs-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="UPI">UPI</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Pay at service</option>
                  </select>
                </div>

                <div className="hs-alert hs-alert--info" style={{ marginTop: 4 }}>
                  <MdSecurity aria-hidden="true" style={{ fontSize: 18, flexShrink: 0 }} />
                  <span>Price is locked at this quote. You approve any additional work before it starts.</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button type="button" className="hs-btn hs-btn--secondary" onClick={() => setStep(2)}>Back</button>
                  <button type="button" className="hs-btn hs-btn--primary" style={{ flex: 1 }} onClick={confirmBooking} disabled={processing}>
                    {processing ? 'Booking...' : `Pay ${money(quote.total)} & book`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="hs-alert hs-alert--warning">Complete the previous steps to see your quote.</div>
            )}
          </section>
        )}

        {step === 4 && (
          <section className="hs-section">
            <HsSection title="Booking" />
            <div className="hs-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <MdCheckCircle aria-hidden="true" style={{ fontSize: 44, color: '#15803d', marginBottom: 10 }} />
              <h2 style={{ margin: '0 0 6px' }}>Booking placed</h2>
              <p style={{ color: 'var(--hs-muted)', fontSize: 13 }}>We are matching you with a verified professional.</p>
              <Link className="hs-btn hs-btn--primary" to="/home-services/bookings">View my bookings</Link>
            </div>
          </section>
        )}
      </div>
    </HomeServicesShell>
  )
}