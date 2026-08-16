import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../../lib/utils'
import { MEDICAL_PATIENTS, medicalAppointmentsFor } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalPatients() {
  const store = useMedicalStore()
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      MEDICAL_PATIENTS.filter((patient) => {
        const needle = query.trim().toLowerCase()
        if (!needle) return true
        return patient.name.toLowerCase().includes(needle) || patient.mrn.toLowerCase().includes(needle)
      }),
    [query],
  )

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><Users aria-hidden="true" /> Patients</h1>
        <p>Search the patient registry by name or medical record number. Select a patient to open their full clinical record.</p>
      </div>

      <div className="med-filters">
        <label>
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or MRN…" />
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="med-patient-list">
          {filtered.map((patient) => {
            const visits = medicalAppointmentsFor(patient.id)
            return (
              <Link key={patient.id} className="med-patient-row" to={`/medical/patients/${patient.id}`}>
                <div className="med-avatar">{patient.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                <div className="med-patient-main">
                  <div className="med-patient-name">
                    {patient.name}
                    {patient.allergies.length > 0 && <span className="med-allergy-tag">{patient.allergies.length} allergy{patient.allergies.length === 1 ? '' : 'ies'}</span>}
                  </div>
                  <div className="med-patient-meta">
                    <span>{patient.mrn}</span>
                    <span>{patient.dob} · {patient.sex}</span>
                    <span>{patient.bloodGroup}</span>
                    <span>{visits.length} visit{visits.length === 1 ? '' : 's'}</span>
                  </div>
                </div>
                <span className={cn('med-status', patient.status === 'active' ? 'is-active' : 'is-inactive')}>{patient.status}</span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="med-empty">
          <Users aria-hidden="true" />
          <h3>No patients found</h3>
          <p>Try a different name or MRN to locate the record.</p>
        </div>
      )}
    </main>
    </MedicalShell>
  )
}