import { Navigate, Route, Routes } from 'react-router-dom'
import RailwayWorkspace from './RailwayWorkspace'
import MaintenanceDashboard from './maintenance/MaintenanceDashboard'
import CrowdCommandCenter from './crowd/CrowdCommandCenter'

export default function RailwayRoutes() {
  return (
    <Routes>
      <Route index element={<RailwayWorkspace view="overview" />} />
      <Route path="routes" element={<RailwayWorkspace view="routes" />} />
      <Route path="stations" element={<RailwayWorkspace view="stations" />} />
      <Route path="fleet" element={<RailwayWorkspace view="fleet" />} />
      <Route path="maintenance" element={<MaintenanceDashboard />} />
      <Route path="crowd" element={<CrowdCommandCenter />} />
      <Route path="*" element={<Navigate to="/railway" replace />} />
    </Routes>
  )
}
