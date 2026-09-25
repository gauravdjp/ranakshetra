"use client";
import { useState, useEffect, useMemo } from "react";
import { Arena } from "@/types";

/* ─────────────────────────────────────────────────────────────
   ARENA PANEL
───────────────────────────────────────────────────────────── */
function ArenaPanel({ arena, index }: { arena: Arena; index: number }) {
  const gamesLabel = arena.supported_games?.join(", ") ?? "—";

  return (
    <div className="arena-panel group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-250"
      style={{ animationDelay: `${index * 0.04}s` }}>

      {/* Left verified stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: arena.is_verified ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)" }} />

      <div className="pl-6 pr-4 py-5 flex items-center gap-0">

        {/* ── Arena icon */}
        <div className="w-[56px] h-[56px] flex-shrink-0 mr-5 flex items-center justify-center border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          {arena.arena_image ? (
            <img src={arena.arena_image} alt={arena.arena_name}
              className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 opacity-30">
              <path d="M3 21V7L12 3L21 7V21H3Z" stroke="#8b5cf6" strokeWidth="1.5" />
              <path d="M9 21V14H15V21" stroke="#8b5cf6" strokeWidth="1.5" />
              <path d="M9 10H15" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* ── VERTICAL DIVIDER */}
        <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] mr-5 flex-shrink-0" />

        {/* ── MAIN INFO BLOCK */}
        <div className="flex-1 min-w-0 mr-6">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-[Cinzel,serif] font-bold text-[0.92rem] tracking-[0.03em] group-hover:text-[#a78bfa] transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.88)" }}>
              {arena.arena_name}
            </h3>
            {arena.is_verified && (
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
          {arena.arena_description && (
            <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/30 leading-relaxed line-clamp-1 mt-0.5">
              {arena.arena_description}
            </p>
          )}
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/20 mt-1 tracking-wide">
            {arena.arena_location}{arena.arena_city ? ` · ${arena.arena_city}` : ""}{arena.arena_state ? `, ${arena.arena_state}` : ""}
            {arena.organizer_name ? ` · by ${arena.organizer_name}` : ""}
          </p>
        </div>

        {/* ── STATS ROW */}
        <div className="hidden lg:flex items-center gap-6 mr-6 flex-shrink-0">
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">Games</p>
            <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.78rem] text-white/60">{gamesLabel}</p>
          </div>
          {arena.capacity && arena.capacity > 0 && (
            <div className="text-center">
              <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">Capacity</p>
              <p className="font-[Cinzel,serif] font-bold text-[0.88rem]" style={{ color: "#a78bfa" }}>{arena.capacity}</p>
            </div>
          )}
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">City</p>
            <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.78rem] text-white/60">{arena.arena_city || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function ArenaPage() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  /* ── Fetch arenas from database */
  useEffect(() => {
    async function fetchArenas() {
      try {
        const res = await fetch("/api/arenas");
        if (!res.ok) throw new Error("Failed to fetch arenas");
        const data = await res.json();
        setArenas(data.arenas ?? []);
      } catch (err) {
        console.error("Error fetching arenas:", err);
        setError("Failed to load arenas");
      } finally {
        setLoading(false);
      }
    }
    fetchArenas();
  }, []);

  /* ── Filtered list */
  const filtered = useMemo(() => {
    return arenas.filter(a => {
      if (search &&
        !a.arena_name.toLowerCase().includes(search.toLowerCase()) &&
        !(a.arena_city ?? "").toLowerCase().includes(search.toLowerCase()) &&
        !(a.arena_location ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [arenas, search]);

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
        @keyframes spinPulse {
          0%   { transform: rotate(0deg);   opacity: 0.4; }
          50%  { opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.4; }
        }
        @keyframes emptyFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .anim-grid { animation: gridFade 2s ease forwards; }
        .page-fade-1 { animation: fadeUp 0.55s ease forwards 0.05s; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.55s ease forwards 0.12s; opacity: 0; }
        .arena-panel { animation: panelIn 0.3s ease forwards; opacity: 0; }
        .empty-float { animation: emptyFloat 3s ease-in-out infinite; }

        .spin-loader {
          width: 28px; height: 28px;
          border: 2px solid rgba(139,92,246,0.15);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spinPulse 1s linear infinite;
        }

        .section-divide {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        .rk-search:focus {
          outline: none;
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 14px rgba(139,92,246,0.1);
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

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
              Battlegrounds
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
                Arenas
              </h1>
              <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/30 mt-1">
                {loading ? "Loading..." : `${arenas.length} arena${arenas.length !== 1 ? "s" : ""} registered`}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="10" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search arenas or locations..."
                className="rk-search bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] pl-9 pr-4 py-2.5 w-60 transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              />
            </div>
          </div>

          <div className="section-divide mb-0" />

          {/* ════════════════════════════════════════════
              COLUMN HEADERS (desktop only)
          ════════════════════════════════════════════ */}
          {!loading && arenas.length > 0 && (
            <div className="hidden lg:flex items-center gap-0 px-6 py-2 border-b border-[rgba(139,92,246,0.1)]">
              <div className="w-[56px] mr-5 flex-shrink-0" />
              <div className="w-px mr-5 flex-shrink-0" />
              <div className="flex-1 mr-6">
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18">Arena</span>
              </div>
              <div className="flex items-center gap-6 mr-6 flex-shrink-0">
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[100px] text-center">Games</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[60px] text-center">Capacity</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[70px] text-center">City</span>
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
                Loading arenas...
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
              EMPTY STATE — no arenas in database
          ════════════════════════════════════════════ */}
          {!loading && !error && arenas.length === 0 && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M6 38V14L24 6L42 14V38H6Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M18 38V26H30V38" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M18 20H30" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Arenas Yet</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                No arenas have been registered yet. Check back soon!
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              EMPTY SEARCH
          ════════════════════════════════════════════ */}
          {!loading && !error && arenas.length > 0 && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M6 38V14L24 6L42 14V38H6Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M18 38V26H30V38" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M18 20H30" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Arenas Found</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                Adjust your search to find arenas
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
              ARENA LIST
          ════════════════════════════════════════════ */}
          {!loading && !error && filtered.length > 0 && (
            <div>
              {filtered.map((arena, i) => (
                <ArenaPanel
                  key={arena._id ?? i}
                  arena={arena}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* ── Bottom summary */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-between px-1">
              <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.2em] uppercase text-white/15">
                Showing {filtered.length} of {arenas.length} arenas
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}