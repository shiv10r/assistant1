import { useEffect, useState } from 'react'
import { workOrderApi, type WorkOrder, type WorkOrderStatus } from './maintenance.types'
import { FiAlertTriangle, FiClock, FiTool } from 'react-icons/fi'

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  Draft: 'Draft',
  Triaged: 'Triaged',
  Approved: 'Approved',
  Scheduled: 'Scheduled',
  InProgress: 'In progress',
  Blocked: 'Blocked',
  AwaitingVerification: 'Awaiting verification',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

export default function MaintenanceDashboard() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    workOrderApi.list().then(({ data, error: apiError }) => {
      if (cancelled) return
      setLoading(false)
      if (apiError) setError(apiError.message)
      else setOrders([...(data ?? [])])
    })
    return () => { cancelled = true }
  }, [])

  if (loading) return <div role="status">Loading work orders...</div>
  if (error) return <div role="alert">Failed to load work orders: {error}</div>

  return (
    <section className="railway-page">
      <h1>Maintenance</h1>
      <p>Work order queue across the network.</p>
      {orders.length === 0 ? (
        <div className="railway-panel"><FiTool /> No open work orders.</div>
      ) : (
        <div className="railway-table">
          <div className="railway-table-row head">
            <span>ID</span><span>Status</span><span>Priority</span><span>Created</span>
          </div>
          {orders.map((o) => (
            <div className="railway-table-row" key={o.id}>
              <strong>{o.id.slice(0, 8)}</strong>
              <em>{STATUS_LABELS[o.status]}</em>
              <span>{o.priority === 'Critical' && <FiAlertTriangle />} {o.priority}</span>
              <span><FiClock /> {new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}