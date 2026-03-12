"use client";
// ── BRACKET REVEAL — Client Component
// This is the ONLY reason we need "use client" in the bracket section.
// IntersectionObserver is a browser API — unavailable in Server Components.
//
// How it works:
//   1. The outer div starts WITHOUT the "bracket-active" class.
//   2. .b-slot / .b-conn-line etc. have animation-play-state: paused (set in page.tsx <style>)
//   3. When 15% of this div enters the viewport, we add "bracket-active".
//   4. CSS selector `.bracket-active .b-slot` switches play-state to running.
//   5. observer.unobserve() immediately after — animation plays ONCE, never repeats.
//
// Result: the animation plays exactly when the user scrolls to the bracket — a cinematic reveal.

import { useEffect, useRef } from "react";

export default function BracketReveal({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("bracket-active");
                    observer.unobserve(el); // Fire once, never again
                }
            },
            { threshold: 0.15 } // Trigger when 15% of bracket is visible
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="relative mx-auto" style={{ width: "1060px", height: "460px" }}>
            {children}
        </div>
    );
}
