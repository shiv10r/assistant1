import type { Student, SchoolClass, FeeRecord, AttendanceRecord, StaffMember, SchoolProject, StockItem } from './types'

export const CLASS_SEED: SchoolClass[] = [
  { id: 'cls-1', name: 'Grade 5', section: 'A', teacher: 'Mrs. Sharma', capacity: 40, studentCount: 32 },
  { id: 'cls-2', name: 'Grade 6', section: 'B', teacher: 'Mr. Verma', capacity: 40, studentCount: 28 },
]

export const STUDENT_SEED: Student[] = [
  { id: 'stu-1', admissionNo: 'ADM-2026-001', name: 'Aarav Mehta', classId: 'cls-1', className: 'Grade 5 - A', guardianName: 'Rohit Mehta', phone: '+91 98111 22334', status: 'active' },
  { id: 'stu-2', admissionNo: 'ADM-2026-002', name: 'Diya Kapoor', classId: 'cls-2', className: 'Grade 6 - B', guardianName: 'Sunita Kapoor', phone: '+91 98222 33445', status: 'active' },
]

export const FEE_SEED: FeeRecord[] = [
  { id: 'fee-1', studentId: 'stu-1', studentName: 'Aarav Mehta', className: 'Grade 5 - A', amount: 12000, dueDate: '2026-08-10', status: 'pending' },
  { id: 'fee-2', studentId: 'stu-2', studentName: 'Diya Kapoor', className: 'Grade 6 - B', amount: 12500, dueDate: '2026-07-15', status: 'overdue' },
]

export const ATTENDANCE_SEED: AttendanceRecord[] = []

export const STAFF_SEED: StaffMember[] = [
  { id: 'sstaff-1', name: 'Mrs. Sharma', role: 'Class Teacher', phone: '+91 98111 00011', status: 'active' },
  { id: 'sstaff-2', name: 'Mr. Verma', role: 'Class Teacher', phone: '+91 98111 00022', status: 'active' },
]

export const PROJECT_SEED: SchoolProject[] = [
  { id: 'sproj-1', name: 'Annual Sports Day', incharge: 'Mr. Verma', status: 'planned', startDate: '2026-09-01', budget: 60000 },
]

export const STOCK_SEED: StockItem[] = [
  { id: 'sitem-1', sku: 'STK-001', name: 'Notebooks (200pg)', category: 'Stationery', qty: 500, unit: 'pcs', reorderLevel: 100, unitPrice: 40 },
  { id: 'sitem-2', sku: 'STK-002', name: 'Sports Kit', category: 'Sports', qty: 12, unit: 'set', reorderLevel: 5, unitPrice: 1500 },
]
