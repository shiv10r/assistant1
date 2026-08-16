import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Button, Card, CardContent, Input, Label, PageHead, Select } from '../../components/ui'
import { genId, useLocalCollection } from '../../lib/localStore'
import type { TravelLead, TravelTheme } from './types'

const THEMES: readonly TravelTheme[] = ['Beach', 'Adventure', 'Culture', 'Romantic', 'Family', 'Weekend']

function themeFromValue(value: string): TravelTheme {
  switch (value) {
    case 'Beach': return 'Beach'
    case 'Adventure': return 'Adventure'
    case 'Culture': return 'Culture'
    case 'Romantic': return 'Romantic'
    case 'Family': return 'Family'
    case 'Weekend': return 'Weekend'
    default: return 'Culture'
  }
}

export default function TravelCustomize() {
  const leads = useLocalCollection<TravelLead>('travel:leads', [])
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ destination: '', travelMonth: '', travelers: '2', budget: '40000', theme: 'Culture', name: '', phone: '' })

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    leads.add({ id: genId(), destination: form.destination.trim(), travelMonth: form.travelMonth, travelers: Number(form.travelers), budgetPerPerson: Number(form.budget), theme: themeFromValue(form.theme), name: form.name.trim(), phone: form.phone.trim(), status: 'New' })
    setSubmitted(true)
  }

  if (submitted) return <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent"><Sparkles className="h-7 w-7" /></span><h1 className="mt-5 text-2xl font-bold text-text">Your trip request is ready</h1><p className="mt-2 text-sm leading-relaxed text-muted">A VSR travel specialist will contact you with itinerary options based on your dates and budget.</p><Button className="mt-6" onClick={() => setSubmitted(false)}>Plan another trip</Button></div>

  return (
    <div className="space-y-6">
      <PageHead icon={<Sparkles className="h-6 w-6" />} title="Customize your trip" sub="Tell us what matters. We will shape the route, pace, stays, and experiences." />
      <Card className="mx-auto max-w-3xl"><CardContent className="pt-6"><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label htmlFor="lead-destination">Where do you want to go?</Label><Input id="lead-destination" required value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="Vietnam, Bali, Kashmir..." /></div>
        <div><Label htmlFor="lead-month">Travel month</Label><Input id="lead-month" required type="month" value={form.travelMonth} onChange={(event) => setForm({ ...form, travelMonth: event.target.value })} /></div>
        <div><Label htmlFor="lead-travelers">Travelers</Label><Input id="lead-travelers" required min="1" max="30" type="number" value={form.travelers} onChange={(event) => setForm({ ...form, travelers: event.target.value })} /></div>
        <div><Label htmlFor="lead-budget">Budget per person</Label><Input id="lead-budget" required min="5000" step="1000" type="number" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} /></div>
        <div><Label htmlFor="lead-theme">Trip style</Label><Select id="lead-theme" value={form.theme} onChange={(event) => setForm({ ...form, theme: event.target.value })}>{THEMES.map((theme) => <option key={theme}>{theme}</option>)}</Select></div>
        <div><Label htmlFor="lead-name">Your name</Label><Input id="lead-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" /></div>
        <div><Label htmlFor="lead-phone">Phone number</Label><Input id="lead-phone" required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" /></div>
        <div className="sm:col-span-2"><Button type="submit" size="lg" className="w-full sm:w-auto"><Send className="h-4 w-4" />Send trip request</Button></div>
      </form></CardContent></Card>
    </div>
  )
}
