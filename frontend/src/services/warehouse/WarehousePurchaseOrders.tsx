import { Card, CardHeader, CardTitle, CardContent, Empty } from '../../components/ui'
import { ClipboardList } from 'lucide-react'

export default function WarehousePurchaseOrders() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty
            icon={<ClipboardList className="w-6 h-6" />}
            title="Purchase orders are coming soon"
            description="Raise, track and approve purchase orders once the warehouse backend module ships."
          />
        </CardContent>
      </Card>
    </div>
  )
}
