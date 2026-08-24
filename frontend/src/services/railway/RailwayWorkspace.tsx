import { Link } from 'react-router-dom'
import { FiActivity, FiArrowRight, FiCheckCircle, FiClock, FiMap, FiMapPin, FiNavigation, FiTool } from 'react-icons/fi'
import './railway.css'

type RailwayView = 'overview' | 'routes' | 'stations' | 'fleet'

const routeRows = [
  { code: 'VR-101', route: 'Mumbai Central - Ahmedabad', departure: '06:10', platform: '4', status: 'On time' },
  { code: 'VR-224', route: 'Bengaluru - Chennai', departure: '07:45', platform: '2', status: 'Boarding' },
  { code: 'VR-308', route: 'New Delhi - Jaipur', departure: '09:20', platform: '7', status: 'On time' },
  { code: 'VR-417', route: 'Pune - Hyderabad', departure: '11:05', platform: '1', status: 'Scheduled' },
]

const stations = [
  { name: 'Mumbai Central', code: 'BCT', platforms: 9, movement: '84 trains today', readiness: 96 },
  { name: 'Bengaluru City', code: 'SBC', platforms: 10, movement: '72 trains today', readiness: 92 },
  { name: 'New Delhi', code: 'NDLS', platforms: 16, movement: '118 trains today', readiness: 89 },
  { name: 'Chennai Central', code: 'MAS', platforms: 12, movement: '67 trains today', readiness: 94 },
]

const fleet = [
  { unit: 'VSR Electric 401', type: 'Intercity set', service: 'VR-101', condition: 'Ready' },
  { unit: 'VSR Electric 227', type: 'Regional set', service: 'VR-224', condition: 'In service' },
  { unit: 'VSR Express 118', type: 'Long distance', service: 'VR-308', condition: 'Ready' },
  { unit: 'VSR Express 092', type: 'Long distance', service: 'Unassigned', condition: 'Inspection' },
]

const viewCopy: Record<RailwayView, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Network command', title: 'Rail movement, clearly coordinated', description: 'A focused operating view for routes, stations and fleet readiness across the VSR network.' },
  routes: { eyebrow: 'Timetable', title: 'Active routes', description: 'Track scheduled movement, departure windows and platform assignments.' },
  stations: { eyebrow: 'Network', title: 'Station readiness', description: 'See platform capacity and daily movement at key operating stations.' },
  fleet: { eyebrow: 'Rolling stock', title: 'Fleet readiness', description: 'Review assigned units and surface equipment requiring attention.' },
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
          {view === 'overview' && (
            <div className="railway-hero-actions">
              <Link to="/railway/routes">View live routes <FiArrowRight /></Link>
              <Link to="/railway/stations" className="secondary">Station status</Link>
            </div>
          )}
        </div>
        <div className="railway-line" aria-label="Network status: Western corridor operating normally">
          <div className="railway-line-top"><FiNavigation /><span>Western corridor</span><strong>Operating normally</strong></div>
          <div className="railway-track"><i /><i /><i /><i /></div>
          <div className="railway-stop-labels"><span>Mumbai</span><span>Surat</span><span>Vadodara</span><span>Ahmedabad</span></div>
        </div>
      </section>

      {view === 'overview' && <Overview />}
      {view === 'routes' && <RoutesTable />}
      {view === 'stations' && <Stations />}
      {view === 'fleet' && <Fleet />}
    </div>
  )
}

function Overview() {
  return (
    <>
      <section className="railway-kpis">
        <RailKpi icon={<FiActivity />} label="Trains moving" value="38" detail="Across 12 corridors" />
        <RailKpi icon={<FiClock />} label="On-time running" value="94.2%" detail="+1.8% this week" />
        <RailKpi icon={<FiMapPin />} label="Stations online" value="26 / 26" detail="All reporting normally" />
        <RailKpi icon={<FiTool />} label="Fleet ready" value="47 / 51" detail="4 in planned care" />
      </section>
      <section className="railway-grid">
        <div className="railway-panel railway-panel-wide">
          <div className="railway-panel-head"><div><span>Next departures</span><h2>Movement board</h2></div><Link to="/railway/routes">All routes <FiArrowRight /></Link></div>
          <RoutesTable compact />
        </div>
        <div className="railway-panel">
          <div className="railway-panel-head"><div><span>Today</span><h2>Operating brief</h2></div></div>
          <div className="railway-brief">
            <p><FiCheckCircle /> All priority corridors cleared for service.</p>
            <p><FiCheckCircle /> Crew sign-on completed for morning departures.</p>
            <p><FiTool /> Unit 092 inspection due before 16:00.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function RailKpi({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="railway-kpi"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></div>
}

function RoutesTable({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? 'railway-table-wrap compact' : 'railway-panel railway-table-wrap'}>
      <div className="railway-table">
        <div className="railway-table-row head"><span>Service</span><span>Route</span><span>Departure</span><span>Platform</span><span>Status</span></div>
        {routeRows.map((row) => <div className="railway-table-row" key={row.code}><strong>{row.code}</strong><span>{row.route}</span><span>{row.departure}</span><span>{row.platform}</span><em>{row.status}</em></div>)}
      </div>
    </section>
  )
}

function Stations() {
  return <section className="railway-card-grid">{stations.map((station) => <article className="railway-station" key={station.code}><div className="railway-station-code">{station.code}</div><FiMap /><h2>{station.name}</h2><p>{station.platforms} platforms <span /> {station.movement}</p><div className="railway-progress"><i style={{ width: `${station.readiness}%` }} /></div><small>{station.readiness}% operational readiness</small></article>)}</section>
}

function Fleet() {
  return <section className="railway-card-grid">{fleet.map((item) => <article className="railway-fleet" key={item.unit}><div className="railway-fleet-icon"><FiNavigation /></div><div><small>{item.type}</small><h2>{item.unit}</h2><p>Assignment: {item.service}</p></div><em className={item.condition === 'Inspection' ? 'warn' : ''}>{item.condition}</em></article>)}</section>
}
