import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { isAuthed, api } from './api'
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
import BillingParties from './pages/billing/BillingParties'
import TxnForm from './pages/billing/TxnForm'
import PartyForm from './pages/billing/PartyForm'
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
import VideoCall from './pages/VideoCall'

export default function App() {
  const [authed, setAuthed] = useState(isAuthed())
  const [refreshKey, setRefreshKey] = useState(0)

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
      <Routes key={refreshKey}>
        <Route element={<Layout />}>
          <Route path="/" element={<Assistant />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/billing" element={<BillingHome />} />
          <Route path="/billing/parties" element={<BillingParties />} />
          <Route path="/billing/sale" element={<TxnForm />} />
          <Route path="/billing/party" element={<PartyForm />} />
          <Route path="/billing/items" element={<Catalog />} />
          <Route path="/billing/cashbank" element={<CashBank />} />
          <Route path="/billing/settings" element={<BillingSettings />} />

          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<Workspace />} />
          <Route path="/projects/:id/party" element={<ProjectParty />} />
          <Route path="/projects/:id/tasks" element={<ProjectTasks />} />
          <Route path="/projects/:id/txn" element={<ProjectTxn />} />
          <Route path="/projects/:id/site" element={<ProjectSite />} />
          <Route path="/projects/:id/attendance" element={<ProjectAttendance />} />
          <Route path="/projects/:id/material" element={<ProjectMaterial />} />
          <Route path="/projects/:id/mom" element={<ProjectMom />} />
          <Route path="/projects/:id/design" element={<ProjectDesign />} />
          <Route path="/projects/:id/files" element={<ProjectFiles />} />
          <Route path="/projects/:id/payroll" element={<ProjectPayroll />} />
          <Route path="/map" element={<ProjectsMap />} />
          <Route path="/vision" element={<VisionProgress />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/video" element={<VideoCall />} />
          <Route path="/users" element={<Users />} />

          <Route path="/plans" element={<Plans />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}