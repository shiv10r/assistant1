import { Navigate, Route, Routes } from 'react-router-dom'
import RailwayWorkspace from './RailwayWorkspace'
import MaintenanceDashboard from './maintenance/MaintenanceDashboard'
import CrowdCommandCenter from './crowd/CrowdCommandCenter'
import RailwayCapabilityGate from './shared/RailwayCapabilityGate'
import { railwayPermissions } from './shared/railwayPermissions'

function UnavailableCapability({ name }: { name: string }) {
  return <div role="status">{name} is registered but is not available in this release candidate.</div>
}

export default function RailwayRoutes() {
  return (
    <Routes>
      <Route index element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="overview" /></RailwayCapabilityGate>} />
      <Route path="routes" element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="routes" /></RailwayCapabilityGate>} />
      <Route path="stations" element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="stations" /></RailwayCapabilityGate>} />
      <Route path="fleet" element={<RailwayCapabilityGate capability="railwayEnabled"><RailwayWorkspace view="fleet" /></RailwayCapabilityGate>} />
      <Route path="inspections/*" element={<RailwayCapabilityGate capability="inspectionEnabled" permission={railwayPermissions.INSPECTIONS_READ}><UnavailableCapability name="Inspection workspace" /></RailwayCapabilityGate>} />
      <Route path="defects/*" element={<RailwayCapabilityGate capability="inspectionEnabled" permission={railwayPermissions.DEFECTS_READ}><UnavailableCapability name="Defect register" /></RailwayCapabilityGate>} />
      <Route path="maintenance/*" element={<RailwayCapabilityGate capability="maintenanceEnabled" permission={railwayPermissions.MAINTENANCE_READ}><MaintenanceDashboard /></RailwayCapabilityGate>} />
      <Route path="crowd/*" element={<RailwayCapabilityGate capability="crowdEnabled" permission={railwayPermissions.CROWD_READ}><CrowdCommandCenter /></RailwayCapabilityGate>} />
      <Route path="*" element={<Navigate to="/railway" replace />} />
    </Routes>
  )
}
