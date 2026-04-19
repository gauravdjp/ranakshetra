"use client";
import { useState, useMemo, useEffect } from "react";
import { Club } from "@/types";

/* ─────────────────────────────────────────────────────────────
   RANK COLOR MAP
───────────────────────────────────────────────────────────── */
const RANK_COLOR: Record<string, string> = {
  Beginner: "#6b7280", Amateur: "#06b6d4",
  Intermediate: "#8b5cf6", "Semi-Pro": "#a78bfa", Pro: "#f59e0b",
};

/* ─────────────────────────────────────────────────────────────
   APPLY MODAL
───────────────────────────────────────────────────────────── */
function ApplyModal({ club, onClose }: { club: Club; onClose: () => void }) {
  const memberCount = club.members?.length ?? 0;
  const gameLabel = club.supported_games?.join(", ") ?? "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#050510]/80 backdrop-blur-sm" />

      {/* Modal panel */}
      <div className="modal-panel relative w-full max-w-[460px] bg-[#09091a] border border-[rgba(139,92,246,0.35)] p-8"
        style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
        onClick={e => e.stopPropagation()}>

        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[rgba(139,92,246,0.6)]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[rgba(139,92,246,0.6)]" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">
              Application
            </p>
            <h3 className="font-[Cinzel,serif] font-bold text-white text-xl">
              Apply to [{club.club_tag}]
            </h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/30 mt-0.5">{club.club_name}</p>
          </div>
          <button onClick={onClose}
            className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] text-white/25 hover:text-white/60 transition-colors border border-[rgba(139,92,246,0.15)] px-3 py-1"
            style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
            ESC
          </button>
        </div>

        {/* Club quick info */}
        <div className="flex gap-3 mb-6 p-3 border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.04)]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          {[
            { label: "Game", val: gameLabel },
            { label: "City", val: club.city },
            { label: "Members", val: String(memberCount) },
          ].map(({ label, val }) => (
            <div key={label} className="flex-1 text-center">
              <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/25 mb-0.5">{label}</p>
              <p className="font-[Rajdhani,sans-serif] font-bold text-[0.78rem] text-white/70">{val}</p>
            </div>
          ))}
        </div>

        {/* Info message — application feature coming */}
        <div className="border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] px-4 py-4 mb-6"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <div className="flex items-start gap-3">
            {/* Info icon */}
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-60">
              <circle cx="10" cy="10" r="8" stroke="#8b5cf6" strokeWidth="1.5" />
              <line x1="10" y1="9" x2="10" y2="14" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="6.5" r="0.8" fill="#8b5cf6" />
            </svg>
            <div>
              <p className="font-[Rajdhani,sans-serif] font-bold text-[0.72rem] tracking-[0.1em] text-[#a78bfa] mb-1">
                Applications Opening Soon
              </p>
              <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/35 leading-relaxed">
                Club application forms are being built. Once live, you'll submit your IGN, rank proof,
                and a short message to the club leader. The leader reviews and accepts or declines.
              </p>
            </div>
          </div>
        </div>

        {/* Notify me button — placeholder action */}
        <button
          className="apply-btn w-full py-3 font-[Rajdhani,sans-serif] font-bold text-[0.88rem] tracking-[0.2em] uppercase text-white mb-3"
          onClick={onClose}>
          Notify Me When Open
        </button>
        <button onClick={onClose}
          className="w-full py-2.5 font-[Rajdhani,sans-serif] text-[0.78rem] tracking-[0.15em] uppercase text-white/25 hover:text-white/45 transition-colors border border-[rgba(139,92,246,0.1)] hover:border-[rgba(139,92,246,0.3)]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          Close
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLUB PANEL — the main display unit
   Deliberately NOT a card — it's a faction banner / heraldic panel:
   Tag displayed huge like a coat of arms, stats inline, horizontal layout
