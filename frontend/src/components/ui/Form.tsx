import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:from-violet-700 hover:to-cyan-600 shadow-lg shadow-violet-500/25': variant === 'default',
          'bg-surface border border-border text-text hover:bg-surface-hover': variant === 'outline',
          'bg-transparent text-text hover:bg-surface': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25': variant === 'destructive',
          'bg-accent text-bg hover:opacity-90 shadow-lg shadow-emerald-500/25': variant === 'success',
          'h-10 px-4 text-sm': size === 'md',
          'h-8 px-3 text-xs': size === 'sm',
          'h-12 px-6 text-base': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ className, type = 'text', error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full bg-surface border rounded-lg px-4 py-2.5 text-text placeholder:text-muted',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:bg-surface/50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text placeholder:text-muted',
          'transition-colors duration-200 resize-none min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:bg-surface/50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean; onValueChange?: (value: string) => void }>(
  ({ className, error, onValueChange, onChange, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        onChange={(e) => {
          onChange?.(e)
          onValueChange?.(e.target.value)
        }}
        className={cn(
          'w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text',
          'transition-colors duration-200 appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:bg-surface/50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

export const Label = ({ className, children, htmlFor, required }: { className?: string; children: React.ReactNode; htmlFor?: string; required?: boolean }) => (
  <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-text mb-1.5', className)}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
)