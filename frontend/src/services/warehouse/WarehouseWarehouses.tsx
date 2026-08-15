import { useMemo, useState } from 'react'
import {
  Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal,
} from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { Building2, MapPin, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Warehouse, LocationBin } from './types'
import { WAREHOUSE_SEED, LOCATION_SEED } from './seed'
import { DataTable, type DataColumn } from './components/DataTable'
import { StatusBadge } from './components/StatusBadge'

const emptyWh = { name: '', code: '', address: '', contactPerson: '', phone: '', status: 'active' as 'active' | 'inactive' }
const emptyLoc = { warehouseId: 'wh-1', code: '', zone: '', rack: '', bin: '', capacity: '0', status: 'active' as 'active' | 'inactive' }

export default function WarehouseWarehouses() {
  const { items: warehouses, add: addWh, update: updateWh, remove: removeWh } = useLocalCollection<Warehouse>('warehouse:warehouses', WAREHOUSE_SEED)
  const { items: locations, add: addLoc, update: updateLoc, remove: removeLoc } = useLocalCollection<LocationBin>('warehouse:locations', LOCATION_SEED)
  const { toast } = useToast()

  const [whQuery, setWhQuery] = useState('')
  const [locQuery, setLocQuery] = useState('')
  const [locWarehouse, setLocWarehouse] = useState('all')

  const [whModalOpen, setWhModalOpen] = useState(false)
  const [editingWh, setEditingWh] = useState<Warehouse | null>(null)
  const [whForm, setWhForm] = useState(emptyWh)

  const [locModalOpen, setLocModalOpen] = useState(false)
  const [editingLoc, setEditingLoc] = useState<LocationBin | null>(null)
  const [locForm, setLocForm] = useState(emptyLoc)

  const filteredWh = useMemo(() => {
    const q = whQuery.toLowerCase()
    return warehouses.filter((w) => `${w.name} ${w.code} ${w.address} ${w.contactPerson}`.toLowerCase().includes(q))
  }, [warehouses, whQuery])

  const filteredLoc = useMemo(() => {
    const q = locQuery.toLowerCase()
    return locations.filter((l) => {
      const matchesQ = `${l.code} ${l.zone} ${l.rack} ${l.bin}`.toLowerCase().includes(q)
      const matchesW = locWarehouse === 'all' || l.warehouseId === locWarehouse
      return matchesQ && matchesW
    })
  }, [locations, locQuery, locWarehouse])

  function openAddWh() { setEditingWh(null); setWhForm(emptyWh); setWhModalOpen(true) }
  function openEditWh(w: Warehouse) {
    setEditingWh(w)
    setWhForm({ name: w.name, code: w.code, address: w.address, contactPerson: w.contactPerson, phone: w.phone, status: w.status })
    setWhModalOpen(true)
  }

  function saveWh() {
    if (!whForm.name.trim() || !whForm.code.trim()) {
      toast({ title: 'Warehouse name and code are required', variant: 'error' })
      return
    }
    if (editingWh) {
      updateWh(editingWh.id, whForm)
      toast({ title: 'Warehouse updated', description: whForm.name })
    } else {
      addWh({ id: genId(), ...whForm })
      toast({ title: 'Warehouse added', description: whForm.name })
    }
    setWhModalOpen(false)
  }

  function removeWarehouseSafe(w: Warehouse) {
    const hasLocs = locations.some((l) => l.warehouseId === w.id)
    if (hasLocs) {
      toast({ title: 'Cannot delete', description: 'Remove this warehouse locations first', variant: 'error' })
      return
    }
    removeWh(w.id)
    toast({ title: 'Warehouse deleted', description: w.name })
  }

  function openAddLoc() { setEditingLoc(null); setLocForm(emptyLoc); setLocModalOpen(true) }
  function openEditLoc(l: LocationBin) {
    setEditingLoc(l)
    setLocForm({ warehouseId: l.warehouseId, code: l.code, zone: l.zone, rack: l.rack, bin: l.bin, capacity: String(l.capacity), status: l.status })
    setLocModalOpen(true)
  }

  function saveLoc() {
    if (!locForm.code.trim()) {
      toast({ title: 'Location code is required', variant: 'error' })
      return
    }
    const patch = { ...locForm, capacity: Number(locForm.capacity) || 0 }
    if (editingLoc) {
      updateLoc(editingLoc.id, patch)
      toast({ title: 'Location updated', description: locForm.code })
    } else {
      addLoc({ id: genId(), ...patch })
      toast({ title: 'Location added', description: locForm.code })
    }
    setLocModalOpen(false)
  }

  const whColumns: DataColumn<Warehouse>[] = [
    {
      key: 'code', header: 'Code',
      render: (w) => <span className="font-mono text-xs font-semibold">{w.code}</span>,
      sortValue: (w) => w.code,
      csvValue: (w) => w.code,
    },
    { key: 'name', header: 'Name', render: (w) => w.name, sortValue: (w) => w.name, csvValue: (w) => w.name },
    { key: 'address', header: 'Address', render: (w) => <span className="text-xs">{w.address || '—'}</span>, hideOnMobile: true },
    { key: 'contact', header: 'Contact', render: (w) => w.contactPerson || '—', hideOnMobile: true },
    { key: 'phone', header: 'Phone', render: (w) => w.phone || '—', hideOnMobile: true },
    { key: 'status', header: 'Status', render: (w) => <StatusBadge status={w.status} />, sortValue: (w) => w.status, csvValue: (w) => w.status },
  ]

  const locColumns: DataColumn<LocationBin>[] = [
    {
      key: 'code', header: 'Location code',
      render: (l) => <span className="font-mono text-xs font-semibold">{l.code}</span>,
      sortValue: (l) => l.code,
      csvValue: (l) => l.code,
    },
    {
      key: 'warehouse', header: 'Warehouse',
      render: (l) => warehouses.find((w) => w.id === l.warehouseId)?.name ?? '—',
      sortValue: (l) => l.warehouseId,
    },
    { key: 'zone', header: 'Zone', render: (l) => l.zone || '—', sortValue: (l) => l.zone },
    { key: 'rack', header: 'Rack', render: (l) => l.rack || '—', sortValue: (l) => l.rack },
    { key: 'bin', header: 'Bin', render: (l) => l.bin || '—', sortValue: (l) => l.bin },
    { key: 'capacity', header: 'Capacity', render: (l) => l.capacity, sortValue: (l) => l.capacity, hideOnMobile: true },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} />, sortValue: (l) => l.status, csvValue: (l) => l.status },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Warehouses</CardTitle>
          <Button onClick={openAddWh}><Plus className="w-4 h-4" /> Add warehouse</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={whColumns}
            rows={filteredWh}
            rowKey={(w) => w.id}
            pageSize={10}
            exportFilename="warehouse-warehouses"
            emptyIcon={<Building2 className="w-6 h-6" />}
            emptyTitle="No warehouses yet"
            emptyDescription="Add a warehouse to start organizing stock locations."
            actions={(w) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditWh(w)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => removeWarehouseSafe(w)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input placeholder="Search warehouses..." className="pl-9" value={whQuery} onChange={(e) => setWhQuery(e.target.value)} />
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Locations & Bins</CardTitle>
          <Button onClick={openAddLoc}><Plus className="w-4 h-4" /> Add location</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={locColumns}
            rows={filteredLoc}
            rowKey={(l) => l.id}
            pageSize={10}
            exportFilename="warehouse-locations"
            emptyIcon={<MapPin className="w-6 h-6" />}
            emptyTitle="No locations yet"
            emptyDescription="Add zones, racks and bins to track exactly where stock sits."
            actions={(l) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditLoc(l)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => removeLoc(l.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
            toolbar={
              <div className="flex flex-wrap gap-3 w-full">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder="Search location code..." className="pl-9" value={locQuery} onChange={(e) => setLocQuery(e.target.value)} />
                </div>
                <Select value={locWarehouse} onValueChange={setLocWarehouse} className="w-52">
                  <option value="all">All warehouses</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Modal open={whModalOpen} onClose={() => setWhModalOpen(false)} title={editingWh ? 'Edit warehouse' : 'Add warehouse'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Name</Label><Input value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} /></div>
            <div><Label required>Code</Label><Input value={whForm.code} onChange={(e) => setWhForm({ ...whForm, code: e.target.value })} placeholder="e.g. WH-GGN" /></div>
          </div>
          <div><Label>Address</Label><Input value={whForm.address} onChange={(e) => setWhForm({ ...whForm, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Contact person</Label><Input value={whForm.contactPerson} onChange={(e) => setWhForm({ ...whForm, contactPerson: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={whForm.phone} onChange={(e) => setWhForm({ ...whForm, phone: e.target.value })} /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={whForm.status} onValueChange={(v) => setWhForm({ ...whForm, status: v as 'active' | 'inactive' })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setWhModalOpen(false)}>Cancel</Button>
            <Button onClick={saveWh}>{editingWh ? 'Save changes' : 'Add warehouse'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={locModalOpen} onClose={() => setLocModalOpen(false)} title={editingLoc ? 'Edit location' : 'Add location'} size="md">
        <div className="space-y-4">
          <div>
            <Label required>Warehouse</Label>
            <Select value={locForm.warehouseId} onValueChange={(v) => setLocForm({ ...locForm, warehouseId: v })}>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </Select>
          </div>
          <div><Label required>Location code</Label><Input value={locForm.code} onChange={(e) => setLocForm({ ...locForm, code: e.target.value })} placeholder="e.g. A01-02" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Zone</Label><Input value={locForm.zone} onChange={(e) => setLocForm({ ...locForm, zone: e.target.value })} /></div>
            <div><Label>Rack</Label><Input value={locForm.rack} onChange={(e) => setLocForm({ ...locForm, rack: e.target.value })} /></div>
            <div><Label>Bin</Label><Input value={locForm.bin} onChange={(e) => setLocForm({ ...locForm, bin: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Capacity</Label><Input type="number" value={locForm.capacity} onChange={(e) => setLocForm({ ...locForm, capacity: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={locForm.status} onValueChange={(v) => setLocForm({ ...locForm, status: v as 'active' | 'inactive' })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setLocModalOpen(false)}>Cancel</Button>
            <Button onClick={saveLoc}>{editingLoc ? 'Save changes' : 'Add location'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}