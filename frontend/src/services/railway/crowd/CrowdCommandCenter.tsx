import { useEffect, useState } from 'react'
import { crowdApi, type CrowdAlert, type CrowdRiskLevel } from './crowd.types'
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const RISK_LABELS: Record<CrowdRiskLevel, string> = {
  Normal: 'Normal',
  Warning: 'Warning',
  Critical: 'Critical',
}

export default function CrowdCommandCenter() {
  const [alerts, setAlerts] = useState<CrowdAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    crowdApi.alerts().then(({ data, error: apiError }) => {
      if (cancelled) return
      setLoading(false)
      if (apiError) setError(apiError.message)
      else setAlerts([...(data ?? [])])
    })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div role="status">Loading crowd status...</div>
  if (error) return <div role="alert">Failed to load alerts: {error}</div>

  const open = alerts.filter((a) => a.isOpen)

  return (
    <section className="railway-page">
      <h1>Crowd Command Center</h1>
      <p>Station zone risk and alert queue.</p>
      {open.length === 0 ? (
        <div className="railway-panel"><FiCheckCircle /> All zones normal.</div>
      ) : (
        open.map((a) => (
          <article key={a.id} className="railway-panel" aria-label={`Zone alert ${a.level}`}>
            <FiAlertTriangle /> <strong>{RISK_LABELS[a.level]}</strong> — zone {a.stationZoneId.slice(0, 8)}
            <button onClick={() => crowdApi.acknowledge(a.id)}>Acknowledge</button>
          </article>
        ))
      )}
    </section>
  )
}