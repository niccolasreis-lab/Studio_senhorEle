import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth physics spring
  const springConfig = { damping: 28, stiffness: 220, mass: 0.6 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if device is touch-primary
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = !!target.closest(
        'a, button, input, textarea, select, [role="button"], .cursor-pointer'
      );
      setIsHovered(isInteractive);
    };

    const handleMouseLeaveWindow = () => setIsVisible(false);
    const handleMouseEnterWindow = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [isVisible, mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Small Precision Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-amber-glow rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(235,180,80,0.8)]"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />

      {/* Larger Floating Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-secondary/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(176,131,50,0.25)]"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          width: isHovered ? 48 : isClicking ? 20 : 32,
          height: isHovered ? 48 : isClicking ? 20 : 32,
          borderColor: isHovered ? 'rgba(235,180,80,0.9)' : 'rgba(176,131,50,0.5)',
          backgroundColor: isHovered ? 'rgba(176,131,50,0.12)' : 'rgba(0,0,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </div>
  );
}
