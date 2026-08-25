import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Background, Controls, MarkerType, MiniMap, ReactFlow, addEdge, useEdgesState, useNodesState,
  type Connection, type Edge, type Node,
} from '@xyflow/react'
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Timeline } from 'vis-timeline/standalone'
import { DataSet } from 'vis-data'
import {
  createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable, type SortingState,
} from '@tanstack/react-table'
import * as echarts from 'echarts'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import useEmblaCarousel from 'embla-carousel-react'
import * as maplibregl from 'maplibre-gl'
import type { Html5Qrcode } from 'html5-qrcode'
import { Lottie } from 'lottie-react'
import {
  ArrowLeft, ArrowRight, CalendarDays, ChevronDown, ChevronsUpDown, Database, GripVertical,
  MapPin, Maximize2, Network, PackageCheck, Play, QrCode,
  Radio, Route, ScanLine, Search, ShieldCheck, Sparkles, Workflow,
} from 'lucide-react'
import { Button } from '../../platform/ui'
import successAnimation from '../../animations/success-check.json'
import type { OperationsConfig } from './config'
import type { WorkItem } from './types'
import '@xyflow/react/dist/style.css'
import 'vis-timeline/styles/vis-timeline-graph2d.min.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import './visual-workflow.css'

type WorkspaceTab = 'command' | 'board' | 'plan' | 'dispatch' | 'data'
type Lane = 'Queued' | 'In progress' | 'Review' | 'Done'
type WorkflowTask = WorkItem & { lane: Lane; priority: 'Critical' | 'High' | 'Normal' }

const TABS: Array<{ id: WorkspaceTab; label: string; icon: typeof Workflow }> = [
  { id: 'command', label: 'Command', icon: Network },
  { id: 'board', label: 'Flow board', icon: Workflow },
  { id: 'plan', label: 'Plan', icon: CalendarDays },
  { id: 'dispatch', label: 'Dispatch', icon: Radio },
  { id: 'data', label: 'Data', icon: Database },
]

const LANES: Lane[] = ['Queued', 'In progress', 'Review', 'Done']

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function futureDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function workflowTasks(config: OperationsConfig): WorkflowTask[] {
  return config.seeds.flatMap((item, index) => {
    const base: WorkflowTask = {
      id: `${config.id}-flow-${index + 1}`,
      ...item,
      dueDate: futureDate(index * 3 + 2),
      createdAt: new Date().toISOString(),
      lane: (['In progress', 'Review', 'Queued'] as Lane[])[index % 3],
      priority: (['Critical', 'High', 'Normal'] as WorkflowTask['priority'][])[index % 3],
    }
    return [base, {
      ...base,
      id: `${base.id}-check`,
      title: `${titleCase(config.checkpointLabels[index % config.checkpointLabels.length])}`,
      lane: (['Review', 'Queued', 'In progress'] as Lane[])[index % 3],
      progress: Math.max(12, item.progress - 16),
      value: Math.round(item.value * .12),
      priority: index === 1 ? 'Critical' : 'Normal',
    }]
  })
}

function initialNodes(config: OperationsConfig): Node[] {
  return [
    { id: 'intake', position: { x: 0, y: 95 }, data: { label: `New ${config.item}` }, className: 'vw-node is-intake' },
    { id: 'validate', position: { x: 220, y: 10 }, data: { label: config.checkpointLabels[0] }, className: 'vw-node' },
    { id: 'coordinate', position: { x: 220, y: 180 }, data: { label: titleCase(config.meetingLabel) }, className: 'vw-node' },
    { id: 'execute', position: { x: 470, y: 95 }, data: { label: `Execute ${config.item}` }, className: 'vw-node is-active' },
    { id: 'quality', position: { x: 700, y: 10 }, data: { label: config.checkpointLabels[1] }, className: 'vw-node' },
    { id: 'close', position: { x: 700, y: 180 }, data: { label: config.checkpointLabels[2] }, className: 'vw-node is-complete' },
  ]
}

