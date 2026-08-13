// Dev: BASE = '' -> Vite proxies /api to the local backend.
// Prod: default to the deployed Render API so no VITE_API_URL env var is required in Netlify.
export const BASE =
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

export interface Project { id: number; name: string; address: string; value: number; status: string; createdAt: string; latitude?: number; longitude?: number }
export interface SiteParty { id: number; projectId: number; name: string; phone: string; role: string; openingBalance: number; balanceType: string; currentBalance: number; dailyRate: number; isActive: boolean }
export interface ProjectTask { id: number; projectId: number; name: string; status: string; members: string; location: string; durationDays: number; startDate: string; endDate: string; estQuantity: number; progressPercent: number; imagePath: string; link: string }
export interface ProjectTxn { id: number; projectId: number; type: string; partyId: number; partyName: string; amount: number; description: string; referenceNumber: string; paymentMethod: string; costCode: string; date: string }
export interface AttendanceRecord { id: number; projectId: number; partyId: number; partyName: string; date: string; status: string; hoursLogged: number }
export interface AttendancePunch { id: number; projectId: number; partyId: number; partyName: string; kind: string; source: string; when: string; latitude: number; longitude: number; accuracy: number; inGeofence: boolean; distanceMeters: number; deviceId: string | null; note: string | null }
export interface AttendanceRequest { id: number; projectId: number; partyId: number; partyName: string; kind: string; dateFrom: string; dateTo: string; reason: string; status: string; createdAt: string; decidedBy: string | null }
export interface EmergencyAlert { id: number; projectId: number; partyId: number; partyName: string; latitude: number; longitude: number; accuracy: number; note: string | null; createdAt: string; handled: boolean }
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
export interface FirebaseWebConfig { enabled: boolean; apiKey: string; authDomain: string; projectId: string; messagingSenderId: string; appId: string; vapidKey: string }
export interface BackupStatus { enabled: boolean; url: string | null; localRows: number }
export interface BackupResult { ok: boolean; message: string }
export interface FirebaseVersion { enabled: boolean; project: string | null; bucket: string | null; version: number; localRows: number }
export interface AnalyticsData {
  billing: { youllGet: number; youllGive: number; monthSale: number }
  projects: { name: string; status: string; value: number; spent: number; received: number; taskPct: number; budgetPct: number; pctLabel: string; valueLabel: string; spentLabel: string; receivedLabel: string }[]
  salesByMonth: { period: string; total: number }[]
  expenseByMonth: { period: string; total: number }[]
}

export interface ReportKpis {
  period: string
  report: {
    total: number; totalLabel: string; count: number
    avgPerDay: number; avgPerDayLabel: string
    topCategory: string | null; topCategoryLabel: string
    topSite: string | null; topSiteLabel: string
    biggestEntry: { site: string; category: string; client: string; label: string; date: string } | null
    categoryCount: number; siteCount: number
  }
  app: {
    expenseCount: number; expenseTotalLabel: string
    projectCount: number; ongoingProjects: number; completedProjects: number
    partyCount: number; itemCount: number; txnCount: number
    saleTotalLabel: string; receivableLabel: string
    userCount: number; sessionCount: number; activityCount: number; lastActivity: string
  }
}

export interface UpiLinkResult {
  ok: boolean
  upiId?: string; payeeName?: string; amountInr?: number; note?: string
  upiUrl?: string; qrData?: string
  providers?: { phonepe: string; gpay: string; paytm: string }
  error?: string; code?: string; message?: string
}

// ---- Business modules ----
export interface SiteContract { id: number; projectId: number; partyName: string; title: string; amount: number; startDate: string; endDate: string; terms: string; escalationClause: string; status: string }
export interface ContractMilestone { id: number; projectId: number; contractId: number; title: string; amount: number; percentage: number; dueDate: string; status: string; isPaid: boolean }
export interface VendorPrice { id: number; vendor: string; item: string; price: number; unit: string; date: string; notes: string }
export interface EquipmentLog { id: number; projectId: number; equipment: string; purpose: string; rentalCost: number; fuelCost: number; date: string; notes: string }
export interface FuelLog { id: number; vehicle: string; date: string; litres: number; cost: number; kms: number; notes: string }
export interface Snag { id: number; projectId: number; title: string; severity: string; status: string; assignee: string; dueDate: string; notes: string; createdAt: string }
export interface ContractorRating { id: number; name: string; quality: number; punctuality: number; cost: number; notes: string; date: string; average: number }

// ---- Interior Design: worker time tracking ----
export interface TimeEntry { id: number; projectId: number; roomId?: string; partyId: number; workerName: string; workerPhone: string; date: string; hours: number; notes: string; loggedAt: string }
export interface TimeSummary { days: number; totalManHours: number; totalManHoursLabel: string; totalWagesLabel: string; rows: { date: string; dateLabel: string; worker: string; hours: number; hoursLabel: string }[] }

