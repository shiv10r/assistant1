import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, money, cn } from './ui'

export interface BarDatum { label: string; value: number; valueLabel?: string }
export interface DonutDatum { label: string; value: number; color: string }

/**
 * Advanced-view panel — charts, KPIs and compare metrics shown in addition to
 * the standard UI whenever the user has the "Advanced" view mode toggled on.
 * Pure SVG, no charting dependency.
 */
export function AdvancedPanel({ title, subtitle, bars, donut, compare, children }: {
  title: string
  subtitle?: string
  bars?: BarDatum[]
  donut?: DonutDatum[]
  compare?: { label: string; value: string; delta?: string; deltaTone?: 'up' | 'down' | 'flat' }[]
  children?: React.ReactNode
}) {
  return (
    <Card className="advanced-panel border-primary/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted -mt-1">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {compare && compare.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {compare.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-surface2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted">{c.label}</p>
                <p className="text-lg font-bold text-text mt-0.5">{c.value}</p>
                {c.delta && (
                  <p className={cn(
                    'text-xs font-semibold',
                    c.deltaTone === 'up' ? 'text-emerald-500' : c.deltaTone === 'down' ? 'text-red-500' : 'text-muted'
                  )}>{c.delta}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {bars && bars.length > 0 && <BarChart data={bars} />}
        {donut && donut.length > 0 && <DonutChart data={donut} />}
        {children}
      </CardContent>
    </Card>
  )
}

export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5 justify-end h-full" title={`${d.label}: ${d.valueLabel ?? money(d.value)}`}>
            <span className="text-[10px] text-muted">{d.valueLabel ?? (d.value >= 1000 ? `${Math.round(d.value / 1000)}k` : Math.round(d.value))}</span>
            <div className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-primary/70 to-primary" style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} />
            <span className="text-[10px] text-muted truncate max-w-full">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DonutChart({ data }: { data: DonutDatum[] }) {
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0))
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const center = 50

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0 -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--surface2)" strokeWidth="12" />
        {data.filter((d) => d.value > 0).map((d) => {
          const len = (d.value / total) * circumference
          const el = (
            <circle
              key={d.label}
              cx={center} cy={center} r={radius} fill="none"
              stroke={d.color} strokeWidth="12"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-muted">{d.label}</span>
            <span className="font-semibold text-text ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Sparkline({ data, color = 'var(--primary)', height = 32 }: { data: number[]; color?: string; height?: number }) {
  const points = useMemo(() => {
    if (data.length === 0) return ''
    const max = Math.max(1, ...data)
    const min = Math.min(0, ...data)
    const span = max - min || 1
    const w = 100
    return data
      .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(height - 4 - ((v - min) / span) * (height - 8)).toFixed(1)}`)
      .join(' ')
  }, [data, height])
  if (data.length === 0) return null
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}