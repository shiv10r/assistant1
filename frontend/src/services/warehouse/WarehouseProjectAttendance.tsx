import { useParams } from 'react-router-dom'
import AttendanceModule from '../../components/AttendanceModule'
import type { StaffMember } from './types'
import { STAFF_SEED } from './seed'

export default function WarehouseProjectAttendance() {
  const { id } = useParams()
  return (
    <AttendanceModule
      collection={`warehouse:proj:${id ?? ''}:staff`}
      seed={STAFF_SEED as StaffMember[]}
      backTo={`/warehouse/projects/${id ?? ''}`}
      title="Project Attendance"
      sub="Daily site attendance & wages"
    />
  )
}