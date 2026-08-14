import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Label, Select, Modal, Empty, money, fmtDate, todayISO } from '../../components/ui'
import { Wallet, Plus, Search, CheckCircle2, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { FeeRecord, FeeStatus, Student } from './types'
import { FEE_SEED, STUDENT_SEED } from './seed'

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
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input placeholder="Search student or class..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="text-sm text-muted">Outstanding: <span className="text-text font-semibold">{money(totalPending)}</span></div>
          </div>
          {filtered.length === 0 ? (
            <Empty icon={<Wallet className="w-6 h-6" />} title="No fee records" description="Add a fee record to start tracking collections." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Amount</TableHead><TableHead>Due date</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.studentName}</TableCell>
                    <TableCell>{f.className}</TableCell>
                    <TableCell>{money(f.amount)}</TableCell>
                    <TableCell>{fmtDate(f.dueDate)}</TableCell>
                    <TableCell><Badge variant={STATUS_TONE[f.status]} size="sm">{f.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {f.status !== 'paid' && (
                          <Button variant="ghost" size="icon" onClick={() => markPaid(f)} aria-label="Mark paid"><CheckCircle2 className="w-4 h-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => remove(f.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
