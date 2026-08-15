import type {
  Student, SchoolClass, FeeRecord, AttendanceRecord, StaffMember, SchoolProject, StockItem,
  ParentRecord, AdmissionLead, AcademicSession, Subject, TimetableSlot, Homework, Course, Lesson,
  LeaveRequest, Question, OnlineExam, TestAttempt, ExamSchedule, MarksEntry, ResultRecord,
  FeeStructure, Receipt, ExpenseRecord, PayrollRecord, JobOpening, Applicant, PerformanceReview,
  TrainingProgram, Vehicle, TransportRoute, LibraryBook, LibraryIssue, Vendor, PurchaseOrder,
  AssetRecord, VisitorLog, HostelRoom, HostelAllocation, MealPlan, Club, SportsTeam, Fixture,
  House, HousePoint, DisciplineRecord, CounsellingSession, Notice, CalendarEvent, Message,
  Notification, PTMSession, Survey, DocumentRecord, CertificateTemplate, Certificate, Ticket,
  Grievance, IncidentRecord, TaskItem, UserAccount, AuditLog, SchoolSetting,
} from './types'

export const CLASS_SEED: SchoolClass[] = [
  { id: 'cls-1', name: 'Grade 5', section: 'A', teacher: 'Mrs. Sharma', capacity: 40, studentCount: 32 },
  { id: 'cls-2', name: 'Grade 6', section: 'B', teacher: 'Mr. Verma', capacity: 40, studentCount: 28 },
  { id: 'cls-3', name: 'Grade 7', section: 'A', teacher: 'Ms. Iyer', capacity: 40, studentCount: 35 },
]

export const STUDENT_SEED: Student[] = [
  { id: 'stu-1', admissionNo: 'ADM-2026-001', name: 'Aarav Mehta', classId: 'cls-1', className: 'Grade 5 - A', guardianName: 'Rohit Mehta', phone: '+91 98111 22334', status: 'active', dob: '2015-03-12', gender: 'Male', bloodGroup: 'O+', rollNo: '1' },
  { id: 'stu-2', admissionNo: 'ADM-2026-002', name: 'Diya Kapoor', classId: 'cls-2', className: 'Grade 6 - B', guardianName: 'Sunita Kapoor', phone: '+91 98222 33445', status: 'active', dob: '2014-07-24', gender: 'Female', bloodGroup: 'A+', rollNo: '2' },
  { id: 'stu-3', admissionNo: 'ADM-2026-003', name: 'Rohan Gupta', classId: 'cls-3', className: 'Grade 7 - A', guardianName: 'Vikram Gupta', phone: '+91 98333 44556', status: 'active', dob: '2013-11-05', gender: 'Male', bloodGroup: 'B+', rollNo: '3' },
]

export const FEE_SEED: FeeRecord[] = [
  { id: 'fee-1', studentId: 'stu-1', studentName: 'Aarav Mehta', className: 'Grade 5 - A', amount: 12000, dueDate: '2026-08-10', status: 'pending' },
  { id: 'fee-2', studentId: 'stu-2', studentName: 'Diya Kapoor', className: 'Grade 6 - B', amount: 12500, dueDate: '2026-07-15', status: 'overdue' },
  { id: 'fee-3', studentId: 'stu-3', studentName: 'Rohan Gupta', className: 'Grade 7 - A', amount: 13000, dueDate: '2026-08-05', status: 'paid', paidDate: '2026-08-02' },
]

export const ATTENDANCE_SEED: AttendanceRecord[] = []

export const STAFF_SEED: StaffMember[] = [
  { id: 'sstaff-1', name: 'Mrs. Sharma', role: 'Class Teacher', phone: '+91 98111 00011', status: 'active', email: 'sharma@school.edu', department: 'Academics', joinDate: '2020-04-01' },
  { id: 'sstaff-2', name: 'Mr. Verma', role: 'Class Teacher', phone: '+91 98111 00022', status: 'active', email: 'verma@school.edu', department: 'Academics', joinDate: '2019-06-15' },
  { id: 'sstaff-3', name: 'Ms. Iyer', role: 'Science Teacher', phone: '+91 98111 00033', status: 'active', email: 'iyer@school.edu', department: 'Academics', joinDate: '2021-08-01' },
]

export const PROJECT_SEED: SchoolProject[] = [
  { id: 'sproj-1', name: 'Annual Sports Day', incharge: 'Mr. Verma', status: 'planned', startDate: '2026-09-01', budget: 60000 },
]

