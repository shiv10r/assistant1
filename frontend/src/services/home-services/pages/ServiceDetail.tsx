import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MdArrowForward, MdFlashOn, MdVerifiedUser, MdLocationOn, MdShield, MdCheck, MdHelpOutline } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { useHomeServicesStore } from '../homeServicesStore'
import { money, HsSection } from '../hsShared'
import { SERVICES, SERVICE_ADDONS, type HomeServicePackage } from '../homeServicesData'

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const store = useHomeServicesStore()
  const service = SERVICES.find((s) => s.slug === slug)
  const [selectedPkg, setSelectedPkg] = useState<HomeServicePackage | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<readonly string[]>([])
  const [emergency, setEmergency] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)

  const prosInCity = useMemo(() => {
    if (!service) return 0
    return store.professionalsForService(service.id, store.activeCustomer.cityId, store.cityById(store.activeCustomer.cityId)?.localities[0]?.id ?? '').length
  }, [service, store])

  if (!service) {
    return (
      <HomeServicesShell>
        <div className="hs-empty">
          <h3>Service not found</h3>
          <p>The service you're looking for does not exist.</p>
          <Link className="hs-btn hs-btn--primary" to="/home-services/categories">Browse services</Link>
        </div>
      </HomeServicesShell>
    )
  }

  const activePkg = selectedPkg ?? service.packages[1] ?? service.packages[0]

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function applyCoupon() {
    if (!service) return
    setCouponError(null)
    const coupon = store.couponByCode(couponCode)
    if (!coupon) {
      setCouponError('This coupon is invalid or inactive.')
      return
    }
    if (activePkg.basePrice < coupon.minOrder) {
      setCouponError(`This coupon needs a minimum order of ${money(coupon.minOrder)}.`)
      return
    }
  }

  function startBooking() {
    if (!service) return
    navigate('/home-services/book', {
      state: {
        serviceId: service.id,
        packageId: activePkg.id,
        addOnIds: selectedAddOns,
        emergency: emergency && service.isEmergency,
        couponCode: couponCode || null,
      },
    })
  }

  return (
    <HomeServicesShell>
      <section className="hs-detail-hero">
        <img src={service.image} alt={service.name} />
        <div className="hs-detail-hero-content">
          <h1>{service.name}</h1>
          <p>{service.shortDescription}</p>
          <div className="hs-tag-row" style={{ marginTop: 8 }}>
            {service.isEmergency && <span className="hs-tag hs-tag--emergency"><MdFlashOn aria-hidden="true" /> Emergency</span>}
            {service.warranty && <span className="hs-tag hs-tag--warranty"><MdShield aria-hidden="true" /> {service.warranty.label}</span>}
            <span className="hs-tag" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}><MdVerifiedUser aria-hidden="true" /> Verified pros · {prosInCity} in your city</span>
          </div>
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="About this service" />
        <div className="hs-card">
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#44403c' }}>{service.longDescription}</p>
          {service.needsInspection && (
            <div className="hs-alert hs-alert--info" style={{ marginTop: 12 }}>
              <MdHelpOutline aria-hidden="true" style={{ fontSize: 18, flexShrink: 0 }} />
              <span>This is an inspection-based job. A technician visits first, assesses the work, and shares an exact price before starting — you approve before any charge.</span>
            </div>
          )}
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="Choose a package" />
        <div className="hs-package-grid">
          {service.packages.map((pkg) => (
            <button key={pkg.id} type="button" className={`hs-package ${activePkg.id === pkg.id ? 'is-selected' : ''}`} onClick={() => setSelectedPkg(pkg)}>
              <b>{pkg.name}</b>
              <div className="hs-price-row">
                <b style={{ color: 'var(--hs-brand)' }}>{money(pkg.basePrice)}</b>
                <small>{pkg.durationMins} min</small>
              </div>
              <ul>
                {pkg.inclusions.slice(0, 3).map((inc) => (
                  <li key={inc}>{inc}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </section>

      <section className="hs-section">
        <HsSection title="Add-ons (optional)" />
        <div className="hs-list">
          {SERVICE_ADDONS.filter((a) => a.price > 0).map((addOn) => {
            const checked = selectedAddOns.includes(addOn.id)
            return (
              <button key={addOn.id} type="button" className="hs-list-row" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => toggleAddOn(addOn.id)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span className={`hs-tag ${checked ? 'hs-tag--warranty' : ''}`} style={{ minWidth: 22, justifyContent: 'center' }}>
                    {checked ? <MdCheck aria-hidden="true" /> : null}
                  </span>
                  {addOn.name}
                </span>
                <small>{addOn.price > 0 ? money(addOn.price) : 'Included'}</small>
              </button>
            )
          })}
        </div>
      </section>

      {service.isEmergency && (
        <section className="hs-section">
          <div className="hs-card" style={{ borderColor: '#fecaca' }}>
            <label className="hs-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: 0 }}>
              <span>
                <strong>Emergency service</strong>
                <small style={{ display: 'block', color: 'var(--hs-muted)', fontWeight: 600 }}>Priority response, fees apply</small>
              </span>
              <span className="hs-slot" style={{ padding: '6px 14px', borderRadius: 999 }} onClick={() => setEmergency((v) => !v)} role="switch" aria-checked={emergency}>
                {emergency ? 'On' : 'Off'}
              </span>
            </label>
          </div>
        </section>
      )}

      <section className="hs-section">
        <HsSection title="Have a coupon?" />
        <div className="hs-card" style={{ display: 'flex', gap: 8 }}>
          <input className="hs-input" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} aria-label="Coupon code" />
          <button type="button" className="hs-btn hs-btn--secondary" onClick={applyCoupon}>Apply</button>
        </div>
        {couponError && <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 8 }}>{couponError}</p>}
      </section>

      <section className="hs-section">
        <div className="hs-sticky-cta">
          <div>
            <small>Starts from</small>
            <b>{money(activePkg.basePrice)}</b>
          </div>
          <button type="button" className="hs-btn hs-btn--primary" onClick={startBooking}>
            Book now <MdArrowForward aria-hidden="true" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--hs-muted)', fontSize: 12 }}>
          <MdLocationOn aria-hidden="true" /> Serving {store.cityById(store.activeCustomer.cityId)?.name ?? ''} & nearby areas
        </div>
      </section>
    </HomeServicesShell>
  )
}