import { cn } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export function Badge({ className, variant = 'default', size = 'md', dot, children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-full'
  const variants = {
    default: 'bg-primary/15 text-primary',
    success: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/15 text-red-500 dark:text-red-400',
    info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    outline: 'bg-transparent border border-border text-text',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  }
  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', variants[variant].replace('bg-', 'bg-').replace('text-', ''))} />}
      {children}
    </span>
  )
}