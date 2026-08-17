import { LottieAnimation } from './LottieAnimation';
import logoIntro from '../../animations/logo-intro.json';
import loadingSpinner from '../../animations/loading-spinner.json';
import successCheck from '../../animations/success-check.json';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 48, className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3" style={{ width: size, height: size }}>
      <div style={{ width: size, height: size }}>
        <lottie-player
          src="/animations/loading-spinner.json"
          background="transparent"
          speed="1"
          style={{ width: size, height: size }}
          loop
          autoplay
        />
      </div>
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
      <lottie-player
        src="/animations/logo-intro.json"
        background="transparent"
        speed="1"
        style={{ width: size, height: size }}
        loop={loop}
        autoplay
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
  const [played, setPlayed] = React.useState(false);

  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <lottie-player
        src="/animations/success-check.json"
        background="transparent"
        speed="1"
        style={{ width: size, height: size }}
        loop={false}
        autoplay
        oncomplete={() => setPlayed(true)}
      />
    </div>
  );
}

import React from 'react';