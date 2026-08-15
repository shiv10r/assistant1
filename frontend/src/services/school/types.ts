// ── Core roster ────────────────────────────────────────────────────────────
export interface Student {
  id: string
  admissionNo: string
  name: string
  classId: string
  className: string
  guardianName: string
  phone: string
  status: 'active' | 'inactive'
  dob?: string
  gender?: 'Male' | 'Female' | 'Other'
  bloodGroup?: string
  email?: string
  address?: string
  rollNo?: string
}

export interface SchoolClass {
  id: string
  name: string
  section: string
  teacher: string
  capacity: number
  studentCount: number
}

export interface StaffMember {
  id: string
  name: string
  role: string
  phone: string
  status: 'active' | 'inactive'
  lastAttendance?: 'present' | 'absent'
  lastAttendanceDate?: string
  dailyRate?: number
  email?: string
  department?: string
  joinDate?: string
}

// ── People ─────────────────────────────────────────────────────────────────
export interface ParentRecord {
  id: string
  name: string
  phone: string
  email?: string
  occupation?: string
  address?: string
  childIds: string[] // student ids
  status: 'active' | 'inactive'
}

// ── Projects & Inventory ────────────────────────────────────────────────────
export type SchoolProjectStatus = 'planned' | 'active' | 'completed'

export interface SchoolProject {
  id: string
  name: string
  incharge: string
  status: SchoolProjectStatus
  startDate: string
  budget: number
}

export interface StockItem {
  id: string
  sku: string
  name: string
  category: string
  qty: number
  unit: string
  reorderLevel: number
  unitPrice: number
}

// ── Admissions & CRM ───────────────────────────────────────────────────────
export type AdmissionStage = 'lead' | 'contacted' | 'visit' | 'applied' | 'test' | 'approved' | 'paid' | 'enrolled'

export interface AdmissionLead {
  id: string
  studentName: string
  guardianName: string
  phone: string
  email?: string
  grade: string // className, e.g. "Grade 5 - A"
  source: string // referral | website | walk-in | campaign
  stage: AdmissionStage
  followUpDate?: string
  notes?: string
  createdAt: string
}

// ── Academics ──────────────────────────────────────────────────────────────
export interface AcademicSession {
  id: string
  name: string // e.g. "2026-27"
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface Subject {
  id: string
  name: string
  code: string
  classId: string
  className: string
  teacherId: string
  teacherName: string
}

export interface TimetableSlot {
  id: string
  classId: string
  className: string
  day: string // Mon..Sat
  period: number // 1..8
  subject: string
  teacher: string
  room: string
}

export interface Homework {
  id: string
  classId: string
  className: string
  subject: string
  title: string
  description: string
  dueDate: string
  status: 'draft' | 'published'
}

export interface Course {
  id: string
  name: string
  subject: string
  classId: string
  className: string
  description?: string
  status: 'draft' | 'published'
  createdAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  contentType: 'video' | 'document' | 'quiz' | 'link'
  content: string
  durationMin?: number
  order: number
}

// ── Attendance & Leave ─────────────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  className: string
  date: string
  status: AttendanceStatus
}

