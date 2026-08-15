import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Label, Input, Textarea, money, num, fmtDate } from '../../components/ui'
import { ArrowLeft, Sparkles, Trash2, UploadCloud, RefreshCw } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED } from './seed'

export default function InteriorRoomDetails() {
  const { id, roomId } = useParams<{ id: string; roomId: string }>()
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms, update, remove } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)

  const room = rooms.find((r) => r.id === roomId)
  const project = projects.find((p) => p.id === id)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!project || !room) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(id ? `/interior/projects/${id}` : '/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Card><CardContent className="py-10 text-center text-sm text-muted">Room not found.</CardContent></Card>
      </div>
    )
  }

  const roomDesigns = designs.filter((d) => d.roomId === room.id && d.projectId === project.id)
  const area = room.length * room.width

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      update(room.id, { image: String(reader.result) })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(`/interior/projects/${project.id}`)}><ArrowLeft className="w-4 h-4" /> Back to {project.name}</Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{room.name}</CardTitle>
                <p className="text-sm text-muted mt-1">{room.roomType} · {fmtDate(room.createdAt)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { remove(room.id); navigate(`/interior/projects/${project.id}`) }} aria-label="Delete room"><Trash2 className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Length</p>
                  <p className="text-lg font-semibold mt-1">{num(room.length)} <span className="text-xs text-muted font-normal">ft</span></p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Width</p>
                  <p className="text-lg font-semibold mt-1">{num(room.width)} <span className="text-xs text-muted font-normal">ft</span></p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Height</p>
                  <p className="text-lg font-semibold mt-1">{num(room.height)} <span className="text-xs text-muted font-normal">ft</span></p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Area</p>
                  <p className="text-lg font-semibold mt-1">{num(area)} <span className="text-xs text-muted font-normal">sq ft</span></p>
                </div>
              </div>

              {room.notes && <p className="text-sm text-muted mt-4">{room.notes}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted">Budget: <span className="font-medium text-text">{money(room.budget)}</span></p>
                <Button onClick={() => navigate(`/interior/projects/${project.id}/generate?room=${room.id}`)} disabled={!room.image}>
                  <Sparkles className="w-4 h-4" /> Generate AI design
                </Button>
              </div>
              {!room.image && (
                <p className="text-xs text-amber-600 mt-2">Upload a room photo first to enable AI design generation.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Room photo</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {room.image ? (
                <div className="relative rounded-lg overflow-hidden border border-border group">
                  <img src={room.image} alt={room.name} className="w-full max-h-72 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white/90" onClick={() => fileRef.current?.click()}><RefreshCw className="w-4 h-4" /> Replace</Button>
                    <Button variant="destructive" size="sm" className="bg-white/90 text-red-600 hover:text-red-700" onClick={() => update(room.id, { image: undefined })}><Trash2 className="w-4 h-4" /> Remove</Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
                  className={`w-full border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-2 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border bg-surface2 hover:border-primary/50'}`}
                >
                  <UploadCloud className="w-8 h-8 text-muted" />
                  <p className="text-sm font-medium text-text">Drag & drop a room photo here</p>
                  <p className="text-xs text-muted">or click to browse · JPG, PNG or WEBP</p>
                </button>
              )}
              <p className="text-xs text-muted mt-2">The photo stays in your browser — the AI design flow uses it to style the room.</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI designs for this room</CardTitle>
            </CardHeader>
            <CardContent>
              {roomDesigns.length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">No designs yet — generate your first one.</p>
              ) : (
                <div className="space-y-2">
                  {roomDesigns.map((d) => (
                    <button key={d.id} className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors text-left" onClick={() => navigate(`/interior/projects/${project.id}/designs/${d.id}`)}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{d.name}</p>
                        <p className="text-xs text-muted">{d.style} · {d.color} · v{d.currentVersion}</p>
                      </div>
                      <Badge variant={d.status === 'completed' ? 'success' : d.status === 'generating' ? 'warning' : 'danger'} size="sm">{d.status}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Room details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div><Label>Notes</Label><Textarea rows={3} value={room.notes ?? ''} onChange={(e) => update(room.id, { notes: e.target.value })} placeholder="e.g. South-facing window, needs storage corner..." /></div>
                <div><Label>Budget (₹)</Label><Input type="number" value={String(room.budget)} onChange={(e) => update(room.id, { budget: Number(e.target.value) || 0 })} /></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
