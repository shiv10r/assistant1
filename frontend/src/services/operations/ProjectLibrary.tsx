import { useState } from 'react'
import { Archive, Database, FileText, Image, Plus, Search } from 'lucide-react'
import { Badge, Button, Input, Label, Modal, Select, fmtDate } from '../../platform/ui'
import { genId } from '../../lib/localStore'
import type { OperationsConfig } from './config'
import type { LibraryProject, LocalCollection, WorkItem } from './types'

const STATUSES: LibraryProject['status'][] = ['Approved', 'Reference', 'Needs review', 'Archived']

export default function ProjectLibrary({ config, work, library }: { config: OperationsConfig; work: WorkItem[]; library: LocalCollection<LibraryProject> }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', customer: '', location: '', completedAt: '', status: 'Reference' as LibraryProject['status'], photoUrl: '', fileName: '', fileType: 'application/pdf', fileSize: '', sourceWorkId: work[0]?.id ?? '' })
  const filtered = library.items.filter((item) => (status === 'All' || item.status === status) && `${item.title} ${item.customer} ${item.location} ${item.fileName}`.toLowerCase().includes(query.toLowerCase()))

  const add = () => {
    if (!form.title.trim()) return
    library.add({
      id: genId(), title: form.title.trim(), customer: form.customer.trim() || `Previous ${config.customer}`,
      location: form.location.trim(), completedAt: form.completedAt || new Date().toISOString().slice(0, 10), status: form.status,
      photoUrl: form.photoUrl.trim(), fileName: form.fileName.trim() || `${form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-metadata.pdf`,
      fileType: form.fileType.trim() || 'application/octet-stream', fileSize: Math.max(0, Number(form.fileSize) || 0), sourceWorkId: form.sourceWorkId,
      syncProvider: 'PostgreSQL', syncedAt: new Date().toISOString(),
    })
    setOpen(false)
    setForm({ title: '', customer: '', location: '', completedAt: '', status: 'Reference', photoUrl: '', fileName: '', fileType: 'application/pdf', fileSize: '', sourceWorkId: work[0]?.id ?? '' })
  }

  return <div className="operations-page">
    <header className="ops-page-head"><div><span>Reusable project memory</span><h1>{capitalize(config.libraryLabel)}</h1><p>Search previous outcomes, photos and file metadata without storing blob bytes in operational records.</p></div><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add previous {config.item}</Button></header>
    <div className="ops-sync-banner"><Database /><div><strong>PostgreSQL-backed metadata</strong><p>This collection uses the current module-data synchronization through <code>useLocalCollection</code>, with local fallback. Photos remain URL references and files remain metadata only.</p></div><Badge variant="success">Metadata sync</Badge></div>
    <div className="ops-library-toolbar"><div><Search className="w-4 h-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.libraryLabel}`} /></div><Select value={status} onValueChange={setStatus}><option>All</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</Select></div>
    <section className="ops-library-grid">{filtered.map((item) => <article key={item.id}>
      <div className="ops-library-photo">{item.photoUrl ? <img src={item.photoUrl} alt={`${item.title} reference`} loading="lazy" /> : <Image />}<Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Needs review' ? 'warning' : 'info'} size="sm">{item.status}</Badge></div>
      <div className="ops-library-body"><span>Completed {fmtDate(item.completedAt)}</span><h2>{item.title}</h2><p>{item.customer} · {item.location || 'Location not recorded'}</p><div className="ops-library-file"><FileText /><div><strong>{item.fileName}</strong><small>{item.fileType} · {formatBytes(item.fileSize)}</small></div></div><div className="ops-library-sync"><Database /><span>{item.syncProvider} metadata<small>Synced {fmtDate(item.syncedAt)}</small></span><Select value={item.status} onValueChange={(next) => library.update(item.id, { status: next as LibraryProject['status'], syncedAt: new Date().toISOString() })}>{STATUSES.map((entry) => <option key={entry}>{entry}</option>)}</Select></div></div>
    </article>)}{!filtered.length && <div className="ops-empty ops-library-empty"><Archive /><h2>No matching archive records</h2><p>Add a previous {config.item} or adjust the filters.</p></div>}</section>
    <Modal open={open} onClose={() => setOpen(false)} title={`Add previous ${config.item}`} size="lg"><div className="space-y-4"><div><Label required>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>{capitalize(config.customer)}</Label><Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div><div><Label>{capitalize(config.location)}</Label><Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></div><div><Label>Completed</Label><Input type="date" value={form.completedAt} onChange={(event) => setForm({ ...form, completedAt: event.target.value })} /></div><div><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as LibraryProject['status'] })}>{STATUSES.map((item) => <option key={item}>{item}</option>)}</Select></div></div><div><Label>Photo URL</Label><Input type="url" value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} placeholder="https://... (reference only)" /></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div><Label>File name</Label><Input value={form.fileName} onChange={(event) => setForm({ ...form, fileName: event.target.value })} /></div><div><Label>MIME type</Label><Input value={form.fileType} onChange={(event) => setForm({ ...form, fileType: event.target.value })} /></div><div><Label>File size (bytes)</Label><Input type="number" value={form.fileSize} onChange={(event) => setForm({ ...form, fileSize: event.target.value })} /></div></div><div><Label>Related current {config.item}</Label><Select value={form.sourceWorkId} onValueChange={(value) => setForm({ ...form, sourceWorkId: value })}><option value="">No relation</option>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!form.title.trim()}>Save metadata</Button></div></div></Modal>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function formatBytes(value: number) { if (!value) return 'Metadata only'; if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; return `${(value / (1024 * 1024)).toFixed(1)} MB` }
