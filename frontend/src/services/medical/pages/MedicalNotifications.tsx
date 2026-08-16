import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { MEDICAL_NOTIFICATIONS, medicalFormatDateTime } from '../medicalData'
import { useMedicalStore } from '../medicalStore'
import MedicalShell from '../MedicalShell'

export default function MedicalNotifications() {
  const store = useMedicalStore()

  function markAllRead() {
    store.markAllNotificationsRead(MEDICAL_NOTIFICATIONS.map((notification) => notification.id))
  }

  return (
    <MedicalShell unreadCount={store.unreadCount}>
      <main className="med-main">
      <div className="med-page-head">
        <h1><Bell aria-hidden="true" /> Notifications</h1>
        <p>Appointment updates, lab results, bills and prescription alerts — all in one place.</p>
      </div>

      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--med-muted)' }}>
          {store.unreadCount > 0 ? `${store.unreadCount} unread notification${store.unreadCount === 1 ? '' : 's'}` : 'All caught up'}
        </span>
        <button className="med-btn is-ghost" type="button" onClick={markAllRead}>
          <CheckCheck aria-hidden="true" /> Mark all as read
        </button>
      </div>

      {MEDICAL_NOTIFICATIONS.length > 0 ? (
        <div className="med-notif-list">
          {MEDICAL_NOTIFICATIONS.map((notification) => {
            const isRead = store.isNotificationRead(notification.id)
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => store.markNotificationRead(notification.id)}
                className={cn('med-notif', !isRead && 'is-unread')}
                style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <div className={cn('med-notif-icon', `is-${notification.type}`)}>
                  <Bell aria-hidden="true" />
                </div>
                <div className="med-notif-main">
                  <div className="med-notif-title">{notification.title}</div>
                  <div className="med-notif-body">{notification.body}</div>
                  <div className="med-notif-time">{medicalFormatDateTime(notification.at)}</div>
                </div>
                {!isRead && <span className="med-status is-active">New</span>}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="med-empty">
          <Bell aria-hidden="true" />
          <h3>No notifications</h3>
          <p>You have no notifications at the moment.</p>
        </div>
      )}
    </main>
    </MedicalShell>
  )
}