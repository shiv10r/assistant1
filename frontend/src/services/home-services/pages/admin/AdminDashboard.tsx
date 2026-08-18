import { Link } from 'react-router-dom'
import {
  MdAccountBalanceWallet, MdAssignmentTurnedIn, MdEventAvailable, MdGroups, MdPayments, MdPendingActions, MdVerifiedUser,
} from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, formatDateTime, HsSection, HsStatusBadge } from '../../hsShared'

export default function AdminDashboard() {
  const store = useHomeServicesStore()

  const totalRevenue = store.bookings.filter((b) => b.status === 'Completed').reduce((s, b) => s + b.currentQuote, 0)
  const totalCommissions = store.bookings.filter((b) => b.status === 'Completed').reduce((s, b) => s + (b.currentQuote * 0.15), 0)
  const pendingPayouts = store.payouts.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)
  const requests = store.bookings.filter((b) => b.status === 'AwaitingProvider').length
  const openDisputes = store.disputes.filter((d) => d.status === 'Open').length
  const openTickets = store.tickets.filter((t) => t.status === 'Open').length

  const recent = [...store.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="Operations dashboard" />
        <div className="hs-stat-grid">
          <div className="hs-stat"><small><MdPayments aria-hidden="true" /> Revenue (completed)</small><b>{money(totalRevenue)}</b></div>
          <div className="hs-stat"><small><MdAccountBalanceWallet aria-hidden="true" /> Commission earned</small><b>{money(totalCommissions)}</b></div>
          <div className="hs-stat"><small><MdEventAvailable aria-hidden="true" /> Pending payouts</small><b>{money(pendingPayouts)}</b></div>
          <div className="hs-stat"><small><MdPendingActions aria-hidden="true" /> Unassigned requests</small><b>{requests}</b></div>
        </div>

        <div className="hs-stat-grid">
          <div className="hs-stat"><small><MdAssignmentTurnedIn aria-hidden="true" /> Open disputes</small><b>{openDisputes}</b></div>
          <div className="hs-stat"><small>Support tickets</small><b>{openTickets}</b></div>
          <div className="hs-stat"><small><MdVerifiedUser aria-hidden="true" /> Professionals</small><b>{store.professionals.length}</b></div>
          <div className="hs-stat"><small><MdGroups aria-hidden="true" /> Customers</small><b>{store.customers.length}</b></div>
        </div>
      </section>

      <section className="hs-section">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/home-services/admin/live" className="hs-btn hs-btn--primary hs-btn--sm">Live operations</Link>
          <Link to="/home-services/admin/bookings" className="hs-btn hs-btn--secondary hs-btn--sm">All bookings</Link>
          <Link to="/home-services/admin/professionals" className="hs-btn hs-btn--secondary hs-btn--sm">Professionals</Link>
          <Link to="/home-services/admin/finance" className="hs-btn hs-btn--secondary hs-btn--sm">Finance</Link>
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="Recent bookings" action={<Link to="/home-services/admin/bookings">View all</Link>} />
        <div className="hs-list">
          {recent.map((b) => {
            const service = store.serviceById(b.serviceId)
            return (
              <Link key={b.id} to="/home-services/admin/bookings" className="hs-booking-card">
                <div className="hs-booking-card-top">
                  <b>{service?.name ?? ''}</b>
                  <HsStatusBadge status={b.status} />
                </div>
                <div className="hs-booking-meta">
                  <span>{b.number}</span>
                  <span>{formatDateTime(b.createdAt)}</span>
                </div>
                <b style={{ color: 'var(--hs-brand)' }}>{money(b.currentQuote)}</b>
              </Link>
            )
          })}
        </div>
      </section>
    </HomeServicesShell>
  )
}