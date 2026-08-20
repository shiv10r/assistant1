import { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isAuthed, api } from './api'
import {
  Account, Activity, Analytics, Assistant, Backup, BillingHome, BillingSettings, Broadcast,
  CashBank, Catalog, Dashboard, Insights, Integrations, Plans, Reports, Settings, TxnForm, Users,
  VideoCall, InteriorDesignDetails, InteriorDesigns, InteriorGenerate, InteriorHome,
  InteriorProducts, InteriorProjectDetails, InteriorProjects, InteriorQuotation, InteriorRoomDetails,
  WarehouseCustomers, WarehouseDispatch, WarehouseGrn, WarehouseHome, WarehouseInventory,
  WarehouseModules, WarehouseOrders, WarehousePacking, WarehousePicking, WarehouseProducts,
  WarehouseProjectAttendance, WarehouseProjects, WarehouseProjectsMap, WarehouseProjectWorkspace,
  WarehousePurchaseOrders, WarehouseReturns, WarehouseStaff, WarehouseStockCount,
  WarehouseSuppliers, WarehouseTransfers, WarehouseWarehouses, SchoolAdmissions, SchoolAssets,
  SchoolAttendance, SchoolAttendanceAnalytics, SchoolAuditLog, SchoolCafeteria, SchoolCertificates,
  SchoolClasses, SchoolClubs, SchoolCounselling, SchoolDirectory, SchoolDiscipline, SchoolDocuments,
  SchoolEvents, SchoolExams, SchoolExpenses, SchoolFeeStructure, SchoolFees, SchoolGrievances,
  SchoolHelpdesk, SchoolHomework, SchoolHome, SchoolHostel, SchoolHouses, SchoolIncidents,
  SchoolInventory, SchoolLeave, SchoolLibrary, SchoolLMS, SchoolMessaging, SchoolNotices,
  SchoolNotifications, SchoolOnlineExams, SchoolParents, SchoolPayroll, SchoolPerformance,
  SchoolProcurement, SchoolProjects, SchoolPTM, SchoolQuestionBank, SchoolReceipts,
  SchoolRecruitment, SchoolResults, SchoolSessions, SchoolSettings, SchoolSports, SchoolStaff,
  SchoolStudents, SchoolSubjects, SchoolSurveys, SchoolTasks, SchoolTimetable, SchoolTraining,
  SchoolTransport, SchoolUsers, SchoolVisitors, HotelGuests, HotelHome, HotelHousekeeping,
  HotelReservations, HotelRooms, TravelCustomize, TravelDestinations, TravelGroupTrips,
  TravelHome, TravelMyTrips, TravelPackages, NewsArticle, NewsBookmarks, NewsCategory, NewsHome,
  NewsLatest, NewsSearch, NewsTrending,
  CompanyDetail, JobDetail, JobsApplications, JobsCompanies, JobsHome, JobsSaved, JobsSearch,
  CandidateProfile, JobApplicationFlow,
  CommerceBrands, CommerceCart, CommerceCategories, CommerceCheckout, CommerceHome,
  CommerceOffers, CommerceProductDetail, CommerceProducts, CommerceSearch, CommerceWishlist,
  BankAccountDetail, BankAccounts, BankAdmin, BankBeneficiaries, BankBills, BankCards,
  BankDeposits, BankDocuments, BankHome, BankLoans, BankNotifications, BankProfile,
  BankStatements, BankTransfers, BankTransactions,
  MedicalAdmin, MedicalAppointments, MedicalBilling, MedicalDoctors, MedicalHome,
  MedicalLabs, MedicalNotifications, MedicalPatientDetail, MedicalPatients,
  MedicalPrescriptions, MedicalRecords,
  HomeServicesHome, HomeServicesCategories, HomeServicesCategoryDetail, HomeServicesServiceDetail,
  HomeServicesSearch, HomeServicesBookingFlow, HomeServicesBookings, HomeServicesBookingDetail,
  HomeServicesOffers, HomeServicesAccount, HomeServicesProDashboard, HomeServicesProRequests,
  HomeServicesProJobs, HomeServicesProJobDetail, HomeServicesProEarnings, HomeServicesProProfile,
  HomeServicesAdminDashboard, HomeServicesAdminLiveOps, HomeServicesAdminBookings,
  HomeServicesAdminProfessionals, HomeServicesAdminFinance,
  HomeServicesDatabaseCheck, HomeServicesAddCategory,
  Layout, Login, ServiceChooser,
} from './routes/lazyRoutes'

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
    useEffect(() => {
      void import('./firebase').then(({ logPageView }) => logPageView(location.pathname))
    }, [location.pathname])
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

  if (!authed) {
    return (
      <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center text-sm text-muted" role="status">Loading sign in...</div>}>
        <Login onAuthed={() => setAuthed(true)} />
      </Suspense>
    )
  }

  return (
    <BrowserRouter>
      <PageTracker />
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-muted" role="status">Loading workspace...</div>}>
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

          <Route path="/hotel" element={<HotelHome />} />
          <Route path="/hotel/dashboard" element={<HotelHome />} />
          <Route path="/hotel/reservations" element={<HotelReservations />} />
          <Route path="/hotel/rooms" element={<HotelRooms />} />
          <Route path="/hotel/guests" element={<HotelGuests />} />
          <Route path="/hotel/housekeeping" element={<HotelHousekeeping />} />

          <Route path="/travel" element={<TravelHome />} />
          <Route path="/travel/destinations" element={<TravelDestinations />} />
          <Route path="/travel/packages" element={<TravelPackages />} />
          <Route path="/travel/group-trips" element={<TravelGroupTrips />} />
          <Route path="/travel/customize" element={<TravelCustomize />} />
          <Route path="/travel/my-trips" element={<TravelMyTrips />} />

          <Route path="/news" element={<NewsHome />} />
          <Route path="/news/latest" element={<NewsLatest />} />
          <Route path="/news/trending" element={<NewsTrending />} />
          <Route path="/news/search" element={<NewsSearch />} />
          <Route path="/news/bookmarks" element={<NewsBookmarks />} />
          <Route path="/news/category/:categorySlug" element={<NewsCategory />} />
          <Route path="/news/:slug" element={<NewsArticle />} />

          <Route path="/jobs" element={<JobsHome />} />
          <Route path="/jobs/search" element={<JobsSearch />} />
          <Route path="/jobs/companies" element={<JobsCompanies />} />
          <Route path="/jobs/companies/:companySlug" element={<CompanyDetail />} />
<Route path="/jobs/applications" element={<JobsApplications />} />
          <Route path="/jobs/saved" element={<JobsSaved />} />
          <Route path="/jobs/profile" element={<CandidateProfile />} />
          <Route path="/jobs/:slug/apply" element={<JobApplicationFlow />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />

          <Route path="/commerce" element={<CommerceHome />} />
          <Route path="/commerce/categories" element={<CommerceCategories />} />
          <Route path="/commerce/products" element={<CommerceProducts />} />
          <Route path="/commerce/product/:slug" element={<CommerceProductDetail />} />
          <Route path="/commerce/cart" element={<CommerceCart />} />
          <Route path="/commerce/checkout" element={<CommerceCheckout />} />
          <Route path="/commerce/wishlist" element={<CommerceWishlist />} />
          <Route path="/commerce/offers" element={<CommerceOffers />} />
          <Route path="/commerce/brands" element={<CommerceBrands />} />
          <Route path="/commerce/search" element={<CommerceSearch />} />

          <Route path="/bank" element={<BankHome />} />
          <Route path="/bank/accounts" element={<BankAccounts />} />
          <Route path="/bank/accounts/:accountId" element={<BankAccountDetail />} />
          <Route path="/bank/transactions" element={<BankTransactions />} />
          <Route path="/bank/transfers" element={<BankTransfers />} />
          <Route path="/bank/beneficiaries" element={<BankBeneficiaries />} />
          <Route path="/bank/cards" element={<BankCards />} />
          <Route path="/bank/deposits" element={<BankDeposits />} />
          <Route path="/bank/loans" element={<BankLoans />} />
          <Route path="/bank/statements" element={<BankStatements />} />
          <Route path="/bank/bills" element={<BankBills />} />
          <Route path="/bank/notifications" element={<BankNotifications />} />
          <Route path="/bank/documents" element={<BankDocuments />} />
          <Route path="/bank/profile" element={<BankProfile />} />
          <Route path="/bank/admin" element={<BankAdmin />} />

          <Route path="/medical" element={<MedicalHome />} />
          <Route path="/medical/doctors" element={<MedicalDoctors />} />
          <Route path="/medical/appointments" element={<MedicalAppointments />} />
          <Route path="/medical/patients" element={<MedicalPatients />} />
          <Route path="/medical/patients/:patientId" element={<MedicalPatientDetail />} />
          <Route path="/medical/prescriptions" element={<MedicalPrescriptions />} />
          <Route path="/medical/labs" element={<MedicalLabs />} />
          <Route path="/medical/billing" element={<MedicalBilling />} />
          <Route path="/medical/records" element={<MedicalRecords />} />
          <Route path="/medical/notifications" element={<MedicalNotifications />} />
<Route path="/medical/admin" element={<MedicalAdmin />} />

          {/* Home Services service */}
          <Route path="/home-services" element={<HomeServicesHome />} />
          <Route path="/home-services/categories" element={<HomeServicesCategories />} />
          <Route path="/home-services/categories/:slug" element={<HomeServicesCategoryDetail />} />
          <Route path="/home-services/services/:slug" element={<HomeServicesServiceDetail />} />
          <Route path="/home-services/search" element={<HomeServicesSearch />} />
          <Route path="/home-services/book" element={<HomeServicesBookingFlow />} />
          <Route path="/home-services/bookings" element={<HomeServicesBookings />} />
          <Route path="/home-services/bookings/:bookingId" element={<HomeServicesBookingDetail />} />
          <Route path="/home-services/offers" element={<HomeServicesOffers />} />
          <Route path="/home-services/account" element={<HomeServicesAccount />} />
          <Route path="/home-services/pro" element={<HomeServicesProDashboard />} />
          <Route path="/home-services/pro/requests" element={<HomeServicesProRequests />} />
          <Route path="/home-services/pro/jobs" element={<HomeServicesProJobs />} />
          <Route path="/home-services/pro/jobs/:jobId" element={<HomeServicesProJobDetail />} />
          <Route path="/home-services/pro/earnings" element={<HomeServicesProEarnings />} />
          <Route path="/home-services/pro/profile" element={<HomeServicesProProfile />} />
          <Route path="/home-services/admin" element={<HomeServicesAdminDashboard />} />
          <Route path="/home-services/admin/live" element={<HomeServicesAdminLiveOps />} />
          <Route path="/home-services/admin/bookings" element={<HomeServicesAdminBookings />} />
          <Route path="/home-services/admin/professionals" element={<HomeServicesAdminProfessionals />} />
          <Route path="/home-services/admin/finance" element={<HomeServicesAdminFinance />} />
          <Route path="/home-services/database-check" element={<HomeServicesDatabaseCheck />} />
          <Route path="/home-services/categories/add" element={<HomeServicesAddCategory />} />

          {/* Interior service */}
          <Route path="/interior" element={<InteriorHome />} />
          <Route path="/interior/dashboard" element={<InteriorHome />} />
          <Route path="/interior/projects" element={<InteriorProjects />} />
          <Route path="/interior/projects/:id" element={<InteriorProjectDetails />} />
          <Route path="/interior/projects/:id/rooms/:roomId" element={<InteriorRoomDetails />} />
          <Route path="/interior/projects/:id/generate" element={<InteriorGenerate />} />
          <Route path="/interior/projects/:id/designs" element={<InteriorDesigns />} />
          <Route path="/interior/projects/:id/designs/:designId" element={<InteriorDesignDetails />} />
          <Route path="/interior/projects/:id/quotation" element={<InteriorQuotation />} />
          <Route path="/interior/products" element={<InteriorProducts />} />

          {/* Backward-compat redirects from old top-level paths to their service */}
          <Route path="/projects/*" element={<Redirect to="/interior/projects" />} />
          <Route path="/map" element={<Navigate to="/interior/dashboard" replace />} />
          <Route path="/vision" element={<Navigate to="/interior/dashboard" replace />} />
          <Route path="/modules" element={<Navigate to="/interior/dashboard" replace />} />

          {/* Unknown paths → chooser */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
