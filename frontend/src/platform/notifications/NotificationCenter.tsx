import { useMemo, useState } from 'react'
import { Bell, CheckCheck, Search, Star } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import { DataTable, type DataColumn } from '../tables'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, KPICard, StatusBadge } from '../ui'

type NotificationItem = {
  id: string
  title: string
  body: string
  type: 'info' | 'warning' | 'success' | 'alert'
  audience: string
  important: boolean
  read: boolean
  date: string
}

type NotificationCenterProps = {
  moduleKey: string
  moduleName: string
}

export function NotificationCenter({ moduleKey, moduleName }: NotificationCenterProps) {
  const seed = useMemo<NotificationItem[]>(() => [{
    id: `${moduleKey}-welcome`,
    title: `${moduleName} notifications are ready`,
    body: `Operational updates for ${moduleName} will appear here.`,
    type: 'info',
    audience: 'all',
    important: false,
    read: false,
    date: new Date().toISOString().slice(0, 10),
  }], [moduleKey, moduleName])
  const { items, update } = useLocalCollection<NotificationItem>(`${moduleKey}:notifications`, seed)
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => items.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  )
  const unread = items.filter((item) => !item.read).length
  const important = items.filter((item) => item.important).length

  const columns: DataColumn<NotificationItem>[] = [
    {
      key: 'title',
      header: 'Notification',
      render: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className={!item.read ? 'font-semibold text-primary' : 'font-medium'}>{item.title}</span>
            {item.important && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
          </div>
          <p className="mt-1 text-xs text-muted">{item.body}</p>
        </div>
      ),
      sortValue: (item) => item.title,
    },
    { key: 'type', header: 'Type', render: (item) => <StatusBadge status={item.type} />, sortValue: (item) => item.type },
    { key: 'date', header: 'Date', render: (item) => item.date, sortValue: (item) => item.date },
    { key: 'read', header: 'Status', render: (item) => item.read ? 'Read' : 'Unread' },
  ]

  function markAllRead() {
    items.filter((item) => !item.read).forEach((item) => update(item.id, { read: true }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard label="Notifications" value={items.length} icon={<Bell className="h-5 w-5" />} tone="info" />
        <KPICard label="Unread" value={unread} icon={<Bell className="h-5 w-5" />} tone="warning" />
        <KPICard label="Important" value={important} icon={<Star className="h-5 w-5" />} tone="danger" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{moduleName} notifications</CardTitle>
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(item) => item.id}
            pageSize={10}
            exportFilename={`${moduleKey}-notifications`}
            emptyIcon={<Bell className="h-6 w-6" />}
            emptyTitle="No notifications"
            emptyDescription={`There are no ${moduleName} notifications to review.`}
            toolbar={(
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input className="pl-9" placeholder="Search notifications..." value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
            )}
            actions={(item) => !item.read ? (
              <Button variant="ghost" size="sm" onClick={() => update(item.id, { read: true })}>Mark read</Button>
            ) : null}
          />
        </CardContent>
      </Card>
    </div>
  )
}
