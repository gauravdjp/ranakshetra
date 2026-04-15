"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tournament, Tournament_Registration } from "@/types/index";
import StandardBracket from "@/components/braceng1";
import ByeBracket from "@/components/braceng2";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { BracketDocument } from "@/types/index";

const fetcher = (url: string) => {
  console.log("[fetcher] fetching:", url);
  return fetch(url)
    .then(r => {
      console.log("[fetcher] response status:", r.status);
      return r.json();
    })
    .then(data => {
      console.log("[fetcher] response data:", {
        hasBracket: !!data?.bracket,
        bracketMatches: data?.bracket?.matches?.length,
        completedMatches: data?.bracket?.matches?.filter((m: any) => m.status === "completed").length,
        rawData: data,
      });
      return data;
    })
    .catch(err => {
      console.error("[fetcher] error:", err);
      throw err;
    });
};

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type TabId = "overview" | "participants" | "brackets" | "rankings" | "results";

/* ─────────────────────────────────────────────────────────────
   REAL TOURNAMENT DATA
───────────────────────────────────────────────────────────── */
const TOURNAMENT: Tournament = {
  title: "Clash Royale Champion Trophy",
  organizer_id: "Gaurav",
  game_id: "CLASH_ROYALE",
  region: "Central India",
  single_player: true,
  team_based: false,
  tournament_type: "single_elimination" as any,
  status: "upcoming",
  visibility: "public",
  brackets_generated: false,
  results_declared: false,
  progress: 0,
  prize_pool: 0,
  entry_fee: 0,
  participants_limit: 0,
  start_date: new Date("2026-04-13T10:30:00"),
  end_date: new Date("2026-04-13T11:30:00"),
  registration_deadline: new Date("2026-04-13T10:00:00"),
  created_at: new Date("2026-04-13T00:00:00"),
  updated_at: new Date("2026-04-13T00:00:00"),
  format_rules: "Single Elimination · 1v1",
  description: "Official Clash Royale tournament hosted at Xaviers Institute of Engineering.",
  participants_profile: [],
};

const TOURNAMENT_META = {
  id: "T-CR-2026-001",
  organiser_name: "Gaurav",
  organiser_contact: "xie@rk.gg",
  arena: "Xaviers Institute of Engineering",
  rank: "All Ranks",
  prize_label: "Trophy",
  prize_breakdown: ["Trophy — 1st Place", "Medal — 2nd Place", "Certificate — 3rd Place"],
  rules: [
    "All participants must have a valid Clash Royale account.",
    "Player tag must match the registered tag on the platform.",
    "Match times are fixed — late joiners forfeit the match.",
    "Any hacking or abuse of bugs leads to immediate disqualification.",
    "Organisers' decision is final on all disputes.",
  ],
  updates: [
    { time: "2026-04-13 · 00:00", text: "Registration is now open. Welcome to the Clash Royale Champion Trophy!" },
  ],
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function fmt(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(date: Date | string) {
  return new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const STATUS_CFG = {
  upcoming:          { label: "UPCOMING",  color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.3)" },
  registration_open: { label: "REG OPEN",  color: "#06b6d4", bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.3)" },
  ongoing:           { label: "LIVE NOW",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.4)" },
  completed:         { label: "COMPLETED", color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.3)" },
  cancelled:         { label: "CANCELLED", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)" },
  draft:             { label: "DRAFT",     color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.3)" },
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)]"
      style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
      <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/25">{label}</span>
      <span className="font-[Cinzel,serif] font-bold text-[1rem] leading-tight"
        style={{ color: accent ? "#a78bfa" : "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="relative font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.2em] uppercase pb-3 px-1 transition-all duration-200 whitespace-nowrap"
      style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }} />
      )}
    </button>
  );
}

function Countdown({ target }: { target: Date }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const calc = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()));
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [target]);

  if (diff === 0) return <span className="text-[#22c55e]">Started</span>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <span className="font-[Rajdhani,sans-serif] font-bold tracking-wider text-white/80">
      {d > 0 && <>{d}<span className="text-[#8b5cf6] text-[0.7em]">d </span></>}
      {String(h).padStart(2,"0")}<span className="text-[#8b5cf6] text-[0.7em]">h </span>
      {String(m).padStart(2,"0")}<span className="text-[#8b5cf6] text-[0.7em]">m </span>
      {String(s).padStart(2,"0")}<span className="text-[#8b5cf6] text-[0.7em]">s</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   OVERVIEW TAB
