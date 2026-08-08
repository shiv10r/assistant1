import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { logout } from './api'
import { applyTheme, getTheme } from './theme'
import type { Theme } from './theme'
import './Layout.css'

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    assistant: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    reports: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    analytics: 'M3 3v18h18 M7 14l4-4 4 3 5-6',
    backup: 'M12 3v12 M8 11l4 4 4-4 M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    activity: 'M12 8v4l3 3 M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    billing: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 11h18 M7 15h4',
    box: 'M21 8l-9-5-9 5v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8',
    cash: 'M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4z',
    projects: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 9h1 M9 13h1 M9 17h1 M14 9h1 M14 13h1 M14 17h1',
    plans: 'M12 15c2 0 4 1.5 4 4H8c0-2.5 2-4 4-4z M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    account: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] ?? paths.assistant} />
    </svg>
  )
}

type Nav = { label: string; to: string; icon: string; end?: boolean }[]
const GROUPS: { title: string; items: Nav }[] = [
  { title: 'My Assistant', items: [
    { label: 'Assistant', to: '/', icon: 'assistant', end: true },
    { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
    { label: 'Reports', to: '/reports', icon: 'reports' },
    { label: 'Analytics', to: '/analytics', icon: 'analytics' },
    { label: 'Backup & Sync', to: '/backup', icon: 'backup' },
    { label: 'Activity', to: '/activity', icon: 'activity' },
    { label: 'Settings', to: '/settings', icon: 'settings' },
  ] },
  { title: 'Billing', items: [
    { label: 'Billing', to: '/billing', icon: 'billing' },
    { label: 'Items', to: '/billing/items', icon: 'box' },
    { label: 'Cash & Bank', to: '/billing/cashbank', icon: 'cash' },
    { label: 'Billing Settings', to: '/billing/settings', icon: 'settings' },
  ] },
  { title: 'Projects', items: [{ label: 'Projects', to: '/projects', icon: 'projects' }] },
  { title: 'Account', items: [
    { label: 'Plans & Pricing', to: '/plans', icon: 'plans' },
    { label: 'My Account', to: '/account', icon: 'account' },
  ] },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getTheme())
  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }
  function signOut() {
    logout()
    window.location.href = '/'
  }
  return (
    <div className="app">
      <header className="topbar">
        <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
        <div className="logo-mark">
          <svg viewBox="0 0 456 456" width="32" height="32">
            <defs>
              <linearGradient id="lux" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#7C4DFF"/><stop offset="0.6" stopColor="#00B8D9"/><stop offset="1" stopColor="#00E5C3"/>
              </linearGradient>
            </defs>
            <rect width="456" height="456" rx="100" fill="url(#lux)"/>
            <path d="M120 210 L228 120 L336 210" fill="none" stroke="#FFF" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M178 206 V330 H300" fill="none" stroke="#FFF" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="318" cy="228" r="17" fill="#0F0F1A"/>
          </svg>
        </div>
        <div className="brand">Lux<span>Infra</span></div>
        <div className="online">● online</div>
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="logout-btn" onClick={signOut} aria-label="Sign out">⏻</button>
      </header>

      <div className="body-row">
        <nav className={`sidebar ${open ? 'open' : ''}`}>
          {GROUPS.map((g) => (
            <div className="nav-group" key={g.title}>
              <div className="group-label">{g.title}</div>
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
                  onClick={() => setOpen(false)}
                >
                  <Icon name={it.icon} />
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        {open && <div className="backdrop" onClick={() => setOpen(false)} />}

        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
