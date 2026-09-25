"use client";

import type { Role } from "@/lib/signup-schemas";

const roles = [
  {
    id: "player" as Role,
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <path d="M12 10v4M10 12h4"/>
        <circle cx="17" cy="10" r="1" fill="currentColor" stroke="none"/>
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "Player",
    description: "Compete in tournaments, build your legacy, and connect with elite teams.",
  },
  {
    id: "organiser" as Role,
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M8 14h2M8 17h2M14 14h2"/>
      </svg>
    ),
    title: "Organiser",
    description: "Host professional tournaments, manage brackets, and scale your events.",
  },
  {
    id: "club_leader" as Role,
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="7" r="3"/>
        <circle cx="17" cy="9" r="2"/>
        <path d="M2 21v-2a5 5 0 0 1 10 0v2"/>
        <path d="M17 21v-1.5a3.5 3.5 0 0 0-2-3.2"/>
      </svg>
    ),
    title: "Club Leader",
    description: "Recruit top talent, manage club rosters, and lead your squad to victory.",
  },
];

interface StepOneProps {
  selectedRole: Role | null;
  onSelect: (role: Role) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepOne({ selectedRole, onSelect, onNext, onBack }: StepOneProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-12 animate-[fadeUp_0.4s_ease_both]">

      {/* Header */}
      <div className="text-center mb-10">
        <span className="block font-dm-mono text-[0.7rem] tracking-[0.15em] text-violet-400 mb-3 uppercase">Step 1 of 3</span>
        <h1 className="font-outfit text-4xl sm:text-5xl font-bold text-white tracking-wide mb-3">Choose your identity</h1>
        <p className="text-sm text-white/40 leading-relaxed max-w-sm mx-auto">
          Define your role within Ranakshetra to customize your experience and access specific tools.
        </p>
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-12">
        {roles.map((role) => {
          const selected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role.id)}
              aria-pressed={selected}
              className={`
                relative flex flex-col items-center gap-3 px-5 py-8 rounded-xl border text-center
                transition-all duration-200 cursor-pointer
                ${selected
                  ? "border-violet-500 bg-violet-500/8 shadow-[0_0_0_1px_rgba(124,111,255,0.5),0_8px_32px_rgba(124,111,255,0.2)]"
                  : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-lg"
                }
              `}
            >
              {/* Check badge */}
              {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}

              <span className={`transition-colors ${selected ? "text-violet-400" : "text-white/40"}`}>
                {role.icon}
              </span>
              <span className="font-outfit text-xl font-semibold text-white tracking-wide">{role.title}</span>
              <span className="text-xs text-white/35 leading-relaxed">{role.description}</span>
              {selected && (
                <span className="font-dm-mono text-[0.6rem] tracking-[0.15em] text-violet-400 mt-1 uppercase">Selected</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center w-full">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 border border-white/10 rounded-lg font-dm-mono text-xs tracking-widest text-white/40 hover:border-white/25 hover:text-white/70 transition-all uppercase"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedRole}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#0d0d0f] rounded-lg font-dm-mono text-xs font-bold tracking-widest uppercase transition-all hover:bg-violet-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0d0d0f]"
        >
          Next Step
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}