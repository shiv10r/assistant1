import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Input, Select, Button } from '../../components/ui'
import { CalendarCheck, Search, Trash2 } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { AttendanceRecord } from './types'
import { ATTENDANCE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../components/AdvancedPanel'

export default function SchoolAttendanceAnalytics() {
  const { items: records, remove } = useLocalCollection<AttendanceRecord>('school:attendance', ATTENDANCE_SEED)
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const classes = useMemo(() => [...new Set(records.map((r) => r.className).filter(Boolean))], [records])

  const filtered = useMemo(
    () => records.filter((r) =>
      (classFilter === 'all' || r.className === classFilter) &&
      (statusFilter === 'all' || r.status === statusFilter) &&
      `${r.studentName} ${r.className}`.toLowerCase().includes(query.toLowerCase())
    ),
    [records, query, classFilter, statusFilter]
  )

  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const late = records.filter((r) => r.status === 'late').length
  const rate = records.length ? Math.round(((present + late) / records.length) * 100) : 0

  const bars: BarDatum[] = useMemo(() => classes.map((c) => {
    const inClass = records.filter((r) => r.className === c)
    const attended = inClass.filter((r) => r.status !== 'absent').length
    return { label: c, value: inClass.length ? Math.round((attended / inClass.length) * 100) : 0, valueLabel: `${inClass.length ? Math.round((attended / inClass.length) * 100) : 0}%` }
  }), [classes, records])

  const donut: DonutDatum[] = [
    { label: 'Present', value: present, color: '#10b981' },
    { label: 'Late', value: late, color: '#f59e0b' },
    { label: 'Absent', value: absent, color: '#ef4444' },
  ]

  const perStudent = useMemo(() => {
    const map = new Map<string, { name: string; present: number; absent: number; late: number; total: number }>()
    for (const r of records) {
      const s = map.get(r.studentName) ?? { name: r.studentName, present: 0, absent: 0, late: 0, total: 0 }
      s.total += 1
      if (r.status === 'present') s.present += 1
      else if (r.status === 'absent') s.absent += 1
      else s.late += 1
      map.set(r.studentName, s)
    }
    return [...map.values()]
  }, [records])

  const columns: DataColumn<AttendanceRecord>[] = [
    { key: 'studentName', header: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span>, sortValue: (r) => r.studentName },
    { key: 'className', header: 'Class', render: (r) => r.className, sortValue: (r) => r.className },
    { key: 'date', header: 'Date', render: (r) => r.date.slice(0, 10), sortValue: (r) => r.date },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  ]

  const summaryColumns: DataColumn<{ name: string; present: number; absent: number; late: number; total: number }>[] = [
    { key: 'name', header: 'Student', render: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'present', header: 'Present', render: (s) => s.present },
    { key: 'late', header: 'Late', render: (s) => s.late },
    { key: 'absent', header: 'Absent', render: (s) => s.absent },
    { key: 'total', header: 'Total', render: (s) => s.total },
    { key: 'rate', header: 'Rate', render: (s) => {
      const pct = s.total ? Math.round(((s.present + s.late) / s.total) * 100) : 0
      return <span className={pct >= 75 ? 'text-emerald-600 font-semibold' : pct >= 50 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>{pct}%</span>
    }, sortValue: (s) => (s.total ? (s.present + s.late) / s.total : 0) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Records" value={records.length} icon={<CalendarCheck className="w-5 h-5" />} tone="info" />
        <KpiCard label="Attendance rate" value={`${rate}%`} icon={<CalendarCheck className="w-5 h-5" />} tone="success" />
        <KpiCard label="Absent" value={absent} icon={<CalendarCheck className="w-5 h-5" />} tone="danger" />
        <KpiCard label="Late" value={late} icon={<CalendarCheck className="w-5 h-5" />} tone="warning" />
      </div>

      <AdvancedPanel
        title="Attendance insights"
        subtitle="Class-wise attendance rate and overall status split"
        bars={bars}
        donut={donut}
        compare={[
          { label: 'Best class', value: classes.reduce((best, c) => {
            const inClass = records.filter((r) => r.className === c)
            const attended = inClass.filter((r) => r.status !== 'absent').length
            const pct = inClass.length ? Math.round((attended / inClass.length) * 100) : 0
            return pct > best.pct ? { name: c, pct } : best
          }, { name: '—', pct: 0 }).name, delta: `${classes.reduce((best, c) => {
            const inClass = records.filter((r) => r.className === c)
            const attended = inClass.filter((r) => r.status !== 'absent').length
            const pct = inClass.length ? Math.round((attended / inClass.length) * 100) : 0
            return pct > best.pct ? { name: c, pct } : best
          }, { name: '—', pct: 0 }).pct}%` },
          { label: 'Overall rate', value: `${rate}%`, deltaTone: rate >= 75 ? 'up' : 'down' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Attendance log</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(r) => r.id}
            pageSize={10}
            exportFilename="school-attendance-log"
            emptyIcon={<CalendarCheck className="w-6 h-6" />}
            emptyTitle="No attendance records"
            emptyDescription="Mark attendance to see analytics here."
            toolbar={
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <Select value={classFilter} onValueChange={setClassFilter} className="w-40">
                  <option value="all">All classes</option>
                  {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter} className="w-32">
                  <option value="all">All status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </Select>
              </div>
            }
            actions={(r) => (
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-student summary</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={summaryColumns}
            rows={perStudent}
            rowKey={(s) => s.name}
            pageSize={10}
            exportFilename="school-attendance-summary"
            emptyTitle="No summary yet"
            emptyDescription="Attendance records will be summarised here."
          />
        </CardContent>
      </Card>
    </div>
  )
}