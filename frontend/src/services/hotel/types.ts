export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
export type RoomStatus = 'vacant-clean' | 'occupied' | 'vacant-dirty' | 'cleaning' | 'out-of-order'
export type HousekeepingStatus = 'pending' | 'in-progress' | 'inspection' | 'completed'

export type Guest = {
  readonly id: string
  readonly name: string
  readonly phone: string
  readonly email: string
  readonly nationality: string
  readonly vip: boolean
  readonly stays: number
}

export type Room = {
  readonly id: string
  readonly number: string
  readonly floor: number
  readonly type: 'Standard' | 'Deluxe' | 'Suite'
  readonly status: RoomStatus
  readonly rate: number
}

export type Reservation = {
  readonly id: string
  readonly confirmation: string
  readonly guestId: string
  readonly guestName: string
  readonly roomNumber: string
  readonly checkIn: string
  readonly checkOut: string
  readonly adults: number
  readonly children: number
  readonly source: 'Direct' | 'Website' | 'Travel desk' | 'Corporate'
  readonly status: ReservationStatus
  readonly balance: number
}

export type HousekeepingTask = {
  readonly id: string
  readonly roomNumber: string
  readonly assignee: string
  readonly task: 'Checkout clean' | 'Stayover service' | 'Deep clean' | 'Inspection'
  readonly priority: 'normal' | 'high'
  readonly status: HousekeepingStatus
  readonly scheduled: string
}
