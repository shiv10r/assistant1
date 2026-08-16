import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, CreditCard, FlaskConical, HeartPulse, Pill, ShieldAlert, UserRound } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { cn } from '../../../lib/utils'
import {
  medicalAppointmentsFor,
  medicalDoctorById,
  medicalEncounterFor,
  medicalFormatDate,
  medicalInvoicesFor,
  medicalInvoiceTotal,
  medicalLabsFor,
  medicalPatientById,
  medicalPrescriptionsFor,
} from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalPatientDetailRoute() {
  const { patientId } = useParams<{ patientId: string }>()
  return <MedicalPatientDetail patientId={patientId ?? ''} />
}

function MedicalPatientDetail({ patientId }: { readonly patientId: string }) {
  const store = useMedicalStore()
  const [tab, setTab] = useState<'overview' | 'encounters' | 'prescriptions' | 'labs' | 'billing'>('overview')

  const patient = useMemo(() => medicalPatientById(patientId), [patientId])
  if (!patient) return <Navigate to="/medical/patients" replace />

  const appointments = medicalAppointmentsFor(patient.id)
  const encounter = medicalEncounterFor(patient.id)
  const prescriptions = medicalPrescriptionsFor(patient.id)
  const labs = medicalLabsFor(patient.id)
  const invoices = medicalInvoicesFor(patient.id)

  const TABS = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'encounters' as const, label: 'Encounters' },
    { id: 'prescriptions' as const, label: 'Prescriptions' },
    { id: 'labs' as const, label: 'Lab Results' },
    { id: 'billing' as const, label: 'Billing' },
  ]

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <Link to="/medical/patients" className="med-btn is-ghost" style={{ marginBottom: 14 }}><ArrowLeft aria-hidden="true" /> Back to Patients</Link>

      <div className="med-hero" style={{ marginBottom: 18 }}>
        <div className="med-hello">
          <h2>{patient.name}</h2>
          <p>{patient.mrn} · {patient.dob} · {patient.sex} · Blood {patient.bloodGroup}</p>
        </div>
        <div className="med-balance-card">
          <div className="med-balance-label"><HeartPulse aria-hidden="true" /> PATIENT STATUS</div>
          <div className="med-balance-amount">{patient.status === 'active' ? 'Active' : 'Inactive'}</div>
          <div className="med-balance-sub">{patient.phone} · {patient.email}</div>
          <div className="med-balance-foot">
            {patient.allergies.map((allergy) => <span key={allergy} className="med-chip"><ShieldAlert aria-hidden="true" /> {allergy}</span>)}
            {patient.chronicConditions.map((condition) => <span key={condition} className="med-chip"><UserRound aria-hidden="true" /> {condition}</span>)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((tabItem) => (
          <button key={tabItem.id} type="button" onClick={() => setTab(tabItem.id)} className={cn('med-btn', tab === tabItem.id ? '' : 'is-ghost')}>
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="med-dash-grid">
          <section className="med-card">
            <h2><CalendarDays aria-hidden="true" /> Visit History</h2>
            {appointments.length > 0 ? (
              <div className="med-appt-list">
                {appointments.map((appointment) => {
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
                          <span>{medicalFormatDate(appointment.startAt)}</span>
                          <span>{appointment.facility}</span>
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
                <h3>No visits on record</h3>
                <p>This patient has no appointment history yet.</p>
              </div>
            )}
          </section>
          <div style={{ display: 'grid', gap: 20 }}>
            <section className="med-card">
              <h2><Pill aria-hidden="true" /> Active Prescriptions</h2>
              <div className="med-vitals">
                <div className="med-vital"><small>Active Rx</small><strong>{prescriptions.filter((rx) => rx.status === 'active').length}</strong></div>
                <div className="med-vital"><small>Lab Orders</small><strong>{labs.length}</strong></div>
                <div className="med-vital"><small>Due Balance</small><strong>₹{invoices.filter((invoice) => invoice.status === 'due' || invoice.status === 'overdue').reduce((total, invoice) => total + medicalInvoiceTotal(invoice), 0).toLocaleString('en-IN')}</strong></div>
              </div>
            </section>
            <section className="med-card">
              <h2><ShieldAlert aria-hidden="true" /> Allergies & Conditions</h2>
              <div className="med-appt-list">
                {patient.allergies.map((allergy) => (
                  <div key={allergy} className="med-notif is-unread">
                    <div className="med-notif-icon is-appointment"><ShieldAlert aria-hidden="true" /></div>
                    <div className="med-notif-main"><div className="med-notif-title">{allergy}</div><div className="med-notif-body">Reported allergy</div></div>
                  </div>
                ))}
                {patient.chronicConditions.map((condition) => (
                  <div key={condition} className="med-notif">
                    <div className="med-notif-icon is-prescription"><HeartPulse aria-hidden="true" /></div>
                    <div className="med-notif-main"><div className="med-notif-title">{condition}</div><div className="med-notif-body">Chronic condition</div></div>
                  </div>
                ))}
                {patient.allergies.length === 0 && patient.chronicConditions.length === 0 && (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--med-muted)' }}>No allergies or chronic conditions on record.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'encounters' && (
        <section className="med-card">
          <h2><HeartPulse aria-hidden="true" /> Clinical Encounters</h2>
          {encounter ? (
            <div className="med-appt-list">
              <div className="med-rx-card">
                <div className="med-rx-head">
                  <h3>{encounter.chiefComplaint}</h3>
                  <span className="med-status is-closed">{encounter.status}</span>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
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
                      <div className="med-vital"><small>BMI</small><strong>{encounter.vitals.bmi}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="med-empty">
              <HeartPulse aria-hidden="true" />
              <h3>No encounters on record</h3>
              <p>Clinical notes from consultations will appear here.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'prescriptions' && (
        <section className="med-card">
          <h2><Pill aria-hidden="true" /> Prescriptions</h2>
          {prescriptions.length > 0 ? (
            <div className="med-appt-list">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="med-rx-card">
                  <div className="med-rx-head">
                    <h3><Pill aria-hidden="true" /> {prescription.id}</h3>
                    <span className={cn('med-status', `is-${prescription.status === 'active' ? 'active' : 'completed'}`)}>{prescription.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--med-muted)', marginBottom: 10 }}>
                    Issued {medicalFormatDate(prescription.createdAt)} · {medicalDoctorById(prescription.doctorId)?.name}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="med-empty">
              <Pill aria-hidden="true" />
              <h3>No prescriptions</h3>
              <p>Prescriptions issued for this patient will appear here.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'labs' && (
        <section className="med-card">
          <h2><FlaskConical aria-hidden="true" /> Lab Results</h2>
          {labs.length > 0 ? (
            <div className="med-lab-list">
              {labs.map((lab) => (
                <div key={lab.id} className="med-lab-row">
                  <div>
                    <div className="med-lab-test">{lab.test}</div>
                    <div className="med-lab-meta">
                      {lab.result ? `${lab.result} · Ref ${lab.referenceRange ?? '—'}` : 'Result pending'} · Ordered {medicalFormatDate(lab.orderedAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {lab.flag && <div className={cn('med-lab-flag', `is-${lab.flag}`)}>{lab.flag.toUpperCase()}</div>}
                    <span className={cn('med-status', `is-${lab.status.toLowerCase()}`)}>{lab.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="med-empty">
              <FlaskConical aria-hidden="true" />
              <h3>No lab orders</h3>
              <p>Laboratory orders for this patient will appear here.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'billing' && (
        <section className="med-card">
          <h2><CreditCard aria-hidden="true" /> Invoices</h2>
          {invoices.length > 0 ? (
            <div className="med-appt-list">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="med-invoice">
                  <div className="med-invoice-head">
                    <h3>{invoice.id}</h3>
                    <span className={cn('med-status', `is-${invoice.status}`)}>{invoice.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--med-muted)', marginBottom: 10 }}>Issued {medicalFormatDate(invoice.issuedAt)}</div>
                  <div className="med-invoice-rows">
                    {invoice.items.map((item) => (
                      <div key={item.description} className="med-invoice-row">
                        <span>{item.description}</span>
                        <strong>₹{item.amount.toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                    {invoice.discount > 0 && (
                      <div className="med-invoice-row">
                        <span>Discount</span>
                        <strong>-₹{invoice.discount.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="med-invoice-row">
                      <span>Tax</span>
                      <strong>₹{invoice.tax.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                  <div className="med-invoice-total">Total: ₹{medicalInvoiceTotal(invoice).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="med-empty">
              <CreditCard aria-hidden="true" />
              <h3>No invoices</h3>
              <p>Billing records for this patient will appear here.</p>
            </div>
          )}
        </section>
      )}
    </main>
    </MedicalShell>
  )
}