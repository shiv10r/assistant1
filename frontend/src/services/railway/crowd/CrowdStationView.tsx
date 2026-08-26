import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiRadio, FiUsers, FiTrendingUp } from 'react-icons/fi'
import { crowdApi, type CrowdObservation, type CrowdAlert, type CrowdSource } from './crowd.types'

export default function CrowdStationView() {
  const { stationId } = useParams<{ stationId: string }>()
  const [observations, setObservations] = useState<CrowdObservation[]>([])
  const [alerts, setAlerts] = useState<CrowdAlert[]>([])
  const [sources, setSources] = useState<CrowdSource[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!stationId) return
    async function load() {
      const [obsResult, alertsResult, sourcesResult] = await Promise.all([
        crowdApi.observations(stationId), crowdApi.alerts(), crowdApi.sources()
      ])
      setObservations(obsResult.data ?? [])
      setAlerts(alertsResult.data ?? [])
      setSources(sourcesResult.data ?? [])
      setError(obsResult.error?.message ?? alertsResult.error?.message ?? sourcesResult.error?.message ?? '')
      setLoading(false)
    }
    void load()
  }, [stationId])

  const stationAlerts = alerts.filter((a) => a.stationId === stationId && a.isOpen)
  const recentObs = observations.slice(0, 20)

  return <div className="railway-page crowd-page">
    <header className="crowd-header">
      <Link to="/railway/crowd" className="crowd-back"><FiArrowLeft /> Back to command center</Link>
      <div><span className="railway-eyebrow">Station operations</span><h1>Station {shortId(stationId ?? '')}</h1><p>Zone-level aggregate occupancy, source health, and active alerts.</p></div>
    </header>
    {error ? <div className="railway-panel" role="alert">{error}</div> : null}
    {loading ? <div role="status">Loading station data...</div> : (
      <>
        <section className="railway-kpis">
          <Kpi icon={<FiUsers />} label="Current count" value={recentObs.filter((o) => Date.now() - new Date(o.windowEnd).getTime() < 5 * 60_000).reduce((s, o) => s + o.count, 0)} detail="Latest windows" />
          <Kpi icon={<FiAlertTriangle />} label="Open alerts" value={stationAlerts.length} detail={`${stationAlerts.filter((a) => a.level === 'Critical').length} critical`} />
          <Kpi icon={<FiRadio />} label="Sources online" value={sources.filter((s) => s.enabled).length} detail={`${sources.length} configured`} />
          <Kpi icon={<FiTrendingUp />} label="Trend" value={recentObs.length > 1 ? recentObs[0].count - recentObs[1].count : 0} detail="Count delta" />
        </section>
        <section className="railway-grid">
          <div className="railway-panel"><div className="railway-panel-head"><div><span>Zone detail</span><h2>Active alerts</h2></div></div>
            {stationAlerts.length ? stationAlerts.map((a) => <article className={`crowd-alert-card crowd-${a.level.toLowerCase()}`} key={a.id}><FiAlertTriangle /><div><strong>{a.level} zone threshold</strong><p>Zone {shortId(a.stationZoneId)}</p><small>Raised {formatTime(a.raisedAt)}</small></div><span className="crowd-status">Acknowledged</span></article>) : <div className="crowd-empty"><FiCheckCircle />All zones normal.</div>}
          </div>
          <div className="railway-panel"><div className="railway-panel-head"><div><span>Zone detail</span><h2>Recent windows</h2></div></div>
            <div className="railway-table-wrap"><div className="crowd-table"><div className="crowd-row head"><span>Zone</span><span>Count</span><span>Confidence</span><span>In/Out</span><span>Window</span></div>
              {recentObs.map((o) => <div className="crowd-row" key={o.id}><code>{shortId(o.stationZoneId)}</code><strong>{o.count}</strong><span>{Math.round(o.confidence * 100)}%</span><span>{o.inflow ?? 0}/{o.outflow ?? 0}</span><span>{formatTime(o.windowEnd)}</span></div>)}
            </div></div>
          </div>
        </section>
        <section className="railway-panel"><div className="railway-panel-head"><div><span>Source health</span><h2>Configured sources</h2></div></div>
          <div className="crowd-stack">{sources.map((s) => <article className="crowd-source" key={s.id}><span className={s.enabled ? 'online' : ''}><FiRadio /></span><div><strong>{s.name}</strong><small>{s.adapterType} · zone {shortId(s.stationZoneId)}</small><p>{s.lastObservationAt ? `Last ${formatTime(s.lastObservationAt)}` : 'Waiting for first observation'}</p></div></article>)}</div>
        </section>
      </>
    )}
  </div>
}
function Kpi({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return <article className="railway-kpi"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}
const shortId = (v: string) => v.slice(0, 8)
const formatTime = (v: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v))