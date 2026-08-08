import { useState } from 'react'
import { login } from '../api'
import { btnStyle, inputStyle } from '../ui'

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await login(username, password)
      onAuthed()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <svg viewBox="0 0 456 456" width="64" height="64">
            <defs>
              <linearGradient id="lux-login" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7C4DFF" /><stop offset="0.6" stopColor="#00B8D9" /><stop offset="1" stopColor="#00E5C3" />
              </linearGradient>
            </defs>
            <rect width="456" height="456" rx="100" fill="url(#lux-login)" />
            <path d="M120 210 L228 120 L336 210" fill="none" stroke="#FFF" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M178 206 V330 H300" fill="none" stroke="#FFF" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="318" cy="228" r="17" fill="#0F0F1A" />
          </svg>
        </div>
        <h1>LuxInfra</h1>
        <p className="muted">Sign in to continue</p>

        <label className="f-label">Username</label>
        <input
          className="login-input"
          style={inputStyle}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <label className="f-label">Password</label>
        <input
          className="login-input"
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {err && <div className="login-err">{err}</div>}

        <button style={btnStyle} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted login-hint">Default: admin / LuxInfra@2026</p>
      </form>
    </div>
  )
}
