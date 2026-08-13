import { useEffect, useState } from 'react'
import { login, register, api } from '../api'
import { firebaseEnabled, signInWithEmail, signInWithGoogle } from '../firebase'
import { Sparkles } from 'lucide-react'

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [fbOn, setFbOn] = useState(false)
  const [fbBusy, setFbBusy] = useState(false)

  useEffect(() => { firebaseEnabled().then(setFbOn).catch(() => {}) }, [])

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

  async function google() {
    setFbBusy(true)
    setErr('')
    try {
      const cred = await signInWithGoogle()
      if (!cred) { setErr('Google sign-in is not enabled'); return }
      await api.firebaseLogin(cred.idToken)
      onAuthed()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Google sign-in failed')
    } finally {
      setFbBusy(false)
    }
  }

  async function emailLogin() {
    setFbBusy(true)
    setErr('')
    try {
      const cred = await signInWithEmail(username, password)
      if (!cred) { setErr('Firebase login is not enabled'); return }
      await api.firebaseLogin(cred.idToken)
      onAuthed()
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Firebase sign-in failed')
    } finally {
      setFbBusy(false)
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

        {fbOn && (
          <div className="login-firebase">
            <div className="login-divider"><span>or continue with</span></div>
            <button type="button" className="login-btn google" onClick={google} disabled={fbBusy}>
              <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C41.9 35.2 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
              {fbBusy ? 'Signing in…' : 'Continue with Google'}
            </button>
            {mode === 'login' && (
              <button type="button" className="login-btn ghostfb" onClick={emailLogin} disabled={fbBusy}>
                Sign in with this email & password
              </button>
            )}
          </div>
        )}

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
