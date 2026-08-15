import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button, Label, Input, Textarea, Select, Badge, money, num } from '../../components/ui'
import { ArrowLeft, Sparkles, AlertTriangle, Wand2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign, DesignStyle, DesignColor } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED, PRODUCT_SEED } from './seed'
import { STYLE_OPTIONS, COLOR_OPTIONS } from './types'
import { InteriorGenerateProgress, type GenStage } from './InteriorGenerateProgress'

export default function InteriorGenerate() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs, add } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)
  const { items: products } = useLocalCollection('interior:products', PRODUCT_SEED)

  const project = projects.find((p) => p.id === id)
  const projectRooms = rooms.filter((r) => r.projectId === id)

  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState(searchParams.get('room') ?? '')
  const [style, setStyle] = useState<DesignStyle>('Modern')
  const [color, setColor] = useState<DesignColor>('Grey')
  const [budget, setBudget] = useState('')
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<GenStage>('idle')
  const [progress, setProgress] = useState(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const selectedRoom = projectRooms.find((r) => r.id === roomId)
  const canStart = Boolean(project) && Boolean(roomId) && name.trim().length > 0 && stage !== 'generating'

  function pickProducts(designStyle: DesignStyle, designColor: DesignColor) {
    const seed = `${designStyle}-${designColor}`
    let h = 0
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const byCategory = new Map<string, typeof products>()
    for (const p of products) {
      const list = byCategory.get(p.category) ?? []
      list.push(p)
      byCategory.set(p.category, list)
    }
    const picked: string[] = []
    for (const list of byCategory.values()) {
      const idx = h % list.length
      picked.push(list[idx].id)
      h = (h * 31 + 7) >>> 0
    }
    return picked.slice(0, 5)
  }

  function runStage(s: GenStage, pct: number, next: GenStage, delay: number, finalize = false) {
    timers.current.push(window.setTimeout(() => {
      setStage(s)
      setProgress(pct)
      if (finalize) {
        const room = projectRooms.find((r) => r.id === roomId)
        if (!room) { setStage('failed'); return }
        const productIds = pickProducts(style, color)
        add({
          id: genId(),
          projectId: project!.id,
          roomId: room.id,
          name: name.trim(),
          style,
          color,
          budget: Number(budget) || room.budget,
          status: 'completed',
          favorite: false,
          saved: false,
          createdAt: new Date().toISOString(),
          currentVersion: 1,
          versions: [
            {
              id: genId(),
              version: 1,
              style,
              color,
              budget: Number(budget) || room.budget,
              prompt: prompt.trim() || 'AI generated design',
              productIds,
              createdAt: new Date().toISOString(),
            },
          ],
        })
        setStage('completed')
      } else {
        runStage(next, pct + 25, next === 'generating' ? 'completed' : next, delay + 900, next === 'generating')
      }
    }, delay))
  }

  function start() {
    if (!canStart) return
    setProgress(0)
    setStage('uploading')
    const roomHasImage = Boolean(selectedRoom?.image)
    if (roomHasImage) {
      runStage('uploading', 15, 'processing', 600, false)
    } else {
      runStage('processing', 30, 'generating', 400, false)
    }
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back to projects</Button>
        <Card><CardContent className="py-10 text-center text-sm text-muted">Project not found.</CardContent></Card>
      </div>
    )
  }

  const roomDesigns = designs.filter((d) => d.projectId === project.id)

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(`/interior/projects/${project.id}`)}><ArrowLeft className="w-4 h-4" /> Back to {project.name}</Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary" /> AI design generator</CardTitle>
            </CardHeader>
            <CardContent>
              {stage === 'idle' || stage === 'failed' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Design name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Modern Living Room" />
                    </div>
                    <div>
                      <Label required>Room</Label>
                      <Select value={roomId} onValueChange={setRoomId} disabled={projectRooms.length === 0}>
                        <option value="">Select a room</option>
                        {projectRooms.map((r) => <option key={r.id} value={r.id}>{r.name} {r.image ? '· photo ✓' : '· no photo'}</option>)}
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Design style</Label>
                      <Select value={style} onValueChange={(v) => setStyle(v as DesignStyle)}>
                        {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Color palette</Label>
                      <Select value={color} onValueChange={(v) => setColor(v as DesignColor)}>
                        {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </div>
                  </div>
                  <div><Label>Budget (₹)</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={selectedRoom ? `Default: ${money(selectedRoom.budget)}` : 'Room budget'} /></div>
                  <div><Label>What do you want?</Label><Textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. I want an L-shaped sofa, TV unit and warm lighting..." /></div>

                  {selectedRoom && !selectedRoom.image && (
                    <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> This room has no photo — the AI will work from dimensions and style only.</p>
                  )}

                  {stage === 'failed' && (
                    <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Generation failed. Please try again.</p>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={start} disabled={!canStart}><Sparkles className="w-4 h-4" /> Generate design</Button>
                  </div>
                </div>
              ) : (
                <InteriorGenerateProgress
                  stage={stage}
                  progress={progress}
                  name={name}
                  roomName={selectedRoom?.name}
                  onGenerateAnother={() => { setStage('idle'); setProgress(0) }}
                  onViewDesign={() => {
                      const created = designs.find((d) => d.name === name.trim() && d.projectId === project.id && d.roomId === roomId && d.status === 'completed')
                      navigate(created ? `/interior/projects/${project.id}/designs/${created.id}` : `/interior/projects/${project.id}/designs`)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Room summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoom ? (
                <div className="space-y-3">
                  {selectedRoom.image && (
                    <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-36 object-cover rounded-lg border border-border" />
                  )}
                  <p className="text-sm font-medium text-text">{selectedRoom.name}</p>
                  <p className="text-xs text-muted">{num(selectedRoom.length)} × {num(selectedRoom.width)} × {num(selectedRoom.height)} ft · {money(selectedRoom.budget)}</p>
                  {selectedRoom.notes && <p className="text-xs text-muted">{selectedRoom.notes}</p>}
                </div>
              ) : (
                <p className="text-sm text-muted py-4 text-center">Select a room to see its details.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <p className="flex items-start gap-2"><span className="text-primary font-medium">1.</span> Upload a photo of your room</p>
              <p className="flex items-start gap-2"><span className="text-primary font-medium">2.</span> Pick a style, palette and budget</p>
              <p className="flex items-start gap-2"><span className="text-primary font-medium">3.</span> The AI creates a design concept with furniture, decor and lighting</p>
              <p className="flex items-start gap-2"><span className="text-primary font-medium">4.</span> Review, save or tweak — then generate a cost estimate</p>
              <Badge variant="info" size="sm">Frontend preview</Badge>
            </CardContent>
          </Card>

          {roomDesigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Existing designs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roomDesigns.map((d) => (
                    <button key={d.id} className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors text-left" onClick={() => navigate(`/interior/projects/${project.id}/designs/${d.id}`)}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{d.name}</p>
                        <p className="text-xs text-muted">{d.style} · {d.color} · {money(d.budget)}</p>
                      </div>
                      <Badge variant={d.status === 'completed' ? 'success' : d.status === 'generating' ? 'warning' : 'danger'} size="sm">{d.status}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
