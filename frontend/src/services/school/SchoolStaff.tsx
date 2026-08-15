import AttendanceModule from '../../components/AttendanceModule'
import type { StaffMember } from './types'
import { STAFF_SEED } from './seed'

export default function SchoolStaff() {
  return (
    <AttendanceModule
      collection="school:staff"
      seed={STAFF_SEED as StaffMember[]}
      backTo="/school"
      title="Staff Management"
      sub="Daily site attendance & wages"
    />
  )
}