"use client";
import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type Role = "player" | "organiser" | "club" | null;
type Step = "role" | "basic" | "details" | "done";

const GAMES = [
  "BGMI", "Valorant", "Free Fire", "CS2", "Apex Legends",
  "League of Legends", "Dota 2", "Fortnite", "Call of Duty",
  "Rocket League", "Mobile Legends", "Tekken 8", "Street Fighter 6",
  "Clash Royale", "Pokemon Unite", "PUBG PC", "eFootball", "FIFA",
];

const REGIONS = ["North India", "South India", "East India", "West India", "Central India", "Global"];

/* ─────────────────────────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────────────────────────── */

// Styled label + input pair
function RkInput({ label, type = "text", placeholder, value, onChange, min, max }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; min?: string; max?: string;
}) {
  return (
    <div className="mb-4">
      <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        min={min} max={max}
        onChange={e => onChange(e.target.value)}
        className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
        style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
      />
    </div>
  );
}

// Styled select
function RkSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="mb-4">
      <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
        {label}
      </label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="rk-input w-full bg-[#0a0a1a] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 transition-all duration-300 appearance-none cursor-pointer"
        style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
      >
        <option value="" disabled className="text-white/30">Select...</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0a0a1a]">{o}</option>)}
      </select>
    </div>
  );
}

