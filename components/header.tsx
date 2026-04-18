"use client";
import Link from "next/link";
import NavLink from "./NavLink";
import MobileMenu from "./Mobilemenu";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { label: "Tournaments", href: "/tournaments" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Clubs", href: "/club" },
];

export default function Header() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');

        @keyframes header-fill {
          from {
            background: transparent;
            border-bottom-color: transparent;
            box-shadow: none;
            backdrop-filter: blur(0px);
          }
          to {
            background: rgba(15, 14, 20, 0.92);
            border-bottom-color: rgba(232, 108, 47, 0.2);
            box-shadow: 0 4px 40px rgba(0,0,0,0.7);
            backdrop-filter: blur(18px) saturate(180%);
          }
        }

        .rk-header {
          animation: header-fill linear both;
          animation-timeline: scroll(root);
          animation-range: 0px 80px;
        }

        @supports not (animation-timeline: scroll()) {
          .rk-header {
            background: rgba(15, 14, 20, 0.92);
            border-bottom-color: rgba(232, 108, 47, 0.2) !important;
            backdrop-filter: blur(18px) saturate(180%);
          }
        }

        .rk-nav-link::before {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 2rem);
          height: 1px;
          background: linear-gradient(90deg, transparent, #E86C2F, transparent);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rk-nav-link:hover::before,
        .rk-nav-link.active::before {
          transform: translateX(-50%) scaleX(1);
        }

        .rk-mobile-link::before {
          content: '⟶';
          font-size: 0.8rem;
          color: #E86C2F;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.2s ease;
        }

        .rk-mobile-link:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        .rk-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .rk-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .rk-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
      `}</style>

      <header
        className="
          rk-header
          fixed top-5 left-0 right-0 z-100
          border-b border-transparent
          font-[Rajdhani,sans-serif]
        "
      >
        {/* Decorative gradient line — now orange to cyan */}
        <div
          className="absolute top-0 left-0 right-0 h-2px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #C84E10 15%, #E86C2F 40%, #FFB596 50%, #E86C2F 60%, #74D1FF 85%, transparent 100%)"
          }}
        />

        <div className="max-w-1280px mx-auto px-8 h-72px flex items-center justify-between gap-8">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0 group">

            <div className="w-10 h-10 shrink-0">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_6px_rgba(232,108,47,0.6)] group-hover:drop-shadow-[0_0_14px_rgba(232,108,47,1)] transition-all duration-300"
              >
                <circle cx="20" cy="20" r="18" stroke="#E86C2F" strokeWidth="1" />
                <circle cx="20" cy="20" r="12" stroke="#E86C2F" strokeWidth="0.5" strokeDasharray="2 3" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 20 + 7 * Math.cos(rad);
                  const y1 = 20 + 7 * Math.sin(rad);
                  const x2 = 20 + 17 * Math.cos(rad);
                  const y2 = 20 + 17 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E86C2F" strokeWidth="1.2" />;
                })}
                <circle cx="20" cy="20" r="4" fill="#E86C2F" />
                <circle cx="20" cy="20" r="2" fill="#0F0E14" />
              </svg>
            </div>

            <div className="flex flex-col leading-none">
              <span
                className="
                  font-[Cinzel,serif] text-[1.35rem] font-black tracking-[0.08em] uppercase
                  bg-gradient-to-br from-[#FFB596] via-[#E86C2F] to-[#74D1FF]
                  bg-clip-text text-transparent
                "
              >
                Ranakshetra
              </span>
              <span className="text-[0.65rem] font-medium tracking-[0.35em] uppercase text-[rgba(232,108,47,0.5)] mt-2px">
                The Eternal Battlefield
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <NavLink href={href} label={label} />
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            <div className="hidden md:block w-px h-6 bg-[rgba(232,108,47,0.25)] shrink-0" />

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="
                  px-[1.1rem] py-[0.45rem]
                  font-semibold text-[0.9rem] tracking-0.1em uppercase
                  text-[#FFB596] bg-transparent
                  border border-[rgba(232,108,47,0.3)]
                  hover:bg-[rgba(232,108,47,0.08)] hover:border-[#E86C2F] hover:text-[#FFB596]
                  transition-all duration-300 no-underline
                "
                style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="
                  px-[1.1rem] py-[0.45rem]
                  font-semibold text-[0.9rem] tracking-0.1em uppercase
                  text-[#FFB596] bg-transparent
                  border border-[rgba(232,108,47,0.3)]
                  hover:bg-[rgba(232,108,47,0.08)] hover:border-[#E86C2F] hover:text-[#FFB596]
                  transition-all duration-300 no-underline
                 "
                style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
              >
                SIGNUP
              </Link>

              {/*<button
                className="cursor-pointer px-[1.1rem] py-[0.45rem] font-semibold text-[0.9rem] tracking-0.1em uppercase text-[#FFB596] bg-transparent border border-[rgba(232,108,47,0.3)] hover:bg-[rgba(232,108,47,0.08)] hover:border-[#E86C2F] hover:text-[#FFB596] transition-all duration-300"
                style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>*/}
            </div>

            <MobileMenu />
          </div>

        </div>
      </header>
    </>
  );
}