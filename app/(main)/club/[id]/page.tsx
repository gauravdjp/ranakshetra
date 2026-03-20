"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";

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
  clubRank: number;
  skillTag: SkillTag;
  category: PlayerCategory;
  wins: number;
  tournaments: number;
  joinedYear: string;
  avatarSeed: string;
  country: string;
  game: string;
  photo?: string;   // ← optional real photo path e.g. "/players/shadowx.png"
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
    id: "c001", name: "XIE CLUB", tag: "MPX", game: "Valorant",
    region: "Central India", city: "Mumbai", founded: "2024", leader: "Odis",
    wins: 12, tournaments: 28, rank: "Semi-Pro", status: "recruiting",
    bio: "South India's most feared BGMI squad. Born from the ranked trenches of Bangalore, MPX has climbed from Amateur to Semi-Pro in under a year. We play disciplined, we play smart — and when it matters, we play to win.",
    achievements: ["RK South India Open — 1st Place", "BGMI Regional Qualifiers — Top 4", "City Cup Champion 2024", "12 Tournament Wins"],
    socials: { discord: "discord.gg/mpx", instagram: "@mysticphoenixgg" },
    seats: 8, filled: 6,
  },
};

const PLAYERS: Player[] = [
  // ── REPRESENTING (active roster — assign real photos here)
  {
    id: "p1", name: "Arjun Sharma", ign: "ShadowX", position: "IGL", clubRank: 1,
    skillTag: "Pro", category: "representing", wins: 9, tournaments: 20,
    joinedYear: "2024", avatarSeed: "a", country: "🇮🇳", game: "BGMI",
    // photo: "/players/shadowx.png",   ← drop your photo path here
  },
  {
    id: "p2", name: "Ravi Menon", ign: "PhantomRK", position: "Fragger", clubRank: 2,
    skillTag: "Pro", category: "representing", wins: 8, tournaments: 18,
    joinedYear: "2024", avatarSeed: "b", country: "🇮🇳", game: "BGMI",
  },
  {
    id: "p3", name: "Kiran Nair", ign: "ViperKN", position: "Support", clubRank: 3,
    skillTag: "Intermediate", category: "representing", wins: 7, tournaments: 17,
    joinedYear: "2024", avatarSeed: "c", country: "🇮🇳", game: "BGMI",
  },
  {
    id: "p4", name: "Dev Pillai", ign: "ZeroGravDev", position: "Sniper", clubRank: 4,
    skillTag: "Intermediate", category: "representing", wins: 6, tournaments: 15,
    joinedYear: "2024", avatarSeed: "d", country: "🇮🇳", game: "BGMI",
  },
  // ── CORE
  { id: "p5", name: "Sai Krishnan", ign: "SaiStrike",   position: "Entry",  clubRank: 5, skillTag: "Intermediate", category: "core",    wins: 4, tournaments: 10, joinedYear: "2024", avatarSeed: "e", country: "🇮🇳", game: "BGMI" },
  { id: "p6", name: "Rohan Das",    ign: "RD_Anchor",   position: "Anchor", clubRank: 6, skillTag: "Intermediate", category: "core",    wins: 3, tournaments: 8,  joinedYear: "2025", avatarSeed: "f", country: "🇮🇳", game: "BGMI" },
  // ── RESERVE
  { id: "p7", name: "Aakash Rao",   ign: "AK_Wildfire", position: "Scout",  clubRank: 7, skillTag: "Noob",         category: "reserve", wins: 1, tournaments: 3,  joinedYear: "2025", avatarSeed: "g", country: "🇮🇳", game: "BGMI" },
  { id: "p8", name: "Nikhil Bhat",  ign: "NB_Ranger",   position: "Flex",   clubRank: 8, skillTag: "Noob",         category: "reserve", wins: 0, tournaments: 1,  joinedYear: "2025", avatarSeed: "h", country: "🇮🇳", game: "BGMI" },
];

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────── */
const SKILL_CFG = {
  Pro:          { color: "#f59e0b", glow: "rgba(245,158,11,0.4)",   bg: "rgba(245,158,11,0.1)",  label: "PRO"          },
  Intermediate: { color: "#8b5cf6", glow: "rgba(139,92,246,0.4)",   bg: "rgba(139,92,246,0.1)",  label: "INTERMEDIATE" },
  Noob:         { color: "#06b6d4", glow: "rgba(6,182,212,0.4)",    bg: "rgba(6,182,212,0.1)",   label: "ROOKIE"       },
};

