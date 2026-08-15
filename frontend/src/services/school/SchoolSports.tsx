import { useState } from 'react'
import { Card, CardContent, Button, Input, Label, Select, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui'
import { Trophy, Plus, Pencil, Trash2 } from 'lucide-react'
import { useLocalCollection, genId } from '../../lib/localStore'
import type { SportsTeam, Fixture } from './types'
import { TEAM_SEED, FIXTURE_SEED } from './seed'
import { DataTable, type DataColumn } from '../../components/DataTable'
import { KpiCard } from '../../components/KpiCard'

export default function SchoolSports() {
  const { items: teams, add: addTeam, update: updateTeam, remove: removeTeam } = useLocalCollection<SportsTeam>('school:teams', TEAM_SEED)
  const { items: fixtures, add: addFixture, update: updateFixture, remove: removeFixture } = useLocalCollection<Fixture>('school:fixtures', FIXTURE_SEED)
  const [teamModal, setTeamModal] = useState(false)
  const [fixtureModal, setFixtureModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<SportsTeam | null>(null)
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null)
  const [teamForm, setTeamForm] = useState({ name: '', sport: '', coach: '', players: 0 })
  const [fixtureForm, setFixtureForm] = useState({ teamId: teams[0]?.id ?? '', opponent: '', date: '', venue: '', result: '' as Fixture['result'] | '' })
  const [tab, setTab] = useState('teams')

  const teamColumns: DataColumn<SportsTeam>[] = [
    { key: 'name', header: 'Team', render: (t) => <span className="font-medium">{t.name}</span>, sortValue: (t) => t.name },
    { key: 'sport', header: 'Sport', render: (t) => t.sport, sortValue: (t) => t.sport },
    { key: 'coach', header: 'Coach', render: (t) => t.coach },
    { key: 'players', header: 'Players', render: (t) => t.players, sortValue: (t) => t.players },
  ]

  const fixtureColumns: DataColumn<Fixture>[] = [
    { key: 'teamName', header: 'Team', render: (f) => <span className="font-medium">{f.teamName}</span>, sortValue: (f) => f.teamName },
    { key: 'opponent', header: 'Opponent', render: (f) => f.opponent },
    { key: 'date', header: 'Date', render: (f) => f.date.slice(0, 10), sortValue: (f) => f.date },
    { key: 'venue', header: 'Venue', render: (f) => f.venue, hideOnMobile: true },
    { key: 'result', header: 'Result', render: (f) => f.result ? <BadgeResult r={f.result} /> : <span className="text-muted text-sm">—</span>, sortValue: (f) => f.result ?? '' },
  ]

  function openAddTeam() {
    setEditingTeam(null)
    setTeamForm({ name: '', sport: '', coach: '', players: 0 })
    setTeamModal(true)
  }

  function openEditTeam(t: SportsTeam) {
    setEditingTeam(t)
    setTeamForm({ name: t.name, sport: t.sport, coach: t.coach, players: t.players })
    setTeamModal(true)
  }

  function saveTeam() {
    if (!teamForm.name.trim()) return
    const payload = { ...teamForm, players: Number(teamForm.players) }
    if (editingTeam) updateTeam(editingTeam.id, payload)
    else addTeam({ id: genId(), ...payload })
    setTeamModal(false)
  }

  function openAddFixture() {
    setEditingFixture(null)
    setFixtureForm({ teamId: teams[0]?.id ?? '', opponent: '', date: '', venue: '', result: '' })
    setFixtureModal(true)
  }

  function openEditFixture(f: Fixture) {
    setEditingFixture(f)
    setFixtureForm({ teamId: f.teamId, opponent: f.opponent, date: f.date, venue: f.venue, result: f.result ?? '' })
    setFixtureModal(true)
  }

  function saveFixture() {
    if (!fixtureForm.opponent.trim()) return
    const team = teams.find((t) => t.id === fixtureForm.teamId)
    const payload = { ...fixtureForm, teamName: team?.name ?? '', result: fixtureForm.result || undefined }
    if (editingFixture) updateFixture(editingFixture.id, payload)
    else addFixture({ id: genId(), ...payload })
    setFixtureModal(false)
  }

  const totalPlayers = teams.reduce((s, t) => s + t.players, 0)
  const wins = fixtures.filter((f) => f.result === 'win').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Teams" value={teams.length} icon={<Trophy className="w-5 h-5" />} tone="info" />
        <KpiCard label="Players" value={totalPlayers} icon={<Trophy className="w-5 h-5" />} tone="default" />
        <KpiCard label="Fixtures" value={fixtures.length} icon={<Trophy className="w-5 h-5" />} tone="warning" />
        <KpiCard label="Wins" value={wins} icon={<Trophy className="w-5 h-5" />} tone="success" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            </TabsList>
            <TabsContent value="teams" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddTeam}><Plus className="w-4 h-4" /> Add team</Button>
              </div>
              <DataTable
                columns={teamColumns}
                rows={teams}
                rowKey={(t) => t.id}
                pageSize={10}
                exportFilename="school-teams"
                emptyIcon={<Trophy className="w-6 h-6" />}
                emptyTitle="No teams"
                emptyDescription="Create sports teams."
                actions={(t) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditTeam(t)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeTeam(t.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
            <TabsContent value="fixtures" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddFixture}><Plus className="w-4 h-4" /> Add fixture</Button>
              </div>
              <DataTable
                columns={fixtureColumns}
                rows={fixtures}
                rowKey={(f) => f.id}
                pageSize={10}
                exportFilename="school-fixtures"
                emptyIcon={<Trophy className="w-6 h-6" />}
                emptyTitle="No fixtures"
                emptyDescription="Schedule matches for your teams."
                actions={(f) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditFixture(f)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFixture(f.id)} aria-label="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Modal open={teamModal} onClose={() => setTeamModal(false)} title={editingTeam ? 'Edit team' : 'Add team'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label required>Team name</Label><Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></div>
            <div><Label>Sport</Label><Input value={teamForm.sport} onChange={(e) => setTeamForm({ ...teamForm, sport: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Coach</Label><Input value={teamForm.coach} onChange={(e) => setTeamForm({ ...teamForm, coach: e.target.value })} /></div>
            <div><Label>Players</Label><Input type="number" value={teamForm.players} onChange={(e) => setTeamForm({ ...teamForm, players: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setTeamModal(false)}>Cancel</Button>
            <Button onClick={saveTeam}>{editingTeam ? 'Save changes' : 'Add team'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={fixtureModal} onClose={() => setFixtureModal(false)} title={editingFixture ? 'Edit fixture' : 'Add fixture'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team</Label>
              <Select value={fixtureForm.teamId} onValueChange={(v) => setFixtureForm({ ...fixtureForm, teamId: v })}>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
            <div><Label>Opponent</Label><Input value={fixtureForm.opponent} onChange={(e) => setFixtureForm({ ...fixtureForm, opponent: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input type="date" value={fixtureForm.date} onChange={(e) => setFixtureForm({ ...fixtureForm, date: e.target.value })} /></div>
            <div><Label>Venue</Label><Input value={fixtureForm.venue} onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })} /></div>
          </div>
          <div>
            <Label>Result</Label>
            <Select value={fixtureForm.result} onValueChange={(v) => setFixtureForm({ ...fixtureForm, result: v as Fixture['result'] | '' })}>
              <option value="">Not played</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="draw">Draw</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFixtureModal(false)}>Cancel</Button>
            <Button onClick={saveFixture}>{editingFixture ? 'Save changes' : 'Add fixture'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function BadgeResult({ r }: { r: NonNullable<Fixture['result']> }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r === 'win' ? 'bg-emerald-500/15 text-emerald-600' : r === 'loss' ? 'bg-red-500/15 text-red-600' : 'bg-amber-500/15 text-amber-600'}`}>{r}</span>
}