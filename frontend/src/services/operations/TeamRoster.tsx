import { useState } from 'react'
import { Mail, Plus, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react'
import { AdvancedPanel, type BarDatum, type DonutDatum } from '../../platform/dashboard'
import { Badge, Button, Input, Label, Modal, Select } from '../../platform/ui'
import { genId } from '../../lib/localStore'
import type { OperationsConfig } from './config'
import type { LocalCollection, TeamMember } from './types'

export default function TeamRoster({ config, team, isAdvanced }: { config: OperationsConfig; team: LocalCollection<TeamMember>; isAdvanced: boolean }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', role: config.roleNames[0], email: '', allocation: '50' })
  const add = () => {
    if (!form.name.trim()) return
    team.add({ id: genId(), name: form.name.trim(), role: form.role, email: form.email.trim(), status: 'Available', allocation: Math.max(0, Math.min(100, Number(form.allocation) || 0)), joinedAt: new Date().toISOString() })
    setOpen(false); setForm({ name: '', role: config.roleNames[0], email: '', allocation: '50' })
  }
  const bars: BarDatum[] = team.items.map((person) => ({ label: person.name, value: person.allocation, valueLabel: `${person.allocation}%` }))
  const roleData: DonutDatum[] = config.roleNames.map((role, index) => ({ label: role, value: team.items.filter((person) => person.role === role).length, color: ['#4F86F7', '#2CB5A8', '#F0A34A'][index] }))
  const available = team.items.filter((person) => person.status === 'Available').length
  return <div className="operations-page">
    <header className="ops-page-head"><div><span>People and roles</span><h1>{capitalize(config.people)} roster</h1><p>Make service-specific responsibility, availability and workload visible to everyone coordinating the work.</p></div><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add participant</Button></header>
    <section className="ops-role-band"><div><UsersRound /><span><strong>{team.items.length}</strong><small>participants</small></span></div><div><UserRoundCheck /><span><strong>{available}</strong><small>available now</small></span></div><div><ShieldCheck /><span><strong>{new Set(team.items.map((person) => person.role)).size}</strong><small>active roles</small></span></div></section>
    {isAdvanced && <AdvancedPanel title="Team capacity" subtitle={`Allocation and role coverage for this ${config.people} workspace.`} bars={bars} donut={roleData} compare={[{ label: 'Available capacity', value: `${team.items.reduce((sum, person) => sum + (100 - person.allocation), 0)}%`, delta: 'Combined headroom', deltaTone: 'up' }, { label: 'Focused participants', value: String(team.items.filter((person) => person.status === 'Focused').length), delta: 'Protected workload', deltaTone: 'flat' }, { label: 'Role coverage', value: `${new Set(team.items.map((person) => person.role)).size}/${config.roleNames.length}`, delta: 'Service roles staffed', deltaTone: 'up' }]} />}
    <section className="ops-team-grid">{team.items.map((person) => <article key={person.id}><div className="ops-person-top"><span className="ops-person-avatar">{initials(person.name)}</span><Badge variant={person.status === 'Available' ? 'success' : person.status === 'Away' ? 'warning' : 'info'} size="sm">{person.status}</Badge></div><h2>{person.name}</h2><Select value={person.role} onValueChange={(role) => team.update(person.id, { role })}>{config.roleNames.map((role) => <option key={role}>{role}</option>)}</Select><div className="ops-allocation"><span>Allocation <strong>{person.allocation}%</strong></span><input aria-label={`${person.name} allocation`} type="range" min="0" max="100" value={person.allocation} onChange={(event) => team.update(person.id, { allocation: Number(event.target.value) })} /></div><div className="ops-person-footer">{person.email ? <a href={`mailto:${person.email}`}><Mail className="w-3.5 h-3.5" /> {person.email}</a> : <span>No contact shared</span>}<Select value={person.status} onValueChange={(status) => team.update(person.id, { status: status as TeamMember['status'] })}><option>Available</option><option>Focused</option><option>Away</option></Select></div></article>)}</section>
    <Modal open={open} onClose={() => setOpen(false)} title="Add participant" size="md"><div className="space-y-4"><div><Label required>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div><div><Label>Service role</Label><Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>{config.roleNames.map((role) => <option key={role}>{role}</option>)}</Select></div><div><Label>Email</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div><div><Label>Initial allocation (%)</Label><Input type="number" min="0" max="100" value={form.allocation} onChange={(event) => setForm({ ...form, allocation: event.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!form.name.trim()}>Add to roster</Button></div></div></Modal>
  </div>
}

function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }
function initials(value: string) { return value.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
