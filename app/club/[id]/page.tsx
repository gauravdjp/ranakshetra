"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type SkillTag = "Pro" | "Intermediate" | "Noob";
type Position = "Leader" | "Co-Leader" | "IGL" | "Fragger" | "Support" | "Sniper" | "Entry" | "Anchor" | "Scout" | "Flex";
type PlayerCategory = "representing" | "core" | "reserve" | "trial";

interface Player {
  id: string;
  name: string;
  ign: string;
  position: Position;
  clubRank: number;        // position in club hierarchy (1 = top)
  skillTag: SkillTag;
  category: PlayerCategory;
  wins: number;
  tournaments: number;
  joinedYear: string;
  avatarSeed: string;      // used to generate a unique gradient avatar
  country: string;
  game: string;
}

interface Club {
  id: string;
  name: string;
  tag: string;
  game: string;
  region: string;
  city: string;
  founded: string;
  leader: string;
  wins: number;
  tournaments: number;
  rank: string;
  status: string;
  bio: string;
  achievements: string[];
  socials: { discord?: string; instagram?: string };
  seats: number;
  filled: number;
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */
const CLUBS: Record<string, Club> = {
  "c001": {
    id: "c001", name: "Mystic Phoenix", tag: "MPX", game: "BGMI",
    region: "South India", city: "Bangalore", founded: "2024", leader: "ShadowX",
    wins: 12, tournaments: 28, rank: "Semi-Pro", status: "recruiting",
    bio: "South India's most feared BGMI squad. Born from the ranked trenches of Bangalore, MPX has climbed from Amateur to Semi-Pro in under a year. We play disciplined, we play smart — and when it matters, we play to win.",
    achievements: ["RK South India Open — 1st Place", "BGMI Regional Qualifiers — Top 4", "City Cup Champion 2024", "12 Tournament Wins"],
    socials: { discord: "discord.gg/mpx", instagram: "@mysticphoenixgg" },
    seats: 8, filled: 6,
  },
};

const PLAYERS: Player[] = [
  // ── REPRESENTING (active in current tournament)
  { id: "p1",  name: "Arjun Sharma",  ign: "ShadowX",    position: "IGL",     clubRank: 1, skillTag: "Pro",          category: "representing", wins: 9,  tournaments: 20, joinedYear: "2024", avatarSeed: "a", country: "🇮🇳", game: "BGMI" },
  { id: "p2",  name: "Ravi Menon",    ign: "PhantomRK",   position: "Fragger", clubRank: 2, skillTag: "Pro",          category: "representing", wins: 8,  tournaments: 18, joinedYear: "2024", avatarSeed: "b", country: "🇮🇳", game: "BGMI" },
  { id: "p3",  name: "Kiran Nair",    ign: "ViperKN",     position: "Support", clubRank: 3, skillTag: "Intermediate", category: "representing", wins: 7,  tournaments: 17, joinedYear: "2024", avatarSeed: "c", country: "🇮🇳", game: "BGMI" },
  { id: "p4",  name: "Dev Pillai",    ign: "ZeroGravDev", position: "Sniper",  clubRank: 4, skillTag: "Intermediate", category: "representing", wins: 6,  tournaments: 15, joinedYear: "2024", avatarSeed: "d", country: "🇮🇳", game: "BGMI" },
  // ── CORE (regular members not in active tournament)
  { id: "p5",  name: "Sai Krishnan",  ign: "SaiStrike",   position: "Entry",   clubRank: 5, skillTag: "Intermediate", category: "core",         wins: 4,  tournaments: 10, joinedYear: "2024", avatarSeed: "e", country: "🇮🇳", game: "BGMI" },
  { id: "p6",  name: "Rohan Das",     ign: "RD_Anchor",   position: "Anchor",  clubRank: 6, skillTag: "Intermediate", category: "core",         wins: 3,  tournaments: 8,  joinedYear: "2025", avatarSeed: "f", country: "🇮🇳", game: "BGMI" },
  // ── RESERVE
  { id: "p7",  name: "Aakash Rao",    ign: "AK_Wildfire", position: "Scout",   clubRank: 7, skillTag: "Noob",         category: "reserve",      wins: 1,  tournaments: 3,  joinedYear: "2025", avatarSeed: "g", country: "🇮🇳", game: "BGMI" },
  { id: "p8",  name: "Nikhil Bhat",   ign: "NB_Ranger",   position: "Flex",    clubRank: 8, skillTag: "Noob",         category: "reserve",      wins: 0,  tournaments: 1,  joinedYear: "2025", avatarSeed: "h", country: "🇮🇳", game: "BGMI" },
];

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────── */
const SKILL_CFG = {
  Pro:          { color: "#f59e0b", glow: "rgba(245,158,11,0.35)",  bg: "rgba(245,158,11,0.1)",  label: "PRO"          },
  Intermediate: { color: "#8b5cf6", glow: "rgba(139,92,246,0.35)", bg: "rgba(139,92,246,0.1)",  label: "INTERMEDIATE" },
  Noob:         { color: "#06b6d4", glow: "rgba(6,182,212,0.35)",  bg: "rgba(6,182,212,0.1)",   label: "ROOKIE"       },
};

const CATEGORY_CFG = {
  representing: { label: "Active Duty",     accent: "#f59e0b" },
  core:         { label: "Core Roster",     accent: "#8b5cf6" },
  reserve:      { label: "Reserve Bench",   accent: "#06b6d4" },
  trial:        { label: "On Trial",        accent: "#6b7280" },
};

// Deterministic avatar gradient from seed letter
const AVATAR_GRADIENTS: Record<string, [string, string, string]> = {
  a: ["#f59e0b", "#ef4444", "#1e0a00"],
  b: ["#8b5cf6", "#ec4899", "#0d0014"],
  c: ["#06b6d4", "#3b82f6", "#000d14"],
  d: ["#22c55e", "#06b6d4", "#00140a"],
  e: ["#f97316", "#f59e0b", "#140800"],
  f: ["#a855f7", "#8b5cf6", "#0a0014"],
  g: ["#14b8a6", "#06b6d4", "#00100e"],
  h: ["#ef4444", "#f97316", "#140000"],
};

function avatarBg(seed: string) {
  const [c1, c2] = AVATAR_GRADIENTS[seed] ?? ["#8b5cf6", "#06b6d4"];
  return `linear-gradient(135deg, ${c1}44 0%, ${c2}22 60%, transparent 100%)`;
}
function avatarInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─────────────────────────────────────────────────────────────
   REPRESENTING CARD — holographic foil style, large, premium
───────────────────────────────────────────────────────────── */
function RepresentingCard({ player, index }: { player: Player; index: number }) {
  const [hovered, setHovered] = useState(false);
  const skill = SKILL_CFG[player.skillTag];
  const [c1, c2, cbg] = AVATAR_GRADIENTS[player.avatarSeed] ?? ["#f59e0b", "#ef4444", "#1e0a00"];

  return (
    <div
      className="rep-card relative cursor-pointer select-none"
      style={{ animationDelay: `${index * 0.07}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow ring — intensifies on hover */}
      <div className="absolute -inset-[1px] transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${c1}66, transparent 40%, ${c2}44)`,
          clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
          opacity: hovered ? 1 : 0.5,
          filter: hovered ? `drop-shadow(0 0 16px ${c1}55)` : "none",
        }} />

      {/* Card body */}
      <div className="relative overflow-hidden"
        style={{
          clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
          background: `linear-gradient(160deg, #0d0d1f 0%, ${cbg} 50%, #080812 100%)`,
          border: `1px solid ${c1}33`,
        }}>

        {/* Holographic shine sweep on hover */}
        <div className="foil-shine absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: hovered ? 0.25 : 0,
            background: `linear-gradient(105deg, transparent 20%, ${c1}88 50%, transparent 80%)`,
            animation: hovered ? "shineSweep 1.4s ease infinite" : "none",
          }} />

