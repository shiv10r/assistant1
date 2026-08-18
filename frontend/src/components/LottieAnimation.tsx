import React from 'react';
import { Lottie } from 'lottie-react';
import { cn } from '../lib/utils';

interface LottieAnimationProps {
  animation: object;
  loop?: boolean;
  autoplay?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function LottieAnimation({
  animation,
  loop = false,
  autoplay = true,
  width = '100%',
  height = '100%',
  className,
  speed = 1,
  onComplete,
  onError,
}: LottieAnimationProps) {
  return (
    <div className="lottie-container" style={{ width, height }}>
      <Lottie
        src={animation}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        className={cn('lottie-player', className)}
        subscriptions={{
          complete: onComplete,
          error: onError ? (e) => onError(e.error) : undefined,
        }}
      />
    </div>
  );
}

export function LottieAnimationWithFallback({
  animation,
  fallback,
  ...props
}: LottieAnimationProps & { fallback?: React.ReactNode }) {
  const [error, setError] = React.useState(false);

  if (error) {
    return <div className="lottie-fallback">{fallback}</div>;
  }

  return (
    <LottieAnimation
      {...props}
      animation={animation}
      onError={() => setError(true)}
    />
  );
}