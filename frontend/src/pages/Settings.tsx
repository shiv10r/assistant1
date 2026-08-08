import { useState } from 'react'
import { applyTheme, getTheme } from '../theme'
import { PageHead } from '../ui'

type ThemeChoice = 'Dark' | 'Light'

export default function Settings() {
  const [theme, setTheme] = useState<ThemeChoice>(() => getTheme() === 'light' ? 'Light' : 'Dark')

  function pick(t: ThemeChoice) {
    setTheme(t)
    applyTheme(t.toLowerCase() as 'dark' | 'light')
  }

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
        <h2>Appearance</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['Dark', 'Light'] as const).map((t) => (
            <button key={t} className={theme === t ? 'btn' : 'btn ghost'} onClick={() => pick(t)}>{t}</button>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Switches instantly between dark and light mode.</div>
      </div>

      <div className="card">
        <h2>Data &amp; Privacy</h2>
        <div className="muted" style={{ marginBottom: 12 }}>Your data stays on the backend's SQLite database. Nothing is shared.</div>
        <button className="btn ghost" onClick={backup}>⬇ Backup note</button>
      </div>

      <div className="card">
        <h2>About</h2>
        <div className="muted">LuxInfra · v1.0 · React + .NET backend · data stays on your device's server</div>
      </div>
    </>
  )
}
