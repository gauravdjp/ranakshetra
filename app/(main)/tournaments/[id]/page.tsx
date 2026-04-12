"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Bracket from "@/components/bracket"
import Xarrow from "react-xarrows";


/* ─────────────────────────────────────────────────────────────
   MOCK DATA — same shape as tournaments/page.tsx
   Replace with DB fetch using the `id` param later.
   Every field here will map 1-to-1 with your DB schema.
───────────────────────────────────────────────────────────── */
const MOCK_TOURNAMENTS: Record<string, Tournament> = {
  "T001": {
    id: "T001", name: "XIE VALO LEAGUE", game: "VALORANT", type: "public",
    region: "Central India", rank: "All Ranks", status: "live",
    prize: "₹15,000", prizeBreakdown: ["₹8,000 — 1st", "₹4,500 — 2nd", "₹2,500 — 3rd"],
    slots: 64, filled: 58,
    startDate: "2026-03-14", endDate: "2026-03-16",
    registrationDeadline: "2026-03-13",
    organiser: "OMKAR", organiserContact: "skyarena@rk.gg",
    mode: "Squad", format: "Battle Royale · Single Elimination",
    rules: [
      "All participants must be 16+.",
      "Squad of 4. Substitutes not allowed mid-tournament.",
      "Any hacking, teaming, or abuse of bugs leads to immediate disqualification.",
      "Organisers' decision is final on all disputes.",
      "Match times are fixed — late joiners forfeit the match.",
    ],
    updates: [
      { time: "2026-03-14 · 11:30", text: "Match 3 — MYSTIC FC vs NOVA GUILD completed. MYSTIC FC advances." },
      { time: "2026-03-14 · 10:00", text: "Day 1 has officially begun. All 58 squads confirmed." },
      { time: "2026-03-13 · 18:00", text: "Registration closed. Bracket seeding finalised." },
      { time: "2026-03-12 · 09:00", text: "Tournament announced. Registration open." },
    ],
    participants: [
      { rank: 1, name: "OMKAR1", tag: "MFC", region: "Bangalore", status: "active" },
      { rank: 2, name: "OMKAR2", tag: "APEX", region: "Hyderabad", status: "active" },
      { rank: 3, name: "OMKAR3", tag: "SU", region: "Delhi", status: "active" },
      { rank: 4, name: "OMKAR4", tag: "PCR", region: "Mumbai", status: "active" },
      { rank: 5, name: "OMKAR5", tag: "BF", region: "Chennai", status: "eliminated" },
      { rank: 6, name: "OMKAR6", tag: "NVG", region: "Pune", status: "eliminated" },
      { rank: 7, name: "OMKAR7", tag: "WFC", region: "Kolkata", status: "active" },
      { rank: 8, name: "OMKAR8", tag: "ZH", region: "Bengaluru", status: "active" },
      { rank: 9, name: "OMKAR9", tag: "IW", region: "Ahmedabad", status: "active" },
      { rank: 10, name: "OMKAR10", tag: "GR", region: "Jaipur", status: "active" },
      { rank: 11, name: "OMKAR11", tag: "NB", region: "Lucknow", status: "active" },
      { rank: 12, name: "OMKAR12", tag: "CW", region: "Kochi", status: "active" },
    ],
  },
  "T005": {
    id: "T005", name: "CS2 Pro Invitational", game: "CS2", type: "public",
    region: "Global", rank: "Semi-Pro+", status: "upcoming",
    prize: "₹1,00,000", prizeBreakdown: ["₹60,000 — 1st", "₹25,000 — 2nd", "₹15,000 — 3rd"],
    slots: 16, filled: 9,
    startDate: "2026-03-25", endDate: "2026-03-27",
    registrationDeadline: "2026-03-23",
    organiser: "RK Premier League", organiserContact: "premier@rk.gg",
    mode: "5v5", format: "Double Elimination · Best of 3",
    rules: [
      "Teams must be Semi-Pro rank or above.",
      "5 players + 1 substitute allowed.",
      "All matches played on official RK servers.",
      "Coaches may communicate during timeouts only.",
      "Anti-cheat software mandatory. VAC bans = instant disqualification.",
    ],
    updates: [
      { time: "2026-03-12 · 14:00", text: "Registration open. 9 of 16 slots filled." },
      { time: "2026-03-10 · 09:00", text: "CS2 Pro Invitational officially announced." },
    ],
    participants: [
      { rank: 1, name: "TEAM CIPHER", tag: "CPH", region: "Bangalore", status: "active" },
      { rank: 2, name: "NULL POINTER", tag: "NLP", region: "Mumbai", status: "active" },
      { rank: 3, name: "VELOCITY", tag: "VLC", region: "Delhi", status: "active" },
      { rank: 4, name: "OVERDRIVE", tag: "OD", region: "Global", status: "active" },
      { rank: 5, name: "SHADE OPS", tag: "SHD", region: "Chennai", status: "active" },
      { rank: 6, name: "IRONCLAD", tag: "IRC", region: "Hyderabad", status: "active" },
      { rank: 7, name: "PHASE SHIFT", tag: "PHS", region: "Global", status: "active" },
      { rank: 8, name: "VOID WALKER", tag: "VW", region: "Pune", status: "active" },
      { rank: 9, name: "RIPTIDE", tag: "RPT", region: "Kolkata", status: "active" },
    ],
  },
};

