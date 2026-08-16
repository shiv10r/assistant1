// VSR Bank — demo fixtures. All balances/limits are presentation-only;
// in production the backend is authoritative for every financial value.

export type BankAccountType = 'savings' | 'current'
export type BankAccountStatus = 'active' | 'blocked' | 'dormant'

export type BankAccount = {
  id: string
  type: BankAccountType
  name: string
  accountLast4: string
  currency: string
  status: BankAccountStatus
  ledgerBalance: number
  availableBalance: number
  openedAt: string
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-savings',
    type: 'savings',
    name: 'Salary Savings Account',
    accountLast4: '4821',
    currency: 'INR',
    status: 'active',
    ledgerBalance: 142350.5,
    availableBalance: 142350.5,
    openedAt: '2019-03-14',
  },
  {
    id: 'acc-current',
    type: 'current',
    name: 'Current Account',
    accountLast4: '9064',
    currency: 'INR',
    status: 'active',
    ledgerBalance: 684210,
    availableBalance: 684210,
    openedAt: '2021-08-02',
  },
]

export type BankTxnDirection = 'credit' | 'debit'
export type BankTxnStatus = 'booked' | 'pending'

export type BankTransaction = {
  id: string
  accountId: string
  direction: BankTxnDirection
  amount: number
  category: string
  description: string
  reference: string
  counterparty: string
  status: BankTxnStatus
  bookedAt: string
  balanceAfter: number
}

export const BANK_TRANSACTIONS: BankTransaction[] = [
  { id: 'tx-001', accountId: 'acc-savings', direction: 'credit', amount: 85000, category: 'Salary', description: 'Salary credit', reference: 'SAL/AUG/2026/1042', counterparty: 'Acme Technologies Pvt Ltd', status: 'booked', bookedAt: '2026-08-01T09:14:00', balanceAfter: 142350.5 },
  { id: 'tx-002', accountId: 'acc-savings', direction: 'debit', amount: 12999, category: 'Shopping', description: 'UPI purchase', reference: 'UPI/8172293481', counterparty: 'UrbanKart', status: 'booked', bookedAt: '2026-08-05T18:42:00', balanceAfter: 129351.5 },
  { id: 'tx-003', accountId: 'acc-savings', direction: 'debit', amount: 3200, category: 'Utilities', description: 'Electricity bill', reference: 'BILL/ELEC/88432', counterparty: 'State Power Co', status: 'booked', bookedAt: '2026-08-06T11:05:00', balanceAfter: 126151.5 },
  { id: 'tx-004', accountId: 'acc-savings', direction: 'credit', amount: 4500, category: 'Refund', description: 'Order refund', reference: 'REF/ORD/55902', counterparty: 'UrbanKart', status: 'booked', bookedAt: '2026-08-08T15:30:00', balanceAfter: 130651.5 },
  { id: 'tx-005', accountId: 'acc-savings', direction: 'debit', amount: 2300, category: 'Dining', description: 'Restaurant payment', reference: 'POS/9912-3304', counterparty: 'Cafe Meraki', status: 'booked', bookedAt: '2026-08-10T21:12:00', balanceAfter: 128351.5 },
  { id: 'tx-006', accountId: 'acc-savings', direction: 'debit', amount: 14000, category: 'Transfer', description: 'Transfer to Rohan Mehta', reference: 'TRF/VSR/881203', counterparty: 'Rohan Mehta', status: 'booked', bookedAt: '2026-08-12T10:20:00', balanceAfter: 114351.5 },
  { id: 'tx-007', accountId: 'acc-savings', direction: 'credit', amount: 700, category: 'Interest', description: 'Interest credit', reference: 'INT/AUG/2026', counterparty: 'VSR Bank', status: 'booked', bookedAt: '2026-08-14T00:05:00', balanceAfter: 115051.5 },
  { id: 'tx-008', accountId: 'acc-savings', direction: 'debit', amount: 27500, category: 'Transfer', description: 'Transfer to EMI account', reference: 'TRF/VSR/884421', counterparty: 'Auto Loan EMI', status: 'pending', bookedAt: '2026-08-15T08:00:00', balanceAfter: 87551.5 },
  { id: 'tx-009', accountId: 'acc-current', direction: 'credit', amount: 320000, category: 'Receipt', description: 'Client payment', reference: 'INV/2026/117', counterparty: 'Nova Builders LLP', status: 'booked', bookedAt: '2026-08-03T12:40:00', balanceAfter: 512400 },
  { id: 'tx-010', accountId: 'acc-current', direction: 'debit', amount: 96000, category: 'Payroll', description: 'Salary disbursal', reference: 'PAY/AUG/2026', counterparty: 'VSR Staff', status: 'booked', bookedAt: '2026-08-04T09:00:00', balanceAfter: 416400 },
  { id: 'tx-011', accountId: 'acc-current', direction: 'debit', amount: 45000, category: 'Vendor', description: 'Supplier payment', reference: 'PO/2026/331', counterparty: 'Sharma Traders', status: 'booked', bookedAt: '2026-08-07T14:15:00', balanceAfter: 371400 },
  { id: 'tx-012', accountId: 'acc-current', direction: 'credit', amount: 125000, category: 'Receipt', description: 'Advance received', reference: 'ADV/2026/052', counterparty: 'GreenLeaf Foods', status: 'booked', bookedAt: '2026-08-09T11:30:00', balanceAfter: 496400 },
  { id: 'tx-013', accountId: 'acc-current', direction: 'debit', amount: 187810, category: 'Tax', description: 'GST payment', reference: 'TAX/GST/0726', counterparty: 'GSTN', status: 'booked', bookedAt: '2026-08-11T16:45:00', balanceAfter: 308590 },
  { id: 'tx-014', accountId: 'acc-current', direction: 'debit', amount: 84210, category: 'Vendor', description: 'Raw material', reference: 'PO/2026/349', counterparty: 'MetalWorks Pvt Ltd', status: 'booked', bookedAt: '2026-08-13T13:10:00', balanceAfter: 224380 },
]

