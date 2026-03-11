// "use client" needed only because useState is a hook
"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Arena", href: "/arena" },
  { label: "Warriors", href: "/warriors" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Chronicle", href: "/chronicle" },
];

export default function MobileMenu() {
  // false = menu closed (default), true = menu open
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── HAMBURGER BUTTON
          rk-hamburger kept for nth-child span animations (Tailwind can't do nth-child)
          All layout/color is Tailwind */}
      <button
        className={`
          rk-hamburger
          flex md:hidden          
          flex-col gap-5px
          p-6px bg-transparent border-none cursor-pointer
          ${open ? "open" : ""}
        `}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {/* 3 bars — CSS in Header.tsx animates these into X when .open */}
        <span className="block w-6 h-[1.5px] bg-[#c9a84c] transition-all duration-300 origin-center" />
        <span className="block w-6 h-[1.5px] bg-[#c9a84c] transition-all duration-300 origin-center" />
        <span className="block w-6 h-[1.5px] bg-[#c9a84c] transition-all duration-300 origin-center" />
      </button>

      {/* ── MOBILE DROPDOWN MENU
          Hidden on desktop (md:hidden).
          Transitions between closed (opacity-0, -translate-y-2, pointer-events-none)
          and open (opacity-100, translate-y-0, pointer-events-auto) */}
      <div
        className={`
          md:hidden
          fixed top-72px left-0 right-0
          flex flex-col gap-1
          px-8 py-6
          bg-[rgba(8,6,4,0.97)] backdrop-blur-xl
          border-t border-b border-[rgba(201,168,76,0.3)]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
        aria-hidden={!open}
      >
        {/* Nav links — rk-mobile-link kept for ::before arrow pseudo-element */}
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="
              rk-mobile-link
              flex items-center gap-3
              py-[0.85rem]
              font-semibold text-[1.1rem] tracking-[0.15em] uppercase
              text-white/60 hover:text-[#e8c96e]
              border-b border-[rgba(201,168,76,0.1)]
              no-underline transition-colors duration-200
            "
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}

        {/* CTA buttons at bottom of mobile menu */}
        <div className="flex gap-3 mt-4">
          <Link
            href="/login"
            className="
              flex-1 text-center
              px-[1.1rem] py-[0.45rem]
              font-semibold text-[0.88rem] tracking-0.1em uppercase
              text-[#c9a84c] bg-transparent
              border border-[rgba(201,168,76,0.3)]
              hover:bg-[rgba(201,168,76,0.08)] hover:border-[#c9a84c] hover:text-[#e8c96e]
              transition-all duration-300 no-underline
            "
            style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/enter"
            className="
              flex-1 text-center
              px-[1.3rem] py-0.5rem
              font-bold text-[0.88rem] tracking-[0.12em] uppercase
              text-[#0a0806]
              bg-linear-to-br from-[#e8c96e] to-[#c9a84c]
              hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] hover:-translate-y-px
              transition-all duration-300 no-underline
            "
            style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
            onClick={() => setOpen(false)}
          >
            Enter Battle
          </Link>
        </div>
      </div>
    </>
  );
}