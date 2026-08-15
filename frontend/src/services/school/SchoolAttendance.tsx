import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Empty, fmtDate, todayISO } from '../../components/ui'
import { CalendarCheck, Search } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { AttendanceRecord, AttendanceStatus, Student } from './types'
import { ATTENDANCE_SEED, STUDENT_SEED } from './seed'

const STATUS_TONE: Record<AttendanceStatus, 'success' | 'danger' | 'warning'> = { present: 'success', absent: 'danger', late: 'warning' }
const CYCLE: AttendanceStatus[] = ['present', 'late', 'absent']

export default function SchoolAttendance() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, setItems } = useLocalCollection<AttendanceRecord>('school:attendance', ATTENDANCE_SEED)
  const [date, setDate] = useState(todayISO())
  const [query, setQuery] = useState('')

  const todays = useMemo(() => {
    const map = new Map(items.filter((a) => a.date === date).map((a) => [a.studentId, a]))
    return students
      .filter((s) => `${s.name} ${s.className}`.toLowerCase().includes(query.toLowerCase()))
      .map((s) => map.get(s.id) ?? { id: genId(), studentId: s.id, studentName: s.name, className: s.className, date, status: 'present' as AttendanceStatus })
  }, [items, students, date, query])

  function cycleStatus(rec: AttendanceRecord) {
    const next = CYCLE[(CYCLE.indexOf(rec.status) + 1) % CYCLE.length]
    setItems((prev) => {
      const exists = prev.some((a) => a.id === rec.id)
      if (exists) return prev.map((a) => (a.id === rec.id ? { ...a, status: next } : a))
      return [...prev, { ...rec, status: next }]
    })
  }

  const presentCount = todays.filter((r) => r.status === 'present').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>Attendance — {fmtDate(date)}</CardTitle>
          <Input type="date" className="w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <Input placeholder="Search students..." className="pl-12" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="text-sm text-muted">Present: <span className="text-text font-semibold">{presentCount}/{todays.length}</span></div>
          </div>
          {todays.length === 0 ? (
            <Empty icon={<CalendarCheck className="w-6 h-6" />} title="No students found" description="Add students first to mark attendance." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {todays.map((r) => (
                  <TableRow key={r.studentId}>
                    <TableCell className="font-medium">{r.studentName}</TableCell>
                    <TableCell>{r.className}</TableCell>
                    <TableCell><Badge variant={STATUS_TONE[r.status]} size="sm">{r.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => cycleStatus(r)}>Toggle</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