───────────────────────────────────────────────────────────── */
function OverviewTab({ t, meta, registrations }: { t: Tournament; meta: typeof TOURNAMENT_META; registrations: Tournament_Registration[] }) {
  const isUnlimited = t.participants_limit === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 tab-content">
      <div className="lg:col-span-2 space-y-6">

        {t.description && (
          <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
            style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-3">About</p>
            <p className="font-[Rajdhani,sans-serif] text-[0.85rem] text-white/50 leading-relaxed">{t.description}</p>
          </div>
        )}

        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Schedule</p>
          <div className="relative pl-5">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-[#8b5cf6] via-[rgba(139,92,246,0.3)] to-transparent" />
            {[
              { label: "Registration Opens",  date: t.created_at,            done: true },
              { label: "Registration Closes", date: t.registration_deadline, done: t.status !== "upcoming" && t.status !== "registration_open" },
              { label: "Tournament Begins",   date: t.start_date,            done: t.status === "ongoing" || t.status === "completed" },
              { label: "Tournament Ends",     date: t.end_date,              done: t.status === "completed" },
            ].map((item, i) => (
              <div key={i} className="relative mb-5 last:mb-0">
                <div className="absolute -left-5 top-1 w-2 h-2 border"
                  style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", borderColor: item.done ? "#8b5cf6" : "rgba(139,92,246,0.3)", background: item.done ? "rgba(139,92,246,0.4)" : "transparent" }} />
                <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-0.5">{item.label}</p>
                <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.95rem] text-white/80">{fmtTime(item.date)}</p>
              </div>
            ))}
          </div>
          {(t.status === "upcoming" || t.status === "registration_open") && (
            <div className="mt-5 pt-4 border-t border-[rgba(139,92,246,0.1)] flex items-center gap-3">
              <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.25em] uppercase text-white/25">Starts in</span>
              <Countdown target={t.start_date} />
            </div>
          )}
        </div>

        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-3">Rules & Format</p>
          <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-[rgba(139,92,246,0.6)] mb-4 tracking-wide">{t.format_rules}</p>
          <ul className="space-y-3">
            {meta.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rotate-45 bg-[rgba(139,92,246,0.5)]" />
                <span className="font-[Rajdhani,sans-serif] text-[0.82rem] text-white/50 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Prize Pool</p>
          {meta.prize_breakdown.map((p, i) => (
            <div key={i} className="flex items-center gap-4 mb-3 last:mb-0">
              <div className="w-6 h-6 flex items-center justify-center border border-[rgba(139,92,246,0.3)] flex-shrink-0"
                style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)", background: i === 0 ? "rgba(139,92,246,0.15)" : "transparent" }}>
                <span className="font-[Rajdhani,sans-serif] text-[0.55rem] font-bold"
                  style={{ color: i === 0 ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>{i + 1}</span>
              </div>
              <span className="font-[Rajdhani,sans-serif] text-[0.88rem]"
                style={{ color: i === 0 ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.03)] p-5"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Organiser</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 border border-[rgba(139,92,246,0.3)] flex items-center justify-center bg-[rgba(139,92,246,0.08)] flex-shrink-0"
              style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M2 14L4.5 6L8 10L10 4L12 10L15.5 6L18 14H2Z" stroke="#8b5cf6" strokeWidth="1.3" strokeLinejoin="round" />
                <line x1="2" y1="16.5" x2="18" y2="16.5" stroke="#8b5cf6" strokeWidth="1.3" />
              </svg>
            </div>
            <div>
              <p className="font-[Cinzel,serif] font-bold text-white text-[0.9rem]">{meta.organiser_name}</p>
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/30">{meta.organiser_contact}</p>
            </div>
          </div>
          <div className="section-divide my-3" />
          <div className="space-y-2">
            {[
              { label: "Arena",    val: meta.arena },
              { label: "Game",     val: t.game_id.replace("_", " ") },
              { label: "Mode",     val: t.single_player ? "1v1 Solo" : "Team" },
              { label: "Region",   val: t.region },
              { label: "Min Rank", val: meta.rank },
              { label: "Entry",    val: t.entry_fee > 0 ? `₹${t.entry_fee}` : "Free" },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.15em] uppercase text-white/25">{label}</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/60">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-5"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <div className="flex justify-between items-center mb-3">
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6]">Participants</p>
            <p className="font-[Rajdhani,sans-serif] font-bold text-white/70 text-[0.85rem]">
              {registrations.length}{!isUnlimited && ` / ${t.participants_limit}`}
            </p>
          </div>
          <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] mb-2"
            style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
            {!isUnlimited && (
              <div className="h-full transition-all duration-700 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]"
                style={{ width: `${Math.min(100, Math.round((registrations.length / t.participants_limit) * 100))}%` }} />
            )}
          </div>
          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/25">
            {isUnlimited ? "Unlimited slots" : `${t.participants_limit - registrations.length} slots remaining`}
          </p>
        </div>

        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-5"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <div className="flex items-center gap-2 mb-4">
            {t.status === "ongoing" && <span className="live-dot w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#22c55e]" />}
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6]">
              {t.status === "ongoing" ? "Live Updates" : "Updates"}
            </p>
          </div>
          <div className="space-y-4 max-h-[280px] overflow-y-auto update-scroll pr-1">
            {meta.updates.map((u, i) => (
              <div key={i} className="relative pl-4 border-l border-[rgba(139,92,246,0.15)]">
                <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.15em] text-white/25 mb-1">{u.time}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/55 leading-relaxed">{u.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PARTICIPANTS TAB
───────────────────────────────────────────────────────────── */
function ParticipantsTab({ t, registrations }: { t: Tournament; registrations: Tournament_Registration[] }) {
  const isUnlimited = t.participants_limit === 0;

  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6]">
          Registered Players — {registrations.length}{!isUnlimited && ` / ${t.participants_limit}`}
        </p>
      </div>

      <div className="grid items-center gap-4 px-4 py-2 border-b border-[rgba(139,92,246,0.1)] mb-1"
        style={{ gridTemplateColumns: "40px 1fr 180px 140px" }}>
        {["#", "Player", "Tag", "Registered"].map(h => (
          <span key={h} className="font-[Rajdhani,sans-serif] text-[0.56rem] tracking-[0.25em] uppercase text-white/20">{h}</span>
        ))}
      </div>

      {registrations.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] uppercase text-white/15">No players registered yet</p>
        </div>
      ) : (
        <div className="space-y-px">
          {registrations.map((r, i) => (
            <div key={r.player_tag}
              className="grid items-center gap-4 px-4 py-3 border-b border-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.04)] transition-colors group"
              style={{ gridTemplateColumns: "40px 1fr 180px 140px" }}>
              <span className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-5 flex-shrink-0 bg-[#8b5cf6]" />
                <span className="font-[Cinzel,serif] font-bold text-[0.82rem] group-hover:text-[#a78bfa] transition-colors text-white/85">
                  {r.username}
                </span>
              </div>
              <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.15em] text-[rgba(167,139,250,0.7)]"
                style={{ border: "1px solid rgba(139,92,246,0.25)", padding: "2px 8px", clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)", background: "rgba(139,92,246,0.06)", display: "inline-block" }}>
                {r.player_tag}
              </span>
              <span className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/30">
                {fmtTime(r.joinedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RANKINGS TAB
───────────────────────────────────────────────────────────── */
function RankingsTab({ t, registrations, bracket }: { 
  t: Tournament; 
  registrations: Tournament_Registration[];
  bracket?: BracketDocument | null;
}) {
  const RANK_COLORS = ["#f59e0b", "#9ca3af", "#cd7c2f"];
  const RANK_LABELS = ["1ST", "2ND", "3RD"];
  const isLocked = t.status === "upcoming" || t.status === "registration_open" || t.status === "draft";

  // Derive ranking from bracket results
  const getRankedPlayers = (): Tournament_Registration[] => {
    if (!bracket || bracket.matches.length === 0) return registrations;

    // Final match winner = 1st, loser = 2nd
    // Semi-final losers share 3rd
    const completedMatches = bracket.matches.filter(m => m.status === "completed");
    const byRound = [...bracket.matches].sort((a, b) => b.round - a.round);
    const finalMatch = byRound.find(m => m.status === "completed" && !m.isBye);

    if (!finalMatch) return registrations;

    const winner1st = registrations.find(r => r.player_tag === finalMatch.winner_tag);
    const loserTag = finalMatch.player1.tag === finalMatch.winner_tag
      ? finalMatch.player2?.tag
      : finalMatch.player1.tag;
    const winner2nd = registrations.find(r => r.player_tag === loserTag);

    // Semi-finalists who lost
    const semis = bracket.matches.filter(m => m.round === bracket.total_rounds - 2 && m.status === "completed" && !m.isBye);
    const semiLosers = semis
      .map(m => m.player1.tag === m.winner_tag ? m.player2?.tag : m.player1.tag)
      .filter(Boolean)
      .map(tag => registrations.find(r => r.player_tag === tag))
      .filter(Boolean) as Tournament_Registration[];

    const ranked = [winner1st, winner2nd, ...semiLosers].filter(Boolean) as Tournament_Registration[];
    const rankedTags = new Set(ranked.map(r => r.player_tag));
    const rest = registrations.filter(r => !rankedTags.has(r.player_tag));
    return [...ranked, ...rest];
  };

  if (isLocked) {
    return (
      <div className="tab-content py-20 text-center">
        <div className="w-12 h-12 border border-[rgba(139,92,246,0.2)] mx-auto mb-4 flex items-center justify-center"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M12 2L15 9H22L16.5 13.5L18.5 21L12 17L5.5 21L7.5 13.5L2 9H9L12 2Z" stroke="#8b5cf6" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.3em] uppercase text-white/20">Rankings will be available after the tournament</p>
      </div>
    );
  }

  const ranked = getRankedPlayers();
  const podium = ranked.slice(0, 3);

  return (
    <div className="tab-content">
      <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-6">Final Rankings</p>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-10 max-w-md mx-auto">
        {[1, 0, 2].map((rankIdx) => {
          const player = podium[rankIdx];
          const heights = ["h-28", "h-36", "h-20"];
          return (
            <div key={rankIdx} className="flex flex-col items-center gap-2 flex-1">
              <span className="font-[Cinzel,serif] text-[0.72rem] font-bold text-center truncate w-full text-center"
                style={{ color: player ? RANK_COLORS[rankIdx] : "rgba(255,255,255,0.2)" }}>
                {player?.username ?? "—"}
              </span>
              <div className={`w-full ${heights[rankIdx]} flex flex-col items-center justify-end pb-3 border-t-2`}
                style={{
                  background: player ? `${RANK_COLORS[rankIdx]}11` : "rgba(255,255,255,0.02)",
                  borderColor: player ? `${RANK_COLORS[rankIdx]}55` : "rgba(255,255,255,0.08)",
                  clipPath: "polygon(4px 0%, 100% 0%, 100% 100%, 0% 100%)"
                }}>
                <span className="font-[Cinzel,serif] font-black text-2xl" style={{ color: RANK_COLORS[rankIdx] }}>
                  {RANK_LABELS[rankIdx]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="grid items-center gap-4 px-4 py-2 border-b border-[rgba(139,92,246,0.1)] mb-1"
        style={{ gridTemplateColumns: "50px 1fr 180px 100px" }}>
        {["Rank", "Player", "Tag", "Result"].map(h => (
          <span key={h} className="font-[Rajdhani,sans-serif] text-[0.56rem] tracking-[0.25em] uppercase text-white/20">{h}</span>
        ))}
      </div>
      {ranked.map((r, i) => (
        <div key={r.player_tag}
          className="grid items-center gap-4 px-4 py-3 border-b border-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.04)] transition-colors"
          style={{ gridTemplateColumns: "50px 1fr 180px 100px" }}>
          <span className="font-[Cinzel,serif] font-bold text-[0.8rem]"
            style={{ color: i < 3 ? RANK_COLORS[i] : "rgba(255,255,255,0.25)" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="font-[Cinzel,serif] font-bold text-[0.82rem] text-white/80">{r.username}</span>
          <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.15em] text-[rgba(167,139,250,0.7)]"
            style={{ border: "1px solid rgba(139,92,246,0.25)", padding: "2px 8px", clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)", background: "rgba(139,92,246,0.06)", display: "inline-block" }}>
            {r.player_tag}
          </span>
          <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.15em] uppercase"
            style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#cd7c2f" : "rgba(255,255,255,0.2)" }}>
            {i === 0 ? "Champion" : i === 1 ? "Runner-up" : i === 2 ? "3rd Place" : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RESULTS TAB
───────────────────────────────────────────────────────────── */
function ResultsTab({ t, registrations, bracket, meta }: { 
  t: Tournament; 
  registrations: Tournament_Registration[];
  bracket?: BracketDocument | null;
  meta: typeof TOURNAMENT_META;
}) {
  const isLocked = t.status !== "completed";

  const getWinners = () => {
    if (!bracket) return { first: null, second: null, third: null };

    const byRound = [...bracket.matches].sort((a, b) => b.round - a.round);
    const finalMatch = byRound.find(m => m.status === "completed" && !m.isBye);
    if (!finalMatch) return { first: null, second: null, third: null };

    const first = registrations.find(r => r.player_tag === finalMatch.winner_tag) ?? null;
    const loserTag = finalMatch.player1.tag === finalMatch.winner_tag
      ? finalMatch.player2?.tag : finalMatch.player1.tag;
    const second = registrations.find(r => r.player_tag === loserTag) ?? null;

    const semis = bracket.matches.filter(m => m.round === bracket.total_rounds - 2 && m.status === "completed" && !m.isBye);
    const thirdLoserTag = semis[0]
      ? (semis[0].player1.tag === semis[0].winner_tag ? semis[0].player2?.tag : semis[0].player1.tag)
      : undefined;
    const third = thirdLoserTag ? registrations.find(r => r.player_tag === thirdLoserTag) ?? null : null;

    return { first, second, third };
  };

  if (isLocked) {
    return (
      <div className="tab-content py-20 text-center">
        <div className="w-12 h-12 border border-[rgba(139,92,246,0.2)] mx-auto mb-4 flex items-center justify-center"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="1" stroke="#8b5cf6" strokeWidth="1.3" />
            <path d="M8 12L11 15L16 9" stroke="#8b5cf6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.3em] uppercase text-white/20 mb-2">
          {t.status === "upcoming" || t.status === "registration_open"
            ? "Tournament hasn't started yet"
            : "Results will be posted after the tournament ends"}
        </p>
        {t.status === "ongoing" && (
          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-[#22c55e] tracking-wide">Tournament is currently live</p>
        )}
      </div>
    );
  }

  const { first, second, third } = getWinners();
  const hasPrize = meta.prize_breakdown.length > 0;

  const WinnerCard = ({
    player, rank, color, prize, icon
  }: {
    player: Tournament_Registration | null;
    rank: string;
    color: string;
    prize: string;
    icon: React.ReactNode;
  }) => (
    <div className="relative p-6 border flex flex-col items-center gap-3 text-center"
      style={{
        clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
        borderColor: `${color}33`,
        background: `${color}07`,
      }}>
      {/* Rank badge */}
      <div className="w-10 h-10 flex items-center justify-center border mb-1"
        style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)", borderColor: `${color}55`, background: `${color}15` }}>
        {icon}
      </div>
      <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase" style={{ color }}>
        {rank}
      </span>
      {player ? (
        <>
          <p className="font-[Cinzel,serif] font-black text-white text-[1.05rem] leading-tight">{player.username}</p>
          <span className="font-[Rajdhani,sans-serif] text-[0.63rem] tracking-[0.15em] px-2 py-0.5"
            style={{ color: `${color}cc`, border: `1px solid ${color}33`, background: `${color}0a`, clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
            {player.player_tag}
          </span>
          <div className="mt-1 pt-3 border-t w-full" style={{ borderColor: `${color}22` }}>
            <p className="font-[Rajdhani,sans-serif] text-[0.72rem] font-bold" style={{ color }}>{prize}</p>
          </div>
        </>
      ) : (
        <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/20">TBD</p>
      )}
    </div>
  );

  return (
    <div className="tab-content">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-2">Tournament Complete</p>
        <h2 className="font-[Cinzel,serif] font-black text-white text-2xl mb-1">{t.title}</h2>
        <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/30">{fmt(t.end_date)} · {meta.arena}</p>
      </div>

      {/* Congratulations banner for champion */}
      {first && (
        <div className="relative mb-8 px-6 py-5 border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.05)] overflow-hidden"
          style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 10% 50%, rgba(245,158,11,0.08), transparent)" }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-[rgba(245,158,11,0.5)] bg-[rgba(245,158,11,0.1)] flex items-center justify-center flex-shrink-0"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="rgba(245,158,11,0.4)" stroke="#f59e0b" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-[#f59e0b]/70 mb-0.5">Champion</p>
                <p className="font-[Cinzel,serif] font-black text-[#f59e0b] text-xl leading-none">{first.username}</p>
              </div>
            </div>
            <div className="md:ml-auto">
              <p className="font-[Rajdhani,sans-serif] text-[0.85rem] text-white/50">
                Congratulations on winning the <span className="text-[#f59e0b]/80 font-bold">{t.title}</span>!
              </p>
              <p className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/25 mt-0.5">
                Your victory has been recorded. Well played.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Winner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <WinnerCard
          player={first}
          rank="1st Place — Champion"
          color="#f59e0b"
          prize={meta.prize_breakdown[0] ?? "—"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="rgba(245,158,11,0.4)" stroke="#f59e0b" strokeWidth="1.2" />
            </svg>
          }
        />
        <WinnerCard
          player={second}
          rank="2nd Place — Runner-up"
          color="#9ca3af"
          prize={meta.prize_breakdown[1] ?? "—"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <circle cx="12" cy="10" r="6" stroke="#9ca3af" strokeWidth="1.3" />
              <path d="M8 16L6 22H18L16 16" stroke="#9ca3af" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          }
        />
        <WinnerCard
          player={third}
          rank="3rd Place"
          color="#cd7c2f"
          prize={meta.prize_breakdown[2] ?? "—"}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <circle cx="12" cy="10" r="6" stroke="#cd7c2f" strokeWidth="1.3" />
              <path d="M8 16L6 22H18L16 16" stroke="#cd7c2f" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* Match results table */}
      {bracket && (
        <>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Match Results</p>
          <div className="grid items-center gap-3 px-4 py-2 border-b border-[rgba(139,92,246,0.1)] mb-1"
            style={{ gridTemplateColumns: "60px 1fr auto 1fr 80px" }}>
            {["Round", "Player 1", "", "Player 2", "Winner"].map((h, i) => (
              <span key={i} className={`font-[Rajdhani,sans-serif] text-[0.56rem] tracking-[0.25em] uppercase text-white/20 ${i === 2 || i === 3 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>
          <div className="space-y-px">
            {bracket.matches
              .filter(m => !m.isBye && m.status === "completed")
              .sort((a, b) => a.round - b.round || a.index - b.index)
              .map(m => {
                const p1Won = m.winner_tag === m.player1.tag;
                const p2Won = m.winner_tag === m.player2?.tag;
                return (
                  <div key={m.matchId}
                    className="grid items-center gap-3 px-4 py-3 border-b border-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.04)] transition-colors"
                    style={{ gridTemplateColumns: "60px 1fr auto 1fr 80px" }}>
                    <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.15em] uppercase text-white/20">
                      R{m.round + 1}·M{m.index + 1}
                    </span>
                    <span className="font-[Cinzel,serif] text-[0.8rem]"
                      style={{ color: p1Won ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
                      {m.player1.name}{p1Won && " ✓"}
                    </span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/20">vs</span>
                    <span className="font-[Cinzel,serif] text-[0.8rem] text-right"
                      style={{ color: p2Won ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
                      {p2Won && "✓ "}{m.player2?.name ?? "—"}
                    </span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.1em] text-[rgba(167,139,250,0.7)]">
                      {bracket.matches.find(x => x.matchId === m.matchId)?.winner_tag
                        ? (m.winner_tag === m.player1.tag ? m.player1.name : m.player2?.name)
                        : "—"}
                    </span>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BRACKETS TAB
───────────────────────────────────────────────────────────── */
function BracketsTab({ 
  t, 
  currentPlayerTag, 
  bracket, 
  data, 
  mutate 
}: { 
  t: Tournament; 
  currentPlayerTag?: string;
  bracket: BracketDocument | null;
  data: any;
  mutate: any;
}) {
  const [generating, setGenerating] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // ── Auto-generate after deadline
  useEffect(() => {
    if (bracket || generating || data === undefined) return;

    const deadline  = new Date(t.registration_deadline).getTime();
    const remaining = deadline - Date.now();

    if (remaining <= 0) {
      generate();
    } else {
      setCooldownMs(remaining);
      const timer = setTimeout(() => { setCooldownMs(0); generate(); }, remaining);
      return () => clearTimeout(timer);
    }
  }, [bracket, data]);

  // ── Poll live matches every 5 s
  useEffect(() => {
    if (!bracket || !pollingEnabled) return;

    const liveMatches = bracket.matches.filter((m: any) => m.status === "live");
    if (liveMatches.length === 0) return;

    console.log("[polling] starting interval for", liveMatches.length, "live matches");

    const iv = setInterval(async () => {
      console.log("[polling] tick — checking", liveMatches.length, "matches");

      const results = await Promise.allSettled(
        liveMatches.map((m: any) =>
          fetch(`/api/tournaments/brackets/poll?tournamentId=${TOURNAMENT_META.id}&matchId=${m.matchId}`)
            .then(res => ({ status: res.status, matchId: m.matchId }))
            .catch(err => { console.error(`[poll] ${m.matchId} error:`, err); return { status: 500, matchId: m.matchId }; })
        )
      );

      const anyCompleted = results.some(
        r => r.status === "fulfilled" && (r.value as any).status === 200
      );

      if (anyCompleted) {
        console.log("[polling] winner found — revalidating bracket");
        mutate();
      } else {
        console.log("[polling] no results yet — waiting");
      }
    }, 5000);

    return () => {
      console.log("[polling] clearing interval");
      clearInterval(iv);
    };
  }, [bracket?.matches, pollingEnabled, mutate]);

  const generate = async () => {
    setGenerating(true);
    try {
      await fetch("/api/tournaments/brackets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: TOURNAMENT_META.id }),
      });
      mutate();
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = async (matchId: string) => {
    try {
      await fetch("/api/tournaments/brackets/start", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: TOURNAMENT_META.id, matchId }),
      });
      mutate();
    } catch (err) {
      console.error("[handleStart] error:", err);
    }
  };

  // ── Loading
  if (data === undefined) {
    return (
      <div className="tab-content py-20 text-center">
        <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.3em] uppercase text-white/20">Loading bracket...</p>
      </div>
    );
  }

  // ── Generating
  if (cooldownMs > 0 || generating) {
    return (
      <div className="tab-content py-20 text-center">
        <div className="w-12 h-12 border border-[rgba(139,92,246,0.2)] mx-auto mb-4 flex items-center justify-center animate-pulse"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M3 6H21M3 12H15M3 18H9" stroke="#8b5cf6" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.3em] uppercase text-white/20">
          {generating ? "Generating brackets..." : "Brackets generating soon..."}
        </p>
      </div>
    );
  }

  // ── Not yet ready
  if (!bracket) {
    const readyAt = new Date(t.registration_deadline).getTime();
    if (Date.now() < readyAt) {
      return (
        <div className="tab-content py-20 text-center">
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.3em] uppercase text-white/20">
            Brackets will be generated after registration closes
          </p>
        </div>
      );
    }
    return null;
  }

  const hasLive = bracket.matches.some((m: any) => m.status === "live");

  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">
            {t.format_rules}
          </p>
          <h3 className="font-[Cinzel,serif] text-xl font-bold text-white">Tournament Bracket</h3>
        </div>
        <div className="flex items-center gap-4">
          {hasLive && (
            <>
              <div className="flex items-center gap-2 text-[#22c55e] text-[0.65rem] tracking-widest font-[Rajdhani,sans-serif]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                LIVE
              </div>
              {pollingEnabled ? (
                <button
                  onClick={() => setPollingEnabled(false)}
                  className="px-4 py-2 font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#f87171] hover:bg-[rgba(248,113,113,0.2)] transition-colors"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                  Stop Polling
                </button>
              ) : (
                <button
                  onClick={() => setPollingEnabled(true)}
                  className="px-4 py-2 font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] hover:bg-[rgba(34,197,94,0.2)] transition-colors"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                  Resume Polling
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {bracket.type === "standard" ? (
        <StandardBracket
          matches={bracket.matches}
          onStart={handleStart}
          currentPlayerTag={currentPlayerTag}
        />
      ) : (
        <ByeBracket
          matches={bracket.matches}
          onStart={handleStart}
          currentPlayerTag={currentPlayerTag}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function TournamentDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const currentPlayerTag = (session?.user as any)?.player_tag;
  const t = TOURNAMENT;
  const meta = TOURNAMENT_META;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [registrations, setRegistrations] = useState<Tournament_Registration[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [checkingJoin, setCheckingJoin] = useState(true);

  // LIFTABLE SWR FETCH
  const { data: bracketData, mutate: mutateBracket } = useSWR(
    `/api/tournaments/brackets?id=${meta.id}`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );
  const bracket: BracketDocument | null = bracketData?.bracket ?? null;

  const sk = (t.status in STATUS_CFG ? t.status : "upcoming") as keyof typeof STATUS_CFG;
  const st = STATUS_CFG[sk];
  const isUnlimited = t.participants_limit === 0;
  const isFull = !isUnlimited && registrations.length >= t.participants_limit;

  useEffect(() => {
    const init = async () => {
      const [checkRes, regsRes] = await Promise.all([
        fetch("/api/tournaments/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tournamentId: meta.id }),
        }),
        fetch(`/api/tournaments/registrations?id=${meta.id}`),
      ]);
      const checkData = await checkRes.json();
      const regsData = await regsRes.json();
      setIsJoined(checkData.joined);
      setRegistrations(regsData.registrations ?? []);
      setCheckingJoin(false);
    };
    init();
  }, [meta.id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch("/api/tournaments/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: meta.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to join"); return; }
      setIsJoined(true);
      const regsRes = await fetch(`/api/tournaments/registrations?id=${meta.id}`);
      const regsData = await regsRes.json();
      setRegistrations(regsData.registrations ?? []);
    } catch {
      alert("Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gridFade { from { opacity: 0; } to { opacity: 0.025; } }
        @keyframes livePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } }
        @keyframes tabSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .anim-grid { animation: gridFade 2s ease forwards; }
        .page-fade-1 { animation: fadeUp 0.5s ease forwards 0.05s; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.5s ease forwards 0.15s; opacity: 0; }
        .page-fade-3 { animation: fadeUp 0.5s ease forwards 0.25s; opacity: 0; }
        .page-fade-4 { animation: fadeUp 0.5s ease forwards 0.35s; opacity: 0; }
        .live-dot { animation: livePulse 1.4s ease-in-out infinite; }
        .tab-content { animation: tabSlide 0.3s ease forwards; }
        .update-scroll::-webkit-scrollbar { width: 2px; }
        .update-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); }
        .section-divide { height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent); }
        .join-btn { clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%); background: linear-gradient(135deg, #a78bfa, #8b5cf6); transition: all 0.3s ease; }
        .join-btn:hover:not(:disabled) { box-shadow: 0 0 30px rgba(139,92,246,0.6); transform: translateY(-1px); }
        .join-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen bg-[#050510] relative">
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)", backgroundSize: "70px 70px", zIndex: 0 }} />
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)", zIndex: 0 }} />

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 md:px-8 pt-28 pb-20">

          <div className="page-fade-1 mb-6">
            <Link href="/tournaments"
              className="inline-flex items-center gap-2 font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] uppercase text-white/30 hover:text-[#a78bfa] transition-colors duration-200 no-underline">
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Tournaments
            </Link>
          </div>

          <div className="page-fade-2 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] text-white/20">{meta.id}</span>
                  <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5"
                    style={{ color: t.visibility === "private" ? "#06b6d4" : "#a78bfa", border: `1px solid ${t.visibility === "private" ? "rgba(6,182,212,0.35)" : "rgba(167,139,250,0.3)"}`, background: t.visibility === "private" ? "rgba(6,182,212,0.07)" : "rgba(139,92,246,0.07)", clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                    {t.visibility === "private" ? "PRIVATE" : "PUBLIC"} TOURNAMENT
                  </span>
                  <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5 flex items-center gap-1.5"
                    style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                    {sk === "ongoing" && <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />}
                    {st.label}
                  </span>
                </div>
                <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.04em] mb-1"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>{t.title}</h1>
                <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/30 tracking-wide">
                  {t.game_id.replace("_", " ")} · {t.single_player ? "1v1 Solo" : "Team"} · {t.format_rules}
                </p>
                <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/20 tracking-wide mt-0.5">
                  {meta.arena}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                {checkingJoin ? (
                  <button disabled className="join-btn px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.88rem] tracking-[0.2em] uppercase text-white">...</button>
                ) : isJoined ? (
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <div className="flex items-center gap-2 px-4 py-1.5 border border-[#22c55e]/30 bg-[rgba(34,197,94,0.05)]"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase text-[#22c55e]">Registered</span>
                    </div>
                    <p className="font-[Rajdhani,sans-serif] text-[0.62rem] text-white/20 tracking-wide">
                      You're in! See you on {fmt(t.start_date)}.
                    </p>
                  </div>
                ) : (
                  <>
                    <button onClick={handleJoin} disabled={joining || isFull}
                      className="join-btn px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.88rem] tracking-[0.2em] uppercase text-white">
                      {joining ? "Registering..." : isFull ? "Slots Full" : "Register Now"}
                    </button>
                    {(t.status === "upcoming" || t.status === "registration_open") && (
                      <p className="font-[Rajdhani,sans-serif] text-[0.62rem] text-white/20 tracking-wide">
                        Registration closes {fmtTime(t.registration_deadline)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="page-fade-3 grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatBox label="Prize Pool" value={t.prize_pool > 0 ? `₹${t.prize_pool.toLocaleString()}` : meta.prize_label} accent />
            <StatBox label="Players"    value={`${registrations.length}${!isUnlimited ? ` / ${t.participants_limit}` : ""}`} />
            <StatBox label="Start"      value={fmtTime(t.start_date)} />
            <StatBox label="End"        value={fmtTime(t.end_date)} />
          </div>

          <div className="section-divide mb-6" />

          <div className="page-fade-4 flex items-end gap-6 md:gap-8 border-b border-[rgba(139,92,246,0.1)] mb-8 overflow-x-auto pb-px">
            <Tab active={activeTab === "overview"}     label="Overview"                              onClick={() => setActiveTab("overview")} />
            <Tab active={activeTab === "participants"} label={`Players (${registrations.length})`}   onClick={() => setActiveTab("participants")} />
            <Tab active={activeTab === "brackets"}     label="Bracket"                               onClick={() => setActiveTab("brackets")} />
            <Tab active={activeTab === "rankings"}     label="Rankings"                              onClick={() => setActiveTab("rankings")} />
            <Tab active={activeTab === "results"}      label="Results"                               onClick={() => setActiveTab("results")} />
          </div>

          {activeTab === "overview"     && <OverviewTab     t={t} meta={meta} registrations={registrations} />}
          {activeTab === "participants" && <ParticipantsTab t={t} registrations={registrations} />}
          {activeTab === "brackets"     && <BracketsTab     t={t} currentPlayerTag={currentPlayerTag} bracket={bracket} data={bracketData} mutate={mutateBracket} />}
          {activeTab === "rankings"     && <RankingsTab     t={t} registrations={registrations} bracket={bracket} />}
          {activeTab === "results"      && <ResultsTab      t={t} registrations={registrations} bracket={bracket} meta={meta} />}
        </div>
      </div>
    </>
  );
}