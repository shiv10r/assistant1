import { useId } from 'react'
import { cn } from '../lib/utils'

type VsrLogoProps = {
  readonly size?: number
  readonly wordmark?: boolean
  readonly compact?: boolean
  readonly className?: string
}

export function VsrLogo({ size = 40, wordmark = false, compact = false, className }: VsrLogoProps) {
  const gradientId = useId()
  const sheenId = `${gradientId}-sheen`

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label="VSR Systems">
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-hidden="true" className="shrink-0 drop-shadow-sm">
        <defs>
          <linearGradient id={gradientId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--primary-soft)" />
            <stop offset="0.55" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
          <linearGradient id={sheenId} x1="4" y1="2" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="19" fill={`url(#${gradientId})`} />
        <rect x="2" y="2" width="60" height="60" rx="19" fill={`url(#${sheenId})`} />
        <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="18.25" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
        <path d="M16.5 15.5 32 45 47.5 15.5" fill="none" stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="51" r="4.4" fill="white" />
      </svg>
      {wordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate text-[0.95rem] font-extrabold tracking-[0.16em] text-text">VSR</span>
          {!compact && <span className="mt-1 truncate text-[0.58rem] font-semibold tracking-[0.25em] text-muted">SYSTEMS</span>}
        </span>
      )}
    </span>
  )
}
