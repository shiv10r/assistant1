import { cn } from '../lib/utils';
import logoUrl from '../../../vsr logo.png';

type VsrLogoProps = {
  readonly size?: number;
  readonly wordmark?: boolean;
  readonly compact?: boolean;
  readonly className?: string;
  readonly animated?: boolean;
};

export function VsrLogo({ 
  size = 40, 
  wordmark = false, 
  compact = false, 
  className, 
  animated: _animated = false
}: VsrLogoProps) {
  return (
    <span className={cn('inline-flex items-center', className)} aria-label="VSR Systems">
      <svg width={wordmark && !compact ? size * 2.1 : size * 1.8} height={size} viewBox={wordmark && !compact ? '70 310 1120 610' : '100 325 1060 445'} role="img" aria-hidden="true" className="shrink-0">
        <image href={logoUrl} width="1254" height="1254" />
      </svg>
    </span>
  );
}
