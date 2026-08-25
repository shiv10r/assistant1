import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './interior.css'

const InteriorHome = lazy(() => import('./InteriorHome'))
const InteriorProjects = lazy(() => import('./InteriorProjects'))
const InteriorClients = lazy(() => import('./InteriorClients'))
const InteriorProjectDetails = lazy(() => import('./InteriorProjectDetails'))
const InteriorRoomDetails = lazy(() => import('./InteriorRoomDetails'))
const InteriorGenerate = lazy(() => import('./InteriorGenerate'))
const InteriorDesigns = lazy(() => import('./InteriorDesigns'))
const InteriorDesignDetails = lazy(() => import('./InteriorDesignDetails'))
const InteriorQuotation = lazy(() => import('./InteriorQuotation'))
const InteriorProducts = lazy(() => import('./InteriorProducts'))
const InteriorSites = lazy(() => import('./InteriorSites'))
const InteriorExecution = lazy(() => import('./InteriorExecution'))
const InteriorNotifications = lazy(() => import('./pages/InteriorNotifications'))

export default function InteriorRoutes() {
  return (
    <Routes>
      <Route index element={<InteriorHome />} />
      <Route path="dashboard" element={<InteriorHome />} />
      <Route path="projects" element={<InteriorProjects />} />
      <Route path="clients" element={<InteriorClients />} />
      <Route path="projects/:id" element={<InteriorProjectDetails />} />
      <Route path="projects/:id/rooms/:roomId" element={<InteriorRoomDetails />} />
      <Route path="projects/:id/generate" element={<InteriorGenerate />} />
      <Route path="projects/:id/designs" element={<InteriorDesigns />} />
      <Route path="projects/:id/designs/:designId" element={<InteriorDesignDetails />} />
      <Route path="projects/:id/quotation" element={<InteriorQuotation />} />
      <Route path="designs" element={<InteriorDesigns />} />
      <Route path="products" element={<InteriorProducts />} />
      <Route path="sites" element={<InteriorSites />} />
      <Route path="execution" element={<InteriorExecution />} />
      <Route path="notifications" element={<InteriorNotifications />} />
      <Route path="*" element={<Navigate to="/interior/dashboard" replace />} />
    </Routes>
  )
}
