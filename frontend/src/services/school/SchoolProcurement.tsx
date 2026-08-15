import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { ShoppingCart, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { Vendor, PurchaseOrder } from './types'
import { VENDOR_SEED, PO_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'
import { StatusBadge } from '../../components/StatusBadge'
import { money } from '../../components/ui'

export default function SchoolProcurement() {
  const { items: vendors, add: addVendor, update: updateVendor, remove: removeVendor } = useLocalCollection<Vendor>('school:vendors', VENDOR_SEED)
  const { items: orders, add: addOrder, update: updateOrder, remove: removeOrder } = useLocalCollection<PurchaseOrder>('school:pos', PO_SEED)
  const [vendorModal, setVendorModal] = useState(false)
  const [orderModal, setOrderModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [vendorForm, setVendorForm] = useState({ name: '', phone: '', email: '', category: '', gst: '' })
  const [orderForm, setOrderForm] = useState({ vendorId: vendors[0]?.id ?? '', items: '', total: 0, status: 'draft' as PurchaseOrder['status'], date: new Date().toISOString().slice(0, 10) })
  const [tab, setTab] = useState('orders')

  const vendorColumns: DataColumn<Vendor>[] = [
    { key: 'name', header: 'Vendor', render: (v) => <span className="font-medium">{v.name}</span>, sortValue: (v) => v.name },
    { key: 'category', header: 'Category', render: (v) => v.category, sortValue: (v) => v.category },
    { key: 'phone', header: 'Phone', render: (v) => v.phone, hideOnMobile: true },
    { key: 'gst', header: 'GST', render: (v) => v.gst, hideOnMobile: true },
  ]

  const orderColumns: DataColumn<PurchaseOrder>[] = [
    { key: 'vendorName', header: 'Vendor', render: (o) => <span className="font-medium">{o.vendorName}</span>, sortValue: (o) => o.vendorName },
    { key: 'items', header: 'Items', render: (o) => o.items, hideOnMobile: true },
    { key: 'total', header: 'Total', render: (o) => <span className="font-semibold">{money(o.total)}</span>, sortValue: (o) => o.total },
    { key: 'date', header: 'Date', render: (o) => o.date.slice(0, 10), sortValue: (o) => o.date },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} />, sortValue: (o) => o.status },
  ]

  function openAddVendor() {
    setEditingVendor(null)
    setVendorForm({ name: '', phone: '', email: '', category: '', gst: '' })
    setVendorModal(true)
  }

  function openEditVendor(v: Vendor) {
    setEditingVendor(v)
    setVendorForm({ name: v.name, phone: v.phone, email: v.email ?? '', category: v.category, gst: v.gst })
    setVendorModal(true)
  }

  function saveVendor() {
    if (!vendorForm.name.trim()) return
    if (editingVendor) updateVendor(editingVendor.id, vendorForm)
    else addVendor({ id: genId(), ...vendorForm })
    setVendorModal(false)
  }

  function openAddOrder() {
    setEditingOrder(null)
    setOrderForm({ vendorId: vendors[0]?.id ?? '', items: '', total: 0, status: 'draft', date: new Date().toISOString().slice(0, 10) })
    setOrderModal(true)
  }

  function openEditOrder(o: PurchaseOrder) {
    setEditingOrder(o)
    setOrderForm({ vendorId: o.vendorId, items: o.items, total: o.total, status: o.status, date: o.date })
    setOrderModal(true)
  }

  function saveOrder() {
    if (!orderForm.items.trim()) return
    const vendor = vendors.find((v) => v.id === orderForm.vendorId)
    const payload = { ...orderForm, vendorName: vendor?.name ?? '', total: Number(orderForm.total) }
    if (editingOrder) updateOrder(editingOrder.id, payload)
    else addOrder({ id: genId(), ...payload })
    setOrderModal(false)
  }

  const openOrders = orders.filter((o) => o.status !== 'received').length
  const orderValue = orders.filter((o) => o.status === 'approved').reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Vendors" value={vendors.length} icon={<ShoppingCart className="w-5 h-5" />} tone="info" />
        <KpiCard label="Open orders" value={openOrders} icon={<ShoppingCart className="w-5 h-5" />} tone="warning" />
        <KpiCard label="Approved value" value={money(orderValue)} icon={<ShoppingCart className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="orders">Purchase orders</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddOrder}><Plus className="w-4 h-4" /> Add order</Button>
              </div>
              <DataTable
                columns={orderColumns}
                rows={orders}
                rowKey={(o) => o.id}
                pageSize={10}
                exportFilename="school-pos"
                emptyIcon={<ShoppingCart className="w-6 h-6" />}
                emptyTitle="No purchase orders"
                emptyDescription="Create purchase orders for vendors."
                actions={(o) => (
                  <div className="flex gap-1">
                    {o.status === 'draft' && (
                      <Button variant="ghost" size="icon" onClick={() => updateOrder(o.id, { status: 'approved' })} aria-label="Approve"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEditOrder(o)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeOrder(o.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="vendors" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddVendor}><Plus className="w-4 h-4" /> Add vendor</Button>
              </div>
              <DataTable
                columns={vendorColumns}
                rows={vendors}
                rowKey={(v) => v.id}
                pageSize={10}
                exportFilename="school-vendors"
                emptyIcon={<ShoppingCart className="w-6 h-6" />}
                emptyTitle="No vendors"
                emptyDescription="Add vendors to create purchase orders."
                actions={(v) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditVendor(v)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeVendor(v.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={vendorModal} onClose={() => setVendorModal(false)} title={editingVendor ? 'Edit vendor' : 'Add vendor'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Vendor name</Label><Input value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /></div>
            <div><Label>Category</Label><Input value={vendorForm.category} onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} /></div>
          </div>
          <div><Label>GST</Label><Input value={vendorForm.gst} onChange={(e) => setVendorForm({ ...vendorForm, gst: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setVendorModal(false)}>Cancel</Button>
            <Button onClick={saveVendor}>{editingVendor ? 'Save changes' : 'Add vendor'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={orderModal} onClose={() => setOrderModal(false)} title={editingOrder ? 'Edit order' : 'Add order'} size="md">
        <div className="space-y-4">
          <div>
            <Label>Vendor</Label>
            <Select value={orderForm.vendorId} onValueChange={(v) => setOrderForm({ ...orderForm, vendorId: v })}>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </div>
          <div><Label>Items</Label><Textarea value={orderForm.items} onChange={(e) => setOrderForm({ ...orderForm, items: e.target.value })} placeholder={'Notebooks x 200\nPens x 50'} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Total</Label><Input type="number" value={orderForm.total} onChange={(e) => setOrderForm({ ...orderForm, total: Number(e.target.value) })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={orderForm.status} onValueChange={(v) => setOrderForm({ ...orderForm, status: v as PurchaseOrder['status'] })}>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="received">Received</option>
              </Select>
            </div>
          </div>
          <div><Label>Date</Label><Input type="date" value={orderForm.date} onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOrderModal(false)}>Cancel</Button>
            <Button onClick={saveOrder}>{editingOrder ? 'Save changes' : 'Add order'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}