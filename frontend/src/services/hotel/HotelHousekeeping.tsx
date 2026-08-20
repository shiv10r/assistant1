import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Badge, Card, CardContent, PageHead, Select } from '../../components/ui'
import { useLocalCollection } from '../../lib/localStore'
import { HOUSEKEEPING_SEED } from './seed'
import type { HousekeepingStatus, HousekeepingTask } from './types'
import HotelShell from './HotelShell'

const STATUS_LABEL = {
  pending: 'Pending',
  'in-progress': 'In progress',
  inspection: 'Inspection',
  completed: 'Completed',
} as const

const STATUS_TONE = {
  pending: 'warning',
  'in-progress': 'info',
  inspection: 'default',
  completed: 'success',
} as const

function housekeepingStatusFromValue(value: string): HousekeepingStatus {
  switch (value) {
    case 'pending': return 'pending'
    case 'in-progress': return 'in-progress'
    case 'inspection': return 'inspection'
    case 'completed': return 'completed'
    default: return 'pending'
  }
}

export default function HotelHousekeeping() {
  const { items, update } = useLocalCollection<HousekeepingTask>('hotel:housekeeping', [...HOUSEKEEPING_SEED])
  const [filter, setFilter] = useState<HousekeepingStatus | 'all'>('all')
  const tasks = useMemo(() => items.filter((task) => filter === 'all' || task.status === filter), [filter, items])

return (
    <HotelShell>
      <div className="hotel-main">
        <PageHead icon={<Sparkles className="h-6 w-6" />} title="Housekeeping" sub="Assign and track room cleaning through inspection." right={<Select value={filter} onChange={(event) => setFilter(event.target.value === 'all' ? 'all' : housekeepingStatusFromValue(event.target.value))} className="w-44"><option value="all">All tasks</option>{Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(housekeepingStatusFromValue(value))} className="rounded-lg border border-border bg-surface px-4 py-3 text-left hover:border-primary/50">
              <span className="block text-xl font-bold text-text">{items.filter((task) => task.status === value).length}</span><span className="text-xs text-muted">{label}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id}><CardContent className="pt-5">
              <div className="mb-5 flex items-start gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="font-semibold text-text">Room {task.roomNumber}</h2><Badge variant={task.priority === 'high' ? 'danger' : 'outline'} size="sm">{task.priority}</Badge></div><p className="text-sm text-muted">{task.task}</p></div></div>
              <dl className="mb-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-sm"><div><dt className="text-xs text-muted">Assigned to</dt><dd className="font-medium text-text">{task.assignee}</dd></div><div><dt className="text-xs text-muted">Scheduled</dt><dd className="font-medium text-text">{task.scheduled}</dd></div></dl>
              <label className="text-xs font-medium text-muted" htmlFor={`task-${task.id}`}>Task status</label>
              <Select id={`task-${task.id}`} value={task.status} onChange={(event) => update(task.id, { status: housekeepingStatusFromValue(event.target.value) })} className="mt-2">{Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
              <div className="mt-3"><Badge variant={STATUS_TONE[task.status]} size="sm">{STATUS_LABEL[task.status]}</Badge></div>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </HotelShell>
  )
}
