"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { label: "Tournaments", href: "/tournaments" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Clubs", href: "/club" }
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* HAMBURGER BUTTON */}
      <button
        className={`rk-hamburger flex md:hidden flex-col gap-[5px] p-[6px] bg-transparent border-none cursor-pointer ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span className="block w-6 h-[1.5px] bg-[#8b5cf6] transition-all duration-300 origin-center" />
        <span className="block w-6 h-[1.5px] bg-[#8b5cf6] transition-all duration-300 origin-center" />
        <span className="block w-6 h-[1.5px] bg-[#8b5cf6] transition-all duration-300 origin-center" />
      </button>

      {/* MOBILE DROPDOWN
          KEY FIX: "absolute top-full" instead of "fixed top-[72px]"
          
          WHY: The header has a CSS animation (scroll-driven), which creates
          a new stacking context. Any "fixed" child inside it gets positioned
          relative to the header, not the viewport — causing top links to be
          clipped. "absolute top-full" means "start right below this element"
          which works correctly inside an animated parent. */}
      <div
        className={`
          md:hidden
          absolute top-full left-0 right-0
          flex flex-col gap-1
          px-8 py-6
          bg-[rgba(5,5,16,0.97)] backdrop-blur-xl
          border-t border-b border-[rgba(139,92,246,0.3)]
          transition-all duration-300
          ${open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }
        `}
        aria-hidden={!open}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="
              rk-mobile-link
              flex items-center gap-3 py-[0.85rem]
              font-semibold text-[1.1rem] tracking-[0.15em] uppercase
              text-white/60 hover:text-[#a78bfa]
              border-b border-[rgba(139,92,246,0.1)]
              no-underline transition-colors duration-200
            "
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}

        <div className="flex gap-3 mt-4">
          <Link
            href="/login"
            className="
              flex-1 text-center px-[1.1rem] py-[0.45rem]
              font-semibold text-[0.88rem] tracking-[0.1em] uppercase
              text-[#a78bfa] bg-transparent
              border border-[rgba(139,92,246,0.3)]
              hover:bg-[rgba(139,92,246,0.08)] hover:border-[#8b5cf6] hover:text-[#c4b5fd]
              transition-all duration-300 no-underline
            "
            style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <button className="cursor-pointer px-[1.1rem] py-[0.45rem] font-semibold text-[0.88rem] tracking-0.1em uppercase text-[#a78bfa] bg-transparent border border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.08)] hover:border-[#8b5cf6] hover:text-[#c4b5fd] transition-all duration-300 no-underline"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
              onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
        </div>
      </div>
    </>
  );
}