───────────────────────────────────────────────────────────── */
function ClubPanel({ club, index, onApply }: {
  club: Club; index: number; onApply: () => void;
}) {
  const memberCount = club.members?.length ?? 0;
  const gameLabel = club.supported_games?.join(", ") ?? "—";

  return (
    <div className="club-panel group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-250"
      style={{ animationDelay: `${index * 0.04}s` }}>

      {/* Left status stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: club.is_verified ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)" }} />

      <div className="pl-6 pr-4 py-5 flex items-center gap-0">

        {/* ── GIANT TAG — the "coat of arms" identifier */}
        <div className="w-[72px] flex-shrink-0 mr-5">
          <div className="font-[Cinzel,serif] font-black leading-none tracking-[0.05em] text-center"
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
              color: "#a78bfa",
              textShadow: "0 0 20px rgba(139,92,246,0.4)",
            }}>
            [{club.club_tag}]
          </div>
        </div>

        {/* ── VERTICAL DIVIDER */}
        <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] mr-5 flex-shrink-0" />

        {/* ── MAIN INFO BLOCK — name + description */}
        <div className="flex-1 min-w-0 mr-6">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-[Cinzel,serif] font-bold text-[0.92rem] tracking-[0.03em] group-hover:text-[#a78bfa] transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.88)" }}>
              {club.club_name}
            </h3>
            {/* Verified badge */}
            {club.is_verified && (
              <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border flex-shrink-0"
                style={{
                  color: "#8b5cf6",
                  borderColor: "rgba(139,92,246,0.44)",
                  background: "rgba(139,92,246,0.11)",
                  clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)"
                }}>
                Verified
              </span>
            )}
          </div>
          {club.club_description && (
            <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/30 leading-relaxed line-clamp-1 mt-0.5">
              {club.club_description}
            </p>
          )}
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/20 mt-1 tracking-wide">
            Led by {club.username} · {club.city}, {club.state}
          </p>
        </div>

        {/* ── STATS ROW — game + city + members */}
        <div className="hidden lg:flex items-center gap-6 mr-6 flex-shrink-0">
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">Game</p>
            <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.78rem] text-white/60">{gameLabel}</p>
          </div>
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">City</p>
            <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.78rem] text-white/60">{club.city}</p>
          </div>
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">Members</p>
            <p className="font-[Cinzel,serif] font-bold text-[0.88rem]" style={{ color: "#a78bfa" }}>{memberCount}</p>
          </div>
        </div>

        {/* ── APPLY BUTTON */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[110px]">
          <button
            onClick={onApply}
            className="apply-btn-sm font-[Rajdhani,sans-serif] font-bold text-[0.62rem] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-200"
            style={{
              clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.4)",
              color: "#a78bfa",
              cursor: "pointer",
            }}>
            Apply →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FILTER CHIP
