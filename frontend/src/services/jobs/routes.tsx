import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./JobsHome'))
const Search = lazy(() => import('./JobsSearch'))
const Companies = lazy(() => import('./JobsCompanies'))
const CompanyDetail = lazy(() => import('./CompanyDetail'))
const Applications = lazy(() => import('./JobsApplications'))
const Saved = lazy(() => import('./JobsSaved'))
const Profile = lazy(() => import('./CandidateProfile'))
const ApplicationFlow = lazy(() => import('./JobApplicationFlow'))
const JobDetail = lazy(() => import('./JobDetail'))
const JobsNotifications = lazy(() => import('./pages/JobsNotifications'))

export default function JobsRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="search" element={<Search />} />
    <Route path="companies" element={<Companies />} />
    <Route path="companies/:companySlug" element={<CompanyDetail />} />
    <Route path="applications" element={<Applications />} />
    <Route path="saved" element={<Saved />} />
    <Route path="profile" element={<Profile />} />
    <Route path="notifications" element={<JobsNotifications />} />
    <Route path=":slug/apply" element={<ApplicationFlow />} />
    <Route path=":slug" element={<JobDetail />} />
    <Route path="*" element={<Navigate to="/jobs" replace />} />
  </Routes>
}