const initialEdges: Edge[] = [
  ['intake', 'validate'], ['intake', 'coordinate'], ['validate', 'execute'], ['coordinate', 'execute'],
  ['execute', 'quality'], ['execute', 'close'],
].map(([source, target], index) => ({
  id: `edge-${index}`, source, target, animated: target === 'execute', markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
}))

export default function VisualWorkflowWorkspace({ config }: { config: OperationsConfig }) {
  const [tab, setTab] = useState<WorkspaceTab>('command')
  const taskStorageKey = `${config.id}:visual-workflow-tasks`
  const [tasks, setTasks] = useState<WorkflowTask[]>(() => {
    try {
      const stored = localStorage.getItem(taskStorageKey)
      return stored ? JSON.parse(stored) as WorkflowTask[] : workflowTasks(config)
    } catch { return workflowTasks(config) }
  })
  const [lastSync, setLastSync] = useState('Live now')

  useEffect(() => localStorage.setItem(taskStorageKey, JSON.stringify(tasks)), [taskStorageKey, tasks])

  const runWorkflow = () => {
    setTasks((current) => current.map((task, index) => index === 0
      ? { ...task, lane: task.lane === 'Done' ? 'Queued' : 'Done', progress: task.lane === 'Done' ? 24 : 100 }
      : task))
    setLastSync('Synced just now')
  }

  return <div className="visual-workflow">
    <motion.header className="vw-hero" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
      <div className="vw-hero-copy">
        <span className="vw-kicker"><Sparkles size={14} /> {config.title} / visual workflow</span>
        <h1>See the work.<br /><em>Move it forward.</em></h1>
        <p>One live operating picture for every {config.item}, handoff, schedule and {config.mapPointLabel}.</p>
      </div>
      <div className="vw-hero-status">
        <span><i /> Operational</span>
        <small>{lastSync}</small>
        <Button onClick={runWorkflow}><Play size={15} fill="currentColor" /> Run workflow</Button>
      </div>
      <div className="vw-orbit" aria-hidden="true"><span /><span /><span /></div>
    </motion.header>

    <nav className="vw-tabs" aria-label="Visual workflow views">
      {TABS.map(({ id, label, icon: Icon }) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}><Icon size={16} /> {label}</button>)}
    </nav>

    <AnimatePresence mode="wait">
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .2 }}>
        {tab === 'command' && <CommandView config={config} tasks={tasks} />}
        {tab === 'board' && <BoardView config={config} tasks={tasks} setTasks={setTasks} />}
        {tab === 'plan' && <PlanView config={config} tasks={tasks} />}
        {tab === 'dispatch' && <DispatchView config={config} tasks={tasks} />}
        {tab === 'data' && <DataView config={config} tasks={tasks} />}
      </motion.div>
    </AnimatePresence>
  </div>
}

function SectionHead({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="vw-section-head"><div><span>{eyebrow}</span><h2>{title}</h2><p>{detail}</p></div>{action}</div>
}

function CommandView({ config, tasks }: { config: OperationsConfig; tasks: WorkflowTask[] }) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes(config))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const active = tasks.filter((task) => task.lane !== 'Done').length
  const progress = Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
  const risk = tasks.filter((task) => task.priority === 'Critical').length
  const onConnect = (connection: Connection) => setEdges((current) => addEdge({ ...connection, animated: true }, current))

  return <div className="vw-view-stack">
    <section className="vw-kpis" aria-label="Operations KPIs">
      <Kpi label={`Active ${config.items}`} value={String(active)} progress={Math.min(100, active * 12)} note="Across all workflow stages" />
      <Kpi label="Flow completion" value={`${progress}%`} progress={progress} note="+8.4% against last cycle" />
      <Kpi label="Critical signals" value={String(risk)} progress={risk * 25} note="Requires owner attention" tone="risk" />
      <Kpi label="Automation health" value="99.8%" progress={99.8} note="All rules operational" />
    </section>

    <div className="vw-command-grid">
      <section className="vw-panel vw-flow-panel">
        <SectionHead eyebrow="Live orchestration" title={`${titleCase(config.item)} delivery graph`} detail="Drag stages, connect handoffs and inspect the operating path." action={<span className="vw-live-pill"><i /> Live graph</span>} />
        <div className="vw-react-flow">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView minZoom={.5} maxZoom={1.6}>
            <Background gap={18} size={1} />
            <Controls showInteractive={false} />
            <MiniMap zoomable pannable nodeColor={(node) => node.className?.includes('is-complete') ? '#10b981' : node.className?.includes('is-active') ? '#4f86f7' : '#64748b'} />
          </ReactFlow>
        </div>
      </section>
      <section className="vw-panel vw-chart-panel">
        <SectionHead eyebrow="Throughput" title="Operational velocity" detail="Completions and exceptions over the last seven days." />
        <VelocityChart tasks={tasks} />
      </section>
    </div>
    <BriefCarousel config={config} tasks={tasks} />
  </div>
}

