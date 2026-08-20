import React, { useEffect, useRef } from 'react';

const BASE_TRANSFORM = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

export function use3DTilt(maxTiltDeg = 10) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const latest = useRef({ x: 50, y: 50, active: false });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  const applyTilt = (xPct: number, yPct: number, active: boolean) => {
    latest.current = { x: xPct, y: yPct, active };
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const { x, y, active: isActive } = latest.current;
      const card = cardRef.current;
      if (!card) return;

      if (!isActive) {
        card.style.transform = BASE_TRANSFORM;
        if (glareRef.current) glareRef.current.style.opacity = '0';
        return;
      }

      const rotateX = ((0.5 - y / 100) * maxTiltDeg * 2).toFixed(2);
      const rotateY = ((x / 100 - 0.5) * maxTiltDeg * 2).toFixed(2);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (glareRef.current) {
        glareRef.current.style.opacity = '1';
        glareRef.current.style.background = `radial-gradient(circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, rgba(212, 160, 67, 0.25) 0%, transparent 65%)`;
      }
    });
  };

  return {
    ref: cardRef,
    tiltProps: {
      onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        applyTilt((mouseX / rect.width) * 100, (mouseY / rect.height) * 100, true);
      },
      onMouseLeave: () => applyTilt(50, 50, false),
      style: {
        transform: BASE_TRANSFORM,
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d' as const,
        willChange: 'transform',
      },
    },
    glareProps: {
      ref: glareRef,
      style: {
        opacity: 0,
        transition: 'opacity 0.3s ease, background 0.1s ease',
        pointerEvents: 'none' as const,
      },
    },
  };
}
