import { useMemo, useState } from 'react'
import { FlaskConical, Search } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_LABS, medicalFormatDate, medicalPatientById } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalLabs() {
  const store = useMedicalStore()
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      MEDICAL_LABS.filter((lab) => {
        const needle = query.trim().toLowerCase()
        if (!needle) return true
        const patient = medicalPatientById(lab.patientId)
        return lab.test.toLowerCase().includes(needle) || lab.status.toLowerCase().includes(needle) || (patient?.name.toLowerCase().includes(needle) ?? false)
      }),
    [query],
  )

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><FlaskConical aria-hidden="true" /> Lab Results</h1>
        <p>Diagnostic results with reference ranges and clinical flags, ready for review by patients and clinicians.</p>
      </div>

      <div className="med-filters">
        <label>
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by test, status or patient…" />
        </label>
      </div>

      {filtered.length > 0 ? (
        <div className="med-lab-list">
          {filtered.map((lab) => {
            const patient = medicalPatientById(lab.patientId)
            return (
              <div key={lab.id} className="med-lab-row">
                <div>
                  <div className="med-lab-test">{lab.test}</div>
                  <div className="med-lab-meta">
                    {patient?.name ?? 'Unknown'} · {medicalFormatDate(lab.orderedAt)}
                    {lab.verifiedAt ? ` · Verified ${medicalFormatDate(lab.verifiedAt)}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {lab.result && <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--med-ink)' }}>{lab.result}</div>}
                  {lab.referenceRange && <div className="med-lab-meta">Ref: {lab.referenceRange}</div>}
                  {lab.flag && <div className={cn('med-lab-flag', `is-${lab.flag}`)}>{lab.flag.toUpperCase()}</div>}
                  <span className={cn('med-status', `is-${lab.status.toLowerCase()}`)}>{lab.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="med-empty">
          <FlaskConical aria-hidden="true" />
          <h3>No lab results found</h3>
          <p>Try a different test name, status or patient.</p>
        </div>
      )}
    </main>
    </MedicalShell>
  )
}