import type { ReactNode } from 'react'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const money = (n?: number) => (n == null || Number.isNaN(n) ? '₹0' : inr.format(Math.round(n)))
export const num = (n?: number) => (n == null ? '0' : String(Math.round(n)))
export const fmtDate = (d?: string) => {
  if (!d) return ''
  const s = d.slice(0, 10)
  const [y, m, day] = s.split('-')
  return `${day}/${m}/${y}`
}
export const todayISO = () => new Date().toISOString().slice(0, 10)
export const shortDate = (d?: string) => {
  if (!d) return ''
  const s = d.slice(0, 10)
  const [, m, day] = s.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${names[Number(m) - 1]}, ${s.slice(2, 4)}`
}

export function Badge({ children, tone }: { children: ReactNode; tone?: 'accent' | 'green' | 'pink' | 'gray' }) {
  const map: Record<string, string> = {
    accent: 'var(--primary-soft)', green: '#2E8B57', pink: '#E05C7A', gray: 'var(--surface2)',
  }
  return (
    <span style={{ background: map[tone ?? 'gray'], color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

export function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: full ? '1 1 100%' : '1 1 0' }}>
      <span className="f-label">{label}</span>
      {children}
    </label>
  )
}

export const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', color: 'var(--text)', border: '1px solid transparent',
  borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', width: '100%',
}
export const btnStyle: React.CSSProperties = {
  background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 12,
  padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
export const ghostStyle: React.CSSProperties = {
  background: 'var(--surface2)', color: 'var(--text)', border: 'none', borderRadius: 12,
  padding: '10px 18px', fontSize: 14, cursor: 'pointer',
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: wide ? 720 : 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function PageHead({ icon, title, sub, right }: { icon: string; title: string; sub: string; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div><h1>{icon} {title}</h1><div className="muted">{sub}</div></div>
      {right && <div>{right}</div>}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}
