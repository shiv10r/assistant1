import { HeartPulse, ClipboardList } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_ENCOUNTERS, medicalDoctorById, medicalFormatDateTime, medicalPatientById } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalRecords() {
  const store = useMedicalStore()

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><ClipboardList aria-hidden="true" /> Clinical Records</h1>
        <p>Encounter notes, assessments and vitals captured during every consultation.</p>
      </div>

      {MEDICAL_ENCOUNTERS.length > 0 ? (
        <div className="med-appt-list">
          {MEDICAL_ENCOUNTERS.map((encounter) => {
            const patient = medicalPatientById(encounter.patientId)
            const doctor = medicalDoctorById(encounter.doctorId)
            return (
              <article key={encounter.id} className="med-rx-card">
                <div className="med-rx-head">
                  <h3><HeartPulse aria-hidden="true" /> {encounter.id}</h3>
                  <span className={cn('med-status', `is-${encounter.status}`)}>{encounter.status}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--med-muted)', marginBottom: 12 }}>
                  Patient: <strong style={{ color: 'var(--med-ink)' }}>{patient?.name ?? 'Unknown'}</strong> · {doctor?.name ?? 'Unknown'} · {medicalFormatDateTime(encounter.startedAt)}
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--med-muted)' }}>Chief Complaint</div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--med-ink)' }}>{encounter.chiefComplaint}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--med-muted)' }}>Assessment</div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--med-ink)' }}>{encounter.assessment}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--med-muted)' }}>Plan</div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--med-ink)' }}>{encounter.plan}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--med-muted)', marginBottom: 8 }}>Vitals</div>
                    <div className="med-vitals">
                      <div className="med-vital"><small>Temp</small><strong>{encounter.vitals.temperature}</strong></div>
                      <div className="med-vital"><small>Pulse</small><strong>{encounter.vitals.pulse}</strong></div>
                      <div className="med-vital"><small>RR</small><strong>{encounter.vitals.respiratoryRate}</strong></div>
                      <div className="med-vital"><small>BP</small><strong>{encounter.vitals.bloodPressure}</strong></div>
                      <div className="med-vital"><small>SpO₂</small><strong>{encounter.vitals.spo2}</strong></div>
                      <div className="med-vital"><small>Wt</small><strong>{encounter.vitals.weight}</strong></div>
                      <div className="med-vital"><small>Ht</small><strong>{encounter.vitals.height}</strong></div>
                      <div className="med-vital"><small>BMI</small><strong>{encounter.vitals.bmi}</strong></div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="med-empty">
          <ClipboardList aria-hidden="true" />
          <h3>No clinical records yet</h3>
          <p>Encounter notes from consultations will appear here.</p>
        </div>
      )}
    </main>
    </MedicalShell>
  )
}