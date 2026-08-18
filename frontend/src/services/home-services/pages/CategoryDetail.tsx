import { Link, useParams } from 'react-router-dom'
import { MdArrowForward, MdFlashOn, MdVerifiedUser } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { SERVICES, SERVICE_CATEGORIES, type HomeService } from '../homeServicesData'
import { money, HsEmpty } from '../hsShared'

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const category = SERVICE_CATEGORIES.find((c) => c.slug === slug)
  const services = category ? SERVICES.filter((s) => s.categoryId === category.id) : []

  if (!category) {
    return (
      <HomeServicesShell>
        <HsEmpty title="Category not found" body="The category you're looking for does not exist." action={<Link className="hs-btn hs-btn--primary" to="/home-services/categories">Browse categories</Link>} />
      </HomeServicesShell>
    )
  }

  return (
    <HomeServicesShell>
      <section className="hs-detail-hero" style={{ background: category.gradient, minHeight: 140 }}>
        <div className="hs-detail-hero-content">
          <h1>{category.name}</h1>
          <p>{category.tagline} · {services.length} services</p>
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-service-grid">
          {services.map((s: HomeService) => {
            const pkg = s.packages[1] ?? s.packages[0]
            return (
              <Link key={s.id} to={`/home-services/services/${s.slug}`} className="hs-service-card">
                <img src={s.image} alt={s.name} loading="lazy" />
                <div className="hs-service-card-body">
                  <strong>{s.name}</strong>
                  <p>{s.shortDescription}</p>
                  <div className="hs-tag-row">
                    {s.isEmergency && <span className="hs-tag hs-tag--emergency"><MdFlashOn aria-hidden="true" /> Emergency</span>}
                    {s.needsInspection && <span className="hs-tag hs-tag--inspect"><MdVerifiedUser aria-hidden="true" /> Inspection</span>}
                    {s.warranty && <span className="hs-tag hs-tag--warranty">{s.warranty.label}</span>}
                  </div>
                  <div className="hs-price-row">
                    <b>{money(pkg.basePrice)}</b>
                    <small>from · {pkg.durationMins} min</small>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {services.some((s) => s.isEmergency) && (
        <section className="hs-section">
          <div className="hs-alert hs-alert--warning">
            <MdFlashOn aria-hidden="true" style={{ fontSize: 18, flexShrink: 0 }} />
            <span>Emergency options available in this category — book with priority response for urgent issues.</span>
          </div>
        </section>
      )}

      <Link to="/home-services/categories" className="hs-btn hs-btn--secondary">
        <MdArrowForward aria-hidden="true" style={{ transform: 'rotate(180deg)' }} /> All categories
      </Link>
    </HomeServicesShell>
  )
}