import type { OperationsConfig } from './config'
import type { Checkpoint, Discussion, LibraryProject, Meeting, TeamMember, WorkItem } from './types'

const day = 24 * 60 * 60 * 1000

function relativeDate(days: number) {
  return new Date(Date.now() + days * day).toISOString().slice(0, 10)
}

const LIBRARY_PHOTOS = [
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=75',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=75',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=75',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=75',
]

export function seedRoster(config: OperationsConfig): TeamMember[] {
  const names = config.team.length
    ? config.team.map((member) => member.name)
    : ['You', `${capitalize(config.customer)} partner`, `${capitalize(config.people)} coordinator`]
  return config.roleNames.map((role, index) => ({
    id: `${config.id}-roster-${index + 1}`,
    name: names[index] ?? `${role} ${index + 1}`,
    role,
    email: index === 0 ? 'owner@workspace.local' : '',
    status: index === 2 ? 'Focused' : 'Available',
    allocation: index === 0 ? 80 : 60 - index * 5,
    joinedAt: relativeDate(-90 + index * 18),
  }))
}

export function seedCheckpoints(config: OperationsConfig, work: WorkItem[]): Checkpoint[] {
  return work.flatMap((item, workIndex) => config.checkpointLabels.map((title, index) => {
    const threshold = ((index + 1) / config.checkpointLabels.length) * 100
    const complete = item.progress >= threshold
    const active = !complete && item.progress >= threshold - 34
    return {
      id: `${config.id}-checkpoint-${workIndex + 1}-${index + 1}`,
      workId: item.id,
      title,
      owner: item.owner,
      dueDate: relativeDate(workIndex * 8 + index * 7 - 6),
      status: complete ? 'Complete' : active ? 'In progress' : 'Not started',
      note: active ? `${capitalize(config.checkpoint)} is moving; confirm the next owner handoff.` : '',
      updatedAt: new Date().toISOString(),
    } as Checkpoint
  }))
}

export function seedDiscussions(config: OperationsConfig, work: WorkItem[], roster: TeamMember[]): Discussion[] {
  if (!work.length) return []
  const first = roster[0]
  const second = roster[1] ?? first
  return [
    {
      id: `${config.id}-discussion-1`, workId: work[0].id, parentId: null,
      author: first?.name ?? work[0].owner, authorRole: first?.role ?? config.roleNames[0],
      body: `${capitalize(config.checkpointLabels[0])} is complete. Please review the handoff notes before the next ${config.visit}.`,
      kind: 'Status update', status: 'Watching', mentions: second ? [second.name] : [], createdAt: new Date(Date.now() - day).toISOString(),
    },
    {
      id: `${config.id}-discussion-2`, workId: work[Math.min(1, work.length - 1)].id, parentId: null,
      author: second?.name ?? work[0].owner, authorRole: second?.role ?? config.roleNames[1],
      body: `${capitalize(config.hurdleLabel)}: an external confirmation is still outstanding and may affect the next checkpoint.`,
      kind: 'Hurdle', status: 'Open', mentions: first ? [first.name] : [], createdAt: new Date(Date.now() - day / 3).toISOString(),
    },
  ]
}

export function seedMeetings(config: OperationsConfig, work: WorkItem[], roster: TeamMember[]): Meeting[] {
  if (!work.length) return []
  return [{
    id: `${config.id}-meeting-1`, workId: work[0].id,
    title: `${capitalize(config.meetingLabel)}: ${work[0].title}`,
    date: relativeDate(2), time: '11:00', link: 'https://meet.google.com/',
    participants: roster.slice(0, 3).map((person) => person.name), status: 'Planned',
  }]
}

export function seedLibrary(config: OperationsConfig, work: WorkItem[]): LibraryProject[] {
  return work.slice(0, 2).map((item, index) => ({
    id: `${config.id}-library-${index + 1}`,
    title: `${item.title} ${index ? 'reference' : 'archive'}`,
    customer: item.customer,
    location: item.location,
    completedAt: relativeDate(-120 - index * 75),
    status: index ? 'Reference' : 'Approved',
    photoUrl: LIBRARY_PHOTOS[(config.title.length + index) % LIBRARY_PHOTOS.length],
    fileName: `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-closeout.pdf`,
    fileType: 'application/pdf',
    fileSize: 1800000 + index * 740000,
    sourceWorkId: item.id,
    syncProvider: 'PostgreSQL',
    syncedAt: new Date(Date.now() - index * day).toISOString(),
  }))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
