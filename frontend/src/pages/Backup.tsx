import { useEffect, useState } from 'react'
import { api } from '../api'
import type { BackupStatus, BackupResult, FirebaseVersion, DriveStatus } from '../api'
import { Button } from '../components/ui'
import { subscribePush, onPushMessage, ensureServiceWorker } from '../firebase'

export default function Backup() {
  const [status, setStatus] = useState<BackupStatus | null>(null)
  const [fb, setFb] = useState<FirebaseVersion | null>(null)
  const [drive, setDrive] = useState<DriveStatus | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [pushState, setPushState] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    api.backupStatus().then(setStatus).catch(() => {})
    api.firebaseVersion().then(setFb).catch(() => {})
    api.integrations.driveStatus().then(setDrive).catch(() => {})
    onPushMessage((p) => setToast(`${p.title ?? 'VSR Systems'} — ${p.body ?? ''}`))
  }, [])

  async function runDrive() {
    setBusy('drive')
    setMsg(null)
    try {
      const r = await api.integrations.driveBackup()
      setMsg({ ok: !!r.ok, text: r.message || r.error || 'Drive backup failed' })
      const s = await api.integrations.driveStatus()
      setDrive(s)
    } catch (e) {
      setMsg({ ok: false, text: String(e) })
    } finally {
      setBusy(null)
    }
  }

  async function connectDrive() {
    setBusy('drive-connect')
    try {
      const r = await api.integrations.driveAuthUrl()
      if (r.ok && r.url) window.open(r.url, '_blank', 'noopener')
      else setMsg({ ok: false, text: r.message || 'Could not start Drive setup' })
    } catch (e) {
      setMsg({ ok: false, text: String(e) })
    } finally {
      setBusy(null)
    }
  }

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

  async function runFb(kind: 'push' | 'pull') {
    setBusy('fb-' + kind)
    setMsg(null)
    try {
      const r: BackupResult = kind === 'push' ? await api.firebasePush() : await api.firebasePull()
      setMsg({ ok: r.ok, text: r.message })
      const s = await api.firebaseVersion()
      setFb(s)
    } catch (e) {
      setMsg({ ok: false, text: String(e) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div className="page-head"><div><h1>Backup &amp; Sync</h1><div className="muted">Keep your data safe in the cloud</div></div></div>

      <div className="card">
        <h2>Cloud sync status (Turso)</h2>
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
        <h2>Manual sync (Turso)</h2>
        <p className="muted">Push writes your local data to the cloud. Pull restores from the cloud to this server.</p>
        <div className="row-gap">
          <Button onClick={() => run('push')} disabled={busy !== null || !status?.enabled}>
            {busy === 'push' ? 'Pushing…' : 'Sync to cloud'}
          </Button>
          <button className="ghost-btn" onClick={() => run('pull')} disabled={busy !== null || !status?.enabled}>
            {busy === 'pull' ? 'Restoring…' : 'Restore from cloud'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Firebase backup</h2>
        <p className="muted">Stores your entire database snapshot in Cloud Firestore (free Spark plan) and auto-restores it after redeploys, so data survives Render free-tier disk wipes. Your browser also refreshes automatically when the data version changes.</p>
        {fb === null ? (
          <div className="muted">Checking…</div>
        ) : (
          <>
            <div className="backup-row">
              <span className={`dot ${fb.enabled ? 'on' : 'off'}`} />
              <span>{fb.enabled ? 'Firebase connected' : 'Firebase not configured'}</span>
            </div>
            {fb.enabled && (
              <>
                <div className="backup-row"><span className="muted">Project</span><span>{fb.project}</span></div>
                <div className="backup-row"><span className="muted">Store</span><span>{fb.bucket}</span></div>
                <div className="backup-row"><span className="muted">Data version</span><span>{fb.version > 0 ? fb.version : 'no backup yet'}</span></div>
                <div className="backup-row"><span className="muted">Local rows</span><span>{fb.localRows}</span></div>
              </>
            )}
            {!fb.enabled && (
              <p className="muted">Set FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT environment variables on the server to enable Firebase backup.</p>
            )}
          </>
        )}
        <div className="row-gap" style={{ marginTop: 12 }}>
          <Button onClick={() => runFb('push')} disabled={busy !== null || !fb?.enabled}>
            {busy === 'fb-push' ? 'Uploading…' : 'Upload to Firebase'}
          </Button>
          <button className="ghost-btn" onClick={() => runFb('pull')} disabled={busy !== null || !fb?.enabled}>
            {busy === 'fb-pull' ? 'Restoring…' : 'Restore from Firebase'}
          </button>
        </div>
        {msg && <div className={`backup-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      </div>

      <div className="card">
        <h2>Google Drive backup (secondary)</h2>
        <p className="muted">Uploads the full database snapshot — including all uploaded files (designs, project files, MOM attachments) — to your personal Google Drive. Works alongside Turso/Firebase as an extra copy you can open anywhere.</p>
        {drive === null ? (
          <div className="muted">Checking…</div>
        ) : (
          <>
            <div className="backup-row">
              <span className={`dot ${drive.configured ? 'on' : 'off'}`} />
              <span>{drive.configured ? 'Google Drive connected' : drive.hasCredentials ? 'Credentials found — connect your Google account' : 'Google Drive not configured'}</span>
            </div>
            {drive.configured && (
              <>
                <div className="backup-row"><span className="muted">Folder</span><span>{drive.folder}</span></div>
                {drive.email && <div className="backup-row"><span className="muted">Account</span><span>{drive.email}</span></div>}
              </>
            )}
            {!drive.hasCredentials && (
              <p className="muted">Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET environment variables on the server, then reload this page.</p>
            )}
          </>
        )}
        <div className="row-gap" style={{ marginTop: 12 }}>
          <Button onClick={runDrive} disabled={busy !== null || !drive?.configured}>
            {busy === 'drive' ? 'Uploading…' : 'Back up to Drive'}
          </Button>
          {drive?.hasCredentials && !drive.configured && (
            <button className="ghost-btn" onClick={connectDrive} disabled={busy !== null}>
              {busy === 'drive-connect' ? 'Opening…' : 'Connect Google Drive'}
            </button>
          )}
        </div>
        {msg && <div className={`backup-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      </div>

      <div className="card">
        <h2>Push notifications (FCM)</h2>
        <p className="muted">Enable browser notifications to get alerts on the phone/app when attendance is marked, site progress is logged, or material is issued. Works on the free Spark plan.</p>
        <div className="row-gap">
          <Button onClick={enablePush} disabled={busy !== null}>
            {busy === 'push' ? 'Enabling…' : 'Enable notifications on this device'}
          </Button>
          <button className="ghost-btn" onClick={sendTest} disabled={busy !== null}>
            {busy === 'test' ? 'Sending…' : 'Send test notification'}
          </button>
        </div>
        {pushState && <div className={`backup-msg ${pushState === 'done' ? 'ok' : 'err'}`}>{pushState}</div>}
        {toast && <div className="backup-msg ok" style={{ marginTop: 8 }}>🔔 {toast}</div>}
      </div>
    </>
  )

  async function enablePush() {
    setBusy('push'); setPushState('')
    try {
      const reg = await ensureServiceWorker()
      if (!reg) { setPushState('Could not register the notification service worker.'); return }
      const res = await subscribePush()
      if (res.error) { setPushState('Push error: ' + res.error); return }
      if (!res.token) { setPushState('Firebase returned no token'); return }
      const r = await api.pushRegister(res.token)
      setPushState(r.ok ? 'done' : (r.message || 'Registration failed'))
    } catch (e) {
      setPushState(String(e))
    } finally {
      setBusy(null)
    }
  }

  async function sendTest() {
    setBusy('test'); setPushState('')
    try {
      const r = await api.pushTest()
      setPushState(r.ok && r.enabled ? `done` : r.sent > 0 ? `Sent to ${r.sent} device(s)` : 'Sent — but no devices registered yet')
    } catch (e) {
      setPushState(String(e))
    } finally {
      setBusy(null)
    }
  }
}
