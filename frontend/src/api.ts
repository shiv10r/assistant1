// Dev: BASE = '' -> Vite proxies /api to the local backend.
// Prod: default to the deployed Render API so no VITE_API_URL env var is required in Netlify.
const BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.PROD ? 'https://assistant1-2.onrender.com' : '')

// ---------------- types ----------------
export interface ChatMessage { text: string; isUser: boolean; isReport?: boolean; reportTitle?: string; rows?: ReportRow[]; totalLabel?: string }
export interface ReportRow { dateLabel: string; site: string; client: string; category: string; amountLabel: string; amount: number }
export interface CategoryTotal { category: string; count: number; total: number; totalLabel: string }
export interface ReportData { period: string; periodLabel: string; rows: ReportRow[]; categoryTotals: CategoryTotal[]; siteTotals: CategoryTotal[]; total: number; totalLabel: string; count: number }
export interface SiteGroup { site: string; count: number; totalLabel: string; total: number }
export interface Dashboard { todayTotal: number; todayLabel: string; monthTotal: number; monthLabel: string; grandTotal: number; grandTotalLabel: string; siteCount: number; isEmpty: boolean; groups: SiteGroup[] }

export interface BillingKpis { youllGet: number; youllGive: number; monthSale: number }

export interface Party { id: number; name: string; phone: string; openingBalance: number; balanceType: string; asOfDate: string; creditLimit: number; gstType: string; gstin: string; state: string; billingAddress: string; email: string; currentBalance: number }
export interface CatalogItem { id: number; name: string; type: string; salePrice: number; purchasePrice: number; wholesalePrice: number; unit: string; category: string; hsnSac: string; taxRate: number; stockQty: number; minStock: number; barcode: string; description: string }
export interface BizTxn { id: number; partyId: number; partyName: string; type: string; refNo: number; prefix: string; date: string; dueDate: string; subtotal: number; discount: number; tax: number; roundOff: number; total: number; received: number; balance: number; paymentMode: string; chequeStatus: string; description: string; stateOfSupply: string; status: string }
export interface BizTxnItem { id: number; txnId: number; itemId: number; itemName: string; hsnSac: string; unit: string; qty: number; freeQty: number; rate: number; discountPct: number; taxRate: number; amount: number }
export interface CashEntry { id: number; kind: string; amount: number; date: string; description: string }
export interface BankAccount { id: number; name: string; accNo: string; ifsc: string; upiId: string; openingBalance: number; asOf: string }
export type Settings = Record<string, string>

export interface Project { id: number; name: string; address: string; value: number; status: string; createdAt: string }
export interface SiteParty { id: number; projectId: number; name: string; phone: string; role: string; openingBalance: number; balanceType: string; currentBalance: number; isActive: boolean }
export interface ProjectTask { id: number; projectId: number; name: string; status: string; members: string; location: string; durationDays: number; startDate: string; endDate: string; estQuantity: number; progressPercent: number; imagePath: string; link: string }
export interface ProjectTxn { id: number; projectId: number; type: string; partyId: number; partyName: string; amount: number; description: string; referenceNumber: string; paymentMethod: string; costCode: string; date: string }
export interface AttendanceRecord { id: number; projectId: number; partyId: number; partyName: string; date: string; status: string; hoursLogged: number }
export interface MaterialTxn { id: number; projectId: number; kind: string; materialName: string; quantity: number; unit: string; vendorName: string; vendorLocation: string; paymentMode: string; amount: number; date: string }
export interface SiteLog { id: number; projectId: number; date: string; progressPercent: number; note: string }
export interface MeetingMinute { id: number; projectId: number; title: string; date: string; attendees: string; notes: string }
export interface DesignFile { id: number; projectId: number; category: string; name: string; imagePath: string; note: string; date: string }
export interface ProjectFolder { id: number; projectId: number; name: string; createdAt: string }
export interface ProjectFile { id: number; projectId: number; folderId: number; fileName: string; filePath: string; uploadedAt: string }
export interface FileBlobMeta { id: number; projectId: number; category: string; name: string; contentType: string; size: number; sizeLabel: string; uploadedAt: string }