// ---- Interior Design: rooms ----
export interface Room { id: number; projectId: number; name: string; description?: string; areaSqFt?: number; dimensions?: string; status: string; createdAt: string }

// ---- Interior Design: mood board ----
export interface MoodBoardItem { id: number; projectId: number; roomId?: string; title: string; category?: string; imageUrl?: string; vendorName?: string; price: number; unit?: string; quantity?: number; notes?: string; sortOrder: number; createdAt: string }

// ---- Interior Design: vendor catalogue ----
export interface VendorCatalogueItem { id: number; name: string; category?: string; description?: string; price: number; unit?: string; leadTimeDays?: number; vendorName?: string; vendorPhone?: string; thumbnailUrl?: string; modelUrl?: string; modelFormat?: string; dimensionsL?: number; dimensionsW?: number; dimensionsH?: number; specJson?: string; isActive: boolean }

// ---- Interior Design: 3D room scenes ----
export interface RoomScene { id: number; projectId: number; name: string; roomRef?: string; sceneJson?: string; version: number; createdAt: string; updatedAt?: string; versionLabel: string }

// ---- Interior Design: design revisions + comments ----
export interface DesignRevision { id: number; projectId: number; title: string; description?: string; fileUrl?: string; version: number; status: string; createdAt: string }
export interface DesignComment { id: number; revisionId: number; projectId: number; positionX?: number; positionY?: number; pinColor?: string; author: string; authorRole?: string; text: string; parentCommentId?: number; status: string; createdAt: string; resolvedAt?: string }

// ---- Interior Design: safety / quality checklists ----
export interface ChecklistTemplate { id: number; name: string; category?: string; itemsJson?: string; createdAt: string }
export interface ChecklistItem { id: number; templateId: number; text: string; sortOrder: number }
export interface InspectionRecord { id: number; projectId: number; roomId?: string; templateId: number; templateName: string; date: string; inspectorName: string; notes?: string; isPassed: boolean; createdAt: string; answersJson?: string; photosJson?: string }
export interface NcrRecord { id: number; projectId: number; inspectionId: number; title: string; description?: string; severity: string; status: string; assignedTo?: string; dueDate?: string; closedAt?: string; createdAt: string }

// ---- Interior Design: subcontractor work orders ----
export interface SubcontractorWorkOrder { id: number; projectId: number; partyId: number; contractorName: string; title: string; description?: string; category?: string; agreedRate: number; unit: string; quantity: number; billedQuantity?: number; status: string; startDate: string; endDate?: string; measurementJson?: string; fileUrl?: string; createdAt: string; agreedRateLabel: string; valueLabel: string; progressPct: number }

// ---- Interior Design: QR inventory ----
export interface QrInventoryItem { id: number; projectId: number; name: string; category?: string; unit?: string; qtyOnHand: number; minStock?: number; location?: string; supplierName?: string; unitPrice?: number; barcode?: string; createdAt: string }
export interface QrInventoryScan { id: number; itemId: number; projectId: number; itemName: string; action: string; quantity: number; note?: string; scannedBy?: string; scannedAt: string }

// ---- Interior Design: AI cost prediction ----
export interface AiCostPrediction { id: number; projectId: number; roomId?: string; model: string; predictedCost: number; confidenceLow?: number; confidenceHigh?: number; actualCost?: number; featureJson?: string; predictedAt: string; actualisedAt?: string; predictedLabel: string; confidenceLabel: string; residualLabel: string }

// ---- Interior Design: AI daily summary ----
export interface AiDailySummary { id: number; projectId: number; forDate: string; summary?: string; highlightsJson?: string; risksJson?: string; suggestionsJson?: string; generatedAt: string; isConfigured: boolean }

// ---- Interior Design: lighting layout ----
export interface LightingLayout { id: number; projectId: number; roomId?: string; name: string; type?: string; wattage?: number; voltage?: number; quantity?: number; x?: number; y?: number; circuit?: string; notes?: string; wattageLabel: string }

// ---- Interior Design: finish library ----
export interface FinishSwatch { id: number; name: string; category?: string; manufacturer?: string; colorCode?: string; thumbnailUrl?: string; specJson?: string; price?: number; unit?: string; createdAt: string; priceLabel: string }

// ---- Interior Design: quotations ----
export interface QuotationRoom { id: number; projectId: number; roomName: string; description?: string; amount?: number; imageUrl?: string; sortOrder: number; isOptional: boolean }

// ---- Interior Design: designer payouts ----
export interface DesignerPayout { id: number; projectId: number; designerId: number; designerName: string; roomId?: string; stage: string; grossAmount: number; retentionAmount?: number; netAmount?: number; status: string; paidAt?: string; createdAt: string; netLabel: string }

