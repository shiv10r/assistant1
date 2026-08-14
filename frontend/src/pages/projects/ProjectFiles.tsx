import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectFile, ProjectFolder } from '../../api'
import { Card, CardContent, Badge, Button, Input, Label, Modal, Empty } from '../../components/ui'
import { ArrowLeft, FolderPlus, FilePlus2, FolderOpen, FileText, Link2, Calendar, Trash2, Pencil } from 'lucide-react'
import { cn, fmtDate } from '../../lib/utils'

export default function ProjectFiles() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [folders, setFolders] = useState<ProjectFolder[]>([])
  const [folderId, setFolderId] = useState(0)
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState<'folder' | 'file' | null>(null)
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null)
  const [folderName, setFolderName] = useState('')
  const [fileName, setFileName] = useState('')
  const [filePath, setFilePath] = useState('')
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')

  const loadFolders = async () => {
    const f = await api.projects.folders(pid).catch(() => [] as ProjectFolder[])
    setFolders(f)
    setFolderId((cur) => (f.some((x) => x.id === cur) ? cur : (f[0]?.id ?? 0)))
  }
  useEffect(() => { loadFolders() }, [pid])
  useEffect(() => { if (folderId) api.projects.files(folderId).then(setFiles).catch(() => setFiles([])) }, [folderId, folders])

  const query = q.trim().toLowerCase()
  const filteredFiles = query
    ? files.filter((f) => f.fileName.toLowerCase().includes(query) || (f.filePath || '').toLowerCase().includes(query))
    : files

  const addFolder = async () => {
    if (!folderName.trim()) { setErr('Folder name is required'); return }
    try {
      const f = await api.projects.addFolder(pid, folderName.trim())
      setErr('')
      setOpen(null)
      setFolderName('')
      setFolderId(f.id)
      await loadFolders()
    } catch (e) { setErr(String(e)) }
  }

  const addFile = async () => {
    if (!fileName.trim()) { setErr('File name is required'); return }
    setSaving(true)
    try {
      let targetFolder = folderId
      if (folderName.trim()) {
        const f = await api.projects.addFolder(pid, folderName.trim())
        targetFolder = f.id
        await loadFolders()
      }
      if (!targetFolder) { setErr('Select a folder or enter a new folder name'); setSaving(false); return }
      await api.projects.addFile(pid, {
        id: 0, projectId: pid, folderId: targetFolder, fileName: fileName.trim(),
        filePath: filePath.trim() || '<attached>', uploadedAt: new Date().toISOString().slice(0, 10),
      })
      setErr('')
      setOpen(null)
      setFileName('')
      setFilePath('')
      setFolderName('')
      const f = await api.projects.files(targetFolder).catch(() => [] as ProjectFile[])
      setFiles(f)
    } catch (e) { setErr(String(e)) }
    finally { setSaving(false) }
  }

  const saveFile = async () => {
    if (!editingFile) return
    if (!fileName.trim()) { setErr('File name is required'); return }
    setSaving(true)
    try {
      let targetFolder = editingFile.folderId
      if (folderName.trim()) {
        const f = await api.projects.addFolder(pid, folderName.trim())
        targetFolder = f.id
        await loadFolders()
      }
      await api.projects.updateFile({
        ...editingFile,
        folderId: targetFolder,
        fileName: fileName.trim(),
        filePath: filePath.trim() || '<attached>',
      })
      setErr('')
      setOpen(null)
      setEditingFile(null)
      setFolderName('')
      const f = await api.projects.files(targetFolder).catch(() => [] as ProjectFile[])
      setFiles(f)
      setFolderId(targetFolder)
    } catch (e) { setErr(String(e)) }
    finally { setSaving(false) }
  }

  const deleteFile = async (f: ProjectFile) => {
    if (!confirm(`Delete "${f.fileName}"?`)) return
    try {
      await api.projects.deleteFile(f.id)
      setFiles((prev) => prev.filter((x) => x.id !== f.id))
    } catch (e) { setErr(String(e)) }
  }

  const deleteFolder = async (fo: ProjectFolder) => {
    if (!confirm(`Delete folder "${fo.name}" and all its files?`)) return
    try {
      await api.projects.deleteFolder(pid, fo.id)
      if (folderId === fo.id) setFolderId(0)
      await loadFolders()
    } catch (e) { setErr(String(e)) }
  }

  const switchFolder = (fid: number) => {
    setFolderId(fid)
    setQ('')
    api.projects.files(fid).then(setFiles).catch(() => setFiles([]))
  }

  return (
    <>
      <div className="page-head">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav(`/projects/${pid}`)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Project Files</h1>
            <div className="muted">Organise documents, drawings and attachments in folders</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setFolderName(''); setErr(''); setOpen('folder') }}>
            <FolderPlus className="w-4 h-4" /> New Folder
          </Button>
          <Button onClick={() => { setEditingFile(null); setFileName(''); setFilePath(''); setFolderName(''); setErr(''); setOpen('file') }}>
            <FilePlus2 className="w-4 h-4" /> Add File
          </Button>
        </div>
      </div>

      {/* Folder tabs */}
      {folders.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-6">
          {folders.map((fo) => (
            <div key={fo.id} className="flex items-center gap-1">
              <button
                onClick={() => switchFolder(fo.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                  folderId === fo.id
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                    : 'bg-surface text-muted border-border hover:text-text hover:border-primary/40'
                )}
              >
                <FolderOpen className="w-4 h-4" />
                {fo.name}
              </button>
              <button
                className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Delete folder"
                onClick={() => deleteFolder(fo)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-sm text-muted">No folders yet.</span>
            <Button size="sm" variant="outline" onClick={() => { setFolderName(''); setErr(''); setOpen('folder') }}>
              <FolderPlus className="w-4 h-4" /> Create a folder
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      <Card>
        {files.length === 0 ? (
          <Empty
            icon={<FolderOpen className="w-12 h-12" />}
            title="No files in this folder"
            description="Add files like drawings, bills, contracts and photos"
            action={<Button onClick={() => { setEditingFile(null); setFileName(''); setFilePath(''); setFolderName(''); setErr(''); setOpen('file') }}><FilePlus2 className="w-4 h-4" /> Add File</Button>}
          />
        ) : (
          <>
            <CardContent className="p-4 pb-0">
              <Input placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} />
            </CardContent>
            {filteredFiles.length === 0 ? (
              <Empty title={`No files match "${q}"`} />
            ) : (
              <CardContent className="p-0 divide-y divide-border">
                {filteredFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate">{f.fileName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(f.uploadedAt)}</span>
                        {f.filePath && f.filePath !== '<attached>' && (
                          <a href={f.filePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            <Link2 className="w-3 h-3" /> Open link
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" size="sm" className="hidden sm:inline-flex">{folders.find((x) => x.id === f.folderId)?.name || '—'}</Badge>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditingFile(f); setFileName(f.fileName); setFilePath(f.filePath && f.filePath !== '<attached>' ? f.filePath : ''); setFolderName(''); setErr(''); setOpen('file') }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => deleteFile(f)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </>
        )}
      </Card>

      {err && <div className="mt-4 p-3 rounded-lg text-sm border bg-red-500/10 border-red-500/20 text-red-500">{err}</div>}

      {/* New Folder modal */}
      <Modal open={open === 'folder'} onClose={() => setOpen(null)} title="New Folder" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); addFolder() }} className="space-y-5">
          <div>
            <Label htmlFor="fname" required>Folder Name</Label>
            <Input id="fname" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. Drawings, Bills, Contracts" autoFocus />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
            <Button type="submit">Create Folder</Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit File modal */}
      <Modal open={open === 'file'} onClose={() => setOpen(null)} title={editingFile ? 'Edit File' : 'Add File'} description={editingFile ? 'Rename, move or update the link' : 'Attach a file reference to this project'} size="md">
        <form onSubmit={(e) => { e.preventDefault(); editingFile ? saveFile() : addFile() }} className="space-y-5">
          <div>
            <Label htmlFor="file-name" required>File Name</Label>
            <Input id="file-name" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. Structural drawing – Rev B" autoFocus />
          </div>
          <div>
            <Label htmlFor="file-link">File Link / Path</Label>
            <Input id="file-link" value={filePath} onChange={(e) => setFilePath(e.target.value)} placeholder="https://drive.google.com/... or paste a path" />
          </div>
          <div>
            <Label>Folder</Label>
            {folders.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {folders.map((fo) => (
                  <button
                    key={fo.id}
                    type="button"
                    onClick={() => setFolderId(fo.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all',
                      (editingFile ? editingFile.folderId : folderId) === fo.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface border-border text-muted hover:border-primary/40'
                    )}
                  >
                    <FolderOpen className="w-4 h-4" />
                    {fo.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No folders yet — name one below and it will be created.</p>
            )}
            <Input
              className="mt-2"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Or type a new folder name to create…"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingFile ? 'Save Changes' : 'Add File'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}