"use client";
import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — replace with DB calls later
───────────────────────────────────────────────────────────── */
const CLUBS = [
  {
    id: "C001", name: "Mystic Phoenix", tag: "MPX", game: "BGMI",
    region: "South India", city: "Bangalore",
    seats: 8, filled: 6, wins: 12, rank: "Semi-Pro",
    status: "recruiting", desc: "South India's most feared BGMI squad. We play to win, not to participate.",
    founded: "2024", leader: "ShadowX",
  },
  {
    id: "C002", name: "Nova Guild", tag: "NVG", game: "Valorant",
    region: "North India", city: "Delhi",
    seats: 6, filled: 6, wins: 8, rank: "Intermediate",
    status: "full", desc: "Tactical Valorant unit focused on ranked climb and monthly tournament runs.",
    founded: "2024", leader: "AceStrike",
  },
  {
    id: "C003", name: "Storm Unit", tag: "SU", game: "Valorant",
    region: "North India", city: "Lucknow",
    seats: 8, filled: 5, wins: 19, rank: "Pro",
    status: "recruiting", desc: "Championship-level Valorant club with 3 national placements. Only for the elite.",
    founded: "2023", leader: "VoidCaller",
  },
  {
    id: "C004", name: "Apex Squad", tag: "APEX", game: "Apex Legends",
    region: "West India", city: "Mumbai",
    seats: 6, filled: 3, wins: 5, rank: "Amateur",
    status: "recruiting", desc: "Rising Apex squad from Mumbai. Grinders welcome — we train daily.",
    founded: "2025", leader: "RiftRunner",
  },
  {
    id: "C005", name: "Zero Hour", tag: "ZH", game: "CS2",
    region: "West India", city: "Pune",
    seats: 8, filled: 7, wins: 22, rank: "Semi-Pro",
    status: "recruiting", desc: "CS2 veterans. We've been in the game since CS:GO. Join if you're serious.",
    founded: "2022", leader: "FragGod",
  },
  {
    id: "C006", name: "Wired FC", tag: "WFC", game: "Mobile Legends",
    region: "East India", city: "Kolkata",
    seats: 5, filled: 4, wins: 7, rank: "Intermediate",
    status: "recruiting", desc: "Kolkata's premier MLBB club. Weekend warriors who show up when it counts.",
    founded: "2024", leader: "LaneKing",
  },
  {
    id: "C007", name: "Iron Wolves", tag: "IW", game: "BGMI",
    region: "Central India", city: "Bhopal",
    seats: 8, filled: 8, wins: 31, rank: "Pro",
    status: "full", desc: "BGMI legends. 3x regional champions. Not recruiting — watching you at tournaments.",
    founded: "2022", leader: "WolfAlpha",
  },
  {
    id: "C008", name: "Byte Force", tag: "BF", game: "Free Fire",
    region: "South India", city: "Chennai",
    seats: 6, filled: 2, wins: 3, rank: "Beginner",
    status: "recruiting", desc: "New club, big ambitions. Free Fire beginners welcome. We grow together.",
    founded: "2025", leader: "SpeedDemon",
  },
  {
    id: "C009", name: "Pixel Crew", tag: "PCR", game: "Dota 2",
    region: "West India", city: "Ahmedabad",
    seats: 5, filled: 5, wins: 14, rank: "Intermediate",
    status: "full", desc: "Dota 2 strategists. We draft, we execute, we dominate.",
    founded: "2023", leader: "MindBender",
  },
  {
    id: "C010", name: "Ghost Recon", tag: "GR", game: "CS2",
    region: "North India", city: "Chandigarh",
    seats: 8, filled: 4, wins: 9, rank: "Amateur",
    status: "recruiting", desc: "CS2 club for players who want to go from casual to competitive. Structured training.",
    founded: "2024", leader: "PhantomX",
  },
  {
    id: "C011", name: "Neon Blades", tag: "NB", game: "Tekken 8",
    region: "South India", city: "Hyderabad",
    seats: 4, filled: 3, wins: 6, rank: "Amateur",
    status: "recruiting", desc: "Tekken 8 FGC club. All character mains welcome. Locals and online.",
    founded: "2025", leader: "IronFist",
  },
  {
    id: "C012", name: "Crimson War", tag: "CW", game: "BGMI",
    region: "East India", city: "Guwahati",
    seats: 8, filled: 5, wins: 11, rank: "Intermediate",
    status: "recruiting", desc: "Northeast India represent. BGMI is life. Join the war.",
    founded: "2024", leader: "NorthStar",
  },
];

