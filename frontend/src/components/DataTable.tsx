import { useMemo, useState, type ReactNode } from 'react'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Empty, cn,
} from './ui'
import { FiArrowUp, FiArrowDown, FiChevronLeft, FiChevronRight, FiDownload, FiLoader } from 'react-icons/fi'

export interface DataColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  csvValue?: (row: T) => string | number
  headerClassName?: string
  cellClassName?: string
  hideOnMobile?: boolean
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  pageSize?: number
  exportFilename?: string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: ReactNode
  error?: string | null
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode
  toolbar?: ReactNode
}

const PAGE_SIZES = [10, 25, 50]

export function DataTable<T>({
  columns, rows, rowKey, pageSize = 10, exportFilename, loading,
  emptyTitle = 'Nothing here yet', emptyDescription, emptyIcon,
  error, onRowClick, actions, toolbar,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return rows
    const arr = [...rows]
    arr.sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [rows, columns, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / size))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * size, safePage * size)

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  function exportCsv() {
    const header = columns.map((c) => `"${c.header}"`).join(',')
    const body = sorted
      .map((row) =>
        columns
          .map((c) => {
            const v = c.csvValue ? c.csvValue(row) : String((row as Record<string, unknown>)[c.key] ?? '')
            return `"${String(v).replace(/"/g, '""')}"`
          })
          .join(',')
      )
      .join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${exportFilename ?? 'export'}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-3">
      {(toolbar || exportFilename) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {toolbar}
          {exportFilename && (
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={sorted.length === 0}>
              <FiDownload className="w-4 h-4" /> Export CSV
            </Button>
          )}
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <FiLoader className="w-6 h-6 animate-spin mr-2" /> Loadingâ€¦
        </div>
      ) : sorted.length === 0 ? (
        <Empty icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn(c.headerClassName, c.hideOnMobile && 'hidden md:table-cell')}
                >
{c.sortValue ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className="inline-flex items-center gap-1 hover:text-text transition-colors"
                  >
                    {c.header}
                    {sortKey === c.key &&
                      (sortDir === 'asc' ? <FiArrowUp className="w-3.5 h-3.5" /> : <FiArrowDown className="w-3.5 h-3.5" />)}
                  </button>
                ) : (
                  c.header
                )}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={rowKey(row)}
                clickable={!!onRowClick}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn(c.cellClassName, c.hideOnMobile && 'hidden md:table-cell')}>
                    {c.render(row)}
                  </TableCell>
                ))}
                {actions && <TableCell><div className="flex justify-end gap-1">{actions(row)}</div></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
            <span>Rows per page</span>
            <select
              className="bg-surface border border-border rounded-md px-2 py-1 text-xs flex-shrink-0"
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(1) }}
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="whitespace-nowrap">{sorted.length} row(s)</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <FiChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted px-2">Page {safePage} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <FiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}