import { Navigate, Route, Routes } from 'react-router-dom'
import RailwayWorkspace from './RailwayWorkspace'

export default function RailwayRoutes() {
  return (
    <Routes>
      <Route index element={<RailwayWorkspace view="overview" />} />
      <Route path="routes" element={<RailwayWorkspace view="routes" />} />
      <Route path="stations" element={<RailwayWorkspace view="stations" />} />
      <Route path="fleet" element={<RailwayWorkspace view="fleet" />} />
      <Route path="*" element={<Navigate to="/railway" replace />} />
    </Routes>
  )
}
