import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiArrowRight, FiClipboard, FiClock, FiTool, FiUsers } from 'react-icons/fi'
import { railwayRequest } from './api/railwayApi'
import MasterDataPage from './master-data/MasterDataPage'
import './railway.css'

type RailwayView = 'overview' | 'routes' | 'stations' | 'fleet'
type Overview = { dueInspections: number; criticalDefects: number; crowdRisk: number; activeIncidents: number; overdueWork: number; activeAssets: number; activity: Array<{ id: string; action: string; resourceType: string; resourceId: string; occurredAt: string }> }

export default function RailwayWorkspace({ view }: { view: RailwayView }) {
  const [overview, setOverview] = useState<Overview | null>(null); const [error, setError] = useState('')
  useEffect(() => { if (view === 'overview') void railwayRequest<Overview>('/api/railway/operations/overview').then((result) => { setOverview(result.data); setError(result.error?.message ?? '') }) }, [view])
  if (view !== 'overview') return <MasterDataPage view={view} />
  return <div className="railway-page crowd-page"><section className="railway-hero"><div className="railway-hero-copy"><span className="railway-eyebrow">Railway operations</span><h1>One operational picture</h1><p>Persisted inspection, maintenance, asset, and aggregate crowd signals scoped to your authorized divisions.</p></div></section>
    {error ? <div className="railway-panel" role="alert">{error}</div> : null}
    <section className="railway-kpis"><Kpi icon={<FiClipboard />} label="Due inspections" value={overview?.dueInspections} /><Kpi icon={<FiAlertTriangle />} label="Critical defects" value={overview?.criticalDefects} /><Kpi icon={<FiUsers />} label="Critical crowd zones" value={overview?.crowdRisk} /><Kpi icon={<FiClock />} label="Overdue work" value={overview?.overdueWork} /></section>
    <section className="railway-grid"><CapabilityLinks /><div className="railway-panel"><div className="railway-panel-head"><div><span>Audit trail</span><h2>Recent activity</h2></div></div><div className="railway-brief">{overview?.activity?.map((item) => <p key={item.id}><FiClock /><span><strong>{item.action}</strong> {item.resourceType} {item.resourceId.slice(0, 8)}<br /><small>{new Date(item.occurredAt).toLocaleString()}</small></span></p>)}</div></div></section>
  </div>
}
function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value?: number }) { return <article className="railway-kpi"><span>{icon}</span><div><small>{label}</small><strong>{value ?? '—'}</strong></div></article> }
function CapabilityLinks() { return <section className="railway-card-grid" aria-label="Railway capabilities"><CapabilityLink to="/railway/inspections" icon={<FiClipboard />} title="Inspection & defects" description="Plan, execute, review, and recover offline inspections." /><CapabilityLink to="/railway/maintenance" icon={<FiTool />} title="Maintenance" description="Plan work orders and coordinate field execution." /><CapabilityLink to="/railway/crowd" icon={<FiUsers />} title="Crowd operations" description="Monitor aggregate station risk, alerts, and incidents." /></section> }
function CapabilityLink({ to, icon, title, description }: { to: string; icon: React.ReactNode; title: string; description: string }) { return <article className="railway-station"><div className="railway-station-code">{icon}</div><h2>{title}</h2><p>{description}</p><Link to={to}>Open capability <FiArrowRight /></Link></article> }
