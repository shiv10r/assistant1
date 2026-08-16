import { Activity, Bell, CalendarDays, CreditCard, FlaskConical, HeartPulse, Pill, Stethoscope, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../../lib/utils'
import {
  MEDICAL_APPOINTMENTS,
  MEDICAL_DOCTORS,
  MEDICAL_INVOICES,
  MEDICAL_LABS,
  MEDICAL_NOTIFICATIONS,
  MEDICAL_PATIENTS,
  MEDICAL_PRESCRIPTIONS,
  medicalDoctorById,
  medicalFormatTime,
  medicalInvoiceTotal,
} from '../medicalData'
import { useMedicalStore } from '../medicalStore'
import MedicalShell from '../MedicalShell'

const QUICK_ACTIONS = [
  { to: '/medical/doctors', label: 'Find a Doctor', icon: Stethoscope },
  { to: '/medical/appointments', label: 'Book Appointment', icon: CalendarDays },
  { to: '/medical/prescriptions', label: 'Refill Prescription', icon: Pill },
  { to: '/medical/labs', label: 'View Lab Results', icon: FlaskConical },
] as const

export default function MedicalHome() {
  const store = useMedicalStore()
  const today = new Date().toDateString()
  const todayAppointments = MEDICAL_APPOINTMENTS.filter((appointment) => new Date(appointment.startAt).toDateString() === today)
  const upcoming = todayAppointments.filter((appointment) => appointment.status === 'Confirmed' || appointment.status === 'CheckedIn' || appointment.status === 'Requested')
  const unreadNotifications = MEDICAL_NOTIFICATIONS.filter((notification) => !store.isNotificationRead(notification.id))
  const pendingBills = MEDICAL_INVOICES.filter((invoice) => invoice.status === 'due' || invoice.status === 'overdue')
  const pendingBillTotal = pendingBills.reduce((total, invoice) => total + medicalInvoiceTotal(invoice), 0)
  const pendingLabs = MEDICAL_LABS.filter((lab) => lab.status === 'Processing' || lab.status === 'Ordered')

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
        <section className="med-hero">
        <div className="med-hello">
          <h2>Good day, Aarav</h2>
          <p>
            Welcome back to VSR Health. You have <strong>{upcoming.length} appointment{upcoming.length === 1 ? '' : 's'}</strong> today,{' '}
            <strong>{unreadNotifications.length} unread notification{unreadNotifications.length === 1 ? '' : 's'}</strong>, and a care team of{' '}
            <strong>{MEDICAL_DOCTORS.length} specialists</strong> ready for you.
          </p>
        </div>
        <div className="med-balance-card">
          <div className="med-balance-label"><HeartPulse aria-hidden="true" /> OUTSTANDING BALANCE</div>
          <div className="med-balance-amount">₹{pendingBillTotal.toLocaleString('en-IN')}</div>
          <div className="med-balance-sub">{pendingBills.length} pending invoice{pendingBills.length === 1 ? '' : 's'} across your visits</div>
          <div className="med-balance-foot">
            <span className="med-chip"><Activity aria-hidden="true" /> BP 148/92</span>
            <span className="med-chip"><UserRound aria-hidden="true" /> B+</span>
            <span className="med-chip"><FlaskConical aria-hidden="true" /> {pendingLabs.length} lab{pendingLabs.length === 1 ? '' : 's'} pending</span>
          </div>
        </div>
      </section>

      <section className="med-quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.to} className="med-quick-action" to={action.to}>
            <action.icon aria-hidden="true" /> {action.label}
          </Link>
        ))}
      </section>

      <div className="med-dash-grid">
        <section className="med-card">
          <h2><CalendarDays aria-hidden="true" /> Today's Appointments</h2>
          {todayAppointments.length > 0 ? (
            <div className="med-appt-list">
              {todayAppointments.map((appointment) => {
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
                        <span>{medicalFormatTime(appointment.startAt)}</span>
                        <span>{appointment.type}</span>
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
              <h3>No appointments today</h3>
              <p>You have no scheduled visits for today. Book a consultation whenever you need one.</p>
              <Link className="med-btn" to="/medical/appointments">Book an Appointment</Link>
            </div>
          )}
        </section>

        <div style={{ display: 'grid', gap: 20 }}>
          <section className="med-card">
            <h2><Bell aria-hidden="true" /> Notifications</h2>
            {unreadNotifications.length > 0 ? (
              <div className="med-appt-list">
                {unreadNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="med-notif is-unread">
                    <div className={cn('med-notif-icon', `is-${notification.type}`)}>
                      <Bell aria-hidden="true" />
                    </div>
                    <div className="med-notif-main">
                      <div className="med-notif-title">{notification.title}</div>
                      <div className="med-notif-body">{notification.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--med-muted)' }}>You're all caught up.</p>
            )}
            <div style={{ marginTop: 12 }}>
              <Link className="med-btn is-ghost" to="/medical/notifications">View all notifications</Link>
            </div>
          </section>

          <section className="med-card">
            <h2><Users aria-hidden="true" /> Care Summary</h2>
            <div className="med-vitals">
              <div className="med-vital">
                <small>Active Prescriptions</small>
                <strong>{MEDICAL_PRESCRIPTIONS.filter((prescription) => prescription.status === 'active').length}</strong>
              </div>
              <div className="med-vital">
                <small>Total Patients</small>
                <strong>{MEDICAL_PATIENTS.length}</strong>
              </div>
              <div className="med-vital">
                <small>Due Bills</small>
                <strong>₹{pendingBillTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </section>

          <section className="med-card">
            <h2><CreditCard aria-hidden="true" /> Quick Billing</h2>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--med-muted)', lineHeight: 1.6 }}>
              Review your outstanding invoices and pay securely from the billing tab.
            </p>
            <Link className="med-btn" to="/medical/billing">Go to Billing</Link>
          </section>
        </div>
      </div>
      </main>
    </MedicalShell>
  )
}