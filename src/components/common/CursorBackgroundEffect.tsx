import React, { useEffect, useRef, useState } from 'react';

export const CursorBackgroundEffect: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const posRef = useRef({
    targetX: -100,
    targetY: -100,
    currentX: -100,
    currentY: -100,
    ringX: -100,
    ringY: -100,
    isHoveringInteractive: false,
  });

  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Only run on devices with fine pointer (mouse)
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer')
        );
        posRef.current.isHoveringInteractive = isInteractive;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      const { targetX, targetY } = posRef.current;

      // Smooth Lerp for dot
      posRef.current.currentX += (targetX - posRef.current.currentX) * 0.35;
      posRef.current.currentY += (targetY - posRef.current.currentY) * 0.35;

      // Slower smooth Lerp for outer ring and ambient glow
      posRef.current.ringX += (targetX - posRef.current.ringX) * 0.15;
      posRef.current.ringY += (targetY - posRef.current.ringY) * 0.15;

      const { currentX, currentY, ringX, ringY, isHoveringInteractive } = posRef.current;

      // Update ambient background spotlight
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${ringX - 250}px, ${ringY - 250}px, 0)`;
      }

      // Update cursor core dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${currentX - 5}px, ${currentY - 5}px, 0) scale(${
          isHoveringInteractive ? 1.5 : 1
        })`;
      }

      // Update outer magnetic ring
      if (ringRef.current) {
        const ringScale = isHoveringInteractive ? 1.8 : 1;
        ringRef.current.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0) scale(${ringScale})`;
        ringRef.current.style.borderColor = isHoveringInteractive
          ? 'rgba(112, 101, 232, 0.8)'
          : 'rgba(112, 101, 232, 0.35)';
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Clean up ripples after animation
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* 1. Ambient Background Glow Spotlight */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-radial from-[#7065E8] via-[#A59DF7] to-transparent transition-opacity duration-300"
        style={{ willChange: 'transform' }}
      />

      {/* 2. Precision Cursor Core Dot */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-[#7065E8] shadow-xs transition-transform duration-100 ease-out"
        style={{ willChange: 'transform' }}
      />

      {/* 3. Magnetic Trailing Ring */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 w-9 h-9 rounded-full border border-[#7065E8]/40 transition-all duration-200 ease-out"
        style={{ willChange: 'transform' }}
      />

      {/* 4. Click Expansion Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-12 h-12 rounded-full border-2 border-[#7065E8]/60 animate-ping pointer-events-none"
          style={{
            left: r.x - 24,
            top: r.y - 24,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
};
