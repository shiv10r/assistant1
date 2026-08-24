import { useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { ACCENT_OPTIONS, applyAccent, getAccent, type AccentId } from '../theme'

export function AccentSwitcher() {
  const [accent, setAccent] = useState<AccentId>(getAccent)

  function select(next: AccentId) {
    setAccent(next)
    applyAccent(next)
  }

  return (
    <div className="accent-switcher" role="radiogroup" aria-label="Interface accent color">
      <Palette className="w-4 h-4 accent-switcher-icon" aria-hidden="true" />
      {ACCENT_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={accent === option.id}
          aria-label={`${option.label} accent`}
          title={option.label}
          className={`accent-swatch ${accent === option.id ? 'is-active' : ''}`}
          style={{ '--swatch': option.color } as React.CSSProperties}
          onClick={() => select(option.id)}
        >
          {accent === option.id && <Check className="w-3 h-3" />}
        </button>
      ))}
    </div>
  )
}
