import { Link } from 'react-router-dom'
import { BedDouble, CalendarCheck, LogIn, LogOut, Sparkles, Users } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, PageHead, money } from '../../components/ui'
import { KPICard } from '../../components/ui'
import { useLocalCollection } from '../../lib/localStore'
import { GUEST_SEED, HOTEL_OPERATION_DATE, HOUSEKEEPING_SEED, RESERVATION_SEED, ROOM_SEED } from './seed'
import type { HousekeepingTask, Reservation, Room } from './types'
import HotelShell from './HotelShell'

const ROOM_LABELS = {
  'vacant-clean': 'Vacant clean',
  occupied: 'Occupied',
  'vacant-dirty': 'Vacant dirty',
  cleaning: 'Cleaning',
  'out-of-order': 'Out of order',
} as const

const ROOM_TONES = {
  'vacant-clean': 'success',
  occupied: 'info',
  'vacant-dirty': 'warning',
  cleaning: 'default',
  'out-of-order': 'danger',
} as const

function ReservationRows({ rows, direction }: { readonly rows: readonly Reservation[]; readonly direction: 'arrival' | 'departure' }) {
  return (
    <div className="divide-y divide-border">
      {rows.map((reservation) => (
        <div key={reservation.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
            {reservation.roomNumber}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{reservation.guestName}</p>
            <p className="text-xs text-muted">{reservation.confirmation} · {reservation.source}</p>
          </div>
          <Badge variant={direction === 'arrival' ? 'info' : 'warning'} size="sm">
            {direction === 'arrival' ? 'Check in' : 'Check out'}
          </Badge>
        </div>
      ))}
    </div>
  )
}

export default function HotelHome() {
  const { items: rooms } = useLocalCollection<Room>('hotel:rooms', [...ROOM_SEED])
  const { items: reservations } = useLocalCollection<Reservation>('hotel:reservations', [...RESERVATION_SEED])
  const { items: housekeeping } = useLocalCollection<HousekeepingTask>('hotel:housekeeping', [...HOUSEKEEPING_SEED])
  const arrivals = reservations.filter((item) => item.checkIn === HOTEL_OPERATION_DATE && item.status === 'confirmed')
  const departures = reservations.filter((item) => item.checkOut === HOTEL_OPERATION_DATE && item.status === 'checked-in')
  const occupied = rooms.filter((room) => room.status === 'occupied').length
  const available = rooms.filter((room) => room.status === 'vacant-clean').length
  const occupancy = rooms.length === 0 ? 0 : Math.round((occupied / rooms.length) * 100)
  const pendingTasks = housekeeping.filter((task) => task.status !== 'completed')
  const outstanding = reservations.reduce((sum, reservation) => sum + reservation.balance, 0)

  return (
    <HotelShell>
      <div className="hotel-main">
        <PageHead
          icon={<BedDouble className="h-6 w-6" />}
          title="Hotel command center"
          sub="Front desk, rooms, guests, and housekeeping for VSR Grand."
          right={<Link to="/hotel/reservations" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><CalendarCheck className="h-4 w-4" />Reservations</Link>}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="Occupancy" value={`${occupancy}%`} sub={`${occupied} of ${rooms.length} rooms`} icon={<BedDouble className="h-5 w-5" />} tone="info" />
          <KPICard label="Today's arrivals" value={arrivals.length} sub="Confirmed bookings" icon={<LogIn className="h-5 w-5" />} tone="success" />
          <KPICard label="Today's departures" value={departures.length} sub="Expected check-outs" icon={<LogOut className="h-5 w-5" />} tone="warning" />
          <KPICard label="In-house guests" value={reservations.filter((item) => item.status === 'checked-in').length} sub={`${GUEST_SEED.length} guest profiles`} icon={<Users className="h-5 w-5" />} tone="default" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <Card>
            <CardHeader><CardTitle>Room status</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><p className="text-2xl font-bold text-text">{available}</p><p className="text-xs text-muted">Available</p></div>
                <div><p className="text-2xl font-bold text-text">{occupied}</p><p className="text-xs text-muted">Occupied</p></div>
                <div><p className="text-2xl font-bold text-text">{rooms.filter((room) => room.status === 'vacant-dirty' || room.status === 'cleaning').length}</p><p className="text-xs text-muted">Needs service</p></div>
                <div><p className="text-2xl font-bold text-text">{money(outstanding)}</p><p className="text-xs text-muted">Outstanding</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {rooms.map((room) => (
                  <div key={room.id} className="rounded-lg border border-border bg-surface2/50 p-3">
                    <div className="mb-2 flex items-start justify-between gap-2"><strong className="text-text">{room.number}</strong><span className="text-xs text-muted">F{room.floor}</span></div>
                    <p className="mb-2 text-xs text-muted">{room.type}</p>
                    <Badge variant={ROOM_TONES[room.status]} size="sm">{ROOM_LABELS[room.status]}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Housekeeping</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface2/40 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">{task.roomNumber}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-text">{task.task}</p><p className="text-xs text-muted">{task.assignee} · {task.scheduled}</p></div>
                    <Badge variant={task.priority === 'high' ? 'danger' : 'outline'} size="sm">{task.status}</Badge>
                  </div>
                ))}
              </div>
              <Link to="/hotel/housekeeping" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Open housekeeping board</Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Today's arrivals</CardTitle></CardHeader><CardContent><ReservationRows rows={arrivals} direction="arrival" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Today's departures</CardTitle></CardHeader><CardContent><ReservationRows rows={departures} direction="departure" /></CardContent></Card>
        </div>
      </div>
    </HotelShell>
  )
}
