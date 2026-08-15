import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, Empty } from '../../components/ui'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { TimetableSlot, SchoolClass } from './types'
import { TIMETABLE_SEED, CLASS_SEED } from './seed'
import { KpiCard } from '../../components/KpiCard'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SchoolTimetable() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  const { items, add, remove } = useLocalCollection<TimetableSlot>('school:timetable', TIMETABLE_SEED)
  const [classId, setClassId] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ classId: classes[0]?.id ?? '', day: 'Mon', period: 1, subject: '', teacher: '', room: '' })

  const filtered = useMemo(
    () => (classId === 'all' ? items : items.filter((t) => t.classId === classId)),
    [items, classId]
  )

  function save() {
    if (!form.subject.trim()) return
    const cls = classes.find((c) => c.id === form.classId)
    add({ id: genId(), ...form, className: cls ? `${cls.name} - ${cls.section}` : '', period: Number(form.period) })
    setModalOpen(false)
  }

  const roomCount = new Set(filtered.map((t) => t.room)).size
  const classCovered = new Set(filtered.map((t) => t.classId)).size

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Slots" value={filtered.length} icon={<CalendarClock className="w-5 h-5" />} tone="info" />
        <KpiCard label="Classes covered" value={classCovered} icon={<CalendarClock className="w-5 h-5" />} tone="default" />
        <KpiCard label="Rooms in use" value={roomCount} icon={<CalendarClock className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>Weekly timetable</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={classId} onValueChange={setClassId} className="w-44">
              <option value="all">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </Select>
            <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add slot</Button>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <Empty title="No timetable slots" description="Add slots to build the weekly grid." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {DAYS.map((day) => (
                <div key={day} className="space-y-2">
                  <div className="text-sm font-semibold text-text text-center py-2 rounded-lg bg-surface2 border border-border">{day}</div>
                  {filtered.filter((t) => t.day === day).sort((a, b) => a.period - b.period).map((t) => (
                    <div key={t.id} className="rounded-lg border border-border bg-surface2/50 p-2.5 space-y-1 group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted">P{t.period}</span>
                        <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover:opacity-100" onClick={() => remove(t.id)} aria-label="Delete"><Trash2 className="w-3 h-3 text-red-500" /></Button>
                      </div>
                      <p className="text-sm font-medium text-text leading-tight">{t.subject}</p>
                      <p className="text-[11px] text-muted">{t.teacher} · {t.room}</p>
                    </div>
                  ))}
                  {filtered.filter((t) => t.day === day).length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-2.5 text-center text-[11px] text-muted">—</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add timetable slot" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
              </Select>
            </div>
            <div>
              <Label>Day</Label>
              <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Period</Label><Input type="number" min={1} max={8} value={form.period} onChange={(e) => setForm({ ...form, period: Number(e.target.value) })} /></div>
            <div><Label>Room</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. R-101" /></div>
          </div>
          <div><Label required>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><Label>Teacher</Label><Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>Add slot</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}