const CATEGORY_CFG = {
  representing: { label: "Active Duty",   accent: "#f59e0b" },
  core:         { label: "Core Roster",   accent: "#8b5cf6" },
  reserve:      { label: "Reserve Bench", accent: "#06b6d4" },
  trial:        { label: "On Trial",      accent: "#6b7280" },
};

const AVATAR_GRADIENTS: Record<string, [string, string, string]> = {
  a: ["#f59e0b", "#ef4444",  "#1e0a00"],
  b: ["#8b5cf6", "#ec4899",  "#0d0014"],
  c: ["#06b6d4", "#3b82f6",  "#000d14"],
  d: ["#22c55e", "#06b6d4",  "#00140a"],
  e: ["#f97316", "#f59e0b",  "#140800"],
  f: ["#a855f7", "#8b5cf6",  "#0a0014"],
  g: ["#14b8a6", "#06b6d4",  "#00100e"],
  h: ["#ef4444", "#f97316",  "#140000"],
};

function avatarBg(seed: string) {
  const [c1, c2] = AVATAR_GRADIENTS[seed] ?? ["#8b5cf6", "#06b6d4"];
  return `linear-gradient(145deg, ${c1}55 0%, ${c2}33 50%, transparent 100%)`;
}
function avatarInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─────────────────────────────────────────────────────────────
   REPRESENTING CARD
   Full esports player card — photo-first design.
   
   STRUCTURE:
   ┌────────────────────────────┐
   │  [RANK]          [ACTIVE] │  ← absolute overlays on photo
   │                            │
   │    PLAYER PHOTO / AVATAR   │  ← 260px tall photo area
   │                            │
   │  ▓▓▓▓▓▓▓▓▓ gradient fade  │  ← bottom of photo fades into card body
   ├────────────────────────────┤
   │  IGN (large)               │  ← card body
   │  Real name · country       │
   │  [POSITION]   [SKILL TAG]  │
   │ ─────────────────────────  │
   │  Wins  /  Played  /  Since │
   └────────────────────────────┘
   
   When player.photo is set → renders <Image> (object-top so face shows)
   When no photo → renders gradient avatar with initials (fallback)
