import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { AssistantSearch } from '../api'
import { Modal, Input, Badge, money, cn } from './ui'
import { Search, FolderKanban, ReceiptText, Users, ArrowRight, Boxes, GraduationCap, Clock, Briefcase } from 'lucide-react'

/** A row a global search can jump to. */
export interface SearchResult {
  label: string
  sub?: string
  to: string
  group: string
  icon: React.ReactNode
}

const GROUP_ICON: Record<string, React.ReactNode> = {
  Projects: <Briefcase className="w-4 h-4" />,
  Parties: <Users className="w-4 h-4" />,
  Transactions: <ReceiptText className="w-4 h-4" />,
  Items: <Boxes className="w-4 h-4" />,
  Rooms: <Boxes className="w-4 h-4" />,
  Expenses: <ReceiptText className="w-4 h-4" />,
  'Warehouse Products': <Boxes className="w-4 h-4" />,
  'Warehouse Customers': <Users className="w-4 h-4" />,
  'Warehouse Suppliers': <Users className="w-4 h-4" />,
  'Warehouse Projects': <Briefcase className="w-4 h-4" />,
  'Warehouse Staff': <Clock className="w-4 h-4" />,
  'School Students': <GraduationCap className="w-4 h-4" />,
  'School Classes': <GraduationCap className="w-4 h-4" />,
  'School Staff': <Clock className="w-4 h-4" />,
  'School Projects': <Briefcase className="w-4 h-4" />,
}

/**
 * Global application search — hits the backend `/api/assistant/search` endpoint
 * (projects, parties, txns, items, rooms, expenses) and scans every frontend
 * localStorage collection (warehouse, school), then navigates to the result.
 */
