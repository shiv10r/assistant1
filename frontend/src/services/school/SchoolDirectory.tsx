import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Input } from '../../components/ui'
import { Users, Search, UserRound, Briefcase } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { Student, StaffMember, ParentRecord } from './types'
import { STUDENT_SEED, STAFF_SEED, PARENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'

type Entry =
  | { kind: 'student'; id: string; name: string; contact: string; detail: string }
  | { kind: 'staff'; id: string; name: string; contact: string; detail: string }
  | { kind: 'parent'; id: string; name: string; contact: string; detail: string }

export default function SchoolDirectory() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items: parents } = useLocalCollection<ParentRecord>('school:parents', PARENT_SEED)
  const [query, setQuery] = useState('')

  const entries: Entry[] = useMemo(() => [
    ...students.map((s) => ({ kind: 'student' as const, id: s.id, name: s.name, contact: s.phone, detail: s.className })),
    ...staff.map((s) => ({ kind: 'staff' as const, id: s.id, name: s.name, contact: s.phone, detail: s.role })),
    ...parents.map((p) => ({ kind: 'parent' as const, id: p.id, name: p.name, contact: p.phone, detail: `${p.childIds.length} child(ren)` })),
  ], [students, staff, parents])

  const filtered = useMemo(
    () => entries.filter((e) => `${e.name} ${e.contact} ${e.detail}`.toLowerCase().includes(query.toLowerCase())),
    [entries, query]
  )

  const KIND_BADGE = { student: <Badge variant="info" size="sm">Student</Badge>, staff: <Badge variant="warning" size="sm">Staff</Badge>, parent: <Badge variant="success" size="sm">Parent</Badge> }

  const columns: DataColumn<Entry>[] = [
    { key: 'name', header: 'Name', render: (e) => <span className="font-medium">{e.name}</span>, sortValue: (e) => e.name },
    { key: 'kind', header: 'Category', render: (e) => KIND_BADGE[e.kind], sortValue: (e) => e.kind },
    { key: 'contact', header: 'Contact', render: (e) => e.contact },
    { key: 'detail', header: 'Class / Role', render: (e) => e.detail, sortValue: (e) => e.detail },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total people" value={entries.length} icon={<Users className="w-5 h-5" />} tone="info" />
        <KPICard label="Students" value={students.length} icon={<UserRound className="w-5 h-5" />} tone="default" />
        <KPICard label="Staff" value={staff.length} icon={<Briefcase className="w-5 h-5" />} tone="warning" />
        <KPICard label="Parents" value={parents.length} icon={<Users className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader><CardTitle>People directory</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(e) => `${e.kind}-${e.id}`}
            pageSize={15}
            exportFilename="school-directory"
            emptyIcon={<Users className="w-6 h-6" />}
            emptyTitle="No people found"
            emptyDescription="Students, staff and parents appear here."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search everyone..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}