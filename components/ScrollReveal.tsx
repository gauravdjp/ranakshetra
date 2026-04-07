// ScrollReveal.tsx
"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  activeClass: string;       // e.g. "bracket-active" or "tourney-active"
  threshold?: number;        // default 0.15
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollReveal({
  children,
  activeClass,
  threshold = 0.15,
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(activeClass);
          obs.disconnect();
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [activeClass, threshold]);

  return <div ref={ref} className={className} style={style}>{children}</div>;
}