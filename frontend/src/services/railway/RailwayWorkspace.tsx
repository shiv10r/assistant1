import { Link } from 'react-router-dom'
import { FiArrowRight, FiClipboard, FiTool, FiUsers } from 'react-icons/fi'
import './railway.css'

type RailwayView = 'overview' | 'routes' | 'stations' | 'fleet'

const viewCopy: Record<RailwayView, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: 'Railway operations',
    title: 'Inspection, maintenance, and crowd operations',
    description: 'Tenant-scoped operational capabilities backed by Railway APIs and explicit feature gates.',
  },
  routes: {
    eyebrow: 'Master data',
    title: 'Routes and timetable services',
    description: 'Authoritative route and timetable data will appear after the persisted master-data service is enabled.',
  },
  stations: {
    eyebrow: 'Master data',
    title: 'Stations and operating zones',
    description: 'Authoritative station and zone data will appear after the persisted master-data service is enabled.',
  },
  fleet: {
    eyebrow: 'Master data',
    title: 'Railway assets',
    description: 'Authoritative asset readiness will appear after the persisted master-data service is enabled.',
  },
}

export default function RailwayWorkspace({ view }: { view: RailwayView }) {
  const copy = viewCopy[view]

  return (
    <div className="railway-page">
      <section className="railway-hero">
        <div className="railway-hero-copy">
          <span className="railway-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
      </section>

      {view === 'overview' ? <CapabilityLinks /> : <PersistedDataPending title={copy.title} />}
    </div>
  )
}

function CapabilityLinks() {
  return (
    <section className="railway-card-grid" aria-label="Railway capabilities">
      <CapabilityLink
        to="/railway/inspections"
        icon={<FiClipboard />}
        title="Inspection & defects"
        description="Plan, execute, review, and recover offline inspections."
      />
      <CapabilityLink
        to="/railway/maintenance"
        icon={<FiTool />}
        title="Maintenance"
        description="Plan work orders and coordinate assigned field execution."
      />
      <CapabilityLink
        to="/railway/crowd"
        icon={<FiUsers />}
        title="Crowd operations"
        description="Monitor aggregate station risk, alerts, and incidents."
      />
    </section>
  )
}

function CapabilityLink({
  to,
  icon,
  title,
  description,
}: {
  to: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <article className="railway-station">
      <div className="railway-station-code" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={to}>Open capability <FiArrowRight /></Link>
    </article>
  )
}

function PersistedDataPending({ title }: { title: string }) {
  return (
    <section className="railway-panel" role="status">
      <h2>{title}</h2>
      <p>No authoritative records are available. Embedded demonstration fixtures are intentionally not shown as live data.</p>
    </section>
  )
}
