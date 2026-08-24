import { useState } from 'react'
import { Archive, Database, Download, FileText, Image, Plus, Search, Upload } from 'lucide-react'
import { Badge, Button, Input, Label, Modal, Select, fmtDate } from '../../platform/ui'
import { genId } from '../../lib/localStore'
import { fileStorage, fileStorageFor, STORAGE_FILE_ACCEPT, storageFileError } from './fileStorage'
import type { OperationsConfig } from './config'
import type { LibraryProject, LocalCollection, WorkItem } from './types'

const STATUSES: LibraryProject['status'][] = ['Approved', 'Reference', 'Needs review', 'Archived']

export default function ProjectLibrary({ config, work, library }: { config: OperationsConfig; work: WorkItem[]; library: LocalCollection<LibraryProject> }) {
  const emptyForm = () => ({ title: '', customer: '', location: '', completedAt: '', status: 'Reference' as LibraryProject['status'], photoUrl: '', sourceWorkId: work[0]?.id ?? '' })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null)
  const filtered = library.items.filter((item) => (status === 'All' || item.status === status) && `${item.title} ${item.customer} ${item.location} ${item.fileName}`.toLowerCase().includes(query.toLowerCase()))

  const add = async () => {
    if (!form.title.trim()) return
    setBusy(true); setNotice(null)
    const fileId = file ? genId() : undefined
    if (file && fileId) {
      const validation = storageFileError(file)
      if (validation) { setNotice({ text: validation, error: true }); setBusy(false); return }
      try {
        const result = await fileStorage.upload(fileId, file)
        if (fileStorage.kind === 'supabase') setNotice({ text: result.message, error: !result.notificationSent })
      }
      catch (error) { setNotice({ text: error instanceof Error ? error.message : 'Upload failed.', error: true }); setBusy(false); return }
    }
    library.add({
      id: genId(), title: form.title.trim(), customer: form.customer.trim() || `Previous ${config.customer}`,
      location: form.location.trim(), completedAt: form.completedAt || new Date().toISOString().slice(0, 10), status: form.status,
      photoUrl: form.photoUrl.trim(), fileName: file?.name ?? `${slug(form.title)}-metadata.pdf`,
      fileType: file?.type || 'application/pdf', fileSize: file?.size ?? 0, sourceWorkId: form.sourceWorkId,
      syncProvider: 'PostgreSQL', syncedAt: new Date().toISOString(), fileId, storage: fileId ? fileStorage.kind : undefined,
    })
    setOpen(false); setFile(null); setForm(emptyForm()); setBusy(false)
  }

  return <div className="operations-page">
    <header className="ops-page-head"><div><span>Reusable project memory</span><h1>{capitalize(config.libraryLabel)}</h1><p>Store previous outcomes, photos and project files in one searchable archive.</p></div><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add previous {config.item}</Button></header>
    <div className="ops-sync-banner"><Database /><div><strong>{fileStorage.kind === 'supabase' ? 'Supabase project storage enabled' : 'Private browser storage'}</strong><p>Metadata is synchronized through PostgreSQL. Files use {fileStorage.kind === 'supabase' ? 'private Supabase objects with signed access' : 'local browser storage until Supabase is enabled'}.</p></div><Badge variant="success">{fileStorage.kind === 'supabase' ? 'Cloud files' : 'Local files'}</Badge></div>
    {notice && <div role={notice.error ? 'alert' : 'status'} className={notice.error ? 'rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700' : 'rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700'}>{notice.text}</div>}
    <div className="ops-library-toolbar"><div><Search className="w-4 h-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.libraryLabel}`} /></div><Select value={status} onValueChange={setStatus}><option>All</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</Select></div>
    <section className="ops-library-grid">{filtered.map((item) => <article key={item.id}>
      <div className="ops-library-photo">{item.photoUrl ? <img src={item.photoUrl} alt={`${item.title} reference`} loading="lazy" /> : <Image />}<Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Needs review' ? 'warning' : 'info'} size="sm">{item.status}</Badge></div>
      <div className="ops-library-body"><span>Completed {fmtDate(item.completedAt)}</span><h2>{item.title}</h2><p>{item.customer} · {item.location || 'Location not recorded'}</p><div className="ops-library-file"><FileText /><div><strong>{item.fileName}</strong><small>{item.fileType} · {formatBytes(item.fileSize)}</small></div>{item.fileId && item.storage && <Button variant="ghost" size="icon" aria-label={`Download ${item.fileName}`} onClick={() => void fileStorageFor(item.storage!).download(item.fileId!, item.fileName)}><Download className="w-4 h-4" /></Button>}</div><div className="ops-library-sync"><Database /><span>{item.syncProvider} metadata<small>Synced {fmtDate(item.syncedAt)}</small></span><Select value={item.status} onValueChange={(next) => library.update(item.id, { status: next as LibraryProject['status'], syncedAt: new Date().toISOString() })}>{STATUSES.map((entry) => <option key={entry}>{entry}</option>)}</Select></div></div>
    </article>)}{!filtered.length && <div className="ops-empty ops-library-empty"><Archive /><h2>No matching archive records</h2><p>Add a previous {config.item} or adjust the filters.</p></div>}</section>
    <Modal open={open} onClose={() => setOpen(false)} title={`Add previous ${config.item}`} size="lg"><div className="space-y-4">
      <div><Label required>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>{capitalize(config.customer)}</Label><Input value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} /></div><div><Label>{capitalize(config.location)}</Label><Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></div><div><Label>Completed</Label><Input type="date" value={form.completedAt} onChange={(event) => setForm({ ...form, completedAt: event.target.value })} /></div><div><Label>Status</Label><Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as LibraryProject['status'] })}>{STATUSES.map((item) => <option key={item}>{item}</option>)}</Select></div></div>
      <div><Label>Gallery photo URL (optional)</Label><Input type="url" value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} placeholder="https://..." /></div>
      <div><Label>Upload photo or project file</Label><label className="ops-library-upload"><Upload /><span>{file ? file.name : 'Choose image, PDF, document or ZIP'}<small>Private storage, maximum 25 MB</small></span><input type="file" accept={STORAGE_FILE_ACCEPT} onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label></div>
      <div><Label>Related current {config.item}</Label><Select value={form.sourceWorkId} onValueChange={(value) => setForm({ ...form, sourceWorkId: value })}><option value="">No relation</option>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void add()} disabled={!form.title.trim() || busy}>{busy ? 'Uploading...' : 'Save archive record'}</Button></div>
    </div></Modal>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function slug(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
function formatBytes(value: number) { if (!value) return 'Metadata only'; if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; return `${(value / (1024 * 1024)).toFixed(1)} MB` }
