import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MdArrowForward, MdLocalOffer, MdSearch, MdVerifiedUser, MdFlashOn, MdStar, MdWorkspacePremium,
} from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, HsSection } from '../hsShared'
import { SERVICES, SERVICE_CATEGORIES, COUPONS } from '../homeServicesData'

export default function Home() {
  const navigate = useNavigate()
  const store = useHomeServicesStore()
  const [query, setQuery] = useState('')

  const popularServices = useMemo(() => {
    const byRating = [...SERVICES]
      .map((s) => ({ service: s, rating: store.professionalsForService(s.id, store.activeCustomer.cityId, store.cityById(store.activeCustomer.cityId)?.localities[0]?.id ?? '').length }))
      .sort((a, b) => b.rating - a.rating)
    return byRating.slice(0, 8).map((x) => x.service)
  }, [store])

  const activeCoupons = COUPONS.filter((c) => c.active).slice(0, 3)

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/home-services/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <HomeServicesShell>
      <section className="hs-hero">
        <h1>Home services, done right.</h1>
        <p>Verified professionals for repairs, cleaning, AC service and more — booked in minutes, backed by warranty.</p>
        <form className="hs-hero-search" onSubmit={submitSearch} role="search">
          <MdSearch aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services — e.g. AC service, plumber, deep cleaning"
            aria-label="Search services"
          />
        </form>
        <div className="hs-hero-ctas">
          <button type="button" className="hs-chip" onClick={() => navigate('/home-services/categories')}>
            <MdVerifiedUser aria-hidden="true" /> Verified pros
          </button>
          <button type="button" className="hs-chip" onClick={() => navigate('/home-services/search?q=emergency')}>
            <MdFlashOn aria-hidden="true" /> Emergency
          </button>
          <button type="button" className="hs-chip" onClick={() => navigate('/home-services/offers')}>
            <MdLocalOffer aria-hidden="true" /> Offers
          </button>
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="What do you need help with?" action={<Link to="/home-services/categories">View all <MdArrowForward aria-hidden="true" /></Link>} />
        <div className="hs-cat-grid">
          {SERVICE_CATEGORIES.map((cat) => {
            const count = SERVICES.filter((s) => s.categoryId === cat.id).length
            return (
              <Link key={cat.id} to={`/home-services/categories/${cat.slug}`} className="hs-cat-card" style={{ background: cat.gradient }}>
                <span className="hs-cat-count">{count} services</span>
                <strong>{cat.name}</strong>
                <span>{cat.tagline}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {activeCoupons.length > 0 && (
        <section className="hs-section">
          <HsSection title="Today's offers" action={<Link to="/home-services/offers">All offers <MdArrowForward aria-hidden="true" /></Link>} />
          <div className="hs-service-grid">
            {activeCoupons.map((c) => (
              <div key={c.id} className="hs-card" style={{ background: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)', border: 0, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <MdLocalOffer aria-hidden="true" style={{ fontSize: 22 }} />
                  <strong>{c.title}</strong>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: 0 }}>
                  Code <b style={{ letterSpacing: '0.08em' }}>{c.code}</b> · min {money(c.minOrder)} · valid till {c.validUntil}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="hs-section">
        <HsSection title="Popular in your city" action={<Link to="/home-services/categories">Browse categories <MdArrowForward aria-hidden="true" /></Link>} />
        <div className="hs-service-grid">
          {popularServices.map((s) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.id === s.categoryId)
            const pkg = s.packages[1] ?? s.packages[0]
            return (
              <Link key={s.id} to={`/home-services/services/${s.slug}`} className="hs-service-card">
                <img src={s.image} alt={s.name} loading="lazy" />
                <div className="hs-service-card-body">
                  <strong>{s.name}</strong>
                  <p>{s.shortDescription}</p>
                  <div className="hs-tag-row">
                    {s.isEmergency && <span className="hs-tag hs-tag--emergency"><MdFlashOn aria-hidden="true" /> Emergency</span>}
                    {s.warranty && <span className="hs-tag hs-tag--warranty">Warranty</span>}
                  </div>
                  <div className="hs-price-row">
                    <b>{money(pkg.basePrice)}</b>
                    <small>{cat?.name ?? ''}</small>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="hs-section">
        <div className="hs-card" style={{ background: 'linear-gradient(135deg,#1c1917 0%,#451a03 100%)', color: '#fff', border: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <MdWorkspacePremium aria-hidden="true" style={{ fontSize: 26, color: '#fbbf24' }} />
            <div>
              <strong>VSR Care Membership</strong>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Save up to 15% on every service, priority support and free inspections.</p>
            </div>
          </div>
          <Link to="/home-services/account" className="hs-btn hs-btn--primary hs-btn--sm">
            <MdStar aria-hidden="true" /> Explore plans
          </Link>
        </div>
      </section>
    </HomeServicesShell>
  )
}