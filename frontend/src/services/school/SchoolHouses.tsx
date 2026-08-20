import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { Flag, Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { House, HousePoint } from './types'
import { HOUSE_SEED, HOUSE_POINT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'

const HOUSE_COLORS = ['#e11d48', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#06b6d4']

export default function SchoolHouses() {
  const { items: houses, add: addHouse, update: updateHouse, remove: removeHouse } = useLocalCollection<House>('school:houses', HOUSE_SEED)
  const { items: points, add: addPoint, update: updatePoint, remove: removePoint } = useLocalCollection<HousePoint>('school:house-points', HOUSE_POINT_SEED)
  const [houseModal, setHouseModal] = useState(false)
  const [pointModal, setPointModal] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)
  const [editingPoint, setEditingPoint] = useState<HousePoint | null>(null)
  const [houseForm, setHouseForm] = useState({ name: '', color: HOUSE_COLORS[0], captain: '', points: 0 })
  const [pointForm, setPointForm] = useState({ houseId: houses[0]?.id ?? '', event: '', points: 0, date: new Date().toISOString().slice(0, 10), awardedTo: '' })
  const [tab, setTab] = useState('houses')

  const houseColumns: DataColumn<House>[] = [
    { key: 'name', header: 'House', render: (h) => (
      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} /><span className="font-medium">{h.name}</span></div>
    ), sortValue: (h) => h.name },
    { key: 'captain', header: 'Captain', render: (h) => h.captain },
    { key: 'points', header: 'Points', render: (h) => <span className="font-semibold text-primary">{h.points}</span>, sortValue: (h) => h.points },
  ]

  const pointColumns: DataColumn<HousePoint>[] = [
    { key: 'houseName', header: 'House', render: (p) => {
      const h = houses.find((x) => x.id === p.houseId)
      return <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h?.color ?? '#999' }} /><span className="font-medium">{p.houseName}</span></div>
    }, sortValue: (p) => p.houseName },
    { key: 'event', header: 'Event', render: (p) => p.event },
    { key: 'awardedTo', header: 'Awarded to', render: (p) => p.awardedTo || <span className="text-muted text-sm">—</span> },
    { key: 'points', header: 'Points', render: (p) => <span className={`font-semibold ${p.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{p.points > 0 ? `+${p.points}` : p.points}</span>, sortValue: (p) => p.points },
    { key: 'date', header: 'Date', render: (p) => p.date.slice(0, 10), sortValue: (p) => p.date },
  ]

  function openAddHouse() {
    setEditingHouse(null)
    setHouseForm({ name: '', color: HOUSE_COLORS[0], captain: '', points: 0 })
    setHouseModal(true)
  }

  function openEditHouse(h: House) {
    setEditingHouse(h)
    setHouseForm({ name: h.name, color: h.color, captain: h.captain, points: h.points })
    setHouseModal(true)
  }

  function saveHouse() {
    if (!houseForm.name.trim()) return
    const payload = { ...houseForm, points: Number(houseForm.points) }
    if (editingHouse) updateHouse(editingHouse.id, payload)
    else addHouse({ id: genId(), ...payload })
    setHouseModal(false)
  }

  function openAddPoint() {
    setEditingPoint(null)
    setPointForm({ houseId: houses[0]?.id ?? '', event: '', points: 10, date: new Date().toISOString().slice(0, 10), awardedTo: '' })
    setPointModal(true)
  }

  function openEditPoint(p: HousePoint) {
    setEditingPoint(p)
    setPointForm({ houseId: p.houseId, event: p.event, points: p.points, date: p.date, awardedTo: p.awardedTo })
    setPointModal(true)
  }

  function savePoint() {
    if (!pointForm.event.trim()) return
    const house = houses.find((h) => h.id === pointForm.houseId)
    const payload = { ...pointForm, houseName: house?.name ?? '', points: Number(pointForm.points) }
    if (editingPoint) updatePoint(editingPoint.id, payload)
    else {
      addPoint({ id: genId(), ...payload })
      if (house) updateHouse(house.id, { points: house.points + Number(pointForm.points) })
    }
    setPointModal(false)
  }

  const totalPoints = houses.reduce((s, h) => s + h.points, 0)
  const leader = houses.length ? [...houses].sort((a, b) => b.points - a.points)[0] : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Houses" value={houses.length} icon={<Flag className="w-5 h-5" />} tone="info" />
        <KPICard label="Total points" value={totalPoints} icon={<Flag className="w-5 h-5" />} tone="success" />
        <KPICard label="Leading" value={leader?.name ?? '—'} icon={<Flag className="w-5 h-5" />} tone="warning" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="houses">Houses</TabsTrigger>
              <TabsTrigger value="points">Points log</TabsTrigger>
            </TabsList>
            <TabsContent value="houses" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddHouse}><Plus className="w-4 h-4" /> Add house</Button>
              </div>
              <DataTable
                columns={houseColumns}
                rows={houses}
                rowKey={(h) => h.id}
                pageSize={10}
                exportFilename="school-houses"
                emptyIcon={<Flag className="w-6 h-6" />}
                emptyTitle="No houses"
                emptyDescription="Create houses for inter-house competitions."
                actions={(h) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditHouse(h)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeHouse(h.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="points" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddPoint}><Plus className="w-4 h-4" /> Award points</Button>
              </div>
              <DataTable
                columns={pointColumns}
                rows={points}
                rowKey={(p) => p.id}
                pageSize={10}
                exportFilename="school-house-points"
                emptyIcon={<Flag className="w-6 h-6" />}
                emptyTitle="No points awarded"
                emptyDescription="Award house points for events."
                actions={(p) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditPoint(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removePoint(p.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={houseModal} onClose={() => setHouseModal(false)} title={editingHouse ? 'Edit house' : 'Add house'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>House name</Label><Input value={houseForm.name} onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })} /></div>
            <div><Label>Captain</Label><Input value={houseForm.captain} onChange={(e) => setHouseForm({ ...houseForm, captain: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: houseForm.color }} />
                <Select value={houseForm.color} onValueChange={(v) => setHouseForm({ ...houseForm, color: v })} className="flex-1">
                  {HOUSE_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            </div>
            <div><Label>Points</Label><Input type="number" value={houseForm.points} onChange={(e) => setHouseForm({ ...houseForm, points: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setHouseModal(false)}>Cancel</Button>
            <Button onClick={saveHouse}>{editingHouse ? 'Save changes' : 'Add house'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={pointModal} onClose={() => setPointModal(false)} title={editingPoint ? 'Edit points' : 'Award points'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>House</Label>
              <Select value={pointForm.houseId} onValueChange={(v) => setPointForm({ ...pointForm, houseId: v })}>
                {houses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </Select>
            </div>
            <div><Label>Points</Label><Input type="number" value={pointForm.points} onChange={(e) => setPointForm({ ...pointForm, points: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Event</Label><Input value={pointForm.event} onChange={(e) => setPointForm({ ...pointForm, event: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Awarded to</Label><Input value={pointForm.awardedTo} onChange={(e) => setPointForm({ ...pointForm, awardedTo: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={pointForm.date} onChange={(e) => setPointForm({ ...pointForm, date: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPointModal(false)}>Cancel</Button>
            <Button onClick={savePoint}>{editingPoint ? 'Save changes' : 'Award points'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}