import { useMemo, useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { Briefcase, Plus, Pencil, Trash2, Search, ArrowRight } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { JobOpening, Applicant } from './types'
import { JOB_SEED, APPLICANT_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'

const STAGES: Applicant['stage'][] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']

export default function SchoolRecruitment() {
  const { items: jobs, add: addJob, update: updateJob, remove: removeJob } = useLocalCollection<JobOpening>('school:jobs', JOB_SEED)
  const { items: applicants, add: addApplicant, update: updateApplicant, remove: removeApplicant } = useLocalCollection<Applicant>('school:applicants', APPLICANT_SEED)
  const [jobSearch, setJobSearch] = useState('')
  const [appSearch, setAppSearch] = useState('')
  const [jobModal, setJobModal] = useState(false)
  const [appModal, setAppModal] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [editingApp, setEditingApp] = useState<Applicant | null>(null)
  const [jobForm, setJobForm] = useState({ title: '', department: '', openings: 1, experience: '', status: 'open' as JobOpening['status'] })
  const [appForm, setAppForm] = useState({ jobId: jobs[0]?.id ?? '', name: '', phone: '', email: '', stage: 'applied' as Applicant['stage'] })
  const [tab, setTab] = useState('jobs')

  const filteredJobs = useMemo(
    () => jobs.filter((j) => `${j.title} ${j.department}`.toLowerCase().includes(jobSearch.toLowerCase())),
    [jobs, jobSearch]
  )

  const filteredApps = useMemo(
    () => applicants.filter((a) => `${a.name} ${a.jobTitle}`.toLowerCase().includes(appSearch.toLowerCase())),
    [applicants, appSearch]
  )

  const jobColumns: DataColumn<JobOpening>[] = [
    { key: 'title', header: 'Title', render: (j) => <span className="font-medium">{j.title}</span>, sortValue: (j) => j.title },
    { key: 'department', header: 'Department', render: (j) => j.department, sortValue: (j) => j.department },
    { key: 'openings', header: 'Openings', render: (j) => j.openings },
    { key: 'experience', header: 'Experience', render: (j) => j.experience },
    { key: 'applicants', header: 'Applicants', render: (j) => applicants.filter((a) => a.jobId === j.id).length },
    { key: 'status', header: 'Status', render: (j) => <StatusBadge status={j.status} />, sortValue: (j) => j.status },
  ]

  const appColumns: DataColumn<Applicant>[] = [
    { key: 'name', header: 'Applicant', render: (a) => <span className="font-medium">{a.name}</span>, sortValue: (a) => a.name },
    { key: 'jobTitle', header: 'Applied for', render: (a) => a.jobTitle, sortValue: (a) => a.jobTitle },
    { key: 'phone', header: 'Phone', render: (a) => a.phone, hideOnMobile: true },
    { key: 'appliedOn', header: 'Applied on', render: (a) => a.appliedOn.slice(0, 10) },
    { key: 'stage', header: 'Stage', render: (a) => <StatusBadge status={a.stage} />, sortValue: (a) => a.stage },
  ]

  function openAddJob() {
    setEditingJob(null)
    setJobForm({ title: '', department: '', openings: 1, experience: '', status: 'open' })
    setJobModal(true)
  }

  function openEditJob(j: JobOpening) {
    setEditingJob(j)
    setJobForm({ title: j.title, department: j.department, openings: j.openings, experience: j.experience, status: j.status })
    setJobModal(true)
  }

  function saveJob() {
    if (!jobForm.title.trim()) return
    const payload = { ...jobForm, openings: Number(jobForm.openings) }
    if (editingJob) updateJob(editingJob.id, payload)
    else addJob({ id: genId(), ...payload })
    setJobModal(false)
  }

  function openAddApp() {
    setEditingApp(null)
    setAppForm({ jobId: jobs[0]?.id ?? '', name: '', phone: '', email: '', stage: 'applied' })
    setAppModal(true)
  }

  function openEditApp(a: Applicant) {
    setEditingApp(a)
    setAppForm({ jobId: a.jobId, name: a.name, phone: a.phone, email: a.email, stage: a.stage })
    setAppModal(true)
  }

  function saveApp() {
    if (!appForm.name.trim()) return
    const job = jobs.find((j) => j.id === appForm.jobId)
    const payload = { ...appForm, jobTitle: job?.title ?? '', appliedOn: editingApp?.appliedOn ?? new Date().toISOString().slice(0, 10) }
    if (editingApp) updateApplicant(editingApp.id, payload)
    else addApplicant({ id: genId(), ...payload })
    setAppModal(false)
  }

  function advance(a: Applicant) {
    const idx = STAGES.indexOf(a.stage)
    const next = STAGES[idx + 1]
    if (next) updateApplicant(a.id, { stage: next })
  }

  const openJobs = jobs.filter((j) => j.status === 'open').length
  const hired = applicants.filter((a) => a.stage === 'hired').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Open jobs" value={openJobs} icon={<Briefcase className="w-5 h-5" />} tone="info" />
        <KPICard label="Total jobs" value={jobs.length} icon={<Briefcase className="w-5 h-5" />} tone="default" />
        <KPICard label="Applicants" value={applicants.length} icon={<Briefcase className="w-5 h-5" />} tone="warning" />
        <KPICard label="Hired" value={hired} icon={<Briefcase className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="jobs">Job openings</TabsTrigger>
              <TabsTrigger value="applicants">Applicants</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddJob}><Plus className="w-4 h-4" /> Add job</Button>
              </div>
              <DataTable
                columns={jobColumns}
                rows={filteredJobs}
                rowKey={(j) => j.id}
                pageSize={10}
                exportFilename="school-jobs"
                emptyIcon={<Briefcase className="w-6 h-6" />}
                emptyTitle="No job openings"
                emptyDescription="Post a job to start recruiting."
                toolbar={
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input placeholder="Search jobs..." className="pl-9" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} />
                  </div>
                }
                actions={(j) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditJob(j)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeJob(j.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="applicants" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddApp}><Plus className="w-4 h-4" /> Add applicant</Button>
              </div>
              <DataTable
                columns={appColumns}
                rows={filteredApps}
                rowKey={(a) => a.id}
                pageSize={10}
                exportFilename="school-applicants"
                emptyIcon={<Briefcase className="w-6 h-6" />}
                emptyTitle="No applicants"
                emptyDescription="Applicants for your job openings appear here."
                toolbar={
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input placeholder="Search applicants..." className="pl-9" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} />
                  </div>
                }
                actions={(a) => (
                  <div className="flex gap-1">
                    {a.stage !== 'hired' && a.stage !== 'rejected' && (
                      <Button variant="ghost" size="icon" onClick={() => advance(a)} aria-label="Advance stage"><ArrowRight className="w-4 h-4 text-emerald-500" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditApp(a)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeApplicant(a.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={jobModal} onClose={() => setJobModal(false)} title={editingJob ? 'Edit job' : 'Add job'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Job title</Label><Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} /></div>
            <div><Label>Department</Label><Input value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Openings</Label><Input type="number" value={jobForm.openings} onChange={(e) => setJobForm({ ...jobForm, openings: Number(e.target.value) })} /></div>
            <div><Label>Experience</Label><Input value={jobForm.experience} onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="2+ years" /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={jobForm.status} onValueChange={(v) => setJobForm({ ...jobForm, status: v as JobOpening['status'] })}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setJobModal(false)}>Cancel</Button>
            <Button onClick={saveJob}>{editingJob ? 'Save changes' : 'Add job'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={appModal} onClose={() => setAppModal(false)} title={editingApp ? 'Edit applicant' : 'Add applicant'} size="md">
        <div className="space-y-4">
          <div>
            <Label>Applied for</Label>
            <Select value={appForm.jobId} onValueChange={(v) => setAppForm({ ...appForm, jobId: v })}>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={appForm.name} onChange={(e) => setAppForm({ ...appForm, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} /></div>
          </div>
          <div><Label>Email</Label><Input type="email" value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} /></div>
          <div>
            <Label>Stage</Label>
            <Select value={appForm.stage} onValueChange={(v) => setAppForm({ ...appForm, stage: v as Applicant['stage'] })}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAppModal(false)}>Cancel</Button>
            <Button onClick={saveApp}>{editingApp ? 'Save changes' : 'Add applicant'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}