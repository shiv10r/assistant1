import { useState } from 'react'
import { login, register } from '../api'
import { Sparkles } from 'lucide-react'

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      if (mode === 'register') {
        if (password !== confirm) { setErr('Passwords do not match'); return }
        await register(username, password)
      } else {
        await login(username, password)
      }
      onAuthed()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next)
    setErr('')
    setPassword('')
    setConfirm('')
  }

  return (
    <div className="login-wrap">
      <div className="login-aurora" aria-hidden="true">
        <span className="aurora-blob b1" /><span className="aurora-blob b2" /><span className="aurora-blob b3" />
      </div>

      <div className="login-intro">
        <div className="intro-line l1">Welcome to</div>
        <div className="intro-line l2"><span className="grad-text">Lux Infra</span></div>
        <div className="intro-line l3">Your business, one dashboard away</div>
      </div>

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

        <h1 className="login-title">Lux<span>Infra</span></h1>
        <p className="login-sub">
          {mode === 'login'
            ? 'Sign in to manage your business, projects & expenses'
            : 'Create an account to get started — it takes a few seconds'}
        </p>

        <div className="login-mode">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>
            <Sparkles className="w-3.5 h-3.5" /> Register
          </button>
        </div>

        <div className="login-field">
          <label htmlFor="login-username">{mode === 'register' ? 'Choose a username' : 'Username'}</label>
          <input
            id="login-username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder={mode === 'register' ? 'e.g. ravi123' : 'admin'}
          />
        </div>
        <div className="login-field">
          <label htmlFor="login-password">{mode === 'register' ? 'Create password' : 'Password'}</label>
          <input
            id="login-password"
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            placeholder="••••••••"
          />
        </div>
        {mode === 'register' && (
          <div className="login-field login-field-anim">
            <label htmlFor="login-confirm">Confirm password</label>
            <input
              id="login-confirm"
              className="login-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
        )}

        {err && <div className="login-err">{err}</div>}

        <button className="login-btn" type="submit" disabled={busy}>
          {busy ? (mode === 'register' ? 'Creating account…' : 'Signing in…') : (mode === 'register' ? 'Create account' : 'Sign in')}
        </button>

        {mode === 'login' && (
          <p className="login-hint">
            Default: <code>admin</code> / <code>admin123</code>
          </p>
        )}
        {mode === 'register' && (
          <p className="login-hint">
            Accounts are created as <b>supervisor</b> — the owner can change your role later.
          </p>
        )}
      </form>
    </div>
  )
}
