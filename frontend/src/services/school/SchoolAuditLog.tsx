import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '../../components/ui'
import { History, Trash2, Search } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { AuditLog } from './types'
import { AUDIT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'

export default function SchoolAuditLog() {
  const { items, remove } = useLocalCollection<AuditLog>('school:audit', AUDIT_SEED)
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const actions = useMemo(() => [...new Set(items.map((l) => l.action).filter(Boolean))], [items])

  const filtered = useMemo(
    () => items.filter((l) => (actionFilter === 'all' || l.action === actionFilter) && `${l.user} ${l.entity} ${l.details}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, actionFilter]
  )

  const columns: DataColumn<AuditLog>[] = [
    { key: 'timestamp', header: 'Time', render: (l) => <span className="font-mono text-xs">{l.timestamp}</span>, sortValue: (l) => l.timestamp },
    { key: 'user', header: 'User', render: (l) => <span className="font-medium">{l.user}</span>, sortValue: (l) => l.user },
    { key: 'action', header: 'Action', render: (l) => <span className="font-mono text-xs uppercase text-primary">{l.action}</span>, sortValue: (l) => l.action },
    { key: 'entity', header: 'Entity', render: (l) => l.entity, sortValue: (l) => l.entity },
    { key: 'details', header: 'Details', render: (l) => <span className="text-muted text-sm">{l.details}</span>, hideOnMobile: true },
  ]

  const today = new Date().toISOString().slice(0, 10)
  const todayCount = items.filter((l) => l.timestamp.startsWith(today)).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Log entries" value={items.length} icon={<History className="w-5 h-5" />} tone="info" />
        <KPICard label="Today" value={todayCount} icon={<History className="w-5 h-5" />} tone="success" />
        <KPICard label="Users tracked" value={new Set(items.map((l) => l.user)).size} icon={<History className="w-5 h-5" />} tone="default" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(l) => l.id}
            pageSize={15}
            exportFilename="school-audit"
            emptyIcon={<History className="w-6 h-6" />}
            emptyTitle="No log entries"
            emptyDescription="System actions will be recorded here."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search log..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter} className="w-36">
                  <option value="all">All actions</option>
                  {actions.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </div>
            }
            actions={(l) => (
              <Button variant="ghost" size="icon" onClick={() => remove(l.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}