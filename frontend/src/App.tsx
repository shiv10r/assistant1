import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Plans from './pages/Plans'
import Account from './pages/Account'
import BillingHome from './pages/billing/BillingHome'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Assistant />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/billing" element={<BillingHome />} />
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

          <Route path="/plans" element={<Plans />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}