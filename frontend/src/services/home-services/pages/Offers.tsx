import { Link } from 'react-router-dom'
import { MdLocalOffer, MdRedeem } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { money, HsSection, HsEmpty } from '../hsShared'
import { COUPONS, SERVICE_CATEGORIES } from '../homeServicesData'

export default function Offers() {
  const active = COUPONS.filter((c) => c.active)

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="Offers & coupons" />
        {active.length === 0 ? (
          <HsEmpty icon={<MdLocalOffer aria-hidden="true" />} title="No active offers" body="Check back soon for new deals." />
        ) : (
          <div className="hs-list">
            {active.map((c) => {
              const cat = c.categoryId ? SERVICE_CATEGORIES.find((x) => x.id === c.categoryId) : null
              return (
                <div key={c.id} className="hs-card" style={{ background: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)', color: '#fff', border: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <MdRedeem aria-hidden="true" style={{ fontSize: 18 }} />
                        <strong>{c.title}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                        Code <b style={{ letterSpacing: '0.08em' }}>{c.code}</b> · min order {money(c.minOrder)}
                        {cat ? ` · ${cat.name}` : ''} · valid till {c.validUntil}
                      </p>
                    </div>
                    <Link to={cat ? `/home-services/categories/${cat.slug}` : '/home-services/categories'} className="hs-btn hs-btn--primary hs-btn--sm" style={{ background: '#fff', color: '#7c2d12', boxShadow: 'none' }}>
                      Use now
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </HomeServicesShell>
  )
}