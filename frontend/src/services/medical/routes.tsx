import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./pages/MedicalHome'))
const Doctors = lazy(() => import('./pages/MedicalDoctors'))
const Appointments = lazy(() => import('./pages/MedicalAppointments'))
const Patients = lazy(() => import('./pages/MedicalPatients'))
const PatientDetail = lazy(() => import('./pages/MedicalPatientDetail'))
const Prescriptions = lazy(() => import('./pages/MedicalPrescriptions'))
const Labs = lazy(() => import('./pages/MedicalLabs'))
const Billing = lazy(() => import('./pages/MedicalBilling'))
const Records = lazy(() => import('./pages/MedicalRecords'))
const Notifications = lazy(() => import('./pages/MedicalNotifications'))
const Admin = lazy(() => import('./pages/MedicalAdmin'))

export default function MedicalRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="doctors" element={<Doctors />} />
    <Route path="appointments" element={<Appointments />} />
    <Route path="patients" element={<Patients />} />
    <Route path="patients/:patientId" element={<PatientDetail />} />
    <Route path="prescriptions" element={<Prescriptions />} />
    <Route path="labs" element={<Labs />} />
    <Route path="billing" element={<Billing />} />
    <Route path="records" element={<Records />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="admin" element={<Admin />} />
    <Route path="*" element={<Navigate to="/medical" replace />} />
  </Routes>
}
