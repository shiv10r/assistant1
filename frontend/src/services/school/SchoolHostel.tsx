import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { BedDouble, Plus, Pencil, Trash2, LogOut } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { HostelRoom, HostelAllocation, Student } from './types'
import { ROOM_SEED, ALLOCATION_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolHostel() {
  const { items: rooms, add: addRoom, update: updateRoom, remove: removeRoom } = useLocalCollection<HostelRoom>('school:rooms', ROOM_SEED)
  const { items: allocations, add: addAllocation, update: updateAllocation, remove: removeAllocation } = useLocalCollection<HostelAllocation>('school:allocations', ALLOCATION_SEED)
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const [roomModal, setRoomModal] = useState(false)
  const [allocModal, setAllocModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<HostelRoom | null>(null)
  const [editingAlloc, setEditingAlloc] = useState<HostelAllocation | null>(null)
  const [roomForm, setRoomForm] = useState({ hostel: '', number: '', capacity: 4, occupants: 0, type: 'shared' as HostelRoom['type'] })
  const [allocForm, setAllocForm] = useState({ studentId: students[0]?.id ?? '', roomId: rooms[0]?.id ?? '', from: new Date().toISOString().slice(0, 10), status: 'active' as HostelAllocation['status'] })
  const [tab, setTab] = useState('rooms')

  const roomColumns: DataColumn<HostelRoom>[] = [
    { key: 'hostel', header: 'Hostel', render: (r) => <span className="font-medium">{r.hostel}</span>, sortValue: (r) => r.hostel },
    { key: 'number', header: 'Room', render: (r) => <span className="font-mono text-sm">{r.number}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
    { key: 'capacity', header: 'Capacity', render: (r) => r.capacity },
    { key: 'occupancy', header: 'Occupancy', render: (r) => {
      const full = r.occupants >= r.capacity
      return <span className={full ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>{r.occupants}/{r.capacity}</span>
    }, sortValue: (r) => r.occupants },
  ]

  const allocColumns: DataColumn<HostelAllocation>[] = [
    { key: 'studentName', header: 'Student', render: (a) => <span className="font-medium">{a.studentName}</span>, sortValue: (a) => a.studentName },
    { key: 'hostel', header: 'Hostel', render: (a) => a.hostel },
    { key: 'roomNo', header: 'Room', render: (a) => <span className="font-mono text-sm">{a.roomNo}</span> },
    { key: 'from', header: 'From', render: (a) => a.from.slice(0, 10) },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} />, sortValue: (a) => a.status },
  ]

  function openAddRoom() {
    setEditingRoom(null)
    setRoomForm({ hostel: '', number: '', capacity: 4, occupants: 0, type: 'shared' })
    setRoomModal(true)
  }

  function openEditRoom(r: HostelRoom) {
    setEditingRoom(r)
    setRoomForm({ hostel: r.hostel, number: r.number, capacity: r.capacity, occupants: r.occupants, type: r.type })
    setRoomModal(true)
  }

  function saveRoom() {
    if (!roomForm.number.trim()) return
    const payload = { ...roomForm, capacity: Number(roomForm.capacity), occupants: Number(roomForm.occupants) }
    if (editingRoom) updateRoom(editingRoom.id, payload)
    else addRoom({ id: genId(), ...payload })
    setRoomModal(false)
  }

  function openAddAlloc() {
    setEditingAlloc(null)
    setAllocForm({ studentId: students[0]?.id ?? '', roomId: rooms[0]?.id ?? '', from: new Date().toISOString().slice(0, 10), status: 'active' })
    setAllocModal(true)
  }

  function openEditAlloc(a: HostelAllocation) {
    setEditingAlloc(a)
    setAllocForm({ studentId: a.studentId, roomId: a.roomId, from: a.from, status: a.status })
    setAllocModal(true)
  }

  function saveAlloc() {
    const student = students.find((s) => s.id === allocForm.studentId)
    const room = rooms.find((r) => r.id === allocForm.roomId)
    const payload = { ...allocForm, studentName: student?.name ?? '', roomNo: room?.number ?? '', hostel: room?.hostel ?? '' }
    if (editingAlloc) updateAllocation(editingAlloc.id, payload)
    else {
      addAllocation({ id: genId(), ...payload })
      if (room) updateRoom(room.id, { occupants: room.occupants + 1 })
    }
    setAllocModal(false)
  }

  function vacate(a: HostelAllocation) {
    updateAllocation(a.id, { status: 'vacated' })
    const room = rooms.find((r) => r.id === a.roomId)
    if (room && room.occupants > 0) updateRoom(room.id, { occupants: room.occupants - 1 })
  }

  const activeAllocs = allocations.filter((a) => a.status === 'active').length
  const beds = rooms.reduce((s, r) => s + r.capacity, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Rooms" value={rooms.length} icon={<BedDouble className="w-5 h-5" />} tone="info" />
        <KpiCard label="Beds" value={beds} icon={<BedDouble className="w-5 h-5" />} tone="default" />
        <KpiCard label="Occupants" value={activeAllocs} icon={<BedDouble className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="allocations">Allocations</TabsTrigger>
            </TabsList>
            <TabsContent value="rooms" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddRoom}><Plus className="w-4 h-4" /> Add room</Button>
              </div>
              <DataTable
                columns={roomColumns}
                rows={rooms}
                rowKey={(r) => r.id}
                pageSize={10}
                exportFilename="school-hostel-rooms"
                emptyIcon={<BedDouble className="w-6 h-6" />}
                emptyTitle="No rooms"
                emptyDescription="Add hostel rooms to manage accommodation."
                actions={(r) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditRoom(r)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeRoom(r.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="allocations" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddAlloc}><Plus className="w-4 h-4" /> Allocate room</Button>
              </div>
              <DataTable
                columns={allocColumns}
                rows={allocations}
                rowKey={(a) => a.id}
                pageSize={10}
                exportFilename="school-hostel-allocations"
                emptyIcon={<BedDouble className="w-6 h-6" />}
                emptyTitle="No allocations"
                emptyDescription="Allocate students to hostel rooms."
                actions={(a) => (
                  <div className="flex gap-1">
                    {a.status === 'active' && (
                      <Button variant="ghost" size="icon" onClick={() => vacate(a)} aria-label="Vacate"><LogOut className="w-4 h-4 text-amber-500" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditAlloc(a)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeAllocation(a.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={roomModal} onClose={() => setRoomModal(false)} title={editingRoom ? 'Edit room' : 'Add room'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Hostel</Label><Input value={roomForm.hostel} onChange={(e) => setRoomForm({ ...roomForm, hostel: e.target.value })} placeholder="Boys Hostel A" /></div>
            <div><Label>Room no</Label><Input value={roomForm.number} onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })} placeholder="A-102" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={roomForm.type} onValueChange={(v) => setRoomForm({ ...roomForm, type: v as HostelRoom['type'] })}>
                <option value="dorm">Dorm</option>
                <option value="shared">Shared</option>
                <option value="single">Single</option>
              </Select>
            </div>
            <div><Label>Capacity</Label><Input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} /></div>
            <div><Label>Occupants</Label><Input type="number" value={roomForm.occupants} onChange={(e) => setRoomForm({ ...roomForm, occupants: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRoomModal(false)}>Cancel</Button>
            <Button onClick={saveRoom}>{editingRoom ? 'Save changes' : 'Add room'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={allocModal} onClose={() => setAllocModal(false)} title={editingAlloc ? 'Edit allocation' : 'Allocate room'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student</Label>
              <Select value={allocForm.studentId} onValueChange={(v) => setAllocForm({ ...allocForm, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Room</Label>
              <Select value={allocForm.roomId} onValueChange={(v) => setAllocForm({ ...allocForm, roomId: v })}>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.hostel} - {r.number}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>From</Label><Input type="date" value={allocForm.from} onChange={(e) => setAllocForm({ ...allocForm, from: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={allocForm.status} onValueChange={(v) => setAllocForm({ ...allocForm, status: v as HostelAllocation['status'] })}>
                <option value="active">Active</option>
                <option value="vacated">Vacated</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAllocModal(false)}>Cancel</Button>
            <Button onClick={saveAlloc}>{editingAlloc ? 'Save changes' : 'Allocate'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}