const REGIONS = ["All Regions", "North India", "South India", "East India", "West India", "Central India"];
const GAMES   = ["All Games", "BGMI", "Valorant", "Free Fire", "CS2", "Apex Legends", "Dota 2", "Mobile Legends", "Tekken 8"];
const RANKS   = ["All Ranks", "Beginner", "Amateur", "Intermediate", "Semi-Pro", "Pro"];

/* rank color */
const RANK_COLOR: Record<string, string> = {
  Beginner: "#6b7280", Amateur: "#06b6d4",
  Intermediate: "#8b5cf6", "Semi-Pro": "#a78bfa", Pro: "#f59e0b",
};

/* ─────────────────────────────────────────────────────────────
   APPLY MODAL
───────────────────────────────────────────────────────────── */
function ApplyModal({ club, onClose }: { club: typeof CLUBS[0]; onClose: () => void }) {
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
              Apply to [{club.tag}]
            </h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/30 mt-0.5">{club.name}</p>
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
            { label: "Game", val: club.game },
            { label: "Region", val: club.city },
            { label: "Open Seats", val: String(club.seats - club.filled) },
            { label: "Rank", val: club.rank },
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
  club: typeof CLUBS[0]; index: number; onApply: () => void;
}) {
  const open = club.seats - club.filled;
  const pct  = Math.round((club.filled / club.seats) * 100);
  const full = club.status === "full";

  return (
    <div className="club-panel group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-250"
      style={{ animationDelay: `${index * 0.04}s` }}>

      {/* Left recruitment status stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: full ? "rgba(248,113,113,0.5)" : "rgba(139,92,246,0.6)" }} />

      <div className="pl-6 pr-4 py-5 flex items-center gap-0">

        {/* ── GIANT TAG — the "coat of arms" identifier */}
        <div className="w-[72px] flex-shrink-0 mr-5">
          <div className="font-[Cinzel,serif] font-black leading-none tracking-[0.05em] text-center"
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
              color: full ? "rgba(255,255,255,0.2)" : "#a78bfa",
              textShadow: full ? "none" : "0 0 20px rgba(139,92,246,0.4)",
            }}>
            [{club.tag}]
          </div>
        </div>

        {/* ── VERTICAL DIVIDER */}
        <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] mr-5 flex-shrink-0" />

        {/* ── MAIN INFO BLOCK — name + description */}
        <div className="flex-1 min-w-0 mr-6">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-[Cinzel,serif] font-bold text-[0.92rem] tracking-[0.03em] group-hover:text-[#a78bfa] transition-colors duration-200"
              style={{ color: full ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.88)" }}>
              {club.name}
            </h3>
            {/* Rank badge */}
            <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border flex-shrink-0"
              style={{
                color: RANK_COLOR[club.rank] ?? "#8b5cf6",
                borderColor: `${RANK_COLOR[club.rank]}44` ?? "rgba(139,92,246,0.3)",
                background: `${RANK_COLOR[club.rank]}11` ?? "rgba(139,92,246,0.06)",
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)"
              }}>
              {club.rank}
            </span>
          </div>
          <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/30 leading-relaxed line-clamp-1 mt-0.5">
            {club.desc}
          </p>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/20 mt-1 tracking-wide">
            Led by {club.leader} · Est. {club.founded}
          </p>
        </div>

        {/* ── STATS ROW — game + city + wins */}
        <div className="hidden lg:flex items-center gap-6 mr-6 flex-shrink-0">
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">Game</p>
            <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.78rem] text-white/60">{club.game}</p>
          </div>
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">City</p>
            <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.78rem] text-white/60">{club.city}</p>
          </div>
          <div className="text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/20 mb-0.5">Wins</p>
            <p className="font-[Cinzel,serif] font-bold text-[0.88rem]" style={{ color: "#a78bfa" }}>{club.wins}</p>
          </div>
        </div>

        {/* ── SEAT FILL METER + APPLY */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[110px]">
          {/* Seat bar */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-white/20">Seats</span>
              <span className="font-[Rajdhani,sans-serif] text-[0.62rem]"
                style={{ color: full ? "#f87171" : open <= 1 ? "#f59e0b" : "rgba(255,255,255,0.4)" }}>
                {full ? "FULL" : `${open} open`}
              </span>
            </div>
            {/* Mini fill bar */}
            <div className="h-1 w-full bg-[rgba(255,255,255,0.05)]"
              style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
              <div className="h-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: full ? "#f87171" : pct > 80 ? "#f59e0b" : "#8b5cf6"
                }} />
            </div>
            <p className="font-[Rajdhani,sans-serif] text-[0.48rem] text-white/15 mt-0.5">{club.filled}/{club.seats}</p>
          </div>

          {/* Apply button */}
          <button
            onClick={onApply}
            disabled={full}
            className="apply-btn-sm font-[Rajdhani,sans-serif] font-bold text-[0.62rem] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-200"
            style={{
              clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              background: full ? "rgba(255,255,255,0.03)" : "rgba(139,92,246,0.12)",
              border: `1px solid ${full ? "rgba(255,255,255,0.06)" : "rgba(139,92,246,0.4)"}`,
              color: full ? "rgba(255,255,255,0.15)" : "#a78bfa",
              cursor: full ? "not-allowed" : "pointer",
            }}>
            {full ? "FULL" : "Apply →"}
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
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [gameFilter,   setGameFilter]   = useState("All Games");
  const [rankFilter,   setRankFilter]   = useState("All Ranks");
  const [statusFilter, setStatusFilter] = useState("All");   // All / Recruiting / Full
  const [search,       setSearch]       = useState("");
  const [applyClub,    setApplyClub]    = useState<typeof CLUBS[0] | null>(null);

  /* ── filtered list */
  const filtered = useMemo(() => {
    return CLUBS.filter(c => {
      if (regionFilter !== "All Regions" && c.region !== regionFilter) return false;
      if (gameFilter   !== "All Games"   && c.game   !== gameFilter)   return false;
      if (rankFilter   !== "All Ranks"   && c.rank   !== rankFilter)   return false;
      if (statusFilter === "Recruiting"  && c.status !== "recruiting") return false;
      if (statusFilter === "Full"        && c.status !== "full")       return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.tag.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [regionFilter, gameFilter, rankFilter, statusFilter, search]);

  /* ── group by region for section headers */
  const grouped = useMemo(() => {
    const map: Record<string, typeof CLUBS> = {};
    filtered.forEach(c => {
      if (!map[c.region]) map[c.region] = [];
      map[c.region].push(c);
    });
    return map;
  }, [filtered]);

  const recruitingCount = CLUBS.filter(c => c.status === "recruiting").length;

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
        @keyframes regionIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes recruitPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .anim-grid { animation: gridFade 2s ease forwards; }

        .page-fade-1 { animation: fadeUp 0.55s ease forwards 0.05s; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.55s ease forwards 0.12s; opacity: 0; }
        .page-fade-3 { animation: fadeUp 0.55s ease forwards 0.2s;  opacity: 0; }

        /* Club panels stagger in */
        .club-panel  { animation: panelIn 0.3s ease forwards; opacity: 0; }

        /* Region group header */
        .region-header { animation: regionIn 0.4s ease forwards; opacity: 0; }

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

        /* Horizontal filter scroll */
        .filter-scroll { overflow-x: auto; }
        .filter-scroll::-webkit-scrollbar { height: 2px; }
        .filter-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); }

        /* Section divider */
        .section-divide {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        /* Region group line */
        .region-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(139,92,246,0.25), transparent);
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
                {CLUBS.length} guilds registered ·{" "}
                <span className="recruit-badge" style={{ color: "#a78bfa" }}>
                  {recruitingCount} recruiting now
                </span>
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

          {/* ════════════════════════════════════════════
              FILTER BAR
          ════════════════════════════════════════════ */}
          <div className="page-fade-3 mb-6 space-y-3">

            {/* Status + Rank row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.28em] uppercase text-white/18 mr-1">Status</span>
              {["All", "Recruiting", "Full"].map(s => (
                <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
              <div className="w-px h-4 bg-[rgba(139,92,246,0.15)] mx-2" />
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.28em] uppercase text-white/18 mr-1">Rank</span>
              {RANKS.map(r => (
                <FilterChip key={r} label={r} active={rankFilter === r} onClick={() => setRankFilter(r)} />
              ))}
            </div>

            {/* Game + Region — scrollable */}
            <div className="filter-scroll pb-1">
              <div className="flex items-center gap-2 min-w-max">
                <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.28em] uppercase text-white/18 mr-1">Game</span>
                {GAMES.map(g => (
                  <FilterChip key={g} label={g} active={gameFilter === g} onClick={() => setGameFilter(g)} />
                ))}
                <div className="w-px h-4 bg-[rgba(139,92,246,0.15)] mx-2" />
                <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.28em] uppercase text-white/18 mr-1">Region</span>
                {REGIONS.map(r => (
                  <FilterChip key={r} label={r} active={regionFilter === r} onClick={() => setRegionFilter(r)} />
                ))}
              </div>
            </div>
          </div>

          <div className="section-divide mb-0" />

          {/* ════════════════════════════════════════════
              COLUMN HEADERS (desktop only)
          ════════════════════════════════════════════ */}
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
              <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18 w-[40px] text-center">Wins</span>
            </div>
            <div className="flex-shrink-0 min-w-[110px] text-right">
              <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase text-white/18">Seats</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              CLUB LIST — grouped by region
          ════════════════════════════════════════════ */}
          {Object.keys(grouped).length === 0 ? (

            /* Empty state */
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Guilds Found</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                Adjust your filters to find active clubs
              </p>
              <button
                onClick={() => { setRegionFilter("All Regions"); setGameFilter("All Games"); setRankFilter("All Ranks"); setStatusFilter("All"); setSearch(""); }}
                className="mt-6 font-[Rajdhani,sans-serif] text-[0.72rem] tracking-[0.2em] uppercase text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] px-5 py-2 hover:bg-[rgba(139,92,246,0.08)] transition-all duration-200"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                Clear Filters
              </button>
            </div>

          ) : (
            <div>
              {Object.entries(grouped).map(([region, clubs], gi) => (
                <div key={region} className="mb-2" style={{ animationDelay: `${gi * 0.08}s` }}>

                  {/* ── REGION GROUP HEADER
                      Acts like a section divider — war-map territory label */}
                  <div className="region-header flex items-center gap-3 px-2 py-3 mt-4"
                    style={{ animationDelay: `${gi * 0.08}s` }}>
                    {/* Diamond marker */}
                    <div className="w-2 h-2 rotate-45 flex-shrink-0"
                      style={{ background: "rgba(139,92,246,0.5)", boxShadow: "0 0 6px rgba(139,92,246,0.4)" }} />
                    <span className="font-[Rajdhani,sans-serif] font-bold text-[0.65rem] tracking-[0.35em] uppercase text-[#8b5cf6] flex-shrink-0">
                      {region}
                    </span>
                    {/* Count badge */}
                    <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.15em] text-white/25 flex-shrink-0">
                      {clubs.length} guild{clubs.length > 1 ? "s" : ""}
                    </span>
                    {/* Extending line */}
                    <div className="region-line" />
                  </div>

                  {/* ── CLUB PANELS for this region */}
                  {clubs.map((club, ci) => (
                    <ClubPanel
                      key={club.id}
                      club={club}
                      index={gi * 10 + ci}
                      onApply={() => setApplyClub(club)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── Bottom summary */}
          {Object.keys(grouped).length > 0 && (
            <div className="mt-8 flex items-center justify-between px-1">
              <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.2em] uppercase text-white/15">
                Showing {filtered.length} of {CLUBS.length} clubs
              </p>
              <div className="flex items-center gap-5">
                {[
                  { color: "#8b5cf6", label: "Recruiting" },
                  { color: "#f87171", label: "Full" },
                ].map(({ color, label }) => (
                  <span key={label} className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/15 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {label}
                  </span>
                ))}
                {/* Rank legend */}
                {Object.entries(RANK_COLOR).map(([rank, color]) => (
                  <span key={rank} className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/15 items-center gap-1.5 hidden xl:flex">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    {rank}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}