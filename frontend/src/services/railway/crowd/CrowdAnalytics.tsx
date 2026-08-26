import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiCheckCircle, FiRadio, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { crowdApi, type CrowdObservation, type CrowdAlert, type CrowdSource, type CrowdIncident } from './crowd.types'

export default function CrowdAnalytics() {
  const [observations, setObservations] = useState<CrowdObservation[]>([])
  const [alerts, setAlerts] = useState<CrowdAlert[]>([])
  const [sources, setSources] = useState<CrowdSource[]>([])
  const [incidents, setIncidents] = useState<CrowdIncident[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [obsResult, alertsResult, sourcesResult, incidentsResult] = await Promise.all([
        crowdApi.observations(), crowdApi.alerts(), crowdApi.sources(), crowdApi.incidents()
      ])
      setObservations(obsResult.data ?? [])
      setAlerts(alertsResult.data ?? [])
      setSources(sourcesResult.data ?? [])
      setIncidents(incidentsResult.data ?? [])
      setError(obsResult.error?.message ?? alertsResult.error?.message ?? sourcesResult.error?.message ?? incidentsResult.error?.message ?? '')
      setLoading(false)
    }
    void load()
  }, [])

  const byZone = observations.reduce((acc, o) => {
    const key = o.stationZoneId
    if (!acc[key]) acc[key] = { count: 0, windows: 0, inflow: 0, outflow: 0 }
    acc[key].count += o.count
    acc[key].windows += 1
    acc[key].inflow += o.inflow ?? 0
    acc[key].outflow += o.outflow ?? 0
    return acc
  }, {} as Record<string, { count: number; windows: number; inflow: number; outflow: number }>)

  return <div className="railway-page crowd-page">
    <header className="crowd-header">
      <div><span className="railway-eyebrow">Analytics</span><h1>Crowd analytics</h1><p>Historical occupancy trends, source quality, and incident patterns.</p></div>
    </header>
    {error ? <div className="railway-panel" role="alert">{error}</div> : null}
    {loading ? <div role="status">Loading analytics...</div> : (
      <>
        <section className="railway-kpis">
          <Kpi icon={<FiUsers />} label="Total observations" value={observations.length} detail="All time" />
          <Kpi icon={<FiAlertTriangle />} label="Total alerts" value={alerts.length} detail={`${alerts.filter((a) => a.level === 'Critical').length} critical`} />
          <Kpi icon={<FiRadio />} label="Sources" value={sources.length} detail={`${sources.filter((s) => s.enabled).length} enabled`} />
          <Kpi icon={<FiTrendingUp />} label="Incidents" value={incidents.length} detail={`${incidents.filter((i) => i.status === 'Open').length} open`} />
        </section>
        <section className="railway-grid">
          <div className="railway-panel"><div className="railway-panel-head"><div><span>By zone</span><h2>Aggregate occupancy</h2></div></div>
            <div className="railway-table-wrap"><div className="crowd-table"><div className="crowd-row head"><span>Zone</span><span>Total count</span><span>Windows</span><span>Avg/window</span><span>Net flow</span></div>
              {Object.entries(byZone).map(([zone, data]) => <div className="crowd-row" key={zone}><code>{shortId(zone)}</code><strong>{data.count}</strong><span>{data.windows}</span><span>{Math.round(data.count / data.windows)}</span><span>{data.inflow - data.outflow}</span></div>)}
            </div></div>
          </div>
          <div className="railway-panel"><div className="railway-panel-head"><div><span>Source quality</span><h2>Source performance</h2></div></div>
            <div className="crowd-stack">{sources.map((s) => <article className="crowd-source" key={s.id}><span className={s.enabled ? 'online' : ''}><FiRadio /></span><div><strong>{s.name}</strong><small>{s.adapterType}</small><p>{s.lastObservationAt ? `Last ${formatTime(s.lastObservationAt)}` : 'No observations'}</p></div></article>)}</div>
          </div>
        </section>
        <section className="railway-panel"><div className="railway-panel-head"><div><span>Incidents</span><h2>Recent incidents</h2></div></div>
          {incidents.length ? incidents.slice(0, 10).map((i) => <article className="crowd-alert-card" key={i.id}><div><strong>{i.title}</strong><p>{i.status} · {formatTime(i.openedAt)}</p></div></article>) : <div className="crowd-empty"><FiCheckCircle />No incidents recorded.</div>}
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