import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isAuthed, api } from './api'
import { logPageView } from './firebase'
import Layout from './Layout'
import Login from './pages/Login'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Plans from './pages/Plans'
import Account from './pages/Account'
import Analytics from './pages/Analytics'
import Backup from './pages/Backup'
import Activity from './pages/Activity'
import BillingHome from './pages/billing/BillingHome'
import TxnForm from './pages/billing/TxnForm'
import Catalog from './pages/billing/Catalog'
import CashBank from './pages/billing/CashBank'
import BillingSettings from './pages/billing/BillingSettings'
import ProjectsList from './pages/projects/ProjectsList'
import Workspace from './pages/projects/Workspace'
import ProjectParty from './pages/projects/ProjectParty'
import ProjectTasks from './pages/projects/ProjectTasks'
import ProjectTxn from './pages/projects/ProjectTxn'
import ProjectSite from './pages/projects/ProjectSite'
import ProjectAttendance from './pages/projects/ProjectAttendance'
import ProjectMaterial from './pages/projects/ProjectMaterial'
import ProjectMom from './pages/projects/ProjectMom'
import ProjectDesign from './pages/projects/ProjectDesign'
import ProjectFiles from './pages/projects/ProjectFiles'
import ProjectPayroll from './pages/projects/ProjectPayroll'
import ProjectsMap from './pages/ProjectsMap'
import Users from './pages/Users'
import VisionProgress from './pages/VisionProgress'
import Integrations from './pages/Integrations'
import Insights from './pages/Insights'
import Modules from './pages/Modules'
import Broadcast from './pages/Broadcast'
import VideoCall from './pages/VideoCall'
import ServiceChooser from './common/ServiceChooser'
import InteriorHome from './services/interior/InteriorHome'
import WarehouseHome from './services/warehouse/WarehouseHome'
import WarehouseInventory from './services/warehouse/WarehouseInventory'
import WarehousePurchaseOrders from './services/warehouse/WarehousePurchaseOrders'
import WarehouseGrn from './services/warehouse/WarehouseGrn'
import WarehouseSuppliers from './services/warehouse/WarehouseSuppliers'
import WarehouseStaff from './services/warehouse/WarehouseStaff'
import WarehouseProjects from './services/warehouse/WarehouseProjects'
import WarehouseProjectWorkspace from './services/warehouse/WarehouseProjectWorkspace'
import WarehouseProjectAttendance from './services/warehouse/WarehouseProjectAttendance'
import WarehouseProjectsMap from './services/warehouse/WarehouseProjectsMap'
import WarehouseModules from './services/warehouse/WarehouseModules'
import WarehouseProducts from './services/warehouse/WarehouseProducts'
import WarehouseCustomers from './services/warehouse/WarehouseCustomers'
import WarehouseWarehouses from './services/warehouse/WarehouseWarehouses'
import WarehouseTransfers from './services/warehouse/WarehouseTransfers'
import WarehouseOrders from './services/warehouse/WarehouseOrders'
import WarehousePicking from './services/warehouse/WarehousePicking'
import WarehousePacking from './services/warehouse/WarehousePacking'
import WarehouseDispatch from './services/warehouse/WarehouseDispatch'
import WarehouseReturns from './services/warehouse/WarehouseReturns'
import WarehouseStockCount from './services/warehouse/WarehouseStockCount'
import SchoolHome from './services/school/SchoolHome'
import SchoolStudents from './services/school/SchoolStudents'
import SchoolClasses from './services/school/SchoolClasses'
import SchoolFees from './services/school/SchoolFees'
import SchoolAttendance from './services/school/SchoolAttendance'
import SchoolInventory from './services/school/SchoolInventory'
import SchoolStaff from './services/school/SchoolStaff'
import SchoolProjects from './services/school/SchoolProjects'
import SchoolParents from './services/school/SchoolParents'
import SchoolAdmissions from './services/school/SchoolAdmissions'
import SchoolDirectory from './services/school/SchoolDirectory'
import SchoolSessions from './services/school/SchoolSessions'
import SchoolSubjects from './services/school/SchoolSubjects'
import SchoolTimetable from './services/school/SchoolTimetable'
import SchoolHomework from './services/school/SchoolHomework'
import SchoolLMS from './services/school/SchoolLMS'
import SchoolQuestionBank from './services/school/SchoolQuestionBank'
import SchoolExams from './services/school/SchoolExams'
import SchoolResults from './services/school/SchoolResults'
import SchoolOnlineExams from './services/school/SchoolOnlineExams'
import SchoolLeave from './services/school/SchoolLeave'
import SchoolAttendanceAnalytics from './services/school/SchoolAttendanceAnalytics'
import SchoolRecruitment from './services/school/SchoolRecruitment'
import SchoolPerformance from './services/school/SchoolPerformance'
import SchoolTraining from './services/school/SchoolTraining'
import SchoolFeeStructure from './services/school/SchoolFeeStructure'
import SchoolReceipts from './services/school/SchoolReceipts'
import SchoolExpenses from './services/school/SchoolExpenses'
import SchoolPayroll from './services/school/SchoolPayroll'
import SchoolTransport from './services/school/SchoolTransport'
import SchoolLibrary from './services/school/SchoolLibrary'
import SchoolProcurement from './services/school/SchoolProcurement'
import SchoolAssets from './services/school/SchoolAssets'
import SchoolVisitors from './services/school/SchoolVisitors'
import SchoolHostel from './services/school/SchoolHostel'
import SchoolCafeteria from './services/school/SchoolCafeteria'
import SchoolClubs from './services/school/SchoolClubs'
import SchoolSports from './services/school/SchoolSports'
import SchoolHouses from './services/school/SchoolHouses'
import SchoolDiscipline from './services/school/SchoolDiscipline'
import SchoolCounselling from './services/school/SchoolCounselling'
import SchoolNotices from './services/school/SchoolNotices'
import SchoolEvents from './services/school/SchoolEvents'
import SchoolMessaging from './services/school/SchoolMessaging'
import SchoolNotifications from './services/school/SchoolNotifications'
import SchoolPTM from './services/school/SchoolPTM'
import SchoolSurveys from './services/school/SchoolSurveys'
import SchoolDocuments from './services/school/SchoolDocuments'
import SchoolCertificates from './services/school/SchoolCertificates'
import SchoolHelpdesk from './services/school/SchoolHelpdesk'
import SchoolGrievances from './services/school/SchoolGrievances'
import SchoolIncidents from './services/school/SchoolIncidents'
import SchoolTasks from './services/school/SchoolTasks'
import SchoolUsers from './services/school/SchoolUsers'
import SchoolAuditLog from './services/school/SchoolAuditLog'
import SchoolSettings from './services/school/SchoolSettings'

