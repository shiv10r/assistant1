import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui'
import { Boxes, ClipboardList, Truck, Users, Package, AlertTriangle } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InventoryItem, PurchaseOrder, GrnRecord, Supplier } from './types'
import { INVENTORY_SEED, SUPPLIER_SEED, PO_SEED, GRN_SEED } from './seed'

export default function WarehouseHome() {
  const navigate = useNavigate()
  const { items: inventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: suppliers } = useLocalCollection<Supplier>('warehouse:suppliers', SUPPLIER_SEED)
  const { items: pos } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const { items: grns } = useLocalCollection<GrnRecord>('warehouse:grn', GRN_SEED)

  const lowStock = inventory.filter((i) => i.qty <= i.reorderLevel)
  const openPOs = pos.filter((p) => p.status === 'sent' || p.status === 'draft')
  const stockValue = inventory.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)

  const kpis = [
    { label: 'SKUs tracked', value: inventory.length, icon: <Boxes className="w-5 h-5" />, to: '/warehouse/inventory' },
    { label: 'Low stock alerts', value: lowStock.length, icon: <AlertTriangle className="w-5 h-5" />, to: '/warehouse/inventory' },
    { label: 'Open purchase orders', value: openPOs.length, icon: <ClipboardList className="w-5 h-5" />, to: '/warehouse/purchase-orders' },
    { label: 'Suppliers', value: suppliers.length, icon: <Users className="w-5 h-5" />, to: '/warehouse/suppliers' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(k.to)}>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted">{k.label}</div>
                <div className="text-2xl font-semibold text-text mt-1">{k.value}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-primary">{k.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Stock value</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-text">₹{stockValue.toLocaleString('en-IN')}</div>
            <p className="text-sm text-muted mt-1">Estimated value of current inventory on hand.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent goods received</CardTitle></CardHeader>
          <CardContent>
            {grns.length === 0 ? (
              <p className="text-sm text-muted">No GRNs recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {grns.slice(0, 5).map((g) => (
                  <li key={g.id} className="flex items-center justify-between text-sm">
                    <span>{g.grnNumber} · {g.poNumber}</span>
                    <Badge variant="success" size="sm">{g.lines.length} item(s)</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Inventory', to: '/warehouse/inventory', icon: <Package className="w-5 h-5" /> },
              { label: 'Purchase Orders', to: '/warehouse/purchase-orders', icon: <ClipboardList className="w-5 h-5" /> },
              { label: 'Goods Received', to: '/warehouse/grn', icon: <Truck className="w-5 h-5" /> },
              { label: 'Suppliers', to: '/warehouse/suppliers', icon: <Users className="w-5 h-5" /> },
            ].map((l) => (
              <button key={l.to} onClick={() => navigate(l.to)} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors">
                <span className="text-primary">{l.icon}</span>
                <span className="text-sm font-medium text-text">{l.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
