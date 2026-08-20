import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, money, num, fmtDate, todayISO } from '../../components/ui'
import { GraduationCap, Layers, Wallet, CalendarCheck, Users, UserPlus, FileQuestion, Megaphone, AlertTriangle, ArrowRight, BookOpen, Bus, UtensilsCrossed, Trophy } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { Student, SchoolClass, FeeRecord, AttendanceRecord, StaffMember, AdmissionLead, LeaveRequest, Ticket } from './types'
import { STUDENT_SEED, CLASS_SEED, FEE_SEED, ATTENDANCE_SEED, STAFF_SEED, ADMISSION_SEED, LEAVE_SEED, TICKET_SEED } from './seed'
import { KPICard } from '../../components/ui'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../components/AdvancedPanel'

const NAV = [
  { label: 'Students', to: '/school/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', to: '/school/classes', icon: <Layers className="w-5 h-5" /> },
  { label: 'Admissions', to: '/school/admissions', icon: <UserPlus className="w-5 h-5" /> },
  { label: 'Attendance', to: '/school/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
  { label: 'Fees', to: '/school/fees', icon: <Wallet className="w-5 h-5" /> },
  { label: 'Exams', to: '/school/exams', icon: <FileQuestion className="w-5 h-5" /> },
  { label: 'LMS', to: '/school/lms', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Notices', to: '/school/notices', icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Transport', to: '/school/transport', icon: <Bus className="w-5 h-5" /> },
  { label: 'Cafeteria', to: '/school/cafeteria', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { label: 'Sports', to: '/school/sports', icon: <Trophy className="w-5 h-5" /> },
]

export default function SchoolHome() {
  const navigate = useNavigate()
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items: fees } = useLocalCollection<FeeRecord>('school:fees', FEE_SEED)
  const { items: attendance } = useLocalCollection<AttendanceRecord>('school:attendance', ATTENDANCE_SEED)
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items: admissions } = useLocalCollection<AdmissionLead>('school:admissions', ADMISSION_SEED)
  const { items: leaves } = useLocalCollection<LeaveRequest>('school:leave', LEAVE_SEED)
  const { items: tickets } = useLocalCollection<Ticket>('school:tickets', TICKET_SEED)

  const pendingFees = fees.filter((f) => f.status !== 'paid')
  const pendingAmount = pendingFees.reduce((s, f) => s + f.amount, 0)
  const overdueCount = fees.filter((f) => f.status === 'overdue').length

  const today = todayISO()
  const todayAttendance = attendance.filter((a) => a.date === today)
  const presentToday = todayAttendance.filter((a) => a.status === 'present').length
  const attendancePct = todayAttendance.length ? Math.round((presentToday / todayAttendance.length) * 100) : 0

  const openLeaves = leaves.filter((l) => l.status === 'pending').length
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'inprogress').length
  const activeLeads = admissions.filter((a) => a.stage !== 'enrolled').length

  const classAttendance: BarDatum[] = useMemo(() => {
    const byClass = new Map<string, { present: number; total: number }>()
    for (const a of attendance) {
      const e = byClass.get(a.className) ?? { present: 0, total: 0 }
      e.total += 1
      if (a.status === 'present') e.present += 1
      byClass.set(a.className, e)
    }
    return [...byClass.entries()]
      .map(([label, e]) => ({ label, value: e.total ? Math.round((e.present / e.total) * 100) : 0, valueLabel: `${Math.round((e.present / e.total) * 100)}%` }))
      .slice(0, 6)
  }, [attendance])

  const feeStatusDonut: DonutDatum[] = useMemo(() => {
    const paid = fees.filter((f) => f.status === 'paid').length
    const pending = fees.filter((f) => f.status === 'pending').length
    const overdue = fees.filter((f) => f.status === 'overdue').length
    return [
      { label: 'Paid', value: paid, color: 'var(--emerald, #10b981)' },
      { label: 'Pending', value: pending, color: 'var(--amber, #f59e0b)' },
      { label: 'Overdue', value: overdue, color: 'var(--red, #ef4444)' },
    ]
  }, [fees])

  const needsAttention = [
    ...pendingFees.slice(0, 3).map((f) => ({ label: `${f.studentName} — fees ${money(f.amount)} due ${fmtDate(f.dueDate)}`, to: '/school/fees', tone: 'danger' as const })),
    ...(openLeaves ? [{ label: `${openLeaves} leave request(s) awaiting approval`, to: '/school/leave', tone: 'warning' as const }] : []),
    ...(openTickets ? [{ label: `${openTickets} open helpdesk ticket(s)`, to: '/school/helpdesk', tone: 'warning' as const }] : []),
    ...(activeLeads ? [{ label: `${activeLeads} admission lead(s) not yet enrolled`, to: '/school/admissions', tone: 'info' as const }] : []),
  ].slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Students" value={num(students.length)} sub={`${num(classes.length)} classes`} icon={<Users className="w-5 h-5" />} tone="info" onClick={() => navigate('/school/students')} />
        <KPICard label="Staff" value={num(staff.length)} sub="Teachers & staff" icon={<GraduationCap className="w-5 h-5" />} tone="default" onClick={() => navigate('/school/staff')} />
        <KPICard label="Fees outstanding" value={money(pendingAmount)} sub={`${num(overdueCount)} overdue`} icon={<Wallet className="w-5 h-5" />} tone="danger" onClick={() => navigate('/school/fees')} />
        <KPICard label="Attendance today" value={`${attendancePct}%`} sub={`${num(presentToday)}/${num(todayAttendance.length)} present`} icon={<CalendarCheck className="w-5 h-5" />} tone="success" onClick={() => navigate('/school/attendance')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AdvancedPanel
            title="Class attendance"
            subtitle="Average present % by class"
            bars={classAttendance}
            compare={[
              { label: 'Students', value: num(students.length) },
              { label: 'Admission leads', value: num(admissions.length) },
              { label: 'Open leave', value: num(openLeaves), deltaTone: openLeaves ? 'down' : 'flat' },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {NAV.map((l) => (
                  <button key={l.to} onClick={() => navigate(l.to)} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors">
                    <span className="text-primary">{l.icon}</span>
                    <span className="text-sm font-medium text-text">{l.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AdvancedPanel
            title="Fee status"
            subtitle="Distribution across students"
            donut={feeStatusDonut}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {needsAttention.length === 0 ? (
                <p className="text-sm text-muted">All clear — nothing needs attention right now.</p>
              ) : (
                <div className="space-y-2">
                  {needsAttention.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(n.to)}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors text-left"
                    >
                      <span className="text-sm text-text flex-1 min-w-0">{n.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <Badge variant="info">Frontend preview</Badge>
              <p className="text-sm text-muted">All school data is stored locally in your browser. Modules mirror the School_Management spec.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}