export type BankBeneficiaryStatus = 'PendingVerification' | 'CoolingPeriod' | 'Active' | 'Blocked'

export type BankBeneficiary = {
  id: string
  name: string
  bank: string
  accountNumber: string
  ifsc: string
  nickname: string
  status: BankBeneficiaryStatus
  createdAt: string
  coolingPeriodEndsAt?: string
}

export const BANK_BENEFICIARIES: BankBeneficiary[] = [
  { id: 'ben-001', name: 'Rohan Mehta', bank: 'VSR Bank', accountNumber: '•••• 2291', ifsc: 'VSRB0000127', nickname: 'Rohan', status: 'Active', createdAt: '2026-05-02', coolingPeriodEndsAt: '2026-05-12' },
  { id: 'ben-002', name: 'Priya Sharma', bank: 'HDFC Bank', accountNumber: '•••• 7745', ifsc: 'HDFC0000441', nickname: 'Priya', status: 'Active', createdAt: '2026-06-18', coolingPeriodEndsAt: '2026-06-28' },
  { id: 'ben-003', name: 'Arjun Nair', bank: 'ICICI Bank', accountNumber: '•••• 9038', ifsc: 'ICIC0002234', nickname: 'Arjun', status: 'CoolingPeriod', createdAt: '2026-08-10', coolingPeriodEndsAt: '2026-08-20' },
  { id: 'ben-004', name: 'Kavita Iyer', bank: 'SBI', accountNumber: '•••• 5520', ifsc: 'SBIN0000987', nickname: 'Kavita', status: 'PendingVerification', createdAt: '2026-08-14' },
  { id: 'ben-005', name: 'Vikram Singh', bank: 'Axis Bank', accountNumber: '•••• 3318', ifsc: 'UTIB0000344', nickname: 'Vikram', status: 'Blocked', createdAt: '2026-04-21', coolingPeriodEndsAt: '2026-05-01' },
]

export type BankCardNetwork = 'VISA' | 'Mastercard' | 'RuPay'
export type BankCardKind = 'debit' | 'credit'
export type BankCardStatus = 'active' | 'frozen' | 'blocked'
export type BankCardUsage = { international: boolean; online: boolean; atm: boolean }

export type BankCard = {
  id: string
  last4: string
  network: BankCardNetwork
  kind: BankCardKind
  status: BankCardStatus
  availableLimit?: number
  outstanding?: number
  expiresAt: string
  usage: BankCardUsage
}

