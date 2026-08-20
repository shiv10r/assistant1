import { cn } from '../lib/utils'
import type { ReactNode } from 'react'

export type KPICardProps = {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend?: { value: number; label: string; positive?: boolean }
  onClick?: () => void
}

const TONE_CLASSES = {
  default: 'border-border bg-surface',
  success: 'border-emerald-500/30 bg-emerald-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  danger: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10'
}

const ICON_TONES = {
  default: 'text-muted',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
  info: 'text-blue-500'
}

export function KPICard({
  label,
  value,
  sub,
  icon,
  tone = 'default',
  trend,
  onClick
}: KPICardProps) {
  const isInteractive = typeof onClick === 'function'

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        TONE_CLASSES[tone],
        isInteractive && 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }} : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text truncate">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted truncate">{sub}</p>}
          {trend && (
            <p className={cn('mt-2 text-xs font-medium flex items-center gap-1', trend.positive ? 'text-emerald-500' : 'text-red-500')}>
              {trend.positive ? '↑' : '↓'} {trend.value}{trend.label && ` ${trend.label}`}
            </p>
          )}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl shrink-0', ICON_TONES[tone])}>
          {icon}
        </div>
      </div>
    </div>
  )
}