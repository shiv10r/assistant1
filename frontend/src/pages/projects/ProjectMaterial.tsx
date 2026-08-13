import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import type { MaterialTxn } from '../../api'
import { Empty, Modal, money, num, fmtDate, todayISO, PageHead } from '../../ui'

const TABS = ['Inventory', 'Request', 'Received', 'Delivered']
const MODES = ['Cash', 'Bank Transfer', 'Cheque']

export default function ProjectMaterial() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const [tab, setTab] = useState('Inventory')
  const [materials, setMaterials] = useState<MaterialTxn[]>([])
  const [inventory, setInventory] = useState<{ material: string; qty: number; unit: string }[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState('Request')
  const [f, setF] = useState({ materialName: '', quantity: 0, unit: 'Pcs', vendorName: '', vendorLocation: '', paymentMode: 'Cash', amount: 0, date: todayISO() })

  const load = () => Promise.all([api.projects.detail(pid), api.projects.inventory(pid)])
    .then(([d, inv]) => { setMaterials(d.materials); setInventory(inv) }).catch(() => {})
  useEffect(() => { load() }, [pid])
  useEffect(() => { if (tab !== 'Inventory') api.projects.materials(pid, tab).then(setMaterials).catch(() => setMaterials([])) }, [tab, pid])

  const save = async () => {
    try {
      if (!f.materialName.trim()) { setErr('Material name required'); return }
      const m: MaterialTxn = { id: 0, projectId: pid, kind, materialName: f.materialName, quantity: Number(f.quantity), unit: f.unit, vendorName: f.vendorName, vendorLocation: f.vendorLocation, paymentMode: f.paymentMode, amount: Number(f.amount), date: f.date }
      await api.projects.saveMaterial(pid, m)
      setOpen(false); load()
    } catch (e) { setErr(String(e)) }
  }

  const addStock = async (item: { material: string; qty: number; unit: string }, delta: number, stockKind: string) => {
    try {
      const m: MaterialTxn = { id: 0, projectId: pid, kind: stockKind, materialName: item.material, quantity: Math.abs(delta), unit: item.unit, vendorName: 'Stock Adjustment', vendorLocation: '', paymentMode: 'Cash', amount: 0, date: todayISO() }
      await api.projects.saveMaterial(pid, m)
      load()
    } catch (e) { setErr(String(e)) }
  }

  const removeStock = async (item: { material: string; qty: number; unit: string }) => {
    try {
      const m: MaterialTxn = { id: 0, projectId: pid, kind: 'Delivered', materialName: item.material, quantity: item.qty, unit: item.unit, vendorName: 'Stock Adjustment', vendorLocation: '', paymentMode: 'Cash', amount: 0, date: todayISO() }
      await api.projects.saveMaterial(pid, m)
      load()
    } catch (e) { setErr(String(e)) }
  }

  return (
    <>
      <PageHead icon="🧱" title="Materials" sub="Inventory, requests, received & delivered" right={<button className="btn" onClick={() => nav(`/projects/${pid}`)}>← Back</button>} />

      <div className="tabs">
        {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab !== 'Inventory' && (
        <div className="toolbar">
          <button className="btn ghost" onClick={() => { setKind(tab === 'Received' ? 'Received' : tab === 'Delivered' ? 'Delivered' : 'Request'); setErr(''); setOpen(true) }}>＋ Add {tab === 'Request' ? 'Request' : tab === 'Received' ? 'Received' : 'Delivered'}</button>
        </div>
      )}

      {tab === 'Inventory' ? (
        inventory.length === 0 ? <Empty>No stock yet. Add received / delivered materials.</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Material</th><th className="num">Stock</th><th>Unit</th><th>Adjust</th></tr></thead>
              <tbody>{inventory.map((m) => (
                <tr key={m.material}>
                  <td className="cat">{m.material}</td>
                  <td className="num">{num(m.qty)}</td>
                  <td className="muted">{m.unit}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} title="Add stock (received)" onClick={() => addStock(m, 1, 'Received')}>＋</button>
                      <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} title="Use stock (delivered)" onClick={() => addStock(m, 1, 'Delivered')}>－</button>
                      <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} title="Remove all this material" onClick={() => removeStock(m)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      ) : (
        materials.length === 0 ? <Empty>No {tab.toLowerCase()} entries.</Empty> : (
          <div className="card" style={{ padding: 8 }}>
            <table className="main-table">
              <thead><tr><th>Material</th><th className="num">Qty</th><th>Vendor</th><th>Date</th><th className="num">Amount</th></tr></thead>
              <tbody>{materials.map((m) => (
                <tr key={m.id}>
                  <td className="cat">{m.materialName}</td>
                  <td className="num">{num(m.quantity)} {m.unit}</td>
                  <td className="muted">{(m.vendorName || '—') + (m.vendorLocation ? ` · ${m.vendorLocation}` : '')}</td>
                  <td className="muted">{fmtDate(m.date)}</td>
                  <td className="num">{money(m.amount)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}

      {open && (
        <Modal title={`Add ${kind}`} onClose={() => setOpen(false)}>
          <div className="form-row">
            <input value={f.materialName} placeholder="Material name *" onChange={(e) => setF({ ...f, materialName: e.target.value })} />
            <select value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
              {['Pcs', 'Kg', 'Gm', 'Ltr', 'Mtr', 'Sqft', 'Box', 'Bag'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-row">
            <input type="number" min={0} value={f.quantity || ''} placeholder="Quantity *" onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} />
            <input type="number" min={0} value={f.amount || ''} placeholder="Amount" onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
          </div>
          <div className="form-row">
            <input value={f.vendorName} placeholder="Vendor" onChange={(e) => setF({ ...f, vendorName: e.target.value })} />
            <input value={f.vendorLocation} placeholder="Vendor location" onChange={(e) => setF({ ...f, vendorLocation: e.target.value })} />
          </div>
          <div className="form-row">
            <select value={f.paymentMode} onChange={(e) => setF({ ...f, paymentMode: e.target.value })}>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          {err && <div className="empty" style={{ color: '#E05C7A', padding: '8px 0' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn" onClick={save}>Save</button>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  )
}