import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { Award, Plus, Pencil, Trash2, Search, Ban } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { CertificateTemplate, Certificate, Student } from './types'
import { CERT_TEMPLATE_SEED, CERTIFICATE_SEED, STUDENT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'

export default function SchoolCertificates() {
  const { items: templates, add: addTemplate, update: updateTemplate, remove: removeTemplate } = useLocalCollection<CertificateTemplate>('school:cert-templates', CERT_TEMPLATE_SEED)
  const { items: certificates, add: addCert, update: updateCert, remove: removeCert } = useLocalCollection<Certificate>('school:certificates', CERTIFICATE_SEED)
  const { items: students } = useLocalCollection<Student>('school:students', STUDENT_SEED)
  const [certSearch, setCertSearch] = useState('')
  const [templateModal, setTemplateModal] = useState(false)
  const [certModal, setCertModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null)
  const [editingCert, setEditingCert] = useState<Certificate | null>(null)
  const [templateForm, setTemplateForm] = useState({ name: '', type: '', layout: '', fields: '' })
  const [certForm, setCertForm] = useState({ templateId: templates[0]?.id ?? '', studentId: students[0]?.id ?? '', issueDate: new Date().toISOString().slice(0, 10), number: '', status: 'issued' as Certificate['status'] })
  const [tab, setTab] = useState('certificates')

  const templateColumns: DataColumn<CertificateTemplate>[] = [
    { key: 'name', header: 'Template', render: (t) => <span className="font-medium">{t.name}</span>, sortValue: (t) => t.name },
    { key: 'type', header: 'Type', render: (t) => t.type, sortValue: (t) => t.type },
    { key: 'layout', header: 'Layout', render: (t) => t.layout, hideOnMobile: true },
    { key: 'fields', header: 'Fields', render: (t) => t.fields, hideOnMobile: true },
  ]

  const certColumns: DataColumn<Certificate>[] = [
    { key: 'studentName', header: 'Student', render: (c) => <span className="font-medium">{c.studentName}</span>, sortValue: (c) => c.studentName },
    { key: 'templateName', header: 'Type', render: (c) => c.templateName, sortValue: (c) => c.templateName },
    { key: 'number', header: 'Number', render: (c) => <span className="font-mono text-xs">{c.number}</span> },
    { key: 'issueDate', header: 'Issued', render: (c) => c.issueDate.slice(0, 10), sortValue: (c) => c.issueDate },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, sortValue: (c) => c.status },
  ]

  function openAddTemplate() {
    setEditingTemplate(null)
    setTemplateForm({ name: '', type: '', layout: '', fields: '' })
    setTemplateModal(true)
  }

  function openEditTemplate(t: CertificateTemplate) {
    setEditingTemplate(t)
    setTemplateForm({ name: t.name, type: t.type, layout: t.layout, fields: t.fields })
    setTemplateModal(true)
  }

  function saveTemplate() {
    if (!templateForm.name.trim()) return
    if (editingTemplate) updateTemplate(editingTemplate.id, templateForm)
    else addTemplate({ id: genId(), ...templateForm })
    setTemplateModal(false)
  }

  function openAddCert() {
    setEditingCert(null)
    setCertForm({ templateId: templates[0]?.id ?? '', studentId: students[0]?.id ?? '', issueDate: new Date().toISOString().slice(0, 10), number: `CRT-${certificates.length + 1}`, status: 'issued' })
    setCertModal(true)
  }

  function openEditCert(c: Certificate) {
    setEditingCert(c)
    setCertForm({ templateId: c.templateId, studentId: c.studentId, issueDate: c.issueDate, number: c.number, status: c.status })
    setCertModal(true)
  }

  function saveCert() {
    const student = students.find((s) => s.id === certForm.studentId)
    const template = templates.find((t) => t.id === certForm.templateId)
    const payload = { ...certForm, studentName: student?.name ?? '', templateName: template?.name ?? '' }
    if (editingCert) updateCert(editingCert.id, payload)
    else addCert({ id: genId(), ...payload })
    setCertModal(false)
  }

  const issued = certificates.filter((c) => c.status === 'issued').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Templates" value={templates.length} icon={<Award className="w-5 h-5" />} tone="info" />
        <KpiCard label="Certificates" value={certificates.length} icon={<Award className="w-5 h-5" />} tone="default" />
        <KpiCard label="Issued" value={issued} icon={<Award className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="certificates" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddCert}><Plus className="w-4 h-4" /> Issue certificate</Button>
              </div>
              <DataTable
                columns={certColumns}
                rows={certificates.filter((c) => `${c.studentName} ${c.templateName} ${c.number}`.toLowerCase().includes(certSearch.toLowerCase()))}
                rowKey={(c) => c.id}
                pageSize={10}
                exportFilename="school-certificates"
                emptyIcon={<Award className="w-6 h-6" />}
                emptyTitle="No certificates"
                emptyDescription="Issue certificates to students."
                toolbar={
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input placeholder="Search certificates..." className="pl-9" value={certSearch} onChange={(e) => setCertSearch(e.target.value)} />
                  </div>
                }
                actions={(c) => (
                  <div className="flex gap-1">
                    {c.status === 'issued' && (
                      <Button variant="ghost" size="icon" onClick={() => updateCert(c.id, { status: 'revoked' })} aria-label="Revoke"><Ban className="w-4 h-4 text-red-500" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditCert(c)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeCert(c.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddTemplate}><Plus className="w-4 h-4" /> Add template</Button>
              </div>
              <DataTable
                columns={templateColumns}
                rows={templates}
                rowKey={(t) => t.id}
                pageSize={10}
                exportFilename="school-cert-templates"
                emptyIcon={<Award className="w-6 h-6" />}
                emptyTitle="No templates"
                emptyDescription="Define certificate templates."
                actions={(t) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditTemplate(t)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeTemplate(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={templateModal} onClose={() => setTemplateModal(false)} title={editingTemplate ? 'Edit template' : 'Add template'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} /></div>
            <div><Label>Type</Label><Input value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })} placeholder="TC, Bonafide, Achievement..." /></div>
          </div>
          <div><Label>Layout</Label><Input value={templateForm.layout} onChange={(e) => setTemplateForm({ ...templateForm, layout: e.target.value })} placeholder="Landscape, A4..." /></div>
          <div><Label>Fields</Label><Input value={templateForm.fields} onChange={(e) => setTemplateForm({ ...templateForm, fields: e.target.value })} placeholder="Student name, Class, Date" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setTemplateModal(false)}>Cancel</Button>
            <Button onClick={saveTemplate}>{editingTemplate ? 'Save changes' : 'Add template'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={certModal} onClose={() => setCertModal(false)} title={editingCert ? 'Edit certificate' : 'Issue certificate'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Template</Label>
              <Select value={certForm.templateId} onValueChange={(v) => setCertForm({ ...certForm, templateId: v })}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Student</Label>
              <Select value={certForm.studentId} onValueChange={(v) => setCertForm({ ...certForm, studentId: v })}>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Number</Label><Input value={certForm.number} onChange={(e) => setCertForm({ ...certForm, number: e.target.value })} /></div>
            <div><Label>Issue date</Label><Input type="date" value={certForm.issueDate} onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })} /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={certForm.status} onValueChange={(v) => setCertForm({ ...certForm, status: v as Certificate['status'] })}>
              <option value="issued">Issued</option>
              <option value="revoked">Revoked</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCertModal(false)}>Cancel</Button>
            <Button onClick={saveCert}>{editingCert ? 'Save changes' : 'Issue certificate'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}