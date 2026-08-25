import { Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isAuthed } from './platform/auth'
import { PermissionGate } from './platform/ui'
import {
  Account, Activity, Analytics, Assistant, BillingHome, BillingSettings, Broadcast,
  CashBank, Catalog, Dashboard, Insights, Integrations, Plans, Reports, Settings, TxnForm, Users,
  VideoCall, InteriorRoutes, WarehouseRoutes, SchoolRoutes, HotelRoutes, TravelRoutes, NewsRoutes,
  JobsRoutes, CommerceRoutes, BankRoutes, MedicalRoutes, HomeServicesRoutes, RailwayRoutes, OperationsWorkspace,
  Layout, Login, ServiceChooser,
} from './routes/lazyRoutes'

/** Redirect old top-level paths to their owning service so nothing breaks. */
function Redirect({ to }: { to: string }) {
  const location = useLocation()
  const rest = location.pathname.replace(/^\/([^/]+)/, '')
  return <Navigate to={`${to}${rest}`} replace />
}

function AdminOnly({ children }: { children: ReactNode }) {
  return <PermissionGate allowedRoles={['admin']} fallback={<Navigate to="/dashboard" replace />}>{children}</PermissionGate>
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthed())

  function PageTracker() {
    const location = useLocation()
    useEffect(() => {
      void import('./firebase').then(({ logPageView }) => logPageView(location.pathname))
    }, [location.pathname])
    return null
  }

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
        <Routes>
        {/* Service chooser — the hub landing after login */}
        <Route path="/" element={<ServiceChooser />} />

        <Route element={<Layout />}>
          {/* Common pages (available to all services) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<AdminOnly><Settings /></AdminOnly>} />

          <Route path="/billing" element={<BillingHome />} />
          <Route path="/billing/sale" element={<TxnForm />} />
          <Route path="/billing/items" element={<Catalog />} />
          <Route path="/billing/cashbank" element={<CashBank />} />
          <Route path="/billing/settings" element={<AdminOnly><BillingSettings /></AdminOnly>} />

          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/integrations" element={<AdminOnly><Integrations /></AdminOnly>} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/users" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="/plans" element={<AdminOnly><Plans /></AdminOnly>} />
          <Route path="/account" element={<Account />} />
          <Route path="/video" element={<VideoCall />} />
          <Route path="/:service/operations/:view?" element={<OperationsWorkspace />} />

          {/* Warehouse service: module-owned route bundle */}
          <Route path="/warehouse/*" element={<WarehouseRoutes />} />

          {/* School service: module-owned route bundle */}
          <Route path="/school/*" element={<SchoolRoutes />} />
          <Route path="/railway/*" element={<RailwayRoutes />} />

          <Route path="/hotel/*" element={<HotelRoutes />} />
          <Route path="/travel/*" element={<TravelRoutes />} />
          <Route path="/news/*" element={<NewsRoutes />} />
          <Route path="/jobs/*" element={<JobsRoutes />} />
          <Route path="/commerce/*" element={<CommerceRoutes />} />
          <Route path="/bank/*" element={<BankRoutes />} />
          <Route path="/medical/*" element={<MedicalRoutes />} />
          <Route path="/home-services/*" element={<HomeServicesRoutes />} />

          {/* Interior service: module-owned route bundle */}
          <Route path="/interior/*" element={<InteriorRoutes />} />

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