/* ── Fallback for unknown IDs */
const FALLBACK: Tournament = MOCK_TOURNAMENTS["T001"];

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type TabId = "overview" | "participants" | "brackets";

interface Participant {
  rank: number; name: string; tag: string; region: string;
  status: "active" | "eliminated";
}
interface Update { time: string; text: string; }
interface Tournament {
  id: string; name: string; game: string; type: string;
  region: string; rank: string; status: string;
  prize: string; prizeBreakdown: string[];
  slots: number; filled: number;
  startDate: string; endDate: string; registrationDeadline: string;
  organiser: string; organiserContact: string;
  mode: string; format: string;
  rules: string[];
  updates: Update[];
  participants: Participant[];
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fillPct(t: Tournament) { return Math.round((t.filled / t.slots) * 100); }

const STATUS_CFG = {
  live:     { label: "LIVE NOW",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.4)" },
  upcoming: { label: "UPCOMING",  color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)" },
  ended:    { label: "ENDED",     color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.3)" },
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

/* ── Stat box — used in the top info strip */
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

/* ── Tab button */
function Tab({ id, active, label, onClick }: { id: TabId; active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="relative font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.2em] uppercase pb-3 px-1 transition-all duration-200"
      style={{ color: active ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
      {label}
      {/* Active underline */}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }} />
      )}
    </button>
  );
}

