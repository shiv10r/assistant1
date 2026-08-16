import { Bell, CheckCheck, ShieldAlert, RefreshCcw, Wallet, Headphones } from 'lucide-react'
import { bankFormatDateTime, BANK_NOTIFICATIONS, type BankNotificationType } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

const NOTIF_ICONS: Record<BankNotificationType, typeof Bell> = {
  security: ShieldAlert,
  transaction: RefreshCcw,
  account: Wallet,
  service: Headphones,
}

export default function BankNotifications() {
  const store = useBankStore()
  const ids = BANK_NOTIFICATIONS.map((n) => n.id)
  const unread = BANK_NOTIFICATIONS.filter((n) => !store.isNotificationRead(n.id))

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><Bell aria-hidden="true" /> Notifications</h1>
          <p>{unread.length} unread · security and account activity alerts.</p>
        </div>

        {unread.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button type="button" className="bank-btn is-ghost" onClick={() => store.markAllNotificationsRead(ids)}><CheckCheck aria-hidden="true" /> Mark all read</button>
          </div>
        )}

        <div className="bank-notif-list">
          {BANK_NOTIFICATIONS.map((notification) => {
            const Icon = NOTIF_ICONS[notification.type]
            const read = store.isNotificationRead(notification.id)
            return (
              <div key={notification.id} className={`bank-notif ${read ? '' : 'is-unread'}`}>
                <span className={`bank-notif-icon is-${notification.type}`}><Icon aria-hidden="true" /></span>
                <div className="bank-notif-main">
                  <div className="bank-notif-title">{notification.title}{!read && <span className="bank-badge" style={{ marginLeft: 8, minWidth: 16, height: 16, fontSize: 10 }}>new</span>}</div>
                  <div className="bank-notif-body">{notification.body}</div>
                  <div className="bank-notif-time">{bankFormatDateTime(notification.at)}</div>
                </div>
                {!read && (
                  <button type="button" className="bank-btn is-ghost" style={{ alignSelf: 'center' }} onClick={() => store.markNotificationRead(notification.id)}>Mark read</button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </BankShell>
  )
}