import { useEffect, useState } from 'react'
import { api } from '../../api'
import type { CatalogItem, Settings } from '../../api'
import { Card, CardContent, Badge, Input, Textarea, Select, Label, Button, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Empty, money, num } from '../../platform/ui'
import { useToast } from '../../platform/ui'
import BarcodeScanner from '../../components/BarcodeScanner'
import { Plus, Search, Package, Trash2, Edit, Barcode } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../platform/dashboard'
import { settingEnabled } from './billingPreferences'

const UNITS = ['Pcs', 'Kg', 'Gm', 'Ltr', 'Mtr', 'Sqft', 'Box', 'Bag', 'Dozen', 'Hour', 'Day', 'Set', 'Pair', 'Piece', 'Roll', 'Sheet', 'Pack', 'Bundle']
const TAXES = [0, 0.25, 1.5, 3, 5, 12, 18, 28]
const ITEM_TYPES = ['Product', 'Service']

function blank(): CatalogItem {
  return { id: 0, name: '', type: 'Product', salePrice: 0, purchasePrice: 0, wholesalePrice: 0, unit: 'Pcs', category: '', hsnSac: '', taxRate: 18, stockQty: 0, minStock: 0, barcode: '', description: '' }
}

export default function Catalog() {
  const { toast } = useToast()
  const { isAdvanced } = useViewMode()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [settings, setSettings] = useState<Settings>({})
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Product' | 'Service'>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [saving, setSaving] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [editingViaScan, setEditingViaScan] = useState(false)

  const gstOn = settingEnabled(settings, 'gst.enabled')
  const hsnOn = gstOn && settingEnabled(settings, 'gst.hsn')
  const unitsOn = settingEnabled(settings, 'item.units')
  const categoryOn = settingEnabled(settings, 'item.category')
  const typeOn = settingEnabled(settings, 'item.type')
  const stockOn = settingEnabled(settings, 'item.stock_maintenance')
  const wholesaleOn = settingEnabled(settings, 'item.wholesale_price')
  const barcodeOn = settingEnabled(settings, 'item.barcode')
  const minStockOn = stockOn && settingEnabled(settings, 'item.min_stock')
  const mrpOn = settingEnabled(settings, 'item.mrp')

  const load = () => {
    api.billing.items().then(setItems).catch(() => setItems([]))
    api.billing.settings().then(setSettings).catch(() => setSettings({}))
  }
  useEffect(() => { load() }, [])

  const categories = Array.from(new Set([...items.map((i) => i.category), editing?.category].filter(Boolean)))

  const filteredItems = items.filter(it => {
    if (typeOn && typeFilter !== 'all' && it.type !== typeFilter) return false
    if (stockOn && stockFilter === 'low' && it.type !== 'Service' && (it.minStock === 0 || it.stockQty > it.minStock)) return false
    if (stockOn && stockFilter === 'out' && it.type !== 'Service' && it.stockQty > 0) return false
    if (search) {
      const q = search.toLowerCase()
      if (!it.name.toLowerCase().includes(q) &&
          !it.category.toLowerCase().includes(q) &&
          !it.barcode?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const openCreate = () => {
    setEditing({ ...blank() })
    setOpen(true)
  }
  const openEdit = (item: CatalogItem) => {
    setEditing({ ...item })
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    if (!editing.name.trim()) { setErr('Item name is required'); return }
    setSaving(true)
    try {
      await api.billing.saveItem({ ...editing, name: editing.name.trim(), category: editing.category.trim(), hsnSac: editing.hsnSac.trim(), barcode: editing.barcode.trim(), description: editing.description.trim() })
      setOpen(false)
      setEditing(null)
      load()
      toast({ title: editing.id ? 'Item updated' : 'Item created', description: editing.name })
    } catch (e) { setErr(String(e)); toast({ title: 'Could not save item', description: String(e), variant: 'error' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.billing.saveItem({ ...items.find(i => i.id === id)!, id, name: '' })
      load()
      toast({ title: 'Item deleted', variant: 'error' })
    } catch (e) { setErr(String(e)); toast({ title: 'Could not delete item', description: String(e), variant: 'error' }) }
  }

  const onScan = (value: string) => {
    const found = items.find((i) => i.barcode === value)
    if (found) {
      setEditing({ ...found })
      setEditingViaScan(true)
      setOpen(true)
      toast({ title: 'Found item', description: found.name })
    } else {
      setEditing({ ...blank(), barcode: value })
      setEditingViaScan(false)
      setOpen(true)
      toast({ title: 'New code', description: `Opening a new item with barcode ${value}` })
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Items & Catalog</h1>
          <div className="muted">Manage your product and service master data</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setScanOpen(true)} disabled={!barcodeOn} title={barcodeOn ? 'Scan a catalog barcode' : 'Enable Barcode/QR Code in Billing Settings'}>
            <Barcode className="w-4 h-4" /> Scan
          </Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Item</Button>
        </div>
      </div>

      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Catalog value, category mix and stock health — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Items', value: String(items.length), delta: `${categories.length} categories`, deltaTone: 'flat' },
            { label: 'Stock value', value: money(items.filter((i) => i.type !== 'Service').reduce((s, i) => s + (i.stockQty || 0) * (i.salePrice || 0), 0)), delta: 'at sale price', deltaTone: 'flat' },
            { label: 'Low stock', value: minStockOn ? String(items.filter((i) => i.type !== 'Service' && i.minStock > 0 && i.stockQty <= i.minStock).length) : 'Off', delta: minStockOn ? 'reorder soon' : 'alerts disabled', deltaTone: minStockOn ? 'down' : 'flat' },
            { label: 'Out of stock', value: stockOn ? String(items.filter((i) => i.type !== 'Service' && i.stockQty <= 0).length) : 'Off', delta: stockOn ? 'unavailable' : 'tracking disabled', deltaTone: stockOn ? 'down' : 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Items by category</p>
              <BarChart
                data={categories.filter((c): c is string => !!c).map((c) => ({ label: c, value: items.filter((i) => i.category === c).length }))}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Product vs service</p>
              <DonutChart
                data={[
                  { label: 'Product', value: items.filter((i) => i.type === 'Product').length, color: 'var(--primary)' },
                  { label: 'Service', value: items.filter((i) => i.type === 'Service').length, color: '#f59e0b' },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}

      {/* Toolbar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
             {typeOn && <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)} className="w-40">
              <option value="all">All Types</option>
              <option value="Product">Products</option>
              <option value="Service">Services</option>
             </Select>}
            {stockOn && (
              <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as typeof stockFilter)} className="w-40">
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        {filteredItems.length === 0 ? (
          <CardContent className="py-16">
            <Empty icon={<Package className="w-12 h-12" />} title="No items found" description="Create your first product or service" action={<Button onClick={openCreate}>Add Item</Button>} />
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                   {typeOn && <TableHead className="hidden md:table-cell">Type</TableHead>}
                   {categoryOn && <TableHead className="hidden lg:table-cell">Category</TableHead>}
                   {unitsOn && <TableHead className="hidden lg:table-cell">Unit</TableHead>}
                   {hsnOn && <TableHead className="hidden md:table-cell">HSN/SAC</TableHead>}
                  <TableHead className="hidden md:table-cell">GST %</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Purchase</TableHead>
                   {stockOn && <TableHead className="text-right hidden lg:table-cell">Stock</TableHead>}
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((it) => (
                  <TableRow key={it.id} clickable onClick={() => openEdit(it)}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-text">{it.name}</p>
                         {barcodeOn && it.barcode && <p className="text-xs text-muted flex items-center gap-1"><Barcode className="w-3 h-3" /> #{it.barcode}</p>}
                        {it.description && <p className="text-xs text-muted line-clamp-1">{it.description}</p>}
                      </div>
                    </TableCell>
                     {typeOn && <TableCell className="hidden md:table-cell">
                      <Badge variant={it.type === 'Product' ? 'default' : 'info'} size="sm">{it.type}</Badge>
                     </TableCell>}
                     {categoryOn && <TableCell className="hidden lg:table-cell text-muted">{it.category || '—'}</TableCell>}
                     {unitsOn && <TableCell className="hidden lg:table-cell text-muted">{it.unit}</TableCell>}
                     {hsnOn && <TableCell className="hidden md:table-cell text-muted">{it.hsnSac || '—'}</TableCell>}
                    <TableCell className="hidden md:table-cell text-muted">{gstOn ? `${it.taxRate}%` : '—'}</TableCell>
                    <TableCell className="text-right font-medium text-text">{it.salePrice ? money(it.salePrice) : '—'}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell text-muted">{it.purchasePrice ? money(it.purchasePrice) : '—'}</TableCell>
                     {stockOn && <TableCell className="text-right hidden lg:table-cell">
                      {it.type === 'Service' ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <>
                      {minStockOn && it.minStock > 0 && it.stockQty <= it.minStock && it.stockQty > 0 && (
                            <Badge variant="warning" size="sm" className="mr-1">Low</Badge>
                          )}
                          {stockOn && it.stockQty === 0 && <Badge variant="danger" size="sm">Out</Badge>}
                          <span className={cn('font-medium', it.minStock > 0 && it.stockQty <= it.minStock ? 'text-amber-500' : '')}>
                            {num(it.stockQty)} {it.unit}
                          </span>
                        </>
                      )}
                     </TableCell>}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(it) }} aria-label="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(it.id) }} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>

      {/* Edit/Create Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); setErr('') }} title={editingViaScan ? 'Edit Item (scanned)' : (editing?.id ? 'Edit Item' : 'Add New Item')} size="xl">
        <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Item Name *</Label>
               <Input id="name" value={editing?.name || ''} onChange={(e) => setEditing(p => ({ ...p!, name: e.target.value }))} placeholder="Enter item name" maxLength={120} required />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
               <Select id="type" value={typeOn ? (editing?.type || 'Product') : 'Product'} onValueChange={(v) => setEditing(p => ({ ...p!, type: v }))} disabled={!typeOn} title={typeOn ? undefined : 'Enable Item Types in Billing Settings'}>
                {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              {unitsOn ? (
                <Select id="unit" value={editing?.unit || 'Pcs'} onValueChange={(v) => setEditing(p => ({ ...p!, unit: v }))}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </Select>
              ) : (
                 <Input id="unit" value={editing?.unit || 'Pcs'} disabled title="Enable Item Units in Billing Settings" />
              )}
            </div>
            <div>
              <Label htmlFor="taxRate">GST Rate %</Label>
               {hsnOn ? (
                <Select id="taxRate" value={String(editing?.taxRate || 18)} onValueChange={(v) => setEditing(p => ({ ...p!, taxRate: Number(v) }))}>
                  {TAXES.map((t) => <option key={t} value={String(t)}>{t}%</option>)}
                </Select>
              ) : (
                 <Input id="taxRate" value="0" disabled title="Enable GST in Billing Settings" />
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="category">Category</Label>
              {categoryOn ? (
                <>
                  <Input
                    id="category"
                    list="categories"
                    value={editing?.category || ''}
                    onChange={(e) => setEditing(p => ({ ...p!, category: e.target.value }))}
                    placeholder="Type or select category"
                  />
                  <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </>
              ) : (
                 <Input id="category" value={editing?.category || ''} disabled title="Enable Item Categories in Billing Settings" />
              )}
            </div>
            <div>
              <Label htmlFor="hsnSac">HSN / SAC Code</Label>
              {gstOn ? (
                <Input id="hsnSac" value={editing?.hsnSac || ''} onChange={(e) => setEditing(p => ({ ...p!, hsnSac: e.target.value }))} placeholder="e.g. 7208" />
              ) : (
                 <Input id="hsnSac" value="" disabled title="Enable GST and HSN/SAC Codes in Billing Settings" />
              )}
            </div>
            <div>
              <Label htmlFor="barcode">Barcode / QR</Label>
               <Input id="barcode" value={editing?.barcode || ''} onChange={(e) => setEditing(p => ({ ...p!, barcode: e.target.value }))} placeholder={barcodeOn ? 'Scan or type barcode' : 'Disabled in Billing Settings'} maxLength={64} disabled={!barcodeOn} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="salePrice">Sale Price *</Label>
              <Input id="salePrice" type="number" min="0" step="0.01" value={editing?.salePrice || ''} onChange={(e) => setEditing(p => ({ ...p!, salePrice: Number(e.target.value) || 0 }))} placeholder="0.00" required />
            </div>
            {(editing?.type !== 'Service') && (
              <>
                <div>
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input id="purchasePrice" type="number" min="0" step="0.01" value={editing?.purchasePrice || ''} onChange={(e) => setEditing(p => ({ ...p!, purchasePrice: Number(e.target.value) || 0 }))} placeholder="0.00" />
                </div>
                 {wholesaleOn && <div>
                   <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                   <Input id="wholesalePrice" type="number" min="0" step="0.01" value={editing?.wholesalePrice || ''} onChange={(e) => setEditing(p => ({ ...p!, wholesalePrice: Number(e.target.value) || 0 }))} placeholder="0.00" />
                 </div>}
                 {mrpOn && <div>
                   <Label htmlFor="mrp">MRP</Label>
                   <Input id="mrp" type="number" min="0" step="0.01" value={editing?.mrp || ''} onChange={(e) => setEditing(p => ({ ...p!, mrp: Number(e.target.value) || 0 }))} placeholder="0.00" />
                 </div>}
              </>
            )}
          </div>

          {stockOn && editing?.type !== 'Service' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="stockQty">Opening Stock Qty</Label>
                <Input id="stockQty" type="number" min="0" step="0.01" value={editing?.stockQty || ''} onChange={(e) => setEditing(p => ({ ...p!, stockQty: Number(e.target.value) || 0 }))} placeholder="0" />
              </div>
               {minStockOn && <div>
                 <Label htmlFor="minStock">Min Stock Alert</Label>
                 <Input id="minStock" type="number" min="0" step="0.01" value={editing?.minStock || ''} onChange={(e) => setEditing(p => ({ ...p!, minStock: Number(e.target.value) || 0 }))} placeholder="0" />
               </div>}
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
             <Textarea id="description" value={editing?.description || ''} onChange={(e) => setEditing(p => ({ ...p!, description: e.target.value }))} placeholder="Item description, specifications, notes..." rows={3} maxLength={500} />
          </div>

          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{err}</div>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setErr('') }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editing?.id ? 'Update Item' : 'Create Item')}</Button>
          </div>
        </form>
      </Modal>

      <BarcodeScanner open={scanOpen} onClose={() => setScanOpen(false)} onResult={onScan} />
    </>
  )
}
