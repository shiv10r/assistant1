import { useMemo, useState, type ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Select, Modal, cn } from './ui'
import { useToast } from './ui/Toast'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../lib/localStore'
import { DataTable, type DataColumn } from './ui'

export interface CrudField {
  name: string
  label: string
  required?: boolean
  type?: 'text' | 'number' | 'date' | 'select'
  options?: { value: string; label: string }[]
  placeholder?: string
  /** 1 = half width, 2 = full width (in a 2-col form grid). Default 1. */
  span?: 1 | 2
}

export interface CrudContext<T> {
  items: T[]
  update: (id: string, patch: Partial<T>) => void
  remove: (id: string) => void
}

export interface CrudColumn<T> {
  key: string
  header: string
  render: (item: T, ctx: CrudContext<T>) => ReactNode
  sortValue?: (item: T) => string | number
  csvValue?: (item: T) => string | number
  headerClassName?: string
  cellClassName?: string
  hideOnMobile?: boolean
}

export interface CrudPageProps<T extends { id: string }> {
  /** localStorage collection key, e.g. "school:students" */
  collection: string
  seed: T[]
  title: string
  addLabel: string
  singular: string
  searchPlaceholder: string
  searchKeys: (item: T) => string
  columns: CrudColumn<T>[]
  fields: CrudField[]
  defaults: Record<string, string>
  /** Convert form → record. Return null to block save (validation failure). */
  toRecord: (form: Record<string, string>) => Partial<T> | null
  fromRecord: (item: T) => Record<string, string>
  emptyIcon: ReactNode
  emptyTitle: string
  emptyDescription: string
  exportFilename?: string
  /** Extra row buttons rendered before Edit/Delete. */
  rowActions?: (item: T, ctx: CrudContext<T>) => ReactNode
  /** Extra toolbar content (e.g. outstanding total). */
  toolbarExtra?: (items: T[]) => ReactNode
  statusFilter?: {
    options: { value: string; label: string }[]
    match: (item: T, value: string) => boolean
  }
  useToasts?: boolean
  /** Extra fields applied only on add (e.g. status: 'active'). */
  addExtras?: Partial<T>
  allowEdit?: boolean
  canSave?: (form: Record<string, string>) => boolean
  modalSize?: 'sm' | 'md' | 'lg' | 'xl'
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function CrudPage<T extends { id: string }>({
  collection, seed, title, addLabel, singular, searchPlaceholder, searchKeys,
  columns, fields, defaults, toRecord, fromRecord,
  emptyIcon, emptyTitle, emptyDescription, exportFilename,
  rowActions, toolbarExtra, statusFilter, useToasts, addExtras,
  allowEdit = true, canSave, modalSize = 'md',
}: CrudPageProps<T>) {
  const { items, add, update, remove } = useLocalCollection<T>(collection, seed)
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<Record<string, string>>(defaults)

  const ctx = useMemo<CrudContext<T>>(() => ({ items, update, remove }), [items, update, remove])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchQ = searchKeys(item).toLowerCase().includes(q)
      const matchS = !statusFilter || status === 'all' || statusFilter.match(item, status)
      return matchQ && matchS
    })
  }, [items, query, status, statusFilter, searchKeys])

  const tableColumns = useMemo<DataColumn<T>[]>(
    () => columns.map((c) => ({ ...c, render: (row: T) => c.render(row, ctx) })),
    [columns, ctx]
  )

  function openAdd() {
    setEditing(null)
    setForm(defaults)
    setModalOpen(true)
  }

  function openEdit(item: T) {
    setEditing(item)
    setForm(fromRecord(item))
    setModalOpen(true)
  }

  function save() {
    const record = toRecord(form)
    if (!record) {
      if (useToasts) toast({ title: `${cap(singular)} name is required`, variant: 'error' })
      return
    }
    if (editing) {
      update(editing.id, record)
      if (useToasts) toast({ title: `${cap(singular)} updated`, description: form.name?.trim() })
    } else {
      add({ id: genId(), ...addExtras, ...record } as T)
      if (useToasts) toast({ title: `${cap(singular)} added`, description: form.name?.trim() })
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> {addLabel}</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            rows={filtered}
            rowKey={(item) => item.id}
            pageSize={10}
            exportFilename={exportFilename}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            toolbar={
              <div className="flex flex-wrap gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <Input placeholder={searchPlaceholder} className="pl-12" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                {statusFilter && (
                  <Select value={status} onValueChange={(v) => setStatus(v)} className="w-40">
                    <option value="all">All statuses</option>
                    {statusFilter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                )}
                {toolbarExtra?.(items)}
              </div>
            }
            actions={(item) => (
              <div className="flex gap-1">
                {rowActions?.(item, ctx)}
                {allowEdit && (
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${singular}` : addLabel} size={modalSize}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={cn(f.span === 2 && 'sm:col-span-2')}>
                <Label required={f.required}>{f.label}</Label>
                {f.type === 'select' ? (
                  <Select value={form[f.name] ?? ''} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                ) : (
                  <Input
                    type={f.type ?? 'text'}
                    placeholder={f.placeholder}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={canSave ? !canSave(form) : false}>
              {editing ? 'Save changes' : addLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}