"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — replace with DB calls later
   Each tournament has all filterable fields already on the object.
───────────────────────────────────────────────────────────── */
const TOURNAMENTS = [
  {
    id: "T001", name: "BGMI Open Assault", game: "BGMI", type: "public",
    region: "South India", rank: "All Ranks", status: "live",
    prize: "₹15,000", slots: 64, filled: 58, date: "2026-03-14",
    organiser: "SkyArena Esports", mode: "Squad",
  },
  {
    id: "T002", name: "Valorant Ranked Clash", game: "Valorant", type: "public",
    region: "North India", rank: "Intermediate+", status: "upcoming",
    prize: "₹25,000", slots: 32, filled: 21, date: "2026-03-18",
    organiser: "ProLeague India", mode: "5v5",
  },
  {
    id: "T003", name: "Free Fire City Cup", game: "Free Fire", type: "public",
    region: "West India", rank: "Beginner", status: "upcoming",
    prize: "₹8,000", slots: 48, filled: 48, date: "2026-03-16",
    organiser: "Mumbai Esports Hub", mode: "Squad",
  },
  {
    id: "T004", name: "Mystic Phoenix Intra-Club", game: "BGMI", type: "club",
    region: "South India", rank: "Members Only", status: "live",
    prize: "Trophy", slots: 8, filled: 6, date: "2026-03-14",
    organiser: "Mystic Phoenix [MPX]", mode: "Solo",
  },
  {
    id: "T005", name: "CS2 Pro Invitational", game: "CS2", type: "public",
    region: "Global", rank: "Semi-Pro+", status: "upcoming",
    prize: "₹1,00,000", slots: 16, filled: 9, date: "2026-03-25",
    organiser: "RK Premier League", mode: "5v5",
  },
  {
    id: "T006", name: "Storm Unit Guild Wars", game: "Valorant", type: "club",
    region: "North India", rank: "Members Only", status: "upcoming",
    prize: "Glory Points", slots: 8, filled: 5, date: "2026-03-20",
    organiser: "Storm Unit [SU]", mode: "5v5",
  },
  {
    id: "T007", name: "Apex Legends Open Circuit", game: "Apex Legends", type: "public",
    region: "East India", rank: "All Ranks", status: "upcoming",
    prize: "₹12,000", slots: 60, filled: 34, date: "2026-03-22",
    organiser: "East Zone Gaming", mode: "Trio",
  },
  {
    id: "T008", name: "Mobile Legends Champions", game: "Mobile Legends", type: "public",
    region: "West India", rank: "Intermediate+", status: "upcoming",
    prize: "₹20,000", slots: 32, filled: 28, date: "2026-03-19",
    organiser: "GameOn Studios", mode: "5v5",
  },
  {
    id: "T009", name: "Tekken 8 Iron Fist", game: "Tekken 8", type: "public",
    region: "Central India", rank: "All Ranks", status: "upcoming",
    prize: "₹6,000", slots: 32, filled: 18, date: "2026-03-21",
    organiser: "Fight Club India", mode: "1v1",
  },
  {
    id: "T010", name: "Apex Squad [APEX] Tryouts", game: "Apex Legends", type: "club",
    region: "West India", rank: "Members Only", status: "upcoming",
    prize: "Membership Upgrade", slots: 8, filled: 3, date: "2026-03-23",
    organiser: "Apex Squad [APEX]", mode: "Trio",
  },
  {
    id: "T011", name: "Dota 2 Ranked Ladder", game: "Dota 2", type: "public",
    region: "Global", rank: "Pro", status: "upcoming",
    prize: "₹50,000", slots: 16, filled: 12, date: "2026-03-28",
    organiser: "RK Premier League", mode: "5v5",
  },
  {
    id: "T012", name: "Free Fire Rookie Rush", game: "Free Fire", type: "public",
    region: "South India", rank: "Beginner", status: "live",
    prize: "₹3,000", slots: 48, filled: 45, date: "2026-03-14",
    organiser: "Chennai Gamers", mode: "Squad",
  },
];

const GAMES = ["All Games", "BGMI", "Valorant", "Free Fire", "CS2", "Apex Legends", "Dota 2", "Mobile Legends", "Tekken 8"];
const REGIONS = ["All Regions", "North India", "South India", "East India", "West India", "Central India", "Global"];
const RANKS = ["All Ranks", "Beginner", "Intermediate+", "Semi-Pro+", "Pro", "Members Only"];
const TYPES = ["All", "public", "club"];
const SORTS = ["Date ↑", "Prize ↓", "Slots Available"];