function Kpi({ label, value, progress, note, tone }: { label: string; value: string; progress: number; note: string; tone?: 'risk' }) {
  const boundedProgress = Math.max(0, Math.min(100, progress))
  return <article className={`vw-kpi${tone ? ` is-${tone}` : ''}`}>
    <p className="vw-kpi-label">{label}</p>
    <p className="vw-kpi-value">{value}</p>
    <div className="vw-kpi-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(boundedProgress)}>
      <span style={{ width: `${boundedProgress}%` }} />
    </div>
    <p className="vw-kpi-note">{note}</p>
  </article>
}

function VelocityChart({ tasks }: { tasks: WorkflowTask[] }) {
  const node = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!node.current) return
    const chart = echarts.init(node.current)
    const completed = tasks.filter((task) => task.lane === 'Done').length
    chart.setOption({
      animationDuration: 700,
      color: ['#4f86f7', '#f59e0b'],
      grid: { left: 8, right: 10, top: 24, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis', backgroundColor: '#111827', borderWidth: 0, textStyle: { color: '#f8fafc', fontSize: 11 } },
      legend: { top: 0, right: 0, textStyle: { color: '#8b95a7', fontSize: 10 } },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#8b95a7', fontSize: 10 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(148,163,184,.12)' } }, axisLabel: { color: '#8b95a7', fontSize: 10 } },
      series: [
        { name: 'Completed', type: 'bar', barWidth: 9, data: [4, 6, 5, 8, 7, 10, 8 + completed], itemStyle: { borderRadius: [5, 5, 0, 0] } },
        { name: 'Exceptions', type: 'line', smooth: true, symbolSize: 6, data: [3, 2, 4, 2, 3, 1, Math.max(1, tasks.filter((task) => task.priority === 'Critical').length)] },
      ],
    })
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(node.current)
    return () => { observer.disconnect(); chart.dispose() }
  }, [tasks])
  return <div ref={node} className="vw-echart" role="img" aria-label="Seven day operational velocity chart" />
}

function BriefCarousel({ config, tasks }: { config: OperationsConfig; tasks: WorkflowTask[] }) {
  const [viewport, embla] = useEmblaCarousel({ loop: true, align: 'start' })
  const slides = [
    { eyebrow: 'Priority signal', title: tasks.find((task) => task.priority === 'Critical')?.title ?? config.seeds[0].title, detail: `Critical ${config.item} needs an owner decision before the next handoff.`, icon: ShieldCheck },
    { eyebrow: 'Field brief', title: `Next ${config.visit}`, detail: `${config.seeds[0].location} is ready for arrival and checkpoint validation.`, icon: MapPin },
    { eyebrow: 'Automation', title: 'Approval rule ready', detail: `Completed ${config.checkpoint}s will notify the ${config.people} automatically.`, icon: Sparkles },
  ]
  return <section className="vw-briefs">
    <div className="vw-brief-title"><span>Shift briefs</span><div><button aria-label="Previous brief" onClick={() => embla?.scrollPrev()}><ArrowLeft /></button><button aria-label="Next brief" onClick={() => embla?.scrollNext()}><ArrowRight /></button></div></div>
    <div className="vw-embla" ref={viewport}><div className="vw-embla-track">{slides.map(({ eyebrow, title, detail, icon: Icon }) => <article key={title}><span><Icon /></span><div><small>{eyebrow}</small><h3>{title}</h3><p>{detail}</p></div><ArrowRight className="vw-brief-arrow" /></article>)}</div></div>
  </section>
}

