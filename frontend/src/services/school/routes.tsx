import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const SchoolHome = lazy(() => import('./SchoolHome'))
const SchoolStudents = lazy(() => import('./SchoolStudents'))
const SchoolClasses = lazy(() => import('./SchoolClasses'))
const SchoolFees = lazy(() => import('./SchoolFees'))
const SchoolAttendance = lazy(() => import('./SchoolAttendance'))
const SchoolInventory = lazy(() => import('./SchoolInventory'))
const SchoolStaff = lazy(() => import('./SchoolStaff'))
const SchoolProjects = lazy(() => import('./SchoolProjects'))
const SchoolParents = lazy(() => import('./SchoolParents'))
const SchoolAdmissions = lazy(() => import('./SchoolAdmissions'))
const SchoolDirectory = lazy(() => import('./SchoolDirectory'))
const SchoolSessions = lazy(() => import('./SchoolSessions'))
const SchoolSubjects = lazy(() => import('./SchoolSubjects'))
const SchoolTimetable = lazy(() => import('./SchoolTimetable'))
const SchoolHomework = lazy(() => import('./SchoolHomework'))
const SchoolLMS = lazy(() => import('./SchoolLMS'))
const SchoolQuestionBank = lazy(() => import('./SchoolQuestionBank'))
const SchoolExams = lazy(() => import('./SchoolExams'))
const SchoolResults = lazy(() => import('./SchoolResults'))
const SchoolOnlineExams = lazy(() => import('./SchoolOnlineExams'))
const SchoolLeave = lazy(() => import('./SchoolLeave'))
const SchoolAttendanceAnalytics = lazy(() => import('./SchoolAttendanceAnalytics'))
const SchoolRecruitment = lazy(() => import('./SchoolRecruitment'))
const SchoolPerformance = lazy(() => import('./SchoolPerformance'))
const SchoolTraining = lazy(() => import('./SchoolTraining'))
const SchoolFeeStructure = lazy(() => import('./SchoolFeeStructure'))
const SchoolReceipts = lazy(() => import('./SchoolReceipts'))
const SchoolExpenses = lazy(() => import('./SchoolExpenses'))
const SchoolPayroll = lazy(() => import('./SchoolPayroll'))
const SchoolTransport = lazy(() => import('./SchoolTransport'))
const SchoolLibrary = lazy(() => import('./SchoolLibrary'))
const SchoolProcurement = lazy(() => import('./SchoolProcurement'))
const SchoolAssets = lazy(() => import('./SchoolAssets'))
const SchoolVisitors = lazy(() => import('./SchoolVisitors'))
const SchoolHostel = lazy(() => import('./SchoolHostel'))
const SchoolCafeteria = lazy(() => import('./SchoolCafeteria'))
const SchoolClubs = lazy(() => import('./SchoolClubs'))
const SchoolSports = lazy(() => import('./SchoolSports'))
const SchoolHouses = lazy(() => import('./SchoolHouses'))
const SchoolDiscipline = lazy(() => import('./SchoolDiscipline'))
const SchoolCounselling = lazy(() => import('./SchoolCounselling'))
const SchoolNotices = lazy(() => import('./SchoolNotices'))
const SchoolEvents = lazy(() => import('./SchoolEvents'))
const SchoolMessaging = lazy(() => import('./SchoolMessaging'))
const SchoolNotifications = lazy(() => import('./SchoolNotifications'))
const SchoolPTM = lazy(() => import('./SchoolPTM'))
const SchoolSurveys = lazy(() => import('./SchoolSurveys'))
const SchoolDocuments = lazy(() => import('./SchoolDocuments'))
const SchoolCertificates = lazy(() => import('./SchoolCertificates'))
const SchoolHelpdesk = lazy(() => import('./SchoolHelpdesk'))
const SchoolGrievances = lazy(() => import('./SchoolGrievances'))
const SchoolIncidents = lazy(() => import('./SchoolIncidents'))
const SchoolTasks = lazy(() => import('./SchoolTasks'))
const SchoolUsers = lazy(() => import('./SchoolUsers'))
const SchoolAuditLog = lazy(() => import('./SchoolAuditLog'))
const SchoolSettings = lazy(() => import('./SchoolSettings'))

