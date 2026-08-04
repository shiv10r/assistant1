import { useEffect, useState } from 'react'
import { api } from '../../api'
import type { CatalogItem } from '../../api'
import { Empty, Modal, money, num, PageHead } from '../../ui'

const UNITS = ['Pcs', 'Kg', 'Gm', 'Ltr', 'Mtr', 'Sqft', 'Box', 'Bag', 'Dozen', 'Hour', 'Day']
const TAXES = [0, 0.25, 3, 5, 12, 18, 28]

function blank(): CatalogItem {
  return { id: 0, name: '', type: 'Product', salePrice: 0, purchasePrice: 0, wholesalePrice: 0, unit: 'Pcs', category: '', hsnSac: '', taxRate: 18, stockQty: 0, minStock: 0, barcode: '', description: '' }
}

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<CatalogItem>(blank())
  const set = (k: keyof CatalogItem, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  const load = () => { api.billing.items().then(setItems).catch(() => setItems([])) }
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (!f.name.trim()) { setErr('Item name is required'); return }
      await api.billing.saveItem(f)
      setOpen(false)
      load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="📦" title="Items" sub="Catalog & inventory" right={<button className="btn" onClick={() => { setF(blank()); setErr(''); setOpen(true) }}>＋ Add Item</button>} />

      {items.length === 0 ? <Empty>No items yet — tap "Add Item".</Empty> : (
        <div className="card" style={{ padding: 8 }}>
          <table className="main-table">
            <thead><tr><th>Item</th><th>Type</th><th>Unit</th><th>GST %</th><th className="num">Sale ₹</th><th className="num">Stock</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} style={{ cursor: 'pointer' }} onClick={() => { setF(it); setErr(''); setOpen(true) }}>
                  <td className="cat">{it.name}</td>
                  <td className="muted">{it.type}</td>
                  <td className="muted">{it.unit}</td>
                  <td className="muted">{it.taxRate}%</td>
                  <td className="num">{money(it.salePrice)}</td>
                  <td className="num muted">{it.type === 'Service' ? '—' : `${num(it.stockQty)} ${it.unit}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={f.id ? 'Edit Item' : 'Add Item'} onClose={() => setOpen(false)} wide>
          <div className="form-row">
            <input value={f.name} placeholder="Item name *" onChange={(e) => set('name', e.target.value)} />
            <select value={f.type} onChange={(e) => set('type', e.target.value)}>
              <option>Product</option><option>Service</option>
            </select>
          </div>
          <div className="form-row">
            <select value={f.unit} onChange={(e) => set('unit', e.target.value)}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
            <select value={f.taxRate} onChange={(e) => set('taxRate', Number(e.target.value))}>{TAXES.map((t) => <option key={t} value={t}>{t}%</option>)}</select>
            <input value={f.category} placeholder="Category" onChange={(e) => set('category', e.target.value)} />
          </div>
          <div className="form-row">
            <input type="number" min={0} value={f.salePrice || ''} placeholder="Sale price" onChange={(e) => set('salePrice', Number(e.target.value))} />
            {f.type !== 'Service' && <input type="number" min={0} value={f.purchasePrice || ''} placeholder="Purchase price" onChange={(e) => set('purchasePrice', Number(e.target.value))} />}
            <input value={f.hsnSac} placeholder="HSN/SAC" onChange={(e) => set('hsnSac', e.target.value)} />
          </div>
          {f.type !== 'Service' && <div className="form-row">
            <input type="number" min={0} value={f.stockQty || ''} placeholder="Stock qty" onChange={(e) => set('stockQty', Number(e.target.value))} />
            <input type="number" min={0} value={f.minStock || ''} placeholder="Min stock" onChange={(e) => set('minStock', Number(e.target.value))} />
          </div>}
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn" onClick={save}>💾 Save</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}