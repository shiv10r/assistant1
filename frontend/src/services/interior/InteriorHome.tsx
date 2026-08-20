import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Badge, money, num } from '../../components/ui'
import { Home, Plus, Sparkles, ShoppingBag, FileText, ArrowRight, CheckCircle2, Layers, Camera } from 'lucide-react'
import { useLocalCollection } from '../../lib/localStore'
import type { InteriorProject, InteriorRoom, InteriorDesign, InteriorProduct } from './types'
import { PROJECT_SEED, ROOM_SEED, DESIGN_SEED, PRODUCT_SEED } from './seed'
import { KPICard } from '../../components/ui'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../components/AdvancedPanel'

const NAV = [
  { label: 'New project', to: '/interior/projects', icon: <Plus className="w-5 h-5" /> },
  { label: 'All projects', to: '/interior/projects', icon: <Layers className="w-5 h-5" /> },
  { label: 'Products', to: '/interior/products', icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Designs', to: '/interior/projects', icon: <Sparkles className="w-5 h-5" /> },
]

export default function InteriorHome() {
  const navigate = useNavigate()
  const { items: projects } = useLocalCollection<InteriorProject>('interior:projects', PROJECT_SEED)
  const { items: rooms } = useLocalCollection<InteriorRoom>('interior:rooms', ROOM_SEED)
  const { items: designs } = useLocalCollection<InteriorDesign>('interior:designs', DESIGN_SEED)
  const { items: products } = useLocalCollection<InteriorProduct>('interior:products', PRODUCT_SEED)

  const activeProjects = projects.filter((p) => p.status === 'active')
  const savedDesigns = designs.filter((d) => d.saved && d.status === 'completed')
  const favorites = designs.filter((d) => d.favorite)
  const totalBudget = activeProjects.reduce((s, p) => s + p.budget, 0)
  const roomsWithImage = rooms.filter((r) => r.image).length

  const designStatusDonut: DonutDatum[] = useMemo(() => {
    const completed = designs.filter((d) => d.status === 'completed').length
    const generating = designs.filter((d) => d.status === 'generating').length
    const failed = designs.filter((d) => d.status === 'failed').length
    return [
      { label: 'Completed', value: completed, color: 'var(--emerald, #10b981)' },
      { label: 'Generating', value: generating, color: 'var(--amber, #f59e0b)' },
      { label: 'Failed', value: failed, color: 'var(--red, #ef4444)' },
    ]
  }, [designs])

  const styleBars: BarDatum[] = useMemo(() => {
    const byStyle = new Map<string, number>()
    for (const d of designs) byStyle.set(d.style, (byStyle.get(d.style) ?? 0) + 1)
    return [...byStyle.entries()]
      .map(([label, value]) => ({ label, value }))
      .slice(0, 6)
  }, [designs])

  const recentProjects = [...projects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
  const recentDesigns = [...designs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)

  const needsAttention = [
    ...(rooms.filter((r) => !r.image).slice(0, 3).map((r) => {
      const p = projects.find((x) => x.id === r.projectId)
      return { label: `Upload image for "${r.name}" (${p?.name ?? 'project'})`, to: `/interior/projects/${r.projectId}/rooms/${r.id}`, tone: 'info' as const }
    })),
    ...(designs.filter((d) => d.status === 'failed').slice(0, 2).map((d) => ({
      label: `Design "${d.name}" failed to generate — retry it`,
      to: `/interior/projects/${d.projectId}/generate`,
      tone: 'danger' as const,
    }))),
  ].slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active projects" value={num(activeProjects.length)} sub={`${money(totalBudget)} total budget`} icon={<Home className="w-5 h-5" />} tone="info" onClick={() => navigate('/interior/projects')} />
        <KPICard label="AI designs" value={num(savedDesigns.length)} sub={`${num(favorites.length)} favourites`} icon={<Sparkles className="w-5 h-5" />} tone="default" onClick={() => navigate('/interior/projects')} />
        <KPICard label="Rooms" value={num(rooms.length)} sub={`${num(roomsWithImage)} with photos`} icon={<Camera className="w-5 h-5" />} tone="success" onClick={() => navigate('/interior/projects')} />
        <KPICard label="Products" value={num(products.length)} sub="in the catalogue" icon={<ShoppingBag className="w-5 h-5" />} tone="warning" onClick={() => navigate('/interior/products')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AdvancedPanel
            title="Designs by style"
            subtitle="AI design count per style"
            bars={styleBars}
            compare={[
              { label: 'Projects', value: num(projects.length) },
              { label: 'Saved designs', value: num(savedDesigns.length) },
              { label: 'Favourites', value: num(favorites.length), deltaTone: favorites.length ? 'up' : 'flat' },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {NAV.map((l) => (
                  <button key={l.label} onClick={() => navigate(l.to)} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors">
                    <span className="text-primary">{l.icon}</span>
                    <span className="text-sm font-medium text-text">{l.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">Recent projects</CardTitle>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted">No projects yet — create your first one.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentProjects.map((p) => (
                    <button key={p.id} onClick={() => navigate(`/interior/projects/${p.id}`)} className="text-left p-4 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors">
                      <p className="text-sm font-semibold text-text">{p.name}</p>
                      <p className="text-xs text-muted mt-1">{p.propertyType} · {p.location}</p>
                      <p className="text-xs text-primary mt-2">{money(p.budget)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AdvancedPanel
            title="Design status"
            subtitle="Distribution across all designs"
            donut={designStatusDonut}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">Recent AI designs</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDesigns.length === 0 ? (
                <p className="text-sm text-muted">No designs yet — generate your first one.</p>
              ) : (
                <div className="space-y-2">
                  {recentDesigns.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => navigate(`/interior/projects/${d.projectId}/designs/${d.id}`)}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{d.name}</p>
                        <p className="text-xs text-muted">{d.style} · {d.color} · {money(d.budget)}</p>
                      </div>
                      {d.saved ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-amber-500" /> Needs attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {needsAttention.length === 0 ? (
                <p className="text-sm text-muted">All clear — nothing needs attention right now.</p>
              ) : (
                <div className="space-y-2">
                  {needsAttention.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(n.to)}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface2 hover:border-primary/50 transition-colors text-left"
                    >
                      <span className="text-sm text-text flex-1 min-w-0">{n.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <Badge variant="info">Frontend preview</Badge>
              <p className="text-sm text-muted">Projects, rooms, AI designs, products and cost estimates are stored locally in your browser.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