/* ── Status config */
const STATUS = {
  live:     { label: "LIVE",     color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)" },
  upcoming: { label: "UPCOMING", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)" },
  full:     { label: "FULL",     color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)" },
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function slotsLeft(t: typeof TOURNAMENTS[0]) { return t.slots - t.filled; }
function fillPct(t: typeof TOURNAMENTS[0]) { return Math.round((t.filled / t.slots) * 100); }
function isFull(t: typeof TOURNAMENTS[0]) { return t.filled >= t.slots; }
function statusKey(t: typeof TOURNAMENTS[0]): keyof typeof STATUS {
  if (isFull(t)) return "full";
  return t.status as "live" | "upcoming";
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENT ROW — the main list item
   Deliberately NOT a card: horizontal row, table-like, military roster feel
───────────────────────────────────────────────────────────── */
function TournamentRow({ t, index }: { t: typeof TOURNAMENTS[0]; index: number }) {
  const sk = statusKey(t);
  const st = STATUS[sk];
  const pct = fillPct(t);
  const left = slotsLeft(t);

  return (
    <div className="tourney-row group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.04)] transition-all duration-200 cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}>

      {/* Scanline that slides across the row on hover */}
      <div className="scanline-hover absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.06) 50%, transparent 100%)" }} />

      {/* Left accent bar — colored by status */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 group-hover:w-[4px]"
        style={{ background: st.color, opacity: sk === "live" ? 1 : 0.4 }} />

      <div className="pl-5 pr-4 py-4 grid items-center gap-3"
        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto" }}>

        {/* ── COL 1: Name + organiser */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {/* Tournament ID tag */}
            <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] text-white/20 flex-shrink-0">
              {t.id}
            </span>
            {/* Type badge */}
            <span className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.25em] uppercase px-1.5 py-0.5 flex-shrink-0"
              style={{
                color: t.type === "club" ? "#06b6d4" : "#a78bfa",
                border: `1px solid ${t.type === "club" ? "rgba(6,182,212,0.3)" : "rgba(167,139,250,0.25)"}`,
                background: t.type === "club" ? "rgba(6,182,212,0.06)" : "rgba(139,92,246,0.06)",
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)"
              }}>
              {t.type === "club" ? "CLUB" : "PUBLIC"}
            </span>
          </div>
          <p className="font-[Cinzel,serif] font-bold text-white text-[0.88rem] tracking-[0.03em] truncate group-hover:text-[#a78bfa] transition-colors duration-200">
            {t.name}
          </p>
          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/25 truncate mt-0.5">
            by {t.organiser}
          </p>
        </div>

        {/* ── COL 2: Game */}
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] uppercase text-white/25 mb-0.5">Game</p>
          <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.8rem] text-white/75">{t.game}</p>
        </div>

        {/* ── COL 3: Region */}
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] uppercase text-white/25 mb-0.5">Region</p>
          <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.8rem] text-white/75">{t.region}</p>
        </div>

        {/* ── COL 4: Rank */}
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] uppercase text-white/25 mb-0.5">Rank</p>
          <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.8rem] text-white/75">{t.rank}</p>
        </div>

        {/* ── COL 5: Prize */}
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] uppercase text-white/25 mb-0.5">Prize</p>
          <p className="font-[Rajdhani,sans-serif] font-bold text-[0.85rem]"
            style={{ color: t.prize.startsWith("₹") ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>
            {t.prize}
          </p>
        </div>

        {/* ── COL 6: Slots + fill bar */}
        <div className="min-w-[80px]">
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] uppercase text-white/25 mb-1">Slots</p>
          {/* Mini fill bar */}
          <div className="h-1 w-full bg-[rgba(255,255,255,0.06)] mb-1" style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
            <div className="h-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "#f87171" : pct > 75 ? "#f59e0b" : "#8b5cf6"
              }} />
          </div>
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem]"
            style={{ color: left === 0 ? "#f87171" : left <= 5 ? "#f59e0b" : "rgba(255,255,255,0.45)" }}>
            {left === 0 ? "FULL" : `${left} left`}
          </p>
        </div>

        {/* ── COL 7: Status + CTA */}
        <div className="flex flex-col items-end gap-2 min-w-[90px]">
          {/* Status pill */}
          <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.25em] uppercase px-2 py-0.5 flex items-center gap-1"
            style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
            {sk === "live" && <span className="live-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.color }} />}
            {st.label}
          </span>
          {/* Register button */}
          <button
            disabled={isFull(t)}
            className="font-[Rajdhani,sans-serif] font-bold text-[0.62rem] tracking-[0.2em] uppercase px-3 py-1.5 transition-all duration-200"
            style={{
              clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              background: isFull(t) ? "rgba(255,255,255,0.04)" : "rgba(139,92,246,0.15)",
              border: `1px solid ${isFull(t) ? "rgba(255,255,255,0.08)" : "rgba(139,92,246,0.4)"}`,
              color: isFull(t) ? "rgba(255,255,255,0.2)" : "#a78bfa",
              cursor: isFull(t) ? "not-allowed" : "pointer",
            }}
          >
            {isFull(t) ? "FULL" : "JOIN →"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FILTER CHIP — small clickable pill
───────────────────────────────────────────────────────────── */
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.15em] uppercase px-3 py-1.5 transition-all duration-200 whitespace-nowrap"
      style={{
        clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
        borderWidth: "1px", borderStyle: "solid",
        borderColor: active ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.15)",
        background: active ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.03)",
        color: active ? "#a78bfa" : "rgba(255,255,255,0.3)",
      }}>
      {label === "public" ? "Public" : label === "club" ? "Club" : label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function TournamentsPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [gameFilter, setGameFilter] = useState("All Games");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [rankFilter, setRankFilter] = useState("All Ranks");
  const [sortBy, setSortBy] = useState("Date ↑");
  const [search, setSearch] = useState("");

  /* ── Derived filtered + sorted list */
  const filtered = useMemo(() => {
    let list = TOURNAMENTS.filter(t => {
      if (typeFilter !== "All" && t.type !== typeFilter) return false;
      if (gameFilter !== "All Games" && t.game !== gameFilter) return false;
      if (regionFilter !== "All Regions" && t.region !== regionFilter) return false;
      if (rankFilter !== "All Ranks" && t.rank !== rankFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
          !t.game.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Sort
    if (sortBy === "Date ↑") list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    if (sortBy === "Prize ↓") list = [...list].sort((a, b) => {
      const pa = parseInt(a.prize.replace(/[^\d]/g, "")) || 0;
      const pb = parseInt(b.prize.replace(/[^\d]/g, "")) || 0;
      return pb - pa;
    });
    if (sortBy === "Slots Available") list = [...list].sort((a, b) => slotsLeft(b) - slotsLeft(a));

    // Live always first
    return [...list.filter(t => t.status === "live"), ...list.filter(t => t.status !== "live")];
  }, [typeFilter, gameFilter, regionFilter, rankFilter, sortBy, search]);

  const liveCount = TOURNAMENTS.filter(t => t.status === "live").length;

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
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes headerGlow {
          0%, 100% { box-shadow: 0 1px 0 rgba(139,92,246,0.2); }
          50%       { box-shadow: 0 1px 0 rgba(139,92,246,0.5), 0 0 20px rgba(139,92,246,0.08); }
        }

        .anim-grid { animation: gridFade 2s ease forwards; }
        .page-fade { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.6s ease forwards 0.1s; opacity: 0; }
        .page-fade-3 { animation: fadeUp 0.6s ease forwards 0.2s; opacity: 0; }

        /* Each row fades in staggered */
        .tourney-row { animation: rowIn 0.3s ease forwards; opacity: 0; }

        /* Pulsing live dot */
        .live-dot { animation: livePulse 1.4s ease-in-out infinite; }

        /* Table header line */
        .table-header { animation: headerGlow 3s ease-in-out infinite; }

        /* Search input */
        .rk-search:focus {
          outline: none;
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 16px rgba(139,92,246,0.12);
        }

        /* Scrollbar for table */
        .tourney-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
        .tourney-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); }

        /* Section divider line */
        .section-divide {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent);
        }

        /* Live banner pulse */
        @keyframes bannerPulse {
          0%, 100% { border-color: rgba(34,197,94,0.3); }
          50%       { border-color: rgba(34,197,94,0.7); box-shadow: 0 0 20px rgba(34,197,94,0.1); }
        }
        .live-banner { animation: bannerPulse 2s ease-in-out infinite; }

        /* Sort select */
        .rk-select {
          background: rgba(139,92,246,0.04);
          border: 1px solid rgba(139,92,246,0.18);
          color: rgba(255,255,255,0.6);
          appearance: none;
          cursor: pointer;
        }
        .rk-select:focus { outline: none; border-color: rgba(139,92,246,0.5); }

        /* Table col header */
        .col-head {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* Empty state */
        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .empty-icon { animation: emptyFloat 3s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-[#050510] relative overflow-x-hidden">

        {/* ── Background grid */}
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "70px 70px", zIndex: 0
          }}
        />
        <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)", zIndex: 0 }} />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pt-28 pb-20">

          {/* ════════════════════════════════════════════
              PAGE HEADER
          ════════════════════════════════════════════ */}
          <div className="page-fade mb-2">
            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6]">
              Operations Board
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
                Tournaments
              </h1>
              <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/30 mt-1">
                {filtered.length} active operations · {liveCount} live now
              </p>
            </div>
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="10" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tournaments..."
                className="rk-search bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] pl-9 pr-4 py-2.5 w-64 transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              />
            </div>
          </div>

          {/* ── LIVE BANNER — only if there are live tournaments */}
          {liveCount > 0 && (
            <div className="live-banner page-fade-3 border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.04)] px-4 py-2.5 mb-6 flex items-center gap-3"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
              <span className="live-dot w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
              <p className="font-[Rajdhani,sans-serif] text-[0.72rem] tracking-[0.2em] uppercase text-[#22c55e]">
                {liveCount} tournament{liveCount > 1 ? "s" : ""} live right now — Join before slots close
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              FILTER BAR
          ════════════════════════════════════════════ */}
          <div className="page-fade-3 mb-6">
            {/* Type filter row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/20 mr-1">Type</span>
              {TYPES.map(t => (
                <FilterChip key={t} label={t === "All" ? "All" : t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
              ))}
              <div className="w-px h-5 bg-[rgba(139,92,246,0.15)] mx-2" />
              <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/20 mr-1">Sort</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="rk-select font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.1em] px-3 py-1.5"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                {SORTS.map(s => <option key={s} value={s} className="bg-[#0a0a1a]">{s}</option>)}
              </select>
            </div>

            {/* Game + Region + Rank filters — scrollable on mobile */}
            <div className="overflow-x-auto tourney-scroll pb-1">
              <div className="flex items-center gap-2 min-w-max">
                <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/20 mr-1">Game</span>
                {GAMES.map(g => (
                  <FilterChip key={g} label={g} active={gameFilter === g} onClick={() => setGameFilter(g)} />
                ))}
                <div className="w-px h-5 bg-[rgba(139,92,246,0.15)] mx-2" />
                <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/20 mr-1">Region</span>
                {REGIONS.map(r => (
                  <FilterChip key={r} label={r} active={regionFilter === r} onClick={() => setRegionFilter(r)} />
                ))}
                <div className="w-px h-5 bg-[rgba(139,92,246,0.15)] mx-2" />
                <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/20 mr-1">Rank</span>
                {RANKS.map(r => (
                  <FilterChip key={r} label={r} active={rankFilter === r} onClick={() => setRankFilter(r)} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Thin divider */}
          <div className="section-divide mb-0" />

          {/* ════════════════════════════════════════════
              TABLE HEADER ROW
          ════════════════════════════════════════════ */}
          <div className="table-header hidden md:grid items-center gap-3 px-5 py-2 border-b border-[rgba(139,92,246,0.12)]"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr auto" }}>
            <span className="col-head pl-3">Tournament</span>
            <span className="col-head">Game</span>
            <span className="col-head">Region</span>
            <span className="col-head">Rank</span>
            <span className="col-head">Prize</span>
            <span className="col-head">Slots</span>
            <span className="col-head pr-2">Status</span>
          </div>

          {/* ════════════════════════════════════════════
              TOURNAMENT ROWS
          ════════════════════════════════════════════ */}
          <div className="tourney-scroll overflow-x-auto">
            {filtered.length === 0 ? (
              /* Empty state */
              <div className="text-center py-24">
                <div className="empty-icon mb-4 inline-block">
                  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-20">
                    <circle cx="24" cy="24" r="20" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 6" />
                    <line x1="14" y1="24" x2="34" y2="24" stroke="#8b5cf6" strokeWidth="1.5" />
                    <line x1="24" y1="14" x2="24" y2="34" stroke="#8b5cf6" strokeWidth="1.5" />
                  </svg>
                </div>
                <p className="font-[Cinzel,serif] text-white/20 text-lg">No Battles Found</p>
                <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                  Adjust your filters to find active tournaments
                </p>
                <button onClick={() => {
                  setTypeFilter("All"); setGameFilter("All Games");
                  setRegionFilter("All Regions"); setRankFilter("All Ranks"); setSearch("");
                }}
                  className="mt-6 font-[Rajdhani,sans-serif] text-[0.75rem] tracking-[0.2em] uppercase text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] px-5 py-2 hover:bg-[rgba(139,92,246,0.08)] transition-all duration-200"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div style={{ minWidth: "900px" }}>
                {filtered.map((t, i) => (
                  <TournamentRow key={t.id} t={t} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom summary */}
          {filtered.length > 0 && (
            <div className="mt-6 flex items-center justify-between px-1">
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase text-white/15">
                Showing {filtered.length} of {TOURNAMENTS.length} tournaments
              </p>
              <div className="flex items-center gap-4">
                <span className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/15 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} /> Live
                </span>
                <span className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/15 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#8b5cf6" }} /> Upcoming
                </span>
                <span className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/15 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#f87171" }} /> Full
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}