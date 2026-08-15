import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '../../components/ui'
import { Boxes, ClipboardList, Truck, Users, Package, AlertTriangle, PackageX, IndianRupee, ArrowRight, History, ShoppingCart, ArrowLeftRight } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InventoryItem, PurchaseOrder, GrnRecord, SalesOrder, StockTransfer } from './types'
import { availableOf, stockStatusOf } from './types'
import { INVENTORY_SEED, PO_SEED, GRN_SEED, WAREHOUSE_SEED, ORDER_SEED, TRANSFER_SEED } from './seed'
import { money, fmtDate } from '../../lib/utils'
import { KpiCard } from './components/KpiCard'
import { StatusBadge } from './components/StatusBadge'
import { useStockLedger } from './ledger'
import { MOVEMENT_LABEL } from './ledger'
import { useViewMode } from '../../hooks/useViewMode'
import { AdvancedPanel, BarChart, DonutChart } from '../../components/AdvancedPanel'

export default function WarehouseHome() {
  const navigate = useNavigate()
  const { isAdvanced } = useViewMode()
  const { items: inventory } = useLocalCollection<InventoryItem>('warehouse:inventory', INVENTORY_SEED)
  const { items: pos } = useLocalCollection<PurchaseOrder>('warehouse:pos', PO_SEED)
  const { items: grns } = useLocalCollection<GrnRecord>('warehouse:grn', GRN_SEED)
  const { items: orders } = useLocalCollection<SalesOrder>('warehouse:orders', ORDER_SEED)
  const { items: transfers } = useLocalCollection<StockTransfer>('warehouse:transfers', TRANSFER_SEED)
  const { movements } = useStockLedger()

  const lowStock = inventory.filter((i) => stockStatusOf(i) === 'low_stock')
  const outOfStock = inventory.filter((i) => stockStatusOf(i) === 'out_of_stock')
  const openPOs = pos.filter((p) => p.status === 'submitted' || p.status === 'approved' || p.status === 'partial' || p.status === 'draft')
  const pendingReceiving = pos.filter((p) => p.status === 'approved')
  const totalQty = inventory.reduce((sum, i) => sum + i.qty, 0)
  const stockValue = inventory.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
  const warehouses = WAREHOUSE_SEED.length
  const activeOrders = orders.filter((o) => o.status === 'created' || o.status === 'confirmed' || o.status === 'reserved' || o.status === 'picking' || o.status === 'packed' || o.status === 'dispatched')
  const pendingPicking = orders.filter((o) => o.status === 'reserved').length
  const pendingDispatch = orders.filter((o) => o.status === 'dispatched').length
  const inTransit = transfers.filter((t) => t.status === 'created' || t.status === 'dispatched').length

  const kpis = [
    { label: 'SKUs tracked', value: inventory.length, icon: <Boxes className="w-5 h-5" />, tone: 'default' as const, to: '/warehouse/inventory' },
    { label: 'Total stock qty', value: totalQty.toLocaleString('en-IN'), sub: `${warehouses} warehouse(s)`, icon: <Package className="w-5 h-5" />, tone: 'info' as const, to: '/warehouse/inventory' },
    { label: 'Stock value', value: money(stockValue), icon: <IndianRupee className="w-5 h-5" />, tone: 'success' as const, to: '/warehouse/inventory' },
    { label: 'Active orders', value: activeOrders.length, sub: `${pendingPicking} ready to pick`, icon: <ShoppingCart className="w-5 h-5" />, tone: 'default' as const, to: '/warehouse/orders' },
    { label: 'Awaiting dispatch', value: pendingDispatch, sub: `${inTransit} transfer(s) in transit`, icon: <ArrowLeftRight className="w-5 h-5" />, tone: 'info' as const, to: '/warehouse/dispatch' },
    { label: 'Low stock', value: lowStock.length, icon: <AlertTriangle className="w-5 h-5" />, tone: 'warning' as const, to: '/warehouse/inventory' },
    { label: 'Out of stock', value: outOfStock.length, icon: <PackageX className="w-5 h-5" />, tone: 'danger' as const, to: '/warehouse/inventory' },
    { label: 'Open purchase orders', value: openPOs.length, sub: `${pendingReceiving.length} awaiting receipt`, icon: <ClipboardList className="w-5 h-5" />, tone: 'default' as const, to: '/warehouse/purchase-orders' },
  ]

  return (
    <div className="space-y-6">
      {isAdvanced && (
        <AdvancedPanel
          title="Advanced analysis"
          subtitle="Inventory value by category · stock health · order pipeline — toggled via the Simple/Advanced switch in the top bar."
          compare={[
            { label: 'Stock value', value: money(stockValue), delta: `${inventory.length} SKUs`, deltaTone: 'flat' },
            { label: 'Stock fill rate', value: `${inventory.length === 0 ? 0 : Math.round((inventory.length - lowStock.length - outOfStock.length) / inventory.length * 100)}%`, delta: 'healthy / total', deltaTone: 'flat' },
            { label: 'Orders in pipeline', value: String(activeOrders.length), delta: `${pendingPicking} ready to pick`, deltaTone: 'up' },
            { label: 'Awaiting dispatch', value: String(pendingDispatch), delta: `${inTransit} transfers in transit`, deltaTone: 'flat' },
          ]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Stock value by product</p>
              <BarChart
                data={[...inventory]
                  .sort((a, b) => b.qty * b.unitPrice - a.qty * a.unitPrice)
                  .slice(0, 6)
                  .map((i) => ({ label: i.name.length > 10 ? i.name.slice(0, 10) + '…' : i.name, value: i.qty * i.unitPrice }))}
              />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-2">Stock health</p>
              <DonutChart
                data={[
                  { label: 'In stock', value: Math.max(0, inventory.length - lowStock.length - outOfStock.length), color: 'var(--primary)' },
                  { label: 'Low stock', value: lowStock.length, color: '#f59e0b' },
                  { label: 'Out of stock', value: outOfStock.length, color: '#ef4444' },
                ]}
              />
            </div>
          </div>
        </AdvancedPanel>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} icon={k.icon} tone={k.tone} onClick={() => navigate(k.to)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Low stock</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/warehouse/inventory')}>
                View all <ArrowRight className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 && outOfStock.length === 0 ? (
              <p className="text-sm text-muted">All items are sufficiently stocked.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Product</TableHead><TableHead>On hand</TableHead><TableHead>Available</TableHead><TableHead>Reorder</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {[...lowStock, ...outOfStock].slice(0, 6).map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell>{i.qty} {i.unit}</TableCell>
                      <TableCell>{availableOf(i)}</TableCell>
                      <TableCell>{i.reorderLevel}</TableCell>
                      <TableCell><StatusBadge status={stockStatusOf(i)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent stock movements</span>
              <History className="w-4 h-4 text-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-sm text-muted">No stock movements recorded yet. Receive goods or adjust stock to see activity here.</p>
            ) : (
              <ul className="space-y-2">
                {movements.slice(0, 6).map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm rounded-lg border border-border bg-surface2/40 p-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{m.itemName}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {MOVEMENT_LABEL[m.type]} · {m.from || '—'} → {m.to || '—'} · {m.date.slice(0, 10)}
                      </div>
                    </div>
                    <Badge variant={m.qty >= 0 ? 'success' : 'danger'} size="sm">{m.qty >= 0 ? '+' : ''}{m.qty}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent goods received</CardTitle></CardHeader>
          <CardContent>
            {grns.length === 0 ? (
              <p className="text-sm text-muted">No GRNs recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {grns.slice(0, 5).map((g) => (
                  <li key={g.id} className="flex items-center justify-between text-sm">
                    <span><span className="font-mono text-xs">{g.grnNumber}</span> · {g.poNumber} · {fmtDate(g.date)}</span>
                    <Badge variant="success" size="sm">{g.lines.length} item(s)</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Purchase order pipeline</CardTitle></CardHeader>
          <CardContent>
            {pos.length === 0 ? (
              <p className="text-sm text-muted">No purchase orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {pos.slice(0, 5).map((po) => (
                  <li key={po.id} className="flex items-center justify-between text-sm">
                    <span><span className="font-mono text-xs">{po.poNumber}</span> · {po.supplierName}</span>
                    <StatusBadge status={po.status} />
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
              { label: 'Products', to: '/warehouse/products', icon: <Boxes className="w-5 h-5" /> },
              { label: 'Purchase Orders', to: '/warehouse/purchase-orders', icon: <ClipboardList className="w-5 h-5" /> },
              { label: 'Goods Received', to: '/warehouse/grn', icon: <Truck className="w-5 h-5" /> },
              { label: 'Sales Orders', to: '/warehouse/orders', icon: <ShoppingCart className="w-5 h-5" /> },
              { label: 'Stock Transfer', to: '/warehouse/transfers', icon: <ArrowLeftRight className="w-5 h-5" /> },
              { label: 'Stock Count', to: '/warehouse/stock-count', icon: <ClipboardList className="w-5 h-5" /> },
              { label: 'Customers', to: '/warehouse/customers', icon: <Users className="w-5 h-5" /> },
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