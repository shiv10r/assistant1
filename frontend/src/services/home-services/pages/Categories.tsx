import { Link } from 'react-router-dom'
import { MdArrowForward, MdFlashOn } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { SERVICES, SERVICE_CATEGORIES } from '../homeServicesData'
import { HsSection } from '../hsShared'

export default function Categories() {
  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection title="All services" />
        <div className="hs-cat-grid">
          {SERVICE_CATEGORIES.map((cat) => {
            const count = SERVICES.filter((s) => s.categoryId === cat.id).length
            const emergencyCount = SERVICES.filter((s) => s.categoryId === cat.id && s.isEmergency).length
            return (
              <Link key={cat.id} to={`/home-services/categories/${cat.slug}`} className="hs-cat-card" style={{ background: cat.gradient }}>
                <span className="hs-cat-count">{count} services</span>
                <strong>{cat.name}</strong>
                <span>{cat.tagline}</span>
                {emergencyCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, fontWeight: 800 }}>
                    <MdFlashOn aria-hidden="true" /> Emergency available
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="How it works" />
        <div className="hs-service-grid">
          {[
            { title: '1. Choose a service', body: 'Pick from verified categories, packages and add-ons.' },
            { title: '2. Pick a slot', body: 'See live availability and book a time that suits you.' },
            { title: '3. Get a fair price', body: 'Transparent server-side quote with no hidden charges.' },
            { title: '4. Track & relax', body: 'Follow your professional in real time and pay after service.' },
          ].map((s) => (
            <div key={s.title} className="hs-card">
              <strong>{s.title}</strong>
              <p style={{ margin: '6px 0 0', color: 'var(--hs-muted)', fontSize: 12, lineHeight: 1.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="Popular right now" />
        <div className="hs-service-grid">
          {[...SERVICES].sort((a, b) => b.packages[0].basePrice - a.packages[0].basePrice).slice(0, 4).map((s) => (
            <Link key={s.id} to={`/home-services/services/${s.slug}`} className="hs-service-card">
              <img src={s.image} alt={s.name} loading="lazy" />
              <div className="hs-service-card-body">
                <strong>{s.name}</strong>
                <p>{s.shortDescription}</p>
                <span className="hs-price-row" style={{ justifyContent: 'flex-start', gap: 6 }}>
                  <b>{s.packages[0].basePrice >= 1000 ? 'from' : 'starts at'} {s.packages[0].basePrice >= 1000 ? '' : ''}</b>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--hs-brand-2)', fontSize: 12, fontWeight: 800 }}>
                  Book now <MdArrowForward aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </HomeServicesShell>
  )
}