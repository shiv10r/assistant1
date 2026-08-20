import { cn } from '../lib/utils'
import type { ReactNode } from 'react'

export type StatCardProps = {
  count: number
  label: string
  active?: boolean
  onClick?: () => void
  icon?: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function StatCard({ count, label, active, onClick, icon, tone = 'default' }: StatCardProps) {
  const isInteractive = typeof onClick === 'function'

  const baseClasses = 'rounded-lg border px-4 py-3 text-left transition-colors'
  const activeClasses = 'border-primary bg-primary/10 text-primary'
  const inactiveClasses = 'border-border bg-surface text-muted hover:border-primary/50'
  const toneClasses = {
    default: '',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    danger: 'border-red-500/30 bg-red-500/10 text-red-500',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-500'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        baseClasses,
        active ? activeClasses : inactiveClasses,
        isInteractive && 'cursor-pointer',
        !isInteractive && 'cursor-default',
        toneClasses[tone]
      )}
      aria-pressed={active}
    >
      {icon && <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-surface/50 mb-2">{icon}</span>}
      <span className="block text-xl font-bold text-text">{count}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

export function StatCardGroup({
  items,
  activeValue,
  onChange,
  className
}: {
  items: Array<{ value: string; label: string; count: number; icon?: ReactNode; tone?: StatCardProps['tone'] }>
  activeValue: string | 'all'
  onChange: (value: string | 'all') => void
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {items.map((item) => (
        <StatCard
          key={item.value}
          count={item.count}
          label={item.label}
          active={activeValue === item.value}
          onClick={() => onChange(item.value)}
          icon={item.icon}
          tone={item.tone}
        />
      ))}
    </div>
  )
}