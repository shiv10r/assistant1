import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface EmptyProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function Empty({ icon, title = 'Nothing here yet', description, action, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center px-4', className)}>
      {icon && <div className="w-14 h-14 rounded-2xl bg-surface2 border border-border flex items-center justify-center mb-4 text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
