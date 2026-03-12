"use client";
// TourneyReveal.tsx
// Same pattern as BracketReveal — watches scroll with IntersectionObserver.
// Adds .tourney-active to the wrapper div once it enters the viewport (≥20% visible).
// Once active, CSS animations defined in page.tsx's <style> block start running.
// Observer disconnects immediately after firing (one-shot, no re-trigger).

import { useEffect, useRef } from "react";

export default function TourneyReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("tourney-active"); // triggers all .t-card-* animations
          obs.disconnect();                   // fire once only
        }
      },
      { threshold: 0.2 } // fires when 20% of the section is visible
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}