export interface LeaveRequest {
  id: string
  personType: 'staff' | 'student'
  personId: string
  personName: string
  kind: string
  dateFrom: string
  dateTo: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

// ── Examination ────────────────────────────────────────────────────────────
export type QuestionType = 'mcq' | 'short' | 'long'

export interface Question {
  id: string
  subject: string
  classId: string
  className: string
  type: QuestionType
  difficulty: 'easy' | 'medium' | 'hard'
  text: string
  options?: string[] // for mcq
  answer: string
  marks: number
}

export interface OnlineExam {
  id: string
  name: string
  subject: string
  classId: string
  className: string
  durationMin: number
  totalMarks: number
  questionIds: string[]
  status: 'draft' | 'live' | 'closed'
  scheduledAt?: string
}

export interface TestAttempt {
  id: string
  examId: string
  examName: string
  studentId: string
  studentName: string
  score: number
  totalMarks: number
  submittedAt: string
}

export interface ExamSchedule {
  id: string
  name: string
  classId: string
  className: string
  date: string
  time: string
  subject: string
  status: 'scheduled' | 'completed'
}

export interface MarksEntry {
  id: string
  examId: string
  examName: string
  studentId: string
  studentName: string
  subject: string
  marksObtained: number
  maxMarks: number
}

export interface ResultRecord {
  id: string
  examId: string
  examName: string
  studentId: string
  studentName: string
  className: string
  total: number
  maxTotal: number
  percentage: number
  grade: string
}

// ── Finance ────────────────────────────────────────────────────────────────
export type FeeStatus = 'paid' | 'pending' | 'overdue'

export interface FeeRecord {
  id: string
  studentId: string
  studentName: string
  className: string
  amount: number
  dueDate: string
  status: FeeStatus
  paidDate?: string
}

export interface FeeStructure {
  id: string
  name: string // tuition | transport | lab | library
  className: string
  amount: number
  frequency: 'monthly' | 'quarterly' | 'yearly'
  dueDay: number
}

export interface Receipt {
  id: string
  receiptNo: string
  studentId: string
  studentName: string
  amount: number
  method: 'cash' | 'upi' | 'card' | 'bank'
  date: string
  items: string[]
}

export interface ExpenseRecord {
  id: string
  category: string
  description: string
  amount: number
  paidTo: string
  date: string
  method: 'cash' | 'upi' | 'card' | 'bank'
}

export interface PayrollRecord {
  id: string
  staffId: string
  staffName: string
  month: string // e.g. "2026-08"
  basic: number
  hra: number
  allowances: number
  deductions: number
  net: number
  status: 'draft' | 'processed' | 'paid'
}

// ── HR ─────────────────────────────────────────────────────────────────────
export interface JobOpening {
  id: string
  title: string
  department: string
  openings: number
  experience: string
  status: 'open' | 'closed'
}

export interface Applicant {
  id: string
  jobId: string
  jobTitle: string
  name: string
  phone: string
  email: string
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  appliedOn: string
}

export interface PerformanceReview {
  id: string
  staffId: string
  staffName: string
  period: string // e.g. "Q1 2026"
  rating: number // 1-5
  status: 'pending' | 'completed'
}

export interface TrainingProgram {
  id: string
  name: string
  trainer: string
  date: string
  staffIds: string[]
  status: 'planned' | 'completed'
}

// ── Operations ─────────────────────────────────────────────────────────────
export interface Vehicle {
  id: string
  regNo: string
  type: 'bus' | 'van'
  capacity: number
  driver: string
  route: string
  status: 'active' | 'maintenance'
}

export interface TransportRoute {
  id: string
  name: string
  stops: string[]
  fare: number
  vehicleId: string
}

export interface LibraryBook {
  id: string
  isbn: string
  title: string
  author: string
  category: string
  copies: number
  available: number
}

export interface LibraryIssue {
  id: string
  bookId: string
  bookTitle: string
  memberType: 'student' | 'staff'
  memberId: string
  memberName: string
  issueDate: string
  dueDate: string
  returnDate?: string
}

export interface Vendor {
  id: string
  name: string
  phone: string
  email?: string
  category: string
  gst: string
}

export interface PurchaseOrder {
  id: string
  vendorId: string
  vendorName: string
  items: string
  total: number
  status: 'draft' | 'approved' | 'received'
  date: string
}

export interface AssetRecord {
  id: string
  name: string
  category: string
  tag: string
  purchaseDate: string
  cost: number
  location: string
  status: 'active' | 'maintenance' | 'retired'
}

export interface VisitorLog {
  id: string
  name: string
  phone: string
  purpose: string
  personToMeet: string
  inTime: string
  outTime?: string
  badge: string
}

export interface HostelRoom {
  id: string
  hostel: string
  number: string
  capacity: number
  occupants: number
  type: 'dorm' | 'shared' | 'single'
}

export interface HostelAllocation {
  id: string
  studentId: string
  studentName: string
  roomId: string
  roomNo: string
  hostel: string
  from: string
  status: 'active' | 'vacated'
}

export interface MealPlan {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  items: string
  costPerMeal: number
  status: 'active' | 'inactive'
}

// ── Student Life ───────────────────────────────────────────────────────────
export interface Club {
  id: string
  name: string
  coordinator: string
  category: string
  members: number
  schedule: string
  status: 'active' | 'inactive'
}

export interface SportsTeam {
  id: string
  name: string
  sport: string
  coach: string
  players: number
}

export interface Fixture {
  id: string
  teamId: string
  teamName: string
  opponent: string
  date: string
  venue: string
  result?: 'win' | 'loss' | 'draw'
}

export interface House {
  id: string
  name: string
  color: string
  captain: string
  points: number
}

export interface HousePoint {
  id: string
  houseId: string
  houseName: string
  event: string
  points: number
  date: string
  awardedTo: string
}

export interface DisciplineRecord {
  id: string
  studentId: string
  studentName: string
  type: 'achievement' | 'incident' | 'merit' | 'warning'
  description: string
  date: string
  points: number
  status: 'open' | 'resolved'
}

export interface CounsellingSession {
  id: string
  studentId: string
  studentName: string
  counsellor: string
  date: string
  reason: string
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

// ── Communication ──────────────────────────────────────────────────────────
export interface Notice {
  id: string
  title: string
  body: string
  audience: 'all' | 'students' | 'staff' | 'parents'
  category: string
  date: string
  pinned: boolean
  status: 'draft' | 'published'
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  venue: string
  audience: string
  description: string
}

export interface Message {
  id: string
  to: string
  subject: string
  body: string
  channel: 'email' | 'sms' | 'whatsapp' | 'inapp'
  status: 'sent' | 'scheduled' | 'failed'
  sentAt: string
}

export interface Notification {
  id: string
  title: string
  body: string
  type: 'info' | 'warning' | 'success' | 'alert'
  audience: string
  important: boolean
  read: boolean
  date: string
}

export interface PTMSession {
  id: string
  teacherId: string
  teacherName: string
  date: string
  timeSlot: string
  room: string
  status: 'open' | 'booked' | 'completed'
}

export interface Survey {
  id: string
  title: string
  audience: string
  questions: number
  status: 'draft' | 'live' | 'closed'
  responses: number
}

// ── Documents ──────────────────────────────────────────────────────────────
export interface DocumentRecord {
  id: string
  title: string
  category: string
  ownerType: 'student' | 'staff' | 'general'
  ownerName: string
  fileName: string
  expiry?: string
  status: 'valid' | 'expiring' | 'expired'
}

export interface CertificateTemplate {
  id: string
  name: string
  type: string
  layout: string
  fields: string
}

export interface Certificate {
  id: string
  templateId: string
  templateName: string
  studentId: string
  studentName: string
  issueDate: string
  number: string
  status: 'issued' | 'revoked'
}

// ── Service & System ───────────────────────────────────────────────────────
export interface Ticket {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'inprogress' | 'resolved' | 'closed'
  assignee: string
  requester: string
  createdAt: string
  sla: string
}

export interface Grievance {
  id: string
  title: string
  category: string
  anonymous: boolean
  raisedBy: string
  date: string
  status: 'open' | 'investigating' | 'resolved'
  resolution: string
}

export interface IncidentRecord {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  date: string
  location: string
  description: string
  actions: string
  status: 'reported' | 'investigating' | 'resolved'
}

export interface TaskItem {
  id: string
  title: string
  description: string
  assignee: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  status: 'todo' | 'inprogress' | 'done'
}

export interface UserAccount {
  id: string
  name: string
  role: string
  email: string
  status: 'active' | 'inactive'
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  entity: string
  details: string
}

export interface SchoolSetting {
  id: string
  key: string
  value: string
}