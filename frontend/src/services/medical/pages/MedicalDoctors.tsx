import { useMemo, useState } from 'react'
import { CalendarDays, Clock, Languages, Search, Stethoscope, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MEDICAL_DOCTORS } from '../medicalData'
import type { MedicalDepartment } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

const SPECIALTIES = ['All', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Neurology', 'ENT', 'Gynecology'] as const

export default function MedicalDoctors() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState<MedicalDepartment | 'All'>('All')
  const store = useMedicalStore()

  const filtered = useMemo(
    () =>
      MEDICAL_DOCTORS.filter((doctor) => {
        const matchesQuery = doctor.name.toLowerCase().includes(query.trim().toLowerCase())
        const matchesSpecialty = specialty === 'All' || doctor.specialty === specialty
        return matchesQuery && matchesSpecialty
      }),
    [query, specialty],
  )

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><Stethoscope aria-hidden="true" /> Find a Doctor</h1>
        <p>Browse our specialist panel and book an in-clinic or video consultation with the right expert.</p>
      </div>

      <div className="med-filters">
        <label>
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by doctor name…" />
        </label>
        <label>
          <Stethoscope aria-hidden="true" />
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value as MedicalDepartment | 'All')}>
            {SPECIALTIES.map((item) => <option key={item} value={item}>{item === 'All' ? 'All Specialties' : item}</option>)}
          </select>
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="med-doctor-grid">
          {filtered.map((doctor) => (
            <article key={doctor.id} className="med-doctor-card">
              <div className="med-doctor-top">
                <img className="med-doctor-avatar" src={doctor.image} alt={doctor.name} loading="lazy" />
                <div>
                  <div className="med-doctor-name">{doctor.name}</div>
                  <div className="med-doctor-specialty">{doctor.specialty}</div>
                </div>
              </div>
              <div className="med-doctor-meta">
                <span><Clock aria-hidden="true" /> {doctor.experienceYears} years experience</span>
                <span><Languages aria-hidden="true" /> {doctor.languages}</span>
                <span><Stethoscope aria-hidden="true" /> {doctor.consultationType}</span>
                <span><CalendarDays aria-hidden="true" /> Next available: {doctor.nextAvailable}</span>
              </div>
              <div className="med-doctor-actions">
                <Link className="med-btn" to="/medical/appointments">Book</Link>
                <span className="med-status is-confirmed" style={{ alignSelf: 'center' }}>{doctor.facility}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="med-empty">
          <Video aria-hidden="true" />
          <h3>No doctors match your search</h3>
          <p>Try a different name or clear the specialty filter to see the full panel.</p>
        </div>
      )}
    </main>
    </MedicalShell>
  )
}