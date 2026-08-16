import { useState } from 'react'
import { Plus, ShieldCheck, Users } from 'lucide-react'
import { bankFormatDate, BANK_BENEFICIARIES, type BankBeneficiaryStatus } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

type DraftBeneficiary = {
  readonly name: string
  readonly bank: string
  readonly accountNumber: string
  readonly ifsc: string
  readonly nickname: string
}

const EMPTY_DRAFT: DraftBeneficiary = { name: '', bank: '', accountNumber: '', ifsc: '', nickname: '' }

export default function BankBeneficiaries() {
  const store = useBankStore()
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<DraftBeneficiary>(EMPTY_DRAFT)
  const [added, setAdded] = useState<string[]>([])

  const allBeneficiaries = [
    ...BANK_BENEFICIARIES,
    ...added.map((name, index) => ({
      id: `ben-added-${index}`,
      name,
      bank: draft.bank,
      accountNumber: '•••• ' + draft.accountNumber.slice(-4),
      ifsc: draft.ifsc,
      nickname: draft.nickname || (name.split(' ')[0] ?? name),
      status: 'PendingVerification' as BankBeneficiaryStatus,
      createdAt: '2026-08-16',
      coolingPeriodEndsAt: '2026-08-26',
    })),
  ]

  const formValid = draft.name.trim() !== '' && draft.bank.trim() !== '' && draft.accountNumber.trim().length >= 6 && draft.ifsc.trim() !== ''

  function addBeneficiary() {
    if (!formValid) return
    setAdded([...added, draft.name.trim()])
    setDraft(EMPTY_DRAFT)
    setShowForm(false)
  }

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><Users aria-hidden="true" /> Beneficiaries</h1>
          <p>Saved transfer recipients. New beneficiaries enter a verification and cooling period before full transfers.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button type="button" className="bank-btn" onClick={() => setShowForm(!showForm)}><Plus aria-hidden="true" /> Add beneficiary</button>
        </div>

        {showForm && (
          <div className="bank-card" style={{ marginBottom: 20, maxWidth: 640 }}>
            <h2>New beneficiary</h2>
            <div className="bank-form">
              <label htmlFor="ben-name">Full name<input id="ben-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Ananya Rao" /></label>
              <div className="bank-form-row">
                <label htmlFor="ben-bank">Bank<input id="ben-bank" value={draft.bank} onChange={(event) => setDraft({ ...draft, bank: event.target.value })} placeholder="e.g. HDFC Bank" /></label>
                <label htmlFor="ben-ifsc">IFSC code<input id="ben-ifsc" value={draft.ifsc} onChange={(event) => setDraft({ ...draft, ifsc: event.target.value.toUpperCase() })} placeholder="e.g. HDFC0000441" /></label>
              </div>
              <label htmlFor="ben-account">Account number<input id="ben-account" value={draft.accountNumber} onChange={(event) => setDraft({ ...draft, accountNumber: event.target.value.replace(/\D/g, '') })} placeholder="Numeric account number" inputMode="numeric" /></label>
              <label htmlFor="ben-nickname">Nickname (optional)<input id="ben-nickname" value={draft.nickname} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} placeholder="e.g. Ananya" maxLength={20} /></label>
              <div className="bank-note"><ShieldCheck aria-hidden="true" /> New beneficiaries stay PendingVerification until verified, then enter a cooling period before large transfers are allowed.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="bank-btn" disabled={!formValid} style={{ opacity: formValid ? 1 : 0.45, cursor: formValid ? 'pointer' : 'not-allowed' }} onClick={addBeneficiary}>Add beneficiary</button>
                <button type="button" className="bank-btn is-ghost" onClick={() => { setShowForm(false); setDraft(EMPTY_DRAFT) }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bank-beneficiary-list">
          {allBeneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="bank-beneficiary">
              <span className="bank-avatar">{beneficiary.nickname.slice(0, 1).toUpperCase()}</span>
              <div className="bank-beneficiary-main">
                <div className="bank-beneficiary-name">
                  {beneficiary.name}
                  <span className={`bank-status is-${beneficiary.status.toLowerCase()}`}>{beneficiary.status}</span>
                </div>
                <div className="bank-beneficiary-meta">
                  <span>{beneficiary.bank}</span>
                  <span>{beneficiary.accountNumber}</span>
                  <span>{beneficiary.ifsc}</span>
                  <span>added {bankFormatDate(beneficiary.createdAt)}</span>
                </div>
              </div>
              <div className="bank-beneficiary-meta" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {beneficiary.coolingPeriodEndsAt && <span style={{ fontSize: 11.5, color: 'var(--bank-muted)' }}>Cooling until {bankFormatDate(beneficiary.coolingPeriodEndsAt)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BankShell>
  )
}