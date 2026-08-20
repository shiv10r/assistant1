import { useEffect, useState } from 'react'
import { Database, RefreshCw, Loader2 } from 'lucide-react'
import { homeServicesApi } from '../homeServicesApi'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../../../components/ui'

interface TableCount {
  table_name: string
  row_count: number
}

interface DatabaseHealth {
  connected: boolean
  totalTables: number
  totalRows: number
  tables: TableCount[]
  error?: string
}

export default function DatabaseCheck() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      const categories = await homeServicesApi.getCategories()
      const services = await homeServicesApi.getServices()
      const cities = await homeServicesApi.getCities()
      const professionals = await homeServicesApi.getProfessionals()
      const bookings = await homeServicesApi.getBookings()

      const tables = [
        { table_name: 'service_categories', row_count: categories.length },
        { table_name: 'services', row_count: services.length },
        { table_name: 'cities', row_count: cities.length },
        { table_name: 'professionals', row_count: professionals.length },
        { table_name: 'bookings', row_count: bookings.length },
      ]

      setHealth({
        connected: true,
        totalTables: tables.length,
        totalRows: tables.reduce((sum, t) => sum + t.row_count, 0),
        tables,
      })
      setLastChecked(new Date())
    } catch (error: unknown) {
      setHealth({
        connected: false,
        totalTables: 0,
        totalRows: 0,
        tables: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      setLastChecked(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Database Health Check</h1>
          <p className="text-muted text-sm">
            Verify Supabase PostgreSQL connection and data status
          </p>
        </div>
        <Button
          onClick={checkDatabase}
          disabled={loading}
          className="gap-2"
        >
          <Loader2 className={`${loading ? 'animate-spin' : ''} w-4 h-4`} />
          {loading ? 'Checking...' : 'Refresh'}
        </Button>
      </div>

      {health && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className={`w-5 h-5 ${health.connected ? 'text-emerald-500' : 'text-red-500'}`} />
              {health.connected ? 'Connected to Supabase' : 'Connection Failed'}
            </CardTitle>
            {health.error && (
              <Badge variant="danger" className="text-xs">
                {health.error}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-sm text-muted">Total Tables</p>
                <p className="text-2xl font-bold text-emerald-600">{health.totalTables}</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-muted">Total Rows</p>
                <p className="text-2xl font-bold text-blue-600">{health.totalRows}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-sm text-muted">Last Checked</p>
                <p className="text-sm font-medium text-text">
                  {lastChecked?.toLocaleTimeString() ?? 'Never'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b">
                    <th className="pb-2">Table</th>
                    <th className="pb-2 text-right">Rows</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {health.tables.map((table) => (
                    <tr key={table.table_name} className="border-b border-border/50">
                      <td className="py-2 font-medium text-text">{table.table_name}</td>
                      <td className="py-2 text-right text-text">{table.row_count}</td>
                      <td className="py-2">
                        <Badge variant={table.row_count > 0 ? 'success' : 'outline'}>
                          {table.row_count > 0 ? 'Has Data' : 'Empty'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t flex gap-2">
              <Button onClick={checkDatabase} disabled={loading} variant="outline">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button onClick={() => window.open('https://supabase.com/dashboard/project/qfgozadjsucuoxrxrknc/editor', '_blank')} variant="outline">
                Open Supabase Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}