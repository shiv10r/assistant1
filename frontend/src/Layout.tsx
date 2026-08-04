import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

type Nav = { label: string; to: string; end?: boolean }[]
const GROUPS: { title: string; items: Nav }[] = [
  { title: '🤖 My Assistant', items: [
    { label: '💬 Assistant', to: '/', end: true },
    { label: '📊 Dashboard', to: '/dashboard' },
    { label: '📑 Reports', to: '/reports' },
  ] },
  { title: '🧾 Billing', items: [{ label: '🧾 Billing', to: '/billing' }] },
  { title: '🏗️ Projects', items: [{ label: '🏗️ Projects', to: '/projects' }] },
  { title: 'Account', items: [
    { label: '👑 Plans & Pricing', to: '/plans' },
    { label: '👤 My Account', to: '/account' },
  ] },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
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
                  {it.label}
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