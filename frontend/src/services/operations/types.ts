export type WorkItem = {
  id: string
  title: string
  customer: string
  location: string
  status: string
  progress: number
  value: number
  owner: string
  dueDate: string
  lat: number
  lng: number
  createdAt: string
}

export type Visit = {
  id: string
  workId: string
  title: string
  date: string
  time: string
  owner: string
  status: 'Scheduled' | 'In progress' | 'Completed' | 'Cancelled'
  notes: string
}

export type StoredFile = {
  id: string
  name: string
  size: number
  type: string
  workId: string
  uploadedAt: string
  storage: 'browser' | 'supabase'
}

export type Discussion = {
  id: string
  workId: string
  parentId: string | null
  author: string
  authorRole: string
  body: string
  kind: 'Discussion' | 'Status update' | 'Hurdle'
  status: 'Open' | 'Watching' | 'Resolved'
  mentions: string[]
  createdAt: string
}

export type Meeting = {
  id: string
  workId: string
  title: string
  date: string
  time: string
  link: string
  participants: string[]
  status: 'Planned' | 'Live' | 'Completed' | 'Cancelled'
  provider?: 'meet' | 'teams' | 'jitsi'
}

export type TeamMember = {
  id: string
  name: string
  role: string
  email: string
  status: 'Available' | 'Focused' | 'Away'
  allocation: number
  joinedAt: string
}

export type Checkpoint = {
  id: string
  workId: string
  title: string
  owner: string
  dueDate: string
  status: 'Not started' | 'In progress' | 'Blocked' | 'Complete'
  note: string
  updatedAt: string
}

export type LibraryProject = {
  id: string
  title: string
  customer: string
  location: string
  completedAt: string
  status: 'Approved' | 'Reference' | 'Needs review' | 'Archived'
  photoUrl: string
  fileName: string
  fileType: string
  fileSize: number
  sourceWorkId: string
  syncProvider: 'PostgreSQL'
  syncedAt: string
  fileId?: string
  storage?: 'browser' | 'supabase'
}

export type LocalCollection<T extends { id: string }> = {
  items: T[]
  add: (item: T) => void
  update: (id: string, patch: Partial<T>) => void
  remove: (id: string) => void
}
