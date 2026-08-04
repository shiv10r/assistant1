import { useEffect, useState } from 'react'
import { api } from '../api'
import type { ProjectSummary } from '../api'

export default function Projects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])

  useEffect(() => {
    api.projects().then(setProjects).catch(() => setProjects([]))
  }, [])

  return (
    <>
      <div className="page-head"><div><h1>🏗️ Projects</h1><div className="muted">Construction & interior-design project tracking</div></div></div>
      <div className="card">
        <h2>Your Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <div className="empty">No projects yet — they're created in the Windows/mobile app.</div>
        ) : (
          <table className="main-table"><thead><tr><th>Project</th></tr></thead>
            <tbody>{projects.map((p) => <tr key={p.id}><td className="cat">{p.name}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </>
  )
}