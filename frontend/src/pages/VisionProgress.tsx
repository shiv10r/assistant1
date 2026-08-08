import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { Project } from '../api'
import { Card, CardContent, Badge, Button, Label, Select, Empty } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { Camera, ImagePlus, Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react'

export default function VisionProgress() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ progress: number; note: string; model: string } | null>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    api.projects.list().then((ps) => {
      setProjects(ps)
      if (ps.length === 1) setProjectId(String(ps[0].id))
    }).catch(() => setProjects([]))
    api.integrations.status().then((s) => setConfigured(s.vision !== 'not_configured')).catch(() => setConfigured(false))
  }, [])

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast({ title: 'Please choose an image', variant: 'error' }); return }
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result))
      setPhotoName(file.name)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const analyse = async () => {
    if (!photo) { toast({ title: 'Add a site photo first', variant: 'error' }); return }
    if (!projectId) { toast({ title: 'Choose a project', variant: 'error' }); return }
    setBusy(true)
    try {
      const dataBase64 = photo.split(',')[1] || photo
      const res = await api.integrations.visionProgress(dataBase64)
      if (res.ok && res.progress !== undefined) {
        setResult({ progress: res.progress, note: res.note || '', model: res.model || '' })
        toast({ title: 'Analysis complete', description: `${res.progress}% estimated` })
      } else {
        toast({ title: res.code === 'not_configured' ? 'Vision AI not configured' : 'Analysis failed', description: res.error || res.message || 'Unknown error', variant: 'error' })
      }
    } catch (e) {
      toast({ title: 'Analysis failed', description: String(e), variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vision Progress</h1>
          <div className="muted">Estimate site progress % from a photo using AI</div>
        </div>
        {configured === false && <Badge variant="warning">Vision AI not configured — set OPENROUTER_API_KEY</Badge>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 space-y-5">
            <div>
              <Label htmlFor="vp-project">Project</Label>
              <Select id="vp-project" value={projectId} onValueChange={setProjectId} className="mt-1">
                <option value="">Select project…</option>
                {projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </Select>
            </div>

            <div>
              <Label>Site photo</Label>
              {photo ? (
                <div className="relative mt-1 rounded-xl overflow-hidden border border-border">
                  <img src={photo} alt="site" className="w-full max-h-80 object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="outline" className="bg-black/60 text-white border-transparent hover:bg-black/80" onClick={() => fileRef.current?.click()}>
                      <ImagePlus className="w-4 h-4" /> Change
                    </Button>
                    <Button size="sm" variant="outline" className="bg-black/60 text-white border-transparent hover:bg-black/80" onClick={() => { setPhoto(null); setResult(null) }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-1 w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted hover:text-primary"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">{photoName || 'Click to upload or capture a photo'}</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f) }} />
            </div>

            <Button className="w-full" size="lg" onClick={analyse} disabled={busy || !photo || !projectId}>
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing photo…</> : <><Sparkles className="w-4 h-4" /> Estimate Progress</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            {!result ? (
              <Empty
                icon={<Sparkles className="w-12 h-12" />}
                title="AI progress estimate"
                description="Upload a recent site photo. The AI will estimate how much of the project is complete and summarise what's pending."
              />
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-sm text-muted">Estimated progress</span>
                    <span className="text-4xl font-bold text-primary">{result.progress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface2 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${result.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <Badge variant="success" size="sm">Analysed by {result.model || 'vision model'}</Badge>
                </div>
                <div className="p-4 rounded-xl bg-surface2/60 border border-border">
                  <p className="text-sm text-text leading-relaxed">{result.note}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
