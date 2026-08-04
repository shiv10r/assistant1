import { useState } from 'react'
import { PageHead } from '../ui'

export default function Settings() {
  const [theme, setTheme] = useState<'Dark' | 'Light'>('Dark')

  const backup = () => {
    const blob = new Blob([JSON.stringify({ note: 'LuxInfra data is stored on the backend (SQLite). Download the app DB from the Render service dashboard for a full backup.' }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'luxinfra-backup-note.json'
    a.click()
  }

  return (
    <>
      <PageHead icon="⚙️" title="Settings" sub="App preferences" />

      <div className="card">
        <h2>🎨 Appearance</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['Dark', 'Light'] as const).map((t) => (
            <button key={t} className={theme === t ? 'btn' : 'btn ghost'} onClick={() => setTheme(t)}>{t}</button>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Light theme coming soon — dark mode is always on for now.</div>
      </div>

      <div className="card">
        <h2>🛡️ Data & Privacy</h2>
        <div className="muted" style={{ marginBottom: 12 }}>Your data stays on the backend's SQLite database. Nothing is shared.</div>
        <button className="btn ghost" onClick={backup}>⬇ Backup note</button>
      </div>

      <div className="card">
        <h2>ℹ️ About</h2>
        <div className="muted">LuxInfra · v1.0 · React + .NET backend · data stays on your device's server</div>
      </div>
    </>
  )
}