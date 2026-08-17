import { useEffect, useState } from 'react'
import { api } from '../api'
import type { Broadcast } from '../api'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, PageHead } from '../components/ui'
import { usePlan } from '../hooks/usePlan'
import { FiSend, FiSquare, FiBell, FiLock, FiTrash2 } from 'react-icons/fi'
import { IoMegaphone } from 'react-icons/io5'
import { MdWorkspacePremium, MdHistory } from 'react-icons/md'

export default function BroadcastPage() {
  const { isPremium, plan, setPlan } = usePlan()
  const [msg, setMsg] = useState('')
  const [active, setActive] = useState<Broadcast | null>(null)
  const [history, setHistory] = useState<Broadcast[]>([])
  const [busy, setBusy] = useState(false)
  const [pushNote, setPushNote] = useState('')
  const [q, setQ] = useState('')

  const query = q.trim().toLowerCase()
  const filteredHistory = query
    ? history.filter((b) => b.message.toLowerCase().includes(query))
    : history

  const load = () => {
    api.modules.broadcastActive().then((r) => setActive(r.active)).catch(() => {})
    api.modules.broadcastHistory().then(setHistory).catch(() => {})
  }
  useEffect(() => { load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [])

  const publish = async () => {
    if (!msg.trim()) return
    setBusy(true); setPushNote('')
    try {
      const r = await api.modules.broadcastPublish(msg.trim())
      setMsg('')
      load()
      setPushNote(r.enabled ? `Sent to ${r.sent} registered device(s) via push.` : 'Saved as marquee â€” FCM not configured so no push was sent.')
    } catch (e) { setPushNote(String(e)) }
    setBusy(false)
  }

  const stop = async () => {
    setBusy(true)
    try { await api.modules.broadcastStop(); setActive(null); load() } catch { /* ignore */ }
    setBusy(false)
  }

  return (
    <>
      <PageHead
        icon="ðŸ“¢"
        title="Broadcast"
        sub="Send a scrolling announcement to the whole app + push notification to every device"
        right={<Badge variant={isPremium ? 'success' : 'outline'}>{isPremium ? `${plan} plan` : 'Free plan'}</Badge>}
      />

      {!isPremium && (
        <Card className="mb-6 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><FiLock className="w-5 h-5" /></div>
              <div>
                <p className="font-semibold text-text">Broadcast is a premium feature</p>
                <p className="text-sm text-muted">Upgrade to publish marquee announcements that scroll across the app and ping every device.</p>
              </div>
            </div>
            <Button onClick={() => setPlan('pro')}><MdWorkspacePremium className="w-4 h-4" /> Activate Pro (free trial)</Button>
          </CardContent>
        </Card>
      )}

      {!isPremium ? (
        <Card>
          <CardContent className="p-10 text-center text-muted">
            <IoMegaphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-text">Broadcast composer is locked</p>
            <p className="text-sm mt-1">Activate Pro to compose and publish announcements.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {active && (
            <div className="mb-6 overflow-hidden rounded-xl border border-primary/30 bg-primary/5">
              <div className="relative flex items-center overflow-hidden whitespace-nowrap py-3 marquee-track">
                <div className="marquee-anim inline-flex items-center gap-8 pl-4">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold">
                      <IoMegaphone className="w-4 h-4 text-primary shrink-0" /> {active.message}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><IoMegaphone className="w-5 h-5 text-primary" /> Compose announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type anything you want to broadcast â€” e.g. 'Meeting at 6 PM in office â°'"
              />
              <p className="text-xs text-muted">Preview:</p>
              <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-2.5 overflow-hidden whitespace-nowrap">
                <span className="text-sm text-text/80">{msg.trim() || 'Your marquee text appears hereâ€¦'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={publish} disabled={busy || !msg.trim()}><FiSend className="w-4 h-4" /> Publish to all</Button>
                {active && <Button variant="outline" onClick={stop} disabled={busy}><FiSquare className="w-4 h-4" /> Stop marquee</Button>}
              </div>
              {pushNote && <p className="text-sm text-muted">{pushNote}</p>}
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MdHistory className="w-5 h-5 text-primary" /> Published</CardTitle>
                <Badge variant="outline">{history.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input placeholder="Search announcementsâ€¦" value={q} onChange={(e) => setQ(e.target.value)} />
                {filteredHistory.length === 0 ? (
                  <p className="text-sm text-muted py-2">{history.length === 0 ? 'Nothing published yet.' : `No announcements match "${q}".`}</p>
                ) : filteredHistory.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{b.message}</p>
                      <p className="text-xs text-muted mt-0.5">{b.publishedLabel}</p>
                    </div>
                    <Badge variant={b.isActive ? 'success' : 'outline'}>{b.isActive ? 'Live' : 'Stopped'}</Badge>
                    <FiBell className="w-4 h-4 text-muted shrink-0" />
                    <button className="text-muted hover:text-red-500 transition-colors" title="Delete" onClick={async () => { try { await api.modules.broadcastDelete(b.id); load() } catch { /* ignore */ } }}>
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  )
}
