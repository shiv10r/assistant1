import { useState } from 'react'
import {
  MdBadge, MdCall, MdCheckCircle, MdEmail, MdLocationOn, MdPayments, MdPerson, MdVerifiedUser, MdWarning,
} from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { HsSection, HsStars, HsLevelBadge, HsVerifiedBadge } from '../../hsShared'
import { PROFESSIONALS, SERVICE_CATEGORIES, CITIES, SERVICES } from '../../homeServicesData'

const PROFILE = PROFESSIONALS[0]
const TABS = ['Profile', 'Services', 'Areas', 'Availability', 'Payout'] as const
type Tab = (typeof TABS)[number]

export default function ProProfile() {
  const [tab, setTab] = useState<Tab>('Profile')

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <div className="hs-card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <img className="hs-avatar hs-avatar--lg" src={PROFILE.image} alt={PROFILE.name} />
          <div>
            <strong style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              {PROFILE.name} <HsLevelBadge level={PROFILE.level} />
            </strong>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
              <HsStars rating={PROFILE.rating} />
              <span style={{ fontSize: 12, color: 'var(--hs-muted)' }}>{PROFILE.completedJobs} jobs · {PROFILE.experienceYears} yrs</span>
            </div>
            <div style={{ marginTop: 6 }}><HsVerifiedBadge verified={PROFILE.verified} /></div>
          </div>
        </div>

        <div className="hs-tabs" role="tablist" aria-label="Professional profile sections">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`hs-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Profile' && (
          <div className="hs-card">
            <HsSection title="Personal details" />
            <div className="hs-list-row"><span><MdPerson aria-hidden="true" /> Name</span><small>{PROFILE.name}</small></div>
            <div className="hs-list-row"><span><MdCall aria-hidden="true" /> Phone</span><small>{PROFILE.phone}</small></div>
            <div className="hs-list-row"><span><MdEmail aria-hidden="true" /> Email</span><small>{PROFILE.email}</small></div>
            <div className="hs-list-row"><span><MdLocationOn aria-hidden="true" /> Base city</span><small>{CITIES.find((c) => c.id === PROFILE.cityId)?.name}</small></div>
            <div className="hs-list-row"><span><MdVerifiedUser aria-hidden="true" /> Verification</span><small>{PROFILE.verified ? 'Verified (ID + police verification)' : 'Pending verification'}</small></div>
            <div className="hs-list-row"><span><MdBadge aria-hidden="true" /> Level</span><small>{PROFILE.level}</small></div>
          </div>
        )}

        {tab === 'Services' && (
          <div className="hs-card">
            <HsSection title="Services you offer" />
            {SERVICE_CATEGORIES.map((cat) => (
              <div key={cat.id} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 13 }}>{cat.name}</strong>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SERVICES.filter((s) => s.categoryId === cat.id).map((s) => (
                    <span key={s.id} className="hs-chip">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--hs-muted)', marginTop: 10 }}>
              Your services are enabled by VSR. To add or remove services, contact operations.
            </p>
          </div>
        )}

        {tab === 'Areas' && (
          <div className="hs-card">
            <HsSection title="Service areas" />
            {PROFILE.areas.map((areaId) => {
              const city = CITIES.find((c) => c.id === PROFILE.cityId)
              const area = city?.localities.find((a) => a.id === areaId)
              return (
                <div key={areaId} className="hs-list-row">
                  <span>{area?.name ?? areaId}</span>
                  <small>Active</small>
                </div>
              )
            })}
            <div className="hs-alert hs-alert--info" style={{ marginTop: 10 }}>
              <MdCheckCircle aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>We only send you bookings inside your active areas.</span>
            </div>
          </div>
        )}

        {tab === 'Availability' && (
          <div className="hs-card">
            <HsSection title="Availability" />
            <div className="hs-alert hs-alert--success" style={{ marginBottom: 12 }}>
              <MdCheckCircle aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>Your live availability schedule is active for the next 14 days (10:00–19:00 daily).</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--hs-muted)' }}>
              Customers can book any available slot you have opened. Adjusting your calendar here is a demo; full calendar management ships with the backend.
            </p>
          </div>
        )}

        {tab === 'Payout' && (
          <div className="hs-card">
            <HsSection title="Payout account" />
            <div className="hs-list-row"><span><MdPayments aria-hidden="true" /> Account holder</span><small>{PROFILE.name}</small></div>
            <div className="hs-list-row"><span>Bank</span><small>HDFC Bank · •••• 4521</small></div>
            <div className="hs-list-row"><span>UPI ID</span><small>{PROFILE.email}</small></div>
            <div className="hs-alert hs-alert--info" style={{ marginTop: 10 }}>
              <MdWarning aria-hidden="true" style={{ flexShrink: 0 }} />
              <span>Payouts are processed every Monday and Thursday after approval.</span>
            </div>
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}