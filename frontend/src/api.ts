// Dev: BASE = '' -> Vite proxies /api to the local backend.
// Prod: default to the deployed Render API so no VITE_API_URL env var is required in Netlify.
const BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.PROD ? 'https://assistant1-1-3dhx.onrender.com' : '')

export interface ChatMessage {
  text: string
  isUser: boolean
  isReport?: boolean
  reportTitle?: string
  rows?: ReportRow[]
  totalLabel?: string
}

export interface ReportRow {
  dateLabel: string
  site: string
  client: string
  category: string
  amountLabel: string
  amount: number
}

export interface CategoryTotal {
  category: string
  count: number
  total: number
  totalLabel: string
}

export interface ReportData {
  period: string
  periodLabel: string
  rows: ReportRow[]
  categoryTotals: CategoryTotal[]
  siteTotals: CategoryTotal[]
  total: number
  totalLabel: string
  count: number
}

export interface SiteGroup {
  site: string
  count: number
  totalLabel: string
  total: number
}

export interface Dashboard {
  todayTotal: number
  todayLabel: string
  monthTotal: number
  monthLabel: string
  grandTotal: number
  grandTotalLabel: string
  siteCount: number
  isEmpty: boolean
  groups: SiteGroup[]
}

async function get<T>(url: string): Promise<T> {
  const r = await fetch(BASE + url)
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
}

async function send(text: string): Promise<string> {
  const r = await fetch(BASE + '/assistant/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!r.ok) throw new Error(`API error ${r.status}`)
  // server returns an array of messages; we rejoin for the chat bubble
  const msgs = (await r.json()) as ChatMessage[]
  return msgs.map((m) => m.text).filter(Boolean).join('\n')
}

export interface BillingKpis { youllGet: number; youllGive: number; monthSale: number }
export interface Party { id: number; name: string }
export interface CatalogItem { id: number; name: string }
export interface ProjectSummary { id: number; name: string }

export const api = {
  get,
  send,
  dashboard: () => get<Dashboard>('/dashboard'),
  report: (period: string) => get<ReportData>(`/reports?period=${period}`),
  billingKpis: () => get<BillingKpis>('/billing/kpis'),
  parties: () => get<Party[]>('/billing/parties'),
  items: () => get<CatalogItem[]>('/billing/items'),
  projects: () => get<ProjectSummary[]>('/projects'),
}