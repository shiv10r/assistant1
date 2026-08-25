import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./HotelHome'))
const Reservations = lazy(() => import('./HotelReservations'))
const Rooms = lazy(() => import('./HotelRooms'))
const Guests = lazy(() => import('./HotelGuests'))
const Housekeeping = lazy(() => import('./HotelHousekeeping'))
const HotelNotifications = lazy(() => import('./pages/HotelNotifications'))

export default function HotelRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="dashboard" element={<Home />} />
    <Route path="reservations" element={<Reservations />} />
    <Route path="rooms" element={<Rooms />} />
    <Route path="guests" element={<Guests />} />
    <Route path="housekeeping" element={<Housekeeping />} />
    <Route path="notifications" element={<HotelNotifications />} />
    <Route path="*" element={<Navigate to="/hotel" replace />} />
  </Routes>
}