function BoardView({ config, tasks, setTasks }: { config: OperationsConfig; tasks: WorkflowTask[]; setTasks: React.Dispatch<React.SetStateAction<WorkflowTask[]>> }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return
    const overTask = tasks.find((task) => task.id === over.id)
    const lane = LANES.includes(over.id as Lane) ? over.id as Lane : overTask?.lane
    if (!lane) return
    setTasks((current) => {
      const from = current.findIndex((task) => task.id === active.id)
      const to = current.findIndex((task) => task.id === over.id)
      const moved = current.map((task) => task.id === active.id ? { ...task, lane, progress: lane === 'Done' ? 100 : task.progress } : task)
      return from >= 0 && to >= 0 && from !== to ? arrayMove(moved, from, to) : moved
    })
  }
  return <div className="vw-view-stack">
    <SectionHead eyebrow="Drag to orchestrate" title={`${titleCase(config.item)} flow board`} detail={`Move work across the delivery system. Every card stays tied to its ${config.customer}, owner and ${config.location}.`} action={<span className="vw-hint"><GripVertical size={14} /> Drag cards between lanes</span>} />
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="vw-board">{LANES.map((lane) => <BoardLane key={lane} lane={lane} tasks={tasks.filter((task) => task.lane === lane)} />)}</div>
    </DndContext>
  </div>
}

function BoardLane({ lane, tasks }: { lane: Lane; tasks: WorkflowTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: lane })
  return <section ref={setNodeRef} className={`vw-lane${isOver ? ' is-over' : ''}`}>
    <header><span><i className={`is-${lane.toLowerCase().replace(' ', '-')}`} />{lane}</span><b>{tasks.length}</b></header>
    <SortableContext items={tasks.map((task) => task.id)} strategy={rectSortingStrategy}>
      <div className="vw-lane-list">{tasks.map((task) => <TaskCard key={task.id} task={task} />)}{!tasks.length && <div className="vw-lane-empty">Drop work here</div>}</div>
    </SortableContext>
  </section>
}

function TaskCard({ task }: { task: WorkflowTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return <article ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`vw-task${isDragging ? ' is-dragging' : ''}`} {...attributes} {...listeners}>
    <div className="vw-task-top"><span className={`vw-priority is-${task.priority.toLowerCase()}`}>{task.priority}</span><GripVertical size={15} /></div>
    <h3>{task.title}</h3><p>{task.customer}</p>
    <div className="vw-task-progress"><span style={{ width: `${task.progress}%` }} /></div>
    <footer><span>{task.owner.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><small>{task.progress}% · {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small></footer>
  </article>
}

function PlanView({ config, tasks }: { config: OperationsConfig; tasks: WorkflowTask[] }) {
  const [events, setEvents] = useState(() => tasks.map((task, index) => ({ id: task.id, title: task.title, start: task.dueDate, color: index % 2 ? '#0f8f83' : '#4f86f7' })))
  return <div className="vw-view-stack">
    <SectionHead eyebrow="Time orchestration" title={titleCase(config.timelineLabel)} detail={`Align ${config.items}, ${config.visit}s and checkpoint dependencies without losing the sequence.`} />
    <div className="vw-plan-grid">
      <section className="vw-panel vw-calendar-panel"><div className="vw-panel-label"><CalendarDays /> Shared schedule <small>Click a day to add a coordination block</small></div><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" height="auto" headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }} events={events} dateClick={(event: DateClickArg) => setEvents((current) => [...current, { id: `event-${Date.now()}`, title: titleCase(config.meetingLabel), start: event.date.toISOString().slice(0, 10), color: '#f59e0b' }])} dayMaxEvents={2} /></section>
      <section className="vw-panel vw-timeline-panel"><div className="vw-panel-label"><Route /> Dependency timeline <small>Zoom and pan across the active delivery window</small></div><OperationsTimeline config={config} tasks={tasks} /></section>
    </div>
  </div>
}

function OperationsTimeline({ config, tasks }: { config: OperationsConfig; tasks: WorkflowTask[] }) {
  const node = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!node.current) return
    const items = new DataSet(tasks.map((task, index) => ({ id: task.id, content: task.title, start: task.dueDate, end: futureDate(index * 3 + 5), className: task.priority === 'Critical' ? 'is-critical' : '' })))
    const timeline = new Timeline(node.current, items, {
      stack: true, horizontalScroll: true, zoomKey: 'ctrlKey', margin: { item: 12 },
      tooltip: { followMouse: true }, orientation: { axis: 'top' }, showCurrentTime: true,
    })
    return () => timeline.destroy()
  }, [config.id, tasks])
  return <div ref={node} className="vw-timeline" />
}

