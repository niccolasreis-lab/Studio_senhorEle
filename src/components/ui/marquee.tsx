import * as React from 'react';
import { cn } from '../../lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  speed?: number;
  className?: string;
  'aria-label'?: string;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = 'left',
  speed = 36,
  className,
  'aria-label': ariaLabel,
}: MarqueeProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const isIntersectingRef = React.useRef(true);
  const [isActive, setIsActive] = React.useState(true);
  const visualClone = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child as React.ReactElement<{ tabIndex?: number }>, {
      tabIndex: -1,
    });
  });

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const syncPlayback = () => {
      setIsActive(isIntersectingRef.current && !document.hidden);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.01 },
    );

    observer.observe(viewport);
    document.addEventListener('visibilitychange', syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className={cn('marquee-viewport w-full overflow-hidden', className)}
      role="group"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          'marquee-track flex w-max',
          pauseOnHover && 'hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]',
          !isActive && '[animation-play-state:paused]',
        )}
        style={
          {
            '--marquee-duration': `${speed}s`,
            '--marquee-direction': direction === 'left' ? 'normal' : 'reverse',
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10 lg:gap-8 lg:pr-8 xl:gap-10 xl:pr-10">
          {children}
        </div>
        <div
          aria-hidden="true"
          onMouseDownCapture={(event) => event.preventDefault()}
          className="marquee-clone flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10 lg:gap-8 lg:pr-8 xl:gap-10 xl:pr-10"
        >
          {visualClone}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
