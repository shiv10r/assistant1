import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Billing from './pages/Billing'
import Projects from './pages/Projects'
import Plans from './pages/Plans'
import Account from './pages/Account'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Assistant />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}