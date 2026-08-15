import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal } from '../../components/ui'
import { Star, Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { PerformanceReview, StaffMember } from './types'
import { REVIEW_SEED, STAFF_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= rating ? 'text-amber-500 fill-amber-500' : 'text-border'}`} />
      ))}
    </div>
  )
}

export default function SchoolPerformance() {
  const { items: staff } = useLocalCollection<StaffMember>('school:staff', STAFF_SEED)
  const { items, add, update, remove } = useLocalCollection<PerformanceReview>('school:reviews', REVIEW_SEED)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PerformanceReview | null>(null)
  const [form, setForm] = useState({ staffId: staff[0]?.id ?? '', period: '', rating: 3, status: 'pending' as PerformanceReview['status'] })

  const filtered = useMemo(
    () => items.filter((r) => `${r.staffName} ${r.period}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const columns: DataColumn<PerformanceReview>[] = [
    { key: 'staffName', header: 'Staff', render: (r) => <span className="font-medium">{r.staffName}</span>, sortValue: (r) => r.staffName },
    { key: 'period', header: 'Period', render: (r) => r.period, sortValue: (r) => r.period },
    { key: 'rating', header: 'Rating', render: (r) => r.status === 'completed' ? <Stars rating={r.rating} /> : <span className="text-muted text-sm">—</span>, sortValue: (r) => r.rating },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  ]

  function openAdd() {
    setEditing(null)
    setForm({ staffId: staff[0]?.id ?? '', period: '', rating: 3, status: 'pending' })
    setModalOpen(true)
  }

  function openEdit(r: PerformanceReview) {
    setEditing(r)
    setForm({ staffId: r.staffId, period: r.period, rating: r.rating, status: r.status })
    setModalOpen(true)
  }

  function save() {
    if (!form.period.trim()) return
    const person = staff.find((s) => s.id === form.staffId)
    const payload = { ...form, staffName: person?.name ?? '', rating: Number(form.rating) }
    if (editing) update(editing.id, payload)
    else add({ id: genId(), ...payload })
    setModalOpen(false)
  }

  const completed = items.filter((r) => r.status === 'completed')
  const avgRating = completed.length ? (completed.reduce((s, r) => s + r.rating, 0) / completed.length).toFixed(1) : '—'
  const pending = items.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Reviews" value={items.length} icon={<Star className="w-5 h-5" />} tone="info" />
        <KpiCard label="Pending" value={pending} icon={<Star className="w-5 h-5" />} tone="warning" />
        <KpiCard label="Avg rating" value={avgRating} icon={<Star className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Performance reviews</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add review</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(r) => r.id}
            pageSize={10}
            exportFilename="school-performance"
            emptyIcon={<Star className="w-6 h-6" />}
            emptyTitle="No reviews yet"
            emptyDescription="Create a performance review for a staff member."
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search reviews..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(r) => (
              <div className="flex gap-1">
                {r.status === 'pending' && (
                  <Button variant="ghost" size="icon" onClick={() => update(r.id, { status: 'completed', rating: r.rating || 3 })} aria-label="Complete"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit review' : 'Add review'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff member</Label>
              <Select value={form.staffId} onValueChange={(v) => setForm({ ...form, staffId: v })}>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div><Label required>Period</Label><Input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="Q2 2026" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rating (1-5)</Label>
              <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: Number(v) })}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PerformanceReview['status'] })}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Save changes' : 'Add review'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}