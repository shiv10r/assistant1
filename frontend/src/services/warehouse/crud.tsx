import { Badge, Button, StatusBadge, money, fmtDate, todayISO } from '../../components/ui'
import { Users, Briefcase, Check, X } from 'lucide-react'
import { CrudPage } from '../../components/CrudPage'
import type { StaffMember, ProjectRecord, ProjectStatus, Customer, Supplier } from './types'
import { STAFF_SEED, PROJECT_SEED, CUSTOMER_SEED, SUPPLIER_SEED } from './seed'

// ---------------- Staff ----------------

export function WarehouseStaff() {
  return (
    <CrudPage<StaffMember>
      collection="warehouse:staff"
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

const PROJECT_TONE: Record<ProjectStatus, 'default' | 'success' | 'info'> = { planned: 'info', active: 'default', completed: 'success' }
const PROJECT_ORDER: ProjectStatus[] = ['planned', 'active', 'completed']

export function WarehouseProjects() {
  return (
    <CrudPage<ProjectRecord>
      collection="warehouse:projects"
      seed={PROJECT_SEED}
      title="Project Management"
      addLabel="Add project"
      singular="project"
      searchPlaceholder="Search projects..."
      searchKeys={(p) => `${p.name} ${p.client}`}
      emptyIcon={<Briefcase className="w-6 h-6" />}
      emptyTitle="No projects yet"
      emptyDescription="Add a warehouse project to track it here."
      fields={[
        { name: 'name', label: 'Name', required: true, span: 2 },
        { name: 'client', label: 'Client' },
        { name: 'startDate', label: 'Start date', type: 'date' },
        { name: 'budget', label: 'Budget', type: 'number', span: 2 },
      ]}
      defaults={{ name: '', client: '', startDate: '', budget: '0' }}
      addExtras={{ status: 'planned' }}
      toRecord={(form) => {
        if (!form.name.trim()) return null
        return { name: form.name.trim(), client: form.client.trim() || 'Internal', startDate: form.startDate || new Date().toISOString().slice(0, 10), budget: Number(form.budget) || 0 }
      }}
      fromRecord={(p) => ({ name: p.name, client: p.client, startDate: p.startDate, budget: String(p.budget) })}
      columns={[
        { key: 'name', header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
        { key: 'client', header: 'Client', render: (p) => p.client },
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

// ---------------- Customers ----------------

export function WarehouseCustomers() {
  return (
    <CrudPage<Customer>
      collection="warehouse:customers"
      seed={CUSTOMER_SEED}
      title="Customers"
      addLabel="Add customer"
      singular="customer"
      searchPlaceholder="Search name, company, GSTIN..."
      searchKeys={(c) => `${c.name} ${c.company} ${c.phone} ${c.email} ${c.gstin}`}
      exportFilename="warehouse-customers"
      useToasts
      statusFilter={{
        options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }],
        match: (c, v) => c.status === v,
      }}
      emptyIcon={<Users className="w-6 h-6" />}
      emptyTitle="No customers yet"
      emptyDescription="Add a customer to start creating sales orders."
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'company', label: 'Company' },
        { name: 'gstin', label: 'GSTIN' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'billingAddress', label: 'Billing address', span: 2 },
        { name: 'shippingAddress', label: 'Shipping address', span: 2 },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
      ]}
      defaults={{ name: '', company: '', gstin: '', phone: '', email: '', billingAddress: '', shippingAddress: '', status: 'active' }}
      toRecord={(form) => {
        if (!form.name.trim()) return null
        return {
          name: form.name.trim(),
          company: form.company.trim(),
          gstin: form.gstin.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          billingAddress: form.billingAddress.trim(),
          shippingAddress: form.shippingAddress.trim(),
          status: form.status as Customer['status'],
        }
      }}
      fromRecord={(c) => ({ name: c.name, company: c.company, gstin: c.gstin, phone: c.phone, email: c.email, billingAddress: c.billingAddress, shippingAddress: c.shippingAddress, status: c.status })}
      columns={[
        {
          key: 'name', header: 'Name',
          render: (c) => (
            <div>
              <div className="font-medium">{c.name}</div>
              {c.company && <div className="text-xs text-muted">{c.company}</div>}
            </div>
          ),
          sortValue: (c) => c.name,
          csvValue: (c) => c.name,
        },
        { key: 'gstin', header: 'GSTIN', render: (c) => <span className="font-mono text-xs">{c.gstin || '—'}</span> },
        { key: 'phone', header: 'Phone', render: (c) => c.phone || '—' },
        { key: 'email', header: 'Email', render: (c) => c.email || '—' },
        { key: 'shipping', header: 'Shipping address', render: (c) => <span className="text-xs">{c.shippingAddress || '—'}</span>, hideOnMobile: true },
        { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status, csvValue: (c) => c.status },
      ]}
    />
  )
}

// ---------------- Suppliers ----------------

export function WarehouseSuppliers() {
  return (
    <CrudPage<Supplier>
      collection="warehouse:suppliers"
      seed={SUPPLIER_SEED}
      title="Suppliers"
      addLabel="Add supplier"
      singular="supplier"
      searchPlaceholder="Search name, contact, GSTIN..."
      searchKeys={(s) => `${s.name} ${s.company} ${s.contact} ${s.phone} ${s.email} ${s.gstin}`}
      exportFilename="warehouse-suppliers"
      useToasts
      statusFilter={{
        options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }],
        match: (s, v) => s.status === v,
      }}
      emptyIcon={<Users className="w-6 h-6" />}
      emptyTitle="No suppliers yet"
      emptyDescription="Add a supplier to start creating purchase orders."
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'company', label: 'Company' },
        { name: 'contact', label: 'Contact person' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'gstin', label: 'GSTIN' },
        { name: 'paymentTerms', label: 'Payment terms', placeholder: 'e.g. Net 30' },
        { name: 'address', label: 'Address', span: 2 },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
      ]}
      defaults={{ name: '', company: '', contact: '', phone: '', email: '', gstin: '', paymentTerms: '', address: '', status: 'active' }}
      toRecord={(form) => {
        if (!form.name.trim()) return null
        return {
          name: form.name.trim(),
          company: form.company.trim(),
          contact: form.contact.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          gstin: form.gstin.trim(),
          paymentTerms: form.paymentTerms.trim(),
          address: form.address.trim(),
          status: form.status as Supplier['status'],
        }
      }}
      fromRecord={(s) => ({ name: s.name, company: s.company, contact: s.contact, phone: s.phone, email: s.email, gstin: s.gstin, paymentTerms: s.paymentTerms, address: s.address, status: s.status })}
      columns={[
        {
          key: 'name', header: 'Name',
          render: (s) => (
            <div>
              <div className="font-medium">{s.name}</div>
              {s.company && <div className="text-xs text-muted">{s.company}</div>}
            </div>
          ),
          sortValue: (s) => s.name,
          csvValue: (s) => s.name,
        },
        { key: 'contact', header: 'Contact', render: (s) => s.contact || '—', sortValue: (s) => s.contact },
        { key: 'phone', header: 'Phone', render: (s) => s.phone || '—' },
        { key: 'email', header: 'Email', render: (s) => s.email || '—' },
        { key: 'gstin', header: 'GSTIN', render: (s) => <span className="font-mono text-xs">{s.gstin || '—'}</span> },
        { key: 'terms', header: 'Payment terms', render: (s) => s.paymentTerms || '—', hideOnMobile: true },
        { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} />, sortValue: (s) => s.status, csvValue: (s) => s.status },
      ]}
    />
  )
}