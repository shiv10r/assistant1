import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { ProjectFile, ProjectFolder } from '../../api'
import { Empty, Modal, PageHead } from '../../ui'

export default function ProjectFiles() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [folders, setFolders] = useState<ProjectFolder[]>([])
  const [folderId, setFolderId] = useState(0)
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState<'folder' | 'file' | null>(null)
  const [folderName, setFolderName] = useState('')
  const [fileName, setFileName] = useState('')

  const loadFolder = () => api.projects.folders(pid).then((f) => { setFolders(f); if (f.length && !folderId) setFolderId(f[0].id) }).catch(() => {})
  useEffect(() => { loadFolder() }, [pid])
  useEffect(() => { if (folderId) api.projects.files(folderId).then(setFiles).catch(() => setFiles([])) }, [folderId])

  const addFolder = async () => {
    try {
      const f = await api.projects.addFolder(pid, folderName)
      setOpen(null); setFolderName(''); setFolderId(f.id); loadFolder()
    } catch (e) { setErr(String(e)) }
  }
  const addFile = async () => {
    try {
      if (!folderId) { setErr('Select a folder first'); return }
      await api.projects.addFile(pid, { id: 0, projectId: pid, folderId, fileName, filePath: '<attached>', uploadedAt: new Date().toISOString().slice(0, 10) })
      setOpen(null); setFileName('')
      if (folderId) api.projects.files(folderId).then(setFiles)
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="📁" title="Files" sub="Project folders & documents" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="toolbar">
        <select value={folderId} onChange={(e) => setFolderId(Number(e.target.value))}>
          {folders.length === 0 && <option value={0}>No folders</option>}
          {folders.map((fo) => <option key={fo.id} value={fo.id}>{fo.name}</option>)}
        </select>
        <button className="btn ghost" onClick={() => { setFolderName(''); setErr(''); setOpen('folder') }}>＋ Folder</button>
        <button className="btn" onClick={() => { setFileName(''); setErr(''); setOpen('file') }}>＋ Upload</button>
      </div>

      {files.length === 0 ? <Empty>No files in this folder yet.</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>File</th></tr></thead>
            <tbody>{files.map((f) => (
              <tr key={f.id}><td className="cat">📄 {f.fileName}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {err && <div className="empty" style={{ color: '#E05C7A' }}>{err}</div>}

      {open === 'folder' && (
        <Modal title="New Folder" onClose={() => setOpen(null)}>
          <input value={folderName} placeholder="Folder name" onChange={(e) => setFolderName(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={addFolder}>Create</button>
            <button className="btn ghost" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </Modal>
      )}
      {open === 'file' && (
        <Modal title="Add File" onClose={() => setOpen(null)}>
          <div className="muted" style={{ marginBottom: 10 }}>Attaches a file reference to the selected folder.</div>
          <input value={fileName} placeholder="File name" onChange={(e) => setFileName(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={addFile}>Save</button>
            <button className="btn ghost" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}