export const STOCK_SEED: StockItem[] = [
  { id: 'sitem-1', sku: 'STK-001', name: 'Notebooks (200pg)', category: 'Stationery', qty: 500, unit: 'pcs', reorderLevel: 100, unitPrice: 40 },
  { id: 'sitem-2', sku: 'STK-002', name: 'Sports Kit', category: 'Sports', qty: 12, unit: 'set', reorderLevel: 5, unitPrice: 1500 },
]

// ── People ─────────────────────────────────────────────────────────────────
export const PARENT_SEED: ParentRecord[] = [
  { id: 'par-1', name: 'Rohit Mehta', phone: '+91 98111 22334', email: 'rohit.mehta@mail.com', occupation: 'Engineer', address: 'Mumbai', childIds: ['stu-1'], status: 'active' },
  { id: 'par-2', name: 'Sunita Kapoor', phone: '+91 98222 33445', email: 'sunita.k@mail.com', occupation: 'Teacher', address: 'Pune', childIds: ['stu-2'], status: 'active' },
]

// ── Admissions & CRM ───────────────────────────────────────────────────────
export const ADMISSION_SEED: AdmissionLead[] = [
  { id: 'adm-1', studentName: 'Ananya Singh', guardianName: 'Raj Singh', phone: '+91 98444 55667', email: 'raj.s@mail.com', grade: 'Grade 5 - A', source: 'referral', stage: 'lead', createdAt: '2026-08-01' },
  { id: 'adm-2', studentName: 'Kabir Joshi', guardianName: 'Nitin Joshi', phone: '+91 98555 66778', grade: 'Grade 6 - B', source: 'website', stage: 'applied', followUpDate: '2026-08-12', notes: 'Interested in music program', createdAt: '2026-07-28' },
]

// ── Academics ──────────────────────────────────────────────────────────────
export const SESSION_SEED: AcademicSession[] = [
  { id: 'ses-1', name: '2025-26', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false },
  { id: 'ses-2', name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31', isCurrent: true },
]

export const SUBJECT_SEED: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MATH', classId: 'cls-1', className: 'Grade 5 - A', teacherId: 'sstaff-1', teacherName: 'Mrs. Sharma' },
  { id: 'sub-2', name: 'Science', code: 'SCI', classId: 'cls-2', className: 'Grade 6 - B', teacherId: 'sstaff-3', teacherName: 'Ms. Iyer' },
  { id: 'sub-3', name: 'English', code: 'ENG', classId: 'cls-3', className: 'Grade 7 - A', teacherId: 'sstaff-2', teacherName: 'Mr. Verma' },
]

export const TIMETABLE_SEED: TimetableSlot[] = [
  { id: 'tt-1', classId: 'cls-1', className: 'Grade 5 - A', day: 'Mon', period: 1, subject: 'Mathematics', teacher: 'Mrs. Sharma', room: 'R-101' },
  { id: 'tt-2', classId: 'cls-1', className: 'Grade 5 - A', day: 'Mon', period: 2, subject: 'English', teacher: 'Mr. Verma', room: 'R-101' },
  { id: 'tt-3', classId: 'cls-2', className: 'Grade 6 - B', day: 'Tue', period: 3, subject: 'Science', teacher: 'Ms. Iyer', room: 'R-204' },
]

export const HOMEWORK_SEED: Homework[] = [
  { id: 'hw-1', classId: 'cls-1', className: 'Grade 5 - A', subject: 'Mathematics', title: 'Fractions worksheet', description: 'Solve problems 1-20 from chapter 6.', dueDate: '2026-08-14', status: 'published' },
  { id: 'hw-2', classId: 'cls-2', className: 'Grade 6 - B', subject: 'Science', title: 'Photosynthesis notes', description: 'Write notes and draw the diagram.', dueDate: '2026-08-16', status: 'published' },
]

export const COURSE_SEED: Course[] = [
  { id: 'crs-1', name: 'Algebra Basics', subject: 'Mathematics', classId: 'cls-1', className: 'Grade 5 - A', description: 'Introduction to algebraic expressions', status: 'published', createdAt: '2026-07-10' },
]

export const LESSON_SEED: Lesson[] = [
  { id: 'lsn-1', courseId: 'crs-1', title: 'What is a variable?', contentType: 'video', content: 'https://example.com/algebra-1', durationMin: 12, order: 1 },
  { id: 'lsn-2', courseId: 'crs-1', title: 'Simple equations', contentType: 'quiz', content: '10 MCQs on equations', order: 2 },
]