/** Redirect old top-level paths to their owning service so nothing breaks. */
function Redirect({ to }: { to: string }) {
  const location = useLocation()
  const rest = location.pathname.replace(/^\/([^/]+)/, '')
  return <Navigate to={`${to}${rest}`} replace />
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthed())
  const [refreshKey, setRefreshKey] = useState(0)

  function PageTracker() {
    const location = useLocation()
    useEffect(() => { void logPageView(location.pathname) }, [location.pathname])
    return null
  }

  // Auto-refresh: poll the Firebase data version; when it changes, remount the
  // active page so it re-fetches its data (live updates after data changes).
  useEffect(() => {
    if (!authed) return
    let seen = 0
    let stopped = false
    async function poll() {
      try {
        const v = await api.firebaseVersion()
        if (stopped) return
        if (seen === 0) { seen = v.version }
        else if (v.version !== seen && v.version > 0) { seen = v.version; setRefreshKey((k) => k + 1) }
      } catch { /* firebase disabled / offline — ignore */ }
    }
    poll()
    const t = setInterval(poll, 20000)
    return () => { stopped = true; clearInterval(t) }
  }, [authed])

  if (!authed) return <Login onAuthed={() => setAuthed(true)} />

  return (
    <BrowserRouter>
      <PageTracker />
      <Routes key={refreshKey}>
        {/* Service chooser — the hub landing after login */}
        <Route path="/" element={<ServiceChooser />} />

        <Route element={<Layout />}>
          {/* Common pages (available to all services) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/billing" element={<BillingHome />} />
          <Route path="/billing/sale" element={<TxnForm />} />
          <Route path="/billing/items" element={<Catalog />} />
          <Route path="/billing/cashbank" element={<CashBank />} />
          <Route path="/billing/settings" element={<BillingSettings />} />

          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/users" element={<Users />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/account" element={<Account />} />
          <Route path="/video" element={<VideoCall />} />

          {/* Warehouse service */}
          <Route path="/warehouse" element={<WarehouseHome />} />
          <Route path="/warehouse/dashboard" element={<WarehouseHome />} />
          <Route path="/warehouse/inventory" element={<WarehouseInventory />} />
          <Route path="/warehouse/purchase-orders" element={<WarehousePurchaseOrders />} />
          <Route path="/warehouse/grn" element={<WarehouseGrn />} />
          <Route path="/warehouse/suppliers" element={<WarehouseSuppliers />} />
          <Route path="/warehouse/staff" element={<WarehouseStaff />} />
          <Route path="/warehouse/projects" element={<WarehouseProjects />} />
          <Route path="/warehouse/projects/:id" element={<WarehouseProjectWorkspace />} />
          <Route path="/warehouse/projects/:id/attendance" element={<WarehouseProjectAttendance />} />
          <Route path="/warehouse/map" element={<WarehouseProjectsMap />} />
          <Route path="/warehouse/modules" element={<WarehouseModules />} />
          <Route path="/warehouse/products" element={<WarehouseProducts />} />
          <Route path="/warehouse/customers" element={<WarehouseCustomers />} />
          <Route path="/warehouse/warehouses" element={<WarehouseWarehouses />} />
          <Route path="/warehouse/transfers" element={<WarehouseTransfers />} />
          <Route path="/warehouse/orders" element={<WarehouseOrders />} />
          <Route path="/warehouse/picking" element={<WarehousePicking />} />
          <Route path="/warehouse/packing" element={<WarehousePacking />} />
          <Route path="/warehouse/dispatch" element={<WarehouseDispatch />} />
          <Route path="/warehouse/returns" element={<WarehouseReturns />} />
          <Route path="/warehouse/stock-count" element={<WarehouseStockCount />} />

          {/* School service */}
          <Route path="/school" element={<SchoolHome />} />
          <Route path="/school/students" element={<SchoolStudents />} />
          <Route path="/school/classes" element={<SchoolClasses />} />
          <Route path="/school/fees" element={<SchoolFees />} />
          <Route path="/school/attendance" element={<SchoolAttendance />} />
          <Route path="/school/inventory" element={<SchoolInventory />} />
          <Route path="/school/staff" element={<SchoolStaff />} />
          <Route path="/school/projects" element={<SchoolProjects />} />
          <Route path="/school/parents" element={<SchoolParents />} />
          <Route path="/school/admissions" element={<SchoolAdmissions />} />
          <Route path="/school/directory" element={<SchoolDirectory />} />
          <Route path="/school/sessions" element={<SchoolSessions />} />
          <Route path="/school/subjects" element={<SchoolSubjects />} />
          <Route path="/school/timetable" element={<SchoolTimetable />} />
          <Route path="/school/homework" element={<SchoolHomework />} />
          <Route path="/school/lms" element={<SchoolLMS />} />
          <Route path="/school/questions" element={<SchoolQuestionBank />} />
          <Route path="/school/exams" element={<SchoolExams />} />
          <Route path="/school/results" element={<SchoolResults />} />
          <Route path="/school/online-exams" element={<SchoolOnlineExams />} />
          <Route path="/school/leave" element={<SchoolLeave />} />
          <Route path="/school/attendance-analytics" element={<SchoolAttendanceAnalytics />} />
          <Route path="/school/recruitment" element={<SchoolRecruitment />} />
          <Route path="/school/performance" element={<SchoolPerformance />} />
          <Route path="/school/training" element={<SchoolTraining />} />
          <Route path="/school/fee-structure" element={<SchoolFeeStructure />} />
          <Route path="/school/receipts" element={<SchoolReceipts />} />
          <Route path="/school/expenses" element={<SchoolExpenses />} />
          <Route path="/school/payroll" element={<SchoolPayroll />} />
          <Route path="/school/transport" element={<SchoolTransport />} />
          <Route path="/school/library" element={<SchoolLibrary />} />
          <Route path="/school/procurement" element={<SchoolProcurement />} />
          <Route path="/school/assets" element={<SchoolAssets />} />
          <Route path="/school/visitors" element={<SchoolVisitors />} />
          <Route path="/school/hostel" element={<SchoolHostel />} />
          <Route path="/school/cafeteria" element={<SchoolCafeteria />} />
          <Route path="/school/clubs" element={<SchoolClubs />} />
          <Route path="/school/sports" element={<SchoolSports />} />
          <Route path="/school/houses" element={<SchoolHouses />} />
          <Route path="/school/discipline" element={<SchoolDiscipline />} />
          <Route path="/school/counselling" element={<SchoolCounselling />} />
          <Route path="/school/notices" element={<SchoolNotices />} />
          <Route path="/school/events" element={<SchoolEvents />} />
          <Route path="/school/messaging" element={<SchoolMessaging />} />
          <Route path="/school/notifications" element={<SchoolNotifications />} />
          <Route path="/school/ptm" element={<SchoolPTM />} />
          <Route path="/school/surveys" element={<SchoolSurveys />} />
          <Route path="/school/documents" element={<SchoolDocuments />} />
          <Route path="/school/certificates" element={<SchoolCertificates />} />
          <Route path="/school/helpdesk" element={<SchoolHelpdesk />} />
          <Route path="/school/grievances" element={<SchoolGrievances />} />
          <Route path="/school/incidents" element={<SchoolIncidents />} />
          <Route path="/school/tasks" element={<SchoolTasks />} />
          <Route path="/school/users" element={<SchoolUsers />} />
          <Route path="/school/audit" element={<SchoolAuditLog />} />
          <Route path="/school/settings" element={<SchoolSettings />} />

          {/* Interior service */}
          <Route path="/interior" element={<InteriorHome />} />
          <Route path="/interior/dashboard" element={<InteriorHome />} />
          <Route path="/interior/projects" element={<ProjectsList />} />
          <Route path="/interior/projects/:id" element={<Workspace />} />
          <Route path="/interior/projects/:id/party" element={<ProjectParty />} />
          <Route path="/interior/projects/:id/tasks" element={<ProjectTasks />} />
          <Route path="/interior/projects/:id/txn" element={<ProjectTxn />} />
          <Route path="/interior/projects/:id/site" element={<ProjectSite />} />
          <Route path="/interior/projects/:id/attendance" element={<ProjectAttendance />} />
          <Route path="/interior/projects/:id/material" element={<ProjectMaterial />} />
          <Route path="/interior/projects/:id/mom" element={<ProjectMom />} />
          <Route path="/interior/projects/:id/design" element={<ProjectDesign />} />
          <Route path="/interior/projects/:id/files" element={<ProjectFiles />} />
          <Route path="/interior/projects/:id/payroll" element={<ProjectPayroll />} />
          <Route path="/interior/map" element={<ProjectsMap />} />
          <Route path="/interior/vision" element={<VisionProgress />} />
          <Route path="/interior/modules" element={<Modules />} />

          {/* Backward-compat redirects from old top-level paths to their service */}
          <Route path="/projects/*" element={<Redirect to="/interior/projects" />} />
          <Route path="/map" element={<Navigate to="/interior/map" replace />} />
          <Route path="/vision" element={<Navigate to="/interior/vision" replace />} />
          <Route path="/modules" element={<Navigate to="/interior/modules" replace />} />

          {/* Unknown paths → chooser */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}