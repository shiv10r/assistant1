import { Badge, Button, money, fmtDate, todayISO } from '../../components/ui'
import { GraduationCap, Layers, Wallet, Boxes, Users, Briefcase, Check, X, CheckCircle2 } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import { CrudPage } from '../../components/CrudPage'
import type { Student, SchoolClass, FeeRecord, FeeStatus, StockItem, StaffMember, SchoolProject, SchoolProjectStatus } from './types'
import { STUDENT_SEED, CLASS_SEED, FEE_SEED, STOCK_SEED, STAFF_SEED, PROJECT_SEED } from './seed'

// ---------------- Students ----------------

export function SchoolStudents() {
  const { items: classes } = useLocalCollection<SchoolClass>('school:classes', CLASS_SEED)
  return (
    <CrudPage<Student>
      collection="school:students"
      seed={STUDENT_SEED}
      title="Students"
      addLabel="Add student"
      singular="student"
      searchPlaceholder="Search name, admission no or class..."
      searchKeys={(s) => `${s.name} ${s.admissionNo} ${s.className}`}
      emptyIcon={<GraduationCap className="w-6 h-6" />}
      emptyTitle="No students yet"
      emptyDescription="Add a student to start building the roster."
      fields={[
        { name: 'admissionNo', label: 'Admission No', required: true },
        { name: 'name', label: 'Name', required: true },
        { name: 'classId', label: 'Class', type: 'select', options: classes.map((c) => ({ value: c.id, label: `${c.name} - ${c.section}` })) },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        { name: 'guardianName', label: 'Guardian name' },
        { name: 'phone', label: 'Phone' },
      ]}
      defaults={{ admissionNo: '', name: '', classId: classes[0]?.id ?? '', guardianName: '', phone: '', status: 'active' }}
      toRecord={(form) => {
        const cls = classes.find((c) => c.id === form.classId)
        if (!form.name.trim() || !cls) return null
        return {
          admissionNo: form.admissionNo.trim(),
          name: form.name.trim(),
          classId: cls.id,
          className: `${cls.name} - ${cls.section}`,
          guardianName: form.guardianName.trim(),
          phone: form.phone.trim(),
          status: form.status as Student['status'],
        }
      }}
      fromRecord={(s) => ({ admissionNo: s.admissionNo, name: s.name, classId: s.classId, guardianName: s.guardianName, phone: s.phone, status: s.status })}
      columns={[
        { key: 'admissionNo', header: 'Admission No', render: (s) => <span className="font-mono text-xs">{s.admissionNo}</span> },
        { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
        { key: 'className', header: 'Class', render: (s) => s.className },
        { key: 'guardianName', header: 'Guardian', render: (s) => s.guardianName },
        { key: 'phone', header: 'Phone', render: (s) => s.phone },
        { key: 'status', header: 'Status', render: (s) => <Badge variant={s.status === 'active' ? 'success' : 'outline'} size="sm">{s.status}</Badge> },
      ]}
    />
  )
}

// ---------------- Classes ----------------

export function SchoolClasses() {
  return (
    <CrudPage<SchoolClass>
      collection="school:classes"
      seed={CLASS_SEED}
      title="Classes"
      addLabel="Add class"
      singular="class"
      searchPlaceholder="Search class, section or teacher..."
      searchKeys={(c) => `${c.name} ${c.section} ${c.teacher}`}
      emptyIcon={<Layers className="w-6 h-6" />}
      emptyTitle="No classes yet"
      emptyDescription="Add a class to start enrolling students."
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'section', label: 'Section' },
        { name: 'teacher', label: 'Class teacher', span: 2 },
        { name: 'capacity', label: 'Capacity', type: 'number' },
        { name: 'studentCount', label: 'Current strength', type: 'number' },
      ]}
      defaults={{ name: '', section: '', teacher: '', capacity: '40', studentCount: '0' }}
      toRecord={(form) => {
        if (!form.name.trim()) return null
        return { name: form.name.trim(), section: form.section.trim(), teacher: form.teacher.trim(), capacity: Number(form.capacity) || 0, studentCount: Number(form.studentCount) || 0 }
      }}
      fromRecord={(c) => ({ name: c.name, section: c.section, teacher: c.teacher, capacity: String(c.capacity), studentCount: String(c.studentCount) })}
      columns={[
        { key: 'name', header: 'Class', render: (c) => <span className="font-medium">{c.name}</span> },
        { key: 'section', header: 'Section', render: (c) => c.section },
        { key: 'teacher', header: 'Teacher', render: (c) => c.teacher },
        {
          key: 'strength', header: 'Strength',
          render: (c) => (
            <>
              {c.studentCount} / {c.capacity}{' '}
              {c.studentCount >= c.capacity && <Badge variant="warning" size="sm">Full</Badge>}
            </>
          ),
        },
      ]}
    />
  )
}

