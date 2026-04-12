"use client";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   TYPES — wire these to your DB models
───────────────────────────────────────────────────────────── */
type TournamentTab = "information" | "players" | "leaderboard" | "brackets" | "result";

type Tournament = {
  _id: string;
  name: string;
  description: string;
  game: string;
  format: string;
  type: string;
  prize_pool: string;
  entry_fee: string;
  max_teams: number;
  registered_teams: number;
  start_date: string;
  registration_deadline: string;
  status: "upcoming" | "ongoing" | "completed";
  rules: string[];
  organiser: string;
  region: string;
};

type RegisteredPlayer = {
  _id: string;
  username: string;
  player_tag: string;
  team_name?: string;
  registered_at: string;
};

type LeaderboardEntry = {
  rank: number;
  team_or_player: string;
  points: number;
  wins: number;
  losses: number;
};

type BracketMatch = {
  match_id: string;
  round: number;
  team_a: string | null;
  team_b: string | null;
  winner: string | null;
  score_a: number | null;
  score_b: number | null;
  status: "pending" | "ongoing" | "completed";
};

type ResultEntry = {
  rank: number;
  team_or_player: string;
  prize: string | null;
};

/* ─────────────────────────────────────────────────────────────
   PLACEHOLDER COMPONENTS
───────────────────────────────────────────────────────────── */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 border border-[rgba(139,92,246,0.2)] flex items-center justify-center bg-[rgba(139,92,246,0.03)]"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
          <circle cx="10" cy="10" r="7" stroke="rgba(139,92,246,0.4)" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M10 7V10M10 13H10.01" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-white/20">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(139,92,246,0.07)] last:border-b-0">
      <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.28em] uppercase text-white/25">{label}</span>
      <span className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/60">
        {value ?? <span className="text-white/15 italic text-[0.7rem]">—</span>}
      </span>
    </div>
  );
}

