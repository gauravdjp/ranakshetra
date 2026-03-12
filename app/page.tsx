import Link from "next/link";
import BracketReveal from "./components/BracketReveal";
import TourneyReveal from "./components/Tourneyreveal";
export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        /* ── DESIGN TOKENS */
        :root {
          --primary: #8b5cf6;
          --primary-light: #a78bfa;
        }

        /* ── HERO ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── CHAKRA ANIMATIONS */
        @keyframes chakraSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes chakraSpinReverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(139,92,246,0.5)); }
          50%       { filter: drop-shadow(0 0 32px rgba(139,92,246,0.9)); }
        }

        /* ── BACKGROUND */
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.04; }
        }

        /* ── PILLAR CARD ANIMATIONS */
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }

        /* ── MARQUEE */
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
        .marquee-wrap:hover .marquee-track-left,
        .marquee-wrap:hover .marquee-track-right {
          animation-play-state: paused;
        }
        .marquee-fade {
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .game-tag:hover {
          color: #a78bfa;
          border-color: rgba(139,92,246,0.7);
          background: rgba(139,92,246,0.08);
          box-shadow: 0 0 14px rgba(139,92,246,0.25), inset 0 0 10px rgba(139,92,246,0.05);
          text-shadow: 0 0 8px rgba(139,92,246,0.5);
        }

        /* ── BRACKET ANIMATIONS */
        @keyframes bracketReveal {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
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

        /* ── ANIMATION UTILITY CLASSES */
        .anim-fade-up-1 { animation: fadeUp 1s ease forwards; animation-delay: 0.2s; opacity: 0; }
        .anim-fade-up-2 { animation: fadeUp 1s ease forwards; animation-delay: 0.4s; opacity: 0; }
        .anim-fade-up-3 { animation: fadeUp 1s ease forwards; animation-delay: 0.6s; opacity: 0; }
        .anim-fade-up-4 { animation: fadeUp 1s ease forwards; animation-delay: 0.8s; opacity: 0; }
        .anim-fade-in-5 { animation: fadeIn 1s ease forwards; animation-delay: 1.2s; opacity: 0; }
        .anim-slide-left  { animation: slideLeft  0.8s ease forwards; animation-delay: 0.3s; opacity: 0; }
        .anim-slide-right { animation: slideRight 0.8s ease forwards; animation-delay: 0.5s; opacity: 0; }
        .anim-slide-up    { animation: slideUp    0.8s ease forwards; animation-delay: 0.7s; opacity: 0; }
        .anim-grid  { animation: gridFade 2s ease forwards; }
        .anim-glow  { animation: glowPulse 3s ease-in-out infinite; }
        .anim-scroll { animation: scrollPulse 1.5s ease infinite; }

        /* ── CHAKRA SVG GROUP ANIMATIONS */
        .chakra-spokes {
          animation: chakraSpin 20s linear infinite;
          transform-origin: 50% 50%;
        }
        .chakra-outer {
          animation: chakraSpinReverse 15s linear infinite;
          transform-origin: 50% 50%;
        }

        /* ── PSEUDO-ELEMENTS */
        .section-line::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
        }
        .section-line-bright::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
        }
        .card-corners::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border-top: 2px solid var(--primary);
          border-left: 2px solid var(--primary);
          transition: all 0.4s ease;
        }
        .card-corners::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 36px; height: 36px;
          border-bottom: 2px solid var(--primary);
          border-right: 2px solid var(--primary);
          transition: all 0.4s ease;
        }
        .card-corners:hover::before,
        .card-corners:hover::after {
          width: 56px; height: 56px;
        }
        .stat-divider:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: rgba(139,92,246,0.15);
        }

        /* ══════════════════════════════════════════════════════
           TOURNAMENT TYPES SECTION ANIMATIONS
           Cards fan in from opposite sides when scrolled into view.
           TourneyReveal component adds .tourney-active to trigger them.
        ══════════════════════════════════════════════════════ */

        /* Icon gently floats up/down when card is hovered */
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }

        /* Left card slides in from left with a slight tilt */
        @keyframes tourneyFanLeft {
          from { opacity: 0; transform: translateX(-30px) rotate(-2deg); }
          to   { opacity: 1; transform: translateX(0) rotate(0deg); }
        }

        /* Center card rises up from below */
        @keyframes tourneyFanCenter {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Right card slides in from right with a slight tilt */
        @keyframes tourneyFanRight {
          from { opacity: 0; transform: translateX(30px) rotate(2deg); }
          to   { opacity: 1; transform: translateX(0) rotate(0deg); }
        }

        /* "Most Popular" badge bounces in last for drama */
        @keyframes badgePop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* Light beam sweeps down the card on hover */
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100%); }
        }

        /* Cards start paused — TourneyReveal adds .tourney-active on scroll */
        .t-card-left   { animation: tourneyFanLeft   0.6s ease forwards; animation-play-state: paused; opacity: 0; }
        .t-card-center { animation: tourneyFanCenter 0.6s ease forwards; animation-play-state: paused; opacity: 0; }
        .t-card-right  { animation: tourneyFanRight  0.6s ease forwards; animation-play-state: paused; opacity: 0; }

        /* Staggered delays: left first, then center, then right */
        .tourney-active .t-card-left   { animation-play-state: running; animation-delay: 0.1s; }
        .tourney-active .t-card-center { animation-play-state: running; animation-delay: 0.3s; }
        .tourney-active .t-card-right  { animation-play-state: running; animation-delay: 0.5s; }

        /* Badge pops in after all 3 cards have appeared */
        .t-badge { animation: badgePop 0.4s ease forwards; animation-play-state: paused; opacity: 0; }
        .tourney-active .t-badge { animation-play-state: running; animation-delay: 0.9s; }

        /* Icon floats continuously while card is hovered */
        .t-card:hover .t-icon { animation: iconFloat 2s ease-in-out infinite; }

        /* Scanline: a light sheen sweeps over the card on hover.
           Uses ::after pseudo-element — positioned absolutely inside the card. */
        .t-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 60%;
          background: linear-gradient(180deg, rgba(139,92,246,0.04) 0%, transparent 100%);
          transform: translateY(-100%);
          pointer-events: none;
        }
        .t-card:hover::after {
          animation: scanline 0.7s ease forwards;
        }

        /* Featured card (Public) has a brighter border by default */
        .t-card-featured {
          border-color: rgba(139,92,246,0.55) !important;
          background: rgba(139,92,246,0.06) !important;
        }
        .t-card-featured:hover {
          border-color: rgba(139,92,246,0.9) !important;
          box-shadow: 0 0 60px rgba(139,92,246,0.25), 0 24px 60px rgba(0,0,0,0.5) !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-32 pb-16 overflow-hidden bg-[#050510]">

        {/* Background grid — fades in at 4% opacity */}
        <div
          className="anim-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {/* Radial vignette — keeps focus on center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, #050510 70%)" }}
        />

        {/* Cyan glow behind headline */}
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.15) 0%, transparent 70%)" }}
        />

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#050510] pointer-events-none" />

        {/* Eyebrow tag */}
        <p className="anim-fade-up-1 relative z-10 text-[0.75rem] font-semibold tracking-[0.4em] uppercase text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] px-5 py-2 mb-8">
          The Eternal Battlefield Awaits
        </p>

        {/* Main title */}
        <h1
          className="anim-fade-up-2 relative z-10 font-[Cinzel,serif] font-black uppercase leading-[0.9] tracking-[0.05em]"
          style={{ fontSize: "clamp(3rem, 10vw, 7.5rem)" }}
        >
          <span className="block" style={{
            background: "linear-gradient(135deg, #fff 0%, #a78bfa 30%, #8b5cf6 60%, #06b6d4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>Rana</span>
          <span className="block" style={{
            background: "linear-gradient(135deg, #fff 0%, #a78bfa 30%, #8b5cf6 60%, #06b6d4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>kshetra</span>
        </h1>

        {/* Subtitle */}
        <p
          className="anim-fade-up-3 relative z-10 font-[Rajdhani,sans-serif] font-normal text-white/45 max-w-[520px] leading-relaxed mt-6"
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
        >
          India's premier tournament organising platform. Host battles, forge legacies, and let the worthy rise.
        </p>

        {/* CTA buttons */}
        <div className="anim-fade-up-4 relative z-10 flex gap-4 mt-10 flex-wrap justify-center">
          <Link
            href="/tournaments"
            className="px-9 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.95rem] tracking-[0.15em] uppercase text-white bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300 no-underline"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            Explore Tournaments
          </Link>
          <Link
            href="/register"
            className="px-9 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.95rem] tracking-[0.15em] uppercase text-[#a78bfa] bg-transparent border border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.08)] hover:border-[#8b5cf6] transition-all duration-300 no-underline"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
          >
            Join the Club
          </Link>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — THREE PILLARS
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative px-8 py-24 bg-[#0a0a1a] overflow-hidden">

        <div className="text-center mb-5">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-4">
            The Three Forces
          </p>
          <h2
            className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em]"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            Who Enters the{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>Ranakshetra</span>?
          </h2>
        </div>

        {/* Chakra emblem */}
        <div className="flex flex-col items-center mb-5">
          <div className="anim-glow w-[100px] h-[100px] md:w-[120px] md:h-[120px]">
            <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g className="chakra-outer">
                <circle cx="90" cy="90" r="86" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4" />
                <circle cx="90" cy="90" r="78" stroke="#8b5cf6" strokeWidth="0.3" strokeDasharray="2 8" opacity="0.3" />
              </g>
              <circle cx="90" cy="90" r="70" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
              <g className="chakra-spokes">
                {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 90 + 28 * Math.cos(rad); const y1 = 90 + 28 * Math.sin(rad);
                  const x2 = 90 + 65 * Math.cos(rad); const y2 = 90 + 65 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth="1" opacity="0.7" />;
                })}
                <circle cx="90" cy="90" r="28" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
              </g>
              <circle cx="90" cy="90" r="12" fill="#8b5cf6" opacity="0.9" />
              <circle cx="90" cy="90" r="6" fill="#050510" />
              <circle cx="90" cy="90" r="2" fill="#a78bfa" />
            </svg>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-[#8b5cf6] to-transparent mt-3 opacity-40" />
        </div>

        {/* 3 pillar cards */}
        <div className="mt-10max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Organiser */}
          <div className="anim-slide-left card-corners relative p-6 border border-[rgba(139,92,246,0.15)] bg-white/[0.02] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="w-[48px] h-[48px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
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

          {/* Player */}
          <div className="anim-fade-up-2 card-corners relative p-6 border border-[rgba(139,92,246,0.15)] bg-white/[0.02] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="w-[48px] h-[48px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
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

          {/* Clubs */}
          <div className="anim-slide-right card-corners relative p-6 border border-[rgba(139,92,246,0.15)] bg-white/[0.02] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="w-[48px] h-[48px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
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
              Find Your Club <span>⟶</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — SUPPORTED GAMES (MARQUEE)
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative py-20 bg-[#080808] overflow-hidden">

        <div className="text-center px-8 mb-12">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-3">Battlegrounds</p>
          <h2 className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em] mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
            20 Games.{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              One Arena.
            </span>
          </h2>
          <p className="font-[Rajdhani,sans-serif] text-[0.95rem] text-white/40 max-w-[480px] mx-auto leading-relaxed">
            From mobile battlegrounds to PC esports — if you play it, we host it.
          </p>
        </div>

        <div className="marquee-wrap marquee-fade overflow-hidden">
          {/* Row 1 — scrolls left */}
          <div className="marquee-track-left mb-3">
            {[...Array(2)].map((_, di) => (
              <div key={di} className="flex gap-3 px-2">
                {[
                  { name: "BGMI", genre: "Battle Royale" }, { name: "Valorant", genre: "Tactical FPS" },
                  { name: "Free Fire", genre: "Battle Royale" }, { name: "CS2", genre: "Tactical FPS" },
                  { name: "Rocket League", genre: "Sports" }, { name: "League of Legends", genre: "MOBA" },
                  { name: "Dota 2", genre: "MOBA" }, { name: "Apex Legends", genre: "Battle Royale" },
                  { name: "Call of Duty", genre: "FPS" }, { name: "Fortnite", genre: "Battle Royale" },
                ].map(({ name, genre }) => (
                  <div key={name} className="game-tag flex-shrink-0 flex items-center gap-3 px-5 py-3 border border-[rgba(139,92,246,0.2)] bg-[rgba(255,255,255,0.02)] cursor-default transition-all duration-300"
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] opacity-60 flex-shrink-0" />
                    <span className="font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.1em] uppercase text-white/70 whitespace-nowrap">{name}</span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase text-[rgba(139,92,246,0.5)] whitespace-nowrap">{genre}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Row 2 — scrolls right */}
          <div className="marquee-track-right">
            {[...Array(2)].map((_, di) => (
              <div key={di} className="flex gap-3 px-2">
                {[
                  { name: "Mobile Legends", genre: "MOBA" }, { name: "eFootball", genre: "Sports" },
                  { name: "Street Fighter 6", genre: "Fighting" }, { name: "Tekken 8", genre: "Fighting" },
                  { name: "Clash Royale", genre: "Strategy" }, { name: "Clash of Clans", genre: "Strategy" },
                  { name: "Pokemon Unite", genre: "MOBA" }, { name: "PUBG PC", genre: "Battle Royale" },
                  { name: "FIFA", genre: "Sports" }, { name: "Mortal Kombat", genre: "Fighting" },
                ].map(({ name, genre }) => (
                  <div key={name} className="game-tag flex-shrink-0 flex items-center gap-3 px-5 py-3 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.015)] cursor-default transition-all duration-300"
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] opacity-40 flex-shrink-0" />
                    <span className="font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.1em] uppercase text-white/60 whitespace-nowrap">{name}</span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase text-[rgba(139,92,246,0.4)] whitespace-nowrap">{genre}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.35em] uppercase text-white/20 mt-10">
          Hover to pause · More games coming
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — ANIMATED RANKING BRACKET
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative py-24 bg-[#08080f] overflow-hidden">

        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.07) 0%, transparent 70%)"
        }} />

        <div className="text-center mb-14 px-8">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-3">Ranking System</p>
          <h2 className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em]" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
            Rise Through{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>the Ranks</span>
          </h2>
          <p className="font-[Rajdhani,sans-serif] text-[0.9rem] text-white/35 mt-3">Club · City · State · Country · Continent · Global</p>
        </div>

        <div className="overflow-x-auto">
          <BracketReveal>
            <svg className="absolute inset-0" width="1000" height="460" viewBox="0 0 1000 460" fill="none" style={{ zIndex: 0 }}>
              <polyline className="b-conn-line" points="235,50 270,50 270,72 305,72" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.9" style={{ animationDelay: "1.0s" }} />
              <polyline className="b-conn-line" points="235,94 270,94 270,72" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.1s" }} />
              <polyline className="b-conn-line" points="235,158 270,158 270,180 305,180" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.2s" }} />
              <polyline className="b-conn-line" points="235,202 270,202 270,180" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.3s" }} />
              <polyline className="b-conn-line" points="235,266 270,266 270,288 305,288" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.4s" }} />
              <polyline className="b-conn-line" points="235,310 270,310 270,288" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.5s" }} />
              <polyline className="b-conn-line" points="235,374 270,374 270,396 305,396" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.6s" }} />
              <polyline className="b-conn-line" points="235,418 270,418 270,396" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "1.7s" }} />
              <polyline className="b-conn-line" points="465,72 500,72 500,126 535,126" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.9" style={{ animationDelay: "2.3s" }} />
              <polyline className="b-conn-line" points="465,180 500,180 500,126" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "2.4s" }} />
              <polyline className="b-conn-line" points="465,288 500,288 500,342 535,342" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "2.5s" }} />
              <polyline className="b-conn-line" points="465,396 500,396 500,342" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "2.6s" }} />
              <polyline className="b-conn-line" points="695,126 730,126 730,234 765,234" stroke="#a78bfa" strokeWidth="2" opacity="1" style={{ animationDelay: "3.2s" }} />
              <polyline className="b-conn-line" points="695,342 730,342 730,234" stroke="rgba(139,92,246,0.35)" strokeWidth="1" opacity="0.6" style={{ animationDelay: "3.3s" }} />
            </svg>

            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70" style={{ left: "75px", top: "8px" }}>Club / College</p>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.06)]" style={{ left:"75px",top:"32px",width:"160px",height:"36px",animationDelay:"0.2s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[#8b5cf6] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-[#8b5cf6] opacity-50 w-3">1</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/90 flex-1 truncate">MYSTIC FC</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"76px",width:"160px",height:"36px",animationDelay:"0.3s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">8</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">NOVA GUILD</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"140px",width:"160px",height:"36px",animationDelay:"0.4s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">4</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate">PIXEL CREW</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"184px",width:"160px",height:"36px",animationDelay:"0.5s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">5</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">BYTE FORCE</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"248px",width:"160px",height:"36px",animationDelay:"0.6s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">3</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate">STORM UNIT</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"292px",width:"160px",height:"36px",animationDelay:"0.7s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">6</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">WIRED FC</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"356px",width:"160px",height:"36px",animationDelay:"0.8s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">2</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate">APEX SQUAD</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"75px",top:"400px",width:"160px",height:"36px",animationDelay:"0.9s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] text-[0.55rem] text-white/20 w-3">7</span><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate">ZERO HOUR</span>
            </div>

            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70" style={{ left:"305px",top:"8px" }}>City Level</p>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.06)]" style={{ left:"305px",top:"54px",width:"160px",height:"36px",animationDelay:"1.9s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[#8b5cf6] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/90 flex-1 truncate ml-1">BANGALORE</span><span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-[#8b5cf6] pr-2 opacity-70">↑</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"305px",top:"162px",width:"160px",height:"36px",animationDelay:"2.0s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate ml-1">MUMBAI</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"305px",top:"270px",width:"160px",height:"36px",animationDelay:"2.1s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,92,246,0.4)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/55 flex-1 truncate ml-1">DELHI</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"305px",top:"378px",width:"160px",height:"36px",animationDelay:"2.2s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate ml-1">HYDERABAD</span>
            </div>

            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70" style={{ left:"535px",top:"8px" }}>National</p>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.07)]" style={{ left:"535px",top:"108px",width:"160px",height:"36px",animationDelay:"2.8s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[#8b5cf6] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/90 flex-1 truncate ml-1">SOUTH INDIA</span><span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-[#8b5cf6] pr-2 opacity-70">↑</span>
            </div>
            <div className="b-slot absolute flex items-center gap-2 border border-[rgba(139,92,246,0.15)] bg-[rgba(255,255,255,0.02)]" style={{ left:"535px",top:"324px",width:"160px",height:"36px",animationDelay:"2.9s",clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
              <div className="w-0.5 h-full bg-[rgba(139,26,26,0.5)] flex-shrink-0" /><span className="font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.06em] uppercase text-white/25 flex-1 truncate ml-1">NORTH INDIA</span>
            </div>

            <p className="absolute font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-70" style={{ left:"780px",top:"8px" }}>Global Rank</p>
            <div className="b-champion-glow absolute rounded-sm" style={{ left:"772px",top:"198px",width:"186px",height:"72px",animationDelay:"3.5s" }}>
              <div className="b-champion absolute inset-0 flex flex-col items-center justify-center border-2 border-[#8b5cf6] bg-[rgba(139,92,246,0.12)]"
                style={{ animationDelay:"3.5s", clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
                <svg viewBox="0 0 20 14" fill="none" className="mb-1" style={{ width:"16px",height:"11px" }}>
                  <path d="M1 12L3.5 4L7 8L10 1L13 8L16.5 4L19 12H1Z" fill="#8b5cf6" opacity="0.9" />
                  <line x1="1" y1="13.5" x2="19" y2="13.5" stroke="#8b5cf6" strokeWidth="1.2" />
                </svg>
                <span className="font-[Cinzel,serif] font-black text-[0.95rem] tracking-[0.12em] uppercase leading-none"
                  style={{ background:"linear-gradient(135deg, #a78bfa, #8b5cf6, #06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  INDIA #1
                </span>
                <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.3em] uppercase text-[#8b5cf6] opacity-60 mt-0.5">◇ GLOBAL RANK ◇</span>
              </div>
            </div>

          </BracketReveal>
        </div>

        <div className="flex items-center justify-center gap-0 mt-10 px-8 flex-wrap">
          {["CLUB","CITY","STATE","COUNTRY","CONTINENT","GLOBAL"].map((tier, i, arr) => (
            <div key={tier} className="flex items-center">
              <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.25em] uppercase"
                style={{ color: i === arr.length - 1 ? "#a78bfa" : "rgba(255,255,255,0.2)" }}>
                {tier}
              </span>
              {i < arr.length - 1 && <span className="mx-2 text-[0.6rem] text-[rgba(139,92,246,0.3)]">→</span>}
            </div>
          ))}
        </div>
        <p className="text-center font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-white/12 mt-3 px-8">
          Scroll to see the bracket animate
        </p>

      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — TOURNAMENT TYPES
          Three cards showing Public, Private, and Club formats.
          TourneyReveal fires scroll-triggered fan animations.
          Each card: angled clip-path, floating icon on hover,
          scanline sweep effect, feature tags, CTA link.
      ══════════════════════════════════════════════════════ */}
      <section className="section-line relative py-24 bg-[#06060f] overflow-hidden">

        {/* Faint background grid — same style as hero but much dimmer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }}
        />
        {/* Radial violet glow behind the cards */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
        />

        {/* Section header */}
        <div className="text-center mb-16 px-8">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-4">
            Choose Your Battle Format
          </p>
          <h2
            className="font-[Cinzel,serif] font-bold text-white tracking-[0.05em]"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            Three Ways to{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>
              Compete
            </span>
          </h2>
          {/* Decorative divider — diamond flanked by lines */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[rgba(139,92,246,0.5)]" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#8b5cf6] opacity-60" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[rgba(139,92,246,0.5)]" />
          </div>
        </div>

        {/* TourneyReveal adds .tourney-active when section scrolls into view,
            which starts the CSS fan-in animations on the 3 cards */}
        <TourneyReveal>
          <div className="max-w-[1100px] mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* ── PUBLIC TOURNAMENT CARD
                Featured (brighter border). Fan in from left.
                Globe icon = open / worldwide. */}
            <div
              className="t-card t-card-left t-card-featured relative flex flex-col p-7 border bg-white/[0.02] hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
            >
              {/* "Most Popular" badge — pops in last after cards appear */}
              <div className="t-badge absolute top-3 right-6 font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-[#06b6d4] border border-[rgba(6,182,212,0.4)] px-2 py-0.5 bg-[rgba(6,182,212,0.06)]">
                Most Popular
              </div>

              {/* Icon — floats on hover via .t-card:hover .t-icon CSS rule */}
              <div className="t-icon w-[52px] h-[52px] border border-[rgba(139,92,246,0.4)] flex items-center justify-center mb-5 bg-[rgba(139,92,246,0.07)]"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
                  <circle cx="14" cy="14" r="10" stroke="#8b5cf6" strokeWidth="1.5" />
                  <ellipse cx="14" cy="14" rx="5" ry="10" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
                  <line x1="4" y1="14" x2="24" y2="14" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
                  <line x1="14" y1="4" x2="14" y2="24" stroke="#8b5cf6" strokeWidth="1" opacity="0.3" />
                </svg>
              </div>

              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Open Arena</p>
              <h3 className="font-[Cinzel,serif] text-xl font-bold text-white tracking-[0.05em] mb-3">Public</h3>
              <p className="font-[Rajdhani,sans-serif] text-[0.88rem] text-white/45 leading-relaxed mb-5 flex-1">
                Anyone can enter. Open to all players across the platform. Perfect for building reputation and climbing the global leaderboard from zero.
              </p>

              {/* Feature tags — quick visual summary of what this format offers */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["Open Entry", "Global Rankings", "Prize Pools", "Spectators"].map(tag => (
                  <span key={tag} className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.15em] uppercase text-[rgba(139,92,246,0.7)] border border-[rgba(139,92,246,0.2)] px-2 py-0.5 bg-[rgba(139,92,246,0.04)]">
                    {tag}
                  </span>
                ))}
              </div>

              <a href="/tournaments?type=public" className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] no-underline hover:gap-4 transition-all duration-300">
                Browse Public <span>⟶</span>
              </a>
            </div>

            {/* ── PRIVATE TOURNAMENT CARD
                Invite-only, exclusive. Rises from center.
                Lock icon = restricted access. */}
            <div
              className="t-card t-card-center relative flex flex-col p-7 border border-[rgba(139,92,246,0.15)] bg-white/[0.015] hover:border-[rgba(139,92,246,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden"
              style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
            >
              <div className="t-icon w-[52px] h-[52px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-5 bg-[rgba(139,92,246,0.04)]"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
                  <rect x="7" y="13" width="14" height="10" rx="1" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M10 13V10C10 7.79 11.79 6 14 6C16.21 6 18 7.79 18 10V13" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="14" cy="18" r="1.5" fill="#8b5cf6" opacity="0.7" />
                </svg>
              </div>

              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Invite Only</p>
              <h3 className="font-[Cinzel,serif] text-xl font-bold text-white tracking-[0.05em] mb-3">Private</h3>
              <p className="font-[Rajdhani,sans-serif] text-[0.88rem] text-white/45 leading-relaxed mb-5 flex-1">
                Locked behind a code or invitation. Run exclusive scrims, internal leagues, or secret showdowns with handpicked rivals only.
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {["Invite Code", "Custom Rules", "Hidden Bracket", "No Randoms"].map(tag => (
                  <span key={tag} className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.15em] uppercase text-[rgba(139,92,246,0.6)] border border-[rgba(139,92,246,0.15)] px-2 py-0.5 bg-[rgba(139,92,246,0.03)]">
                    {tag}
                  </span>
                ))}
              </div>

              <a href="/tournaments?type=private" className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] no-underline hover:gap-4 transition-all duration-300">
                Host Private <span>⟶</span>
              </a>
            </div>

            {/* ── CLUB TOURNAMENT CARD
                Members-only within a club. Fans in from right.
                Flag icon = guild / team identity. */}
            <div
              className="t-card t-card-right relative flex flex-col p-7 border border-[rgba(139,92,246,0.15)] bg-white/[0.015] hover:border-[rgba(139,92,246,0.4)] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden"
              style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
            >
              <div className="t-icon w-[52px] h-[52px] border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-5 bg-[rgba(139,92,246,0.04)]"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
                  <line x1="8" y1="5" x2="8" y2="24" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 6L20 9L8 15Z" fill="#8b5cf6" opacity="0.3" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                  <line x1="5" y1="24" x2="11" y2="24" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Members Only</p>
              <h3 className="font-[Cinzel,serif] text-xl font-bold text-white tracking-[0.05em] mb-3">Club</h3>
              <p className="font-[Rajdhani,sans-serif] text-[0.88rem] text-white/45 leading-relaxed mb-5 flex-1">
                Run tournaments exclusively within your club. Perfect for internal rankings, tryouts, and forging your team's hierarchy before the big stage.
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {["Club Members", "Internal Ranks", "Tryout Mode", "Team Stats"].map(tag => (
                  <span key={tag} className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.15em] uppercase text-[rgba(139,92,246,0.6)] border border-[rgba(139,92,246,0.15)] px-2 py-0.5 bg-[rgba(139,92,246,0.03)]">
                    {tag}
                  </span>
                ))}
              </div>

              <a href="/clubs" className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.2em] uppercase text-[#8b5cf6] no-underline hover:gap-4 transition-all duration-300">
                Run Club Event <span>⟶</span>
              </a>
            </div>

          </div>
        </TourneyReveal>

        {/* Bottom stat row — 3 quick numbers that reinforce the section message.
            stat-divider adds a faint vertical line between each item via ::after. */}
        <div className="max-w-[700px] mx-auto mt-16 px-8 grid grid-cols-3 gap-0">
          {[
            { value: "3", label: "Tournament Types" },
            { value: "100%", label: "Customisable Rules" },
            { value: "∞", label: "Players Welcome" },
          ].map(({ value, label }) => (
            <div key={label} className="stat-divider relative text-center px-6">
              <p
                className="font-[Cinzel,serif] font-black text-white leading-none"
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                  background: "linear-gradient(135deg, #fff 0%, #a78bfa 60%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}
              >
                {value}
              </p>
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.25em] uppercase text-white/30 mt-1">{label}</p>
            </div>
          ))}
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section className="section-line-bright relative px-8 py-32 bg-[#0a0a1a] text-center overflow-hidden">

        {/* Giant watermark — 3% opacity, purely decorative */}
        <p
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[Cinzel,serif] font-black whitespace-nowrap pointer-events-none select-none tracking-[0.1em] text-[rgba(139,92,246,0.03)]"
          style={{ fontSize: "clamp(5rem, 18vw, 16rem)" }}
        >
          RK
        </p>

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

        <div className="relative z-10 flex gap-4 justify-center flex-wrap">
          <Link
            href="/sign-up"
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