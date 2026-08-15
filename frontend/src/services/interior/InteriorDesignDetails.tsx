import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Badge, Label, Textarea, Select, money, fmtDate } from '../../components/ui'
import { ArrowLeft, Heart, Bookmark, Download, Wand2, History, Check, Sparkles } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign, InteriorProduct, DesignStyle, DesignColor } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED, PRODUCT_SEED } from './seed'
import { STYLE_OPTIONS, COLOR_OPTIONS } from './types'
import { InteriorDesignVersionPanel, InteriorDesignVersionPreview } from './InteriorDesignVersionPanel'

export default function InteriorDesignDetails() {
  const { id, designId } = useParams<{ id: string; designId: string }>()
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs, update } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)
  const { items: products } = useLocalCollection<InteriorProduct>('interior:products', PRODUCT_SEED)

  const project = projects.find((p) => p.id === id)
  const design = designs.find((d) => d.id === designId && d.projectId === id)

  const [modifyOpen, setModifyOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [modifyStyle, setModifyStyle] = useState<DesignStyle>('Modern')
  const [modifyColor, setModifyColor] = useState<DesignColor>('Grey')
  const [modifyPrompt, setModifyPrompt] = useState('')
  const [newVersion, setNewVersion] = useState<InteriorDesign | null>(null)

  const room = design ? rooms.find((r) => r.id === design.roomId) : undefined
  const currentVersion = design?.versions.find((v) => v.version === design.currentVersion)
  const versionProducts = useMemo(() => {
    if (!currentVersion) return []
    return currentVersion.productIds.map((pid) => products.find((p) => p.id === pid)).filter((p): p is InteriorProduct => Boolean(p))
  }, [currentVersion, products])
  const estimate = versionProducts.reduce((s, p) => s + p.price, 0)

  if (!project || !design) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(id ? `/interior/projects/${id}/designs` : '/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Card><CardContent className="py-10 text-center text-sm text-muted">Design not found.</CardContent></Card>
      </div>
    )
  }

  const toggleFavorite = () => { update(design.id, { favorite: !design.favorite }) }
  const toggleSaved = () => { update(design.id, { saved: !design.saved }) }

  const download = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520"><rect width="800" height="520" fill="#1e293b"/><text x="40" y="60" fill="#fff" font-size="28" font-family="sans-serif">${design.name}</text><text x="40" y="100" fill="#94a3b8" font-size="18" font-family="sans-serif">${design.style} · ${design.color} · v${design.currentVersion}</text><text x="40" y="140" fill="#fff" font-size="20" font-family="sans-serif">${money(design.budget)}</text></svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}-v${design.currentVersion}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const applyVersion = (v: { version: number }) => {
    update(design.id, { currentVersion: v.version })
  }

  const saveModify = () => {
    const nextVersion = design.versions.length + 1
    const productIds = currentVersion?.productIds ?? []
    const updated: InteriorDesign = {
      ...design,
      style: modifyStyle,
      color: modifyColor,
      versions: [
        ...design.versions,
        {
          id: genId(),
          version: nextVersion,
          style: modifyStyle,
          color: modifyColor,
          budget: design.budget,
          prompt: modifyPrompt.trim() || 'Modified design',
          productIds,
          createdAt: new Date().toISOString(),
        },
      ],
      currentVersion: nextVersion,
    }
    update(design.id, updated)
    setNewVersion(updated)
    setModifyOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(`/interior/projects/${project.id}/designs`)}><ArrowLeft className="w-4 h-4" /> Back to designs</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCompareOpen(true)} disabled={design.versions.length < 2}><History className="w-4 h-4" /> Compare versions</Button>
          <Button size="sm" onClick={() => { setModifyStyle(design.style); setModifyColor(design.color); setModifyPrompt(''); setModifyOpen(true) }}><Wand2 className="w-4 h-4" /> Modify</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{design.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
              <span>{room?.name ?? 'Room'}</span>
              <span>·</span>
              <Badge variant="info" size="sm">{design.style}</Badge>
              <Badge variant="outline" size="sm">{design.color}</Badge>
              <span>·</span>
              <span>v{design.currentVersion}</span>
              <span>·</span>
              <span>{fmtDate(design.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={toggleFavorite} aria-label="Favourite"><Heart className={`w-5 h-5 ${design.favorite ? 'text-rose-500 fill-rose-500' : ''}`} /></Button>
            <Button variant="ghost" size="icon" onClick={toggleSaved} aria-label="Save"><Bookmark className={`w-5 h-5 ${design.saved ? 'text-primary fill-primary' : ''}`} /></Button>
            <Button variant="ghost" size="icon" onClick={download} aria-label="Download"><Download className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentVersion && (
            <div className="rounded-lg overflow-hidden border border-border"><InteriorDesignVersionPreview design={design} version={currentVersion.version} style={design.style} /></div>
          )}
          {currentVersion?.prompt && <p className="text-sm text-muted italic">"{currentVersion.prompt}"</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
            <p className="text-sm text-muted">Estimated cost: <span className="text-lg font-semibold text-primary">{money(estimate)}</span></p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/interior/projects/${project.id}/quotation`)}>View cost estimate</Button>
              <Button onClick={() => navigate(`/interior/projects/${project.id}/generate`)}><Sparkles className="w-4 h-4" /> Generate new design</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Products in this design</CardTitle>
            </CardHeader>
            <CardContent>
              {versionProducts.length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No products linked to this version.</p>
              ) : (
                <div className="space-y-2">
                  {versionProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{p.name}</p>
                        <p className="text-xs text-muted">{p.category} · {p.material ?? '—'} {p.color ? `· ${p.color}` : ''}</p>
                      </div>
                      <p className="text-sm font-medium text-primary flex-shrink-0">{money(p.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <InteriorDesignVersionPanel design={design} compareOpen={compareOpen} onCloseCompare={() => setCompareOpen(false)} onRestore={applyVersion} />
        </div>
      </div>

      {newVersion && (
        <Card className="border-emerald-500/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Check className="w-4 h-4" /> New version v{newVersion.currentVersion} created — view it now.
            </div>
            <Button size="sm" onClick={() => { setNewVersion(null); navigate(`/interior/projects/${project.id}/designs/${design.id}`) }}>View latest</Button>
          </CardContent>
        </Card>
      )}

      <Modal open={modifyOpen} onClose={() => setModifyOpen(false)} title="Modify design" size="md">
        <div className="space-y-4">
          <p className="text-sm text-muted">This will create a new version (v{design.versions.length + 1}) of "{design.name}".</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Design style</Label>
              <Select value={modifyStyle} onValueChange={(v) => setModifyStyle(v as DesignStyle)}>
                {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <Label>Color palette</Label>
              <Select value={modifyColor} onValueChange={(v) => setModifyColor(v as DesignColor)}>
                {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>What should change?</Label><Textarea rows={3} value={modifyPrompt} onChange={(e) => setModifyPrompt(e.target.value)} placeholder="e.g. Make the sofa blue and add indoor plants..." /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModifyOpen(false)}>Cancel</Button>
            <Button onClick={saveModify}><Wand2 className="w-4 h-4" /> Create version v{design.versions.length + 1}</Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