// ── Attendance & Leave ─────────────────────────────────────────────────────
export const LEAVE_SEED: LeaveRequest[] = [
  { id: 'lv-1', personType: 'staff', personId: 'sstaff-2', personName: 'Mr. Verma', kind: 'Casual Leave', dateFrom: '2026-08-18', dateTo: '2026-08-19', reason: 'Family function', status: 'pending' },
  { id: 'lv-2', personType: 'student', personId: 'stu-2', personName: 'Diya Kapoor', kind: 'Sick Leave', dateFrom: '2026-08-11', dateTo: '2026-08-11', reason: 'Fever', status: 'approved' },
]

// ── Examination ────────────────────────────────────────────────────────────
export const QUESTION_SEED: Question[] = [
  { id: 'q-1', subject: 'Mathematics', classId: 'cls-1', className: 'Grade 5 - A', type: 'mcq', difficulty: 'easy', text: 'What is 7 x 8?', options: ['54', '56', '58', '48'], answer: '56', marks: 1 },
  { id: 'q-2', subject: 'Science', classId: 'cls-2', className: 'Grade 6 - B', type: 'short', difficulty: 'medium', text: 'Name the process by which plants make food.', answer: 'Photosynthesis', marks: 2 },
]

export const ONLINE_EXAM_SEED: OnlineExam[] = [
  { id: 'oe-1', name: 'Math Unit Test 1', subject: 'Mathematics', classId: 'cls-1', className: 'Grade 5 - A', durationMin: 30, totalMarks: 10, questionIds: ['q-1'], status: 'draft' },
]

export const ATTEMPT_SEED: TestAttempt[] = []

export const EXAM_SCHEDULE_SEED: ExamSchedule[] = [
  { id: 'ex-1', name: 'Mid-Term 2026', classId: 'cls-1', className: 'Grade 5 - A', date: '2026-09-15', time: '09:00', subject: 'Mathematics', status: 'scheduled' },
]

export const MARKS_SEED: MarksEntry[] = [
  { id: 'mk-1', examId: 'ex-1', examName: 'Mid-Term 2026', studentId: 'stu-1', studentName: 'Aarav Mehta', subject: 'Mathematics', marksObtained: 38, maxMarks: 50 },
]

export const RESULT_SEED: ResultRecord[] = [
  { id: 'rs-1', examId: 'ex-1', examName: 'Mid-Term 2026', studentId: 'stu-1', studentName: 'Aarav Mehta', className: 'Grade 5 - A', total: 38, maxTotal: 50, percentage: 76, grade: 'B' },
]

// ── Finance ────────────────────────────────────────────────────────────────
export const FEE_STRUCTURE_SEED: FeeStructure[] = [
  { id: 'fs-1', name: 'Tuition', className: 'Grade 5 - A', amount: 10000, frequency: 'monthly', dueDay: 10 },
  { id: 'fs-2', name: 'Transport', className: 'Grade 6 - B', amount: 2500, frequency: 'monthly', dueDay: 5 },
]

export const RECEIPT_SEED: Receipt[] = [
  { id: 'rc-1', receiptNo: 'RCPT-2026-0001', studentId: 'stu-3', studentName: 'Rohan Gupta', amount: 13000, method: 'upi', date: '2026-08-02', items: ['Tuition - Term 1'] },
]

export const EXPENSE_SEED: ExpenseRecord[] = [
  { id: 'ex-1', category: 'Maintenance', description: 'AC servicing', amount: 4500, paidTo: 'CoolServe', date: '2026-07-20', method: 'bank' },
]

export const PAYROLL_SEED: PayrollRecord[] = [
  { id: 'pr-1', staffId: 'sstaff-1', staffName: 'Mrs. Sharma', month: '2026-08', basic: 35000, hra: 14000, allowances: 4000, deductions: 5300, net: 47700, status: 'processed' },
]

// ── HR ─────────────────────────────────────────────────────────────────────
export const JOB_SEED: JobOpening[] = [
  { id: 'job-1', title: 'Mathematics Teacher', department: 'Academics', openings: 2, experience: '2+ years', status: 'open' },
]

export const APPLICANT_SEED: Applicant[] = [
  { id: 'ap-1', jobId: 'job-1', jobTitle: 'Mathematics Teacher', name: 'Priya Nair', phone: '+91 98666 77889', email: 'priya.n@mail.com', stage: 'interview', appliedOn: '2026-07-25' },
]

export const REVIEW_SEED: PerformanceReview[] = [
  { id: 'rv-1', staffId: 'sstaff-1', staffName: 'Mrs. Sharma', period: 'Q1 2026', rating: 4, status: 'completed' },
]

export const TRAINING_SEED: TrainingProgram[] = [
  { id: 'tr-1', name: 'Digital Classroom Tools', trainer: 'EduTech Pro', date: '2026-08-20', staffIds: ['sstaff-1', 'sstaff-2'], status: 'planned' },
]