function DispatchView({ config, tasks }: { config: OperationsConfig; tasks: WorkflowTask[] }) {
  const [selected, setSelected] = useState(tasks[0]?.id ?? '')
  return <div className="vw-view-stack">
    <SectionHead eyebrow="Field execution" title={`${titleCase(config.mapNetworkLabel)} control`} detail={`Track active ${config.mapPointLabel}s and scan a field code to verify the next workflow checkpoint.`} />
    <div className="vw-dispatch-grid">
      <section className="vw-panel vw-tracking-panel"><TrackingMap config={config} tasks={tasks} selected={selected} onSelect={setSelected} /></section>
      <ScannerPanel config={config} selected={tasks.find((task) => task.id === selected) ?? tasks[0]} />
    </div>
  </div>
}

function TrackingMap({ config, tasks, selected, onSelect }: { config: OperationsConfig; tasks: WorkflowTask[]; selected: string; onSelect: (id: string) => void }) {
  const node = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  useEffect(() => {
    if (!node.current) return
    const located = tasks.filter((task) => task.lat && task.lng)
    const first = located[0]
    const map = new maplibregl.Map({
      container: node.current,
      center: first ? [first.lng, first.lat] : [78.9629, 20.5937], zoom: first ? 4.7 : 3.5,
      style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '&copy; OpenStreetMap contributors' } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] },
    })
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    located.forEach((task) => {
      const markerNode = document.createElement('button')
      markerNode.className = `vw-map-marker${task.id === selected ? ' is-selected' : ''}`
      markerNode.type = 'button'
      markerNode.setAttribute('aria-label', task.title)
      markerNode.addEventListener('click', () => onSelect(task.id))
      new maplibregl.Marker({ element: markerNode }).setLngLat([task.lng, task.lat]).setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(`<strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.location)} · ${task.progress}%</small>`)).addTo(map)
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [config.id, onSelect, selected, tasks])
  const chosen = tasks.find((task) => task.id === selected)
  return <><div className="vw-map-head"><div><span><i /> {tasks.filter((task) => task.lat && task.lng).length} signals online</span><h3>Live {config.mapPointLabel} telemetry</h3></div><Maximize2 /></div><div ref={node} className="vw-map" />{chosen && <div className="vw-map-selected"><span><MapPin /> Selected</span><strong>{chosen.title}</strong><small>{chosen.location} · {chosen.owner}</small></div>}</>
}