export interface ProjectDetail { project: Project; parties: SiteParty[]; tasks: ProjectTask[]; txns: ProjectTxn[]; materials: MaterialTxn[]; inventory: { material: string; qty: number; unit: string }[]; logs: SiteLog[]; mom: MeetingMinute[]; design: DesignFile[]; folders: ProjectFolder[] }
export interface CashData { balance: number; entries: CashEntry[] }
export interface ActivityItem { id: number; action: string; detail: string; source: string; timeLabel: string }
export interface BackupStatus { enabled: boolean; url: string | null; localRows: number }
export interface BackupResult { ok: boolean; message: string }
export interface AnalyticsData {
  billing: { youllGet: number; youllGive: number; monthSale: number }
  projects: { name: string; status: string; value: number; spent: number; received: number; taskPct: number; budgetPct: number; pctLabel: string; valueLabel: string; spentLabel: string; receivedLabel: string }[]
  salesByMonth: { period: string; total: number }[]
  expenseByMonth: { period: string; total: number }[]
}

// ---------------- core ----------------
const TOKEN_KEY = 'lux_token'
export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY) }
export function isAuthed(): boolean { return !!getToken() }
export function logout(): void { localStorage.removeItem(TOKEN_KEY) }

export async function login(username: string, password: string): Promise<void> {
  const r = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!r.ok) throw new Error('Invalid username or password')
  const data = await r.json()
  localStorage.setItem(TOKEN_KEY, data.token)
}

function authHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function get<T>(url: string): Promise<T> {
  const r = await fetch(BASE + url, { headers: authHeaders() })
  if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); throw new Error('Unauthorized') }
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
  if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); throw new Error('Unauthorized') }
  if (!r.ok) throw new Error(`API error ${r.status}: ${await r.text().catch(() => '')}`)
  return r.json()
}

async function postVoid(url: string, body: unknown): Promise<void> {
  const r = await fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
  if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); throw new Error('Unauthorized') }
  if (!r.ok) throw new Error(`API error ${r.status}`)
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(BASE + url, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
  if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); throw new Error('Unauthorized') }
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
}

async function del(url: string): Promise<void> {
  const r = await fetch(BASE + url, { method: 'DELETE', headers: authHeaders() })
  if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); throw new Error('Unauthorized') }
  if (!r.ok) throw new Error(`API error ${r.status}`)
}

function today(): string { return new Date().toISOString().slice(0, 10) }
export { today }

// Fetches a protected blob with the auth token, returning blob + suggested filename.
async function fetchBlob(url: string): Promise<{ blob: Blob; name: string }> {
  const r = await fetch(BASE + url, { headers: authHeaders() })
  if (r.status === 401) { localStorage.removeItem(TOKEN_KEY); throw new Error('Unauthorized') }
  if (!r.ok) throw new Error(`API error ${r.status}`)
  const blob = await r.blob()
  const name = (r.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/i)?.[1]) ?? 'luxinfra-download'
  return { blob, name }
}

// Downloads a protected file (Excel/PDF/PNG/uploads) with the auth token and saves it.
async function download(url: string): Promise<void> {
  const { blob, name } = await fetchBlob(url)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 10000)
}

// Opens a protected file in a new tab (images render inline; others prompt save).
async function openFile(url: string): Promise<void> {
  const { blob } = await fetchBlob(url)
  const objectUrl = URL.createObjectURL(blob)
  window.open(objectUrl, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)
}

// ---------------- Assistant ----------------
export interface AiChatTurn { role: 'user' | 'assistant' | 'system'; content: string }
export interface AiReply { ok: boolean; configured: boolean; model: string; text: string; tokens: number; error?: string | null }
export interface AiStatus { configured: boolean; model: string }

const send = (text: string) => post<ChatMessage[]>('/api/assistant/send', { text })
const aiStatus = () => get<AiStatus>('/api/assistant/ai/status')
const aiChat = (text: string, history: AiChatTurn[]) => post<AiReply>('/api/assistant/ai', { text, history })
const dashboard = () => get<Dashboard>('/api/dashboard')
const report = (period: string) => get<ReportData>(`/api/reports?period=${period.toLowerCase()}`)

// ---------------- Billing ----------------
const billing = {
  kpis: () => get<BillingKpis>('/api/billing/kpis'),
  parties: () => get<Party[]>('/api/billing/parties'),
  saveParty: (p: Party) => post<Party>('/api/billing/parties', p),
  items: () => get<CatalogItem[]>('/api/billing/items'),
  saveItem: (i: CatalogItem) => post<CatalogItem>('/api/billing/items', i),
  txns: () => get<BizTxn[]>('/api/billing/txns'),
  txnLines: (id: number) => get<BizTxnItem[]>(`/api/billing/txns/${id}/lines`),
  saveTxn: (txn: BizTxn, lines: BizTxnItem[]) => post<BizTxn>('/api/billing/txns', { txn, lines }),
  cash: () => get<CashData>('/api/billing/cash'),
  adjustCash: (e: CashEntry) => post<CashEntry>('/api/billing/cash', e),
  banks: () => get<BankAccount[]>('/api/billing/banks'),
  saveBank: (b: BankAccount) => post<BankAccount>('/api/billing/banks', b),
  deleteBank: (id: number) => del(`/api/billing/banks/${id}`),
  cheques: () => get<BizTxn[]>('/api/billing/cheques'),
  clearCheque: (id: number) => postVoid(`/api/billing/cheques/${id}/cleared`, {}),
  settings: () => get<Settings>('/api/billing/settings'),
  setSetting: (key: string, value: string) => postVoid('/api/billing/settings', { key, value }),
}

