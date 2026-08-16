import { useMemo, useState } from 'react'
import { BedDouble, Search } from 'lucide-react'
import { Badge, Card, CardContent, Input, PageHead, Select, money } from '../../components/ui'
import { useLocalCollection } from '../../lib/localStore'
import { ROOM_SEED } from './seed'
import type { Room, RoomStatus } from './types'

const STATUS_LABEL = {
  'vacant-clean': 'Vacant clean',
  occupied: 'Occupied',
  'vacant-dirty': 'Vacant dirty',
  cleaning: 'Cleaning',
  'out-of-order': 'Out of order',
} as const

const STATUS_TONE = {
  'vacant-clean': 'success',
  occupied: 'info',
  'vacant-dirty': 'warning',
  cleaning: 'default',
  'out-of-order': 'danger',
} as const

function roomStatusFromValue(value: string): RoomStatus {
  switch (value) {
    case 'vacant-clean': return 'vacant-clean'
    case 'occupied': return 'occupied'
    case 'vacant-dirty': return 'vacant-dirty'
    case 'cleaning': return 'cleaning'
    case 'out-of-order': return 'out-of-order'
    default: return 'vacant-clean'
  }
}

export default function HotelRooms() {
  const { items, update } = useLocalCollection<Room>('hotel:rooms', [...ROOM_SEED])
  const [query, setQuery] = useState('')
  const [floor, setFloor] = useState('all')
  const rooms = useMemo(() => items.filter((room) => {
    const matchesQuery = `${room.number} ${room.type} ${STATUS_LABEL[room.status]}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (floor === 'all' || String(room.floor) === floor)
  }), [floor, items, query])

  return (
    <div className="space-y-6">
      <PageHead icon={<BedDouble className="h-6 w-6" />} title="Rooms" sub="Live room availability, rates, and service status." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search room or type..." className="pl-9" /></div>
        <Select value={floor} onChange={(event) => setFloor(event.target.value)} className="sm:w-44"><option value="all">All floors</option><option value="1">Floor 1</option><option value="2">Floor 2</option><option value="3">Floor 3</option></Select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent className="pt-5">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><BedDouble className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-text">Room {room.number}</h2><p className="text-xs text-muted">Floor {room.floor} · {room.type}</p></div></div>
                <Badge variant={STATUS_TONE[room.status]} size="sm">{STATUS_LABEL[room.status]}</Badge>
              </div>
              <div className="mb-4 flex items-end justify-between border-t border-border pt-4"><span className="text-xs text-muted">Nightly rate</span><strong className="text-text">{money(room.rate)}</strong></div>
              <label className="block text-xs font-medium text-muted" htmlFor={`room-${room.id}`}>Update status</label>
              <Select id={`room-${room.id}`} value={room.status} onChange={(event) => update(room.id, { status: roomStatusFromValue(event.target.value) })} className="mt-2">
                {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