export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [remote, setRemote] = useState<AssistantSearch | null>(null)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce remote search
  useEffect(() => {
    if (!open) { setQ(''); setRemote(null); return }
    setSearching(true)
    const t = window.setTimeout(() => {
      if (!q.trim()) { setRemote(null); setSearching(false); return }
      api.search(q)
        .then(setRemote)
        .catch(() => setRemote(null))
        .finally(() => setSearching(false))
    }, 250)
    return () => window.clearTimeout(t)
  }, [q, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const local = useMemo(() => searchLocalStorage(q), [q])

  const results = useMemo(() => {
    const out: SearchResult[] = []
    if (!q.trim()) return out
    if (remote?.projects?.length) remote.projects.forEach((p) => out.push({
      label: p.name,
      sub: p.type === 'interior' ? 'Interior project' : p.address ? `${p.type} · ${p.address}` : p.type,
      to: `/projects/${p.id}`,
      group: 'Projects',
      icon: GROUP_ICON.Projects,
    }))
    if (remote?.parties?.length) remote.parties.forEach((p) => out.push({
      label: p.name,
      sub: `${p.type} · balance ${money(p.currentBalance)}${p.phone ? ` · ${p.phone}` : ''}`,
      to: `/billing/parties`,
      group: 'Parties',
      icon: GROUP_ICON.Parties,
    }))
    if (remote?.txns?.length) remote.txns.slice(0, 15).forEach((t) => out.push({
      label: `${t.refLabel} — ${t.partyName}`,
      sub: `${t.type} · ${money(t.total)} · ${t.date}`,
      to: `/billing`,
      group: 'Transactions',
      icon: GROUP_ICON.Transactions,
    }))
    if (remote?.items?.length) remote.items.forEach((i) => out.push({
      label: i.name,
      sub: `${i.category} · sale ${money(i.salePrice)}`,
      to: `/billing/items`,
      group: 'Items',
      icon: GROUP_ICON.Items,
    }))
    if (remote?.rooms?.length) remote.rooms.forEach((r) => out.push({
      label: r.name,
      sub: r.type,
      to: `/projects/${r.id}`,
      group: 'Rooms',
      icon: GROUP_ICON.Rooms,
    }))
    if (remote?.expenses?.length) remote.expenses.slice(0, 10).forEach((e) => out.push({
      label: `${e.client} — ${e.category}`,
      sub: `${e.site} · ${money(e.amount)} · ${e.date}`,
      to: `/reports`,
      group: 'Expenses',
      icon: GROUP_ICON.Expenses,
    }))
    out.push(...local)
    return out
  }, [remote, local, q])

  const groups = useMemo(() => {
    const g: { name: string; rows: SearchResult[] }[] = []
    for (const r of results) {
      const existing = g.find((x) => x.name === r.group)
      if (existing) existing.rows.push(r)
      else g.push({ name: r.group, rows: [r] })
    }
    return g
  }, [results])

  function go(r: SearchResult) {
    onClose()
    setQ('')
    nav(r.to)
  }

  const total = results.length

  return (
    <Modal open={open} onClose={onClose} title="Global Search" description="Search anything across the application" size="lg">
      <div className="relative mb-4">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          ref={inputRef}
          className="pl-12 pr-10 !py-2.5 text-base"
          placeholder="Search projects, parties, products, students…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {searching && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted animate-pulse">searching…</span>}
      </div>

      {!q.trim() ? (
        <p className="text-sm text-muted text-center py-10">
          Type to search projects, billing parties, inventory items, warehouse &amp; school records.
        </p>
      ) : total === 0 && !searching ? (
        <p className="text-sm text-muted text-center py-10">No results for “{q}”.</p>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
          {groups.map((g) => (
            <div key={g.name}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                <span>{GROUP_ICON[g.name] ?? <FolderKanban className="w-4 h-4" />}</span>
                {g.name}
                <Badge variant="outline" size="sm">{g.rows.length}</Badge>
              </div>
              <div className="space-y-1">
                {g.rows.slice(0, 20).map((r, i) => (
                  <button
                    key={`${g.name}-${i}`}
                    onClick={() => go(r)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                      'bg-surface2/50 border border-border hover:border-primary hover:bg-primary/5 transition-colors'
                    )}
                  >
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">{r.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-text truncate">{r.label}</span>
                      {r.sub && <span className="block text-xs text-muted truncate">{r.sub}</span>}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

/** Collection metadata: localStorage key prefix → target route + display group. */
const COLLECTIONS: { key: string; group: string; to: (id: string) => string; nameField: string[] }[] = [
  { key: 'luxinfra:warehouse:products', group: 'Warehouse Products', to: () => '/warehouse/products', nameField: ['name', 'sku'] },
  { key: 'luxinfra:warehouse:customers', group: 'Warehouse Customers', to: () => '/warehouse/customers', nameField: ['name', 'company'] },
  { key: 'luxinfra:warehouse:suppliers', group: 'Warehouse Suppliers', to: () => '/warehouse/suppliers', nameField: ['name', 'company'] },
  { key: 'luxinfra:warehouse:staff', group: 'Warehouse Staff', to: () => '/warehouse/staff', nameField: ['name'] },
  { key: 'luxinfra:warehouse:projects', group: 'Warehouse Projects', to: (id) => `/warehouse/projects/${id}`, nameField: ['name', 'client'] },
  { key: 'luxinfra:school:students', group: 'School Students', to: () => '/school/students', nameField: ['name', 'rollNo', 'admissionNo'] },
  { key: 'luxinfra:school:classes', group: 'School Classes', to: () => '/school/classes', nameField: ['name', 'section'] },
  { key: 'luxinfra:school:staff', group: 'School Staff', to: () => '/school/staff', nameField: ['name'] },
  { key: 'luxinfra:school:projects', group: 'School Projects', to: () => `/school/projects`, nameField: ['name', 'client'] },
]

/** Scan every known frontend-only collection for matches. */
function searchLocalStorage(q: string): SearchResult[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  const out: SearchResult[] = []
  for (const c of COLLECTIONS) {
    let rows: unknown[] = []
    try {
      rows = JSON.parse(localStorage.getItem(c.key) ?? '[]')
    } catch {
      continue
    }
    for (const row of rows as Record<string, unknown>[]) {
      const haystack = c.nameField.map((f) => String(row[f] ?? '')).join(' ').toLowerCase()
      if (haystack.includes(needle)) {
        out.push({
          label: String(row.name ?? row.id ?? 'Record'),
          sub: c.group,
          to: c.to(String(row.id ?? '')),
          group: c.group,
          icon: GROUP_ICON[c.group],
        })
      }
    }
  }
  return out
}