import { Lottie } from 'lottie-react';
import logoIntro from '../animations/logo-intro.json';
import loadingSpinner from '../animations/loading-spinner.json';
import successCheck from '../animations/success-check.json';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 48, className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3" style={{ width: size }}>
      <Lottie
        src={loadingSpinner}
        loop
        autoplay
        className={className}
        style={{ width: size, height: size }}
      />
      {text && <span className="text-sm text-muted text-center">{text}</span>}
    </div>
  );
}

interface LogoAnimationProps {
  size?: number;
  className?: string;
  loop?: boolean;
}

export function LogoAnimation({ size = 120, className, loop = false }: LogoAnimationProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Lottie
        src={logoIntro}
        loop={loop}
        autoplay
        className={className}
        style={{ width: size, height: size }}
      />
    </div>
  );
}

interface SuccessAnimationProps {
  size?: number;
  className?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ size = 80, className, onComplete }: SuccessAnimationProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Lottie
        src={successCheck}
        loop={false}
        autoplay
        className={className}
        style={{ width: size, height: size }}
        subscriptions={{ complete: onComplete }}
      />
    </div>
  );
}