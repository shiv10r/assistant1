import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { ArrowRight } from 'lucide-react'

const LINKS = [
  { to: '/warehouse/dashboard', label: 'Dashboard' },
  { to: '/warehouse/inventory', label: 'Inventory & Stock' },
  { to: '/warehouse/purchase-orders', label: 'Purchase Orders' },
  { to: '/warehouse/grn', label: 'Goods Received' },
  { to: '/warehouse/suppliers', label: 'Suppliers' },
]

export default function WarehouseHome() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Store</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted text-sm mb-4">Manage your inventory, stock levels, suppliers and purchase orders.</p>
          <div className="flex flex-wrap gap-3">
            {LINKS.map((l) => (
              <Button key={l.to} onClick={() => navigate(l.to)}>
                {l.label} <ArrowRight className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}