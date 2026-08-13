import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { DesignFile, FileBlobMeta } from '../../api'
import { Empty, Modal, fmtDate, todayISO, PageHead } from '../../ui'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Upload, Download, Trash2, FileUp, Image as ImageIcon, Box, Loader2, Eye } from 'lucide-react'

const CATS = ['2D Layout', '3D Layout', 'Production Files']

const TYPE_ICON = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return <ImageIcon className="w-4 h-4" />
  return <Box className="w-4 h-4" />
}

export default function ProjectDesign() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const { toast } = useToast()
  const [cat, setCat] = useState('2D Layout')
  const [design, setDesign] = useState<DesignFile[]>([])
  const [uploads, setUploads] = useState<FileBlobMeta[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [f, setF] = useState({ name: '', note: '', date: todayISO() })
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    api.projects.design(pid).then(setDesign).catch(() => setDesign([]))
    api.projects.uploads(pid, cat).then(setUploads).catch(() => setUploads([]))
  }
  useEffect(() => { load() }, [pid, cat])

  const shown = design.filter((d) => d.category === cat)

  const save = async () => {
    try {
      if (!f.name.trim()) { setErr('Name required'); return }
      const d: DesignFile = { id: 0, projectId: pid, category: cat, name: f.name, imagePath: '', note: f.note, date: f.date }
      await api.projects.saveDesign(pid, d)
      setOpen(false); load()
      toast({ title: 'Design reference added', description: f.name })
    } catch (e) { setErr(String(e)); toast({ title: 'Could not add design', description: String(e), variant: 'error' }) }
  }

  const pickFile = () => fileRef.current?.click()

  const upload = async (file: File) => {
    setUploading(true)
    setErr('')
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      await api.projects.upload(pid, {
        category: cat,
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        dataBase64: data,
      })
      load()
      toast({ title: 'File uploaded', description: `${file.name} → ${cat}` })
    } catch (e) {
      setErr(String(e))
      toast({ title: 'Upload failed', description: String(e), variant: 'error' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = async (u: FileBlobMeta) => {
    if (!confirm(`Delete "${u.name}"?`)) return
    try {
      await api.projects.removeUpload(pid, u.id)
      load()
      toast({ title: 'File deleted', description: u.name, variant: 'error' })
    } catch (e) { toast({ title: 'Could not delete file', description: String(e), variant: 'error' }) }
  }

  const download = (u: FileBlobMeta) => api.download(`/api/projects/${pid}/uploads/${u.id}`).catch((e) => toast({ title: 'Download failed', description: String(e), variant: 'error' }))

  const openFile = (u: FileBlobMeta) => api.openFile(`/api/projects/${pid}/uploads/${u.id}`).catch((e) => toast({ title: 'Could not open file', description: String(e), variant: 'error' }))

  return (
    <>
      <PageHead icon="🎨" title="Design Files" sub="Upload 2D layouts, 3D models & production files" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />
      <div className="tabs">
        {CATS.map((c) => <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>)}
      </div>

      {/* Upload controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={pickFile} disabled={uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Upload {cat} file</>}
            </Button>
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <Button variant="outline" onClick={() => { setErr(''); setF({ name: '', note: '', date: todayISO() }); setOpen(true) }}>
              <FileUp className="w-4 h-4" /> Add Link / Reference
            </Button>
            <span className="text-xs text-muted">Supports images (2D plans), 3D model files (SKP, STL, FBX, OBJ) and any other project file.</span>
          </div>
          {err && <div className="mt-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{err}</div>}
        </CardContent>
      </Card>

      {/* Uploaded files */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Uploaded {cat} files</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {uploads.length === 0 ? (
            <Empty>No uploaded {cat} files yet.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead className="hidden sm:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                  <TableHead className="text-right w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">{TYPE_ICON(u.name)}</span>
                        <div className="min-w-0">
                          <button
                            onClick={() => openFile(u)}
                            className="font-medium text-text truncate text-left hover:text-primary hover:underline focus:outline-none"
                            title="Open file"
                          >
                            {u.name}
                          </button>
                          <Badge variant="outline" size="sm" className="mt-0.5">{u.category}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted">{u.sizeLabel}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted">{fmtDate(u.uploadedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openFile(u)} aria-label="Open" title="Open">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => download(u)} aria-label="Download" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(u)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Link/reference entries */}
      {shown.length > 0 && (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Reference</th><th>Date</th><th>Note</th></tr></thead>
            <tbody>{shown.map((d) => (
              <tr key={d.id}><td className="cat">{d.name}</td><td className="muted">{fmtDate(d.date)}</td><td className="muted">{d.note || '—'}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title="Add Design Reference" onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.name} placeholder="Name *" onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          <input value={f.note} placeholder="Note" onChange={(e) => setF({ ...f, note: e.target.value })} />
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={save}>Save</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}
