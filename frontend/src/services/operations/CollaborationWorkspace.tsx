import { useState } from 'react'
import { CheckCircle2, MessageSquare, Reply, Users } from 'lucide-react'
import { Badge, Button, Select, Textarea } from '../../platform/ui'
import { genId } from '../../lib/localStore'
import type { OperationsConfig } from './config'
import type { Discussion, LocalCollection, TeamMember, WorkItem } from './types'

type Props = {
  config: OperationsConfig
  work: WorkItem[]
  discussions: LocalCollection<Discussion>
  team: TeamMember[]
}

export default function CollaborationWorkspace({ config, work, discussions, team }: Props) {
  const [workId, setWorkId] = useState(work[0]?.id ?? '')
  const [kind, setKind] = useState<Discussion['kind']>('Discussion')
  const [body, setBody] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const roots = discussions.items.filter((item) => !item.parentId && (!workId || item.workId === workId))
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

  const togglePerson = (name: string, selected: string[], apply: (next: string[]) => void) => {
    apply(selected.includes(name) ? selected.filter((person) => person !== name) : [...selected, name])
  }

  return <div className="operations-page">
    <header className="ops-page-head"><div><span>Interactive collaboration</span><h1>{capitalize(config.channelLabel)}</h1><p>Keep decisions, threaded updates, mentions and hurdles attached to operational work.</p></div></header>
    <section className="ops-collab-summary">
      <div><MessageSquare /><span><strong>{discussions.items.length}</strong><small>updates and replies</small></span></div>
      <div><CheckCircle2 /><span><strong>{activeHurdles}</strong><small>active {config.hurdleLabel}s</small></span></div>
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
    </div>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function firstName(value: string) { return value.split(' ')[0] }
function initials(value: string) { return value.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function relativeTime(value: string) { const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 3600000)); return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago` }