// Multi-select game chips
function GameChips({ label, selected, onChange }: {
  label: string; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (game: string) => {
    onChange(selected.includes(game) ? selected.filter(g => g !== game) : [...selected, game]);
  };
  return (
    <div className="mb-4">
      <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {GAMES.map(game => (
          <button key={game} type="button" onClick={() => toggle(game)}
            className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all duration-200"
            style={{
              clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              borderColor: selected.includes(game) ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.2)",
              background: selected.includes(game) ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.03)",
              color: selected.includes(game) ? "#a78bfa" : "rgba(255,255,255,0.35)",
            }}>
            {game}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step progress bar
function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ["role", "basic", "details", "done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-8">
      {["Role", "Basic Info", "Details"].map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 flex items-center justify-center border text-[0.6rem] font-bold font-[Rajdhani,sans-serif]"
              style={{
                borderColor: i <= idx - 1 ? "#8b5cf6" : i === idx ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.2)",
                background: i < idx ? "rgba(139,92,246,0.3)" : "transparent",
                color: i < idx ? "#a78bfa" : i === idx ? "white" : "rgba(255,255,255,0.25)",
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)"
              }}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase whitespace-nowrap"
              style={{ color: i === idx ? "#a78bfa" : "rgba(255,255,255,0.2)" }}>
              {label}
            </span>
          </div>
          {i < 2 && <div className="flex-1 h-px mb-4" style={{ background: i < idx ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.1)" }} />}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function SignUpPage() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>(null);

  // Shared basic fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");  // for age validation

  // ── PLAYER fields
  const [playerTag, setPlayerTag] = useState("");
  const [favGame, setFavGame] = useState("");
  const [tourneyGames, setTourneyGames] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [device, setDevice] = useState("");
  const [rankLevel, setRankLevel] = useState("");

  // ── ORGANISER fields
  const [arenaName, setArenaName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [hostedGames, setHostedGames] = useState<string[]>([]);
  const [orgRegion, setOrgRegion] = useState("");
  const [experience, setExperience] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // ── CLUB fields
  const [clubName, setClubName] = useState("");
  const [clubTag, setClubTag] = useState("");  // short 3-4 char tag like "RKS"
  const [clubGame, setClubGame] = useState("");
  const [clubRegion, setClubRegion] = useState("");
  const [seats, setSeats] = useState("4");      // 2–8
  const [clubDesc, setClubDesc] = useState("");

  /* ── Age validation helper (must be 16+) */
  const isOldEnough = () => {
    if (!dob) return false;
    const birth = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0);
    return age >= 16;
  };

  /* ── Step navigation */
  const goNext = () => {
    if (step === "role") setStep("basic");
    else if (step === "basic") setStep("details");
    else if (step === "details") setStep("done");
  };
  const goBack = () => {
    if (step === "details") setStep("basic");
    else if (step === "basic") setStep("role");
  };

  /* ── Role labels */
  const roleLabel = role === "player" ? "Warrior" : role === "organiser" ? "Commander" : role === "club" ? "Guild Leader" : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.03; }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes roleHover {
          from { transform: translateY(0); }
          to   { transform: translateY(-4px); }
        }

        .su-fade { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .anim-grid { animation: gridFade 2s ease forwards; }
        .step-in { animation: stepIn 0.4s ease forwards; }

        .rk-input:focus {
          outline: none;
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 20px rgba(139,92,246,0.15), inset 0 0 10px rgba(139,92,246,0.03);
        }

        /* Role card */
        .role-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .role-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,0.6) !important;
          background: rgba(139,92,246,0.07) !important;
        }
        .role-card.selected {
          border-color: rgba(139,92,246,0.9) !important;
          background: rgba(139,92,246,0.1) !important;
          box-shadow: 0 0 30px rgba(139,92,246,0.2);
        }

        .rk-btn-primary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          transition: all 0.3s ease;
        }
        .rk-btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(139,92,246,0.6);
          transform: translateY(-1px);
        }
        .rk-btn-primary:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .rk-btn-ghost {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: all 0.3s ease;
        }
        .rk-btn-ghost:hover {
          background: rgba(139,92,246,0.06);
          border-color: rgba(139,92,246,0.4) !important;
        }

        /* Card corner brackets */
        .rk-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 28px; height: 28px;
          border-top: 1.5px solid rgba(139,92,246,0.5);
          border-left: 1.5px solid rgba(139,92,246,0.5);
        }
        .rk-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 28px; height: 28px;
          border-bottom: 1.5px solid rgba(139,92,246,0.5);
          border-right: 1.5px solid rgba(139,92,246,0.5);
        }

        /* Scrollable details area on small screens */
        .scroll-form { max-height: 60vh; overflow-y: auto; padding-right: 4px; }
        .scroll-form::-webkit-scrollbar { width: 3px; }
        .scroll-form::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }

        /* Age warning */
        .age-warn {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.72rem;
          color: #f87171;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        /* Number input for seats */
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>

      <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4 py-10 relative overflow-hidden">

        {/* Background grid */}
        <div className="anim-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, #050510 70%)" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
        />

        {/* ════════════════════════════════════════════
            STEP 1 — ROLE SELECTION
        ════════════════════════════════════════════ */}
        {step === "role" && (
          <div className="w-full max-w-[680px] su-fade">

            {/* Header */}
            <div className="text-center mb-10">
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-2">
                Join the Arena
              </p>
              <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.05em]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
                Choose Your{" "}
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Path
                </span>
              </h1>
              <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/30 mt-2">
                Who are you on this battlefield?
              </p>
            </div>

            {/* Role cards — 3 side by side + guest below */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              {/* ── PLAYER */}
              <div onClick={() => setRole("player")}
                className={`role-card relative p-6 border border-[rgba(139,92,246,0.2)] bg-white/[0.02] ${role === "player" ? "selected" : ""}`}
                style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
                {/* Sword icon */}
                <div className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <line x1="12" y1="3" x2="12" y2="17" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 6L12 3L15 6" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="8" y1="17" x2="16" y2="17" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="10" y1="20" x2="14" y2="20" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">For the</p>
                <h3 className="font-[Cinzel,serif] text-lg font-bold text-white mb-2">Player</h3>
                <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35 leading-relaxed">
                  Compete in tournaments, earn rankings, build your legacy.
                </p>
                {role === "player" && (
                  <div className="absolute top-2 right-3 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-[#8b5cf6]">✓ Selected</div>
                )}
              </div>

              {/* ── ORGANISER */}
              <div onClick={() => setRole("organiser")}
                className={`role-card relative p-6 border border-[rgba(139,92,246,0.2)] bg-white/[0.02] ${role === "organiser" ? "selected" : ""}`}
                style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
                <div className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M3 17L6 8L10 12L12 5L14 12L18 8L21 17H3Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="3" y1="20" x2="21" y2="20" stroke="#8b5cf6" strokeWidth="1.5" />
                  </svg>
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">For the</p>
                <h3 className="font-[Cinzel,serif] text-lg font-bold text-white mb-2">Organiser</h3>
                <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35 leading-relaxed">
                  Host tournaments, set rules, crown champions.
                </p>
                {role === "organiser" && (
                  <div className="absolute top-2 right-3 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-[#8b5cf6]">✓ Selected</div>
                )}
              </div>

              {/* ── CLUB */}
              <div onClick={() => setRole("club")}
                className={`role-card relative p-6 border border-[rgba(139,92,246,0.2)] bg-white/[0.02] ${role === "club" ? "selected" : ""}`}
                style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
                <div className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M12 2L20 6V12C20 16.5 16.5 20 12 22C7.5 20 4 16.5 4 12V6L12 2Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 12L10.5 14.5L16 9" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">For the</p>
                <h3 className="font-[Cinzel,serif] text-lg font-bold text-white mb-2">Club Leader</h3>
                <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35 leading-relaxed">
                  Form a guild, recruit warriors, dominate together.
                </p>
                {role === "club" && (
                  <div className="absolute top-2 right-3 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-[#8b5cf6]">✓ Selected</div>
                )}
              </div>
            </div>

            {/* Guest option */}
            <Link href="/"
              className="w-full py-3 border border-[rgba(139,92,246,0.15)] bg-white/[0.01] flex items-center justify-center gap-3 hover:bg-[rgba(139,92,246,0.05)] hover:border-[rgba(139,92,246,0.3)] transition-all duration-300 no-underline"
              style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
              <svg viewBox="0 0 20 14" fill="none" className="w-4 h-4 opacity-40">
                <path d="M1 7C1 7 4 1 10 1C16 1 19 7 19 7C19 7 16 13 10 13C4 13 1 7 1 7Z" stroke="white" strokeWidth="1.5" />
                <circle cx="10" cy="7" r="2.5" stroke="white" strokeWidth="1.5" />
              </svg>
              <span className="font-[Rajdhani,sans-serif] text-[0.8rem] tracking-[0.2em] uppercase text-white/30">
                Just Exploring — Enter as Guest
              </span>
            </Link>

            {/* Continue button */}
            <div className="mt-6 flex justify-between items-center">
              <Link href="/login" className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/30 hover:text-[#a78bfa] transition-colors no-underline tracking-wide">
                ← Already have an account?
              </Link>
              <button
                onClick={goNext}
                disabled={!role}
                className="rk-btn-primary px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.85rem] tracking-[0.2em] uppercase text-white"
              >
                Continue ⟶
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 2 — BASIC INFO (same for all roles)
        ════════════════════════════════════════════ */}
        {step === "basic" && (
          <div className="rk-card relative w-full max-w-[500px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.2)] p-8 step-in">

            <StepBar step={step} />

            <div className="mb-6">
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-1">
                Step 1 of 2 · {roleLabel}
              </p>
              <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Basic Information</h2>
            </div>

            <RkInput label="Full Name" placeholder="Your name" value={name} onChange={setName} />
            <RkInput label="Email Address" type="email" placeholder="warrior@arena.com" value={email} onChange={setEmail} />
            <RkInput label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={setPassword} />

            {/* Date of birth — only strictly validated for player (must be 16+) */}
            <div className="mb-4">
              <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                Date of Birth {role === "player" && <span className="text-white/30 normal-case tracking-normal">(must be 16+)</span>}
              </label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)", colorScheme: "dark" }}
              />
              {role === "player" && dob && !isOldEnough() && (
                <p className="age-warn">⚠ You must be at least 16 years old to register as a Player.</p>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={goBack}
                className="rk-btn-ghost px-6 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.85rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)]">
                ← Back
              </button>
              <button
                onClick={goNext}
                disabled={!name || !email || !password || !dob || (role === "player" && !isOldEnough())}
                className="rk-btn-primary px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.85rem] tracking-[0.2em] uppercase text-white"
              >
                Continue ⟶
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 3 — ROLE-SPECIFIC DETAILS
        ════════════════════════════════════════════ */}
        {step === "details" && (
          <div className="rk-card relative w-full max-w-[560px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.2)] p-8 step-in">

            <StepBar step={step} />

            {/* ── PLAYER DETAILS */}
            {role === "player" && (
              <>
                <div className="mb-5">
                  <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-1">Step 2 of 2 · Warrior</p>
                  <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Battle Profile</h2>
                </div>
                <div className="scroll-form">
                  <RkInput label="Player Tag / IGN" placeholder="e.g. ShadowStrike#1337" value={playerTag} onChange={setPlayerTag} />
                  <RkSelect label="Favourite Game" value={favGame} onChange={setFavGame} options={GAMES} />
                  <GameChips label="Games I'll compete in (select all that apply)" selected={tourneyGames} onChange={setTourneyGames} />
                  <RkSelect label="Region" value={region} onChange={setRegion} options={REGIONS} />
                  <RkSelect label="Primary Device" value={device} onChange={setDevice} options={["Mobile", "PC", "Console", "Mobile + PC"]} />
                  <RkSelect label="Skill Level" value={rankLevel} onChange={setRankLevel} options={["Beginner", "Amateur", "Intermediate", "Semi-Pro", "Pro"]} />
                </div>
              </>
            )}

            {/* ── ORGANISER DETAILS */}
            {role === "organiser" && (
              <>
                <div className="mb-5">
                  <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-1">Step 2 of 2 · Commander</p>
                  <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Arena Profile</h2>
                </div>
                <div className="scroll-form">
                  <RkInput label="Arena / Organisation Name" placeholder="e.g. SkyArena Esports" value={arenaName} onChange={setArenaName} />
                  <RkSelect label="Organisation Type" value={orgType} onChange={setOrgType}
                    options={["Independent Organiser", "College / University", "Esports Club", "Gaming Café", "Corporate", "Other"]} />
                  <GameChips label="Games you'll primarily host" selected={hostedGames} onChange={setHostedGames} />
                  <RkSelect label="Primary Region" value={orgRegion} onChange={setOrgRegion} options={REGIONS} />
                  <RkSelect label="Organising Experience" value={experience} onChange={setExperience}
                    options={["First time", "1–2 events", "3–10 events", "10+ events", "Professional"]} />
                  <RkInput label="Contact Phone (optional)" type="tel" placeholder="+91 98765 43210" value={contactPhone} onChange={setContactPhone} />
                </div>
              </>
            )}

            {/* ── CLUB DETAILS */}
            {role === "club" && (
              <>
                <div className="mb-5">
                  <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-1">Step 2 of 2 · Guild Leader</p>
                  <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Club Profile</h2>
                </div>
                <div className="scroll-form">
                  <RkInput label="Club Name" placeholder="e.g. Mystic Phoenix" value={clubName} onChange={setClubName} />
                  <RkInput label="Club Tag (3–4 characters)" placeholder="e.g. MPX" value={clubTag} onChange={v => setClubTag(v.slice(0, 4).toUpperCase())} />
                  <RkSelect label="Primary Game" value={clubGame} onChange={setClubGame} options={GAMES} />
                  <RkSelect label="Club Region" value={clubRegion} onChange={setClubRegion} options={REGIONS} />

                  {/* Seat selector — max 8 */}
                  <div className="mb-4">
                    <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                      Member Seats <span className="text-white/30 normal-case tracking-normal">(max 8 per club)</span>
                    </label>
                    {/* Visual seat picker */}
                    <div className="flex gap-2 flex-wrap">
                      {[2, 3, 4, 5, 6, 7, 8].map(n => (
                        <button key={n} type="button" onClick={() => setSeats(String(n))}
                          className="w-10 h-10 font-[Rajdhani,sans-serif] font-bold text-[0.9rem] border transition-all duration-200"
                          style={{
                            clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                            borderColor: seats === String(n) ? "rgba(139,92,246,0.9)" : "rgba(139,92,246,0.2)",
                            background: seats === String(n) ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.03)",
                            color: seats === String(n) ? "#a78bfa" : "rgba(255,255,255,0.4)",
                          }}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/25 mt-2 tracking-wide">
                      {seats} seat{Number(seats) > 1 ? "s" : ""} selected · You fill seat 1 as the leader
                    </p>
                  </div>

                  {/* Optional club description */}
                  <div className="mb-4">
                    <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                      Club Description <span className="text-white/30 normal-case tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      value={clubDesc}
                      onChange={e => setClubDesc(e.target.value)}
                      placeholder="What drives your club? What games, what goals?"
                      rows={3}
                      className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] px-4 py-3 placeholder:text-white/20 resize-none transition-all duration-300"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={goBack}
                className="rk-btn-ghost px-6 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.85rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)]">
                ← Back
              </button>
              <button
                onClick={goNext}
                className="rk-btn-primary px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.85rem] tracking-[0.2em] uppercase text-white"
              >
                Forge Legend ⟶
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 4 — SUCCESS / DONE
        ════════════════════════════════════════════ */}
        {step === "done" && (
          <div className="rk-card relative w-full max-w-[460px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.3)] p-10 text-center step-in"
            style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}>

            {/* Animated chakra-style success icon */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" style={{ animation: "spin 8s linear infinite", transformOrigin: "50% 50%" }}>
                <circle cx="40" cy="40" r="36" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.5" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 border-2 border-[#8b5cf6] flex items-center justify-center bg-[rgba(139,92,246,0.1)]"
                  style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M5 13L9 17L19 7" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-2">
              Account Created
            </p>
            <h2 className="font-[Cinzel,serif] text-2xl font-black text-white mb-3">
              Welcome, {name || roleLabel}
            </h2>
            <p className="font-[Rajdhani,sans-serif] text-[0.85rem] text-white/40 leading-relaxed mb-8">
              {role === "player" && "Your warrior profile is ready. Find a tournament and start climbing the ranks."}
              {role === "organiser" && "Your arena is set. Host your first tournament and let the battles begin."}
              {role === "club" && `${clubName || "Your club"} has been forged. Recruit your warriors and conquer together.`}
            </p>

            <div className="space-y-3">
              <Link href="/tournaments"
                className="rk-btn-primary w-full py-3 font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.2em] uppercase text-white flex items-center justify-center no-underline">
                Enter the Arena ⟶
              </Link>
              <Link href="/"
                className="block font-[Rajdhani,sans-serif] text-[0.75rem] text-white/25 hover:text-[#a78bfa] transition-colors no-underline mt-2 tracking-wide">
                Go to Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </>
  );
}