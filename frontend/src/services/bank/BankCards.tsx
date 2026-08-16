import { useState } from 'react'
import { CreditCard, Lock, ShieldAlert, Snowflake, Unlock } from 'lucide-react'
import { money } from '../../lib/utils'
import { BANK_CARDS, type BankCard, type BankCardUsage } from './bankingData'
import BankShell from './BankShell'
import { useBankStore } from './bankStore'

type UsageKey = keyof BankCardUsage

const USAGE_LABELS: Record<UsageKey, string> = {
  international: 'International payments',
  online: 'Online transactions',
  atm: 'ATM withdrawals',
}

function CardControls({ card, cardStatus, onFreeze, onUnfreeze }: {
  readonly card: BankCard
  readonly cardStatus: 'active' | 'frozen' | 'blocked'
  readonly onFreeze: (id: string) => void
  readonly onUnfreeze: (id: string) => void
}) {
  const [usage, setUsage] = useState<BankCardUsage>(card.usage)

  function toggle(key: UsageKey) {
    setUsage({ ...usage, [key]: !usage[key] })
  }

  return (
    <div className="bank-card-controls">
      <h3>Controls</h3>
      <p>Manage where and how this card can be used. Toggles are simulated — the backend enforces them in production.</p>
      <div>
        {(Object.keys(USAGE_LABELS) as UsageKey[]).map((key) => (
          <div key={key} className="bank-toggle-row">
            <span className="bank-toggle-label">{USAGE_LABELS[key]}</span>
            <button type="button" className={`bank-toggle ${usage[key] ? 'is-on' : ''}`} aria-pressed={usage[key]} aria-label={`Toggle ${USAGE_LABELS[key]}`} onClick={() => toggle(key)} />
          </div>
        ))}
      </div>
      {cardStatus === 'blocked' ? (
        <button type="button" className="bank-btn is-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}><ShieldAlert aria-hidden="true" /> Card blocked — contact support</button>
      ) : cardStatus === 'frozen' ? (
        <button type="button" className="bank-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => onUnfreeze(card.id)}><Unlock aria-hidden="true" /> Unfreeze card</button>
      ) : (
        <button type="button" className="bank-btn is-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => onFreeze(card.id)}><Snowflake aria-hidden="true" /> Freeze card</button>
      )}
    </div>
  )
}

export default function BankCards() {
  const store = useBankStore()

  return (
    <BankShell unreadCount={store.unreadCount}>
      <div className="bank-main">
        <div className="bank-page-head">
          <h1><CreditCard aria-hidden="true" /> Cards</h1>
          <p>Debit and credit cards with masked numbers. Never share your full card number or CVV.</p>
        </div>

        <div className="bank-card-grid">
          {BANK_CARDS.map((card) => {
            const status = store.cardStatusOf(card.id)
            return (
              <div key={card.id}>
                <div className={`bank-card-visual is-${card.kind} is-${status}`}>
                  <div className="bank-card-visual-top">
                    <span>{card.network}</span>
                    <CreditCard aria-hidden="true" />
                  </div>
                  <div className="bank-card-number">•••• •••• •••• {card.last4}</div>
                  <div className="bank-card-visual-bottom">
                    <span>{card.kind === 'debit' ? 'DEBIT' : 'CREDIT'}</span>
                    <span>VALID THRU {card.expiresAt}</span>
                  </div>
                  {status === 'frozen' && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(15,23,42,0.45)', fontWeight: 900, fontSize: 15, letterSpacing: '0.08em' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Lock aria-hidden="true" /> FROZEN</span></div>}
                  {status === 'blocked' && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(153,27,27,0.55)', fontWeight: 900, fontSize: 15, letterSpacing: '0.08em' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><ShieldAlert aria-hidden="true" /> BLOCKED</span></div>}
                </div>

                {card.kind === 'credit' && card.availableLimit !== undefined && card.outstanding !== undefined && (
                  <div className="bank-card" style={{ marginTop: 14 }}>
                    <div className="bank-product-rows">
                      <div className="bank-product-row"><span>Outstanding amount</span><strong>{money(card.outstanding)}</strong></div>
                      <div className="bank-product-row"><span>Available limit</span><strong>{money(card.availableLimit)}</strong></div>
                    </div>
                  </div>
                )}

                <CardControls card={card} cardStatus={status} onFreeze={store.freezeCard} onUnfreeze={store.unfreezeCard} />
              </div>
            )
          })}
        </div>

        <div className="bank-note" style={{ marginTop: 22 }}><ShieldAlert aria-hidden="true" /> CVV is never stored or shown. Freezing a card immediately blocks new transactions; the backend records every freeze/unfreeze event in the audit log.</div>
      </div>
    </BankShell>
  )
}