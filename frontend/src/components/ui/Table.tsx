import { cn } from '../../lib/utils'

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props}>{children}</thead>
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>{children}</tbody>
}

export function TableRow({ className, clickable, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors',
        'hover:bg-surface/50',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'text-left font-medium text-muted px-4 py-3',
        'bg-surface/50 sticky top-0 z-10',
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 text-text', className)} {...props} />
  )
}

export function TableCaption({ className, children, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('text-sm text-muted py-2', className)} {...props}>{children}</caption>
}