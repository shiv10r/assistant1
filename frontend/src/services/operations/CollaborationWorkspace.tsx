import { useState } from 'react'
import { CalendarDays, CheckCircle2, Link2, MessageSquare, Plus, Reply, Users, Video } from 'lucide-react'
import { Badge, Button, Input, Label, Modal, Select, Textarea, fmtDate } from '../../platform/ui'
import { genId } from '../../lib/localStore'
import type { OperationsConfig } from './config'
import type { Discussion, LocalCollection, Meeting, TeamMember, WorkItem } from './types'

type Props = {
  config: OperationsConfig
  work: WorkItem[]
  discussions: LocalCollection<Discussion>
  meetings: LocalCollection<Meeting>
  team: TeamMember[]
}

export default function CollaborationWorkspace({ config, work, discussions, meetings, team }: Props) {
  const [workId, setWorkId] = useState(work[0]?.id ?? '')
  const [kind, setKind] = useState<Discussion['kind']>('Discussion')
  const [body, setBody] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [meeting, setMeeting] = useState({ title: '', workId: work[0]?.id ?? '', date: '', time: '10:00', link: '', participants: [] as string[] })
  const roots = discussions.items.filter((item) => !item.parentId && (!workId || item.workId === workId))
  const upcoming = [...meetings.items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const activeHurdles = discussions.items.filter((item) => item.kind === 'Hurdle' && item.status !== 'Resolved').length
  const author = team[0]

  const post = () => {
    if (!body.trim()) return
    const parent = replyTo ? discussions.items.find((item) => item.id === replyTo) : null
    discussions.add({
      id: genId(), workId: parent?.workId ?? workId, parentId: replyTo,
      author: author?.name ?? 'You', authorRole: author?.role ?? config.roleNames[0],
      body: body.trim(), kind: replyTo ? 'Discussion' : kind,
      status: kind === 'Hurdle' ? 'Open' : 'Watching', mentions, createdAt: new Date().toISOString(),
    })
    setBody(''); setMentions([]); setReplyTo(null)
  }

  const schedule = () => {
    if (!meeting.title.trim() || !meeting.date) return
    meetings.add({ id: genId(), ...meeting, title: meeting.title.trim(), link: meeting.link.trim(), status: 'Planned' })
    setMeetingOpen(false)
    setMeeting({ title: '', workId: work[0]?.id ?? '', date: '', time: '10:00', link: '', participants: [] })
  }

  const joinMeeting = (link: string) => {
    if (/^https?:\/\//i.test(link)) window.open(link, '_blank', 'noopener,noreferrer')
  }

  const togglePerson = (name: string, selected: string[], apply: (next: string[]) => void) => {
    apply(selected.includes(name) ? selected.filter((person) => person !== name) : [...selected, name])
  }

  return <div className="operations-page">
    <header className="ops-page-head"><div><span>Interactive collaboration</span><h1>{capitalize(config.channelLabel)}</h1><p>Keep decisions, threaded updates, mentions, hurdles and live meetings attached to operational work.</p></div><Button onClick={() => setMeetingOpen(true)}><Video className="w-4 h-4" /> Schedule {config.meetingLabel}</Button></header>
    <section className="ops-collab-summary">
      <div><MessageSquare /><span><strong>{discussions.items.length}</strong><small>updates and replies</small></span></div>
      <div><CheckCircle2 /><span><strong>{activeHurdles}</strong><small>active {config.hurdleLabel}s</small></span></div>
      <div><CalendarDays /><span><strong>{meetings.items.filter((item) => item.status === 'Planned' || item.status === 'Live').length}</strong><small>planned meetings</small></span></div>
      <div><Users /><span><strong>{team.length}</strong><small>workspace participants</small></span></div>
    </section>
    <div className="ops-collab-layout">
      <main className="ops-thread-column">
        <section className="ops-composer">
          <div className="ops-composer-controls"><Select value={workId} onValueChange={setWorkId}><option value="">General workspace</option>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select><Select value={kind} onValueChange={(value) => setKind(value as Discussion['kind'])}><option>Discussion</option><option>Status update</option><option>Hurdle</option></Select></div>
          {replyTo && <div className="ops-replying"><Reply className="w-3.5 h-3.5" /> Replying in thread <button onClick={() => setReplyTo(null)}>Cancel</button></div>}
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={`Share an update, decision or ${config.hurdleLabel}...`} />
          <div className="ops-mention-row"><span>Mention</span>{team.map((person) => <button key={person.id} className={mentions.includes(person.name) ? 'is-selected' : ''} onClick={() => togglePerson(person.name, mentions, setMentions)}>@{firstName(person.name)}</button>)}<Button size="sm" onClick={post} disabled={!body.trim()}>Post update</Button></div>
        </section>
        <div className="ops-thread-list">{roots.map((thread) => <article className={`ops-thread ${thread.kind === 'Hurdle' ? 'is-hurdle' : ''}`} key={thread.id}>
          <div className="ops-thread-head"><span className="ops-avatar">{initials(thread.author)}</span><div><strong>{thread.author}</strong><small>{thread.authorRole} · {relativeTime(thread.createdAt)}</small></div><Badge variant={thread.kind === 'Hurdle' ? 'warning' : 'info'} size="sm">{thread.kind}</Badge></div>
          <p>{thread.body}</p>
          {thread.mentions.length > 0 && <div className="ops-thread-mentions">{thread.mentions.map((person) => <span key={person}>@{firstName(person)}</span>)}</div>}
          <div className="ops-thread-actions"><Button variant="ghost" size="sm" onClick={() => setReplyTo(thread.id)}><Reply className="w-3.5 h-3.5" /> Reply</Button><Select value={thread.status} onValueChange={(status) => discussions.update(thread.id, { status: status as Discussion['status'] })}><option>Open</option><option>Watching</option><option>Resolved</option></Select></div>
          {discussions.items.filter((item) => item.parentId === thread.id).map((reply) => <div className="ops-thread-reply" key={reply.id}><span className="ops-avatar">{initials(reply.author)}</span><div><strong>{reply.author}<small>{relativeTime(reply.createdAt)}</small></strong><p>{reply.body}</p></div></div>)}
        </article>)}{!roots.length && <div className="ops-empty"><MessageSquare /><h2>No updates in this channel</h2><p>Start the conversation with a decision, status or hurdle.</p></div>}</div>
      </main>
      <aside className="ops-meeting-rail"><div className="ops-section-title"><div><span>Meeting room</span><h2>Schedule and join</h2></div><Video className="w-5 h-5" /></div>{upcoming.map((item) => <article key={item.id}><div><Badge variant={item.status === 'Live' ? 'success' : item.status === 'Cancelled' ? 'danger' : 'info'} size="sm">{item.status}</Badge><span>{fmtDate(item.date)} · {item.time}</span></div><h3>{item.title}</h3><p>{work.find((entry) => entry.id === item.workId)?.title ?? 'General workspace'}</p><small>{item.participants.length ? item.participants.join(', ') : 'No participants added'}</small><div><Select value={item.status} onValueChange={(status) => meetings.update(item.id, { status: status as Meeting['status'] })}><option>Planned</option><option>Live</option><option>Completed</option><option>Cancelled</option></Select>{item.link && <Button size="sm" onClick={() => joinMeeting(item.link)} disabled={item.status === 'Cancelled' || !/^https?:\/\//i.test(item.link)}><Link2 className="w-3.5 h-3.5" /> Join</Button>}</div></article>)}{!upcoming.length && <p className="ops-muted-copy">No meetings scheduled.</p>}</aside>
    </div>
    <Modal open={meetingOpen} onClose={() => setMeetingOpen(false)} title={`Schedule ${config.meetingLabel}`} size="md"><div className="space-y-4"><div><Label required>Title</Label><Input value={meeting.title} onChange={(event) => setMeeting({ ...meeting, title: event.target.value })} /></div><div><Label>{capitalize(config.item)}</Label><Select value={meeting.workId} onValueChange={(value) => setMeeting({ ...meeting, workId: value })}>{work.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></div><div className="grid grid-cols-2 gap-4"><div><Label required>Date</Label><Input type="date" value={meeting.date} onChange={(event) => setMeeting({ ...meeting, date: event.target.value })} /></div><div><Label>Time</Label><Input type="time" value={meeting.time} onChange={(event) => setMeeting({ ...meeting, time: event.target.value })} /></div></div><div><Label>Meeting link</Label><Input type="url" value={meeting.link} onChange={(event) => setMeeting({ ...meeting, link: event.target.value })} placeholder="https://meet.example.com/..." /></div><div><Label>Participants</Label><div className="ops-participant-picker">{team.map((person) => <button key={person.id} className={meeting.participants.includes(person.name) ? 'is-selected' : ''} onClick={() => togglePerson(person.name, meeting.participants, (participants) => setMeeting({ ...meeting, participants }))}>{person.name}<small>{person.role}</small></button>)}</div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setMeetingOpen(false)}>Cancel</Button><Button onClick={schedule} disabled={!meeting.title.trim() || !meeting.date}><Plus className="w-4 h-4" /> Schedule</Button></div></div></Modal>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function firstName(value: string) { return value.split(' ')[0] }
function initials(value: string) { return value.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function relativeTime(value: string) { const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 3600000)); return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago` }
