import type { DataColumn } from '../components/DataTable'
import { money } from './utils'
import { Badge } from '../components/ui'

export type StatusConfig = {
  [key: string]: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export type ColumnConfig<T> = {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortValue?: (row: T) => unknown
  width?: string
  align?: 'left' | 'center' | 'right'
}

export function createStatusColumn<T>(
  key: keyof T | string,
  header: string,
  statusConfig: StatusConfig,
  getLabel: (value: string) => string = (v) => v
): DataColumn<T> {
  return {
    key: key as string,
    header,
    render: (row) => {
      const value = String(row[key as keyof T])
      const variant = statusConfig[value] ?? 'default'
      return <Badge variant={variant} size="sm">{getLabel(value)}</Badge>
    },
    sortValue: (row) => String(row[key as keyof T])
  }
}

export function createMoneyColumn<T>(
  key: keyof T | string,
  header: string,
  options?: { negativeColor?: boolean; showZero?: boolean }
): DataColumn<T> {
  const { negativeColor = true, showZero = true } = options ?? {}
  return {
    key: key as string,
    header,
    render: (row) => {
      const value = Number(row[key as keyof T])
      if (!showZero && value === 0) return <span className="text-muted">—</span>
      const className = negativeColor && value < 0 ? 'font-medium text-red-500' : negativeColor && value > 0 ? 'font-medium text-emerald-500' : 'text-text'
      return <span className={className}>{money(value)}</span>
    },
    sortValue: (row) => Number(row[key as keyof T]),
    align: 'right'
  }
}

export function createDateColumn<T>(
  key: keyof T | string,
  header: string,
  options?: { showTime?: boolean }
): DataColumn<T> {
  return {
    key: key as string,
    header,
    render: (row) => {
      const value = row[key as keyof T]
      if (!value) return <span className="text-muted">—</span>
      const date = new Date(String(value))
      return <span>{date.toLocaleDateString()}{options?.showTime ? ` ${date.toLocaleTimeString()}` : ''}</span>
    },
    sortValue: (row) => new Date(String(row[key as keyof T])).getTime()
  }
}

export function createActionColumn<T>(
  key: keyof T | string,
  header: string,
  renderAction: (row: T) => React.ReactNode
): DataColumn<T> {
  return {
    key: key as string,
    header,
    render: renderAction,
    align: 'center'
  }
}

export function createTextColumn<T>(
  key: keyof T | string,
  header: string,
  options?: { truncate?: boolean; className?: string }
): DataColumn<T> {
  const { truncate = false, className = '' } = options ?? {}
  return {
    key: key as string,
    header,
    render: (row) => {
      const value = String(row[key as keyof T] ?? '')
      const cls = ['text-sm', truncate && 'truncate', className].filter(Boolean).join(' ')
      return <span className={cls}>{value}</span>
    },
    sortValue: (row) => String(row[key as keyof T])
  }
}

export function createIdColumn<T>(
  key: keyof T | string,
  header: string,
  options?: { prefix?: string; mono?: boolean }
): DataColumn<T> {
  const { prefix = '', mono = true } = options ?? {}
  return {
    key: key as string,
    header,
    render: (row) => {
      const value = String(row[key as keyof T])
      const cls = ['text-sm', mono && 'font-mono'].filter(Boolean).join(' ')
      return <span className={cls}>{prefix}{value}</span>
    },
    sortValue: (row) => String(row[key as keyof T])
  }
}

export function createCompoundColumn<T>(
  key: keyof T | string,
  header: string,
  render: (row: T) => { primary: string; secondary?: string },
  options?: { primaryClass?: string; secondaryClass?: string }
): DataColumn<T> {
  const { primaryClass = 'font-medium text-text', secondaryClass = 'text-xs text-muted' } = options ?? {}
  return {
    key: key as string,
    header,
    render: (row) => {
      const { primary, secondary } = render(row)
      return (
        <div>
          <p className={primaryClass}>{primary}</p>
          {secondary && <p className={secondaryClass}>{secondary}</p>}
        </div>
      )
    },
    sortValue: (row) => String(row[key as keyof T])
  }
}