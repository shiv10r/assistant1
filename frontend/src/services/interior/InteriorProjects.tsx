import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Label, Modal, Select, money, num, fmtDate } from '../../components/ui'
import { Home, Plus, Search, Trash2, ArrowRight, Pencil } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign, PropertyType, RoomType } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { Stepper } from '../../components/Stepper'
import { PROPERTY_TYPES, ROOM_TYPES } from './types'

const emptyProject = { name: '', propertyType: 'Apartment' as PropertyType, location: '', totalArea: '', budget: '' }
const emptyRoom = { name: '', roomType: 'Living Room' as RoomType, length: '', width: '', height: '', budget: '' }

const CREATE_STEPS = ['Project info', 'Rooms', 'Done']

export default function InteriorProjects() {
  const navigate = useNavigate()
  const { items, add, update, remove } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms, add: addRoom } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)

  const [query, setQuery] = useState('')
  const [step, setStep] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<InteriorProject | null>(null)
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [roomList, setRoomList] = useState<typeof emptyRoom[]>([])
  const [createdId, setCreatedId] = useState('')

  const filtered = useMemo(
    () => items.filter((p) => `${p.name} ${p.location} ${p.propertyType}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const designCount = (projectId: string) => designs.filter((d) => d.projectId === projectId).length
  const roomCount = (projectId: string) => rooms.filter((r) => r.projectId === projectId).length

  const columns: DataColumn<InteriorProject>[] = [
    { key: 'name', header: 'Project', render: (p) => <span className="font-medium">{p.name}</span>, sortValue: (p) => p.name },
    { key: 'type', header: 'Type', render: (p) => p.propertyType, sortValue: (p) => p.propertyType },
    { key: 'location', header: 'Location', render: (p) => p.location, sortValue: (p) => p.location },
    {
      key: 'progress', header: 'Progress', sortValue: (p) => roomCount(p.id),
      render: (p) => (
        <span className="text-sm text-muted">
          {num(roomCount(p.id))} rooms · {num(designCount(p.id))} designs
        </span>
      ),
    },
    {
      key: 'budget', header: 'Budget', sortValue: (p) => p.budget,
      render: (p) => <span className="font-medium">{money(p.budget)}</span>,
    },
    {
      key: 'status', header: 'Status', sortValue: (p) => p.status,
      render: (p) => (
        <Badge variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'info' : 'outline'} size="sm">
          {p.status}
        </Badge>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (p) => fmtDate(p.createdAt), sortValue: (p) => p.createdAt, hideOnMobile: true },
  ]

  function openAdd() {
    setEditing(null)
    setProjectForm(emptyProject)
    setRoomList([])
    setStep(0)
    setCreateOpen(true)
  }

  function openEdit(p: InteriorProject) {
    setEditing(p)
    setProjectForm({ name: p.name, propertyType: p.propertyType, location: p.location, totalArea: String(p.totalArea), budget: String(p.budget) })
    setRoomList([])
    setStep(0)
    setCreateOpen(true)
  }

  function canProceedProject() {
    return projectForm.name.trim().length > 0 && projectForm.totalArea.trim().length > 0
  }

  function saveProject() {
    if (!canProceedProject()) return
    const payload = {
      name: projectForm.name.trim(),
      propertyType: projectForm.propertyType,
      location: projectForm.location.trim(),
      totalArea: Number(projectForm.totalArea) || 0,
      budget: Number(projectForm.budget) || 0,
    }
    if (editing) {
      update(editing.id, payload)
      setCreateOpen(false)
    } else {
      const id = genId()
      add({ id, status: 'active', createdAt: new Date().toISOString(), ...payload })
      for (const r of roomList) {
        if (!r.name.trim()) continue
        addRoom({
          id: genId(),
          projectId: id,
          name: r.name.trim(),
          roomType: r.roomType,
          length: Number(r.length) || 0,
          width: Number(r.width) || 0,
          height: Number(r.height) || 0,
          budget: Number(r.budget) || 0,
          createdAt: new Date().toISOString(),
        })
      }
      setCreatedId(id)
      setStep(2)
    }
  }

  function closeCreate() {
    setCreateOpen(false)
    if (createdId) {
      navigate(`/interior/projects/${createdId}`)
      setCreatedId('')
    }
  }

  function addRoomRow() {
    setRoomList([...roomList, emptyRoom])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Projects</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> New project</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="interior-projects"
            emptyIcon={<Home className="w-6 h-6" />}
            emptyTitle="No projects yet"
            emptyDescription="Create a project to start designing rooms with AI."
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search project, location..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            }
            actions={(p) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/interior/projects/${p.id}`)} aria-label="Open"><ArrowRight className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={createOpen} onClose={closeCreate} title={editing ? 'Edit project' : 'New project'} size="lg">
        <div className="space-y-5">
          <Stepper steps={CREATE_STEPS} current={step} />

          {step === 0 && (
            <div className="space-y-4">
              <div><Label required>Project name</Label><Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. Living Room Renovation" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property type</Label>
                  <Select value={projectForm.propertyType} onValueChange={(v) => setProjectForm({ ...projectForm, propertyType: v as PropertyType })}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div><Label>Location</Label><Input value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} placeholder="City, State" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label required>Total area (sq ft)</Label><Input type="number" value={projectForm.totalArea} onChange={(e) => setProjectForm({ ...projectForm, totalArea: e.target.value })} /></div>
                <div><Label>Budget (₹)</Label><Input type="number" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} /></div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text">Rooms</p>
                <Button variant="outline" size="sm" onClick={addRoomRow}><Plus className="w-4 h-4" /> Add room</Button>
              </div>
              {roomList.length === 0 ? (
                <p className="text-sm text-muted border border-dashed border-border rounded-lg p-4 text-center">Add the rooms you want to design — you can also add them later from the project page.</p>
              ) : (
                <div className="space-y-3">
                  {roomList.map((r, i) => (
                    <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end border border-border rounded-lg p-3 bg-surface2">
                      <div><Label required>Name</Label><Input value={r.name} onChange={(e) => setRoomList(roomList.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Room name" /></div>
                      <div>
                        <Label>Type</Label>
                        <Select value={r.roomType} onValueChange={(v) => setRoomList(roomList.map((x, j) => (j === i ? { ...x, roomType: v as RoomType } : x)))}>
                          {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </Select>
                      </div>
                      <div><Label>Length (ft)</Label><Input type="number" value={r.length} onChange={(e) => setRoomList(roomList.map((x, j) => (j === i ? { ...x, length: e.target.value } : x)))} /></div>
                      <div><Label>Width (ft)</Label><Input type="number" value={r.width} onChange={(e) => setRoomList(roomList.map((x, j) => (j === i ? { ...x, width: e.target.value } : x)))} /></div>
                      <div><Label>Budget (₹)</Label><Input type="number" value={r.budget} onChange={(e) => setRoomList(roomList.map((x, j) => (j === i ? { ...x, budget: e.target.value } : x)))} /></div>
                      <Button variant="ghost" size="icon" onClick={() => setRoomList(roomList.filter((_, j) => j !== i))} aria-label="Remove room"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-6">
              <Badge variant="success" size="sm">Project created</Badge>
              <p className="mt-3 text-sm text-text font-medium">"{projectForm.name.trim()}" is ready.</p>
              <p className="text-sm text-muted mt-1">Next: open the project, add room photos and generate AI designs.</p>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-2">
            {step === 0 ? (
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            ) : (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < 2 ? (
              <Button disabled={step === 0 && !canProceedProject()} onClick={() => (step === 0 ? setStep(1) : saveProject())}>
                {step === 0 ? 'Continue' : editing ? 'Save project' : 'Create project'}
              </Button>
            ) : (
              <Button onClick={closeCreate}>Open project <ArrowRight className="w-4 h-4" /></Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
