import { useEffect, useState } from 'react'
import { api } from '../api'
import type { BackupStatus, BackupResult } from '../api'
import { btnStyle } from '../ui'

export default function Backup() {
  const [status, setStatus] = useState<BackupStatus | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    api.backupStatus().then(setStatus).catch(() => {})
  }, [])

  async function run(kind: 'push' | 'pull') {
    setBusy(kind)
    setMsg(null)
    try {
      const r: BackupResult = kind === 'push' ? await api.backupPush() : await api.backupPull()
      setMsg({ ok: r.ok, text: r.message })
      const s = await api.backupStatus()
      setStatus(s)
    } catch (e) {
      setMsg({ ok: false, text: String(e) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div className="page-head"><div><h1>Backup &amp; Sync</h1><div className="muted">Keep your data safe in the cloud (Turso)</div></div></div>

      <div className="card">
        <h2>Cloud sync status</h2>
        {status === null ? (
          <div className="muted">Checking…</div>
        ) : (
          <>
            <div className="backup-row">
              <span className={`dot ${status.enabled ? 'on' : 'off'}`} />
              <span>{status.enabled ? 'Connected to cloud' : 'Cloud sync not configured'}</span>
            </div>
            {status.enabled && (
              <>
                <div className="backup-row"><span className="muted">Endpoint</span><span>{status.url}</span></div>
                <div className="backup-row"><span className="muted">Local rows</span><span>{status.localRows}</span></div>
              </>
            )}
            {!status.enabled && (
              <p className="muted">Set TURSO_URL and TURSO_TOKEN environment variables on the server to enable cloud persistence.</p>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2>Manual sync</h2>
        <p className="muted">Push writes your local data to the cloud. Pull restores from the cloud to this server.</p>
        <div className="row-gap">
          <button style={btnStyle} onClick={() => run('push')} disabled={busy !== null || !status?.enabled}>
            {busy === 'push' ? 'Pushing…' : 'Sync to cloud'}
          </button>
          <button className="ghost-btn" onClick={() => run('pull')} disabled={busy !== null || !status?.enabled}>
            {busy === 'pull' ? 'Restoring…' : 'Restore from cloud'}
          </button>
        </div>
        {msg && <div className={`backup-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      </div>
    </>
  )
}
