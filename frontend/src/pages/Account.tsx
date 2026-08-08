import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Settings } from '../api'
import { PageHead } from '../ui'

export default function Account() {
  const [s, setS] = useState<Settings>({})
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => { api.billing.settings().then(setS).catch(() => {}) }, [])

  const onChange = (k: string, v: string) => {
    setS((p) => ({ ...p, [k]: v }))
    api.billing.setSetting(k, v).catch(() => {})
  }

  const saveFirm = async () => {
    const keys = ['general.firm_name', 'general.firm_phone', 'general.firm_email', 'general.firm_address', 'general.firm_gstin', 'general.firm_state']
    try {
      for (const k of keys) await api.billing.setSetting(k, s[k] || '')
      setMsg({ ok: true, text: 'Profile saved.' })
    } catch (e) {
      setMsg({ ok: false, text: String(e) })
    }
  }

  return (
    <>
      <PageHead icon="👤" title="My Account" sub="Your firm profile & preferences" />

      <div className="card">
        <h2>Firm profile</h2>
        <div className="muted" style={{ marginBottom: 12 }}>Used on invoices, reports and the bill-to header.</div>
        <div className="form-row">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span className="f-label">Firm name</span><input value={s['general.firm_name'] || ''} onChange={(e) => onChange('general.firm_name', e.target.value)} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span className="f-label">Phone</span><input value={s['general.firm_phone'] || ''} onChange={(e) => onChange('general.firm_phone', e.target.value)} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span className="f-label">Email</span><input value={s['general.firm_email'] || ''} onChange={(e) => onChange('general.firm_email', e.target.value)} /></label>
        </div>
        <div className="form-row">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 100%' }}><span className="f-label">Address</span><input value={s['general.firm_address'] || ''} onChange={(e) => onChange('general.firm_address', e.target.value)} /></label>
        </div>
        <div className="form-row">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span className="f-label">GSTIN</span><input value={s['general.firm_gstin'] || ''} onChange={(e) => onChange('general.firm_gstin', e.target.value)} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}><span className="f-label">State</span><input value={s['general.firm_state'] || ''} onChange={(e) => onChange('general.firm_state', e.target.value)} /></label>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn" onClick={saveFirm}>Save profile</button>
        </div>
        {msg && <div className={`backup-msg ${msg.ok ? 'ok' : 'err'}`} style={{ marginTop: 10 }}>{msg.text}</div>}
      </div>

      <div className="card">
        <h2>Login</h2>
        <p className="muted">Default login is admin / LuxInfra@2026. Change the password on the server via the AUTH_PASS environment variable.</p>
      </div>
    </>
  )
}
