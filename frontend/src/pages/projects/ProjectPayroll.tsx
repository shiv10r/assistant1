import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { PayrollResult } from '../../api'
import { Card, CardContent, Badge, Button, Input, Label, Empty, money } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { ArrowLeft, Wallet, Download } from 'lucide-react'

export default function ProjectPayroll() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const { toast } = useToast()
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(today)
  const [data, setData] = useState<PayrollResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')

  const load = async () => {
    if (!from || !to) { toast({ title: 'Select a date range', variant: 'error' }); return }
    setLoading(true)
    try {
      const res = await api.payroll.compute(pid, from, to)
      setData(res)
    } catch (e) {
      toast({ title: String(e), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const exportCsv = () => {
    if (!data) return
    const rows = [
      ['Name', 'Role', 'Days Present', 'Hours Logged', 'Daily Rate', 'Gross', 'Balance', 'Net Payable'],
      ...data.rows.map((r) => [r.name, r.role, r.days, r.hours, money(r.dailyRate), money(r.amount), money(r.currentBalance), money(r.netPayable)]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-${pid}-${from}_to_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const query = q.trim().toLowerCase()
  const filteredRows = data && query
    ? data.rows.filter((r) => r.name.toLowerCase().includes(query) || r.role.toLowerCase().includes(query))
    : data?.rows ?? []

  return (
    <>
      <div className="page-head">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1>Payroll</h1>
            <div className="muted">Salary computation from attendance</div>
          </div>
        </div>
        {data && (
          <Button variant="outline" onClick={exportCsv}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      <Card className="mb-5">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end">
            <div>
              <Label htmlFor="pf">From</Label>
              <Input id="pf" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pt">To</Label>
              <Input id="pt" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button onClick={load} disabled={loading}>{loading ? 'Computing…' : 'Compute Payroll'}</Button>
          </div>
        </CardContent>
      </Card>

{data && data.rows.length > 0 && (
          <Input
            className="mb-4"
            placeholder="Search person…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        {data && (
          <>
            <div className="grid gap-4 mb-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted">Working Days (in range)</p>
                <p className="text-2xl font-bold text-text mt-1">{data.totalDays}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted">Gross Payroll</p>
                <p className="text-2xl font-bold text-text mt-1">{data.totalAmountLabel}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted">Advance / Balance</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">{money(data.rows.reduce((s, r) => s + r.currentBalance, 0))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted">Net Payable</p>
                <p className="text-2xl font-bold text-primary mt-1">{money(data.rows.reduce((s, r) => s + r.netPayable, 0))}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                      <th className="px-4 py-3">Person</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3 text-right">Daily Rate</th>
                      <th className="px-4 py-3 text-right">Gross</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3 text-right">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={`${r.name}-${r.role}`} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium text-text">{r.name}</div>
                          <div className="text-xs text-muted">{r.role}</div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="info" size="sm">{r.days}</Badge></td>
                        <td className="px-4 py-3 text-muted">{r.hours}h</td>
                        <td className="px-4 py-3 text-right">{money(r.dailyRate)}</td>
                        <td className="px-4 py-3 text-right">{r.amountLabel}</td>
                        <td className="px-4 py-3 text-right text-amber-500">{money(r.currentBalance)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-text">{r.netPayableLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.rows.length === 0 && (
                <div className="p-8">
                  <Empty
                    icon={<Wallet className="w-10 h-10" />}
                    title="No attendance in this range"
                    description="Add daily attendance for site people to compute payroll."
                    action={<Link to={`/projects/${pid}/attendance`}><Button>Open Attendance</Button></Link>}
                  />
                </div>
              )}
              {data.rows.length > 0 && filteredRows.length === 0 && (
                <div className="p-8">
                  <Empty title={`No payroll rows match "${q}"`} />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