───────────────────────────────────────────────────────────── */
function RepresentingCard({ player, index }: { player: Player; index: number }) {
  const [hovered, setHovered] = useState(false);
  const skill = SKILL_CFG[player.skillTag];
  const [c1, c2, cbg] = AVATAR_GRADIENTS[player.avatarSeed] ?? ["#f59e0b", "#ef4444", "#1e0a00"];

  return (
    <div
      className="rep-card relative cursor-pointer select-none"
      style={{ animationDelay: `${index * 0.08}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer glow border — brightens on hover */}
      <div
        className="absolute -inset-[1px] transition-all duration-500"
        style={{
          background: `linear-gradient(160deg, ${c1}88, transparent 45%, ${c2}55)`,
          clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
          opacity: hovered ? 1 : 0.45,
          filter: hovered ? `drop-shadow(0 0 20px ${c1}55)` : "none",
        }}
      />

      {/* Card shell */}
      <div
        className="relative overflow-hidden transition-transform duration-300"
        style={{
          clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
          background: `linear-gradient(170deg, #0d0d1f 0%, ${cbg} 60%, #07070f 100%)`,
          border: `1px solid ${c1}2a`,
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
        }}
      >

        {/* ── PHOTO / AVATAR AREA — 260px, full bleed ── */}
        <div className="relative overflow-hidden" style={{ height: "260px" }}>

          {player.photo ? (
            /* ── REAL PHOTO MODE
               object-position: top center keeps the face visible.
               object-cover fills the card width without distorting.
               Add your photo to /public/players/ and set player.photo = "/players/xxx.png" */
            <Image
              src={player.photo}
              alt={player.ign}
              fill
              className="object-cover object-top"
              style={{ filter: hovered ? "brightness(1.05) saturate(1.1)" : "brightness(0.92) saturate(1)" }}
            />
          ) : (
            /* ── AVATAR FALLBACK (no photo set) */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: avatarBg(player.avatarSeed) }}
            >
              {/* Animated ring */}
              <div className="relative w-24 h-24 mb-3">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${c1}33`,
                    borderTopColor: c1,
                    animation: "rotateSlow 8s linear infinite",
                  }}
                />
                <div
                  className="absolute inset-[6px] rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${c1}33, ${c2}22, #0a0a18)`,
                    border: `2px solid ${c1}55`,
                  }}
                >
                  <span
                    className="font-[Cinzel,serif] font-black text-2xl"
                    style={{ color: c1, textShadow: `0 0 20px ${c1}` }}
                  >
                    {avatarInitials(player.name)}
                  </span>
                </div>
              </div>
              <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/20">
                {player.game}
              </span>
            </div>
          )}

          {/* ── GRADIENT FADE — bottom of photo bleeds into card body */}
          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, ${cbg.replace(')', ', 0.7)').replace('rgb','rgba')} 50%, #0d0d1f 100%)`,
            }}
          />
          {/* Fallback solid fade for when cbg isn't rgba */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #090912)" }}
          />

          {/* ── OVERLAYS ON PHOTO ── */}

          {/* Rank badge — diamond, top-left */}
          <div
            className="absolute top-3 left-4 w-8 h-8 flex items-center justify-center z-10"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background: `${c1}25`,
              border: `1px solid ${c1}66`,
            }}
          >
            <span className="font-[Cinzel,serif] font-black text-[0.65rem]" style={{ color: c1 }}>
              {player.clubRank}
            </span>
          </div>

          {/* Active duty badge — top-right */}
          <div
            className="absolute top-3 right-0 flex items-center gap-1.5 px-3 py-1 z-10"
            style={{
              background: `linear-gradient(90deg, transparent, ${c1}15, ${c1}30)`,
              borderLeft: `2px solid ${c1}88`,
            }}
          >
            <span className="active-dot w-1.5 h-1.5 rounded-full" style={{ background: c1 }} />
            <span
              className="font-[Rajdhani,sans-serif] font-bold text-[0.5rem] tracking-[0.3em]"
              style={{ color: c1 }}
            >
              ACTIVE
            </span>
          </div>

          {/* IGN floats at bottom of photo — on top of gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
            <p
              className="font-[Cinzel,serif] font-black text-white leading-tight transition-all duration-400"
              style={{
                fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
                textShadow: hovered ? `0 0 24px ${c1}88, 0 2px 12px rgba(0,0,0,0.8)` : "0 2px 12px rgba(0,0,0,0.9)",
              }}
            >
              {player.ign}
            </p>
            <p className="font-[Rajdhani,sans-serif] text-[0.62rem] text-white/35">
              {player.name} {player.country}
            </p>
          </div>

          {/* Holographic shine sweep on hover */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              opacity: hovered ? 0.18 : 0,
              background: `linear-gradient(110deg, transparent 20%, ${c1}99 50%, transparent 80%)`,
              animation: hovered ? "shineSweep 1.6s ease infinite" : "none",
              transition: "opacity 0.4s",
            }}
          />
        </div>

        {/* ── CARD BODY INFO ── */}
        <div className="px-4 pt-3 pb-4">

          {/* Position + Skill */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="font-[Rajdhani,sans-serif] font-bold text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 border"
              style={{
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                color: "rgba(255,255,255,0.55)",
                borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {player.position}
            </span>
            <span
              className="font-[Rajdhani,sans-serif] font-bold text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 border transition-all duration-300"
              style={{
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                color: skill.color,
                borderColor: `${skill.color}55`,
                background: skill.bg,
                boxShadow: hovered ? `0 0 12px ${skill.glow}` : "none",
              }}
            >
              {skill.label}
            </span>
          </div>

          {/* Stats row */}
          <div
            className="flex items-center justify-between pt-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {[
              { label: "Wins",   val: player.wins },
              { label: "Played", val: player.tournaments },
              { label: "Since",  val: `'${player.joinedYear.slice(2)}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex-1 text-center">
                <p
                  className="font-[Cinzel,serif] font-bold text-[1rem] leading-none mb-0.5"
                  style={{ color: c1 }}
                >
                  {val}
                </p>
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.22em] uppercase text-white/22">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${c1}, ${c2}, transparent)` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MEMBER CARD — smaller, photo-aware, same structure scaled down
   Photo area: 160px.  Falls back to initials avatar.
───────────────────────────────────────────────────────────── */
function MemberCard({ player, index }: { player: Player; index: number }) {
  const [hovered, setHovered] = useState(false);
  const skill = SKILL_CFG[player.skillTag];
  const [c1, , cbg] = AVATAR_GRADIENTS[player.avatarSeed] ?? ["#8b5cf6", "#06b6d4", "#0a0014"];

  return (
    <div
      className="member-card relative cursor-pointer select-none"
      style={{ animationDelay: `${index * 0.06}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover border */}
      <div
        className="absolute -inset-[1px] transition-all duration-400"
        style={{
          background: `linear-gradient(135deg, ${skill.color}44, transparent 60%)`,
          clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div
        className="relative overflow-hidden transition-transform duration-300"
        style={{
          clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
          background: `linear-gradient(160deg, #0c0c1e 0%, ${cbg} 70%, #07070f 100%)`,
          border: `1px solid ${hovered ? skill.color + "44" : "rgba(139,92,246,0.12)"}`,
          transform: hovered ? "translateY(-3px)" : "none",
        }}
      >

        {/* ── PHOTO / AVATAR — 160px */}
        <div className="relative overflow-hidden" style={{ height: "160px" }}>

          {player.photo ? (
            <Image
              src={player.photo}
              alt={player.ign}
              fill
              className="object-cover object-top"
              style={{ filter: hovered ? "brightness(1.05)" : "brightness(0.88)" }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: avatarBg(player.avatarSeed) }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${c1}33, #0a0a18)`,
                  border: `2px solid ${c1}33`,
                }}
              >
                <span
                  className="font-[Cinzel,serif] font-black text-base"
                  style={{ color: c1, textShadow: `0 0 10px ${c1}66` }}
                >
                  {avatarInitials(player.name)}
                </span>
              </div>
            </div>
          )}

          {/* Gradient fade bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, #0c0c1e)" }}
          />

          {/* Rank — top left */}
          <div
            className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center z-10"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background: `${skill.color}22`,
              border: `1px solid ${skill.color}44`,
            }}
          >
            <span className="font-[Cinzel,serif] font-black text-[0.55rem]" style={{ color: skill.color }}>
              {player.clubRank}
            </span>
          </div>

          {/* IGN overlaid on bottom of photo */}
          <div className="absolute bottom-1 left-0 right-0 px-3 z-10">
            <p
              className="font-[Cinzel,serif] font-bold text-white text-[0.82rem] tracking-[0.04em] leading-tight"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
            >
              {player.ign}
            </p>
          </div>

          {/* Pulse ring on avatar when hovered (only in avatar mode) */}
          {hovered && !player.photo && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ animation: "pulseRing 1.2s ease-out infinite" }}
            />
          )}
        </div>

        {/* ── INFO ── */}
        <div className="px-3 pb-3 pt-2">
          <p className="font-[Rajdhani,sans-serif] text-[0.58rem] text-white/25 mb-2">
            {player.name} {player.country}
          </p>

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span
              className="font-[Rajdhani,sans-serif] font-bold text-[0.55rem] tracking-[0.18em] uppercase px-2 py-0.5 border"
              style={{
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)",
                color: "rgba(255,255,255,0.45)",
                borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {player.position}
            </span>
            <span
              className="font-[Rajdhani,sans-serif] font-bold text-[0.52rem] tracking-[0.18em] uppercase px-2 py-0.5 border"
              style={{
                clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)",
                color: skill.color,
                borderColor: `${skill.color}44`,
                background: skill.bg,
              }}
            >
              {skill.label}
            </span>
          </div>

          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            {[
              { label: "Wins",   val: player.wins },
              { label: "Played", val: player.tournaments },
            ].map(({ label, val }) => (
              <div key={label} className="flex-1 text-center">
                <p className="font-[Cinzel,serif] font-bold text-[0.88rem]" style={{ color: skill.color }}>
                  {val}
                </p>
                <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-[0.2em] uppercase text-white/20">
                  {label}
                </p>
              </div>
            ))}
            <div className="flex-1 text-center">
              <p className="font-[Cinzel,serif] font-bold text-[0.88rem] text-white/35">
                '{player.joinedYear.slice(2)}
              </p>
              <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-[0.2em] uppercase text-white/20">
                Since
              </p>
            </div>
          </div>
        </div>

        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300"
          style={{ background: hovered ? skill.color : `${skill.color}44` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────── */
function SectionHeader({ category, count }: { category: PlayerCategory; count: number }) {
  const cfg = CATEGORY_CFG[category];
  return (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
      <div className="w-[3px] h-8 flex-shrink-0" style={{ background: cfg.accent }} />
      <div>
        <p className="font-[Cinzel,serif] font-bold text-white text-[1.05rem] tracking-[0.06em]">
          {cfg.label}
        </p>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.25em] uppercase text-white/25">
          {count} players
        </p>
      </div>
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(90deg, ${cfg.accent}44, transparent)` }}
      />
      {category === "representing" && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 border"
          style={{
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            borderColor: `${cfg.accent}55`,
            background: `${cfg.accent}11`,
          }}
        >
          <span className="active-dot w-1.5 h-1.5 rounded-full" style={{ background: cfg.accent }} />
          <span
            className="font-[Rajdhani,sans-serif] font-bold text-[0.55rem] tracking-[0.25em] uppercase"
            style={{ color: cfg.accent }}
          >
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
    <div
      className="px-5 py-4 border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)]"
      style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
    >
      <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/22 mb-1">
        {label}
      </p>
      <p
        className="font-[Cinzel,serif] font-bold text-[1.05rem]"
        style={{ color: accent ?? "rgba(255,255,255,0.8)" }}
      >
        {value}
      </p>
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
          100% { transform: translateX(320%)  skewX(-15deg); }
        }
        @keyframes rotateSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes activePulse {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.75); }
        }
        @keyframes pulseRing {
          0%   { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0;   transform: scale(1.6); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes repCardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-grid    { animation: gridFade 2.5s ease forwards; }
        .page-h1      { animation: headerIn 0.5s ease forwards 0.05s; opacity: 0; }
        .page-h2      { animation: headerIn 0.5s ease forwards 0.12s; opacity: 0; }
        .page-h3      { animation: headerIn 0.5s ease forwards 0.20s; opacity: 0; }
        .page-h4      { animation: headerIn 0.5s ease forwards 0.28s; opacity: 0; }
        .rep-card     { animation: repCardIn 0.5s ease forwards; opacity: 0; }
        .member-card  { animation: cardIn 0.4s ease forwards; opacity: 0; }
        .active-dot   { animation: activePulse 1.5s ease-in-out infinite; }

        .sect-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); }
      `}</style>

      <div className="min-h-screen bg-[#050510] relative overflow-x-hidden">

        {/* BG grid */}
        <div
          className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "70px 70px", zIndex: 0,
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)", zIndex: 0 }}
        />

        <div className="relative z-10 max-w-[1260px] mx-auto px-4 md:px-8 pt-28 pb-24">

          {/* BACK */}
          <div className="page-h1 mb-6">
            <Link href="/club"
              className="inline-flex items-center gap-2 font-[Rajdhani,sans-serif] text-[0.68rem] tracking-[0.22em] uppercase text-white/28 hover:text-[#a78bfa] transition-colors no-underline">
              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Guild Registry
            </Link>
          </div>

          {/* CLUB HEADER */}
          <div className="page-h2 mb-8">
            <div
              className="relative border border-[rgba(139,92,246,0.18)] bg-[rgba(6,6,20,0.85)] p-6 md:p-8 overflow-hidden"
              style={{ clipPath: "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)" }}
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 font-[Cinzel,serif] font-black pointer-events-none select-none"
                style={{ fontSize: "clamp(4rem,10vw,7rem)", color: "rgba(139,92,246,0.04)", letterSpacing: "0.1em" }}>
                [{club.tag}]
              </div>
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[rgba(139,92,246,0.5)]" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[rgba(139,92,246,0.5)]" />

              <div className="flex flex-col md:flex-row md:items-start gap-6 relative">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase px-2 py-0.5 border"
                      style={{ clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)", color:"#a78bfa", borderColor:"rgba(139,92,246,0.35)", background:"rgba(139,92,246,0.08)" }}>
                      {club.game}
                    </span>
                    <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase px-2 py-0.5 border"
                      style={{ clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)", color:"#06b6d4", borderColor:"rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.07)" }}>
                      {club.region}
                    </span>
                    {club.status === "recruiting" && (
                      <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase px-2 py-0.5 border flex items-center gap-1.5"
                        style={{ clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)", color:"#22c55e", borderColor:"rgba(34,197,94,0.35)", background:"rgba(34,197,94,0.07)" }}>
                        <span className="active-dot w-1.5 h-1.5 rounded-full" style={{ background:"#22c55e" }} />
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
                  <div className="flex flex-wrap gap-2">
                    {club.achievements.map((a, i) => (
                      <span key={i} className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.12em] px-3 py-1 border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.04)] text-white/35"
                        style={{ clipPath:"polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)" }}>
                        🏆 {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    <StatBox label="Wins"        value={club.wins}        accent="#f59e0b" />
                    <StatBox label="Tournaments" value={club.tournaments} accent="#a78bfa" />
                    <StatBox label="Rank"        value={club.rank} />
                    <StatBox label="Leader"      value={club.leader} />
                  </div>

                  <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)] px-4 py-3"
                    style={{ clipPath:"polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/25">Roster Capacity</span>
                      <span className="font-[Rajdhani,sans-serif] font-bold text-[0.7rem] text-white/50">{club.filled}/{club.seats}</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)]" style={{ clipPath:"polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)" }}>
                      <div className="h-full transition-all duration-700"
                        style={{ width:`${fillPct}%`, background: fillPct >= 100 ? "#f87171" : "linear-gradient(90deg,#8b5cf6,#a78bfa)" }} />
                    </div>
                  </div>

                  <button
                    disabled={club.status !== "recruiting"}
                    className="py-3 font-[Rajdhani,sans-serif] font-black text-[0.82rem] tracking-[0.25em] uppercase text-white transition-all duration-300 hover:shadow-[0_0_28px_rgba(139,92,246,0.6)] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", background:"linear-gradient(135deg,#a78bfa,#8b5cf6)" }}>
                    Apply to Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sect-line mb-0" />

          {/* ROSTER */}
          <div className="page-h4">

            {representing.length > 0 && (
              <div className="mb-2">
                <SectionHeader category="representing" count={representing.length} />
                {/* Representing cards: wider on desktop — 4 per row but bigger */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  {representing.map((p, i) => (
                    <RepresentingCard key={p.id} player={p} index={i} />
                  ))}
                </div>
              </div>
            )}

            {core.length > 0 && (
              <div className="mb-2">
                <SectionHeader category="core" count={core.length} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {core.map((p, i) => (
                    <MemberCard key={p.id} player={p} index={i} />
                  ))}
                </div>
              </div>
            )}

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