import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Video } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_APPOINTMENTS, MEDICAL_DOCTORS, medicalDoctorById, medicalFormatDateTime } from '../medicalData'
import { useMedicalStore } from '../medicalStore'
import MedicalShell from '../MedicalShell'

export default function MedicalAppointments() {
  const store = useMedicalStore()
  const [showForm, setShowForm] = useState(false)
  const [doctorId, setDoctorId] = useState(MEDICAL_DOCTORS[0]?.id ?? '')
  const [patientName, setPatientName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<'In-clinic' | 'Video'>('In-clinic')
  const [reason, setReason] = useState('')
  const [justBooked, setJustBooked] = useState('')

  const allAppointments = useMemo(() => {
    const booked = store.bookedAppointments.map((appointment) => ({
      id: appointment.id,
      patientId: 'pat-001',
      doctorId: appointment.doctorId,
      type: appointment.type,
      startAt: `${appointment.date}T${appointment.time}`,
      reason: appointment.reason,
      status: appointment.status,
      facility: appointment.facility,
    }))
    return [...booked, ...MEDICAL_APPOINTMENTS]
  }, [store.bookedAppointments])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!doctorId || !patientName.trim() || !date || !time || !reason.trim()) return
    const doctor = medicalDoctorById(doctorId)
    const appointment = {
      id: `apt-user-${Date.now()}`,
      doctorId,
      patientName: patientName.trim(),
      date,
      time,
      type,
      reason: reason.trim(),
      status: 'Confirmed' as const,
      facility: doctor?.facility ?? 'VSR Health',
    }
    store.bookAppointment(appointment)
    setJustBooked(appointment.id)
    setShowForm(false)
    setPatientName('')
    setDate('')
    setTime('')
    setReason('')
  }

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><CalendarDays aria-hidden="true" /> Appointments</h1>
        <p>Review your upcoming visits or book a new consultation with any specialist.</p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <button className="med-btn" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? 'Close booking form' : '+ Book New Appointment'}
        </button>
      </div>

      {showForm && (
        <div className="med-card" style={{ marginBottom: 22 }}>
          <h2><CalendarDays aria-hidden="true" /> Book an Appointment</h2>
          <form className="med-form" onSubmit={handleSubmit}>
            <div className="med-form-row">
              <label>
                Doctor
                <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
                  {MEDICAL_DOCTORS.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.specialty}</option>
                  ))}
                </select>
              </label>
              <label>
                Patient Name
                <input value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Full name" />
              </label>
            </div>
            <div className="med-form-row">
              <label>
                Date
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
              <label>
                Time
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
              </label>
            </div>
            <div className="med-form-row">
              <label>
                Consultation Type
                <select value={type} onChange={(event) => setType(event.target.value as 'In-clinic' | 'Video')}>
                  <option value="In-clinic">In-clinic</option>
                  <option value="Video">Video</option>
                </select>
              </label>
              <label>
                Reason for Visit
                <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Brief reason…" />
              </label>
            </div>
            <div>
              <button className="med-btn" type="submit">Confirm Booking</button>
            </div>
          </form>
        </div>
      )}

      {justBooked && (
        <div className="med-note" style={{ marginBottom: 16 }}>
          <CheckCircle2 aria-hidden="true" /> Appointment booked successfully. It appears at the top of your list.
        </div>
      )}

      <section className="med-card">
        <h2><CalendarDays aria-hidden="true" /> All Appointments</h2>
        {allAppointments.length > 0 ? (
          <div className="med-appt-list">
            {allAppointments.map((appointment) => {
              const doctor = medicalDoctorById(appointment.doctorId)
              return (
                <div key={appointment.id} className="med-appt-card">
                  <div className="med-appt-date">
                    <strong>{new Date(appointment.startAt).getDate()}</strong>
                    <small>{new Date(appointment.startAt).toLocaleDateString('en-IN', { month: 'short' })}</small>
                  </div>
                  <div className="med-appt-main">
                    <div className="med-appt-title">{appointment.reason}</div>
                    <div className="med-appt-meta">
                      <span>{doctor?.name ?? 'Unknown doctor'}</span>
                      <span>{medicalFormatDateTime(appointment.startAt)}</span>
                      <span>{appointment.facility}</span>
                      {appointment.type === 'Video' && <span><Video aria-hidden="true" /> Video</span>}
                    </div>
                  </div>
                  <span className={cn('med-status', `is-${appointment.status.toLowerCase()}`)}>{appointment.status}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="med-empty">
            <CalendarDays aria-hidden="true" />
            <h3>No appointments yet</h3>
            <p>Book your first consultation to get started with VSR Health.</p>
          </div>
        )}
      </section>
    </main>
    </MedicalShell>
  )
}