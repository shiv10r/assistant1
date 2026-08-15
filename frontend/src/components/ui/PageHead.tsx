import type { ReactNode } from 'react'

interface PageHeadProps {
  readonly icon: ReactNode
  readonly title: ReactNode
  readonly sub: string
  readonly right?: ReactNode
}

export function PageHead({ icon, title, sub, right }: PageHeadProps) {
  return (
    <div className="page-head">
      <div>
        <h1>{icon} {title}</h1>
        <div className="muted">{sub}</div>
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}
