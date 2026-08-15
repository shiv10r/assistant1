import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Select, Modal, money, fmtDate, todayISO } from '../../components/ui'
import { Wallet, Plus, Search, CheckCircle2, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { FeeRecord, FeeStatus, Student } from './types'
import { FEE_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'

const STATUS_TONE: Record<FeeStatus, 'success' | 'warning' | 'danger'> = { paid: 'success', pending: 'warning', overdue: 'danger' }

export default function SchoolFees() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const { items, add, update, remove } = useLocalCollection<FeeRecord>('school:fees', FEE_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('0')
  const [dueDate, setDueDate] = useState(todayISO())

  const filtered = useMemo(
    () => items.filter((f) => `${f.studentName} ${f.className}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<FeeRecord>[] = [
    { key: 'studentName', header: 'Student', render: (f) => <span className="font-medium">{f.studentName}</span>, sortValue: (f) => f.studentName },
    { key: 'className', header: 'Class', render: (f) => f.className, sortValue: (f) => f.className },
    { key: 'amount', header: 'Amount', render: (f) => money(f.amount), sortValue: (f) => f.amount },
    { key: 'dueDate', header: 'Due date', render: (f) => fmtDate(f.dueDate), sortValue: (f) => f.dueDate },
    { key: 'status', header: 'Status', render: (f) => <Badge variant={STATUS_TONE[f.status]} size="sm">{f.status}</Badge>, sortValue: (f) => f.status },
  ]

  const totalPending = items.filter((f) => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0)

  function openAdd() {
    setStudentId(students[0]?.id ?? '')
    setAmount('0')
    setDueDate(todayISO())
    setModalOpen(true)
  }

  function save() {
    const student = students.find((s) => s.id === studentId)
    if (!student) return
    add({ id: genId(), studentId, studentName: student.name, className: student.className, amount: Number(amount) || 0, dueDate, status: 'pending' })
    setModalOpen(false)
  }

  function markPaid(f: FeeRecord) {
    update(f.id, { status: 'paid', paidDate: todayISO() })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Fees</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add fee record</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(f) => f.id}
            pageSize={10}
            exportFilename="school-fees"
            emptyIcon={<Wallet className="w-6 h-6" />}
            emptyTitle="No fee records"
            emptyDescription="Add a fee record to start tracking collections."
            toolbar={
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search student or class..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="text-sm text-muted">Outstanding: <span className="text-text font-semibold">{money(totalPending)}</span></div>
              </div>
            }
            actions={(f) => (
              <div className="flex gap-1 justify-end">
                {f.status !== 'paid' && (
                  <Button variant="ghost" size="icon" onClick={() => markPaid(f)} aria-label="Mark paid"><CheckCircle2 className="w-4 h-4" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => remove(f.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add fee record" size="md">
        <div className="space-y-4">
          <div>
            <Label required>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Amount</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!studentId}>Add fee record</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
