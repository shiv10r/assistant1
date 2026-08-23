import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./TravelHome'))
const Destinations = lazy(() => import('./TravelDestinations'))
const Packages = lazy(() => import('./TravelPackages'))
const GroupTrips = lazy(() => import('./TravelGroupTrips'))
const Customize = lazy(() => import('./TravelCustomize'))
const MyTrips = lazy(() => import('./TravelMyTrips'))

export default function TravelRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="destinations" element={<Destinations />} />
    <Route path="packages" element={<Packages />} />
    <Route path="group-trips" element={<GroupTrips />} />
    <Route path="customize" element={<Customize />} />
    <Route path="my-trips" element={<MyTrips />} />
    <Route path="*" element={<Navigate to="/travel" replace />} />
  </Routes>
}