// Projects
const projects = {
  list: () => get<Project[]>('/api/projects'),
  detail: (id: number) => get<ProjectDetail>(`/api/projects/${id}`),
  save: (p: Project) => post<Project>('/api/projects', p),
  update: (p: Project) => put<Project>(`/api/projects/${p.id}`, p),
  remove: (id: number) => del(`/api/projects/${id}`),
  saveParty: (projectId: number, p: SiteParty) => post<SiteParty>(`/api/projects/${projectId}/parties`, p),
  saveTask: (projectId: number, t: ProjectTask) => post<ProjectTask>(`/api/projects/${projectId}/tasks`, t),
  saveTxn: (projectId: number, t: ProjectTxn) => post<ProjectTxn>(`/api/projects/${projectId}/txns`, t),
  attendance: (projectId: number, date: string) => get<AttendanceRecord[]>(`/api/projects/${projectId}/attendance?date=${date}`),
  setAttendanceStatus: (projectId: number, d: { partyId: number; date: string; status: string }) => postVoid(`/api/projects/${projectId}/attendance/status`, d),
  setAttendanceHours: (projectId: number, d: { partyId: number; date: string; hours: number }) => postVoid(`/api/projects/${projectId}/attendance/hours`, d),
  materials: (projectId: number, kind?: string) => get<MaterialTxn[]>(`/api/projects/${projectId}/materials${kind ? `?kind=${encodeURIComponent(kind)}` : ''}`),
  saveMaterial: (projectId: number, m: MaterialTxn) => post<MaterialTxn>(`/api/projects/${projectId}/materials`, m),
  inventory: (projectId: number) => get<{ material: string; qty: number; unit: string }[]>(`/api/projects/${projectId}/inventory`),
  logs: (projectId: number) => get<SiteLog[]>(`/api/projects/${projectId}/logs`),
  saveLog: (projectId: number, l: SiteLog) => post<SiteLog>(`/api/projects/${projectId}/logs`, l),
  mom: (projectId: number) => get<MeetingMinute[]>(`/api/projects/${projectId}/mom`),
  saveMom: (projectId: number, m: MeetingMinute) => post<MeetingMinute>(`/api/projects/${projectId}/mom`, m),
  design: (projectId: number) => get<DesignFile[]>(`/api/projects/${projectId}/design`),
  saveDesign: (projectId: number, d: DesignFile) => post<DesignFile>(`/api/projects/${projectId}/design`, d),
  folders: (projectId: number) => get<ProjectFolder[]>(`/api/projects/${projectId}/folders`),
  addFolder: (projectId: number, name: string) => post<ProjectFolder>(`/api/projects/${projectId}/folders`, { name }),
  files: (folderId: number) => get<ProjectFile[]>(`/api/projects/files/${folderId}`),
  addFile: (projectId: number, f: ProjectFile) => post<ProjectFile>(`/api/projects/${projectId}/files`, f),
  uploads: (projectId: number, category?: string) => get<FileBlobMeta[]>(`/api/projects/${projectId}/uploads${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  upload: (projectId: number, b: { category: string; name: string; contentType: string; dataBase64: string }) => post<FileBlobMeta>(`/api/projects/${projectId}/uploads`, b),
  removeUpload: (projectId: number, blobId: number) => del(`/api/projects/${projectId}/uploads/${blobId}`),
}

export function uploadUrl(projectId: number, blobId: number): string {
  return `${BASE}/api/projects/${projectId}/uploads/${blobId}`
}

export const api = {
  get,
  send,
  aiStatus,
  aiChat,
  dashboard,
  report,
  download,
  openFile,
  billing,
  projects,
  analytics: () => get<AnalyticsData>('/api/analytics'),
  backupStatus: () => get<BackupStatus>('/api/backup'),
  backupPush: () => post<BackupResult>('/api/backup/push', {}),
  backupPull: () => post<BackupResult>('/api/backup/pull', {}),
  activity: (count = 100) => get<ActivityItem[]>(`/api/activity?count=${count}`),
}