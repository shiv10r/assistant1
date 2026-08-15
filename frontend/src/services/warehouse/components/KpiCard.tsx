import type { ReactNode } from 'react'
import { Card, CardContent, cn } from '../../../components/ui'

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface KpiCardProps {
  label: string
  value: ReactNode
  sub?: string
  icon?: ReactNode
  tone?: Tone
  onClick?: () => void
}

const ICON_TONE: Record<Tone, string> = {
  default: 'text-primary bg-primary/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  danger: 'text-red-500 bg-red-500/10',
  info: 'text-cyan-500 bg-cyan-500/10',
}

export function KpiCard({ label, value, sub, icon, tone = 'default', onClick }: KpiCardProps) {
  return (
    <Card
      className={cn(onClick && 'cursor-pointer hover:border-primary/50 transition-colors')}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm text-muted truncate">{label}</div>
          <div className="text-2xl font-semibold text-text mt-1">{value}</div>
          {sub && <div className="text-xs text-muted mt-0.5 truncate">{sub}</div>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', ICON_TONE[tone])}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}