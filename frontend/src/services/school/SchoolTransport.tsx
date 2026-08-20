import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { Bus, Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Vehicle, TransportRoute } from './types'
import { VEHICLE_SEED, ROUTE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KPICard } from '../../components/ui'
import { StatusBadge } from '../../components/StatusBadge'
import { money } from '../../components/ui'

export default function SchoolTransport() {
  const { items: vehicles, add: addVehicle, update: updateVehicle, remove: removeVehicle } = useLocalCollection<Vehicle>('school:vehicles', VEHICLE_SEED)
  const { items: routes, add: addRoute, update: updateRoute, remove: removeRoute } = useLocalCollection<TransportRoute>('school:routes', ROUTE_SEED)
  const [vehicleModal, setVehicleModal] = useState(false)
  const [routeModal, setRouteModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null)
  const [vehicleForm, setVehicleForm] = useState({ regNo: '', type: 'bus' as Vehicle['type'], capacity: 40, driver: '', route: '', status: 'active' as Vehicle['status'] })
  const [routeForm, setRouteForm] = useState({ name: '', stops: '', fare: 0, vehicleId: vehicles[0]?.id ?? '' })
  const [tab, setTab] = useState('vehicles')

  const vehicleColumns: DataColumn<Vehicle>[] = [
    { key: 'regNo', header: 'Reg no', render: (v) => <span className="font-medium">{v.regNo}</span>, sortValue: (v) => v.regNo },
    { key: 'type', header: 'Type', render: (v) => <span className="capitalize">{v.type}</span>, sortValue: (v) => v.type },
    { key: 'capacity', header: 'Capacity', render: (v) => v.capacity },
    { key: 'driver', header: 'Driver', render: (v) => v.driver },
    { key: 'route', header: 'Route', render: (v) => v.route || <span className="text-muted text-sm">—</span> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} />, sortValue: (v) => v.status },
  ]

  const routeColumns: DataColumn<TransportRoute>[] = [
    { key: 'name', header: 'Route', render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: 'stops', header: 'Stops', render: (r) => r.stops.join(' → ') },
    { key: 'fare', header: 'Fare', render: (r) => money(r.fare), sortValue: (r) => r.fare },
    { key: 'vehicle', header: 'Vehicle', render: (r) => vehicles.find((v) => v.id === r.vehicleId)?.regNo ?? <span className="text-muted text-sm">—</span> },
  ]

  function openAddVehicle() {
    setEditingVehicle(null)
    setVehicleForm({ regNo: '', type: 'bus', capacity: 40, driver: '', route: '', status: 'active' })
    setVehicleModal(true)
  }

  function openEditVehicle(v: Vehicle) {
    setEditingVehicle(v)
    setVehicleForm({ regNo: v.regNo, type: v.type, capacity: v.capacity, driver: v.driver, route: v.route, status: v.status })
    setVehicleModal(true)
  }

  function saveVehicle() {
    if (!vehicleForm.regNo.trim()) return
    const payload = { ...vehicleForm, capacity: Number(vehicleForm.capacity) }
    if (editingVehicle) updateVehicle(editingVehicle.id, payload)
    else addVehicle({ id: genId(), ...payload })
    setVehicleModal(false)
  }

  function openAddRoute() {
    setEditingRoute(null)
    setRouteForm({ name: '', stops: '', fare: 0, vehicleId: vehicles[0]?.id ?? '' })
    setRouteModal(true)
  }

  function openEditRoute(r: TransportRoute) {
    setEditingRoute(r)
    setRouteForm({ name: r.name, stops: r.stops.join('\n'), fare: r.fare, vehicleId: r.vehicleId })
    setRouteModal(true)
  }

  function saveRoute() {
    if (!routeForm.name.trim()) return
    const payload = { ...routeForm, stops: routeForm.stops.split('\n').map((s) => s.trim()).filter(Boolean), fare: Number(routeForm.fare) }
    if (editingRoute) updateRoute(editingRoute.id, payload)
    else addRoute({ id: genId(), ...payload })
    setRouteModal(false)
  }

  const activeVehicles = vehicles.filter((v) => v.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Vehicles" value={vehicles.length} icon={<Bus className="w-5 h-5" />} tone="info" />
        <KPICard label="Active" value={activeVehicles} icon={<Bus className="w-5 h-5" />} tone="success" />
        <KPICard label="Routes" value={routes.length} icon={<Bus className="w-5 h-5" />} tone="default" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddVehicle}><Plus className="w-4 h-4" /> Add vehicle</Button>
              </div>
              <DataTable
                columns={vehicleColumns}
                rows={vehicles}
                rowKey={(v) => v.id}
                pageSize={10}
                exportFilename="school-vehicles"
                emptyIcon={<Bus className="w-6 h-6" />}
                emptyTitle="No vehicles"
                emptyDescription="Add buses and vans to your fleet."
                actions={(v) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditVehicle(v)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeVehicle(v.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="routes" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddRoute}><Plus className="w-4 h-4" /> Add route</Button>
              </div>
              <DataTable
                columns={routeColumns}
                rows={routes}
                rowKey={(r) => r.id}
                pageSize={10}
                exportFilename="school-routes"
                emptyIcon={<Bus className="w-6 h-6" />}
                emptyTitle="No routes"
                emptyDescription="Define transport routes with stops and fares."
                actions={(r) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditRoute(r)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeRoute(r.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={vehicleModal} onClose={() => setVehicleModal(false)} title={editingVehicle ? 'Edit vehicle' : 'Add vehicle'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Registration no</Label><Input value={vehicleForm.regNo} onChange={(e) => setVehicleForm({ ...vehicleForm, regNo: e.target.value })} placeholder="MH 12 AB 1234" /></div>
            <div>
              <Label>Type</Label>
              <Select value={vehicleForm.type} onValueChange={(v) => setVehicleForm({ ...vehicleForm, type: v as Vehicle['type'] })}>
                <option value="bus">Bus</option>
                <option value="van">Van</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Capacity</Label><Input type="number" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })} /></div>
            <div><Label>Driver</Label><Input value={vehicleForm.driver} onChange={(e) => setVehicleForm({ ...vehicleForm, driver: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Route</Label><Input value={vehicleForm.route} onChange={(e) => setVehicleForm({ ...vehicleForm, route: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={vehicleForm.status} onValueChange={(v) => setVehicleForm({ ...vehicleForm, status: v as Vehicle['status'] })}>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setVehicleModal(false)}>Cancel</Button>
            <Button onClick={saveVehicle}>{editingVehicle ? 'Save changes' : 'Add vehicle'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={routeModal} onClose={() => setRouteModal(false)} title={editingRoute ? 'Edit route' : 'Add route'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Route name</Label><Input value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} placeholder="Route 1" /></div>
            <div>
              <Label>Vehicle</Label>
              <Select value={routeForm.vehicleId} onValueChange={(v) => setRouteForm({ ...routeForm, vehicleId: v })}>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Stops (one per line)</Label><Textarea value={routeForm.stops} onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })} placeholder={'Andheri\nVile Parle\nSantacruz'} /></div>
          <div><Label>Fare</Label><Input type="number" value={routeForm.fare} onChange={(e) => setRouteForm({ ...routeForm, fare: Number(e.target.value) })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRouteModal(false)}>Cancel</Button>
            <Button onClick={saveRoute}>{editingRoute ? 'Save changes' : 'Add route'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}