───────────────────────────────────────────────────────────── */
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.15em] uppercase px-3 py-1.5 transition-all duration-200 whitespace-nowrap"
      style={{
        clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
        borderWidth: "1px", borderStyle: "solid",
        borderColor: active ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.15)",
        background: active ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.03)",
        color: active ? "#a78bfa" : "rgba(255,255,255,0.28)",
      }}>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [applyClub, setApplyClub] = useState<Club | null>(null);

  /* ── Fetch clubs from database */
  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch("/api/clubs");
        if (!res.ok) throw new Error("Failed to fetch clubs");
        const data = await res.json();
        setClubs(data.clubs ?? []);
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs");
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  /* ── filtered list */
  const filtered = useMemo(() => {
    return clubs.filter(c => {
      if (search &&
        !c.club_name.toLowerCase().includes(search.toLowerCase()) &&
        !c.club_tag.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [clubs, search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.025; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes recruitPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spinPulse {
          0%   { transform: rotate(0deg);   opacity: 0.4; }
          50%  { opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.4; }
        }

        .anim-grid { animation: gridFade 2s ease forwards; }

        .page-fade-1 { animation: fadeUp 0.55s ease forwards 0.05s; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.55s ease forwards 0.12s; opacity: 0; }
        .page-fade-3 { animation: fadeUp 0.55s ease forwards 0.2s;  opacity: 0; }

        /* Club panels stagger in */
        .club-panel  { animation: panelIn 0.3s ease forwards; opacity: 0; }

        /* Recruiting badge pulse */
        .recruit-badge { animation: recruitPulse 2s ease-in-out infinite; }

        /* Modal */
        .modal-panel { animation: modalIn 0.25s ease forwards; }

        /* Apply buttons */
        .apply-btn {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          transition: all 0.3s ease;
        }
        .apply-btn:hover {
          box-shadow: 0 0 25px rgba(139,92,246,0.5);
          transform: translateY(-1px);
        }
        .apply-btn-sm:hover:not(:disabled) {
          background: rgba(139,92,246,0.2) !important;
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 14px rgba(139,92,246,0.2);
        }

        /* Search input */
        .rk-search:focus {
          outline: none;
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 14px rgba(139,92,246,0.1);
        }

        /* Section divider */
        .section-divide {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        /* Empty state float */
        @keyframes emptyFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .empty-float { animation: emptyFloat 3s ease-in-out infinite; }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Loading spinner */
        .spin-loader {
          width: 28px; height: 28px;
          border: 2px solid rgba(139,92,246,0.15);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spinPulse 1s linear infinite;
        }
      `}</style>

      {/* Apply modal */}
      {applyClub && <ApplyModal club={applyClub} onClose={() => setApplyClub(null)} />}

      <div className="min-h-screen bg-[#050510] relative overflow-x-hidden">

        {/* Background grid */}
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "70px 70px", zIndex: 0
          }}
        />
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)", zIndex: 0 }} />

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 md:px-8 pt-28 pb-20">

          {/* ════════════════════════════════════════════
              PAGE HEADER
          ════════════════════════════════════════════ */}
          <div className="page-fade-1 mb-2">
            <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.4em] uppercase text-[#8b5cf6]">
              Guild Registry
            </p>
          </div>

          <div className="page-fade-2 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.04em]"
                style={{
                  fontSize: "clamp(1.8rem, 5vw, 3rem)",
                  background: "linear-gradient(135deg, #fff 0%, #a78bfa 40%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                Clubs
              </h1>
              <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/30 mt-1">
                {loading ? "Loading..." : `${clubs.length} guild${clubs.length !== 1 ? "s" : ""} registered`}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="10" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search clubs or tags..."
                className="rk-search bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] pl-9 pr-4 py-2.5 w-60 transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              />
            </div>
          </div>

          <div className="section-divide mb-0" />

          {/* ════════════════════════════════════════════
              COLUMN HEADERS (desktop only)
          ════════════════════════════════════════════ */}
          {!loading && clubs.length > 0 && (
            <div className="hidden lg:flex items-center gap-0 px-6 py-2 border-b border-[rgba(139,92,246,0.1)]">
              <div className="w-[72px] mr-5 flex-shrink-0">
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18">Tag</span>
              </div>
              <div className="w-px mr-5 flex-shrink-0" />
              <div className="flex-1 mr-6">
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18">Club</span>
              </div>
              <div className="flex items-center gap-6 mr-6 flex-shrink-0 w-[220px]">
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[70px] text-center">Game</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[70px] text-center">City</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[40px] text-center">Members</span>
              </div>
              <div className="flex-shrink-0 min-w-[110px] text-right">
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18">Action</span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              LOADING STATE
          ════════════════════════════════════════════ */}
          {loading && (
            <div className="text-center py-24">
              <div className="spin-loader mx-auto mb-4" />
              <p className="font-[Rajdhani,sans-serif] text-white/20 text-sm tracking-wide">
                Loading clubs...
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              ERROR STATE
          ════════════════════════════════════════════ */}
          {!loading && error && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <circle cx="24" cy="24" r="20" stroke="#f87171" strokeWidth="1.5" />
                  <line x1="16" y1="16" x2="32" y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="32" y1="16" x2="16" y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">{error}</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                Please try again later
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              EMPTY STATE — no clubs in database
          ════════════════════════════════════════════ */}
          {!loading && !error && clubs.length === 0 && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Clubs Yet</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                No clubs have been registered yet. Check back soon!
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              EMPTY SEARCH — clubs exist but search returned nothing
          ════════════════════════════════════════════ */}
          {!loading && !error && clubs.length > 0 && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Guilds Found</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                Adjust your search to find clubs
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-6 font-[Rajdhani,sans-serif] text-[0.72rem] tracking-[0.2em] uppercase text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] px-5 py-2 hover:bg-[rgba(139,92,246,0.08)] transition-all duration-200"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                Clear Search
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════
              CLUB LIST
          ════════════════════════════════════════════ */}
          {!loading && !error && filtered.length > 0 && (
            <div>
              {filtered.map((club, ci) => (
                <ClubPanel
                  key={club._id ?? ci}
                  club={club}
                  index={ci}
                  onApply={() => setApplyClub(club)}
                />
              ))}
            </div>
          )}

          {/* ── Bottom summary */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-between px-1">
              <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.2em] uppercase text-white/15">
                Showing {filtered.length} of {clubs.length} clubs
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}