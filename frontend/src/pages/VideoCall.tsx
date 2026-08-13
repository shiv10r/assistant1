import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { Project } from '../api'
import { Card, CardContent, Button, Badge, Empty } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { Video, Link2, Copy, Check, RefreshCw, Briefcase } from 'lucide-react'

export default function VideoCall() {
  const [room, setRoom] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const frameRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    api.projects.list().then(setProjects).catch(() => setProjects([]))
  }, [])

  async function start(projectIdValue?: number) {
    setLoading(true)
    try {
      const s = await api.modules.videoSession(projectIdValue || undefined)
      setRoom(s.room)
      setUrl(s.url)
    } catch (e) {
      toast({ title: String(e), variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast({ title: 'Invite link copied' })
    })
  }

  useEffect(() => {
    if (!room) return
    const frame = frameRef.current
    if (!frame) return
    frame.src = url
  }, [room, url])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="text-2xl font-bold">Video Call</h1>
          <p className="text-text/60 text-sm mt-1">Free group calls powered by Jitsi Meet — no account needed.</p>
        </div>
        {room && (
          <Button onClick={copy} variant="outline">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy invite link'}
          </Button>
        )}
      </div>

      {!room && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Empty
              icon={<Video className="w-8 h-8" />}
              title="Start a call"
              description="Create a private meeting room and share the link with your team or clients."
            />
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-52">
                <label className="text-sm font-medium mb-1 block">Attach to project (optional)</label>
                <select
                  className="w-full h-10 rounded-lg border bg-surface px-3 text-sm"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">General / no project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={() => start(projectId ? Number(projectId) : undefined)} disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                {loading ? 'Starting…' : 'Start video call'}
              </Button>
            </div>
            <p className="text-xs text-text/50 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Works best on Chrome / Android. Joiners open the invite link directly in the browser.
            </p>
          </CardContent>
        </Card>
      )}

      {room && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="success">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Live — {room}
            </Badge>
            {projectId && <Badge><Briefcase className="w-3 h-3" /> Project #{projectId}</Badge>}
          </div>
          <div className="rounded-2xl overflow-hidden border bg-surface shadow-sm">
            <iframe
              ref={frameRef}
              title="Jitsi meeting"
              className="w-full h-[70vh] block"
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copy} variant="outline">
              <Copy className="w-4 h-4" /> Copy invite link
            </Button>
            <Button onClick={() => { setRoom(''); setUrl('') }} variant="ghost">
              Leave / new call
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
