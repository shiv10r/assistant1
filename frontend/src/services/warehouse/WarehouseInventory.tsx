import { Card, CardHeader, CardTitle, CardContent, Empty } from '../../components/ui'
import { Boxes } from 'lucide-react'

export default function WarehouseInventory() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory & Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty
            icon={<Boxes className="w-6 h-6" />}
            title="Inventory tracking is coming soon"
            description="Stock levels, reorder points and stock movement will show up here once the warehouse backend module ships."
          />
        </CardContent>
      </Card>
    </div>
  )
}
