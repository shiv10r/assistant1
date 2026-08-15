import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Modal, Select, money, num, fmtDate } from '../../components/ui'
import { ArrowLeft, Plus, Sparkles, Trash2, Camera, MapPin, Ruler, Wallet, CalendarDays, Eye } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign, RoomType } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED } from './seed'
import { ROOM_TYPES } from './types'

const emptyRoom = { name: '', roomType: 'Living Room' as RoomType, length: '', width: '', height: '', budget: '' }

export default function InteriorProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms, add, remove } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)

  const project = projects.find((p) => p.id === id)

  const [roomOpen, setRoomOpen] = useState(false)
  const [form, setForm] = useState(emptyRoom)

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back to projects</Button>
        <Card><CardContent className="py-10 text-center text-sm text-muted">Project not found.</CardContent></Card>
      </div>
    )
  }

  const projectRooms = rooms.filter((r) => r.projectId === project.id)
  const projectDesigns = designs.filter((d) => d.projectId === project.id)
  const areaTotal = projectRooms.reduce((s, r) => s + r.length * r.width, 0)
  const unusedArea = Math.max(project.totalArea - Math.round(areaTotal), 0)

  const saveRoom = () => {
    if (!form.name.trim()) return
    add({
      id: genId(),
      projectId: project.id,
      name: form.name.trim(),
      roomType: form.roomType,
      length: Number(form.length) || 0,
      width: Number(form.width) || 0,
      height: Number(form.height) || 0,
      budget: Number(form.budget) || 0,
      createdAt: new Date().toISOString(),
    })
    setRoomOpen(false)
    setForm(emptyRoom)
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back to projects</Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location || '—'}</span>
              <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {num(project.totalArea)} sq ft</span>
              <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> {money(project.budget)}</span>
              <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {fmtDate(project.createdAt)}</span>
            </div>
          </div>
          <Badge variant={project.status === 'active' ? 'success' : project.status === 'completed' ? 'info' : 'outline'}>{project.status}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface2">
              <p className="text-xs text-muted">Rooms</p>
              <p className="text-xl font-semibold mt-1">{num(projectRooms.length)}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface2">
              <p className="text-xs text-muted">AI designs</p>
              <p className="text-xl font-semibold mt-1">{num(projectDesigns.length)}</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface2">
              <p className="text-xs text-muted">Area covered</p>
              <p className="text-xl font-semibold mt-1">{num(Math.round(areaTotal))} <span className="text-xs text-muted font-normal">sq ft</span></p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface2">
              <p className="text-xs text-muted">Unused area</p>
              <p className="text-xl font-semibold mt-1">{num(unusedArea)} <span className="text-xs text-muted font-normal">sq ft</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text">Rooms</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRoomOpen(true)}><Plus className="w-4 h-4" /> Add room</Button>
          <Button onClick={() => navigate(`/interior/projects/${project.id}/generate`)}><Sparkles className="w-4 h-4" /> Generate AI design</Button>
        </div>
      </div>

      {projectRooms.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Camera className="w-8 h-8 mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium text-text">No rooms yet</p>
            <p className="text-sm text-muted mt-1">Add a room, then upload its photo to generate AI designs.</p>
            <Button className="mt-4" onClick={() => setRoomOpen(true)}><Plus className="w-4 h-4" /> Add room</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectRooms.map((r) => {
            const roomDesigns = projectDesigns.filter((d) => d.roomId === r.id)
            return (
              <Card key={r.id} className="overflow-hidden">
                {r.image ? (
                  <button className="block w-full h-36 bg-surface2 relative group" onClick={() => navigate(`/interior/projects/${project.id}/rooms/${r.id}`)}>
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </span>
                  </button>
                ) : (
                  <button className="block w-full h-36 bg-surface2 flex flex-col items-center justify-center gap-1 text-muted hover:text-primary transition-colors" onClick={() => navigate(`/interior/projects/${project.id}/rooms/${r.id}`)}>
                    <Camera className="w-6 h-6" />
                    <span className="text-xs">Upload photo</span>
                  </button>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-text">{r.name}</p>
                    <Badge variant="outline" size="sm">{r.roomType}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-1">{num(r.length)} × {num(r.width)} ft · {money(r.budget)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">{num(roomDesigns.length)} design{roomDesigns.length === 1 ? '' : 's'}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/interior/projects/${project.id}/rooms/${r.id}`)}>Open</Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete room"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {projectDesigns.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-text pt-2">Designs</h2>
          <Card>
            <CardContent>
              <div className="divide-y divide-border">
                {projectDesigns.map((d) => (
                  <button key={d.id} className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-surface2 px-2 rounded-lg transition-colors" onClick={() => navigate(`/interior/projects/${project.id}/designs/${d.id}`)}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{d.name}</p>
                      <p className="text-xs text-muted">{d.style} · {d.color} · v{d.currentVersion} · {money(d.budget)}</p>
                    </div>
                    <Badge variant={d.status === 'completed' ? 'success' : d.status === 'generating' ? 'warning' : 'danger'} size="sm">{d.status}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Modal open={roomOpen} onClose={() => setRoomOpen(false)} title="Add room" size="md">
        <div className="space-y-4">
          <div><Label required>Room name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Master Bedroom" /></div>
          <div>
            <Label>Room type</Label>
            <Select value={form.roomType} onValueChange={(v) => setForm({ ...form, roomType: v as RoomType })}>
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Length (ft)</Label><Input type="number" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} /></div>
            <div><Label>Width (ft)</Label><Input type="number" value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} /></div>
            <div><Label>Height (ft)</Label><Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} /></div>
          </div>
          <div><Label>Budget (₹)</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRoomOpen(false)}>Cancel</Button>
            <Button onClick={saveRoom} disabled={!form.name.trim()}>Add room</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
