import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Categories = lazy(() => import('./pages/Categories'))
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const Search = lazy(() => import('./pages/Search'))
const BookingFlow = lazy(() => import('./pages/BookingFlow'))
const Bookings = lazy(() => import('./pages/Bookings'))
const BookingDetail = lazy(() => import('./pages/BookingDetail'))
const Offers = lazy(() => import('./pages/Offers'))
const Account = lazy(() => import('./pages/Account'))
const Addresses = lazy(() => import('./pages/Addresses'))
const ProDashboard = lazy(() => import('./pages/pro/ProDashboard'))
const ProRequests = lazy(() => import('./pages/pro/ProRequests'))
const ProJobs = lazy(() => import('./pages/pro/ProJobs'))
const ProJobDetail = lazy(() => import('./pages/pro/ProJobDetail'))
const ProEarnings = lazy(() => import('./pages/pro/ProEarnings'))
const ProProfile = lazy(() => import('./pages/pro/ProProfile'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminLiveOps = lazy(() => import('./pages/admin/AdminLiveOps'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminProfessionals = lazy(() => import('./pages/admin/AdminProfessionals'))
const AdminFinance = lazy(() => import('./pages/admin/AdminFinance'))
const DatabaseCheck = lazy(() => import('./pages/DatabaseCheck'))
const AddCategory = lazy(() => import('./pages/AddCategory'))

export default function HomeServicesRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="categories" element={<Categories />} />
    <Route path="categories/:slug" element={<CategoryDetail />} />
    <Route path="services/:slug" element={<ServiceDetail />} />
    <Route path="search" element={<Search />} />
    <Route path="book" element={<BookingFlow />} />
    <Route path="bookings" element={<Bookings />} />
    <Route path="bookings/:bookingId" element={<BookingDetail />} />
    <Route path="offers" element={<Offers />} />
    <Route path="account" element={<Account />} />
    <Route path="addresses" element={<Addresses />} />
    <Route path="pro" element={<ProDashboard />} />
    <Route path="pro/requests" element={<ProRequests />} />
    <Route path="pro/jobs" element={<ProJobs />} />
    <Route path="pro/jobs/:jobId" element={<ProJobDetail />} />
    <Route path="pro/earnings" element={<ProEarnings />} />
    <Route path="pro/profile" element={<ProProfile />} />
    <Route path="admin" element={<AdminDashboard />} />
    <Route path="admin/live" element={<AdminLiveOps />} />
    <Route path="admin/bookings" element={<AdminBookings />} />
    <Route path="admin/professionals" element={<AdminProfessionals />} />
    <Route path="admin/finance" element={<AdminFinance />} />
    <Route path="admin/analytics" element={<AdminDashboard />} />
    <Route path="database-check" element={<DatabaseCheck />} />
    <Route path="categories/add" element={<AddCategory />} />
    <Route path="*" element={<Navigate to="/home-services" replace />} />
  </Routes>
}
