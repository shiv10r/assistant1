import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MdArrowForward, MdFlashOn, MdSearch, MdVerifiedUser } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, HsEmpty, HsSection } from '../hsShared'
import { SERVICES, SERVICE_CATEGORIES } from '../homeServicesData'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const store = useHomeServicesStore()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const q = params.get('q') ?? ''
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const results = useMemo(() => {
    const term = q.toLowerCase()
    let list = SERVICES.filter((s) => {
      const inCategory = categoryFilter === 'all' || s.categoryId === categoryFilter
      const inTerm = !term || s.name.toLowerCase().includes(term) || s.shortDescription.toLowerCase().includes(term) || s.longDescription.toLowerCase().includes(term)
      const inEmergency = term !== 'emergency' || s.isEmergency
      return inCategory && inTerm && inEmergency
    })
    return list
  }, [q, categoryFilter])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (query.trim()) next.set('q', query.trim())
    setParams(next)
  }

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <form className="hs-hero-search" onSubmit={submit} role="search" style={{ maxWidth: '100%' }}>
          <MdSearch aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services, categories..." aria-label="Search services" />
        </form>
      </section>

      <section className="hs-section">
        <div className="hs-filter-bar" role="tablist" aria-label="Category filters">
          <button type="button" className={`hs-chip ${categoryFilter === 'all' ? 'is-selected' : ''}`} style={categoryFilter === 'all' ? { background: 'var(--hs-ink)', color: '#fff', borderColor: 'var(--hs-ink)' } : {}} onClick={() => setCategoryFilter('all')}>
            All
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button key={cat.id} type="button" className="hs-chip" style={categoryFilter === cat.id ? { background: 'var(--hs-ink)', color: '#fff', borderColor: 'var(--hs-ink)' } : { background: '#f5f5f4', color: 'var(--hs-ink)', borderColor: 'var(--hs-line)' }} onClick={() => setCategoryFilter(cat.id)}>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="hs-section">
        <HsSection title={q ? `Results for "${q}"` : 'All services'} />
        {results.length === 0 ? (
          <HsEmpty
            icon={<MdSearch aria-hidden="true" />}
            title="No services found"
            body="Try a different keyword, or browse all categories."
            action={<Link className="hs-btn hs-btn--primary" to="/home-services/categories">Browse categories</Link>}
          />
        ) : (
          <div className="hs-service-grid">
            {results.map((s) => {
              const cat = SERVICE_CATEGORIES.find((c) => c.id === s.categoryId)
              const pkg = s.packages[1] ?? s.packages[0]
              const available = store.professionalsForService(s.id, store.activeCustomer.cityId, store.cityById(store.activeCustomer.cityId)?.localities[0]?.id ?? '')
              return (
                <Link key={s.id} to={`/home-services/services/${s.slug}`} className="hs-service-card">
                  <img src={s.image} alt={s.name} loading="lazy" />
                  <div className="hs-service-card-body">
                    <strong>{s.name}</strong>
                    <p>{s.shortDescription}</p>
                    <div className="hs-tag-row">
                      {s.isEmergency && <span className="hs-tag hs-tag--emergency"><MdFlashOn aria-hidden="true" /> Emergency</span>}
                      <span className="hs-tag hs-tag--inspect"><MdVerifiedUser aria-hidden="true" /> {available.length} pros</span>
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
        )}
      </section>

      {results.length > 0 && (
        <Link to="/home-services/categories" className="hs-btn hs-btn--secondary">
          <MdArrowForward aria-hidden="true" style={{ transform: 'rotate(180deg)' }} /> Browse by category
        </Link>
      )}
    </HomeServicesShell>
  )
}