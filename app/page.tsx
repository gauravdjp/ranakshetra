import Link from "next/link";
import BracketReveal from "./components/BracketReveal";

export default function Home() {
  return (
    <>
      {/* ── WHY A <style> BLOCK?
          We use Tailwind for almost everything, but some CSS features
          are impossible to do in Tailwind without modifying tailwind.config.ts:
          
          1. @keyframes — Tailwind has no built-in custom animation support
          2. ::before / ::after — Tailwind can't generate pseudo-element content
          3. SVG <g> group animations — transform-origin on SVG groups needs raw CSS
          4. animation-delay — Tailwind has no staggered delay utilities
          
          Everything else (layout, color, spacing, hover) is Tailwind below. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        /* ── DESIGN TOKENS
           Defining gold colors as CSS variables so they're reusable
           inside @keyframes and pseudo-elements where Tailwind can't reach */
        :root {
          --primary: #8b5cf6;
          --primary-light: #a78bfa;
        }

        /* ─────────────────────────────────────────
           @KEYFRAMES — all animations are defined here.
           These are referenced by animation utility classes below.
        ───────────────────────────────────────── */

        /* Used for hero text — slides up from below and fades in */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Used for elements that just fade in without movement */
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Chakra inner spokes rotate clockwise continuously */
        @keyframes chakraSpin {
          to { transform: rotate(360deg); }
        }

        /* Chakra outer rings rotate counter-clockwise for a layered depth effect */
        @keyframes chakraSpinReverse {
          to { transform: rotate(-360deg); }
        }

        /* The entire chakra SVG pulses its glow — breathing effect */
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(139,92,246,0.5)); }
          50%       { filter: drop-shadow(0 0 32px rgba(139,92,246,0.9)); }
        }

        /* Hero background grid fades in slowly so it doesn't distract */
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.04; } /* very subtle — 4% opacity is intentional */
        }

        /* Pillar cards slide in from the left (used for Organiser card) */
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Pillar cards slide in from the right (used for Player card) */
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Pillar cards slide up from below (used for Clubs card) */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Scroll indicator line pulses to draw attention */
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        /* ── MARQUEE ANIMATIONS
           Row 1 scrolls left, Row 2 scrolls right — opposite directions create depth.
           We duplicate the list so when the first copy scrolls out,
           the second seamlessly takes over — infinite loop with zero JS. */
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }

        .marquee-track-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft 40s linear infinite;
        }
        .marquee-track-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 32s linear infinite;
        }

        /* Pause on hover so users can read game names */
        .marquee-wrap:hover .marquee-track-left,
        .marquee-wrap:hover .marquee-track-right {
          animation-play-state: paused;
        }

        /* Fade left/right edges so list appears to emerge from darkness */
        .marquee-fade {
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        /* Game tag glow on hover */
        .game-tag:hover {
          color: #a78bfa;
          border-color: rgba(139,92,246,0.7);
          background: rgba(139,92,246,0.08);
          box-shadow: 0 0 14px rgba(139,92,246,0.25), inset 0 0 10px rgba(139,92,246,0.05);
          text-shadow: 0 0 8px rgba(139,92,246,0.5);
        }

        /* ── BRACKET ANIMATIONS
           Slots slide in left-to-right across rounds with staggered delays.
           Connector lines draw themselves using stroke-dashoffset trick.
           Champion reveals last with a dramatic scale + continuous glow. */
        @keyframes bracketReveal {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* SVG lines draw themselves: dashoffset 600→0 makes line appear to draw */
        @keyframes connectorDraw {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes championReveal {
          0%   { opacity: 0; transform: scale(0.92); }
          70%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes championGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(139,92,246,0.4), 0 0 48px rgba(139,92,246,0.1); }
          50%       { box-shadow: 0 0 50px rgba(139,92,246,0.8), 0 0 96px rgba(139,92,246,0.25); }
        }
        /* ── SCROLL-TRIGGERED BRACKET ANIMATIONS
           All animations start PAUSED. The BracketReveal client component
           adds .bracket-active to the wrapper when it scrolls into view.
           Each child selector then switches play-state to running. */
        .b-slot {
          animation: bracketReveal 0.35s ease forwards;
          animation-play-state: paused;
          opacity: 0;
        }
        .bracket-active .b-slot { animation-play-state: running; }

        .b-conn-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: connectorDraw 0.5s ease forwards;
          animation-play-state: paused;
        }
        .bracket-active .b-conn-line { animation-play-state: running; }

        .b-champion {
          animation: championReveal 0.7s ease forwards;
          animation-play-state: paused;
          opacity: 0;
        }
        .bracket-active .b-champion { animation-play-state: running; }

        .b-champion-glow {
          animation: championGlow 2.5s ease-in-out infinite;
          animation-play-state: paused;
        }
        .bracket-active .b-champion-glow { animation-play-state: running; }

        /* ─────────────────────────────────────────
           ANIMATION UTILITY CLASSES
           These apply animations WITH staggered delays.
           Each number = a different delay so elements reveal one after another.
           opacity: 0 is set as default so elements are invisible before animating.
        ───────────────────────────────────────── */

        /* Hero elements stagger in sequence: eyebrow → title → subtitle → buttons */
        .anim-fade-up-1 { animation: fadeUp 1s ease forwards; animation-delay: 0.2s; opacity: 0; }
        .anim-fade-up-2 { animation: fadeUp 1s ease forwards; animation-delay: 0.4s; opacity: 0; }
        .anim-fade-up-3 { animation: fadeUp 1s ease forwards; animation-delay: 0.6s; opacity: 0; }
        .anim-fade-up-4 { animation: fadeUp 1s ease forwards; animation-delay: 0.8s; opacity: 0; }
        .anim-fade-in-5 { animation: fadeIn 1s ease forwards; animation-delay: 1.2s; opacity: 0; }

        /* Pillar cards enter with slight delay between each */
        .anim-slide-left  { animation: slideLeft  0.8s ease forwards; animation-delay: 0.3s; opacity: 0; }
        .anim-slide-right { animation: slideRight 0.8s ease forwards; animation-delay: 0.5s; opacity: 0; }
        .anim-slide-up    { animation: slideUp    0.8s ease forwards; animation-delay: 0.7s; opacity: 0; }

        /* Grid background fades in over 2 seconds */
        .anim-grid  { animation: gridFade 2s ease forwards; }

        /* Chakra glow breathes infinitely */
        .anim-glow  { animation: glowPulse 3s ease-in-out infinite; }

        /* Scroll line pulses infinitely */
        .anim-scroll { animation: scrollPulse 1.5s ease infinite; }

        /* ─────────────────────────────────────────
           CHAKRA SVG GROUP ANIMATIONS
           Tailwind can't target SVG <g> elements directly.
           transform-origin: 50% 50% ensures rotation happens around the center.
        ───────────────────────────────────────── */

        /* Inner spokes group — rotates clockwise slowly (20s per rotation) */
        .chakra-spokes {
          animation: chakraSpin 20s linear infinite;
          transform-origin: 50% 50%;
        }

        /* Outer dashed rings — counter-rotates (15s per rotation) */
        .chakra-outer {
          animation: chakraSpinReverse 15s linear infinite;
          transform-origin: 50% 50%;
        }

        /* ─────────────────────────────────────────
           PSEUDO-ELEMENTS
           ::before and ::after can't be done in Tailwind.
           These add decorative lines and corner brackets.
        ───────────────────────────────────────── */

        /* Subtle violet line at the top of sections */
        .section-line::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
        }

        /* Brighter violet line for the final CTA section */
        .section-line-bright::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
        }

        /* Corner bracket — top-left corner of pillar cards */
        .card-corners::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border-top: 2px solid var(--primary);
          border-left: 2px solid var(--primary);
          transition: all 0.4s ease;
        }

        /* Corner bracket — bottom-right corner */
        .card-corners::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 36px; height: 36px;
          border-bottom: 2px solid var(--primary);
          border-right: 2px solid var(--primary);
          transition: all 0.4s ease;
        }

        /* Brackets expand outward on card hover */
        .card-corners:hover::before,
        .card-corners:hover::after {
          width: 56px; height: 56px;
        }

        /* Vertical divider line between stat numbers on desktop */
        .stat-divider:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: rgba(139,92,246,0.15);
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
          Full viewport height. Animated background grid with
          vignette on top so it doesn't overpower the text.
          All text animations use staggered fadeUp delays.
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-32 pb-16 overflow-hidden bg-[#050510]">

        {/* ── BACKGROUND GRID
            A repeating line pattern at 4% opacity.
            anim-grid fades it in over 2s so it doesn't flash on load.
            pointer-events-none ensures it never blocks clicks. */}
        <div
          className="anim-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {/* ── RADIAL VIGNETTE
            A dark radial gradient that fades the grid out toward the edges.
            This keeps focus on the center content.
            70% opacity means the grid is only visible in the center area. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, #050510 70%)" }}
        />

        {/* ── CRIMSON GLOW
            A subtle red glow behind the headline — battlefield atmosphere.
            Positioned at 40% vertical so it sits behind the title. */}
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.15) 0%, transparent 70%)" }}
        />

        {/* ── BOTTOM FADE
            Gradient from transparent to background color.
            Makes the hero section blend smoothly into the next section. */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#050510] pointer-events-none" />

        {/* ── EYEBROW TAG
            Small label above the title — sets context immediately.
            anim-fade-up-1 = first element to appear (delay 0.2s) */}
        <p className="anim-fade-up-1 relative z-10 text-[0.75rem] font-semibold tracking-[0.4em] uppercase text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] px-5 py-2 mb-8">
          The Eternal Battlefield Awaits
        </p>

        {/* ── MAIN TITLE
            clamp() makes font size fluid — scales between 3rem (mobile) and 7.5rem (desktop).
            Split into two lines for a stacked, monumental look.
            Gold gradient text uses inline style because Tailwind's bg-clip-text
            doesn't work reliably with custom gradient colors.
            anim-fade-up-2 = second element (delay 0.4s) */}
        <h1
          className="anim-fade-up-2 relative z-10 font-[Cinzel,serif] font-black uppercase leading-[0.9] tracking-[0.05em]"
          style={{ fontSize: "clamp(3rem, 10vw, 7.5rem)" }}
        >
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #a78bfa 30%, #8b5cf6 60%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Rana
          </span>
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #a78bfa 30%, #8b5cf6 60%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            kshetra
          </span>
        </h1>

        {/* ── SUBTITLE
            Describes the platform in one line.
            text-white/45 = 45% white opacity — intentionally dim so title stays dominant.
            anim-fade-up-3 = third element (delay 0.6s) */}
        <p
          className="anim-fade-up-3 relative z-10 font-[Rajdhani,sans-serif] font-normal text-white/45 max-w-[520px] leading-relaxed mt-6"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
        >
          India's premier tournament organising platform. Host battles, forge legacies, and let the worthy rise.
        </p>

        {/* ── CTA BUTTONS
            Primary (gold fill) → Explore Tournaments
            Ghost (outlined) → Join the Arena
            clip-path creates the angled / sliced corners — the battle aesthetic.
            anim-fade-up-4 = fourth element (delay 0.8s) */}
        <div className="anim-fade-up-4 relative z-10 flex gap-4 mt-10 flex-wrap justify-center">
          {/* Primary CTA — most important action */}
          <Link
            href="/tournaments"
            className="px-9 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.95rem] tracking-[0.15em] uppercase text-white bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300 no-underline"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            Explore Tournaments
          </Link>

          {/* Secondary CTA — less urgent action */}
          <Link
            href="/register"
            className="px-9 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.95rem] tracking-[0.15em] uppercase text-[#a78bfa] bg-transparent border border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.08)] hover:border-[#8b5cf6] transition-all duration-300 no-underline"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            Join the Arena
          </Link>
        </div>

        {/* ── SCROLL INDICATOR
            Tells the user there's more content below.
            The line pulses via anim-scroll to draw the eye downward.
            anim-fade-in-5 = last element to appear (delay 1.2s) */}
        <div className="anim-fade-in-5 absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-[rgba(139,92,246,0.4)]">Scroll</span>
          <div className="anim-scroll w-px h-12 bg-gradient-to-b from-[#8b5cf6] to-transparent" />
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — THREE PILLARS
          The chakra sits at the center of a 3-column grid.
          Organiser on the left, Player on the right, Clubs below the chakra.
          On mobile: stacks vertically in order.
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative px-8 py-24 bg-[#0a0a1a] overflow-hidden">

        {/* Section header */}
        <div className="text-center mb-20">
          {/* Eyebrow label */}
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-4">
            The Three Forces
          </p>
          {/* Section title — "Ranakshetra" gets gold gradient treatment */}
          <h2
            className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em]"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            Who Enters the{" "}
            {/* {" "} adds a space before the span — JSX collapses whitespace otherwise */}
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Ranakshetra
            </span>
            ?
          </h2>
        </div>

        {/* ── CHAKRA EMBLEM — centered above the 3 cards
            Smaller (120px) so it acts as a section emblem, not the main focus.
            A short gold line below it connects visually to the cards. */}
        <div className="flex flex-col items-center mb-10">
          <div className="anim-glow w-[100px] h-[100px] md:w-[120px] md:h-[120px]">
            <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Outer dashed rings counter-rotate */}
              <g className="chakra-outer">
                <circle cx="90" cy="90" r="86" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4" />
                <circle cx="90" cy="90" r="78" stroke="#8b5cf6" strokeWidth="0.3" strokeDasharray="2 8" opacity="0.3" />
              </g>
              {/* Static ring */}
              <circle cx="90" cy="90" r="70" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
              {/* Inner spokes rotate clockwise */}
              <g className="chakra-spokes">
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 90 + 28 * Math.cos(rad);
                  const y1 = 90 + 28 * Math.sin(rad);
                  const x2 = 90 + 65 * Math.cos(rad);
                  const y2 = 90 + 65 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth="1" opacity="0.7" />;
                })}
                <circle cx="90" cy="90" r="28" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
              </g>
              <circle cx="90" cy="90" r="12" fill="#8b5cf6" opacity="0.9" />
              <circle cx="90" cy="90" r="6" fill="#050510" />
              <circle cx="90" cy="90" r="2" fill="#a78bfa" />
            </svg>
          </div>
          {/* Short line visually "connects" the chakra to the 3 cards below */}
          <div className="w-px h-8 bg-gradient-to-b from-[#8b5cf6] to-transparent mt-3 opacity-40" />
        </div>

        {/* ── 3 CARDS IN A SINGLE ROW
            grid-cols-3 on md+ = all 3 cards visible at once, no scrolling needed.
            grid-cols-1 on mobile = stacks vertically.
            items-start = cards align to top (not stretch to same height).
            Compact padding p-6 keeps content tight but readable. */}
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* ── ORGANISER CARD
              anim-slide-left = slides in from left
              card-corners = expanding gold bracket corners on hover (see ::before/::after in <style>) */}
          <div className="anim-slide-left card-corners relative p-6 border border-[rgba(139,92,246,0.15)] bg-white/[0.02] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div
              className="w-[48px] h-[48px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
            >
              {/* Crown — represents leadership / organising */}
              <svg viewBox="0 0 26 26" fill="none" className="w-6 h-6">
                <path d="M3 18L6 8L10 13L13 5L16 13L20 8L23 18H3Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                <line x1="3" y1="21" x2="23" y2="21" stroke="#8b5cf6" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-2">For the Commander</p>
            <h3 className="font-[Cinzel,serif] text-xl font-bold text-white tracking-[0.05em] mb-3">Organiser</h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.88rem] text-white/45 leading-relaxed mb-5">
              Create and manage tournaments with full control. Set brackets, rules, prizes, and watch your event unfold on the battlefield.
            </p>
            <Link href="/organise" className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] no-underline hover:gap-4 transition-all duration-300">
              Start Organising <span>⟶</span>
            </Link>
          </div>

          {/* ── PLAYER CARD
              anim-fade-up-2 = fades up from below (center card, neutral entry) */}
          <div className="anim-fade-up-2 card-corners relative p-6 border border-[rgba(139,92,246,0.15)] bg-white/[0.02] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div
              className="w-[48px] h-[48px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
            >
              {/* Sword — represents a warrior / player */}
              <svg viewBox="0 0 26 26" fill="none" className="w-6 h-6">
                <line x1="13" y1="3" x2="13" y2="19" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9 7L13 3L17 7" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                <line x1="9" y1="19" x2="17" y2="19" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                <line x1="11" y1="22" x2="15" y2="22" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-2">For the Warrior</p>
            <h3 className="font-[Cinzel,serif] text-xl font-bold text-white tracking-[0.05em] mb-3">Player</h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.88rem] text-white/45 leading-relaxed mb-5">
              Register for tournaments, track your rank, and prove your worth. Every match is a step toward glory on the leaderboard.
            </p>
            <Link href="/tournaments" className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] no-underline hover:gap-4 transition-all duration-300">
              Enter Battle <span>⟶</span>
            </Link>
          </div>

          {/* ── CLUBS CARD
              anim-slide-right = slides in from right */}
          <div className="anim-slide-right card-corners relative p-6 border border-[rgba(139,92,246,0.15)] bg-white/[0.02] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div
              className="w-[48px] h-[48px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
            >
              {/* Shield with checkmark — represents a club / team */}
              <svg viewBox="0 0 26 26" fill="none" className="w-6 h-6">
                <path d="M13 3L22 7V13C22 17.5 18 21.5 13 23C8 21.5 4 17.5 4 13V7L13 3Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 13L11.5 15.5L17 10" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-2">For the Brotherhood</p>
            <h3 className="font-[Cinzel,serif] text-xl font-bold text-white tracking-[0.05em] mb-3">Clubs</h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.88rem] text-white/45 leading-relaxed mb-5">
              Unite under one banner. Form or join a club, compete as a team, and build a legacy that echoes across every arena.
            </p>
            <Link href="/clubs" className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] no-underline hover:gap-4 transition-all duration-300">
              Find Your Clan <span>⟶</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — SUPPORTED GAMES
          Shows the top 20 games the platform supports.
          Two rows of game tags scroll in opposite directions — pure CSS marquee.
          Zero JS. Feels alive and dynamic without any interactivity cost.
          
          HOW THE MARQUEE WORKS:
          Each row renders the game list TWICE side by side.
          The animation shifts the track by -50% (left) or back to 0 (right).
          When the first copy scrolls out, the second is already in position.
          Result: seamless infinite loop.
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative py-20 bg-[#080808] overflow-hidden">

        {/* Section header — centered, compact */}
        <div className="text-center px-8 mb-12">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-3">
            Battlegrounds
          </p>
          <h2
            className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em] mb-3"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}
          >
            20 Games.{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              One Arena.
            </span>
          </h2>
          {/* Subtext — speaks directly to gamers */}
          <p className="font-[Rajdhani,sans-serif] text-[0.95rem] text-white/40 max-w-[480px] mx-auto leading-relaxed">
            From mobile battlegrounds to PC esports — if you play it, we host it.
          </p>
        </div>

        {/* ── MARQUEE WRAPPER
            marquee-wrap = the hover target to pause all tracks
            overflow-hidden clips the tracks at section edges
            marquee-fade = CSS mask that fades left/right edges to black */}
        <div className="marquee-wrap marquee-fade overflow-hidden">

          {/* ── ROW 1 — scrolls LEFT
              Contains the game list duplicated twice for seamless loop */}
          <div className="marquee-track-left mb-3">
            {/* Render the list TWICE — duplication is what makes the loop seamless */}
            {[...Array(2)].map((_, di) => (
              <div key={di} className="flex gap-3 px-2">
                {[
                  { name: "BGMI", genre: "Battle Royale" },
                  { name: "Valorant", genre: "Tactical FPS" },
                  { name: "Free Fire", genre: "Battle Royale" },
                  { name: "CS2", genre: "Tactical FPS" },
                  { name: "Rocket League", genre: "Sports" },
                  { name: "League of Legends", genre: "MOBA" },
                  { name: "Dota 2", genre: "MOBA" },
                  { name: "Apex Legends", genre: "Battle Royale" },
                  { name: "Call of Duty", genre: "FPS" },
                  { name: "Fortnite", genre: "Battle Royale" },
                ].map(({ name, genre }) => (
                  /* game-tag = hover glow defined in <style> above */
                  <div
                    key={name}
                    className="game-tag flex-shrink-0 flex items-center gap-3 px-5 py-3 border border-[rgba(139,92,246,0.2)] bg-[rgba(255,255,255,0.02)] cursor-default transition-all duration-300"
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
                  >
                    {/* Accent dot — colored differently per genre for visual variety */}
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] opacity-60 flex-shrink-0" />
                    <span className="font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.1em] uppercase text-white/70 whitespace-nowrap">
                      {name}
                    </span>
                    {/* Genre tag — dimmer, smaller */}
                    <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase text-[rgba(139,92,246,0.5)] whitespace-nowrap">
                      {genre}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── ROW 2 — scrolls RIGHT (opposite direction)
              Different 10 games — gives depth and shows full roster of 20 */}
          <div className="marquee-track-right">
            {[...Array(2)].map((_, di) => (
              <div key={di} className="flex gap-3 px-2">
                {[
                  { name: "Mobile Legends", genre: "MOBA" },
                  { name: "eFootball", genre: "Sports" },
                  { name: "Street Fighter 6", genre: "Fighting" },
                  { name: "Tekken 8", genre: "Fighting" },
                  { name: "Clash Royale", genre: "Strategy" },
                  { name: "Clash of Clans", genre: "Strategy" },
                  { name: "Pokemon Unite", genre: "MOBA" },
                  { name: "PUBG PC", genre: "Battle Royale" },
                  { name: "FIFA", genre: "Sports" },
                  { name: "Mortal Kombat", genre: "Fighting" },
                ].map(({ name, genre }) => (
                  <div
                    key={name}
                    className="game-tag flex-shrink-0 flex items-center gap-3 px-5 py-3 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.015)] cursor-default transition-all duration-300"
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] opacity-40 flex-shrink-0" />
                    <span className="font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.1em] uppercase text-white/60 whitespace-nowrap">
                      {name}
                    </span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase text-[rgba(139,92,246,0.4)] whitespace-nowrap">
                      {genre}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>

        {/* Bottom label — reinforces the "20 games" message */}
        <p className="text-center font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.35em] uppercase text-white/20 mt-10">
          Hover to pause · More games coming
        </p>

      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — ANIMATED RANKING BRACKET
          Shows the RANKING JOURNEY: Club → City → National → Global.
          Each column = a scope level of competition.
          BracketReveal (client component) fires animations once on scroll.

          LAYOUT (px):
            Columns:  Club left=75, City left=305, National left=535, Global left=780
            Slot: 160×36px
            ConnectorMidX: Club→City=270, City→Natl=500, Natl→Global=745
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative py-24 bg-[#08080f] overflow-hidden">

        {/* Violet radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)"
        }} />

        {/* Section header */}
        <div className="text-center mb-14 px-8">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-3">
            Ranking System
          </p>
          <h2 className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em]"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
            Rise Through{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>the Ranks</span>
          </h2>
          <p className="font-[Rajdhani,sans-serif] text-[0.9rem] text-white/35 mt-3">
            Club · City · State · Country · Continent · Global
          </p>
        </div>

        {/* ── BRACKET — horizontally scrollable on mobile.
            BracketReveal adds .bracket-active on scroll to trigger CSS animations. */}
        <div className="overflow-x-auto">
          <BracketReveal>

            {/* ══ SVG CONNECTOR LINES ══
                All lines use stroke-dashoffset animation (drawn left to right).
                stroke-dasharray=600 covers all path lengths safely.
                Winner path lines: crimson → gold gradient feel via brighter stroke.
                Each line has animationDelay so it appears AFTER the slots it connects. */}
            <svg className="absolute inset-0" width="1000" height="460" viewBox="0 0 1000 460"
              fill="none" style={{ zIndex: 0 }}>

              {/* ── QF → SF CONNECTORS (8 polylines: top+bot arm for each match) */}

              {/* Match A → SF S1 (winner path — brighter gold) */}
              <polyline className="b-conn-line" points="235,50 270,50 270,72 305,72"
                stroke="#8b5cf6" strokeWidth="1.5" opacity="0.9"
                style={{ animationDelay: "1.0s" }} />
              <polyline className="b-conn-line" points="235,94 270,94 270,72"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.1s" }} />

              {/* Match B → SF S2 */}
              <polyline className="b-conn-line" points="235,158 270,158 270,180 305,180"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.2s" }} />
              <polyline className="b-conn-line" points="235,202 270,202 270,180"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.3s" }} />

              {/* Match C → SF S3 */}
              <polyline className="b-conn-line" points="235,266 270,266 270,288 305,288"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.4s" }} />
              <polyline className="b-conn-line" points="235,310 270,310 270,288"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.5s" }} />

              {/* Match D → SF S4 */}
              <polyline className="b-conn-line" points="235,374 270,374 270,396 305,396"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.6s" }} />
              <polyline className="b-conn-line" points="235,418 270,418 270,396"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "1.7s" }} />

              {/* ── SF → FINAL CONNECTORS */}

              {/* SF Match 1 → Final F1 (winner path) */}
              <polyline className="b-conn-line" points="465,72 500,72 500,126 535,126"
                stroke="#8b5cf6" strokeWidth="1.5" opacity="0.9"
                style={{ animationDelay: "2.3s" }} />
              <polyline className="b-conn-line" points="465,180 500,180 500,126"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "2.4s" }} />

              {/* SF Match 2 → Final F2 */}
              <polyline className="b-conn-line" points="465,288 500,288 500,342 535,342"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "2.5s" }} />
              <polyline className="b-conn-line" points="465,396 500,396 500,342"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "2.6s" }} />

              {/* ── FINAL → CHAMPION CONNECTORS (winner path — brightest) */}
              <polyline className="b-conn-line" points="695,126 730,126 730,234 765,234"
                stroke="#a78bfa" strokeWidth="2" opacity="1"
                style={{ animationDelay: "3.2s" }} />
              <polyline className="b-conn-line" points="695,342 730,342 730,234"
                stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6"
                style={{ animationDelay: "3.3s" }} />

            </svg>

            {/* ══ RANKING TIER SLOTS ══
                Each column = a scope level of competition.
                Winners advance right through Club → City → National → Global. */}

            {/* ════ CLUB / COLLEGE LEVEL LABEL ════ */}
            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70"
              style={{ left: "75px", top: "8px" }}>Club / College</p>

            {/* ════ CLUB MATCH A — Bangalore clubs ════ */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.06)]"
              style={{
                left: "75px", top: "32px", width: "160px", height: "36px", animationDelay: "0.2s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[#8b5cf6] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-[#8b5cf6] opacity-50 w-3">1</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/90 flex-1 truncate">MYSTIC FC</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "76px", width: "160px", height: "36px", animationDelay: "0.3s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">8</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">NOVA GUILD</span>
            </div>

            {/* ════ CLUB MATCH B — Mumbai clubs ════ */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "140px", width: "160px", height: "36px", animationDelay: "0.4s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">4</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate">PIXEL CREW</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "184px", width: "160px", height: "36px", animationDelay: "0.5s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">5</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">BYTE FORCE</span>
            </div>

            {/* ════ CLUB MATCH C — Delhi clubs ════ */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "248px", width: "160px", height: "36px", animationDelay: "0.6s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">3</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate">STORM UNIT</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "292px", width: "160px", height: "36px", animationDelay: "0.7s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">6</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">WIRED FC</span>
            </div>

            {/* ════ CLUB MATCH D — Hyderabad clubs ════ */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "356px", width: "160px", height: "36px", animationDelay: "0.8s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">2</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate">APEX SQUAD</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "75px", top: "400px", width: "160px", height: "36px", animationDelay: "0.9s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">7</span>
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">ZERO HOUR</span>
            </div>

            {/* ════ CITY LEVEL LABEL ════ */}
            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70"
              style={{ left: "305px", top: "8px" }}>City Level</p>

            {/* ════ CITY MATCH 1 ════ */}
            {/* Bangalore advances (winner path) */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.06)]"
              style={{
                left: "305px", top: "54px", width: "160px", height: "36px", animationDelay: "1.9s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[#8b5cf6] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/90 flex-1 truncate ml-1">BANGALORE</span>
              <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-[#8b5cf6] pr-2 opacity-70">↑</span>
            </div>
            {/* Mumbai eliminated */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "305px", top: "162px", width: "160px", height: "36px", animationDelay: "2.0s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate ml-1">MUMBAI</span>
            </div>

            {/* ════ CITY MATCH 2 ════ */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "305px", top: "270px", width: "160px", height: "36px", animationDelay: "2.1s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate ml-1">DELHI</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "305px", top: "378px", width: "160px", height: "36px", animationDelay: "2.2s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate ml-1">HYDERABAD</span>
            </div>

            {/* ════ NATIONAL LEVEL LABEL ════ */}
            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70"
              style={{ left: "535px", top: "8px" }}>National</p>

            {/* South India advances (winner path) */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.07)]"
              style={{
                left: "535px", top: "108px", width: "160px", height: "36px", animationDelay: "2.8s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[#8b5cf6] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/90 flex-1 truncate ml-1">SOUTH INDIA</span>
              <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-[#8b5cf6] pr-2 opacity-70">↑</span>
            </div>
            {/* North India eliminated */}
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]"
              style={{
                left: "535px", top: "324px", width: "160px", height: "36px", animationDelay: "2.9s",
                clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)"
              }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" />
              <span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate ml-1">NORTH INDIA</span>
            </div>

            {/* ════ GLOBAL RANK LABEL ════ */}
            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70"
              style={{ left: "780px", top: "8px" }}>Global Rank</p>

            {/* Outer glow wrapper — continuous violet pulse */}
            <div className="b-champion-glow absolute rounded-sm"
              style={{ left: "772px", top: "198px", width: "186px", height: "72px", animationDelay: "3.5s" }}>

              {/* Global Champion card */}
              <div className="b-champion absolute inset-0 flex flex-col items-center justify-center border-2 border-[#8b5cf6] bg-[rgba(139,92,246,0.12)]"
                style={{
                  animationDelay: "3.5s",
                  clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)"
                }}>

                {/* Globe / rank icon */}
                <svg viewBox="0 0 20 14" fill="none" className="mb-1" style={{ width: "16px", height: "11px" }}>
                  <path d="M1 12L3.5 4L7 8L10 1L13 8L16.5 4L19 12H1Z"
                    fill="#8b5cf6" opacity="0.9" />
                  <line x1="1" y1="13.5" x2="19" y2="13.5" stroke="#8b5cf6" strokeWidth="1.2" />
                </svg>

                <span className="font-[Cinzel,serif] font-black text-[0.95rem] tracking-[0.12em] uppercase leading-none"
                  style={{
                    background: "linear-gradient(135deg, #a78bfa, #8b5cf6, #06b6d4)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                  }}>
                  INDIA #1
                </span>

                <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-60 mt-0.5">
                  ◇ GLOBAL RANK ◇
                </span>
              </div>
            </div>

          </BracketReveal>{/* end BracketReveal (scroll trigger wrapper) */}
        </div>{/* end overflow-x-auto */}

        {/* Ranking tier journey — shows the full 6-level path the bracket represents */}
        <div className="flex items-center justify-center gap-0 mt-10 px-8 flex-wrap">
          {["CLUB", "CITY", "STATE", "COUNTRY", "CONTINENT", "GLOBAL"].map((tier, i, arr) => (
            <div key={tier} className="flex items-center">
              <span
                className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.25em] uppercase"
                style={{ color: i === arr.length - 1 ? "#a78bfa" : "rgba(255,255,255,0.2)" }}>
                {tier}
              </span>
              {i < arr.length - 1 && (
                <span className="mx-2 text-[0.6rem] text-[rgba(139,92,246,0.3)]">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-center font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-white/12 mt-3 px-8">
          Scroll to see the bracket animate
        </p>

      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — FINAL CTA
          Last push to get the user to sign up or explore.
          Giant "RK" watermark sits behind everything at ~3% opacity
          — visible enough to add depth, not enough to distract.
      ══════════════════════════════════════════════════════ */}
      <section className="section-line-bright relative px-8 py-32 bg-[#0a0a1a] text-center overflow-hidden">

        {/* ── WATERMARK
            clamp scales from 5rem to 16rem based on viewport width.
            pointer-events-none + select-none = purely decorative, can't be interacted with.
            3% opacity is intentional — subtle texture not a distraction. */}
        <p
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[Cinzel,serif] font-black whitespace-nowrap pointer-events-none select-none tracking-[0.1em] text-[rgba(139,92,246,0.03)]"
          style={{ fontSize: "clamp(5rem, 18vw, 16rem)" }}
        >
          RK
        </p>

        {/* z-10 on all content keeps it above the watermark */}
        <p className="relative z-10 font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-6">
          Your Legend Begins Here
        </p>

        <h2
          className="relative z-10 font-[Cinzel,serif] font-black text-white tracking-[0.05em] mb-5"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Ready for Battle?
        </h2>

        <p className="relative z-10 font-[Rajdhani,sans-serif] text-[1rem] text-white/45 max-w-[440px] mx-auto leading-relaxed mb-10">
          Whether you organise, compete, or lead a club — the Ranakshetra is waiting for you.
        </p>

        {/* Same button pattern as hero — primary + ghost */}
        <div className="relative z-10 flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-9 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.95rem] tracking-[0.15em] uppercase text-white bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300 no-underline"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            Create Account
          </Link>
          <Link
            href="/tournaments"
            className="px-9 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.95rem] tracking-[0.15em] uppercase text-[#a78bfa] bg-transparent border border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.08)] hover:border-[#8b5cf6] transition-all duration-300 no-underline"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            Browse Tournaments
          </Link>
        </div>
      </section>
    </>
  );
}