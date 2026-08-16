import { Activity, Bell, CalendarDays, ClipboardList, CreditCard, FlaskConical, Pill, ShieldCheck, Users } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_ADMIN_STATS, MEDICAL_AUDIT_LOGS, medicalFormatDateTime } from '../medicalData'
import MedicalShell from '../MedicalShell'
import { useMedicalStore } from '../medicalStore'

export default function MedicalAdmin() {
  const store = useMedicalStore()
  const stats = [
    { label: 'Appointments Today', value: MEDICAL_ADMIN_STATS.appointmentsToday, icon: CalendarDays },
    { label: 'Patients Today', value: MEDICAL_ADMIN_STATS.patientsToday, icon: Users },
    { label: 'Doctors on Duty', value: MEDICAL_ADMIN_STATS.doctorsOnDuty, icon: Activity },
    { label: 'Pending Lab Results', value: MEDICAL_ADMIN_STATS.pendingLabResults, icon: FlaskConical },
    { label: 'Pending Bills', value: MEDICAL_ADMIN_STATS.pendingBills, icon: CreditCard },
    { label: 'Low-Stock Medications', value: MEDICAL_ADMIN_STATS.pharmacyLowStock, icon: Pill },
    { label: 'Cancellations', value: MEDICAL_ADMIN_STATS.cancelledAppointments, icon: Bell },
    { label: 'No-Shows', value: MEDICAL_ADMIN_STATS.noShows, icon: ClipboardList },
  ] as const

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><ShieldCheck aria-hidden="true" /> Admin Console</h1>
        <p>Operational overview, pharmacy inventory signals and a complete audit trail of system access.</p>
      </div>

      <div className="med-admin-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="med-admin-stat">
            <small><stat.icon aria-hidden="true" /> {stat.label}</small>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <section className="med-card">
        <h2><ShieldCheck aria-hidden="true" /> Audit Trail</h2>
        <div className="med-table-wrap">
          <table className="med-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Actor</th>
                <th>Resource</th>
                <th>Timestamp</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {MEDICAL_AUDIT_LOGS.map((log) => (
                <tr key={log.id}>
                  <td className="mono">{log.id}</td>
                  <td>{log.actor}</td>
                  <td>{log.resource}</td>
                  <td>{medicalFormatDateTime(log.at)}</td>
                  <td>
                    <span className={cn('med-status', log.outcome === 'success' ? 'is-active' : 'is-cancelled')}>{log.outcome}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
    </MedicalShell>
  )
}