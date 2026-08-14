import { Card, CardHeader, CardTitle, CardContent, Empty } from '../../components/ui'
import { Truck } from 'lucide-react'

export default function WarehouseGrn() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Goods Received (GRN)</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty
            icon={<Truck className="w-6 h-6" />}
            title="Goods-received notes are coming soon"
            description="Record incoming deliveries against purchase orders once the warehouse backend module ships."
          />
        </CardContent>
      </Card>
    </div>
  )
}
