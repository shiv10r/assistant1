import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, Badge, money, num, fmtDate } from '../../components/ui'
import { ArrowLeft, Sparkles, Heart, Bookmark, Download, Share2, Wand2, Eye, Check } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProject, InteriorDesign } from './types'
import { PROJECT_SEED, DESIGN_SEED } from './seed'
import { STYLE_OPTIONS } from './types'

function designPreview(d: InteriorDesign, index: number) {
  const gradientPairs: Record<string, [string, string]> = {
    Modern: ['#1e293b', '#64748b'],
    Minimal: ['#f8fafc', '#cbd5e1'],
    Luxury: ['#3f2d20', '#c9a26b'],
    Scandinavian: ['#f1f5f9', '#a8c3a0'],
    Traditional: ['#7c3a3c', '#d4a373'],
    Industrial: ['#1c1917', '#78716c'],
    Contemporary: ['#0f766e', '#22d3ee'],
  }
  const [from, to] = gradientPairs[d.style] ?? gradientPairs.Modern
  const accent = d.favorite ? '#f43f5e' : '#ffffff'
  return (
    <svg viewBox="0 0 400 260" className="w-full h-40" role="img" aria-label={`${d.name} preview`}>
      <defs>
        <linearGradient id={`g-${d.id}-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#g-${d.id}-${index})`} />
      <rect x="30" y="60" width="340" height="150" rx="8" fill="rgba(255,255,255,0.12)" />
      <rect x="50" y="80" width="200" height="90" rx="4" fill="rgba(255,255,255,0.18)" />
      <rect x="270" y="80" width="80" height="90" rx="4" fill="rgba(255,255,255,0.10)" />
      <rect x="50" y="180" width="280" height="14" rx="7" fill="rgba(255,255,255,0.25)" />
      <circle cx="345" cy="45" r="10" fill={accent} />
      <rect x="40" y="30" width="120" height="16" rx="8" fill="rgba(255,255,255,0.85)" />
      <text x="48" y="42" fontSize="10" fill="#334155" fontFamily="sans-serif">{d.style} · {d.color}</text>
    </svg>
  )
}

export default function InteriorDesigns() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: designs, update } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)

  const project = projects.find((p) => p.id === id)
  const [query, setQuery] = useState('')
  const [styleFilter, setStyleFilter] = useState('all')
  const [shareOpen, setShareOpen] = useState(false)
  const [shareDesign, setShareDesign] = useState<InteriorDesign | null>(null)

  const projectDesigns = useMemo(
    () => designs
      .filter((d) => d.projectId === id && (styleFilter === 'all' || d.style === styleFilter))
      .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [designs, id, query, styleFilter]
  )

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back to projects</Button>
        <Card><CardContent className="py-10 text-center text-sm text-muted">Project not found.</CardContent></Card>
      </div>
    )
  }

  function toggleFavorite(d: InteriorDesign) { update(d.id, { favorite: !d.favorite }) }
  function toggleSaved(d: InteriorDesign) { update(d.id, { saved: !d.saved }) }

  function download(d: InteriorDesign) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><rect width="800" height="520" fill="#1e293b"/><text x="40" y="60" fill="#fff" font-size="28" font-family="sans-serif">${d.name}</text><text x="40" y="100" fill="#94a3b8" font-size="18" font-family="sans-serif">${d.style} · ${d.color} · v${d.currentVersion}</text><text x="40" y="140" fill="#fff" font-size="20" font-family="sans-serif">${money(d.budget)}</text></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${d.name.toLowerCase().replace(/\s+/g, '-')}-v${d.currentVersion}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(`/interior/projects/${project.id}`)}><ArrowLeft className="w-4 h-4" /> Back to {project.name}</Button>
        <Button onClick={() => navigate(`/interior/projects/${project.id}/generate`)}><Sparkles className="w-4 h-4" /> New design</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>AI designs</CardTitle>
          <Badge variant="info" size="sm">{num(projectDesigns.length)} result{projectDesigns.length === 1 ? '' : 's'}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-64">
              <Input placeholder="Search designs..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button key="all" onClick={() => setStyleFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${styleFilter === 'all' ? 'bg-primary text-white border-primary' : 'border-border bg-surface2 text-muted hover:text-text'}`}>All</button>
              {STYLE_OPTIONS.map((s) => (
                <button key={s} onClick={() => setStyleFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${styleFilter === s ? 'bg-primary text-white border-primary' : 'border-border bg-surface2 text-muted hover:text-text'}`}>{s}</button>
              ))}
            </div>
          </div>

          {projectDesigns.length === 0 ? (
            <div className="py-12 text-center">
              <Wand2 className="w-8 h-8 mx-auto text-muted" />
              <p className="mt-3 text-sm font-medium text-text">No designs match</p>
              <p className="text-sm text-muted mt-1">Generate a new AI design or adjust the filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectDesigns.map((d, i) => (
                <Card key={d.id} className="overflow-hidden flex flex-col">
                  <button className="block w-full relative group" onClick={() => navigate(`/interior/projects/${project.id}/designs/${d.id}`)}>
                    {designPreview(d, i)}
                    <span className="absolute top-2 left-2">
                      <Badge variant={d.status === 'completed' ? 'success' : d.status === 'generating' ? 'warning' : 'danger'} size="sm">{d.status}</Badge>
                    </span>
                    <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="flex items-center gap-2 text-white text-sm font-medium"><Eye className="w-4 h-4" /> View design</span>
                    </span>
                  </button>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-text truncate">{d.name}</p>
                        <p className="text-xs text-muted">{d.style} · {d.color} · v{d.currentVersion}</p>
                      </div>
                      <button onClick={() => toggleFavorite(d)} className="flex-shrink-0" aria-label="Toggle favourite">
                        <Heart className={`w-5 h-5 transition-colors ${d.favorite ? 'text-rose-500 fill-rose-500' : 'text-muted hover:text-rose-400'}`} />
                      </button>
                    </div>
                    <p className="text-sm text-primary font-medium mt-2">{money(d.budget)}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted">{fmtDate(d.createdAt)}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleSaved(d)}>{d.saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />} {d.saved ? 'Saved' : 'Save'}</Button>
                        <Button variant="ghost" size="icon" onClick={() => download(d)} aria-label="Download"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setShareDesign(d); setShareOpen(true) }} aria-label="Share"><Share2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share design" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Copy this link to share "{shareDesign?.name}" with your team.</p>
          <div className="flex gap-2">
            <Input readOnly value={shareDesign ? `${window.location.origin}/interior/projects/${project.id}/designs/${shareDesign.id}` : ''} />
            <Button variant="outline" onClick={() => { if (shareDesign) navigator.clipboard?.writeText(`${window.location.origin}/interior/projects/${project.id}/designs/${shareDesign.id}`) }}>Copy</Button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShareOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