export const BANK_CARDS: BankCard[] = [
  { id: 'card-001', last4: '1190', network: 'VISA', kind: 'debit', status: 'active', expiresAt: '2029-04', usage: { international: true, online: true, atm: true } },
  { id: 'card-002', last4: '6234', network: 'RuPay', kind: 'debit', status: 'frozen', expiresAt: '2028-11', usage: { international: false, online: true, atm: false } },
  { id: 'card-003', last4: '8812', network: 'Mastercard', kind: 'credit', status: 'active', availableLimit: 52500, outstanding: 21450, expiresAt: '2027-09', usage: { international: true, online: true, atm: true } },
]

export type BankDepositKind = 'FD' | 'RD'
export type BankDepositStatus = 'active' | 'matured' | 'closed'

export type BankDeposit = {
  id: string
  kind: BankDepositKind
  principal: number
  interestRate: number
  startDate: string
  maturityDate: string
  maturityAmount: number
  nominee: string
  status: BankDepositStatus
}

export const BANK_DEPOSITS: BankDeposit[] = [
  { id: 'dep-001', kind: 'FD', principal: 500000, interestRate: 7.2, startDate: '2025-09-01', maturityDate: '2027-09-01', maturityAmount: 573800, nominee: 'Spouse', status: 'active' },
  { id: 'dep-002', kind: 'FD', principal: 250000, interestRate: 6.9, startDate: '2026-01-15', maturityDate: '2027-01-15', maturityAmount: 267400, nominee: 'Self', status: 'active' },
  { id: 'dep-003', kind: 'RD', principal: 5000, interestRate: 6.5, startDate: '2026-03-01', maturityDate: '2029-03-01', maturityAmount: 199500, nominee: 'Parent', status: 'active' },
]

export type BankLoan = {
  id: string
  type: string
  originalAmount: number
  outstanding: number
  emi: number
  nextDueDate: string
  interestRate: number
  tenureMonths: number
  paidMonths: number
  status: 'active' | 'closed'
}

export const BANK_LOANS: BankLoan[] = [
  { id: 'loan-001', type: 'Home Loan', originalAmount: 3200000, outstanding: 2745000, emi: 28940, nextDueDate: '2026-09-05', interestRate: 8.6, tenureMonths: 240, paidMonths: 26, status: 'active' },
  { id: 'loan-002', type: 'Auto Loan', originalAmount: 1100000, outstanding: 648200, emi: 18650, nextDueDate: '2026-09-01', interestRate: 9.4, tenureMonths: 72, paidMonths: 31, status: 'active' },
  { id: 'loan-003', type: 'Personal Loan', originalAmount: 400000, outstanding: 94200, emi: 12050, nextDueDate: '2026-09-12', interestRate: 11.2, tenureMonths: 36, paidMonths: 28, status: 'active' },
]

export type BankBillCategory = 'Electricity' | 'Mobile' | 'Broadband' | 'Gas' | 'Water' | 'Credit Card' | 'DTH' | 'Insurance'

export type BankBill = {
  id: string
  category: BankBillCategory
  provider: string
  accountRef: string
  amount: number
  dueDate: string
  status: 'due' | 'paid'
}

export const BANK_BILLS: BankBill[] = [
  { id: 'bill-001', category: 'Electricity', provider: 'State Power Co', accountRef: 'CA-88231', amount: 2840, dueDate: '2026-08-20', status: 'due' },
  { id: 'bill-002', category: 'Mobile', provider: 'Airtel Postpaid', accountRef: '98450 22190', amount: 649, dueDate: '2026-08-25', status: 'due' },
  { id: 'bill-003', category: 'Broadband', provider: 'ACT Fibernet', accountRef: 'ACT-552903', amount: 1099, dueDate: '2026-08-18', status: 'due' },
  { id: 'bill-004', category: 'Gas', provider: 'Indane', accountRef: 'C-4471', amount: 812, dueDate: '2026-08-05', status: 'paid' },
  { id: 'bill-005', category: 'Insurance', provider: 'LIC Premium', accountRef: 'POL-773921', amount: 5420, dueDate: '2026-08-02', status: 'paid' },
]

export type BankNotificationType = 'security' | 'transaction' | 'service' | 'account'

export type BankNotification = {
  id: string
  type: BankNotificationType
  title: string
  body: string
  at: string
  read: boolean
}

