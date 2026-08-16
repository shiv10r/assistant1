import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Landmark, Send, ShieldCheck } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_ACCOUNTS, BANK_BENEFICIARIES, bankBeneficiaryById, bankFormatDateTime } from './bankingData'
import BankShell from './BankShell'
import { useBankStore, type BankTransferRecord } from './bankStore'

type Step = 'details' | 'verify' | 'receipt'

export default function BankTransfers() {
  const store = useBankStore()
  const [step, setStep] = useState<Step>('details')
  const [fromAccountId, setFromAccountId] = useState(BANK_ACCOUNTS[0]?.id ?? '')
  const [beneficiaryId, setBeneficiaryId] = useState('')
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [lastTransfer, setLastTransfer] = useState<BankTransferRecord | null>(null)

  const source = BANK_ACCOUNTS.find((account) => account.id === fromAccountId)
  const beneficiary = bankBeneficiaryById(beneficiaryId)
  const parsedAmount = Number(amount)
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0 && (source === undefined || parsedAmount <= source.availableBalance)
  const beneficiaryAllowed = beneficiary !== null && (beneficiary.status === 'Active' || beneficiary.status === 'CoolingPeriod')
  const formValid = source !== undefined && beneficiary !== null && beneficiaryAllowed && amountValid && purpose.trim() !== ''

  function goVerify() {
    if (!formValid) {
      setError(beneficiary !== null && beneficiary.status !== 'Active' && beneficiary.status !== 'CoolingPeriod'
        ? 'This beneficiary is not active. Transfers can only go to active beneficiaries.'
        : 'Check the source account, beneficiary, amount and purpose before continuing.')
      return
    }
    setError('')
    setStep('verify')
  }

  function confirmTransfer() {
    if (otp.trim().length < 4) {
      setError('Enter the 6-digit OTP sent to your registered mobile.')
      return
    }
    setError('')
    const record: BankTransferRecord = {
      id: `tx-${Date.now()}`,
      reference: `TRF/VSR/${Math.floor(100000 + Math.random() * 900000)}`,
      fromAccountId: source?.id ?? '',
      beneficiaryId: beneficiary?.id ?? '',
      amount: parsedAmount,
      purpose: purpose.trim(),
      status: 'Completed',
      requestedAt: new Date().toISOString(),
    }
    store.addTransfer(record)
    setLastTransfer(record)
    setStep('receipt')
  }

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><Send aria-hidden="true" /> Transfer money</h1>
          <p>Internal transfers are validated by the backend for balance, limits and risk before posting.</p>
        </div>

        <div className="bank-stepper" aria-label="Transfer steps">
          <span className={`bank-step ${step === 'details' ? 'is-active' : step === 'verify' || step === 'receipt' ? 'is-done' : ''}`}><FileText aria-hidden="true" /> Details</span>
          <span className={`bank-step ${step === 'verify' ? 'is-active' : step === 'receipt' ? 'is-done' : ''}`}><ShieldCheck aria-hidden="true" /> Verify</span>
          <span className={`bank-step ${step === 'receipt' ? 'is-active' : ''}`}><CheckCircle2 aria-hidden="true" /> Receipt</span>
        </div>

        {step === 'details' && (
          <div className="bank-card" style={{ maxWidth: 640 }}>
            <div className="bank-form">
              <label htmlFor="bank-from">
                From account
                <select id="bank-from" value={fromAccountId} onChange={(event) => setFromAccountId(event.target.value)}>
                  {BANK_ACCOUNTS.map((account) => (
                    <option key={account.id} value={account.id}>{account.name} · •••• {account.accountLast4} · {money(account.availableBalance)}</option>
                  ))}
                </select>
              </label>

              <label htmlFor="bank-beneficiary">
                To beneficiary
                <select id="bank-beneficiary" value={beneficiaryId} onChange={(event) => setBeneficiaryId(event.target.value)}>
                  <option value="">Select a beneficiary</option>
                  {BANK_BENEFICIARIES.map((item) => (
                    <option key={item.id} value={item.id} disabled={item.status === 'Blocked' || item.status === 'PendingVerification'}>
                      {item.name} · {item.bank} · {item.accountNumber}{item.status === 'CoolingPeriod' ? ' (cooling period)' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="bank-amount">
                Amount (INR)
                <input id="bank-amount" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" inputMode="decimal" />
              </label>

              <label htmlFor="bank-purpose">
                Purpose / remark
                <input id="bank-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="e.g. Rent for August, Trip contribution" maxLength={60} />
              </label>

              {error && <div className="bank-note" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>{error}</div>}
              {beneficiary?.status === 'CoolingPeriod' && (
                <div className="bank-note">This beneficiary is in a cooling period until {beneficiary.coolingPeriodEndsAt}. Transfers are allowed but flagged for review.</div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="bank-btn" disabled={!formValid} style={{ opacity: formValid ? 1 : 0.45, cursor: formValid ? 'pointer' : 'not-allowed', fontSize: 13, padding: '10px 18px' }} onClick={goVerify}>
                  Continue <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'verify' && beneficiary !== null && source !== undefined && (
          <div className="bank-card" style={{ maxWidth: 640 }}>
            <h2>Confirm transfer</h2>
            <div className="bank-receipt-rows" style={{ marginTop: 4 }}>
              <div className="bank-receipt-row"><span>From</span><strong>{source.name} · •••• {source.accountLast4}</strong></div>
              <div className="bank-receipt-row"><span>To</span><strong>{beneficiary.name} · {beneficiary.bank}</strong></div>
              <div className="bank-receipt-row"><span>Account</span><strong>{beneficiary.accountNumber}</strong></div>
              <div className="bank-receipt-row"><span>Amount</span><strong>{money(parsedAmount)}</strong></div>
              <div className="bank-receipt-row"><span>Purpose</span><strong>{purpose}</strong></div>
              <div className="bank-receipt-row"><span>Balance after</span><strong>{money(source.availableBalance - parsedAmount)}</strong></div>
            </div>

            <div className="bank-form" style={{ marginTop: 18 }}>
              <label htmlFor="bank-otp">
                Enter OTP sent to +91 •••• 22 190
                <input id="bank-otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" inputMode="numeric" maxLength={6} />
              </label>
              {error && <div className="bank-note" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="bank-btn is-ghost" onClick={() => { setStep('details'); setError('') }}><ArrowLeft aria-hidden="true" /> Back</button>
                <button type="button" className="bank-btn" onClick={confirmTransfer} style={{ fontSize: 13, padding: '10px 18px' }}>Confirm & send {money(parsedAmount)}</button>
              </div>
            </div>
          </div>
        )}

        {step === 'receipt' && lastTransfer !== null && (
          <div className="bank-receipt">
            <div className="bank-receipt-icon"><CheckCircle2 aria-hidden="true" /></div>
            <h2>Transfer complete</h2>
            <p>Reference <strong style={{ color: 'var(--bank-ink)' }}>{lastTransfer.reference}</strong> · {bankFormatDateTime(lastTransfer.requestedAt)}</p>
            <div className="bank-receipt-amount">{money(lastTransfer.amount)}</div>
            <div className="bank-receipt-rows">
              <div className="bank-receipt-row"><span>To</span><strong>{bankBeneficiaryById(lastTransfer.beneficiaryId)?.name}</strong></div>
              <div className="bank-receipt-row"><span>Purpose</span><strong>{lastTransfer.purpose}</strong></div>
              <div className="bank-receipt-row"><span>Status</span><strong className="bank-status is-completed">Completed</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/bank" className="bank-btn is-ghost">Go to dashboard</Link>
              <button type="button" className="bank-btn" onClick={() => { setStep('details'); setAmount(''); setPurpose(''); setOtp(''); setBeneficiaryId(''); setError('') }}>New transfer</button>
            </div>
          </div>
        )}

        <div className="bank-card" style={{ marginTop: 22 }}>
          <h2><Landmark aria-hidden="true" /> Recent transfers</h2>
          {store.transfers.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--bank-muted)' }}>No transfers yet from this session. Your first confirmed transfer will appear here.</p>
          ) : (
            <div className="bank-txn-list">
              {store.transfers.map((t) => (
                <div key={t.id} className="bank-txn-row">
                  <span className="bank-txn-icon"><Send aria-hidden="true" /></span>
                  <div className="bank-txn-main">
                    <div className="bank-txn-title">{bankBeneficiaryById(t.beneficiaryId)?.name ?? 'Beneficiary'}</div>
                    <div className="bank-txn-meta">
                      <span>{t.reference}</span>
                      <span>{store.transferLabel(t)}</span>
                    </div>
                  </div>
                  <div className="bank-txn-amount">
                    <strong className="is-debit">−{money(t.amount)}</strong>
                    <span className={`bank-status is-${t.status.toLowerCase()}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BankShell>
  )
}