import { useMemo, useState } from 'react'
import { CalendarCheck, Search } from 'lucide-react'
import { Badge, Button, Card, CardContent, Input, PageHead, money } from '../../components/ui'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { useLocalCollection } from '../../lib/localStore'
import { RESERVATION_SEED } from './seed'
import type { Reservation, ReservationStatus } from './types'

const STATUS_TONE = {
  confirmed: 'info',
  'checked-in': 'success',
  'checked-out': 'outline',
  cancelled: 'danger',
} as const

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  'checked-in': 'Checked in',
  'checked-out': 'Checked out',
  cancelled: 'Cancelled',
} as const

export default function HotelReservations() {
  const { items, update } = useLocalCollection<Reservation>('hotel:reservations', [...RESERVATION_SEED])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all')
  const rows = useMemo(() => items.filter((reservation) => {
    const matchesQuery = `${reservation.confirmation} ${reservation.guestName} ${reservation.roomNumber}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'all' || reservation.status === status)
  }), [items, query, status])

  const columns: DataColumn<Reservation>[] = [
    { key: 'confirmation', header: 'Confirmation', render: (row) => <span className="font-mono text-xs font-semibold text-primary">{row.confirmation}</span>, sortValue: (row) => row.confirmation },
    { key: 'guest', header: 'Guest', render: (row) => <div><p className="font-medium text-text">{row.guestName}</p><p className="text-xs text-muted">Room {row.roomNumber} · {row.adults + row.children} guest(s)</p></div>, sortValue: (row) => row.guestName },
    { key: 'stay', header: 'Stay', render: (row) => <div className="text-sm"><p>{row.checkIn}</p><p className="text-xs text-muted">to {row.checkOut}</p></div>, sortValue: (row) => row.checkIn },
    { key: 'source', header: 'Source', render: (row) => row.source, sortValue: (row) => row.source },
    { key: 'balance', header: 'Balance', render: (row) => <span className={row.balance > 0 ? 'font-medium text-warning' : 'text-muted'}>{money(row.balance)}</span>, sortValue: (row) => row.balance },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_TONE[row.status]} size="sm">{STATUS_LABEL[row.status]}</Badge>, sortValue: (row) => row.status },
    { key: 'action', header: 'Action', render: (row) => row.status === 'confirmed'
      ? <Button size="sm" onClick={() => update(row.id, { status: 'checked-in' })}>Check in</Button>
      : row.status === 'checked-in'
        ? <Button size="sm" variant="outline" onClick={() => update(row.id, { status: 'checked-out' })}>Check out</Button>
        : <span className="text-xs text-muted">Complete</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHead icon={<CalendarCheck className="h-6 w-6" />} title="Reservations" sub="Manage upcoming, in-house, and completed stays." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['all', 'confirmed', 'checked-in', 'checked-out'] as const).map((value) => (
          <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-lg border px-3 py-3 text-left transition-colors ${status === value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted hover:border-primary/50'}`}>
            <span className="block text-lg font-bold">{value === 'all' ? items.length : items.filter((item) => item.status === value).length}</span>
            <span className="text-xs">{value === 'all' ? 'All bookings' : STATUS_LABEL[value]}</span>
          </button>
        ))}
      </div>
      <Card><CardContent className="pt-6"><DataTable columns={columns} rows={rows} rowKey={(row) => row.id} pageSize={10} exportFilename="hotel-reservations" emptyIcon={<CalendarCheck className="h-6 w-6" />} emptyTitle="No reservations found" toolbar={<div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reservations..." className="pl-9" /></div>} /></CardContent></Card>
    </div>
  )
}
