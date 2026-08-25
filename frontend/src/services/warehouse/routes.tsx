import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const WarehouseHome = lazy(() => import('./WarehouseHome'))
const WarehouseInventory = lazy(() => import('./WarehouseInventory'))
const WarehousePurchaseOrders = lazy(() => import('./WarehousePurchaseOrders'))
const WarehouseGrn = lazy(() => import('./WarehouseGrn'))
const WarehouseSuppliers = lazy(() => import('./WarehouseSuppliers'))
const WarehouseStaff = lazy(() => import('./WarehouseStaff'))
const WarehouseProjects = lazy(() => import('./WarehouseProjects'))
const WarehouseProjectWorkspace = lazy(() => import('./WarehouseProjectWorkspace'))
const WarehouseProjectAttendance = lazy(() => import('./WarehouseProjectAttendance'))
const WarehouseProjectsMap = lazy(() => import('./WarehouseProjectsMap'))
const WarehouseModules = lazy(() => import('./WarehouseModules'))
const WarehouseProducts = lazy(() => import('./WarehouseProducts'))
const WarehouseCustomers = lazy(() => import('./WarehouseCustomers'))
const WarehouseWarehouses = lazy(() => import('./WarehouseWarehouses'))
const WarehouseTransfers = lazy(() => import('./WarehouseTransfers'))
const WarehouseOrders = lazy(() => import('./WarehouseOrders'))
const WarehousePicking = lazy(() => import('./WarehousePicking'))
const WarehousePacking = lazy(() => import('./WarehousePacking'))
const WarehouseDispatch = lazy(() => import('./WarehouseDispatch'))
const WarehouseReturns = lazy(() => import('./WarehouseReturns'))
const WarehouseStockCount = lazy(() => import('./WarehouseStockCount'))
const WarehouseNotifications = lazy(() => import('./pages/WarehouseNotifications'))

export default function WarehouseRoutes() {
  return (
    <Routes>
      <Route index element={<WarehouseHome />} />
      <Route path="dashboard" element={<WarehouseHome />} />
      <Route path="inventory" element={<WarehouseInventory />} />
      <Route path="purchase-orders" element={<WarehousePurchaseOrders />} />
      <Route path="grn" element={<WarehouseGrn />} />
      <Route path="suppliers" element={<WarehouseSuppliers />} />
      <Route path="staff" element={<WarehouseStaff />} />
      <Route path="projects" element={<WarehouseProjects />} />
      <Route path="projects/:id" element={<WarehouseProjectWorkspace />} />
      <Route path="projects/:id/attendance" element={<WarehouseProjectAttendance />} />
      <Route path="map" element={<WarehouseProjectsMap />} />
      <Route path="modules" element={<WarehouseModules />} />
      <Route path="products" element={<WarehouseProducts />} />
      <Route path="customers" element={<WarehouseCustomers />} />
      <Route path="warehouses" element={<WarehouseWarehouses />} />
      <Route path="transfers" element={<WarehouseTransfers />} />
      <Route path="orders" element={<WarehouseOrders />} />
      <Route path="picking" element={<WarehousePicking />} />
      <Route path="packing" element={<WarehousePacking />} />
      <Route path="dispatch" element={<WarehouseDispatch />} />
      <Route path="returns" element={<WarehouseReturns />} />
      <Route path="stock-count" element={<WarehouseStockCount />} />
      <Route path="notifications" element={<WarehouseNotifications />} />
      <Route path="*" element={<Navigate to="/warehouse/dashboard" replace />} />
    </Routes>
  )
}
