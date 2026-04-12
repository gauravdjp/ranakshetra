"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type NavSection = "dashboard" | "tournaments" | "clubs" | "arenas" | "leaderboard";

/* ─────────────────────────────────────────────────────────────
   MOCK — replace with real data / API calls
───────────────────────────────────────────────────────────── */
const MOCK_PLAYER = {
  name: "Arjun Mehta",
  username: "ShadowStrike",
  player_tag: "ShadowStrike#1337",
  skill_level: "Semi-Pro",
  rank_points: 4870,
  city: "Mumbai",
  wins: 6,
  tournaments_played: 24,
  win_rate: 25,
  is_verified: true,
};

type PostTag = "announcement" | "tournament" | "update" | "maintenance";

type OfficialPost = {
  id: string;
  tag: PostTag;
  title: string;
  body: string;
  timestamp: string;
  pinned?: boolean;
  cta?: { label: string; href: string };
  meta?: { label: string; value: string }[];
};

const OFFICIAL_POSTS: OfficialPost[] = [
  {
    id: "op1",
    tag: "tournament",
    pinned: true,
    title: "West India BGMI Open S4 — Registrations Live",
    body: "Season 4 of the biggest regional BGMI tournament is here. Squad up, register before slots fill out. Prize pool of ₹20,000 on the line. Top 3 squads qualify for the National Stage.",
    timestamp: "2 hours ago",
    cta: { label: "Register Now", href: "/tournaments/bgmi-open-s4" },
    meta: [
      { label: "Game",       value: "BGMI"        },
      { label: "Format",     value: "Squad (4v4)"  },
      { label: "Date",       value: "18 Apr 2025"  },
      { label: "Prize Pool", value: "₹20,000"      },
      { label: "Slots",      value: "48 / 64 filled"},
    ],
  },
  {
    id: "op2",
    tag: "announcement",
    pinned: true,
    title: "Clubs Feature is Coming to RANAKSHETRA",
    body: "We're building the Clubs system — form your guild, recruit warriors, and compete as a unit across multiple tournaments. Early access invite system drops next week. Stay locked in.",
    timestamp: "1 day ago",
  },
  {
    id: "op3",
    tag: "tournament",
    title: "Arena Masters S4 — Valorant · Open Qualifiers",
    body: "The 5v5 Valorant series is back for Season 4. Open qualifiers begin 22 Apr. Top 8 teams advance to the main bracket. Seeding based on previous season performance.",
    timestamp: "2 days ago",
    cta: { label: "View Tournament", href: "/tournaments/arena-masters-s4" },
    meta: [
      { label: "Game",       value: "Valorant"     },
      { label: "Format",     value: "5v5"           },
      { label: "Date",       value: "22 Apr 2025"   },
      { label: "Prize Pool", value: "₹10,000"       },
      { label: "Slots",      value: "16 / 32 filled"},
    ],
  },
  {
    id: "op4",
    tag: "update",
    title: "Rank Points System — How It Works",
    body: "We've published full documentation on how Rank Points are calculated. Points are awarded based on placement, total teams, and tournament tier. Profile rankings update within 24 hours of a result being confirmed.",
    timestamp: "3 days ago",
    cta: { label: "Read Docs", href: "/docs/rank-points" },
  },
  {
    id: "op5",
    tag: "maintenance",
    title: "Scheduled Maintenance — 14 Apr, 2:00–4:00 AM IST",
    body: "The platform will be under scheduled maintenance on the night of 14 April. Tournament registrations and profile edits will be temporarily unavailable during this window. All existing registrations are safe.",
    timestamp: "4 days ago",
  },
  {
    id: "op6",
    tag: "tournament",
    title: "Clash Cup Weekly #24 — Solo · Open to All",
    body: "This week's Clash Royale solo bracket is open for registration. No minimum rank required. Great opportunity for new players to earn their first tournament points.",
    timestamp: "5 days ago",
    cta: { label: "Register", href: "/tournaments/clash-cup-24" },
    meta: [
      { label: "Game",   value: "Clash Royale" },
      { label: "Format", value: "Solo"          },
      { label: "Date",   value: "15 Apr 2025"   },
      { label: "Prize",  value: "₹2,000"        },
    ],
  },
];

