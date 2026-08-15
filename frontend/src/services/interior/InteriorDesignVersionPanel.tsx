import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Modal, fmtDate, money } from '../../components/ui'
import { Check, History } from 'lucide-react'
import type { DesignStyle, DesignVersion, InteriorDesign } from './types'

interface InteriorDesignVersionPreviewProps {
  readonly design: InteriorDesign
  readonly version: number
  readonly style: DesignStyle
}

export function InteriorDesignVersionPreview({ design, version, style }: InteriorDesignVersionPreviewProps) {
  const gradients: Record<DesignStyle, readonly [string, string]> = {
    Modern: ['#1e293b', '#64748b'],
    Minimal: ['#f8fafc', '#cbd5e1'],
    Luxury: ['#3f2d20', '#c9a26b'],
    Scandinavian: ['#f1f5f9', '#a8c3a0'],
    Traditional: ['#7c3a3c', '#d4a373'],
    Industrial: ['#1c1917', '#78716c'],
    Contemporary: ['#0f766e', '#22d3ee'],
  }
  const [from, to] = gradients[style]
  return (
    <svg viewBox="0 0 800 420" className="w-full h-52" role="img" aria-label={`${design.name} version ${version}`}>
      <defs>
        <linearGradient id={`g-${design.id}-${version}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="800" height="420" fill={`url(#g-${design.id}-${version})`} />
      <rect x="60" y="100" width="680" height="240" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="100" y="130" width="380" height="140" rx="6" fill="rgba(255,255,255,0.18)" />
      <rect x="520" y="130" width="180" height="140" rx="6" fill="rgba(255,255,255,0.10)" />
      <rect x="100" y="290" width="600" height="20" rx="10" fill="rgba(255,255,255,0.25)" />
      <rect x="80" y="50" width="220" height="26" rx="13" fill="rgba(255,255,255,0.85)" />
      <text x="96" y="68" fontSize="14" fill="#334155" fontFamily="sans-serif">{design.name} · v{version}</text>
    </svg>
  )
}

interface InteriorDesignVersionPanelProps {
  readonly design: InteriorDesign
  readonly compareOpen: boolean
  readonly onCloseCompare: () => void
  readonly onRestore: (version: DesignVersion) => void
}

export function InteriorDesignVersionPanel({ design, compareOpen, onCloseCompare, onRestore }: InteriorDesignVersionPanelProps) {
  const versions = [...design.versions].sort((a, b) => b.version - a.version)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><History className="w-4 h-4" /> Version history</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {versions.map((version) => (
              <div key={version.id} className={`p-3 rounded-lg border transition-colors ${version.version === design.currentVersion ? 'border-primary bg-primary/5' : 'border-border bg-surface2'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text">v{version.version} · {version.style} · {version.color}</p>
                  {version.version === design.currentVersion && <Badge variant="success" size="sm"><Check className="w-3 h-3" /> Active</Badge>}
                </div>
                <p className="text-xs text-muted mt-1">{fmtDate(version.createdAt)} · {money(version.budget)}</p>
                {version.version !== design.currentVersion && <Button variant="outline" size="sm" className="mt-2" onClick={() => onRestore(version)}>Restore this version</Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal open={compareOpen} onClose={onCloseCompare} title="Compare versions" size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {versions.map((version) => (
            <div key={version.id} className={`rounded-lg border overflow-hidden ${version.version === design.currentVersion ? 'border-primary' : 'border-border'}`}>
              <InteriorDesignVersionPreview design={design} version={version.version} style={version.style} />
              <div className="p-3 bg-surface2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text">v{version.version} · {version.style} · {version.color}</p>
                  {version.version === design.currentVersion && <Badge variant="success" size="sm">Active</Badge>}
                </div>
                <p className="text-xs text-muted mt-1">{fmtDate(version.createdAt)} · {money(version.budget)}</p>
                {version.prompt && <p className="text-xs text-muted italic mt-1">"{version.prompt}"</p>}
                {version.version !== design.currentVersion && <Button variant="outline" size="sm" className="mt-2" onClick={() => onRestore(version)}>Restore</Button>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onCloseCompare}>Close</Button>
        </div>
      </Modal>
    </>
  )
}
