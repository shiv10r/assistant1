import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, money } from '../../components/ui'
import { GraduationCap, Layers, Wallet, CalendarCheck, Users } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { Student, SchoolClass, FeeRecord } from './types'
import { STUDENT_SEED, CLASS_SEED, FEE_SEED } from './seed'

export default function SchoolHome() {
  const navigate = useNavigate()
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items: fees } = useLocalCollection<FeeRecord>('school:fees', FEE_SEED)

  const pendingFees = fees.filter((f) => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0)
  const overdue = fees.filter((f) => f.status === 'overdue').length

  const kpis = [
    { label: 'Students', value: students.length, icon: <Users className="w-5 h-5" />, to: '/school/students' },
    { label: 'Classes', value: classes.length, icon: <Layers className="w-5 h-5" />, to: '/school/classes' },
    { label: 'Fees outstanding', value: money(pendingFees), icon: <Wallet className="w-5 h-5" />, to: '/school/fees' },
    { label: 'Overdue payments', value: overdue, icon: <GraduationCap className="w-5 h-5" />, to: '/school/fees' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(k.to)}>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted">{k.label}</div>
                <div className="text-2xl font-semibold text-text mt-1">{k.value}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface2 border border-border flex items-center justify-center text-primary">{k.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Students', to: '/school/students', icon: <Users className="w-5 h-5" /> },
              { label: 'Classes', to: '/school/classes', icon: <Layers className="w-5 h-5" /> },
              { label: 'Fees', to: '/school/fees', icon: <Wallet className="w-5 h-5" /> },
              { label: 'Attendance', to: '/school/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
            ].map((l) => (
              <button key={l.to} onClick={() => navigate(l.to)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface2 hover:border-primary/50 transition-colors">
                <span className="text-primary">{l.icon}</span>
                <span className="text-sm font-medium text-text">{l.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3">
          <Badge variant="info">Frontend preview</Badge>
          <p className="text-sm text-muted">Data shown here is stored locally in your browser until a School backend module is built.</p>
        </CardContent>
      </Card>
    </div>
  )
}
