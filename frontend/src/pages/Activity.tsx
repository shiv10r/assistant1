import { useEffect, useState, useMemo } from 'react'
import { api } from '../api'
import type { ActivityItem } from '../api'
import { Card, CardContent, Badge, cn } from '../components/ui'
import {
  TrendingUp,
  Clock,
  Filter,
  Loader2,
  MoreHorizontal,
  Users,
  DollarSign,
  Briefcase,
  MessageSquare,
  Activity as ActivityIcon,
} from 'lucide-react'

type FilterType = 'all' | 'billing' | 'projects' | 'assistant'

export default function Activity() {
  const [items, setItems] = useState<ActivityItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')

  useEffect(() => {
    setLoading(true)
    api.activity(500).then((data) => {
      setItems(data)
      setLoading(false)
    }).catch(() => {
      setItems([])
      setLoading(false)
    })
  }, [])

  const filteredItems = useMemo(() => {
    if (!items) return []
    let result = items

    // Date filter
    const now = new Date()
    const cutoff = new Date()
    if (dateRange === 'today') cutoff.setHours(0, 0, 0, 0)
    else if (dateRange === 'week') cutoff.setDate(now.getDate() - 7)
    else if (dateRange === 'month') cutoff.setDate(1)
    if (dateRange !== 'all') {
      result = result.filter(a => new Date(a.timestamp).getTime() >= cutoff.getTime())
    }

    // Type filter
    if (filter === 'billing') {
      result = result.filter(a =>
        ['Expense logged', 'Expense removed', 'Party added', 'Party updated', 'Item added', 'Item updated', 'Transaction saved', 'Cash adjusted', 'Bank account added', 'Bank account updated'].includes(a.action)
      )
    } else if (filter === 'projects') {
      result = result.filter(a =>
        ['Project created', 'Project updated', 'Task created', 'Task updated', 'Project payment', 'Attendance set', 'Material saved', 'Site log saved', 'Meeting saved', 'Design saved'].includes(a.action)
      )
    } else if (filter === 'assistant') {
      result = result.filter(a => a.source === 'assistant')
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.action.toLowerCase().includes(q) ||
        a.detail.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      )
    }

    return result
  }, [items, filter, search, dateRange])

  const stats = useMemo(() => {
    if (!items) return { total: 0, billing: 0, projects: 0, assistant: 0, today: 0 }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return {
      total: items.length,
      billing: items.filter(a => ['Expense logged', 'Expense removed', 'Party added', 'Party updated', 'Item added', 'Item updated', 'Transaction saved', 'Cash adjusted', 'Bank account added', 'Bank account updated'].includes(a.action)).length,
      projects: items.filter(a => ['Project created', 'Project updated', 'Task created', 'Task updated', 'Project payment', 'Attendance set', 'Material saved', 'Site log saved', 'Meeting saved', 'Design saved'].includes(a.action)).length,
      assistant: items.filter(a => a.source === 'assistant').length,
      today: items.filter(a => new Date(a.timestamp).getTime() >= today.getTime()).length,
    }
  }, [items])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

const getActionIcon = (action: string) => {
  if (action.includes('Expense')) return <TrendingUp className="w-4 h-4 text-emerald-500" />
  if (action.includes('Party') || action.includes('Item')) return <Users className="w-4 h-4 text-indigo-500" />
  if (action.includes('Transaction') || action.includes('Cash') || action.includes('Bank')) return <DollarSign className="w-4 h-4 text-amber-500" />
  if (action.includes('Project') || action.includes('Task') || action.includes('Material') || action.includes('Site') || action.includes('Meeting') || action.includes('Design')) return <Briefcase className="w-4 h-4 text-cyan-500" />
  return <ActivityIcon className="w-4 h-4 text-muted" />
}

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Activity</h1>
          <div className="muted">Audit trail of all changes across your account</div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Actions" value={stats.total} icon={<ActivityIcon className="w-5 h-5" />} trend="+12%" trendUp />
        <StatCard label="Billing" value={stats.billing} icon={<DollarSign className="w-5 h-5" />} color="amber" />
        <StatCard label="Projects" value={stats.projects} icon={<Briefcase className="w-5 h-5" />} color="cyan" />
        <StatCard label="Assistant" value={stats.assistant} icon={<MessageSquare className="w-5 h-5" />} color="indigo" />
        <StatCard label="Today" value={stats.today} icon={<Clock className="w-5 h-5" />} color="emerald" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-surface/50 rounded-xl border border-border">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'billing', 'projects', 'assistant'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-surface hover:text-text'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ActivityIcon className="w-12 h-12 text-muted mb-4" />
              <h3 className="text-lg font-medium text-text mb-1">No activity found</h3>
              <p className="text-muted">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredItems.map((a) => (
                <div key={a.id} className="flex items-start gap-4 p-4 hover:bg-surface/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center">
                    {getActionIcon(a.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-text">{a.action}</span>
                      <span className="text-xs text-muted whitespace-nowrap">{a.timeLabel}</span>
                    </div>
                    <p className="text-sm text-muted mt-0.5 truncate">{a.detail || '—'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" size="sm">{a.source}</Badge>
                    </div>
                  </div>
                  <button className="flex-shrink-0 p-1 text-muted hover:text-text" aria-label="More options">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function StatCard({ label, value, icon, color = 'indigo', trend, trendUp }: {
  label: string; value: number; icon: React.ReactNode; color?: string; trend?: string; trendUp?: boolean
}) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-500',
    amber: 'bg-amber-500/10 text-amber-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold text-text mt-1">{value}</p>
            {trend && (
              <span className={cn('text-xs font-medium mt-1 inline-flex items-center gap-1', trendUp ? 'text-emerald-500' : 'text-red-500')}>
                <TrendingUp className="w-3 h-3" /> {trend}
              </span>
            )}
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color as keyof typeof colors] || colors.indigo)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}