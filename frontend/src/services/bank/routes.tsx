import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Home = lazy(() => import('./BankHome'))
const Accounts = lazy(() => import('./BankAccounts'))
const AccountDetail = lazy(() => import('./BankAccountDetail'))
const Transactions = lazy(() => import('./BankTransactions'))
const Transfers = lazy(() => import('./BankTransfers'))
const Beneficiaries = lazy(() => import('./BankBeneficiaries'))
const Cards = lazy(() => import('./BankCards'))
const Deposits = lazy(() => import('./BankDeposits'))
const Loans = lazy(() => import('./BankLoans'))
const Statements = lazy(() => import('./BankStatements'))
const Bills = lazy(() => import('./BankBills'))
const Notifications = lazy(() => import('./BankNotifications'))
const Documents = lazy(() => import('./BankDocuments'))
const Profile = lazy(() => import('./BankProfile'))
const Admin = lazy(() => import('./BankAdmin'))

export default function BankRoutes() {
  return <Routes>
    <Route index element={<Home />} />
    <Route path="accounts" element={<Accounts />} />
    <Route path="accounts/:accountId" element={<AccountDetail />} />
    <Route path="transactions" element={<Transactions />} />
    <Route path="transfers" element={<Transfers />} />
    <Route path="beneficiaries" element={<Beneficiaries />} />
    <Route path="cards" element={<Cards />} />
    <Route path="deposits" element={<Deposits />} />
    <Route path="loans" element={<Loans />} />
    <Route path="statements" element={<Statements />} />
    <Route path="bills" element={<Bills />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="documents" element={<Documents />} />
    <Route path="profile" element={<Profile />} />
    <Route path="admin" element={<Admin />} />
    <Route path="*" element={<Navigate to="/bank" replace />} />
  </Routes>
}