const LEADERBOARD_MOCK = [
  { rank: 1,  username: "PhantomX",      points: 9240, wins: 18, game: "BGMI"    },
  { rank: 2,  username: "CrimsonAce",    points: 8870, wins: 15, game: "Valorant"},
  { rank: 3,  username: "NightSerpent",  points: 8102, wins: 14, game: "BGMI"    },
  { rank: 4,  username: "ShadowStrike",  points: 4870, wins: 6,  game: "BGMI",   self: true },
  { rank: 5,  username: "BladeRunner99", points: 4550, wins: 5,  game: "CS2"     },
  { rank: 6,  username: "VoidWalker",    points: 4210, wins: 4,  game: "Valorant"},
  { rank: 7,  username: "StormBreaker",  points: 3980, wins: 4,  game: "BGMI"    },
  { rank: 8,  username: "IronFang",      points: 3750, wins: 3,  game: "CS2"     },
];

/* ─────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
const tagCfg: Record<PostTag, { label: string; color: string; border: string; bg: string }> = {
  tournament:   { label: "Tournament",   color: "#a78bfa", border: "rgba(139,92,246,0.45)", bg: "rgba(139,92,246,0.09)" },
  announcement: { label: "Announcement", color: "#fbbf24", border: "rgba(251,191,36,0.4)",  bg: "rgba(251,191,36,0.07)" },
  update:       { label: "Update",       color: "#60a5fa", border: "rgba(96,165,250,0.35)", bg: "rgba(96,165,250,0.07)" },
  maintenance:  { label: "Maintenance",  color: "rgba(255,255,255,0.35)", border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)" },
};

function PostTagBadge({ tag }: { tag: PostTag }) {
  const c = tagCfg[tag];
  return (
    <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.22em] uppercase px-2.5 py-0.5 border"
      style={{ color: c.color, background: c.bg, borderColor: c.border,
        clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
      {c.label}
    </span>
  );
}

function PlaceholderSection({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="w-14 h-14 border border-[rgba(139,92,246,0.25)] flex items-center justify-center bg-[rgba(139,92,246,0.04)]"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2L20 6V12C20 16.5 16.5 20 12 22C7.5 20 4 16.5 4 12V6L12 2Z" stroke="#8b5cf6" strokeWidth="1.2" strokeLinejoin="round" /><path d="M12 8V12M12 16H12.01" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </div>
      <p className="font-[Cinzel,serif] text-base font-bold text-white/40">{label}</p>
      <p className="font-[Rajdhani,sans-serif] text-[0.72rem] tracking-[0.25em] uppercase text-white/20">Under Construction</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD SECTION — welcome + official feed
───────────────────────────────────────────────────────────── */
function DashboardSection() {
  return (
    <div className="content-in max-w-[700px] mx-auto space-y-5">

      {/* ── Welcome strip */}
      <div className="relative border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.04)] px-6 py-5 overflow-hidden"
        style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 100% at 0% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Welcome back</p>
            <h3 className="font-[Cinzel,serif] text-lg font-black text-white">
              {MOCK_PLAYER.name}{" "}
              <span className="text-white/30 text-base font-normal">· {MOCK_PLAYER.username}</span>
            </h3>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Rank Points", val: MOCK_PLAYER.rank_points.toLocaleString(), accent: true },
              { label: "Wins",        val: MOCK_PLAYER.wins                                        },
              { label: "Win Rate",    val: `${MOCK_PLAYER.win_rate}%`                              },
            ].map(({ label, val, accent }) => (
              <div key={label} className="text-center px-3 py-2 border border-[rgba(139,92,246,0.12)] bg-white/[0.02]"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                <p className="font-[Cinzel,serif] font-bold text-sm" style={{ color: accent ? "#a78bfa" : "white" }}>{val}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.22em] uppercase text-white/25 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feed header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6]">Official</p>
          <h2 className="font-[Cinzel,serif] text-base font-bold text-white">Updates & Announcements</h2>
        </div>
        {/* Live dot */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 6px #8b5cf6", animation: "livePulse 2s ease-in-out infinite" }} />
          <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/25">Live</span>
        </div>
      </div>

      {/* ── Posts feed */}
      <div className="space-y-3">
        {OFFICIAL_POSTS.map((post, i) => (
          <article key={post.id}
            className="relative border bg-white/[0.016] transition-all duration-250 group"
            style={{
              borderColor: post.pinned ? "rgba(139,92,246,0.28)" : "rgba(139,92,246,0.11)",
              clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
              animationDelay: `${i * 0.05}s`,
            }}>

            {/* Pinned left accent */}
            {post.pinned && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ background: "linear-gradient(180deg, transparent 0%, #8b5cf6 30%, #8b5cf6 70%, transparent 100%)" }} />
            )}

            <div className="px-5 pt-4 pb-4">

              {/* Post header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Official avatar */}
                  <div className="w-7 h-7 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.12)] flex items-center justify-center shrink-0"
                    style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                      <path d="M7 1L11.5 3.5V7C11.5 9.8 9.5 12 7 13C4.5 12 2.5 9.8 2.5 7V3.5L7 1Z"
                        stroke="#8b5cf6" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M5 7L6.5 8.5L9 6" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-[Rajdhani,sans-serif] text-[0.68rem] font-semibold text-[#a78bfa] tracking-wide leading-none">
                      RANAKSHETRA Official
                    </p>
                    <p className="font-[Rajdhani,sans-serif] text-[0.52rem] text-white/25 tracking-wide mt-0.5">{post.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.pinned && (
                    <span className="font-[Rajdhani,sans-serif] text-[0.46rem] tracking-[0.2em] uppercase text-[#8b5cf6]/50">
                      ◈ pinned
                    </span>
                  )}
                  <PostTagBadge tag={post.tag} />
                </div>
              </div>

              {/* Post content */}
              <h4 className="font-[Cinzel,serif] text-[0.95rem] font-bold text-white mb-2 leading-snug">{post.title}</h4>
              <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/45 leading-relaxed">{post.body}</p>

              {/* Meta grid (for tournament posts) */}
              {post.meta && (
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 pt-3 border-t border-[rgba(139,92,246,0.08)]">
                  {post.meta.map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-widest uppercase text-white/20">{label}</span>
                      <span className="font-[Rajdhani,sans-serif] text-[0.68rem] font-semibold text-white/55">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              {post.cta && (
                <div className="mt-3">
                  <button className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(139,92,246,0.35)] text-[#8b5cf6] bg-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.14)] hover:border-[rgba(139,92,246,0.65)] transition-all duration-200"
                    style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                    {post.cta.label} ⟶
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* End of feed */}
      <div className="text-center pt-4 pb-8">
        <div className="inline-flex items-center gap-3">
          <div className="w-16 h-px bg-[rgba(139,92,246,0.1)]" />
          <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/15">End of feed</span>
          <div className="w-16 h-px bg-[rgba(139,92,246,0.1)]" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEADERBOARD SECTION
───────────────────────────────────────────────────────────── */
function LeaderboardSection() {
  return (
    <div className="content-in">
      <SectionTitle eyebrow="Global Rankings" title="Leaderboard" />
      <div className="relative border border-[rgba(139,92,246,0.15)] bg-white/[0.015] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[rgba(139,92,246,0.1)]">
          {[["Rank","col-span-1"],["Player","col-span-5"],["Game","col-span-3 hidden md:block"],["Wins","col-span-1"],["Points","col-span-2"]].map(([l,c]) => (
            <p key={l} className={`${c} font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.3em] uppercase text-white/25`}>{l}</p>
          ))}
        </div>
        {LEADERBOARD_MOCK.map((p, i) => (
          <div key={p.rank}
            className="grid grid-cols-12 px-5 py-4 items-center border-b border-[rgba(139,92,246,0.06)] last:border-b-0 transition-all duration-200"
            style={{
              background: (p as any).self ? "rgba(139,92,246,0.07)" : i % 2 === 0 ? "rgba(255,255,255,0.008)" : "transparent",
              borderLeft: (p as any).self ? "2px solid rgba(139,92,246,0.6)" : "2px solid transparent",
            }}>
            <div className="col-span-1">
              <span className="font-[Cinzel,serif] font-bold text-sm"
                style={{ color: p.rank === 1 ? "#fbbf24" : p.rank === 2 ? "#94a3b8" : p.rank === 3 ? "#b87333" : "rgba(255,255,255,0.3)" }}>
                #{p.rank}
              </span>
            </div>
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-7 h-7 border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.07)] flex items-center justify-center shrink-0"
                style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                <span className="font-[Cinzel,serif] text-[0.5rem] font-bold text-[#8b5cf6]">{p.username.slice(0,2).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-[Rajdhani,sans-serif] text-[0.8rem] font-semibold"
                  style={{ color: (p as any).self ? "#a78bfa" : "rgba(255,255,255,0.75)" }}>
                  {p.username}
                  {(p as any).self && <span className="ml-2 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] text-[#8b5cf6]">YOU</span>}
                </p>
              </div>
            </div>
            <div className="col-span-3 hidden md:block">
              <span className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.15em] uppercase px-2 py-0.5 border border-[rgba(139,92,246,0.18)] text-white/35"
                style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                {p.game}
              </span>
            </div>
            <div className="col-span-1">
              <p className="font-[Cinzel,serif] text-sm font-bold text-white/60">{p.wins}</p>
            </div>
            <div className="col-span-2">
              <p className="font-[Cinzel,serif] text-sm font-bold text-[#a78bfa]">{p.points.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN LAYOUT SHELL
───────────────────────────────────────────────────────────── */
export default function PlayerMainPage() {
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  /* Close avatar dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NAV_LINKS: { key: NavSection; label: string }[] = [
    { key: "tournaments", label: "TOURNAMENTS" },
    { key: "clubs",       label: "CLUBS"       },
    { key: "arenas",      label: "ARENAS"      },
    { key: "leaderboard", label: "LEADERBOARD" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":    return <DashboardSection />;
      case "leaderboard":  return <LeaderboardSection />;
      case "tournaments":  return <PlaceholderSection label="Tournaments" />;
      case "clubs":        return <PlaceholderSection label="Clubs" />;
      case "arenas":       return <PlaceholderSection label="Arenas" />;
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
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);     }
        }
        @keyframes contentIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #8b5cf6; }
          50%       { opacity: 0.4; box-shadow: 0 0 2px #8b5cf6; }
        }

        .anim-grid  { animation: gridFade 2s ease forwards; }
        .shell-in   { animation: fadeUp 0.5s ease forwards; }
        .content-in { animation: contentIn 0.35s ease forwards; }
        .drop-in    { animation: dropIn 0.2s ease forwards; }

        /* Nav link */
        .nav-link {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          font-weight: 500;
          text-transform: uppercase;
          padding: 10px 16px;
          border-left: 2px solid transparent;
          color: rgba(255,255,255,0.28);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border-right: none;
          border-top: none;
          border-bottom: none;
        }
        .nav-link:hover {
          color: rgba(255,255,255,0.65);
          border-left-color: rgba(139,92,246,0.35);
          background: rgba(139,92,246,0.04);
        }
        .nav-link.active {
          color: #a78bfa;
          border-left-color: #8b5cf6;
          background: rgba(139,92,246,0.08);
        }

        /* Avatar dropdown */
        .avatar-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1.5px solid rgba(139,92,246,0.45);
          background: rgba(139,92,246,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .avatar-btn:hover {
          border-color: rgba(139,92,246,0.8);
          background: rgba(139,92,246,0.18);
          box-shadow: 0 0 14px rgba(139,92,246,0.3);
        }
        .avatar-btn.open {
          border-color: rgba(139,92,246,0.9);
          box-shadow: 0 0 20px rgba(139,92,246,0.35);
        }
        .dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 180px;
          background: #0a0a1c;
          border: 1px solid rgba(139,92,246,0.3);
          z-index: 100;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(139,92,246,0.1);
        }
        .dropdown-item {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 11px 16px;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: all 0.15s ease;
          display: block;
          border-bottom: 1px solid rgba(139,92,246,0.07);
          width: 100%;
          text-align: left;
          background: none;
          border-right: none; border-top: none; border-left: none;
        }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: rgba(139,92,246,0.08); color: rgba(255,255,255,0.8); }
        .dropdown-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }

        /* Scrollable content */
        .main-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 28px 28px 40px;
        }
        .main-scroll::-webkit-scrollbar { width: 3px; }
        .main-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 2px; }

        /* Sidebar scroll */
        .sidebar-scroll { overflow-y: auto; }
        .sidebar-scroll::-webkit-scrollbar { width: 2px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); }
      `}</style>

      <div className="fixed inset-0 bg-[#050510] flex flex-col overflow-hidden">

        {/* ── Background grid (fixed so it doesn't scroll) */}
        <div className="anim-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(139,92,246,0.05) 0%, transparent 65%)" }}
        />

        {/* ══════════════════════════════════════
            TOP HEADER
        ══════════════════════════════════════ */}
        <header className="shell-in relative z-20 flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.14)] shrink-0"
          style={{ background: "rgba(5,5,16,0.7)", backdropFilter: "blur(12px)" }}>

          {/* Brand */}
          <button onClick={() => setActiveSection("dashboard")} className="focus:outline-none">
            <span className="font-[Cinzel,serif] font-black tracking-[0.12em] text-xl"
              style={{ background: "linear-gradient(135deg, #c4b5fd, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              RANAKSHETRA
            </span>
          </button>

          {/* Avatar + dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              className={`avatar-btn ${avatarOpen ? "open" : ""}`}
              onClick={() => setAvatarOpen(v => !v)}>
              <span className="font-[Cinzel,serif] text-[0.6rem] font-black text-[#a78bfa]">
                {MOCK_PLAYER.name.split(" ").map(n => n[0]).join("")}
              </span>
            </button>

            {avatarOpen && (
              <div className="dropdown drop-in">
                {/* Mini user info */}
                <div className="px-4 py-3 border-b border-[rgba(139,92,246,0.12)]">
                  <p className="font-[Cinzel,serif] text-[0.72rem] font-bold text-white/70">{MOCK_PLAYER.username}</p>
                  <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-widest uppercase text-[#8b5cf6]/60 mt-0.5">{MOCK_PLAYER.skill_level}</p>
                </div>
                <Link href="/profile" className="dropdown-item no-underline" onClick={() => setAvatarOpen(false)}>
                  Profile
                </Link>
                <Link href="/settings" className="dropdown-item no-underline" onClick={() => setAvatarOpen(false)}>
                  Settings
                </Link>
                <button className="dropdown-item danger" onClick={() => setAvatarOpen(false)}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ══════════════════════════════════════
            BODY — sidebar + content
        ══════════════════════════════════════ */}
        <div className="relative z-10 flex flex-1 overflow-hidden">

          {/* ── LEFT SIDEBAR NAV */}
          <aside className="shell-in shrink-0 w-[200px] border-r border-[rgba(139,92,246,0.12)] flex flex-col sidebar-scroll"
            style={{ background: "rgba(5,5,16,0.5)", backdropFilter: "blur(8px)" }}>

            {/* Dashboard link at top */}
            <div className="pt-5 pb-2 px-4">
              <button onClick={() => setActiveSection("dashboard")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.05)] hover:bg-[rgba(139,92,246,0.1)] transition-all duration-200"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 shrink-0">
                  <rect x="1" y="1" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                  <rect x="9" y="1" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                  <rect x="1" y="9" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                  <rect x="9" y="9" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                </svg>
                <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.25em] uppercase"
                  style={{ color: activeSection === "dashboard" ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                  Dashboard
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="mx-4 mb-2 mt-2 h-px bg-[rgba(139,92,246,0.08)]" />

            {/* Nav links */}
            <nav className="flex-1 py-1">
              {NAV_LINKS.map(link => (
                <button key={link.key}
                  className={`nav-link ${activeSection === link.key ? "active" : ""}`}
                  onClick={() => setActiveSection(link.key)}>
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Bottom — player mini card */}
            <div className="px-4 pb-5 mt-auto">
              <div className="h-px bg-[rgba(139,92,246,0.08)] mb-4" />
              <div className="px-3 py-3 border border-[rgba(139,92,246,0.12)] bg-white/[0.015]"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] flex items-center justify-center shrink-0"
                    style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                    <span className="font-[Cinzel,serif] text-[0.48rem] font-black text-[#a78bfa]">
                      {MOCK_PLAYER.name.split(" ").map(n=>n[0]).join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-[Rajdhani,sans-serif] text-[0.65rem] font-semibold text-white/60 truncate">{MOCK_PLAYER.username}</p>
                    <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-widest uppercase text-[#8b5cf6]/50">{MOCK_PLAYER.skill_level}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <p className="font-[Cinzel,serif] text-[0.7rem] font-bold text-[#a78bfa]">{MOCK_PLAYER.rank_points.toLocaleString()}</p>
                    <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-widest uppercase text-white/20">pts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-[Cinzel,serif] text-[0.7rem] font-bold text-white/50">{MOCK_PLAYER.wins}</p>
                    <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-widest uppercase text-white/20">wins</p>
                  </div>
                  <div className="text-center">
                    <p className="font-[Cinzel,serif] text-[0.7rem] font-bold text-white/50">{MOCK_PLAYER.win_rate}%</p>
                    <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-widest uppercase text-white/20">wr</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT */}
          <main className="flex-1 main-scroll">
            {renderContent()}
          </main>

        </div>
      </div>
    </>
  );
}