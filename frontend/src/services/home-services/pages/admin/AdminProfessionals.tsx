import { useState } from 'react'
import { MdVerifiedUser, MdWarning } from 'react-icons/md'
import HomeServicesShell from '../../HomeServicesShell'
import { useHomeServicesStore } from '../../homeServicesStore'
import { money, HsSection, HsStars, HsLevelBadge } from '../../hsShared'
import { CITIES } from '../../homeServicesData'

export default function AdminProfessionals() {
  const store = useHomeServicesStore()
  const [tab, setTab] = useState<'all' | 'pending'>('all')
  const professionals = store.professionals
  const pending = professionals.filter((p) => !p.verified)
  const visible = tab === 'all' ? professionals : pending

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="Professionals" />
        <div className="hs-tabs" role="tablist" aria-label="Professional filters">
          {([['all', `All (${professionals.length})`], ['pending', `Pending verification (${pending.length})`]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={`hs-tab ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <div className="hs-list">
          {visible.map((p) => {
            const earnings = store.earningsFor(p.id).reduce((s, e) => s + e.earningAmount, 0)
            const city = CITIES.find((c) => c.id === p.cityId)
            return (
              <div key={p.id} className="hs-booking-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img className="hs-avatar" src={p.image} alt={p.name} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.name} <HsLevelBadge level={p.level} />
                    </strong>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
                      <HsStars rating={p.rating} />
                      <small style={{ color: 'var(--hs-muted)' }}>{p.completedJobs} jobs · {city?.name ?? ''}</small>
                    </div>
                  </div>
                  <b style={{ color: 'var(--hs-brand)', fontSize: 14 }}>{money(earnings)}</b>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="hs-chip">{p.skills.slice(0, 1).join(', ') || p.bio}</span>
                  {p.verified ? (
                    <span className="hs-chip hs-chip--success"><MdVerifiedUser aria-hidden="true" /> Verified</span>
                  ) : (
                    <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" onClick={() => { store.verifyProfessional(p.id); }}>
                      <MdVerifiedUser aria-hidden="true" /> Approve verification
                    </button>
                  )}
                  {p.rating < 3.5 && (
                    <span className="hs-chip hs-chip--danger"><MdWarning aria-hidden="true" /> Review flagged</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </HomeServicesShell>
  )
}