// ---- Interior Design: client portal ----
export interface ClientProject { id: number; projectId: number; projectName: string; clientName: string; clientEmail?: string; clientPhone?: string; accessToken?: string; expiresAt?: string; isActive: boolean; createdAt: string }
export interface ClientSelection { id: number; projectId: number; roomId?: string; category: string; itemName: string; imageUrl?: string; price?: number; notes?: string; approvalStatus?: string; createdAt: string; approvedAt?: string }

// ---- Interior Design: room-wise BOQ ----
export interface RoomBoqItem { id: number; projectId: number; roomName: string; itemName: string; category?: string; quantity: number; unit: string; rate: number; notes?: string; vendorName?: string; actualCost?: number; createdAt: string; totalLabel: string }

// ---- Interior Design: installation tasks (Gantt) ----
export interface InstallationTask { id: number; projectId: number; roomId?: string; trade: string; title: string; description?: string; status: string; durationDays: number; startDate?: string; endDate?: string; predecessorId?: number; assignedTo?: string; createdAt: string }

// ---- Interior Design: room procurement ----
export interface RoomProcurementOrder { id: number; projectId: number; roomId?: string; vendorName: string; vendorPhone?: string; expectedDel?: string; status: string; itemsJson?: string; totalAmount?: number; createdAt: string; poNumber?: string }

// ---- Interior Design: project timeline ----
export interface ProjectTimelineStage { id: number; projectId: number; stage: string; title: string; description?: string; progressPct: number; startDate: string; endDate?: string; isActive: boolean; pctLabel: string }

// ---- Interior Design: AR measurements ----
export interface ArMeasurement { id: number; projectId: number; roomId?: string; scanJson?: string; areaSqFt?: number; perimeter?: number; volume?: number; notes?: string; capturedAt: string; modelUrl?: string }

// ---- Interior Design: resource allocation ----
export interface ResourceAllocation { id: number; projectId: number; type: string; name: string; designation?: string; capacity: number; allocated: number; unit?: string; isActive: boolean; createdAt: string }

// ---- Interior Design: change orders ----
export interface ChangeOrder { id: number; projectId: number; title: string; description?: string; amount: number; status: string; requestedBy?: string; submittedAt?: string; approvedBy?: string; approvedAt?: string; linkedTxnId?: number; createdAt: string; updatedAt: string }

// ---- Interior Design: equipment maintenance ----
export interface EquipmentMaintenance { id: number; equipmentLogId?: number; equipmentName: string; maintType: string; description?: string; cost: number; vendor?: string; scheduledDate: string; completedDate?: string; status: string; notes?: string }

// ---- Insights ----
export interface PlRow { id: number; name: string; status: string; value: number; valueLabel: string; received: number; receivedLabel: string; spent: number; spentLabel: string; profit: number; profitLabel: string; marginPct: number }
export interface Gstr1Data { period: string; periodLabel: string; summary: { invoiceCount: number; taxableTotal: number; taxableLabel: string; taxTotal: number; taxLabel: string; cgst: string; sgst: string; igst: string }; hsnRows: { hsn: string; rateLabel: string; count: number; taxable: number; taxableLabel: string; tax: number; taxLabel: string }[] }
export interface CreditRow { id: number; party: string; refLabel: string; balance: number; balanceLabel: string; due: string; daysOverdue: number; bucket: string }
export interface ForecastData { cashNow: number; cashNowLabel: string; buckets: { window: string; inflow: string; outflow: string; net: number; netLabel: string }[] }
export interface StockRow { id: number; name: string; unit: string; category: string; stock: number; stockLabel: string; rate: number; value: number; lowStock: boolean; dead: boolean; minStock: number }
export interface LabourRow { id: number; name: string; workers: number; presentDays: number; wages: number; wagesLabel: string; avgPerWorker: number }
export interface DelayedRow { id: number; party: string; refLabel: string; balance: number; balanceLabel: string; daysOverdue: number; interest: number; interestLabel: string }
export interface AdvanceRow { id: number; name: string; status: string; advance: number; advanceLabel: string; spent: number; spentLabel: string; remaining: number; remainingLabel: string }

// ---------------- core ----------------
const TOKEN_KEY = 'lux_token'
const ROLE_KEY = 'lux_role'
const USER_KEY = 'lux_user'
export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY) }
export function getRole(): string { return localStorage.getItem(ROLE_KEY) || 'admin' }
export function getUsername(): string { return localStorage.getItem(USER_KEY) || '' }
export function isAuthed(): boolean { return !!getToken() }
export function isAdmin(): boolean { return getRole() === 'admin' }
export function logout(): void { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(ROLE_KEY); localStorage.removeItem(USER_KEY) }

async function finishLogin(data: { token: string; username: string; role: string }) {
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(ROLE_KEY, data.role)
  localStorage.setItem(USER_KEY, data.username)
}