// ---------------- Fees ----------------

const FEE_TONE: Record<FeeStatus, 'success' | 'warning' | 'danger'> = { paid: 'success', pending: 'warning', overdue: 'danger' }

export function SchoolFees() {
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  return (
    <CrudPage<FeeRecord>
      collection="school:fees"
      seed={FEE_SEED}
      title="Fees"
      addLabel="Add fee record"
      singular="fee record"
      allowEdit={false}
      searchPlaceholder="Search student or class..."
      searchKeys={(f) => `${f.studentName} ${f.className}`}
      emptyIcon={<Wallet className="w-6 h-6" />}
      emptyTitle="No fee records"
      emptyDescription="Add a fee record to start tracking collections."
      fields={[
        { name: 'studentId', label: 'Student', required: true, type: 'select', options: students.map((s) => ({ value: s.id, label: `${s.name} (${s.className})` })), span: 2 },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'dueDate', label: 'Due date', type: 'date' },
      ]}
      defaults={{ studentId: students[0]?.id ?? '', amount: '0', dueDate: todayISO() }}
      canSave={(form) => !!form.studentId}
      toolbarExtra={(items) => {
        const total = items.filter((f) => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0)
        return <div className="text-sm text-muted">Outstanding: <span className="text-text font-semibold">{money(total)}</span></div>
      }}
      toRecord={(form) => {
        const student = students.find((s) => s.id === form.studentId)
        if (!student) return null
        return { studentId: student.id, studentName: student.name, className: student.className, amount: Number(form.amount) || 0, dueDate: form.dueDate, status: 'pending' as FeeStatus }
      }}
      fromRecord={(f) => ({ studentId: f.studentId, amount: String(f.amount), dueDate: f.dueDate })}
      rowActions={(f, ctx) =>
        f.status !== 'paid' && (
          <Button variant="ghost" size="icon" onClick={() => ctx.update(f.id, { status: 'paid', paidDate: todayISO() })} aria-label="Mark paid">
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        )
      }
      columns={[
        { key: 'studentName', header: 'Student', render: (f) => <span className="font-medium">{f.studentName}</span> },
        { key: 'className', header: 'Class', render: (f) => f.className },
        { key: 'amount', header: 'Amount', render: (f) => money(f.amount) },
        { key: 'dueDate', header: 'Due date', render: (f) => fmtDate(f.dueDate) },
        { key: 'status', header: 'Status', render: (f) => <Badge variant={FEE_TONE[f.status]} size="sm">{f.status}</Badge> },
      ]}
    />
  )
}

// ---------------- Inventory ----------------

export function SchoolInventory() {
  return (
    <CrudPage<StockItem>
      collection="school:inventory"
      seed={STOCK_SEED}
      title="Inventory & Stock"
      addLabel="Add item"
      singular="item"
      searchPlaceholder="Search SKU, name or category..."
      searchKeys={(it) => `${it.sku} ${it.name} ${it.category}`}
      emptyIcon={<Boxes className="w-6 h-6" />}
      emptyTitle="No inventory items"
      emptyDescription="Add your first item to start tracking stock."
      fields={[
        { name: 'sku', label: 'SKU', required: true },
        { name: 'name', label: 'Name', required: true },
        { name: 'category', label: 'Category' },
        { name: 'unit', label: 'Unit' },
        { name: 'qty', label: 'Quantity', type: 'number' },
        { name: 'reorderLevel', label: 'Reorder level', type: 'number' },
        { name: 'unitPrice', label: 'Unit price', type: 'number' },
      ]}
      defaults={{ sku: '', name: '', category: '', qty: '0', unit: 'pcs', reorderLevel: '0', unitPrice: '0' }}
      toRecord={(form) => {
        if (!form.name.trim() || !form.sku.trim()) return null
        return {
          sku: form.sku.trim(),
          name: form.name.trim(),
          category: form.category.trim() || 'General',
          qty: Number(form.qty) || 0,
          unit: form.unit.trim() || 'pcs',
          reorderLevel: Number(form.reorderLevel) || 0,
          unitPrice: Number(form.unitPrice) || 0,
        }
      }}
      fromRecord={(it) => ({ sku: it.sku, name: it.name, category: it.category, qty: String(it.qty), unit: it.unit, reorderLevel: String(it.reorderLevel), unitPrice: String(it.unitPrice) })}
      columns={[
        { key: 'sku', header: 'SKU', render: (it) => <span className="font-mono text-xs">{it.sku}</span> },
        { key: 'name', header: 'Name', render: (it) => <span className="font-medium">{it.name}</span> },
        { key: 'category', header: 'Category', render: (it) => it.category },
        {
          key: 'stock', header: 'Stock',
          render: (it) => (
            <div className="flex items-center gap-2">
              <span>{it.qty} {it.unit}</span>
              {it.qty <= it.reorderLevel && <Badge variant="warning">reorder</Badge>}
            </div>
          ),
        },
        { key: 'unitPrice', header: 'Unit price', render: (it) => `₹${it.unitPrice}` },
      ]}
    />
  )
}

