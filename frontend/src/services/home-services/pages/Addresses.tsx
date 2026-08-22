import { useCallback, useEffect, useState } from 'react'
import { MdAdd, MdDeleteOutline, MdHomeWork, MdStar, MdErrorOutline } from 'react-icons/md'
import HomeServicesShell from '../HomeServicesShell'
import { HsEmpty, HsSection } from '../hsShared'
import { homeServicesApi, type CustomerAddress, type CustomerProfile } from '../homeServicesApi'
import { getEmail } from '../../../api'

type Draft = {
  label: string
  line1: string
  line2: string
  pincode: string
  contactPerson: string
  contactPhone: string
  accessInstructions: string
}

const EMPTY_DRAFT: Draft = { label: 'Home', line1: '', line2: '', pincode: '', contactPerson: '', contactPhone: '', accessInstructions: '' }

export default function Addresses() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const email = getEmail() || 'guest@vsrsystems.com'
      const p = await homeServicesApi.ensureCustomer({ email })
      setProfile(p)
      const list = await homeServicesApi.getAddresses(p.id)
      setAddresses(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load addresses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setFormError(null)
    try {
      await homeServicesApi.createAddress(profile.id, {
        label: draft.label || 'Home',
        line1: draft.line1,
        line2: draft.line2 || undefined,
        pincode: draft.pincode,
        isDefault: addresses.length === 0,
        contactPerson: draft.contactPerson || undefined,
        contactPhone: draft.contactPhone || undefined,
        accessInstructions: draft.accessInstructions || undefined,
      })
      setShowForm(false)
      setDraft(EMPTY_DRAFT)
      await load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  async function makeDefault(addressId: string) {
    if (!profile) return
    try {
      await homeServicesApi.setDefaultAddress(profile.id, addressId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update default address')
    }
  }

  async function remove(addressId: string) {
    if (!profile) return
    try {
      await homeServicesApi.deleteAddress(profile.id, addressId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete address')
    }
  }

  return (
    <HomeServicesShell>
      <section className="hs-section">
        <HsSection
          title="Saved addresses"
          action={
            <button type="button" className="hs-btn hs-btn--primary hs-btn--sm" onClick={() => { setShowForm((v) => !v); setFormError(null) }}>
              <MdAdd aria-hidden="true" /> Add address
            </button>
          }
        />

        {loading && <div className="hs-card">Loading your addresses…</div>}

        {!loading && error && (
          <div className="hs-card">
            <div className="hs-alert hs-alert--warning" role="alert" style={{ marginBottom: 12 }}>
              <MdErrorOutline aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => void load()}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {showForm && (
              <form className="hs-card" style={{ marginBottom: 16 }} onSubmit={submit}>
                <HsSection title="New address" />
                <div style={{ display: 'grid', gap: 10 }}>
                  <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                    Label
                    <select value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="hs-input">
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                    Address line 1 *
                    <input required value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} className="hs-input" placeholder="Flat / House no, Building, Street" />
                  </label>
                  <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                    Address line 2
                    <input value={draft.line2} onChange={(e) => setDraft({ ...draft, line2: e.target.value })} className="hs-input" placeholder="Landmark (optional)" />
                  </label>
                  <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                    Pincode *
                    <input required inputMode="numeric" pattern="\d{6}" title="6-digit pincode" value={draft.pincode} onChange={(e) => setDraft({ ...draft, pincode: e.target.value })} className="hs-input" placeholder="Serviceable 6-digit pincode" />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                      Contact person
                      <input value={draft.contactPerson} onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })} className="hs-input" />
                    </label>
                    <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                      Contact phone
                      <input value={draft.contactPhone} onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })} className="hs-input" inputMode="tel" />
                    </label>
                  </div>
                  <label style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                    Access instructions
                    <input value={draft.accessInstructions} onChange={(e) => setDraft({ ...draft, accessInstructions: e.target.value })} className="hs-input" placeholder="Gate code, floor, parking info…" />
                  </label>
                </div>
                {formError && (
                  <div className="hs-alert hs-alert--warning" role="alert" style={{ marginTop: 10 }}>
                    <MdErrorOutline aria-hidden="true" /> <span>{formError}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button type="submit" className="hs-btn hs-btn--primary hs-btn--sm" disabled={saving}>{saving ? 'Saving…' : 'Save address'}</button>
                  <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showForm && (
              <HsEmpty
                icon={<MdHomeWork aria-hidden="true" />}
                title="No saved addresses yet"
                body="Add an address so professionals know where to reach you."
                action={
                  <button type="button" className="hs-btn hs-btn--primary" onClick={() => setShowForm(true)}>
                    <MdAdd aria-hidden="true" /> Add your first address
                  </button>
                }
              />
            )}

            <div className="hs-list">
              {addresses.map((a) => (
                <div key={a.id} className="hs-list-row" style={{ alignItems: 'center' }}>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <MdHomeWork aria-hidden="true" />
                    <span>
                      <strong style={{ display: 'block', fontSize: 13 }}>
                        {a.label} · {a.line1}{a.line2 ? `, ${a.line2}` : ''}
                        {a.isDefault && <span style={{ marginLeft: 8, color: '#a16207', fontWeight: 800, fontSize: 11 }}>DEFAULT</span>}
                      </strong>
                      <small>{a.pincode}{a.cityName ? ` · ${a.cityName}` : ''}{a.contactPhone ? ` · ${a.contactPhone}` : ''}</small>
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    {!a.isDefault && (
                      <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => void makeDefault(a.id)} title="Set as default">
                        <MdStar aria-hidden="true" />
                      </button>
                    )}
                    <button type="button" className="hs-btn hs-btn--secondary hs-btn--sm" onClick={() => void remove(a.id)} title="Delete address">
                      <MdDeleteOutline aria-hidden="true" />
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {profile && (
              <p style={{ fontSize: 12, color: 'var(--hs-muted)', marginTop: 10 }}>
                Signed in as {profile.displayName} ({profile.email}). You can pick or add an address during booking.
              </p>
            )}
          </>
        )}
      </section>
    </HomeServicesShell>
  )
}