export async function login(username: string, password: string): Promise<void> {
  const r = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!r.ok) throw new Error('Invalid username or password')
  const data = await r.json()
  finishLogin(data)
}

export async function register(username: string, password: string): Promise<void> {
  const r = await fetch(BASE + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error || 'Could not create account')
  finishLogin(data)
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
export interface AssistantSearch {
  projects: { id: number; name: string; address?: string; status?: string; type: string }[]
  expenses: { id: number; site: string; category: string; client: string; amount: number; date: string; type: string }[]
  parties: { id: number; name: string; phone?: string; currentBalance: number; type: string }[]
  txns: { id: number; refLabel: string; partyName: string; type: string; total: number; date: string }[]
  rooms: { id: number; name: string; areaSqFt?: number; type: string }[]
  items: { id: number; name: string; category: string; salePrice: number; type: string }[]
}

const send = (text: string) => post<ChatMessage[]>('/api/assistant/send', { text })
const aiStatus = () => get<AiStatus>('/api/assistant/ai/status')
const aiChat = (text: string, history: AiChatTurn[]) => post<AiReply>('/api/assistant/ai', { text, history })
const search = (q: string, projectId?: number) => get<AssistantSearch>(`/api/assistant/search?q=${encodeURIComponent(q)}${projectId ? `&projectId=${projectId}` : ''}`)
const dashboard = () => get<Dashboard>('/api/dashboard')
const report = (period: string) => get<ReportData>(`/api/reports?period=${period.toLowerCase()}`)
const reportKpis = (period: string) => get<ReportKpis>(`/api/reports/kpis?period=${period.toLowerCase()}`)

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
  punches: (projectId: number, date?: string) => get<AttendancePunch[]>(`/api/projects/${projectId}/attendance/punches${date ? `?date=${date}` : ''}`),
  punch: (projectId: number, d: { partyId: number; kind: 'In' | 'Out'; when?: string; source?: string; latitude?: number; longitude?: number; accuracy?: number; deviceId?: string; note?: string }) => post<AttendancePunch>(`/api/projects/${projectId}/attendance/punch`, d),
  biometricPush: (projectId: number, d: { deviceId: string; name: string; event: string; when?: string; latitude?: number; longitude?: number }) => post<AttendancePunch>(`/api/projects/${projectId}/attendance/biometric-push`, d),
  requests: (projectId: number) => get<AttendanceRequest[]>(`/api/projects/${projectId}/attendance/requests`),
  submitRequest: (projectId: number, d: { partyId: number; kind: string; dateFrom: string; dateTo: string; reason: string }) => post<AttendanceRequest>(`/api/projects/${projectId}/attendance/requests`, d),
  decideRequest: (projectId: number, requestId: number, status: string, decidedBy?: string) => post<AttendanceRequest>(`/api/projects/${projectId}/attendance/requests/${requestId}/decide`, { status, decidedBy }),
  sos: (projectId: number, d: { partyId: number; latitude?: number; longitude?: number; accuracy?: number; note?: string; recipients?: string[] }) => post<EmergencyAlert>(`/api/projects/${projectId}/attendance/sos`, d),
  emergencies: (projectId: number) => get<EmergencyAlert[]>(`/api/projects/${projectId}/attendance/emergencies`),
  resolveSos: (projectId: number, alertId: number) => post<EmergencyAlert>(`/api/projects/${projectId}/attendance/sos/${alertId}/resolve`, {}),
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

// ---------------- Integrations & new modules ----------------
export interface AppUser { id: number; username: string; role: string; isActive: boolean; createdAt: string }
export interface UserSessionInfo { token: string; username: string; role: string; createdAt: string; expiresAt: string }
export interface PayrollRow { partyId: number; name: string; role: string; dailyRate: number; days: number; hours: number; totalHours: number; amount: number; amountLabel: string; currentBalance: number; netPayable: number; netPayableLabel: string }
export interface PayrollResult { from: string; to: string; totalDays: number; totalAmount: number; totalAmountLabel: string; rows: PayrollRow[] }
export interface IntegrationStatus { email: string; emailProvider?: string; razorpay: string; razorpayKeyId?: string; upi: string; upiId?: string; drive: string; driveFolder?: string; vision: string; visionModel?: string }
export interface DailyForecast { date: string; weatherCode: number; tempMax: number; tempMin: number; rainProbability: number }
export interface ProjectWeather { temperature: number; feelsLike: number; humidity: number; windSpeed: number; rainProbability: number; precipitation: number; weatherCode: number; isDay: boolean; condition: string; forecast: DailyForecast[]; updatedAt: string }
export interface EinvoiceResult { ok: boolean; txn?: { id: number; refLabel: string; date: string }; payload?: unknown; error?: string }
export interface VisionResult { ok: boolean; progress?: number; note?: string; model?: string; error?: string; code?: string; message?: string }

const auth = {
  users: () => get<AppUser[]>('/api/auth/users'),
  saveUser: (u: Partial<AppUser> & { password?: string }) => post<AppUser>('/api/auth/users', u),
  toggleUser: (id: number) => post<AppUser>(`/api/auth/users/${id}/toggle`, {}),
  deleteUser: (id: number) => del(`/api/auth/users/${id}`),
  sessions: () => get<UserSessionInfo[]>('/api/auth/sessions'),
}

const payroll = {
  compute: (projectId: number, from: string, to: string) => get<PayrollResult>(`/api/projects/${projectId}/payroll?from=${from}&to=${to}`),
}

const integrations = {
  status: () => get<IntegrationStatus>('/api/integrations/status'),
  upiLink: (amountInr: number, note?: string) => post<UpiLinkResult>('/api/payments/upi/link', { amountInr, note }),
  emailInvoice: (txnId: number) => post<{ ok: boolean; to?: string; fileName?: string; subject?: string; error?: string; code?: string; message?: string }>(`/api/txns/${txnId}/email`, {}),
  einvoice: (txnId: number) => get<EinvoiceResult>(`/api/txns/${txnId}/einvoice`),
  razorpayOrder: (amountInr: number, receipt?: string) => post<{ ok: boolean; orderId?: string; keyId?: string; amountInr?: number; error?: string; code?: string; message?: string }>('/api/payments/razorpay/order', { amountInr, receipt }),
  driveBackup: () => post<{ ok: boolean; message?: string; error?: string; code?: string }>('/api/backup/drive', {}),
  driveAuthUrl: () => get<{ ok: boolean; url?: string; redirect?: string; state?: string; code?: string; message?: string }>('/api/integrations/drive/auth-url'),
  driveStatus: () => get<{ configured: boolean; hasCredentials: boolean; folder?: string; email?: string }>('/api/integrations/drive/status'),
  driveDisconnect: () => post<{ ok: boolean }>('/api/integrations/drive/disconnect', {}),
  visionProgress: (dataBase64: string) => post<VisionResult>('/api/vision/progress', { dataBase64 }),
  weather: (latitude: number, longitude: number) => get<{ ok: boolean; weather?: ProjectWeather; message?: string }>(`/api/weather?latitude=${latitude}&longitude=${longitude}`),
}

export function uploadUrl(projectId: number, blobId: number): string {
  return `${BASE}/api/projects/${projectId}/uploads/${blobId}`
}

const modules = {
  videoSession: (projectId?: number) => get<{ room: string; url: string; provider: string }>(`/api/modules/video-session${projectId ? `?projectId=${projectId}` : ''}`),
  contracts: () => get<SiteContract[]>('/api/modules/contracts'),
  saveContract: (c: Partial<SiteContract>) => post<SiteContract>('/api/modules/contracts', c),
  deleteContract: (id: number) => del(`/api/modules/contracts/${id}`),
  milestones: (projectId?: number) => get<ContractMilestone[]>(`/api/modules/milestones${projectId ? `?projectId=${projectId}` : ''}`),
  saveMilestone: (m: Partial<ContractMilestone>) => post<ContractMilestone>('/api/modules/milestones', m),
  markMilestonePaid: (id: number) => post<ContractMilestone>(`/api/modules/milestones/${id}/paid`, {}),
  deleteMilestone: (id: number) => del(`/api/modules/milestones/${id}`),
  vendorPrices: () => get<VendorPrice[]>('/api/modules/vendorprices'),
  saveVendorPrice: (v: Partial<VendorPrice>) => post<VendorPrice>('/api/modules/vendorprices', v),
  deleteVendorPrice: (id: number) => del(`/api/modules/vendorprices/${id}`),
  equipment: (projectId?: number) => get<EquipmentLog[]>(`/api/modules/equipment${projectId ? `?projectId=${projectId}` : ''}`),
  saveEquipment: (e: Partial<EquipmentLog>) => post<EquipmentLog>('/api/modules/equipment', e),
  deleteEquipment: (id: number) => del(`/api/modules/equipment/${id}`),
  fuel: () => get<FuelLog[]>('/api/modules/fuel'),
  saveFuel: (f: Partial<FuelLog>) => post<FuelLog>('/api/modules/fuel', f),
  deleteFuel: (id: number) => del(`/api/modules/fuel/${id}`),
  snags: (projectId?: number) => get<Snag[]>(`/api/modules/snags${projectId ? `?projectId=${projectId}` : ''}`),
  saveSnag: (s: Partial<Snag>) => post<Snag>('/api/modules/snags', s),
  setSnagStatus: (id: number) => post<Snag>(`/api/modules/snags/${id}/status`, {}),
  deleteSnag: (id: number) => del(`/api/modules/snags/${id}`),
  ratings: () => get<ContractorRating[]>('/api/modules/ratings'),
  saveRating: (r: Partial<ContractorRating>) => post<ContractorRating>('/api/modules/ratings', r),
  deleteRating: (id: number) => del(`/api/modules/ratings/${id}`),

  // ---- Interior design ----
  timeEntries: (projectId?: number) => get<TimeEntry[]>(`/api/interior/time-entries${projectId ? `?projectId=${projectId}` : ''}`),
  saveTimeEntry: (e: Partial<TimeEntry>) => post<TimeEntry>('/api/interior/time-entries', e),
  deleteTimeEntry: (id: number) => del(`/api/interior/time-entries/${id}`),
  timeSummary: (projectId?: number, days = 30) => get<TimeSummary>(`/api/interior/time-entries/summary${projectId ? `?projectId=${projectId}` : ''}&days=${days}`),

  rooms: (projectId?: number) => get<Room[]>(`/api/interior/rooms${projectId ? `?projectId=${projectId}` : ''}`),
  saveRoom: (r: Partial<Room>) => post<Room>('/api/interior/rooms', r),
  deleteRoom: (id: number) => del(`/api/interior/rooms/${id}`),

  moodBoard: (projectId?: number) => get<MoodBoardItem[]>(`/api/interior/moodboard${projectId ? `?projectId=${projectId}` : ''}`),
  saveMoodItem: (i: Partial<MoodBoardItem>) => post<MoodBoardItem>('/api/interior/moodboard', i),
  deleteMoodItem: (id: number) => del(`/api/interior/moodboard/${id}`),

  catalogue: () => get<VendorCatalogueItem[]>('/api/interior/catalogue'),
  saveCatalogueItem: (i: Partial<VendorCatalogueItem>) => post<VendorCatalogueItem>('/api/interior/catalogue', i),
  deleteCatalogueItem: (id: number) => del(`/api/interior/catalogue/${id}`),

  scenes: (projectId?: number) => get<RoomScene[]>(`/api/interior/scenes${projectId ? `?projectId=${projectId}` : ''}`),
  saveScene: (s: Partial<RoomScene>) => post<RoomScene>('/api/interior/scenes', s),
  deleteScene: (id: number) => del(`/api/interior/scenes/${id}`),

  revisions: (projectId?: number) => get<DesignRevision[]>(`/api/interior/revisions${projectId ? `?projectId=${projectId}` : ''}`),
  saveRevision: (r: Partial<DesignRevision>) => post<DesignRevision>('/api/interior/revisions', r),
  deleteRevision: (id: number) => del(`/api/interior/revisions/${id}`),
  comments: (revisionId: number) => get<DesignComment[]>(`/api/interior/revisions/${revisionId}/comments`),
  addComment: (revisionId: number, c: Partial<DesignComment>) => post<DesignComment>(`/api/interior/revisions/${revisionId}/comments`, c),

  checklistTemplates: () => get<ChecklistTemplate[]>('/api/interior/checklists/templates'),
  saveTemplate: (t: Partial<ChecklistTemplate>) => post<ChecklistTemplate>('/api/interior/checklists/templates', t),
  inspections: (projectId?: number) => get<InspectionRecord[]>(`/api/interior/checklists/inspections${projectId ? `?projectId=${projectId}` : ''}`),
  saveInspection: (i: Partial<InspectionRecord>) => post<InspectionRecord>('/api/interior/checklists/inspections', i),
  ncrs: (projectId?: number) => get<NcrRecord[]>(`/api/interior/checklists/ncrs${projectId ? `?projectId=${projectId}` : ''}`),
  saveNcr: (n: Partial<NcrRecord>) => post<NcrRecord>('/api/interior/checklists/ncrs', n),

  workOrders: (projectId?: number) => get<SubcontractorWorkOrder[]>(`/api/interior/subcontractors/orders${projectId ? `?projectId=${projectId}` : ''}`),
  saveWorkOrder: (w: Partial<SubcontractorWorkOrder>) => post<SubcontractorWorkOrder>('/api/interior/subcontractors/orders', w),
  deleteWorkOrder: (id: number) => del(`/api/interior/subcontractors/orders/${id}`),

  qrItems: (projectId?: number) => get<QrInventoryItem[]>(`/api/interior/inventory/items${projectId ? `?projectId=${projectId}` : ''}`),
  saveQrItem: (i: Partial<QrInventoryItem>) => post<QrInventoryItem>('/api/interior/inventory/items', i),
  deleteQrItem: (id: number) => del(`/api/interior/inventory/items/${id}`),
  qrScans: (itemId: number) => get<QrInventoryScan[]>(`/api/interior/inventory/items/${itemId}/scans`),
  addQrScan: (itemId: number, s: Partial<QrInventoryScan>) => post<QrInventoryScan>(`/api/interior/inventory/items/${itemId}/scans`, s),

  costPrediction: (projectId?: number) => get<AiCostPrediction[]>(`/api/interior/ai/cost-prediction${projectId ? `?projectId=${projectId}` : ''}`),
  saveCostPrediction: (p: Partial<AiCostPrediction>) => post<AiCostPrediction>('/api/interior/ai/cost-prediction', p),
  dailySummary: (projectId: number, forDate?: string) => get<AiDailySummary>(`/api/interior/ai/daily-summary?projectId=${projectId}${forDate ? `&forDate=${forDate}` : ''}`),

  lighting: (projectId?: number) => get<LightingLayout[]>(`/api/interior/lighting${projectId ? `?projectId=${projectId}` : ''}`),
  saveLighting: (l: Partial<LightingLayout>) => post<LightingLayout>('/api/interior/lighting', l),

  finishes: () => get<FinishSwatch[]>('/api/interior/finishes'),
  saveFinish: (f: Partial<FinishSwatch>) => post<FinishSwatch>('/api/interior/finishes', f),
  deleteFinish: (id: number) => del(`/api/interior/finishes/${id}`),

  quotationRooms: (projectId?: number) => get<QuotationRoom[]>(`/api/interior/quotations${projectId ? `?projectId=${projectId}` : ''}`),
  saveQuotationRoom: (q: Partial<QuotationRoom>) => post<QuotationRoom>('/api/interior/quotations', q),

  payouts: (projectId?: number) => get<DesignerPayout[]>(`/api/interior/payouts${projectId ? `?projectId=${projectId}` : ''}`),
  savePayout: (p: Partial<DesignerPayout>) => post<DesignerPayout>('/api/interior/payouts', p),

  clientProjects: () => get<ClientProject[]>('/api/interior/client-projects'),
  saveClientProject: (c: Partial<ClientProject>) => post<ClientProject>('/api/interior/client-projects', c),
  clientSelections: (projectId?: number) => get<ClientSelection[]>(`/api/interior/client-selections${projectId ? `?projectId=${projectId}` : ''}`),
  saveClientSelection: (s: Partial<ClientSelection>) => post<ClientSelection>('/api/interior/client-selections', s),

  boqItems: (projectId?: number) => get<RoomBoqItem[]>(`/api/interior/boq${projectId ? `?projectId=${projectId}` : ''}`),
  saveBoqItem: (b: Partial<RoomBoqItem>) => post<RoomBoqItem>('/api/interior/boq', b),

  installTasks: (projectId?: number) => get<InstallationTask[]>(`/api/interior/install-tasks${projectId ? `?projectId=${projectId}` : ''}`),
  saveInstallTask: (t: Partial<InstallationTask>) => post<InstallationTask>('/api/interior/install-tasks', t),

  procurementOrders: (projectId?: number) => get<RoomProcurementOrder[]>(`/api/interior/procurement${projectId ? `?projectId=${projectId}` : ''}`),
  saveProcurementOrder: (o: Partial<RoomProcurementOrder>) => post<RoomProcurementOrder>('/api/interior/procurement', o),

  timelineStages: (projectId?: number) => get<ProjectTimelineStage[]>(`/api/interior/timeline${projectId ? `?projectId=${projectId}` : ''}`),
  saveTimelineStage: (s: Partial<ProjectTimelineStage>) => post<ProjectTimelineStage>('/api/interior/timeline', s),

  gantt: (projectId: number) => get<{ stages: ProjectTimelineStage[]; tasks: InstallationTask[] }>(`/api/interior/gantt?projectId=${projectId}`),

  resources: (projectId?: number) => get<ResourceAllocation[]>(`/api/interior/resources${projectId ? `?projectId=${projectId}` : ''}`),
  saveResource: (r: Partial<ResourceAllocation>) => post<ResourceAllocation>('/api/interior/resources', r),
  allocateResource: (id: number, hours: number) => post<ResourceAllocation>(`/api/interior/resources/${id}/allocate`, { hours }),
  deleteResource: (id: number) => del(`/api/interior/resources/${id}`),

  changeOrders: (projectId?: number) => get<ChangeOrder[]>(`/api/interior/change-orders${projectId ? `?projectId=${projectId}` : ''}`),
  saveChangeOrder: (c: Partial<ChangeOrder>) => post<ChangeOrder>('/api/interior/change-orders', c),
  changeOrderStatus: (id: number, status: string) => post<ChangeOrder>(`/api/interior/change-orders/${id}/${status}`, {}),
  deleteChangeOrder: (id: number) => del(`/api/interior/change-orders/${id}`),

  equipmentMaintenance: () => get<EquipmentMaintenance[]>('/api/interior/equipment-maintenance'),
  saveEquipmentMaintenance: (m: Partial<EquipmentMaintenance>) => post<EquipmentMaintenance>('/api/interior/equipment-maintenance', m),
  completeMaintenance: (id: number) => post(`/api/interior/equipment-maintenance/${id}/complete`, {}),
  deleteMaintenance: (id: number) => del(`/api/interior/equipment-maintenance/${id}`),

  arMeasurements: (projectId?: number) => get<ArMeasurement[]>(`/api/interior/ar-measurements${projectId ? `?projectId=${projectId}` : ''}`),
  saveArMeasurement: (m: Partial<ArMeasurement>) => post<ArMeasurement>('/api/interior/ar-measurements', m),
}

const insights = {
  pl: () => get<{ rows: PlRow[]; totals: { valueLabel: string; receivedLabel: string; spentLabel: string; profitLabel: string } }>('/api/insights/pl'),
  gstr1: (period = 'Month') => get<Gstr1Data>(`/api/insights/gstr1?period=${period}`),
  credit: () => get<{ receivableLabel: string; payableLabel: string; netReceivableLabel: string; overdueTotalLabel: string; buckets: { bucket: string; total: string; count: number }[]; overdue: CreditRow[]; parties: { id: number; name: string; phone: string; balanceLabel: string; direction: string }[] }>('/api/insights/credit'),
  forecast: () => get<ForecastData>('/api/insights/forecast'),
  stock: () => get<{ totalValueLabel: string; lowStockCount: number; deadStockCount: number; rows: StockRow[] }>('/api/insights/stock'),
  labour: (projectId?: number, days = 30) => get<{ days: number; totalWorkers: number; totalPresent: number; totalPresentLabel: string; totalWagesLabel: string; rows: LabourRow[] }>(`/api/insights/labour${projectId ? `?projectId=${projectId}` : ''}&days=${days}`),
  delayed: (rate = 12) => get<{ rate: number; totalInterestLabel: string; rows: DelayedRow[] }>(`/api/insights/delayed?rate=${rate}`),
  advances: () => get<{ totalAdvanceLabel: string; totalSpentLabel: string; netAdvanceLabel: string; rows: AdvanceRow[] }>('/api/insights/advances'),
  digest: () => get<{ text: string }>('/api/insights/digest'),
  health: () => get<{ ok: boolean; configured: boolean; model: string; text: string }>('/api/insights/health'),
  sendReminders: () => post<{ ok: boolean; sent: number; total: number; code?: string; message?: string; errors?: string[] }>('/api/insights/reminders/send', {}),
  backupEmail: () => post<{ ok: boolean; code?: string; message?: string; error?: string; to?: string }>('/api/insights/backup-email', {}),
}

export const api = {
  get,
  send,
  aiStatus,
  aiChat,
  search,
  dashboard,
  report,
  download,
  openFile,
  billing,
  projects,
  auth,
  payroll,
  integrations,
  modules,
  insights,
  analytics: () => get<AnalyticsData>('/api/analytics'),
  reportKpis,
  scheduleEmail: (email: string, period?: string, periodLabel?: string) => post<{ ok: boolean; to?: string; fileName?: string; code?: string; message?: string; error?: string }>('/api/reports/schedule-email', { email, period, periodLabel }),
  backupStatus: () => get<BackupStatus>('/api/backup'),
  backupPush: () => post<BackupResult>('/api/backup/push', {}),
  backupPull: () => post<BackupResult>('/api/backup/pull', {}),
  firebaseVersion: () => get<FirebaseVersion>('/api/backup/version'),
  firebasePush: () => post<BackupResult>('/api/backup/firebase-push', {}),
  firebasePull: () => post<BackupResult>('/api/backup/firebase-pull', {}),

  // ---- Firebase Auth + Push (free Spark plan) ----
  firebaseConfig: async (): Promise<FirebaseWebConfig> => {
    const r = await fetch(BASE + '/api/firebase/config')
    if (!r.ok) throw new Error(`API error ${r.status}`)
    return r.json()
  },
  firebaseLogin: async (idToken: string): Promise<void> => {
    const r = await fetch(BASE + '/api/auth/firebase', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data?.error || 'Firebase sign-in failed')
    finishLogin(data)
  },
  pushRegister: (token: string, platform = 'web') => post<{ ok: boolean; message: string }>('/api/push/register', { token, platform }),
  pushDevices: () => get<{ id: number; token: string; platform: string; username: string; createdAt: string }[]>('/api/push/devices'),
  pushTest: (title?: string, body?: string) => post<{ ok: boolean; enabled: boolean; sent: number }>('/api/push/test', { title, body }),
  pushNotify: (recipients: string[], title: string, body: string, url?: string) => post<{ ok: boolean; enabled: boolean; sent: number }>('/api/push/notify', { recipients, title, body, url }),
  activity: (count = 100) => get<ActivityItem[]>(`/api/activity?count=${count}`),
}