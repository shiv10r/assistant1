import { useMemo, useState } from 'react'
import { Pill, Search } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_PRESCRIPTIONS, medicalDoctorById, medicalFormatDate, medicalPatientById } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalPrescriptions() {
  const store = useMedicalStore()
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      MEDICAL_PRESCRIPTIONS.filter((prescription) => {
        const needle = query.trim().toLowerCase()
        if (!needle) return true
        const patient = medicalPatientById(prescription.patientId)
        return prescription.id.toLowerCase().includes(needle) || (patient?.name.toLowerCase().includes(needle) ?? false)
      }),
    [query],
  )

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><Pill aria-hidden="true" /> Prescriptions</h1>
        <p>Every medication order issued across the care network, with dosage, frequency and duration.</p>
      </div>

      <div className="med-filters">
        <label>
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by prescription ID or patient…" />
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="med-appt-list">
          {filtered.map((prescription) => {
            const patient = medicalPatientById(prescription.patientId)
            const doctor = medicalDoctorById(prescription.doctorId)
            return (
              <article key={prescription.id} className="med-rx-card">
                <div className="med-rx-head">
                  <h3><Pill aria-hidden="true" /> {prescription.id}</h3>
                  <span className={cn('med-status', `is-${prescription.status === 'active' ? 'active' : 'completed'}`)}>{prescription.status}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--med-muted)', marginBottom: 12 }}>
                  Patient: <strong style={{ color: 'var(--med-ink)' }}>{patient?.name ?? 'Unknown'}</strong> ({patient?.mrn ?? '—'}) · Prescribed by {doctor?.name ?? 'Unknown'} · {medicalFormatDate(prescription.createdAt)}
                </div>
                <div className="med-rx-items">
                  {prescription.items.map((item) => (
                    <div key={item.medication} className="med-rx-item">
                      <div>
                        <strong>{item.medication}</strong>
                        <small>{item.dose} {item.route} · {item.frequency} · {item.duration}<br />{item.instructions}</small>
                      </div>
                      <span>{item.frequency}</span>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="med-empty">
          <Pill aria-hidden="true" />
          <h3>No prescriptions match</h3>
          <p>Try a different prescription ID or patient name.</p>
        </div>
      )}
    </main>
    </MedicalShell>
  )
}