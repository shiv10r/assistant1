export interface Student {
  id: string
  admissionNo: string
  name: string
  classId: string
  className: string
  guardianName: string
  phone: string
  status: 'active' | 'inactive'
}

export interface SchoolClass {
  id: string
  name: string
  section: string
  teacher: string
  capacity: number
  studentCount: number
}

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

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  className: string
  date: string
  status: AttendanceStatus
}