// ── Operations ─────────────────────────────────────────────────────────────
export const VEHICLE_SEED: Vehicle[] = [
  { id: 'veh-1', regNo: 'MH 12 AB 1234', type: 'bus', capacity: 40, driver: 'Ramesh', route: 'Route 1', status: 'active' },
  { id: 'veh-2', regNo: 'MH 12 CD 5678', type: 'van', capacity: 12, driver: 'Suresh', route: 'Route 2', status: 'active' },
]

export const ROUTE_SEED: TransportRoute[] = [
  { id: 'rt-1', name: 'Route 1', stops: ['Andheri', 'Vile Parle', 'Santacruz'], fare: 2500, vehicleId: 'veh-1' },
]

export const BOOK_SEED: LibraryBook[] = [
  { id: 'bk-1', isbn: '978-0143415363', title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', category: 'Biography', copies: 5, available: 3 },
]

export const ISSUE_SEED: LibraryIssue[] = [
  { id: 'iss-1', bookId: 'bk-1', bookTitle: 'Wings of Fire', memberType: 'student', memberId: 'stu-1', memberName: 'Aarav Mehta', issueDate: '2026-08-01', dueDate: '2026-08-15' },
]

export const VENDOR_SEED: Vendor[] = [
  { id: 'vd-1', name: 'Stationery World', phone: '+91 98777 88990', email: 'sales@stationeryworld.in', category: 'Stationery', gst: '27AAACS1234A1Z5' },
]

export const PO_SEED: PurchaseOrder[] = [
  { id: 'po-1', vendorId: 'vd-1', vendorName: 'Stationery World', items: 'Notebooks x 200, Pens x 50', total: 12500, status: 'approved', date: '2026-07-30' },
]

export const ASSET_SEED: AssetRecord[] = [
  { id: 'as-1', name: 'Projector', category: 'Electronics', tag: 'AST-001', purchaseDate: '2025-06-01', cost: 65000, location: 'Auditorium', status: 'active' },
]

export const VISITOR_SEED: VisitorLog[] = [
  { id: 'vs-1', name: 'Kiran Rao', phone: '+91 98888 99001', purpose: 'Parent meeting', personToMeet: 'Mrs. Sharma', inTime: '2026-08-08 09:30', badge: 'V-101' },
]

export const ROOM_SEED: HostelRoom[] = [
  { id: 'rm-1', hostel: 'Boys Hostel A', number: 'A-101', capacity: 4, occupants: 3, type: 'shared' },
]

export const ALLOCATION_SEED: HostelAllocation[] = [
  { id: 'al-1', studentId: 'stu-3', studentName: 'Rohan Gupta', roomId: 'rm-1', roomNo: 'A-101', hostel: 'Boys Hostel A', from: '2026-06-01', status: 'active' },
]

export const MEAL_SEED: MealPlan[] = [
  { id: 'ml-1', name: 'Standard Lunch', type: 'lunch', items: 'Rice, Dal, Roti, Veg Curry', costPerMeal: 60, status: 'active' },
]

// ── Student Life ───────────────────────────────────────────────────────────
export const CLUB_SEED: Club[] = [
  { id: 'cl-1', name: 'Robotics Club', coordinator: 'Ms. Iyer', category: 'STEM', members: 25, schedule: 'Wed 4-5 PM', status: 'active' },
]

export const TEAM_SEED: SportsTeam[] = [
  { id: 'tm-1', name: 'Cricket XI', sport: 'Cricket', coach: 'Mr. Verma', players: 14 },
]

export const FIXTURE_SEED: Fixture[] = [
  { id: 'fx-1', teamId: 'tm-1', teamName: 'Cricket XI', opponent: 'Sunrise School', date: '2026-09-05', venue: 'School Ground', result: 'win' },
]

export const HOUSE_SEED: House[] = [
  { id: 'hs-1', name: 'Ruby House', color: '#e11d48', captain: 'Aarav Mehta', points: 240 },
  { id: 'hs-2', name: 'Sapphire House', color: '#2563eb', captain: 'Diya Kapoor', points: 210 },
]

export const HOUSE_POINT_SEED: HousePoint[] = [
  { id: 'hp-1', houseId: 'hs-1', houseName: 'Ruby House', event: 'Quiz competition', points: 20, date: '2026-08-01', awardedTo: 'Aarav Mehta' },
]

export const DISCIPLINE_SEED: DisciplineRecord[] = [
  { id: 'dc-1', studentId: 'stu-1', studentName: 'Aarav Mehta', type: 'merit', description: 'Won inter-school quiz', date: '2026-08-01', points: 10, status: 'resolved' },
]

export const COUNSELLING_SEED: CounsellingSession[] = [
  { id: 'cs-1', studentId: 'stu-2', studentName: 'Diya Kapoor', counsellor: 'Mrs. Sharma', date: '2026-08-10', reason: 'Academic stress', notes: 'Parent meeting scheduled', status: 'scheduled' },
]

// ── Communication ──────────────────────────────────────────────────────────
export const NOTICE_SEED: Notice[] = [
  { id: 'nt-1', title: 'Annual Day Rehearsals', body: 'Rehearsals begin next Monday at 3 PM in the auditorium.', audience: 'all', category: 'Event', date: '2026-08-07', pinned: true, status: 'published' },
]

export const EVENT_SEED: CalendarEvent[] = [
  { id: 'ev-1', title: 'Independence Day', date: '2026-08-15', venue: 'Main Ground', audience: 'all', description: 'Flag hoisting and cultural program' },
]

export const MESSAGE_SEED: Message[] = [
  { id: 'msg-1', to: 'All Parents', subject: 'Fee payment reminder', body: 'Please clear pending fees by 10th.', channel: 'email', status: 'sent', sentAt: '2026-08-06' },
]

export const NOTIFICATION_SEED: Notification[] = [
  { id: 'nfn-1', title: 'New notice published', body: 'Annual Day rehearsals announced.', type: 'info', audience: 'all', important: false, read: false, date: '2026-08-07' },
]

export const PTM_SEED: PTMSession[] = [
  { id: 'ptm-1', teacherId: 'sstaff-1', teacherName: 'Mrs. Sharma', date: '2026-08-22', timeSlot: '09:00 - 09:15', room: 'R-101', status: 'open' },
]

export const SURVEY_SEED: Survey[] = [
  { id: 'sv-1', title: 'Annual Parent Feedback', audience: 'parents', questions: 12, status: 'live', responses: 87 },
]

// ── Documents ──────────────────────────────────────────────────────────────
export const DOCUMENT_SEED: DocumentRecord[] = [
  { id: 'doc-1', title: 'Aarav - Birth Certificate', category: 'Identity', ownerType: 'student', ownerName: 'Aarav Mehta', fileName: 'aarav-birth.pdf', status: 'valid' },
]

export const CERT_TEMPLATE_SEED: CertificateTemplate[] = [
  { id: 'ct-1', name: 'Bonafide Certificate', type: 'Bonafide', layout: 'Standard A4', fields: 'name, admissionNo, class' },
]

export const CERTIFICATE_SEED: Certificate[] = [
  { id: 'cf-1', templateId: 'ct-1', templateName: 'Bonafide Certificate', studentId: 'stu-1', studentName: 'Aarav Mehta', issueDate: '2026-08-01', number: 'BONF-2026-0001', status: 'issued' },
]

// ── Service & System ───────────────────────────────────────────────────────
export const TICKET_SEED: Ticket[] = [
  { id: 'tk-1', title: 'Projector not working', category: 'IT', priority: 'high', status: 'inprogress', assignee: 'IT Desk', requester: 'Mrs. Sharma', createdAt: '2026-08-05', sla: '24h' },
]

export const GRIEVANCE_SEED: Grievance[] = [
  { id: 'gr-1', title: 'Canteen food quality', category: 'Canteen', anonymous: true, raisedBy: 'Anonymous', date: '2026-08-04', status: 'investigating', resolution: '' },
]

export const INCIDENT_SEED: IncidentRecord[] = [
  { id: 'inc-1', type: 'Medical', severity: 'medium', date: '2026-08-03', location: 'Playground', description: 'Minor injury during sports', actions: 'First aid given, parent informed', status: 'resolved' },
]

export const TASK_SEED: TaskItem[] = [
  { id: 'tsk-1', title: 'Order lab chemicals', description: 'Place PO for chemistry lab', assignee: 'Mr. Verma', priority: 'medium', dueDate: '2026-08-18', status: 'todo' },
]

export const USER_SEED: UserAccount[] = [
  { id: 'usr-1', name: 'Principal', role: 'admin', email: 'principal@school.edu', status: 'active' },
]

export const AUDIT_SEED: AuditLog[] = [
  { id: 'aud-1', timestamp: '2026-08-07 10:15', user: 'admin', action: 'UPDATE', entity: 'Student', details: 'Updated student ADM-2026-001' },
]

export const SETTING_SEED: SchoolSetting[] = [
  { id: 'set-1', key: 'schoolName', value: 'Sunrise Public School' },
  { id: 'set-2', key: 'session', value: '2026-27' },
]