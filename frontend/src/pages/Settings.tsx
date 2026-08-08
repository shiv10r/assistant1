import { useEffect, useState } from 'react'
import { applyTheme, getTheme } from '../theme'
import { PageHead } from '../ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Switch } from '../components/ui'
import { usePlan } from '../hooks/usePlan'
import { useToast } from '../components/ui/Toast'
import { Moon, Sun, Bell, Database, Shield, Crown, Info } from 'lucide-react'
import type { Settings } from '../api'
import { api } from '../api'

type ThemeChoice = 'Dark' | 'Light'

const NOTIFY_KEYS: { key: string; label: string; desc: string }[] = [
  { key: 'notify.low_stock', label: 'Low stock alerts', desc: 'Show a warning when an item crosses its minimum stock' },
  { key: 'notify.daily_digest', label: 'Daily summary', desc: 'Show a digest of today’s expenses and sales on login' },
  { key: 'notify.project_updates', label: 'Project updates', desc: 'Notify when project payments, DPR or tasks change' },
  { key: 'notify.backup_reminder', label: 'Backup reminders', desc: 'Remind you to verify your cloud backup periodically' },
]

export default function Settings() {
  const [theme, setTheme] = useState<ThemeChoice>(() => getTheme() === 'light' ? 'Light' : 'Dark')
  const [s, setS] = useState<Settings>({})
  const { plan, setPlan } = usePlan()
  const { toast } = useToast()

  useEffect(() => { api.billing.settings().then(setS).catch(() => {}) }, [])

  function pick(t: ThemeChoice) {
    setTheme(t)
    applyTheme(t.toLowerCase() as 'dark' | 'light')
  }

  const isOn = (k: string) => s[k] === '1'

  const toggle = async (k: string, on: boolean) => {
    setS((p) => ({ ...p, [k]: on ? '1' : '0' }))
    try {
      await api.billing.setSetting(k, on ? '1' : '0')
      toast({ title: on ? 'Enabled' : 'Disabled', description: NOTIFY_KEYS.find((n) => n.key === k)?.label || k })
    } catch (e) {
      setS((p) => ({ ...p, [k]: on ? '0' : '1' }))
      toast({ title: 'Could not save setting', description: String(e), variant: 'error' })
    }
  }

  const backup = () => {
    const blob = new Blob([JSON.stringify({ note: 'LuxInfra data is stored on the backend (SQLite). Download the app DB from the Render service dashboard for a full backup. A cloud mirror syncs to Turso every 30 seconds when configured.', plan }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'luxinfra-backup-note.json'
    a.click()
  }

  return (
    <>
      <PageHead icon="⚙️" title="Settings" sub="App preferences, notifications and account control" />

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Moon className="w-5 h-5 text-primary" /> Appearance</CardTitle>
          <CardDescription>Choose how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Dark', 'Light'] as const).map((t) => (
              <button key={t} className={theme === t ? 'btn' : 'btn ghost'} onClick={() => pick(t)}>
                {t === 'Dark' ? <Moon className="w-4 h-4 inline mr-1" /> : <Sun className="w-4 h-4 inline mr-1" />}
                {t} Mode
              </button>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 8 }}>Switches instantly between dark and light mode.</div>
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-primary" /> Plan &amp; Billing</CardTitle>
          <CardDescription>Which feature set is visible in the app</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-text">Current plan: <Badge variant={plan === 'free' ? 'outline' : 'success'}>{plan === 'free' ? 'Starter (Free)' : plan}</Badge></p>
            <p className="text-sm text-muted mt-1">Pro unlocks analytics charts and premium features.</p>
          </div>
          {plan === 'free'
            ? <Button onClick={() => setPlan('pro')}><Crown className="w-4 h-4" /> Activate Pro (free trial)</Button>
            : <Button variant="outline" onClick={() => setPlan('free')}>Switch to Free</Button>}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Notifications</CardTitle>
          <CardDescription>Choose what the app alerts you about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {NOTIFY_KEYS.map((n) => (
            <div key={n.key} className="flex items-start justify-between gap-4 p-4 bg-surface/50 rounded-xl border border-border">
              <div>
                <p className="font-medium text-text">{n.label}</p>
                <p className="text-sm text-muted mt-0.5">{n.desc}</p>
              </div>
              <Switch checked={isOn(n.key)} onCheckedChange={(v) => toggle(n.key, v)} aria-label={n.label} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Data &amp; Privacy</CardTitle>
          <CardDescription>Where your data lives and how to back it up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="muted" style={{ marginBottom: 12 }}>
            Your data stays on the backend's SQLite database and mirrors to your Turso cloud DB every 30 seconds when configured. Nothing is shared.
          </div>
          <Button variant="outline" onClick={backup}>⬇ Download backup note</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Security</CardTitle>
          <CardDescription>Access & protection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted">Single admin login protected by a Bearer token on every API call.</p>
          <p className="text-muted">Change the password via the <code className="text-primary">AUTH_PASS</code> and token via <code className="text-primary">API_TOKEN</code> server environment variables.</p>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="muted">LuxInfra · v1.1 · React + .NET backend · data stays on your device's server</div>
        </CardContent>
      </Card>
    </>
  )
}