export const BANK_NOTIFICATIONS: BankNotification[] = [
  { id: 'ntf-001', type: 'security', title: 'New device login', body: 'A new device signed in to your account from Mumbai, IN. If this was not you, freeze your card and contact support.', at: '2026-08-15T07:40:00', read: false },
  { id: 'ntf-002', type: 'transaction', title: 'Transfer scheduled', body: 'Transfer of ₹27,500 to Auto Loan EMI is pending and will complete today by 09:00.', at: '2026-08-15T08:00:00', read: false },
  { id: 'ntf-003', type: 'account', title: 'Statement available', body: 'Your July 2026 account statement is ready to download.', at: '2026-08-02T06:00:00', read: true },
  { id: 'ntf-004', type: 'service', title: 'Service request resolved', body: 'Your request #SR-1042 (cheque book) has been resolved.', at: '2026-07-30T14:20:00', read: true },
  { id: 'ntf-005', type: 'security', title: 'Beneficiary cooling period', body: 'Arjun Nair was added as a beneficiary and can receive transfers after 20 Aug.', at: '2026-08-10T12:00:00', read: true },
]

export type BankServiceRequest = {
  id: string
  type: string
  subject: string
  status: 'open' | 'inprogress' | 'resolved'
  openedAt: string
}

export const BANK_SERVICE_REQUESTS: BankServiceRequest[] = [
  { id: 'SR-1045', type: 'Card', subject: 'Request replacement card', status: 'inprogress', openedAt: '2026-08-11' },
  { id: 'SR-1042', type: 'Cheque', subject: 'Request new cheque book', status: 'resolved', openedAt: '2026-07-24' },
  { id: 'SR-1038', type: 'Account', subject: 'Update nominee on FD', status: 'open', openedAt: '2026-08-09' },
]

export type BankAuditLog = {
  id: string
  actor: string
  action: string
  resource: string
  at: string
  outcome: 'success' | 'warning' | 'failed'
}

export const BANK_AUDIT_LOGS: BankAuditLog[] = [
  { id: 'aud-001', actor: 'ops.rahul', action: 'KYC approved', resource: 'Customer CUS-2210', at: '2026-08-15T10:12:00', outcome: 'success' },
  { id: 'aud-002', actor: 'ops.priya', action: 'Account unfrozen', resource: 'Account •••• 9064', at: '2026-08-15T09:40:00', outcome: 'success' },
  { id: 'aud-003', actor: 'system', action: 'Risk event flagged', resource: 'Transfer TRF/VSR/884421', at: '2026-08-15T08:02:00', outcome: 'warning' },
  { id: 'aud-004', actor: 'ops.rahul', action: 'Transfer rejected', resource: 'Transfer TRF/VSR/880012', at: '2026-08-14T17:30:00', outcome: 'failed' },
  { id: 'aud-005', actor: 'admin.sys', action: 'Card frozen', resource: 'Card •••• 6234', at: '2026-08-14T15:05:00', outcome: 'success' },
  { id: 'aud-006', actor: 'ops.priya', action: 'Limit updated', resource: 'Transfer daily limit', at: '2026-08-13T11:20:00', outcome: 'success' },
]

export const BANK_ADMIN_STATS = {
  activeCustomers: 12480,
  newKycCases: 36,
  transfersToday: 2184,
  failedTransfers: 17,
  highRiskEvents: 9,
  blockedAccounts: 42,
  openServiceRequests: 128,
}

// ---- helpers ---------------------------------------------------------------

export function bankAccountById(id: string | undefined): BankAccount | null {
  return BANK_ACCOUNTS.find((account) => account.id === id) ?? null
}

export function bankTransactionsFor(accountId: string): BankTransaction[] {
  return BANK_TRANSACTIONS.filter((tx) => tx.accountId === accountId)
}

export function bankCardById(id: string | undefined): BankCard | null {
  return BANK_CARDS.find((card) => card.id === id) ?? null
}

export function bankBeneficiaryById(id: string | undefined): BankBeneficiary | null {
  return BANK_BENEFICIARIES.find((beneficiary) => beneficiary.id === id) ?? null
}

export function bankFormatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function bankFormatDateTime(iso: string): string {
  const date = new Date(iso)
  return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
}