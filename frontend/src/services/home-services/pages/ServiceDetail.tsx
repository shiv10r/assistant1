import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MdArrowForward, MdFlashOn, MdVerifiedUser, MdShield, MdCheck, MdHelpOutline, MdErrorOutline } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { money, HsSection } from '../hsShared'
import { homeServicesApi } from '../homeServicesApi'
import type { CustomerProfile } from '../homeServicesApi'
import { getEmail } from '../../../api'

type ApiPackage = {
  id: string
  name: string
  shortDescription: string
  basePrice: number
  durationMins: number
  whatIncluded: string
  warranty: string
  isPopular: boolean
  discountedPrice?: number | null
}

type ApiAddOn = {
  id: string
  name: string
  price: number
}

type ApiService = {
  id: string
  categoryId: string
  categoryName: string
  name: string
  slug: string
  shortDescription: string
  longDescription: string
  imageUrl: string
  isEmergency: boolean
  needsInspection: boolean
  inspectionFee: number
  startingPrice: number
  packages: ApiPackage[]
  addOns: ApiAddOn[]
  problems?: { id: string; name: string; description?: string }[]
}

export type BookingFlowState = {
  serviceId: string
  packageId: string
  addOnIds: readonly string[]
  emergency: boolean
  couponCode: string | null
}

function splitInclusions(text: string): string[] {
  if (!text) return []
  return text.split(/\s*[,;\n]\s*/).filter(Boolean)
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [service, setService] = useState<ApiService | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedPkgId, setSelectedPkgId] = useState<string>('')
  const [selectedAddOns, setSelectedAddOns] = useState<readonly string[]>([])
  const [emergency, setEmergency] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const [s, p] = await Promise.all([
          homeServicesApi.getServiceById(slug),
          homeServicesApi.ensureCustomer({ email: getEmailSafe() }).catch(() => null),
        ])
        setService(s as unknown as ApiService)
        setProfile(p)
        const preferred = (s.packages ?? []).find(
  (x): x is { isPopular: boolean } => 'isPopular' in x,
) ?? s.packages?.[0]
        setSelectedPkgId(preferred?.id ?? '')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load this service')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  const activePkg = useMemo(
    () => service?.packages.find((p) => p.id === selectedPkgId) ?? service?.packages[0] ?? null,
    [service, selectedPkgId],
  )

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function startBooking() {
    if (!service || !activePkg) return
    navigate('/home-services/book', {
      state: {
        serviceId: service.id,
        packageId: activePkg.id,
        addOnIds: selectedAddOns,
        emergency: emergency && service.isEmergency,
        couponCode: couponCode || null,
      } satisfies BookingFlowState,
    })
  }

  if (loading) {
    return (
      <HomeServicesShell>
        <div className="hs-card">Loading service…</div>
      </HomeServicesShell>
    )
  }

  if (error || !service) {
    return (
      <HomeServicesShell>
        <div className="hs-empty">
          <MdErrorOutline aria-hidden="true" />
          <h3>{error ? 'Something went wrong' : 'Service not found'}</h3>
          <p>{error ?? "The service you're looking for does not exist."}</p>
          <Link className="hs-btn hs-btn--primary" to="/home-services/categories">Browse services</Link>
        </div>
      </HomeServicesShell>
    )
  }

  return (
    <HomeServicesShell>
      <section className="hs-detail-hero">
        <img src={service.imageUrl} alt={service.name} />
        <div className="hs-detail-hero-content">
          <h1>{service.name}</h1>
          <p>{service.shortDescription}</p>
          <div className="hs-tag-row" style={{ marginTop: 8 }}>
            {service.isEmergency && <span className="hs-tag hs-tag--emergency"><MdFlashOn aria-hidden="true" /> Emergency</span>}
            {!!activePkg?.warranty && (
              <span className="hs-tag hs-tag--warranty"><MdShield aria-hidden="true" /> {activePkg.warranty}</span>
            )}
            <span className="hs-tag" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}><MdVerifiedUser aria-hidden="true" /> Verified pros</span>
          </div>
        </div>
      </section>

      <HsSection title="Choose a package" />
      <div className="hs-package-grid">
        {service.packages.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`hs-package ${activePkg?.id === p.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedPkgId(p.id)}
          >
            {p.isPopular && <span className="hs-popular">Popular</span>}
            <b>{p.name}</b>
            <div className="hs-price-row">
              <b style={{ color: 'var(--hs-brand)' }}>{money(p.discountedPrice ?? p.basePrice)}</b>
              <small>~ {p.durationMins} min</small>
            </div>
            <ul>
              {splitInclusions(p.whatIncluded).slice(0, 4).map((inc) => (
                <li key={inc}><MdCheck aria-hidden="true" /> {inc}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {service.addOns.length > 0 && (
        <>
          <HsSection title="Add-ons" />
          <div className="hs-card">
            {service.addOns.map((a) => (
              <label key={a.id} className="hs-list-row" style={{ cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(a.id)}
                    onChange={() => toggleAddOn(a.id)}
                  />
                  {a.name}
                </span>
                <small>+ {money(a.price)}</small>
              </label>
            ))}
          </div>
        </>
      )}

      <HsSection title="Common problems we fix" />
      <div className="hs-card">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9 }}>
          {(service.problems ?? []).map((pr) => (
            <li key={pr.id}><MdHelpOutline aria-hidden="true" /> {pr.name}{pr.description ? ` — ${pr.description}` : ''}</li>
          ))}
          {(service.problems ?? []).length === 0 && <li>General inspection &amp; fix</li>}
        </ul>
      </div>

      {service.isEmergency && (
        <label className="hs-list-row" style={{ marginTop: 12, cursor: 'pointer' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} />
            <MdFlashOn aria-hidden="true" /> Book as emergency (priority dispatch)
          </span>
        </label>
      )}

      <div className="hs-field" style={{ marginTop: 12 }}>
        <label htmlFor="hs-coupon">Coupon code</label>
        <input id="hs-coupon" className="hs-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Optional" />
      </div>

      <div className="hs-cta-bar">
        <div>
          <small>Total from</small>
          <strong>{money(activePkg ? (activePkg.discountedPrice ?? activePkg.basePrice) : service.startingPrice)}</strong>
          {profile && <small style={{ display: 'block' }}>{profile.displayName}</small>}
        </div>
        <button type="button" className="hs-btn hs-btn--primary" onClick={startBooking} disabled={!activePkg}>
          Continue <MdArrowForward aria-hidden="true" />
        </button>
      </div>
    </HomeServicesShell>
  )
}

function getEmailSafe(): string {
  try {
    return getEmail() || 'guest@vsrsystems.com'
  } catch {
    return 'guest@vsrsystems.com'
  }
}