/* ── Countdown timer */
function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const calc = () => setDiff(Math.max(0, new Date(target).getTime() - Date.now()));
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [target]);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (diff === 0) return <span className="text-[#22c55e]">Started</span>;

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
function OverviewTab({ t }: { t: Tournament }) {
  const pct = fillPct(t);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 tab-content">

      {/* ── LEFT: Details + Rules */}
      <div className="lg:col-span-2 space-y-6">

        {/* Tournament timeline */}
        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Schedule</p>

          {/* Vertical timeline */}
          <div className="relative pl-5">
            {/* Vertical line */}
            <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-[#8b5cf6] via-[rgba(139,92,246,0.3)] to-transparent" />

            {[
              { label: "Registration Closes", date: t.registrationDeadline, done: true },
              { label: "Tournament Begins", date: t.startDate, done: t.status === "live" || t.status === "ended" },
              { label: "Tournament Ends", date: t.endDate, done: t.status === "ended" },
            ].map((item, i) => (
              <div key={i} className="relative mb-5 last:mb-0">
                {/* Dot on the line */}
                <div className="absolute -left-5 top-1 w-2 h-2 border"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    borderColor: item.done ? "#8b5cf6" : "rgba(139,92,246,0.3)",
                    background: item.done ? "rgba(139,92,246,0.4)" : "transparent",
                  }} />
                <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.2em] uppercase text-white/30 mb-0.5">{item.label}</p>
                <p className="font-[Rajdhani,sans-serif] font-semibold text-[0.95rem] text-white/80">{fmt(item.date)}</p>
              </div>
            ))}
          </div>

          {/* Countdown — only for upcoming */}
          {t.status === "upcoming" && (
            <div className="mt-5 pt-4 border-t border-[rgba(139,92,246,0.1)] flex items-center gap-3">
              <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.25em] uppercase text-white/25">Starts in</span>
              <Countdown target={`${t.startDate}T10:00:00`} />
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Rules & Format</p>
          <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-[rgba(139,92,246,0.6)] mb-4 tracking-wide">{t.format}</p>
          <ul className="space-y-3">
            {t.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                {/* Diamond bullet */}
                <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rotate-45 bg-[rgba(139,92,246,0.5)]" />
                <span className="font-[Rajdhani,sans-serif] text-[0.82rem] text-white/50 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prize breakdown */}
        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-6"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Prize Pool</p>
          {t.prizeBreakdown.map((p, i) => (
            <div key={i} className="flex items-center gap-4 mb-3 last:mb-0">
              {/* Trophy rank indicator */}
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

      {/* ── RIGHT: Organiser + Slots + Updates */}
      <div className="space-y-6">

        {/* Organiser panel */}
        <div className="border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.03)] p-5"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-4">Organiser</p>

          {/* Arena name */}
          <div className="flex items-center gap-3 mb-3">
            {/* Crown icon */}
            <div className="w-9 h-9 border border-[rgba(139,92,246,0.3)] flex items-center justify-center bg-[rgba(139,92,246,0.08)] flex-shrink-0"
              style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M2 14L4.5 6L8 10L10 4L12 10L15.5 6L18 14H2Z" stroke="#8b5cf6" strokeWidth="1.3" strokeLinejoin="round" />
                <line x1="2" y1="16.5" x2="18" y2="16.5" stroke="#8b5cf6" strokeWidth="1.3" />
              </svg>
            </div>
            <div>
              <p className="font-[Cinzel,serif] font-bold text-white text-[0.9rem]">{t.organiser}</p>
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/30">{t.organiserContact}</p>
            </div>
          </div>

          <div className="section-divide my-3" />

          <div className="space-y-2">
            {[
              { label: "Game", val: t.game },
              { label: "Mode", val: t.mode },
              { label: "Region", val: t.region },
              { label: "Min Rank", val: t.rank },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.15em] uppercase text-white/25">{label}</span>
                <span className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/60">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slot meter */}
        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-5"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <div className="flex justify-between items-center mb-3">
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6]">Participants</p>
            <p className="font-[Rajdhani,sans-serif] font-bold text-white/70 text-[0.85rem]">{t.filled} / {t.slots}</p>
          </div>
          {/* Big fill bar */}
          <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] mb-2" style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
            <div className="h-full transition-all duration-700"
              style={{
                width: `${fillPct(t)}%`,
                background: fillPct(t) >= 100 ? "#f87171" : fillPct(t) > 75
                  ? "linear-gradient(90deg, #8b5cf6, #f59e0b)"
                  : "linear-gradient(90deg, #8b5cf6, #a78bfa)"
              }} />
          </div>
          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/25">
            {t.slots - t.filled > 0 ? `${t.slots - t.filled} slots remaining` : "All slots filled"}
          </p>
        </div>

        {/* Live updates feed */}
        <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.02)] p-5"
          style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
          <div className="flex items-center gap-2 mb-4">
            {t.status === "live" && <span className="live-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />}
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6]">
              {t.status === "live" ? "Live Updates" : "Updates"}
            </p>
          </div>
          <div className="space-y-4 max-h-[280px] overflow-y-auto update-scroll pr-1">
            {t.updates.map((u, i) => (
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
function ParticipantsTab({ t }: { t: Tournament }) {
  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-4">
        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6]">
          Registered Participants — {t.filled} / {t.slots}
        </p>
        <div className="flex items-center gap-4 text-[0.6rem] font-[Rajdhani,sans-serif] tracking-[0.15em] uppercase">
          <span className="flex items-center gap-1.5 text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" /> Active
          </span>
          <span className="flex items-center gap-1.5 text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" /> Eliminated
          </span>
        </div>
      </div>

      {/* Table header */}
      <div className="grid items-center gap-4 px-4 py-2 border-b border-[rgba(139,92,246,0.1)] mb-1"
        style={{ gridTemplateColumns: "40px 1fr 100px 140px 80px" }}>
        {["#", "Team / Player", "Tag", "Region", "Status"].map(h => (
          <span key={h} className="font-[Rajdhani,sans-serif] text-[0.56rem] tracking-[0.25em] uppercase text-white/20">{h}</span>
        ))}
      </div>

      {/* Participant rows */}
      <div className="space-y-px">
        {t.participants.map((p, i) => (
          <div key={i}
            className="grid items-center gap-4 px-4 py-3 border-b border-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.04)] transition-colors duration-150 group"
            style={{ gridTemplateColumns: "40px 1fr 100px 140px 80px", opacity: p.status === "eliminated" ? 0.45 : 1 }}>

            {/* Rank number */}
            <span className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/25">
              {String(p.rank).padStart(2, "0")}
            </span>

            {/* Name */}
            <div className="flex items-center gap-2">
              {/* Status bar */}
              <div className="w-0.5 h-5 flex-shrink-0"
                style={{ background: p.status === "active" ? "#8b5cf6" : "#f87171" }} />
              <span className="font-[Cinzel,serif] font-bold text-[0.82rem] group-hover:text-[#a78bfa] transition-colors"
                style={{ color: p.status === "eliminated" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.85)" }}>
                {p.name}
              </span>
            </div>

            {/* Tag */}
            <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em]"
              style={{
                color: p.status === "active" ? "rgba(167,139,250,0.7)" : "rgba(255,255,255,0.2)",
                border: "1px solid",
                borderColor: p.status === "active" ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.08)",
                padding: "2px 8px",
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)",
                background: p.status === "active" ? "rgba(139,92,246,0.06)" : "transparent",
                display: "inline-block"
              }}>
              [{p.tag}]
            </span>

            {/* Region */}
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35">{p.region}</span>

            {/* Status */}
            <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.2em] uppercase"
              style={{ color: p.status === "active" ? "#22c55e" : "#f87171" }}>
              {p.status}
            </span>
          </div>
        ))}

        {/* Empty slots — show remaining unfilled */}
        {Array.from({ length: t.slots - t.participants.length }).map((_, i) => (
          <div key={`empty-${i}`}
            className="grid items-center gap-4 px-4 py-3 border-b border-[rgba(139,92,246,0.04)]"
            style={{ gridTemplateColumns: "40px 1fr 100px 140px 80px", opacity: 0.25 }}>
            <span className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/15">
              {String(t.participants.length + i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-5 bg-white/10" />
              <span className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/20 tracking-[0.1em]">— OPEN SLOT —</span>
            </div>
            <span />
            <span />
            <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.2em] uppercase text-white/15">open</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BRACKETS TAB — placeholder
───────────────────────────────────────────────────────────── */
function BracketsTab({ t }: { t: Tournament }) {
  const CARD_W = 220;
  const COL_GAP = 140;
  const COL_W = CARD_W + COL_GAP;
  const SLOT_H = 150;

  const getPos = (round: number, index: number) => {
    const x = round * COL_W;
    const slotH = SLOT_H * Math.pow(2, round);
    const y = index * slotH + (slotH / 2 - 95 / 2);
    return { x, y };
  };

  const rounds = ["Quarter Finals", "Semi Finals", "Final"];

  const matches: Array<{ round: number; index: number }> = [
    { round: 0, index: 0 },
    { round: 0, index: 1 },
    { round: 0, index: 2 },
    { round: 0, index: 3 },
    { round: 1, index: 0 },
    { round: 1, index: 1 },
    { round: 2, index: 0 },
  ];

  const connections: Array<{ from: string; to: string }> = [
    { from: "i-r0m0", to: "i-r1m0" },
    { from: "i-r0m1", to: "i-r1m0" },
    { from: "i-r0m2", to: "i-r1m1" },
    { from: "i-r0m3", to: "i-r1m1" },
    { from: "i-r1m0", to: "i-r2m0" },
    { from: "i-r1m1", to: "i-r2m0" },
  ];

  const totalH = SLOT_H * 4 + 60;
  const totalW = COL_W * 3 + 60;

  return (
    <div className="tab-content">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">
            Single Elimination · 8 Teams
          </p>
          <h3 className="font-[Cinzel,serif] text-xl font-bold text-white">Tournament Bracket</h3>
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 24 }}>
        <div style={{ position: "relative", width: totalW, height: totalH, minWidth: 750 }}>

          {/* Round labels */}
          {rounds.map((label, round) => {
            const { x } = getPos(round, 0);
            return (
              <div key={label} style={{
                position: "absolute",
                left: x,
                top: 0,
                width: CARD_W,
                textAlign: "center",
                fontFamily: "Rajdhani, sans-serif",
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(139,92,246,0.5)",
              }}>{label}</div>
            );
          })}

          {/* Matches */}
          {matches.map(({ round, index }) => {
            const { x, y } = getPos(round, index);
            const id = `r${round}m${index}`;
            return (
              <div key={id} style={{ position: "absolute", left: x, top: y + 24 }}>
                <div id={`i-${id}`} style={{ display: "inline-block" }}>
                  <Bracket id={`i-${id}-info`} />
                </div>
              </div>
            );
          })}

          {/* Xarrows */}
          {connections.map(({ from, to }) => (
            <Xarrow
              key={`${from}-${to}`}
              start={from}
              end={to}
              color="rgba(139,92,246,0.5)"
              strokeWidth={1.5}
              headSize={0}
              path="grid"
              gridBreak ="50%"
              startAnchor={{ position: "right", offset: { x: 0, y: 20 } }}
              endAnchor={{ position: "left", offset: { x: 30, y: 20 } }}
            />
          ))}

        </div>
      </div>
    </div>
  );
}
/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function TournamentDetailPage() {
  const params = useParams();
  const id = (params?.id as string)?.toUpperCase();
  const t = MOCK_TOURNAMENTS[id] ?? FALLBACK;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const sk = (t.status in STATUS_CFG ? t.status : "upcoming") as keyof typeof STATUS_CFG;
  const st = STATUS_CFG[sk];
  const pct = fillPct(t);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.025; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.8); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bracketFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes tabSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-grid { animation: gridFade 2s ease forwards; }
        .page-fade-1 { animation: fadeUp 0.5s ease forwards 0.05s; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.5s ease forwards 0.15s; opacity: 0; }
        .page-fade-3 { animation: fadeUp 0.5s ease forwards 0.25s; opacity: 0; }
        .page-fade-4 { animation: fadeUp 0.5s ease forwards 0.35s; opacity: 0; }

        .live-dot { animation: livePulse 1.4s ease-in-out infinite; }
        .bracket-float { animation: bracketFloat 3s ease-in-out infinite; }
        .tab-content { animation: tabSlide 0.3s ease forwards; }

        /* Scrollbars */
        .update-scroll::-webkit-scrollbar { width: 2px; }
        .update-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); }

        /* Section divider */
        .section-divide {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent);
        }

        /* Join button */
        .join-btn {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          transition: all 0.3s ease;
        }
        .join-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(139,92,246,0.6);
          transform: translateY(-1px);
        }
        .join-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen bg-[#050510] relative">

        {/* Background grid */}
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "70px 70px", zIndex: 0
          }}
        />
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)", zIndex: 0 }} />

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 md:px-8 pt-28 pb-20">

          {/* ── BACK LINK */}
          <div className="page-fade-1 mb-6">
            <Link href="/tournaments"
              className="inline-flex items-center gap-2 font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] uppercase text-white/30 hover:text-[#a78bfa] transition-colors duration-200 no-underline">
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Operations Board
            </Link>
          </div>

          {/* ══════════════════════════════════════════════
              HERO HEADER
          ══════════════════════════════════════════════ */}
          <div className="page-fade-2 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

              {/* Left: title block */}
              <div>
                {/* Type + Status row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {/* Tournament ID */}
                  <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] text-white/20">{t.id}</span>

                  {/* Type badge */}
                  <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5"
                    style={{
                      color: t.type === "club" ? "#06b6d4" : "#a78bfa",
                      border: `1px solid ${t.type === "club" ? "rgba(6,182,212,0.35)" : "rgba(167,139,250,0.3)"}`,
                      background: t.type === "club" ? "rgba(6,182,212,0.07)" : "rgba(139,92,246,0.07)",
                      clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)"
                    }}>
                    {t.type === "club" ? "CLUB TOURNAMENT" : "PUBLIC TOURNAMENT"}
                  </span>

                  {/* Status pill */}
                  <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5 flex items-center gap-1.5"
                    style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                    {sk === "live" && <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />}
                    {st.label}
                  </span>
                </div>

                <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.04em] mb-1"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>
                  {t.name}
                </h1>
                <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/30 tracking-wide">
                  {t.game} · {t.mode} · {t.format}
                </p>
              </div>

              {/* Right: Join button */}
              <div className="flex flex-col items-end gap-2">
                <button
                  disabled={t.filled >= t.slots}
                  className="join-btn px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.88rem] tracking-[0.2em] uppercase text-white"
                >
                  {t.filled >= t.slots ? "Slots Full" : "Register Now"}
                </button>
                {t.status === "upcoming" && (
                  <p className="font-[Rajdhani,sans-serif] text-[0.62rem] text-white/20 tracking-wide">
                    Registration closes {fmt(t.registrationDeadline)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── QUICK STAT STRIP */}
          <div className="page-fade-3 grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatBox label="Prize Pool" value={t.prize} accent />
            <StatBox label="Slots" value={`${t.filled} / ${t.slots}`} />
            <StatBox label="Start Date" value={fmt(t.startDate)} />
            <StatBox label="End Date" value={fmt(t.endDate)} />
          </div>

          {/* ── Thin divider */}
          <div className="section-divide mb-6" />

          {/* ════════════════════════════════════════════
              TAB BAR
          ════════════════════════════════════════════ */}
          <div className="page-fade-4 flex items-end gap-8 border-b border-[rgba(139,92,246,0.1)] mb-8">
            <Tab id="overview"     active={activeTab === "overview"}     label="Overview"     onClick={() => setActiveTab("overview")} />
            <Tab id="participants" active={activeTab === "participants"} label={`Participants (${t.filled})`} onClick={() => setActiveTab("participants")} />
            <Tab id="brackets"     active={activeTab === "brackets"}     label="Bracket"      onClick={() => setActiveTab("brackets")} />
          </div>

          {/* ════════════════════════════════════════════
              TAB CONTENT
          ════════════════════════════════════════════ */}
          {activeTab === "overview"     && <OverviewTab     t={t} />}
          {activeTab === "participants" && <ParticipantsTab t={t} />}
          {activeTab === "brackets"     && <BracketsTab     t={t} />}

        </div>
      </div>
    </>
  );
}