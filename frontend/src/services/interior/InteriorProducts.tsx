import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Modal, Select, money, num } from '../../components/ui'
import { Search, Package } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProduct, ProductCategory } from './types'
import { PRODUCT_SEED } from './seed'
import { PRODUCT_CATEGORIES } from './types'
import { DataTable, type DataColumn } from '../../components/DataTable'

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Furniture: 'bg-blue-500/10 text-blue-500',
  Lighting: 'bg-amber-500/10 text-amber-500',
  Decor: 'bg-purple-500/10 text-purple-500',
  Flooring: 'bg-emerald-500/10 text-emerald-500',
  Wall: 'bg-cyan-500/10 text-cyan-500',
  Kitchen: 'bg-orange-500/10 text-orange-500',
  Bedroom: 'bg-rose-500/10 text-rose-500',
}

export default function InteriorProducts() {
  const { items } = useLocalCollection<InteriorProduct>('interior:products', PRODUCT_SEED)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [selected, setSelected] = useState<InteriorProduct | null>(null)

  const filtered = useMemo(
    () => items
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => `${p.name} ${p.material ?? ''} ${p.color ?? ''}`.toLowerCase().includes(query.toLowerCase())),
    [items, query, category]
  )

  const columns: DataColumn<InteriorProduct>[] = [
    {
      key: 'name', header: 'Product',
      render: (p) => (
        <button onClick={() => setSelected(p)} className="text-left font-medium hover:text-primary transition-colors">
          {p.name}
        </button>
      ),
      sortValue: (p) => p.name,
    },
    {
      key: 'category', header: 'Category', sortValue: (p) => p.category,
      render: (p) => <Badge variant="outline" size="sm" className={CATEGORY_COLORS[p.category]}>{p.category}</Badge>,
    },
    { key: 'material', header: 'Material', render: (p) => p.material ?? '—', hideOnMobile: true },
    { key: 'color', header: 'Colour', render: (p) => p.color ?? '—', hideOnMobile: true },
    {
      key: 'price', header: 'Price', sortValue: (p) => p.price,
      render: (p) => <span className="font-medium">{money(p.price)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Product catalogue</CardTitle>
          <Badge variant="info" size="sm">{num(filtered.length)} products</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input placeholder="Search products..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="w-full sm:w-48">
              <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory | 'all')}>
                <option value="all">All categories</option>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            pageSize={10}
            exportFilename="interior-products"
            emptyIcon={<Package className="w-6 h-6" />}
            emptyTitle="No products match"
            emptyDescription="Try a different search or category filter."
            toolbar={<div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategory('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === 'all' ? 'bg-primary text-white border-primary' : 'border-border bg-surface2 text-muted hover:text-text'}`}>All</button>
              {PRODUCT_CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === c ? 'bg-primary text-white border-primary' : 'border-border bg-surface2 text-muted hover:text-text'}`}>{c}</button>
              ))}
            </div>}
          />
        </CardContent>
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? 'Product'} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm" className={CATEGORY_COLORS[selected.category]}>{selected.category}</Badge>
              {selected.color && <Badge variant="outline" size="sm">{selected.color}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg border border-border bg-surface2">
                <p className="text-xs text-muted">Price</p>
                <p className="text-lg font-semibold text-primary mt-1">{money(selected.price)}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface2">
                <p className="text-xs text-muted">Material</p>
                <p className="text-lg font-semibold mt-1">{selected.material ?? '—'}</p>
              </div>
            </div>
            {(selected.width || selected.depth) && (
              <p className="text-sm text-muted">Dimensions: {selected.width ?? '—'} × {selected.depth ?? '—'}</p>
            )}
            {selected.description && <p className="text-sm text-muted">{selected.description}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