function SkeletonBar({ w = "100%" }: { w?: string }) {
  return (
    <div className="h-3 rounded-sm bg-[rgba(139,92,246,0.07)] animate-pulse" style={{ width: w }} />
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB SECTIONS
───────────────────────────────────────────────────────────── */

// ── INFORMATION
function InformationTab({ tournament }: { tournament: Tournament | null }) {
  if (!tournament) return (
    <div className="space-y-3 max-w-xl">
      {[..."12345"].map(i => <SkeletonBar key={i} w={i === "3" ? "60%" : "100%"} />)}
    </div>
  );

  return (
    <div className="content-in grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Details */}
      <div className="rk-card p-5">
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.32em] uppercase text-[#8b5cf6] mb-3">Tournament Details</p>
        <InfoRow label="Game"                   value={tournament.game} />
        <InfoRow label="Format"                 value={tournament.format} />
        <InfoRow label="Type"                   value={tournament.type} />
        <InfoRow label="Region"                 value={tournament.region} />
        <InfoRow label="Organiser"              value={tournament.organiser} />
        <InfoRow label="Status"                 value={tournament.status?.toUpperCase()} />
      </div>

      {/* Registration */}
      <div className="rk-card p-5">
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.32em] uppercase text-[#8b5cf6] mb-3">Registration</p>
        <InfoRow label="Prize Pool"             value={tournament.prize_pool} />
        <InfoRow label="Entry Fee"              value={tournament.entry_fee} />
        <InfoRow label="Max Teams"              value={tournament.max_teams} />
        <InfoRow label="Registered"             value={tournament.registered_teams} />
        <InfoRow label="Start Date"             value={tournament.start_date} />
        <InfoRow label="Registration Deadline"  value={tournament.registration_deadline} />
      </div>

      {/* Rules */}
      {tournament.rules?.length > 0 && (
        <div className="rk-card p-5 md:col-span-2">
          <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.32em] uppercase text-[#8b5cf6] mb-3">Rules & Guidelines</p>
          <ul className="space-y-2">
            {tournament.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-[Cinzel,serif] text-[0.6rem] text-[#8b5cf6]/50 mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/45 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── PLAYERS
function PlayersTab({ players }: { players: RegisteredPlayer[] | null }) {
  if (!players) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border border-[rgba(139,92,246,0.08)] bg-white/[0.01]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <SkeletonBar w="24px" />
          <SkeletonBar w="120px" />
          <SkeletonBar w="80px" />
        </div>
      ))}
    </div>
  );

  if (players.length === 0) return <EmptyState label="No players registered yet" />;

  return (
    <div className="content-in">
      {/* Header */}
      <div className="grid grid-cols-12 px-4 py-2.5 mb-1">
        {[["#","col-span-1"],["Player","col-span-5"],["Team","col-span-4 hidden md:block"],["Registered","col-span-2"]].map(([l,c])=>(
          <p key={l} className={`${c} font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.28em] uppercase text-white/20`}>{l}</p>
        ))}
      </div>
      <div className="space-y-1">
        {players.map((p, i) => (
          <div key={p._id}
            className="grid grid-cols-12 px-4 py-3 items-center border border-[rgba(139,92,246,0.09)] bg-white/[0.015] hover:bg-[rgba(139,92,246,0.04)] transition-all duration-200"
            style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
            <p className="col-span-1 font-[Cinzel,serif] text-[0.65rem] text-white/25">{i + 1}</p>
            <div className="col-span-5 flex items-center gap-2.5">
              <div className="w-6 h-6 border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.07)] flex items-center justify-center shrink-0"
                style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                <span className="font-[Cinzel,serif] text-[0.45rem] font-bold text-[#8b5cf6]">{p.username.slice(0,2).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-[Rajdhani,sans-serif] text-[0.78rem] font-semibold text-white/70">{p.username}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.52rem] text-white/25">{p.player_tag}</p>
              </div>
            </div>
            <p className="col-span-4 hidden md:block font-[Rajdhani,sans-serif] text-[0.72rem] text-white/35">{p.team_name ?? "—"}</p>
            <p className="col-span-2 font-[Rajdhani,sans-serif] text-[0.62rem] text-white/25">{p.registered_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LEADERBOARD
function LeaderboardTab({ entries }: { entries: LeaderboardEntry[] | null }) {
  if (!entries) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border border-[rgba(139,92,246,0.08)] bg-white/[0.01]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <SkeletonBar w="32px" /><SkeletonBar w="140px" /><SkeletonBar w="60px" />
        </div>
      ))}
    </div>
  );

  if (entries.length === 0) return <EmptyState label="Leaderboard not available yet" />;

  return (
    <div className="content-in">
      <div className="grid grid-cols-12 px-4 py-2.5 mb-1">
        {[["Rank","col-span-1"],["Player / Team","col-span-5"],["W","col-span-2"],["L","col-span-2"],["Points","col-span-2"]].map(([l,c])=>(
          <p key={l} className={`${c} font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.28em] uppercase text-white/20`}>{l}</p>
        ))}
      </div>
      <div className="space-y-1">
        {entries.map(e => (
          <div key={e.rank}
            className="grid grid-cols-12 px-4 py-3.5 items-center border border-[rgba(139,92,246,0.09)] bg-white/[0.015] hover:bg-[rgba(139,92,246,0.04)] transition-all duration-200"
            style={{
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              borderLeft: e.rank <= 3 ? `2px solid ${e.rank === 1 ? "rgba(251,191,36,0.5)" : e.rank === 2 ? "rgba(148,163,184,0.4)" : "rgba(184,115,51,0.4)"}` : "2px solid transparent",
            }}>
            <span className="col-span-1 font-[Cinzel,serif] text-sm font-bold"
              style={{ color: e.rank === 1 ? "#fbbf24" : e.rank === 2 ? "#94a3b8" : e.rank === 3 ? "#b87333" : "rgba(255,255,255,0.25)" }}>
              #{e.rank}
            </span>
            <p className="col-span-5 font-[Rajdhani,sans-serif] text-[0.8rem] font-semibold text-white/65">{e.team_or_player}</p>
            <p className="col-span-2 font-[Cinzel,serif] text-[0.8rem] text-white/50">{e.wins}</p>
            <p className="col-span-2 font-[Cinzel,serif] text-[0.8rem] text-white/30">{e.losses}</p>
            <p className="col-span-2 font-[Cinzel,serif] text-[0.85rem] font-bold text-[#a78bfa]">{e.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BRACKETS
function BracketsTab({ matches }: { matches: BracketMatch[] | null }) {
  if (!matches) return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {[...Array(3)].map((_, ri) => (
        <div key={ri} className="flex flex-col gap-4 shrink-0 w-44">
          <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-widest uppercase text-white/20 mb-1">Round {ri + 1}</p>
          {[...Array(4 - ri)].map((_, mi) => (
            <div key={mi} className="border border-[rgba(139,92,246,0.1)] bg-white/[0.015] p-3 space-y-2"
              style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
              <SkeletonBar /><SkeletonBar />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  if (matches.length === 0) return <EmptyState label="Brackets not generated yet" />;

  // Group matches by round
  const rounds = matches.reduce<Record<number, BracketMatch[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});

  const statusColor = { pending: "rgba(255,255,255,0.2)", ongoing: "#fbbf24", completed: "#a78bfa" };

  return (
    <div className="content-in overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {Object.entries(rounds).map(([round, roundMatches]) => (
          <div key={round} className="flex flex-col gap-3 w-48 shrink-0">
            <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-[#8b5cf6]/60 mb-1">Round {round}</p>
            {roundMatches.map(m => (
              <div key={m.match_id}
                className="border border-[rgba(139,92,246,0.12)] bg-white/[0.015] overflow-hidden"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                {/* Status indicator */}
                <div className="h-[2px]" style={{ background: statusColor[m.status] }} />
                <div className="p-3 space-y-2">
                  {[{ team: m.team_a, score: m.score_a }, { team: m.team_b, score: m.score_b }].map(({ team, score }, ti) => (
                    <div key={ti} className="flex items-center justify-between">
                      <p className="font-[Rajdhani,sans-serif] text-[0.72rem] truncate"
                        style={{ color: m.winner && team === m.winner ? "#a78bfa" : team ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)" }}>
                        {team ?? "TBD"}
                      </p>
                      {score !== null && (
                        <span className="font-[Cinzel,serif] text-[0.7rem] font-bold ml-2 shrink-0"
                          style={{ color: m.winner && team === m.winner ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
                          {score}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RESULT
function ResultTab({ results }: { results: ResultEntry[] | null }) {
  if (!results) return (
    <div className="space-y-3 max-w-md">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border border-[rgba(139,92,246,0.08)] bg-white/[0.01]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <SkeletonBar w="32px" /><SkeletonBar w="120px" /><SkeletonBar w="80px" />
        </div>
      ))}
    </div>
  );

  if (results.length === 0) return <EmptyState label="Results will appear after the tournament ends" />;

  return (
    <div className="content-in max-w-lg space-y-2">
      {results.map(r => (
        <div key={r.rank}
          className="flex items-center gap-4 px-5 py-4 border border-[rgba(139,92,246,0.1)] bg-white/[0.015]"
          style={{
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
            background: r.rank === 1 ? "rgba(251,191,36,0.05)" : r.rank === 2 ? "rgba(148,163,184,0.03)" : r.rank === 3 ? "rgba(184,115,51,0.03)" : "rgba(255,255,255,0.015)",
            borderColor: r.rank === 1 ? "rgba(251,191,36,0.3)" : r.rank === 2 ? "rgba(148,163,184,0.2)" : r.rank === 3 ? "rgba(184,115,51,0.2)" : "rgba(139,92,246,0.09)",
          }}>
          <span className="font-[Cinzel,serif] text-xl font-black w-8 text-center shrink-0"
            style={{ color: r.rank === 1 ? "#fbbf24" : r.rank === 2 ? "#94a3b8" : r.rank === 3 ? "#b87333" : "rgba(255,255,255,0.22)" }}>
            {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : `#${r.rank}`}
          </span>
          <p className="flex-1 font-[Rajdhani,sans-serif] text-[0.85rem] font-semibold text-white/65">{r.team_or_player}</p>
          {r.prize && (
            <span className="font-[Cinzel,serif] text-sm font-bold text-[#a78bfa] shrink-0">{r.prize}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN TOURNAMENT PAGE
───────────────────────────────────────────────────────────── */
export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState<TournamentTab>("information");

  // ── Plug your DB data here
  const tournament: Tournament | null = null;
  const players: RegisteredPlayer[] | null = null;
  const leaderboard: LeaderboardEntry[] | null = null;
  const brackets: BracketMatch[] | null = null;
  const results: ResultEntry[] | null = null;

  const TABS: { key: TournamentTab; label: string }[] = [
    { key: "information", label: "Information" },
    { key: "players",     label: "Players"     },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "brackets",    label: "Brackets"    },
    { key: "result",      label: "Result"      },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "information": return <InformationTab tournament={tournament} />;
      case "players":     return <PlayersTab players={players} />;
      case "leaderboard": return <LeaderboardTab entries={leaderboard} />;
      case "brackets":    return <BracketsTab matches={brackets} />;
      case "result":      return <ResultTab results={results} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.022; }
        }
        @keyframes contentIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .anim-grid  { animation: gridFade 2s ease forwards; }
        .fade-up    { animation: fadeUp 0.45s ease forwards; }
        .fade-up-2  { animation: fadeUp 0.45s ease 0.08s forwards; opacity: 0; }
        .fade-up-3  { animation: fadeUp 0.45s ease 0.16s forwards; opacity: 0; }
        .content-in { animation: contentIn 0.3s ease forwards; }

        .rk-card {
          position: relative;
          border: 1px solid rgba(139,92,246,0.14);
          background: rgba(255,255,255,0.018);
        }
        .rk-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 18px; height: 18px;
          border-top: 1.5px solid rgba(139,92,246,0.38);
          border-left: 1.5px solid rgba(139,92,246,0.38);
        }
        .rk-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 18px; height: 18px;
          border-bottom: 1.5px solid rgba(139,92,246,0.38);
          border-right: 1.5px solid rgba(139,92,246,0.38);
        }

        .tab-btn {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 9px 18px;
          border-bottom: 2px solid transparent;
          color: rgba(255,255,255,0.28);
          cursor: pointer;
          transition: all 0.2s ease;
          background: none;
          border-top: none; border-left: none; border-right: none;
          white-space: nowrap;
        }
        .tab-btn:hover { color: rgba(255,255,255,0.6); }
        .tab-btn.active { color: #a78bfa; border-bottom-color: #8b5cf6; }

        .main-scroll {
          flex: 1;
          overflow-y: auto;
        }
        .main-scroll::-webkit-scrollbar { width: 3px; }
        .main-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.22); border-radius: 2px; }

        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        .animate-pulse {
          animation: shimmer 2s ease infinite;
          background: linear-gradient(90deg, rgba(139,92,246,0.07) 25%, rgba(139,92,246,0.13) 50%, rgba(139,92,246,0.07) 75%);
          background-size: 200% 100%;
        }
      `}</style>

      <div className="min-h-screen bg-[#050510] relative overflow-x-hidden">

        {/* Background grid */}
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(139,92,246,0.05) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 max-w-[1060px] mx-auto px-5 py-8 space-y-5">

          {/* ══════════════════════════════════════
              HEADER — name + description
          ══════════════════════════════════════ */}
          <div className="fade-up grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Tournament name box */}
            <div className="relative border border-[rgba(139,92,246,0.22)] bg-white/[0.02] px-6 py-5 flex items-center gap-4"
              style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}>
              <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ background: "linear-gradient(180deg, transparent, #8b5cf6, transparent)" }} />
              <div className="min-w-0">
                <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.32em] uppercase text-[#8b5cf6] mb-1.5">Tournament</p>
                {tournament ? (
                  <>
                    <h1 className="font-[Cinzel,serif] text-xl font-black text-white leading-tight truncate">{tournament.name}</h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-widest uppercase px-2 py-0.5 border border-[rgba(139,92,246,0.3)] text-[#8b5cf6] bg-[rgba(139,92,246,0.07)]"
                        style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                        {tournament.game}
                      </span>
                      <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-widest uppercase text-white/25">{tournament.format}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 mt-1">
                    <SkeletonBar w="80%" />
                    <SkeletonBar w="40%" />
                  </div>
                )}
              </div>
            </div>

            {/* Description box */}
            <div className="relative border border-[rgba(139,92,246,0.14)] bg-white/[0.015] px-6 py-5"
              style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}>
              <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.32em] uppercase text-[#8b5cf6] mb-2">About</p>
              {tournament ? (
                <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/40 leading-relaxed">{tournament.description}</p>
              ) : (
                <div className="space-y-2">
                  <SkeletonBar /><SkeletonBar /><SkeletonBar w="60%" />
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════
              QUICK STATS STRIP
          ══════════════════════════════════════ */}
          <div className="fade-up-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Prize Pool",   value: tournament?.prize_pool, accent: true  },
              { label: "Teams",        value: tournament? `${tournament.registered_teams} / ${tournament.max_teams}` : undefined },
              { label: "Start Date",   value: tournament?.start_date                         },
              { label: "Status",       value: tournament?.status?.toUpperCase(), accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label} className="border border-[rgba(139,92,246,0.12)] bg-white/[0.015] px-4 py-3"
                style={{ clipPath: "polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%)" }}>
                <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.28em] uppercase text-white/22 mb-1">{label}</p>
                {value ? (
                  <p className="font-[Cinzel,serif] font-bold text-sm" style={{ color: accent ? "#a78bfa" : "rgba(255,255,255,0.65)" }}>{value}</p>
                ) : (
                  <SkeletonBar w="70%" />
                )}
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════
              TABS + CONTENT
          ══════════════════════════════════════ */}
          <div className="fade-up-3">
            {/* Tab bar */}
            <div className="flex border-b border-[rgba(139,92,246,0.12)] overflow-x-auto">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`tab-btn ${activeTab === t.key ? "active" : ""}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content panel */}
            <div className="pt-5 min-h-[340px]">
              {renderTab()}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}