function ScannerPanel({ config, selected }: { config: OperationsConfig; selected?: WorkflowTask }) {
  const scanner = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const readerId = `workflow-reader-${config.id}`

  const stop = async () => {
    const active = scanner.current
    scanner.current = null
    if (active?.isScanning) await active.stop().catch(() => undefined)
    active?.clear()
    setScanning(false)
  }

  const success = async (value: string) => {
    setResult(value)
    setError('')
    await stop()
  }

  const start = async () => {
    setResult(''); setError(''); setScanning(true)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const instance = new Html5Qrcode(readerId, { verbose: false, useBarCodeDetectorIfSupported: true })
      scanner.current = instance
      await instance.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 160 } }, (value) => void success(value), () => undefined)
    } catch {
      setError('Camera access is unavailable. Upload a QR image instead.')
      await stop()
    }
  }

  const scanFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setResult(''); setError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const instance = new Html5Qrcode(readerId, false)
      scanner.current = instance
      await success(await instance.scanFile(file, true))
    } catch { setError('No readable QR or barcode was found in that image.') }
    event.target.value = ''
  }

  useEffect(() => () => { const active = scanner.current; if (active?.isScanning) void active.stop(); active?.clear() }, [])

  return <section className="vw-panel vw-scanner-panel">
    <div className="vw-scanner-icon"><ScanLine /></div><span className="vw-scanner-kicker">Checkpoint verification</span><h3>Scan field proof</h3><p>Attach a QR or barcode verification directly to <strong>{selected?.title ?? `this ${config.item}`}</strong>.</p>
    <div id={readerId} className={`vw-reader${scanning ? ' is-active' : ''}`} />
    {result ? <motion.div className="vw-scan-success" initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Lottie src={successAnimation} loop={false} /><div><strong>Checkpoint verified</strong><small>{result}</small></div></motion.div> : <div className="vw-scan-placeholder"><QrCode /><span>Field code ready to scan</span></div>}
    {error && <p className="vw-scan-error" role="alert">{error}</p>}
    <div className="vw-scan-actions"><Button onClick={() => scanning ? void stop() : void start()} variant={scanning ? 'outline' : 'default'}><ScanLine /> {scanning ? 'Stop camera' : 'Open scanner'}</Button><label><PackageCheck /> Scan image<input type="file" accept="image/*" onChange={(event) => void scanFile(event)} /></label></div>
    <small className="vw-camera-note">Camera scanning runs locally in your browser. No image is uploaded.</small>
  </section>
}

function DataView({ config, tasks }: { config: OperationsConfig; tasks: WorkflowTask[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'progress', desc: true }])
  const [filter, setFilter] = useState('')
  const column = createColumnHelper<WorkflowTask>()
  const table = useReactTable({
    data: tasks,
    columns: [
      column.accessor('title', { header: titleCase(config.item), cell: (info) => <div className="vw-table-title"><span>{info.getValue().slice(0, 2).toUpperCase()}</span><div><strong>{info.getValue()}</strong><small>{info.row.original.customer}</small></div></div> }),
      column.accessor('lane', { header: 'Stage', cell: (info) => <span className={`vw-stage is-${info.getValue().toLowerCase().replace(' ', '-')}`}><i />{info.getValue()}</span> }),
      column.accessor('owner', { header: 'Owner' }),
      column.accessor('location', { header: titleCase(config.location) }),
      column.accessor('priority', { header: 'Priority', cell: (info) => <span className={`vw-priority is-${info.getValue().toLowerCase()}`}>{info.getValue()}</span> }),
      column.accessor('progress', { header: 'Progress', cell: (info) => <div className="vw-table-progress"><span><i style={{ width: `${info.getValue()}%` }} /></span><b>{info.getValue()}%</b></div> }),
      column.accessor('dueDate', { header: 'Due', cell: (info) => new Date(`${info.getValue()}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) }),
    ],
    state: { sorting, globalFilter: filter }, onSortingChange: setSorting, onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })
  return <div className="vw-view-stack">
    <SectionHead eyebrow="Operational records" title={`${titleCase(config.item)} control table`} detail="Filter, sort and inspect the full workflow dataset behind every visual view." />
    <section className="vw-panel vw-data-panel">
      <div className="vw-table-tools"><label><Search /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder={`Search ${config.items}, owners or locations`} /></label><span>{table.getFilteredRowModel().rows.length} records</span></div>
      <div className="vw-table-scroll"><table><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}><button onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() === 'asc' ? <ChevronDown className="is-up" /> : header.column.getIsSorted() === 'desc' ? <ChevronDown /> : <ChevronsUpDown />}</button></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div>
      <footer className="vw-table-footer"><span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span><div><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button></div></footer>
    </section>
  </div>
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character)
}
