import { Card, CardContent, Button, Input, Label, Empty } from './ui'
import { Search, Download, Pencil, Trash2, CalendarDays, Plus } from 'lucide-react'

/**
 * Shared generic CRUD primitives — the industry-standard list/form pattern used
 * across Business Modules (interior + warehouse). Keeps every module page
 * consistent: a stat strip, a search toolbar, a left-hand form card and a
 * right-hand record list, with CSV export and inline edit/delete on each row.
 */

export function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center text-white shadow-lg shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-text/50 truncate">{label}</div>
          <div className="text-lg font-bold leading-tight truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatStrip({ items }: { items: { icon: React.ReactNode; label: string; value: string; tone: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {items.map((s, i) => <Stat key={i} {...s} />)}
    </div>
  )
}

export function CrudLayout({ title, subtitle, tint, form, children, actions }: {
  title: string; subtitle: string; tint: string; form: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-1">
        <Card className="h-fit sticky top-20">
          <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${tint}`} />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center text-white shadow`}>
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-[15px]">{title}</h3>
            </div>
            <p className="text-xs text-text/50 mb-4">{subtitle}</p>
            <div className="space-y-3">{form}</div>
          </CardContent>
        </Card>
        {actions && <div className="mt-3">{actions}</div>}
      </div>
      <div className="xl:col-span-2 space-y-2.5">{children}</div>
    </div>
  )
}

export function RowItem({ tint, icon, title, meta, badges, right }: {
  tint: string; icon: React.ReactNode; title: React.ReactNode; meta: React.ReactNode; badges?: React.ReactNode; right?: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tint} flex items-center justify-center text-white shadow-lg shrink-0`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{title}</p>
            {badges}
          </div>
          <p className="text-xs text-text/50 truncate">{meta}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
      </CardContent>
    </Card>
  )
}

export function DatePill({ label, date }: { label: string; date: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface2 border border-border text-text/70">
      <CalendarDays className="w-3 h-3" /> {label} {date.slice(0, 10)}
    </span>
  )
}

export function CrudToolbar({ value, onChange, onCsv, placeholder }: {
  value: string; onChange: (v: string) => void; onCsv: () => void; placeholder?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="relative flex-1 max-w-xs">
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-text/40" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? 'Search…'} className="pl-8" />
      </div>
      <div className="flex-1" />
      <Button variant="outline" size="sm" onClick={onCsv}><Download className="w-4 h-4 mr-1.5" /> CSV</Button>
    </div>
  )
}

export function EditDel({ onEdit, onDel }: { onEdit: () => void; onDel: () => void }) {
  return <>
    <Button variant="ghost" size="sm" title="Edit" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
    <Button variant="ghost" size="sm" title="Delete" onClick={onDel}><Trash2 className="w-4 h-4 text-red-500" /></Button>
  </>
}

export function Progress({ pct, tone }: { pct: number; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="w-16 h-1.5 rounded-full bg-surface2 border border-border overflow-hidden inline-block">
        <span className={`block h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </span>
      <span className="text-[11px] text-text/50">{pct}%</span>
    </span>
  )
}

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><Label required={required}>{label}</Label>{children}</div>
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <Empty title={title} description={description} />
}
