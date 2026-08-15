import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// twMerge resolves conflicting utility overrides (e.g. base `px-4` + override `pl-9`)
// which plain clsx cannot — without it, override classes could lose to base classes
// depending on Tailwind's generated CSS order, misplacing things like search icons.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const money = (n?: number) => (n == null || Number.isNaN(n) ? '₹0' : inr.format(Math.round(n)))
export const num = (n?: number) => (n == null ? '0' : String(Math.round(n)))
export const formatNumber = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
export const todayISO = () => new Date().toISOString().slice(0, 10)
export const fmtDate = (d?: string) => {
  if (!d) return ''
  const s = d.slice(0, 10)
  const [y, m, day] = s.split('-')
  return `${day}/${m}/${y}`
}
export const shortDate = (d?: string) => {
  if (!d) return ''
  const s = d.slice(0, 10)
  const [, m, day] = s.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${names[Number(m) - 1]}, ${s.slice(2, 4)}`
}

export function toCsv(filename: string, headers: readonly string[], rows: readonly (readonly (string | number)[])[]) {
  const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const body = [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n')
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
