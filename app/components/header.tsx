// Pure Server Component — no "use client", no hooks
import Link from "next/link";
import NavLink from "./NavLink";
import MobileMenu from "./Mobilemenu";

const NAV_LINKS = [
  { label: "Arena", href: "/arena" },
  { label: "Warriors", href: "/warriors" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Chronicle", href: "/chronicle" },
];

export default function Header() {
  return (
    <>
      {/* ── MINIMAL <style> BLOCK
          Only for things Tailwind genuinely cannot do:
          1. scroll-driven animation (animation-timeline is not in Tailwind)
          2. ::before pseudo-element for nav underline
          3. ::before pseudo-element for mobile arrow
          4. nth-child selectors for hamburger → X animation
          Everything else is Tailwind classes below. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');

        /* 1. Scroll-driven animation — header fades from transparent to glass */
        @keyframes header-fill {
          from {
            background: transparent;
            border-bottom-color: transparent;
            box-shadow: none;
            backdrop-filter: blur(0px);
          }
          to {
            background: rgba(10, 8, 6, 0.88);
            border-bottom-color: rgba(201, 168, 76, 0.3);
            box-shadow: 0 4px 40px rgba(0,0,0,0.6);
            backdrop-filter: blur(18px) saturate(180%);
          }
        }

        .rk-header {
          animation: header-fill linear both;
          animation-timeline: scroll(root);  /* tied to page scroll */
          animation-range: 0px 80px;         /* completes within first 80px */
        }

        /* Fallback: always show glass for browsers without scroll-driven animation support */
        @supports not (animation-timeline: scroll()) {
          .rk-header {
            background: rgba(10, 8, 6, 0.88);
            border-bottom-color: rgba(201, 168, 76, 0.3) !important;
            backdrop-filter: blur(18px) saturate(180%);
          }
        }

        /* 2. Nav link underline — slides in on hover/active
           Tailwind has no ::before support */
        .rk-nav-link::before {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0); /* invisible by default */
          width: calc(100% - 2rem);
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rk-nav-link:hover::before,
        .rk-nav-link.active::before {
          transform: translateX(-50%) scaleX(1); /* slides in */
        }

        /* 3. Mobile link arrow — slides in from left on hover */
        .rk-mobile-link::before {
          content: '⟶';
          font-size: 0.8rem;
          color: #c9a84c;
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.2s ease;
        }

        .rk-mobile-link:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        /* 4. Hamburger bars → X animation using nth-child
           Tailwind has no nth-child support */
        .rk-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .rk-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .rk-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
      `}</style>

      {/* ── HEADER WRAPPER
          rk-header = scroll-driven animation class (from <style> above)
          Everything else is Tailwind */}
      <header
        className="
          rk-header
          fixed top-0 left-0 right-0 z-100
          border-b border-transparent
          font-[Rajdhani,sans-serif]
        "
      >
        {/* Decorative crimson→gold→crimson gradient line at top of header */}
        <div
          className="absolute top-0 left-0 right-0 h-2px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #8b1a1a 15%, #c9a84c 40%, #e8c96e 50%, #c9a84c 60%, #8b1a1a 85%, transparent 100%)"
          }}
        />

        {/* ── INNER CONTAINER — max width + centered */}
        <div className="max-w-1280px mx-auto px-8 h-72px flex items-center justify-between gap-8">

          {/* ── LOGO
              Server-rendered plain Link — no JS needed */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0 group">

            {/* Dharma Chakra SVG emblem */}
            <div className="w-10 h-10 shrink-0">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_6px_rgba(201,168,76,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(201,168,76,0.9)] transition-all duration-300"
              >
                <circle cx="20" cy="20" r="18" stroke="#c9a84c" strokeWidth="1"/>
                <circle cx="20" cy="20" r="12" stroke="#c9a84c" strokeWidth="0.5" strokeDasharray="2 3"/>
                {/* 8 spokes drawn with trig — inner r=7, outer r=17 */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 20 + 7 * Math.cos(rad);
                  const y1 = 20 + 7 * Math.sin(rad);
                  const x2 = 20 + 17 * Math.cos(rad);
                  const y2 = 20 + 17 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a84c" strokeWidth="1.2"/>;
                })}
                <circle cx="20" cy="20" r="4" fill="#c9a84c" />
                <circle cx="20" cy="20" r="2" fill="#0a0806" />
              </svg>
            </div>

            {/* Logo text */}
            <div className="flex flex-col leading-none">
              {/* "RANAKSHETRA" — Cinzel font with gold gradient */}
              <span
                className="
                  font-[Cinzel,serif] text-[1.35rem] font-black tracking-[0.08em] uppercase
                  bg-linear-to-br from-[#e8c96e] via-[#c9a84c] to-[#a07830]
                  bg-clip-text text-transparent
                "
              >
                Ranakshetra
              </span>
              {/* "The Eternal Battlefield" subtitle */}
              <span className="text-[0.6rem] font-medium tracking-[0.35em] uppercase text-[rgba(201,168,76,0.45)] mt-2px">
                The Eternal Battlefield
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV
              NavLink is client-side for usePathname() active detection.
              Hidden on mobile (hidden md:flex). */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  {/* NavLink adds .active class when pathname matches href */}
                  <NavLink href={href} label={label} />
                </li>
              ))}
            </ul>
          </nav>

          {/* ── RIGHT SIDE: divider + CTA + hamburger */}
          <div className="flex items-center gap-4">

            {/* Thin vertical gold divider — hidden on mobile */}
            <div className="hidden md:block w-px h-6 bg-[rgba(201,168,76,0.3)] shrink-0" />

            {/* Desktop CTA buttons — hidden on mobile */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {/* Ghost button — transparent with angled clip-path corners */}
              <Link
                href="/login"
                className="
                  px-[1.1rem] py-[0.45rem]
                  font-semibold text-[0.88rem] tracking-0.1em uppercase
                  text-[#c9a84c] bg-transparent
                  border border-[rgba(201,168,76,0.3)]
                  hover:bg-[rgba(201,168,76,0.08)] hover:border-[#c9a84c] hover:text-[#e8c96e]
                  transition-all duration-300 no-underline
                "
                style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
              >
                Login
              </Link>

              {/* Primary button — solid gold with shimmer on hover */}
              <Link
                href="/enter"
                className="
                  relative overflow-hidden
                  px-[1.3rem] py-0.5rem
                  font-bold text-[0.88rem] tracking-[0.12em] uppercase
                  text-[#0a0806]
                  bg-linear-to-br from-[#e8c96e] to-[#c9a84c]
                  hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] hover:-translate-y-px
                  transition-all duration-300 no-underline
                "
                style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
              >
                Enter Battle
              </Link>
            </div>

            {/* MobileMenu — client component, handles hamburger + dropdown */}
            <MobileMenu />
          </div>

        </div>
      </header>
    </>
  );
}