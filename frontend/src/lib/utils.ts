import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const money = (n?: number) => (n == null || Number.isNaN(n) ? '₹0' : inr.format(Math.round(n)))
export const num = (n?: number) => (n == null ? '0' : String(Math.round(n)))
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