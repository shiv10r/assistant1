import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Project } from '../api'
import { Card, CardContent, Button, Badge, Empty } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import { FiVideo, FiLink2, FiCopy, FiCheck, FiRefreshCw, FiBriefcase, FiExternalLink } from 'react-icons/fi'

const PROVIDERS = [
  { v: 'meet', l: 'Google Meet', desc: 'Open a new Meet room link', icon: '🟢' },
  { v: 'teams', l: 'Microsoft Teams', desc: 'Open a Teams meeting link', icon: '🔵' },
  { v: 'jitsi', l: 'Jitsi (embedded)', desc: 'Free open-source room shown in-app', icon: '🟣' },
]

export default function VideoCall() {
  const [room, setRoom] = useState('')
  const [url, setUrl] = useState('')
  const [provider, setProvider] = useState('meet')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const { toast } = useToast()

  useEffect(() => {
    api.projects.list().then(setProjects).catch(() => setProjects([]))
  }, [])

  async function start() {
    setLoading(true)
    try {
      const s = await api.modules.videoSession(projectId ? Number(projectId) : undefined, provider)
      setRoom(s.room)
      setUrl(s.url)
      setProvider(s.provider || provider)
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="text-2xl font-bold">Video Call</h1>
          <p className="text-text/60 text-sm mt-1">Create links for Google Meet, Teams, or an embedded Jitsi room.</p>
        </div>
        {room && (
          <Button onClick={copy} variant="outline">
            {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy invite link'}
          </Button>
        )}
      </div>

      {!room && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Empty
              icon={<FiVideo className="w-8 h-8" />}
              title="Start a call"
              description="Pick a provider and share the link with your team or clients."
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
              <div className="min-w-64 flex-1 max-w-md">
                <label className="text-sm font-medium mb-1 block">Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => setProvider(p.v)}
                      className={`rounded-lg border px-2 py-2 text-xs text-center transition-colors ${provider === p.v ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/40'}`}
                      title={p.desc}
                    >
                      <span className="block text-base">{p.icon}</span>
                      {p.l.replace(/ .*/, '')}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={start} disabled={loading}>
                {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiVideo className="w-4 h-4" />}
                {loading ? 'Starting…' : 'Start video call'}
              </Button>
            </div>
            <p className="text-xs text-text/50 flex items-center gap-1.5">
              <FiLink2 className="w-3.5 h-3.5" />
              Google Meet / Teams open a link — joiners click it in their browser or app. Jitsi embeds right here.
            </p>
          </CardContent>
        </Card>
      )}

      {room && provider === 'jitsi' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="success">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Live — {room}
            </Badge>
            {projectId && <Badge><FiBriefcase className="w-3 h-3" /> Project #{projectId}</Badge>}
          </div>
          <div className="rounded-2xl overflow-hidden border bg-surface shadow-sm">
            <iframe
              title="Jitsi meeting"
              src={url}
              className="w-full h-[70vh] block"
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copy} variant="outline"><FiCopy className="w-4 h-4" /> Copy invite link</Button>
            <Button onClick={() => { setRoom(''); setUrl('') }} variant="ghost">Leave / new call</Button>
          </div>
        </div>
      )}

      {room && provider !== 'jitsi' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="success">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              {provider === 'teams' ? 'Microsoft Teams' : 'Google Meet'} — {room}
            </Badge>
            {projectId && <Badge><FiBriefcase className="w-3 h-3" /> Project #{projectId}</Badge>}
          </div>
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-5xl">{provider === 'teams' ? '🔵' : '🟢'}</div>
              <p className="text-text">Your {provider === 'teams' ? 'Teams' : 'Meet'} room link is ready.</p>
              <Button size="lg" onClick={() => window.open(url, '_blank')}>
                <FiExternalLink className="w-4 h-4" /> Open {provider === 'teams' ? 'Microsoft Teams' : 'Google Meet'} meeting
              </Button>
              <Button onClick={copy} variant="outline">
                {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy invite link'}
              </Button>
              <p className="text-xs text-muted break-all">{url}</p>
            </CardContent>
          </Card>
          <div className="flex">
            <Button onClick={() => { setRoom(''); setUrl('') }} variant="ghost">Leave / new call</Button>
          </div>
        </div>
      )}
    </>
  )
}
