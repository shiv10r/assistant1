import { Card, CardHeader, CardTitle, CardContent, Empty } from '../../components/ui'
import { Users } from 'lucide-react'

export default function WarehouseSuppliers() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty
            icon={<Users className="w-6 h-6" />}
            title="Supplier management is coming soon"
            description="Manage supplier contacts, price lists and order history once the warehouse backend module ships."
          />
        </CardContent>
      </Card>
    </div>
  )
}