// ---------------- Staff ----------------

export function SchoolStaff() {
  return (
    <CrudPage<StaffMember>
      collection="school:staff"
      seed={STAFF_SEED}
      title="Staff Management"
      addLabel="Add staff"
      singular="staff"
      searchPlaceholder="Search staff..."
      searchKeys={(s) => `${s.name} ${s.role}`}
      emptyIcon={<Users className="w-6 h-6" />}
      emptyTitle="No staff yet"
      emptyDescription="Add your first staff member."
      fields={[
        { name: 'name', label: 'Name', required: true, span: 2 },
        { name: 'role', label: 'Role' },
        { name: 'phone', label: 'Phone' },
      ]}
      defaults={{ name: '', role: '', phone: '' }}
      addExtras={{ status: 'active' }}
      toRecord={(form) => {
        if (!form.name.trim()) return null
        return { name: form.name.trim(), role: form.role.trim(), phone: form.phone.trim() }
      }}
      fromRecord={(s) => ({ name: s.name, role: s.role, phone: s.phone })}
      columns={[
        { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
        { key: 'role', header: 'Role', render: (s) => s.role },
        { key: 'phone', header: 'Phone', render: (s) => s.phone },
        {
          key: 'attendance', header: "Today's attendance",
          render: (s, ctx) => {
            const markedToday = s.lastAttendanceDate === todayISO()
            if (markedToday) {
              return <Badge variant={s.lastAttendance === 'present' ? 'success' : 'danger'}>{s.lastAttendance}</Badge>
            }
            return (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => ctx.update(s.id, { lastAttendance: 'present', lastAttendanceDate: todayISO() })}>
                  <Check className="w-3.5 h-3.5" /> Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => ctx.update(s.id, { lastAttendance: 'absent', lastAttendanceDate: todayISO() })}>
                  <X className="w-3.5 h-3.5" /> Absent
                </Button>
              </div>
            )
          },
        },
      ]}
    />
  )
}

// ---------------- Projects ----------------

const PROJECT_TONE: Record<SchoolProjectStatus, 'default' | 'success' | 'info'> = { planned: 'info', active: 'default', completed: 'success' }
const PROJECT_ORDER: SchoolProjectStatus[] = ['planned', 'active', 'completed']

export function SchoolProjects() {
  return (
    <CrudPage<SchoolProject>
      collection="school:projects"
      seed={PROJECT_SEED}
      title="Project Management"
      addLabel="Add project"
      singular="project"
      searchPlaceholder="Search projects..."
      searchKeys={(p) => `${p.name} ${p.incharge}`}
      emptyIcon={<Briefcase className="w-6 h-6" />}
      emptyTitle="No projects yet"
      emptyDescription="Add a school project or event to track it here."
      fields={[
        { name: 'name', label: 'Name', required: true, span: 2 },
        { name: 'incharge', label: 'In-charge' },
        { name: 'startDate', label: 'Start date', type: 'date' },
        { name: 'budget', label: 'Budget', type: 'number', span: 2 },
      ]}
      defaults={{ name: '', incharge: '', startDate: '', budget: '0' }}
      addExtras={{ status: 'planned' }}
      toRecord={(form) => {
        if (!form.name.trim()) return null
        return { name: form.name.trim(), incharge: form.incharge.trim() || 'Unassigned', startDate: form.startDate || new Date().toISOString().slice(0, 10), budget: Number(form.budget) || 0 }
      }}
      fromRecord={(p) => ({ name: p.name, incharge: p.incharge, startDate: p.startDate, budget: String(p.budget) })}
      columns={[
        { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
        { key: 'incharge', header: 'In-charge', render: (p) => p.incharge },
        { key: 'startDate', header: 'Start', render: (p) => fmtDate(p.startDate) },
        { key: 'budget', header: 'Budget', render: (p) => money(p.budget) },
        {
          key: 'status', header: 'Status',
          render: (p, ctx) => {
            const next = PROJECT_ORDER[(PROJECT_ORDER.indexOf(p.status) + 1) % PROJECT_ORDER.length]
            return (
              <button onClick={() => ctx.update(p.id, { status: next })}>
                <Badge variant={PROJECT_TONE[p.status]}>{p.status}</Badge>
              </button>
            )
          },
        },
      ]}
    />
  )
}