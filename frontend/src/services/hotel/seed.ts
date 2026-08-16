import type { Guest, HousekeepingTask, Reservation, Room } from './types'

export const HOTEL_OPERATION_DATE = '2026-08-16'

export const GUEST_SEED: readonly Guest[] = [
  { id: 'g-101', name: 'Ananya Sharma', phone: '+91 98765 21001', email: 'ananya@example.com', nationality: 'Indian', vip: true, stays: 8 },
  { id: 'g-102', name: 'Rohan Mehta', phone: '+91 98765 21002', email: 'rohan@example.com', nationality: 'Indian', vip: false, stays: 2 },
  { id: 'g-103', name: 'Maya Thompson', phone: '+44 7700 900321', email: 'maya@example.com', nationality: 'British', vip: false, stays: 1 },
  { id: 'g-104', name: 'Kabir Singh', phone: '+91 98765 21004', email: 'kabir@example.com', nationality: 'Indian', vip: true, stays: 12 },
  { id: 'g-105', name: 'Sofia Martinez', phone: '+34 612 345 678', email: 'sofia@example.com', nationality: 'Spanish', vip: false, stays: 3 },
  { id: 'g-106', name: 'Arjun Nair', phone: '+91 98765 21006', email: 'arjun@example.com', nationality: 'Indian', vip: false, stays: 1 },
]

export const ROOM_SEED: readonly Room[] = [
  { id: 'r-101', number: '101', floor: 1, type: 'Standard', status: 'occupied', rate: 4200 },
  { id: 'r-102', number: '102', floor: 1, type: 'Standard', status: 'vacant-clean', rate: 4200 },
  { id: 'r-103', number: '103', floor: 1, type: 'Deluxe', status: 'vacant-dirty', rate: 5600 },
  { id: 'r-201', number: '201', floor: 2, type: 'Deluxe', status: 'occupied', rate: 5600 },
  { id: 'r-202', number: '202', floor: 2, type: 'Deluxe', status: 'cleaning', rate: 5600 },
  { id: 'r-203', number: '203', floor: 2, type: 'Suite', status: 'occupied', rate: 8200 },
  { id: 'r-301', number: '301', floor: 3, type: 'Suite', status: 'vacant-clean', rate: 8200 },
  { id: 'r-302', number: '302', floor: 3, type: 'Suite', status: 'out-of-order', rate: 8200 },
  { id: 'r-303', number: '303', floor: 3, type: 'Deluxe', status: 'vacant-clean', rate: 5600 },
  { id: 'r-304', number: '304', floor: 3, type: 'Standard', status: 'vacant-dirty', rate: 4200 },
]

export const RESERVATION_SEED: readonly Reservation[] = [
  { id: 'res-1', confirmation: 'VSR-26081601', guestId: 'g-102', guestName: 'Rohan Mehta', roomNumber: '102', checkIn: '2026-08-16', checkOut: '2026-08-18', adults: 2, children: 0, source: 'Website', status: 'confirmed', balance: 8400 },
  { id: 'res-2', confirmation: 'VSR-26081602', guestId: 'g-103', guestName: 'Maya Thompson', roomNumber: '301', checkIn: '2026-08-16', checkOut: '2026-08-20', adults: 1, children: 0, source: 'Travel desk', status: 'confirmed', balance: 16400 },
  { id: 'res-3', confirmation: 'VSR-26081403', guestId: 'g-101', guestName: 'Ananya Sharma', roomNumber: '101', checkIn: '2026-08-14', checkOut: '2026-08-16', adults: 2, children: 1, source: 'Direct', status: 'checked-in', balance: 0 },
  { id: 'res-4', confirmation: 'VSR-26081504', guestId: 'g-104', guestName: 'Kabir Singh', roomNumber: '203', checkIn: '2026-08-15', checkOut: '2026-08-17', adults: 2, children: 0, source: 'Corporate', status: 'checked-in', balance: 8200 },
  { id: 'res-5', confirmation: 'VSR-26081305', guestId: 'g-105', guestName: 'Sofia Martinez', roomNumber: '201', checkIn: '2026-08-13', checkOut: '2026-08-16', adults: 1, children: 0, source: 'Website', status: 'checked-in', balance: 2800 },
  { id: 'res-6', confirmation: 'VSR-26081706', guestId: 'g-106', guestName: 'Arjun Nair', roomNumber: '303', checkIn: '2026-08-17', checkOut: '2026-08-19', adults: 2, children: 0, source: 'Direct', status: 'confirmed', balance: 11200 },
]

export const HOUSEKEEPING_SEED: readonly HousekeepingTask[] = [
  { id: 'hk-1', roomNumber: '103', assignee: 'Priya', task: 'Checkout clean', priority: 'high', status: 'pending', scheduled: '10:00' },
  { id: 'hk-2', roomNumber: '202', assignee: 'Neha', task: 'Deep clean', priority: 'normal', status: 'in-progress', scheduled: '09:30' },
  { id: 'hk-3', roomNumber: '304', assignee: 'Priya', task: 'Checkout clean', priority: 'normal', status: 'pending', scheduled: '11:00' },
  { id: 'hk-4', roomNumber: '101', assignee: 'Neha', task: 'Stayover service', priority: 'normal', status: 'inspection', scheduled: '12:00' },
  { id: 'hk-5', roomNumber: '203', assignee: 'Asha', task: 'Stayover service', priority: 'normal', status: 'completed', scheduled: '08:30' },
]
