import { Badge, Button } from '../../components/ui'
import { CheckCircle2, Palette, ScanLine, Sparkles, UploadCloud, Wand2 } from 'lucide-react'

export type GenStage = 'idle' | 'uploading' | 'processing' | 'generating' | 'completed' | 'failed'

const STAGE_LABEL: Record<GenStage, string> = {
  idle: 'Ready',
  uploading: 'Uploading room photo',
  processing: 'Analyzing room layout',
  generating: 'Creating design concepts',
  completed: 'Designs ready',
  failed: 'Generation failed',
}

interface InteriorGenerateProgressProps {
  readonly stage: GenStage
  readonly progress: number
  readonly name: string
  readonly roomName?: string
  readonly onGenerateAnother: () => void
  readonly onViewDesign: () => void
}

export function InteriorGenerateProgress({ stage, progress, name, roomName, onGenerateAnother, onViewDesign }: InteriorGenerateProgressProps) {
  if (stage === 'completed') {
    return (
      <div className="py-8 text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <div>
          <p className="font-medium text-text">Design "{name.trim()}" is ready!</p>
          <p className="text-sm text-muted mt-1">A complete concept with products and pricing was created for {roomName}.</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onGenerateAnother}>Generate another</Button>
          <Button onClick={onViewDesign}>View design <Sparkles className="w-4 h-4" /></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-center gap-3 text-text">
        <span className="relative flex h-8 w-8">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-30" />
          <span className="relative inline-flex rounded-full h-8 w-8 bg-primary/20 items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary" />
          </span>
        </span>
        <p className="font-medium">{STAGE_LABEL[stage]}</p>
      </div>
      <div className="w-full max-w-md mx-auto bg-surface2 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto text-xs">
        <div className={`flex items-center gap-2 ${stage === 'uploading' || progress > 25 ? 'text-primary' : 'text-muted'}`}>
          <UploadCloud className="w-4 h-4" /> Upload photo
        </div>
        <div className={`flex items-center gap-2 ${stage === 'processing' || progress > 50 ? 'text-primary' : 'text-muted'}`}>
          <ScanLine className="w-4 h-4" /> Analyze room
        </div>
        <div className={`flex items-center gap-2 ${stage === 'generating' || progress > 75 ? 'text-primary' : 'text-muted'}`}>
          <Palette className="w-4 h-4" /> Style concepts
        </div>
      </div>
      <Badge variant="info" size="sm">Frontend preview</Badge>
    </div>
  )
}
