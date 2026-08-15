import { cn } from '../../../components/ui'
import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  current: number
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex items-center gap-2 flex-wrap">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <div className={cn('w-6 h-px', done || active ? 'bg-primary' : 'bg-border')} />}
            <button
              type="button"
              disabled={!onStepClick}
              onClick={() => onStepClick?.(i)}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                active && 'bg-primary text-white',
                done && 'bg-primary/10 text-primary',
                !active && !done && 'bg-surface border border-border text-muted',
                onStepClick && 'cursor-pointer'
              )}
            >
              <span className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                active && 'bg-white/20',
                done && 'bg-primary text-white',
                !active && !done && 'bg-surface2 text-muted'
              )}>
                {done ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              {label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}