import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Modal, money, num, fmtDate } from '../../components/ui'
import { ArrowLeft, FileText, Share2, CheckCircle2, Receipt } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProject, InteriorDesign, InteriorProduct } from './types'
import { PROJECT_SEED, DESIGN_SEED, PRODUCT_SEED } from './seed'

export default function InteriorQuotation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: designs } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)
  const { items: products } = useLocalCollection<InteriorProduct>('interior:products', PRODUCT_SEED)

  const project = projects.find((p) => p.id === id)
  const [shareOpen, setShareOpen] = useState(false)

  const savedDesigns = useMemo(
    () => designs.filter((d) => d.projectId === id && d.status === 'completed' && d.saved),
    [designs, id]
  )

  const lineItems = useMemo(() => {
    const map = new Map<string, { productId: string; name: string; category: string; qty: number; amount: number }>()
    for (const d of savedDesigns) {
      const v = d.versions.find((x) => x.version === d.currentVersion)
      if (!v) continue
      for (const pid of v.productIds) {
        const p = products.find((x) => x.id === pid)
        if (!p) continue
        const existing = map.get(pid)
        if (existing) {
          existing.qty += 1
          existing.amount += p.price
        } else {
          map.set(pid, { productId: pid, name: p.name, category: p.category, qty: 1, amount: p.price })
        }
      }
    }
    return [...map.values()]
  }, [savedDesigns, products])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of lineItems) {
      map.set(item.category, (map.get(item.category) ?? 0) + item.amount)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [lineItems])

  const total = lineItems.reduce((s, i) => s + i.amount, 0)
  const savedDesignNames = savedDesigns.map((d) => d.name)

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/interior/projects')}><ArrowLeft className="w-4 h-4" /> Back to projects</Button>
        <Card><CardContent className="py-10 text-center text-sm text-muted">Project not found.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(`/interior/projects/${project.id}`)}><ArrowLeft className="w-4 h-4" /> Back to {project.name}</Button>
        <Button onClick={() => setShareOpen(true)} disabled={lineItems.length === 0}><Share2 className="w-4 h-4" /> Share estimate</Button>
      </div>

      {lineItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="w-8 h-8 mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium text-text">No cost estimate yet</p>
            <p className="text-sm text-muted mt-1">Save at least one AI design for this project — the estimate is built from the products in your saved designs.</p>
            <Button className="mt-4" onClick={() => navigate(`/interior/projects/${project.id}/designs`)}>View designs</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Cost estimate</CardTitle>
                <p className="text-sm text-muted mt-1">{project.name} · generated from {num(savedDesigns.length)} saved design{savedDesigns.length === 1 ? '' : 's'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Total estimate</p>
                <p className="text-2xl font-bold text-primary">{money(total)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Line items</p>
                  <p className="text-lg font-semibold mt-1">{num(lineItems.length)}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Categories</p>
                  <p className="text-lg font-semibold mt-1">{num(byCategory.length)}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface2">
                  <p className="text-xs text-muted">Project budget</p>
                  <p className={`text-lg font-semibold mt-1 ${total > project.budget ? 'text-red-500' : 'text-emerald-500'}`}>{money(project.budget)}</p>
                </div>
              </div>
              {total > project.budget && (
                <p className="text-sm text-amber-600 mt-4 flex items-center gap-1">Estimate exceeds the project budget by {money(total - project.budget)}.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Breakdown by category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {byCategory.map(([category, amount]) => {
                      const pct = total ? Math.round((amount / total) * 100) : 0
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-text">{category}</span>
                            <span className="text-muted">{money(amount)} · {pct}%</span>
                          </div>
                          <div className="h-2 bg-surface2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Itemised list</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {lineItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{item.name}</p>
                          <p className="text-xs text-muted">{item.category} · qty {num(item.qty)}</p>
                        </div>
                        <p className="text-sm font-medium text-primary flex-shrink-0">{money(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-border">
                    <p className="font-medium text-text">Total</p>
                    <p className="font-bold text-primary">{money(total)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Designs included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedDesigns.map((d) => (
                      <button key={d.id} className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors text-left" onClick={() => navigate(`/interior/projects/${project.id}/designs/${d.id}`)}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{d.name}</p>
                          <p className="text-xs text-muted">{d.style} · {d.color} · v{d.currentVersion}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3">
                  <Badge variant="info">Frontend preview</Badge>
                  <p className="text-sm text-muted">Estimates are computed from the products linked to your saved designs. Nothing is sent anywhere.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share estimate" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted">Copy this estimate summary to share with your team.</p>
          <div className="p-3 rounded-lg border border-border bg-surface2 text-xs text-muted space-y-1 whitespace-pre-line">
            {`Cost estimate — ${project.name}\nGenerated ${fmtDate(new Date().toISOString())}\n\n${byCategory.map(([c, a]) => `${c}: ${money(a)}`).join('\n')}\n\nTotal: ${money(total)}\nDesigns: ${savedDesignNames.join(', ')}`}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShareOpen(false)}>Close</Button>
            <Button onClick={() => { navigator.clipboard?.writeText(`Cost estimate — ${project.name}\nTotal: ${money(total)}\nDesigns: ${savedDesignNames.join(', ')}`) }}>Copy summary</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}