        {/* ACTIVE DUTY ribbon */}
        <div className="absolute top-3 right-0 flex items-center gap-1.5 px-3 py-1"
          style={{ background: `linear-gradient(90deg, transparent, ${c1}22, ${c1}33)`, borderLeft: `2px solid ${c1}88` }}>
          <span className="active-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c1 }} />
          <span className="font-[Rajdhani,sans-serif] font-bold text-[0.52rem] tracking-[0.3em]" style={{ color: c1 }}>
            ACTIVE DUTY
          </span>
        </div>

        {/* Club rank badge */}
        <div className="absolute top-3 left-4 w-7 h-7 flex items-center justify-center border"
          style={{
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            borderColor: `${c1}55`,
            background: `${c1}22`,
          }}>
          <span className="font-[Cinzel,serif] font-black text-[0.6rem]" style={{ color: c1 }}>
            {player.clubRank}
          </span>
        </div>

        {/* Avatar area */}
        <div className="relative h-[140px] flex items-center justify-center mt-2"
          style={{ background: avatarBg(player.avatarSeed) }}>
          {/* Hex avatar frame */}
          <div className="relative w-20 h-20">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rotating-ring"
              style={{
                border: `1px solid ${c1}44`,
                borderRadius: "50%",
                borderTopColor: c1,
                animation: "rotateSlow 8s linear infinite",
              }} />
            {/* Avatar circle */}
            <div className="absolute inset-[6px] rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: `radial-gradient(circle, ${c1}33, ${c2}22, #0a0a18)`, border: `2px solid ${c1}55` }}>
              {/* Initials placeholder — swap with <Image> when you have real avatars */}
              <span className="font-[Cinzel,serif] font-black text-xl"
                style={{ color: c1, textShadow: `0 0 16px ${c1}` }}>
                {avatarInitials(player.name)}
              </span>
            </div>
            {/* Glow beneath */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3"
              style={{ background: `radial-gradient(ellipse, ${c1}44, transparent)`, filter: "blur(6px)" }} />
          </div>

          {/* Game tag */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-white/30">{player.game}</span>
          </div>
        </div>

        {/* Card body info */}
        <div className="px-4 pb-5 pt-3 text-center">
          {/* IGN — the star of the show */}
          <p className="font-[Cinzel,serif] font-black text-white text-[1.05rem] tracking-[0.05em] leading-tight mb-0.5"
            style={{ textShadow: hovered ? `0 0 20px ${c1}66` : "none", transition: "text-shadow 0.4s" }}>
            {player.ign}
          </p>
          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/30 mb-3">{player.name} {player.country}</p>

          {/* Position + Skill row */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-[Rajdhani,sans-serif] font-bold text-[0.6rem] tracking-[0.2em] uppercase px-2.5 py-1 border"
              style={{
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)"
              }}>
              {player.position}
            </span>
            <span className="font-[Rajdhani,sans-serif] font-bold text-[0.6rem] tracking-[0.2em] uppercase px-2.5 py-1 border"
              style={{
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                color: skill.color, borderColor: `${skill.color}55`,
                background: skill.bg, boxShadow: hovered ? `0 0 10px ${skill.glow}` : "none",
              }}>
              {skill.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between px-2 py-3 border-t border-[rgba(255,255,255,0.05)]">
            {[
              { label: "Wins", val: player.wins },
              { label: "Played", val: player.tournaments },
              { label: "Since", val: `'${player.joinedYear.slice(2)}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex-1 text-center">
                <p className="font-[Cinzel,serif] font-bold text-[0.95rem]" style={{ color: c1 }}>{val}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-white/25">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, transparent)` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REGULAR MEMBER CARD — angular, sharp, less flashy
───────────────────────────────────────────────────────────── */
function MemberCard({ player, index }: { player: Player; index: number }) {
  const [hovered, setHovered] = useState(false);
  const skill = SKILL_CFG[player.skillTag];
  const [c1] = AVATAR_GRADIENTS[player.avatarSeed] ?? ["#8b5cf6", "#06b6d4"];

  return (
    <div className="member-card relative cursor-pointer select-none"
      style={{ animationDelay: `${index * 0.06}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Hover border glow */}
      <div className="absolute -inset-[1px] transition-all duration-400"
        style={{
          background: `linear-gradient(135deg, ${skill.color}44, transparent 60%)`,
          clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
          opacity: hovered ? 1 : 0,
        }} />

      <div className="relative overflow-hidden transition-transform duration-300"
        style={{
          clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
          background: "linear-gradient(160deg, #0c0c1e 0%, #09091a 100%)",
          border: `1px solid ${hovered ? skill.color + "44" : "rgba(139,92,246,0.12)"}`,
          transform: hovered ? "translateY(-2px)" : "none",
        }}>

        {/* Top section: avatar + rank number */}
        <div className="relative h-[100px] flex items-center justify-center"
          style={{ background: avatarBg(player.avatarSeed) }}>

          {/* Rank diamond — top left */}
          <div className="absolute top-2 left-3 w-6 h-6 flex items-center justify-center"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background: `${skill.color}22`,
              border: `1px solid ${skill.color}44`,
            }}>
            <span className="font-[Cinzel,serif] font-black text-[0.55rem]" style={{ color: skill.color }}>
              {player.clubRank}
            </span>
          </div>

          {/* Avatar */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center relative"
            style={{ background: `radial-gradient(circle, ${c1}33, #0a0a18)`, border: `2px solid ${c1}33` }}>
            <span className="font-[Cinzel,serif] font-black text-base"
              style={{ color: c1, textShadow: `0 0 10px ${c1}66` }}>
              {avatarInitials(player.name)}
            </span>
            {/* Subtle pulse ring on hover */}
            {hovered && (
              <div className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${c1}55`, animation: "pulseRing 1.2s ease-out infinite" }} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-3 pb-4 pt-2.5 text-center">
          <p className="font-[Cinzel,serif] font-bold text-white text-[0.85rem] tracking-[0.04em] leading-tight mb-0.5">{player.ign}</p>
          <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/25 mb-2.5">{player.name} {player.country}</p>

          {/* Position badge */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="font-[Rajdhani,sans-serif] font-bold text-[0.58rem] tracking-[0.18em] uppercase px-2 py-0.5 border"
              style={{
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)",
                color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)"
              }}>
              {player.position}
            </span>
            <span className="font-[Rajdhani,sans-serif] font-bold text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 border"
              style={{
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)",
                color: skill.color, borderColor: `${skill.color}44`,
                background: skill.bg,
              }}>
              {skill.label}
            </span>
          </div>

          {/* Mini stats */}
          <div className="flex items-center justify-between px-1 pt-2.5 border-t border-[rgba(255,255,255,0.04)]">
            {[
              { label: "W", val: player.wins },
              { label: "T", val: player.tournaments },
            ].map(({ label, val }) => (
              <div key={label} className="flex-1 text-center">
                <p className="font-[Cinzel,serif] font-bold text-[0.9rem]" style={{ color: skill.color }}>{val}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.2em] uppercase text-white/20">{label === "W" ? "Wins" : "Played"}</p>
              </div>
            ))}
            <div className="flex-1 text-center">
              <p className="font-[Cinzel,serif] font-bold text-[0.9rem] text-white/40">`{player.joinedYear.slice(2)}</p>
              <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.2em] uppercase text-white/20">Since</p>
            </div>
          </div>
        </div>

        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300"
          style={{ background: hovered ? skill.color : `${skill.color}44` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER — category divider
───────────────────────────────────────────────────────────── */
function SectionHeader({ category, count }: { category: PlayerCategory; count: number }) {
  const cfg = CATEGORY_CFG[category];
  return (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
      {/* Vertical bar */}
      <div className="w-[3px] h-8 flex-shrink-0" style={{ background: cfg.accent }} />
      <div>
        <p className="font-[Cinzel,serif] font-bold text-white text-[1.05rem] tracking-[0.06em]">{cfg.label}</p>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.25em] uppercase text-white/25">{count} players</p>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${cfg.accent}44, transparent)` }} />
      {/* Category badge */}
      {category === "representing" && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 border"
          style={{
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            borderColor: `${cfg.accent}55`, background: `${cfg.accent}11`,
          }}>
          <span className="active-dot w-1.5 h-1.5 rounded-full" style={{ background: cfg.accent }} />
          <span className="font-[Rajdhani,sans-serif] font-bold text-[0.55rem] tracking-[0.25em] uppercase" style={{ color: cfg.accent }}>
            In Tournament
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT BOX
───────────────────────────────────────────────────────────── */
function StatBox({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="px-5 py-4 border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)]"
      style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
      <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/22 mb-1">{label}</p>
      <p className="font-[Cinzel,serif] font-bold text-[1.05rem]" style={{ color: accent ?? "rgba(255,255,255,0.8)" }}>{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function ClubDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string ?? "c001").toLowerCase();
  const club = CLUBS[rawId] ?? CLUBS["c001"];

  const byCategory = (cat: PlayerCategory) => PLAYERS.filter(p => p.category === cat);
  const representing = byCategory("representing");
  const core         = byCategory("core");
  const reserve      = byCategory("reserve");
  const trial        = byCategory("trial");

  const fillPct = Math.round((club.filled / club.seats) * 100);

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
        @keyframes shineSweep {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%)  skewX(-15deg); }
        }
        @keyframes rotateSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes activePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.75); }
        }
        @keyframes pulseRing {
          0%   { opacity: 0.7; transform: scale(1);   }
          100% { opacity: 0;   transform: scale(1.5); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes repCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }

        .anim-grid { animation: gridFade 2.5s ease forwards; }
        .page-h1  { animation: headerIn 0.5s ease forwards 0.05s; opacity: 0; }
        .page-h2  { animation: headerIn 0.5s ease forwards 0.12s; opacity: 0; }
        .page-h3  { animation: headerIn 0.5s ease forwards 0.2s;  opacity: 0; }
        .page-h4  { animation: headerIn 0.5s ease forwards 0.28s; opacity: 0; }

        .rep-card   { animation: repCardIn 0.5s ease forwards; opacity: 0; }
        .member-card { animation: cardIn 0.4s ease forwards; opacity: 0; }

        .active-dot { animation: activePulse 1.5s ease-in-out infinite; }

        /* Section divider */
        .sect-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); }
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
          style={{ background: "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)", zIndex: 0 }}
        />

        <div className="relative z-10 max-w-[1260px] mx-auto px-4 md:px-8 pt-28 pb-24">

          {/* ── BACK */}
          <div className="page-h1 mb-6">
            <Link href="/club"
              className="inline-flex items-center gap-2 font-[Rajdhani,sans-serif] text-[0.68rem] tracking-[0.22em] uppercase text-white/28 hover:text-[#a78bfa] transition-colors no-underline">
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Guild Registry
            </Link>
          </div>

          {/* ══════════════════════════════════════════
              CLUB HEADER BLOCK
          ══════════════════════════════════════════ */}
          <div className="page-h2 mb-8">
            <div className="relative border border-[rgba(139,92,246,0.18)] bg-[rgba(6,6,20,0.85)] p-6 md:p-8 overflow-hidden"
              style={{ clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)" }}>

              {/* BG tag watermark */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 font-[Cinzel,serif] font-black pointer-events-none select-none"
                style={{ fontSize: "clamp(4rem, 10vw, 7rem)", color: "rgba(139,92,246,0.04)", letterSpacing: "0.1em" }}>
                [{club.tag}]
              </div>

              {/* Top corner brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[rgba(139,92,246,0.5)]" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[rgba(139,92,246,0.5)]" />

              <div className="flex flex-col md:flex-row md:items-start gap-6 relative">

                {/* Left: identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase px-2 py-0.5 border"
                      style={{
                        clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)",
                        color: "#a78bfa", borderColor: "rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.08)"
                      }}>
                      {club.game}
                    </span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase px-2 py-0.5 border"
                      style={{
                        clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)",
                        color: "#06b6d4", borderColor: "rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.07)"
                      }}>
                      {club.region}
                    </span>
                    {club.status === "recruiting" && (
                      <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase px-2 py-0.5 border flex items-center gap-1.5"
                        style={{
                          clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)",
                          color: "#22c55e", borderColor: "rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.07)"
                        }}>
                        <span className="active-dot w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                        Recruiting
                      </span>
                    )}
                  </div>

                  <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.05em] mb-1"
                    style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)" }}>
                    {club.name}
                  </h1>
                  <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] text-white/30 mb-4">
                    [{club.tag}] · {club.city} · Est. {club.founded}
                  </p>
                  <p className="font-[Rajdhani,sans-serif] text-[0.82rem] text-white/45 leading-relaxed max-w-[560px] mb-5">
                    {club.bio}
                  </p>

                  {/* Achievements */}
                  <div className="flex flex-wrap gap-2">
                    {club.achievements.map((a, i) => (
                      <span key={i} className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.12em] px-3 py-1 border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.04)] text-white/35"
                        style={{ clipPath: "polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
                        🏆 {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: quick stats */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    <StatBox label="Wins"        value={club.wins}        accent="#f59e0b" />
                    <StatBox label="Tournaments" value={club.tournaments} accent="#a78bfa" />
                    <StatBox label="Rank"        value={club.rank} />
                    <StatBox label="Leader"      value={club.leader} />
                  </div>

                  {/* Seat bar */}
                  <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)] px-4 py-3"
                    style={{ clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/25">Roster Capacity</span>
                      <span className="font-[Rajdhani,sans-serif] font-bold text-[0.7rem] text-white/50">{club.filled}/{club.seats}</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)]" style={{ clipPath: "polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)" }}>
                      <div className="h-full transition-all duration-700"
                        style={{ width: `${fillPct}%`, background: fillPct >= 100 ? "#f87171" : "linear-gradient(90deg,#8b5cf6,#a78bfa)" }} />
                    </div>
                  </div>

                  {/* Apply button */}
                  <button
                    disabled={club.status !== "recruiting"}
                    className="py-3 font-[Rajdhani,sans-serif] font-black text-[0.82rem] tracking-[0.25em] uppercase text-white transition-all duration-300 hover:shadow-[0_0_28px_rgba(139,92,246,0.6)] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                      background: "linear-gradient(135deg,#a78bfa,#8b5cf6)"
                    }}>
                    Apply to Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sect-line mb-0" />

          {/* ══════════════════════════════════════════
              PLAYER ROSTER
          ══════════════════════════════════════════ */}
          <div className="page-h4">

            {/* ── REPRESENTING — large holographic cards */}
            {representing.length > 0 && (
              <div className="mb-2">
                <SectionHeader category="representing" count={representing.length} />
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {representing.map((p, i) => (
                    <RepresentingCard key={p.id} player={p} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── CORE ROSTER */}
            {core.length > 0 && (
              <div className="mb-2">
                <SectionHeader category="core" count={core.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {core.map((p, i) => (
                    <MemberCard key={p.id} player={p} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── RESERVE BENCH */}
            {reserve.length > 0 && (
              <div className="mb-2">
                <SectionHeader category="reserve" count={reserve.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {reserve.map((p, i) => (
                    <MemberCard key={p.id} player={p} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── ON TRIAL */}
            {trial.length > 0 && (
              <div className="mb-2">
                <SectionHeader category="trial" count={trial.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {trial.map((p, i) => (
                    <MemberCard key={p.id} player={p} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}