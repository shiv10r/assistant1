import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, money, num, fmtDate } from '../../platform/ui'
import { ArrowRight, CalendarClock, CircleAlert, Compass, MapPinned, PackageCheck, Plus, Sparkles, Users } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign, InteriorProduct, InteriorTask, InteriorProcurement, InteriorDecision } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED, PRODUCT_SEED, TASK_SEED, PROCUREMENT_SEED, DECISION_SEED } from './seed'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../platform/dashboard'

const PHASES = ['Discovery', 'Concept', 'Design Development', 'Procurement', 'Execution', 'Handover']

export default function InteriorHome() {
  const navigate = useNavigate()
  const { items: storedProjects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)
  const { items: products } = useLocalCollection<InteriorProduct>('interior:products', PRODUCT_SEED)
  const { items: tasks } = useLocalCollection<InteriorTask>('interior:tasks', TASK_SEED)
  const { items: procurement } = useLocalCollection<InteriorProcurement>('interior:procurement', PROCUREMENT_SEED)
  const { items: decisions } = useLocalCollection<InteriorDecision>('interior:decisions', DECISION_SEED)
  const projects = useMemo(() => storedProjects.map((project) => ({ ...PROJECT_SEED.find((seed) => seed.id === project.id), ...project })), [storedProjects])

  const activeProjects = projects.filter((project) => project.status === 'active')
  const totalBudget = activeProjects.reduce((sum, project) => sum + project.budget, 0)
  const completedDesigns = designs.filter((design) => design.status === 'completed')
  const approvedDesigns = completedDesigns.filter((design) => design.saved)
  const approvalRate = completedDesigns.length ? Math.round((approvedDesigns.length / completedDesigns.length) * 100) : 0
  const openTasks = tasks.filter((task) => task.status !== 'completed')
  const pendingDecisions = decisions.filter((decision) => decision.status !== 'approved')
  const atRisk = procurement.filter((item) => item.status === 'delayed').length + tasks.filter((task) => task.status === 'blocked').length

  const phaseBars: BarDatum[] = useMemo(() => PHASES.map((label) => ({
    label,
    value: projects.filter((project) => (project.phase ?? 'Discovery') === label).length,
  })), [projects])

  const procurementDonut: DonutDatum[] = useMemo(() => {
    const colors = ['#b85c38', '#7f9278', '#c69562', '#637381', '#8e6f8a']
    const totals = new Map<string, number>()
    for (const item of procurement) totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount)
    return [...totals.entries()].map(([label, value], index) => ({ label, value, color: colors[index % colors.length] }))
  }, [procurement])

  const workSignals = [
    { label: `${pendingDecisions.length} client decisions waiting`, note: 'Approvals are holding the next design gate', icon: <Users className="w-4 h-4" />, color: '#b85c38', to: '/interior/execution' },
    { label: `${atRisk} delivery risks need action`, note: 'Blocked tasks and delayed procurement', icon: <CircleAlert className="w-4 h-4" />, color: '#d97706', to: '/interior/execution' },
    { label: `${rooms.filter((room) => !room.image).length} rooms need site photos`, note: 'Capture inputs before AI concept generation', icon: <MapPinned className="w-4 h-4" />, color: '#526b80', to: '/interior/projects' },
  ]

  return (
    <div className="interior-page space-y-6">
      <section className="interior-hero">
        <span className="interior-eyebrow"><Compass className="w-3.5 h-3.5" /> Studio command center</span>
        <h1>Design beautiful spaces.<br />Deliver them precisely.</h1>
        <p>One workspace for briefs, room intelligence, AI concepts, client approvals, procurement and site execution.</p>
        <div className="interior-hero-actions">
          <Button onClick={() => navigate('/interior/projects?new=1')}><Plus className="w-4 h-4" /> Start a project</Button>
          <Button variant="outline" className="!border-white/25 !text-white hover:!bg-white/10" onClick={() => navigate('/interior/designs')}><Sparkles className="w-4 h-4" /> Open design studio</Button>
          <Button variant="ghost" className="!text-white/80 hover:!text-white" onClick={() => navigate('/interior/sites')}><MapPinned className="w-4 h-4" /> Plan a site visit</Button>
        </div>
      </section>

      <section className="interior-metrics">
        <button className="interior-metric text-left" style={{ '--metric-color': '#b85c38' } as React.CSSProperties} onClick={() => navigate('/interior/projects')}>
          <p className="interior-metric-label">Live portfolio</p><p className="interior-metric-value">{num(activeProjects.length)}</p><p className="interior-metric-note">{money(totalBudget)} under management</p>
        </button>
        <button className="interior-metric text-left" style={{ '--metric-color': '#7f9278' } as React.CSSProperties} onClick={() => navigate('/interior/designs')}>
          <p className="interior-metric-label">Design approval</p><p className="interior-metric-value">{approvalRate}%</p><p className="interior-metric-note">{approvedDesigns.length} concepts selected</p>
        </button>
        <button className="interior-metric text-left" style={{ '--metric-color': '#526b80' } as React.CSSProperties} onClick={() => navigate('/interior/execution')}>
          <p className="interior-metric-label">Open work</p><p className="interior-metric-value">{num(openTasks.length)}</p><p className="interior-metric-note">Across design and delivery</p>
        </button>
        <button className="interior-metric text-left" style={{ '--metric-color': '#d97706' } as React.CSSProperties} onClick={() => navigate('/interior/execution')}>
          <p className="interior-metric-label">Attention</p><p className="interior-metric-value">{num(atRisk)}</p><p className="interior-metric-note">Blocked or delayed items</p>
        </button>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="interior-section-title"><div><CardTitle>Portfolio pulse</CardTitle><p>Active projects from concept to handover</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/interior/projects')}>View portfolio <ArrowRight className="w-4 h-4" /></Button></CardHeader>
            <CardContent>
              {projects.slice(0, 5).map((project) => (
                <button key={project.id} className="interior-project-row w-full text-left" onClick={() => navigate(`/interior/projects/${project.id}`)}>
                  <div><p className="text-sm font-semibold text-text">{project.name}</p><p className="text-xs text-muted mt-1">{project.clientName ?? project.propertyType} · {project.location}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted">Phase</p><p className="text-xs font-medium mt-1">{project.phase ?? 'Discovery'}</p></div>
                  <div><div className="flex justify-between text-[11px] text-muted mb-1.5"><span>Progress</span><span>{project.progress ?? 0}%</span></div><div className="interior-progress-track"><div className="interior-progress-fill" style={{ width: `${project.progress ?? 0}%` }} /></div></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-muted">Target</p><p className="text-xs font-medium mt-1">{project.targetDate ? fmtDate(project.targetDate) : 'Not set'}</p></div>
                  <ArrowRight className="w-4 h-4 text-muted" />
                </button>
              ))}
            </CardContent>
          </Card>

          <AdvancedPanel title="Delivery pipeline" subtitle="Projects by current design and execution phase" bars={phaseBars} compare={[
            { label: 'Rooms planned', value: num(rooms.length) },
            { label: 'Concepts created', value: num(designs.length) },
            { label: 'Product library', value: num(products.length) },
          ]} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Studio intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {workSignals.map((signal) => (
                <button key={signal.label} className="interior-signal w-full text-left" onClick={() => navigate(signal.to)}>
                  <span className="interior-signal-icon" style={{ '--signal': signal.color } as React.CSSProperties}>{signal.icon}</span>
                  <span><span className="block text-xs font-semibold text-text">{signal.label}</span><span className="block text-[11px] text-muted mt-0.5">{signal.note}</span></span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted" />
                </button>
              ))}
            </CardContent>
          </Card>

          <AdvancedPanel title="Committed spend" subtitle="Procurement value by category" donut={procurementDonut} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Next milestones</CardTitle><CalendarClock className="w-4 h-4 text-primary" /></CardHeader>
            <CardContent className="space-y-3">
              {[...openTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div><p className="text-xs font-medium text-text">{task.title}</p><p className="text-[11px] text-muted mt-1">{projects.find((project) => project.id === task.projectId)?.name} · {task.owner}</p></div>
                  <Badge variant={task.status === 'blocked' ? 'danger' : 'outline'} size="sm">{fmtDate(task.dueDate)}</Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/interior/execution')}><PackageCheck className="w-4 h-4" /> Manage delivery</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
