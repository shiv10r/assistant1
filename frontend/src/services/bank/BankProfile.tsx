import { useState } from 'react'
import { KeyRound, Monitor, ShieldCheck, User, Laptop, Smartphone } from 'lucide-react'
import { bankFormatDateTime } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

const SESSIONS = [
  { id: 'ses-001', device: 'Chrome on Windows', location: 'Mumbai, IN', at: '2026-08-15T07:40:00', current: true },
  { id: 'ses-002', device: 'Safari on iPhone', location: 'Mumbai, IN', at: '2026-08-14T19:22:00', current: false },
  { id: 'ses-003', device: 'Android WebView — VSR Bank app', location: 'Pune, IN', at: '2026-08-10T09:05:00', current: false },
] as const

const SECURITY_EVENTS = [
  { id: 'ev-001', event: 'New device login', at: '2026-08-15T07:40:00' },
  { id: 'ev-002', event: 'Beneficiary added (cooling period)', at: '2026-08-10T12:00:00' },
  { id: 'ev-003', event: 'Card frozen', at: '2026-08-01T16:20:00' },
  { id: 'ev-004', event: 'Password changed', at: '2026-07-21T11:10:00' },
] as const

export default function BankProfile() {
  const store = useBankStore()
  const [mfa, setMfa] = useState(true)
  const [name, setName] = useState('Aarav Sharma')
  const [phone, setPhone] = useState('98450 22190')
  const [email, setEmail] = useState('aarav.sharma@example.com')

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><User aria-hidden="true" /> Profile & security</h1>
          <p>Manage your personal details, MFA and signed-in devices.</p>
        </div>

        <div className="bank-dash-grid">
          <div>
            <div className="bank-card" style={{ marginBottom: 20 }}>
              <h2><User aria-hidden="true" /> Personal details</h2>
              <div className="bank-form">
                <div className="bank-form-row">
                  <label htmlFor="pf-name">Full name<input id="pf-name" value={name} onChange={(event) => setName(event.target.value)} /></label>
                  <label htmlFor="pf-phone">Mobile<input id="pf-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" /></label>
                </div>
                <label htmlFor="pf-email">Email<input id="pf-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="bank-btn">Save changes</button>
                  <button type="button" className="bank-btn is-ghost">Verify identity</button>
                </div>
              </div>
            </div>

            <div className="bank-card">
              <h2><Monitor aria-hidden="true" /> Signed-in devices</h2>
              <div className="bank-list-rows">
                {SESSIONS.map((session) => (
                  <div key={session.id} className="bank-list-row">
                    <span className="bank-txn-icon">{session.device.includes('iPhone') ? <Smartphone aria-hidden="true" /> : <Laptop aria-hidden="true" />}</span>
                    <div className="bank-list-row-main">
                      <div className="bank-list-row-title">{session.device} {session.current && <span className="bank-status is-active">This device</span>}</div>
                      <div className="bank-list-row-sub">{session.location} · {bankFormatDateTime(session.at)}</div>
                    </div>
                    {!session.current && <button type="button" className="bank-btn is-danger" style={{ fontSize: 12, padding: '7px 12px' }}>Sign out</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bank-card" style={{ marginBottom: 20 }}>
              <h2><ShieldCheck aria-hidden="true" /> Security</h2>
              <div className="bank-toggle-row">
                <span className="bank-toggle-label">Two-factor authentication</span>
                <button type="button" className={`bank-toggle ${mfa ? 'is-on' : ''}`} aria-pressed={mfa} aria-label="Toggle two-factor authentication" onClick={() => setMfa(!mfa)} />
              </div>
              <div className="bank-toggle-row">
                <span className="bank-toggle-label">Login alerts</span>
                <button type="button" className="bank-toggle is-on" aria-pressed aria-label="Toggle login alerts" />
              </div>
              <div className="bank-toggle-row">
                <span className="bank-toggle-label">SMS OTP for high-risk transfers</span>
                <button type="button" className="bank-toggle is-on" aria-pressed aria-label="Toggle SMS OTP for transfers" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="bank-btn is-ghost"><KeyRound aria-hidden="true" /> Change password</button>
                <button type="button" className="bank-btn is-ghost"><KeyRound aria-hidden="true" /> Manage MFA methods</button>
              </div>
            </div>

            <div className="bank-card">
              <h2><ShieldCheck aria-hidden="true" /> Recent security events</h2>
              <div className="bank-list-rows">
                {SECURITY_EVENTS.map((event) => (
                  <div key={event.id} className="bank-list-row">
                    <div className="bank-list-row-main">
                      <div className="bank-list-row-title">{event.event}</div>
                      <div className="bank-list-row-sub">{bankFormatDateTime(event.at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BankShell>
  )
}