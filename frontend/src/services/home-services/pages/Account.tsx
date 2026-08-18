import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdAccountCircle, MdHomeWork, MdNotifications, MdPerson, MdVerifiedUser, MdWorkspacePremium } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, formatDateTime, HsSection, HsEmpty } from '../hsShared'
import { MEMBERSHIP_PLANS, CITIES } from '../homeServicesData'

export default function Account() {
  const store = useHomeServicesStore()
  const customer = store.activeCustomer
  const membership = store.membershipById(customer.membershipId)
  const notifs = store.notificationsFor(customer.id)
  const [tab, setTab] = useState<'profile' | 'addresses' | 'membership' | 'notifications'>('profile')

  const city = CITIES.find((c) => c.id === customer.cityId)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <div className="hs-card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <span style={{ width: 56, height: 56, borderRadius: 999, background: 'linear-gradient(135deg,#b45309,#dc2626)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 24 }}>
            <MdPerson aria-hidden="true" />
          </span>
          <div>
            <strong style={{ fontSize: 17 }}>{customer.name}</strong>
            <p style={{ margin: 0, color: 'var(--hs-muted)', fontSize: 12 }}>{customer.phone} · {customer.email}</p>
            {membership && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#a16207', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                <MdWorkspacePremium aria-hidden="true" /> {membership.name} member
              </p>
            )}
          </div>
        </div>

        <div className="hs-tabs" role="tablist" aria-label="Account sections">
          {([['profile', 'Profile'], ['addresses', 'Addresses'], ['membership', 'Membership'], ['notifications', 'Notifications']] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={`hs-tab ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="hs-card">
            <HsSection title="Profile details" />
            <div className="hs-list-row"><span>Name</span><small>{customer.name}</small></div>
            <div className="hs-list-row"><span>Phone</span><small>{customer.phone}</small></div>
            <div className="hs-list-row"><span>Email</span><small>{customer.email}</small></div>
            <div className="hs-list-row"><span>City</span><small>{city?.name ?? ''}</small></div>
            <div className="hs-list-row"><span>Member since</span><small>{customer.memberSince}</small></div>
            <div className="hs-list-row"><span>Total bookings</span><small>{customer.bookingsCount}</small></div>
            <div className="hs-alert hs-alert--info" style={{ marginTop: 12 }}>
              <MdVerifiedUser aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>Your profile is verified. We never share your contact details with professionals until a booking is confirmed.</span>
            </div>
          </div>
        )}

        {tab === 'addresses' && (
          <div className="hs-card">
            <HsSection title="Saved addresses" />
            <div className="hs-list-row">
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MdHomeWork aria-hidden="true" /> Home · Flat 101, Green Heights Apartments</span>
              <small>{city?.name ?? ''}</small>
            </div>
            <div className="hs-list-row">
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MdHomeWork aria-hidden="true" /> Office · VSR Systems, Sector 62</span>
              <small>Noida</small>
            </div>
            <p style={{ fontSize: 12, color: 'var(--hs-muted)', marginTop: 10 }}>You can pick or add an address during booking.</p>
          </div>
        )}

        {tab === 'membership' && (
          <div>
            <HsSection title={membership ? 'Your membership' : 'VSR Care plans'} />
            {membership && (
              <div className="hs-card" style={{ marginBottom: 12, background: 'linear-gradient(135deg,#1c1917 0%,#451a03 100%)', color: '#fff', border: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <MdWorkspacePremium aria-hidden="true" style={{ color: '#fbbf24' }} /> <strong>{membership.name}</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  {membership.serviceDiscountPct}% off services · {membership.platformFeeWaiver ? 'platform fee waived' : 'platform fee applies'} · {membership.prioritySupport ? 'priority support' : 'standard support'}
                </p>
              </div>
            )}
            <div className="hs-package-grid">
              {MEMBERSHIP_PLANS.map((p) => (
                <div key={p.id} className={`hs-package ${membership?.id === p.id ? 'is-selected' : ''}`}>
                  <b>{p.name}</b>
                  <div className="hs-price-row">
                    <b style={{ color: 'var(--hs-brand)' }}>{money(p.price)}</b>
                    <small>/ {p.validityMonths} months</small>
                  </div>
                  <ul>
                    {p.benefits.slice(0, 3).map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  {membership?.id === p.id ? (
                    <div className="hs-alert hs-alert--success" style={{ marginTop: 8 }}>Current plan</div>
                  ) : (
                    <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" style={{ marginTop: 10 }}>Switch plan</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="hs-list">
            {notifs.length === 0 && <HsEmpty icon={<MdNotifications aria-hidden="true" />} title="No notifications" />}
            {notifs.map((n) => (
              <button
                key={n.id}
                type="button"
                className="hs-list-row"
                style={{ textAlign: 'left', cursor: 'pointer', opacity: n.read ? 0.7 : 1 }}
                onClick={() => store.markNotifRead(n.id)}
              >
                <span>
                  <strong style={{ display: 'block', fontSize: 13 }}>{n.title}</strong>
                  <small>{n.body}</small>
                </span>
                <small>{formatDateTime(n.createdAt)}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <Link to="/home-services/offers" className="hs-btn hs-btn--secondary" style={{ width: '100%' }}>
        <MdAccountCircle aria-hidden="true" /> Browse offers
      </Link>
    </HomeServicesShell>
  )
}