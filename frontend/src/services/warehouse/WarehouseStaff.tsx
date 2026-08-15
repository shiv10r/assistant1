import AttendanceModule from '../../components/AttendanceModule'
import type { StaffMember } from './types'
import { STAFF_SEED } from './seed'

export default function WarehouseStaff() {
  return (
    <AttendanceModule
      collection="warehouse:staff"
      seed={STAFF_SEED as StaffMember[]}
      backTo="/warehouse/dashboard"
      title="Staff Management"
      sub="Daily site attendance & wages"
    />
  )
}