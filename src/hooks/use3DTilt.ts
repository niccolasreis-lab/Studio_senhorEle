import React, { useState, useRef, MouseEvent } from 'react';

export function use3DTilt(maxTiltDeg = 10) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    opacity: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(212, 160, 67, 0.25) 0%, transparent 70%)',
  });
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) * 100;
    const yPct = (mouseY / height) * 100;

    // Calculate rotation angles (-maxTiltDeg to +maxTiltDeg)
    const rotateX = ((0.5 - mouseY / height) * maxTiltDeg * 2).toFixed(2);
    const rotateY = (((mouseX / width) - 0.5) * maxTiltDeg * 2).toFixed(2);

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${xPct.toFixed(1)}% ${yPct.toFixed(1)}%, rgba(212, 160, 67, 0.25) 0%, transparent 65%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return {
    ref,
    tiltProps: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: {
        transform,
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        transformStyle: 'preserve-3d' as const,
      },
    },
    glareProps: {
      style: {
        ...glareStyle,
        transition: 'opacity 0.3s ease, background 0.1s ease',
        pointerEvents: 'none' as const,
      },
    },
  };
}
