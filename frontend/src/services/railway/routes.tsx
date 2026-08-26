import { Navigate, Route, Routes } from 'react-router-dom'
import RailwayWorkspace from './RailwayWorkspace'
import MaintenanceDashboard from './maintenance/MaintenanceDashboard'
import CrowdCommandCenter from './crowd/CrowdCommandCenter'
import CrowdStationView from './crowd/CrowdStationView'
import CrowdAnalytics from './crowd/CrowdAnalytics'
import CrowdImports from './crowd/CrowdImports'
import InspectionWorkspace from './inspection/InspectionWorkspace'
import RailwayCapabilityGate from './shared/RailwayCapabilityGate'
import { railwayPermissions } from './shared/railwayPermissions'

export default function RailwayRoutes() {
  return (
    <Routes>
      <Route index element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="overview" /></RailwayCapabilityGate>} />
      <Route path="routes" element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="routes" /></RailwayCapabilityGate>} />
      <Route path="stations" element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="stations" /></RailwayCapabilityGate>} />
      <Route path="fleet" element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="fleet" /></RailwayCapabilityGate>} />
      <Route path="inspections/*" element={<RailwayCapabilityGate capability="inspectionEnabled" permission={railwayPermissions.INSPECTIONS_READ}><InspectionWorkspace /></RailwayCapabilityGate>} />
      <Route path="defects/*" element={<RailwayCapabilityGate capability="inspectionEnabled" permission={railwayPermissions.DEFECTS_READ}><InspectionWorkspace defects /></RailwayCapabilityGate>} />
      <Route path="maintenance/*" element={<RailwayCapabilityGate capability="maintenanceEnabled" permission={railwayPermissions.MAINTENANCE_READ}><MaintenanceDashboard /></RailwayCapabilityGate>} />
      <Route path="crowd" element={<RailwayCapabilityGate capability="crowdEnabled" permission={railwayPermissions.CROWD_READ}><CrowdCommandCenter /></RailwayCapabilityGate>} />
      <Route path="crowd/station/:stationId" element={<RailwayCapabilityGate capability="crowdEnabled" permission={railwayPermissions.CROWD_READ}><CrowdStationView /></RailwayCapabilityGate>} />
      <Route path="crowd/analytics" element={<RailwayCapabilityGate capability="crowdEnabled" permission={railwayPermissions.CROWD_READ}><CrowdAnalytics /></RailwayCapabilityGate>} />
      <Route path="crowd/imports" element={<RailwayCapabilityGate capability="crowdEnabled" permission={railwayPermissions.CROWD_INGEST}><CrowdImports /></RailwayCapabilityGate>} />
      <Route path="*" element={<Navigate to="/railway" replace />} />
    </Routes>
  )
}
