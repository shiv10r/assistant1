import { useEffect, useState } from 'react'
import { api } from '../api'
import type { ActivityItem } from '../api'

export default function Activity() {
  const [items, setItems] = useState<ActivityItem[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.activity().then(setItems).catch((e) => setError(String(e)))
  }, [])

  if (error) return <div className="empty">⚠️ Could not load activity. <br/><span className="muted">{error}</span></div>
  if (!items) return <div className="empty">Loading…</div>

  return (
    <>
      <div className="page-head"><div><h1>Activity</h1><div className="muted">Recent changes across your account</div></div></div>

      {items.length === 0 ? (
        <div className="empty card">Nothing logged yet — add an expense, party or project and it'll show up here.</div>
      ) : (
        <div className="card">
          <ul className="activity-list">
            {items.map((a) => (
              <li key={a.id}>
                <div className="activity-dot" />
                <div className="activity-body">
                  <div className="activity-action">{a.action}</div>
                  <div className="activity-detail">{a.detail || '—'}</div>
                </div>
                <div className="activity-time">{a.timeLabel}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
