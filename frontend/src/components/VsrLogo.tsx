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

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label="VSR Systems">
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-hidden="true" className="shrink-0 drop-shadow-sm">
        <defs>
          <linearGradient id={gradientId} x1="8" y1="6" x2="57" y2="59" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--primary-soft)" />
            <stop offset="0.55" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${gradientId})`} stroke="rgba(255,255,255,.72)" strokeWidth="1.5" />
        <rect x="7" y="7" width="50" height="50" rx="14" fill="rgba(5,10,18,.16)" stroke="rgba(255,255,255,.2)" />
        <path d="M17 18.5 31.8 48 47 18.5" fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 28.5h18" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.88" />
        <circle cx="47" cy="18.5" r="4.2" fill="var(--bg)" stroke="white" strokeWidth="2" />
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
