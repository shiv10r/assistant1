import { useMemo, useState } from 'react'
import { Search, Star, Users } from 'lucide-react'
import { Badge, Card, CardContent, Input, PageHead } from '../../components/ui'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { useLocalCollection } from '../../lib/localStore'
import { GUEST_SEED } from './seed'
import type { Guest } from './types'

export default function HotelGuests() {
  const { items } = useLocalCollection<Guest>('hotel:guests', [...GUEST_SEED])
  const [query, setQuery] = useState('')
  const rows = useMemo(() => items.filter((guest) => `${guest.name} ${guest.phone} ${guest.email} ${guest.nationality}`.toLowerCase().includes(query.toLowerCase())), [items, query])
  const columns: DataColumn<Guest>[] = [
    { key: 'name', header: 'Guest', render: (guest) => <div className="flex items-center gap-2"><span className="font-medium text-text">{guest.name}</span>{guest.vip && <Star className="h-4 w-4 fill-primary text-primary" aria-label="VIP guest" />}</div>, sortValue: (guest) => guest.name },
    { key: 'contact', header: 'Contact', render: (guest) => <div><p>{guest.phone}</p><p className="text-xs text-muted">{guest.email}</p></div>, sortValue: (guest) => guest.phone },
    { key: 'nationality', header: 'Nationality', render: (guest) => guest.nationality, sortValue: (guest) => guest.nationality },
    { key: 'stays', header: 'Stay history', render: (guest) => <span className="font-mono">{guest.stays}</span>, sortValue: (guest) => guest.stays },
    { key: 'profile', header: 'Profile', render: (guest) => <Badge variant={guest.vip ? 'warning' : 'outline'} size="sm">{guest.vip ? 'VIP' : 'Regular'}</Badge>, sortValue: (guest) => guest.vip ? 1 : 0 },
  ]

  return (
    <div className="space-y-6">
      <PageHead icon={<Users className="h-6 w-6" />} title="Guests" sub="Guest profiles, contact details, and stay history." />
      <Card><CardContent className="pt-6"><DataTable columns={columns} rows={rows} rowKey={(guest) => guest.id} pageSize={12} exportFilename="hotel-guests" emptyIcon={<Users className="h-6 w-6" />} emptyTitle="No guests found" toolbar={<div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guests..." className="pl-9" /></div>} /></CardContent></Card>
    </div>
  )
}