export default function SchoolRoutes() {
  return (
    <Routes>
      <Route index element={<SchoolHome />} />
      <Route path="students" element={<SchoolStudents />} />
      <Route path="classes" element={<SchoolClasses />} />
      <Route path="fees" element={<SchoolFees />} />
      <Route path="attendance" element={<SchoolAttendance />} />
      <Route path="inventory" element={<SchoolInventory />} />
      <Route path="staff" element={<SchoolStaff />} />
      <Route path="projects" element={<SchoolProjects />} />
      <Route path="parents" element={<SchoolParents />} />
      <Route path="admissions" element={<SchoolAdmissions />} />
      <Route path="directory" element={<SchoolDirectory />} />
      <Route path="sessions" element={<SchoolSessions />} />
      <Route path="subjects" element={<SchoolSubjects />} />
      <Route path="timetable" element={<SchoolTimetable />} />
      <Route path="homework" element={<SchoolHomework />} />
      <Route path="lms" element={<SchoolLMS />} />
      <Route path="questions" element={<SchoolQuestionBank />} />
      <Route path="exams" element={<SchoolExams />} />
      <Route path="results" element={<SchoolResults />} />
      <Route path="online-exams" element={<SchoolOnlineExams />} />
      <Route path="leave" element={<SchoolLeave />} />
      <Route path="attendance-analytics" element={<SchoolAttendanceAnalytics />} />
      <Route path="recruitment" element={<SchoolRecruitment />} />
      <Route path="performance" element={<SchoolPerformance />} />
      <Route path="training" element={<SchoolTraining />} />
      <Route path="fee-structure" element={<SchoolFeeStructure />} />
      <Route path="receipts" element={<SchoolReceipts />} />
      <Route path="expenses" element={<SchoolExpenses />} />
      <Route path="payroll" element={<SchoolPayroll />} />
      <Route path="transport" element={<SchoolTransport />} />
      <Route path="library" element={<SchoolLibrary />} />
      <Route path="procurement" element={<SchoolProcurement />} />
      <Route path="assets" element={<SchoolAssets />} />
      <Route path="visitors" element={<SchoolVisitors />} />
      <Route path="hostel" element={<SchoolHostel />} />
      <Route path="cafeteria" element={<SchoolCafeteria />} />
      <Route path="clubs" element={<SchoolClubs />} />
      <Route path="sports" element={<SchoolSports />} />
      <Route path="houses" element={<SchoolHouses />} />
      <Route path="discipline" element={<SchoolDiscipline />} />
      <Route path="counselling" element={<SchoolCounselling />} />
      <Route path="notices" element={<SchoolNotices />} />
      <Route path="events" element={<SchoolEvents />} />
      <Route path="messaging" element={<SchoolMessaging />} />
      <Route path="notifications" element={<SchoolNotifications />} />
      <Route path="ptm" element={<SchoolPTM />} />
      <Route path="surveys" element={<SchoolSurveys />} />
      <Route path="documents" element={<SchoolDocuments />} />
      <Route path="certificates" element={<SchoolCertificates />} />
      <Route path="helpdesk" element={<SchoolHelpdesk />} />
      <Route path="grievances" element={<SchoolGrievances />} />
      <Route path="incidents" element={<SchoolIncidents />} />
      <Route path="tasks" element={<SchoolTasks />} />
      <Route path="users" element={<SchoolUsers />} />
      <Route path="audit" element={<SchoolAuditLog />} />
      <Route path="settings" element={<SchoolSettings />} />
      <Route path="*" element={<Navigate to="/school" replace />} />
    </Routes>
  )
}
