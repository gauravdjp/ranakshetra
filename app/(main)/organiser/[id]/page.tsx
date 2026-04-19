"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Tournament } from "@/types";
import { Club } from "@/types";
import { Arena } from "@/types";

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */
type NavTab    = "tournaments" | "arenas" | "leaderboard" | "clubs";
type SidePanel = "manage" | "create" | "post-updates" | "settings";

type UpdatePost = {
  _id?: string;
  tag?: string;
  title: string;
  body: string;
  timestamp?: string;
  created_at?: string;
  pinned?: boolean;
  cta?: { label: string; href: string };
  meta?: { label: string; value: string }[];
};

type PostTag = "announcement" | "tournament" | "update" | "maintenance";

/* ─────────────────────────────────────────────────────────────
   SHARED SMALL COMPONENTS
   ───────────────────────────────────────────────────────────── */
const tagCfg: Record<PostTag, { label: string; color: string; border: string; bg: string }> = {
  tournament:   { label: "Tournament",   color: "#a78bfa", border: "rgba(139,92,246,0.45)", bg: "rgba(139,92,246,0.09)" },
  announcement: { label: "Announcement", color: "#fbbf24", border: "rgba(251,191,36,0.4)",  bg: "rgba(251,191,36,0.07)" },
  update:       { label: "Update",       color: "#60a5fa", border: "rgba(96,165,250,0.35)", bg: "rgba(96,165,250,0.07)" },
  maintenance:  { label: "Maintenance",  color: "rgba(255,255,255,0.35)", border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)" },
};

function PostTagBadge({ tag }: { tag: string }) {
  const c = tagCfg[tag as PostTag] ?? tagCfg.update;
  return (
    <span style={{ color: c.color, background: c.bg, borderColor: c.border,
      clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
      className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.22em] uppercase px-2.5 py-0.5 border">
      {c.label}
    </span>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
      <div className="spin-loader" />
      <p className="font-[Rajdhani,sans-serif] text-white/20 text-sm tracking-wide">Loading {label}…</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
      <div className="empty-float inline-block">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
          <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
          <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-[Cinzel,serif] text-white/20 text-lg">No {label} Yet</p>
      <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-1 tracking-wide">Check back soon!</p>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
      <div className="w-14 h-14 border border-[rgba(139,92,246,0.25)] flex items-center justify-center bg-[rgba(139,92,246,0.05)]"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 2L20 6V12C20 16.5 16.5 20 12 22C7.5 20 4 16.5 4 12V6L12 2Z" stroke="#8b5cf6" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M12 8V12M12 16H12.01" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-[Cinzel,serif] text-base font-bold text-white/40">{label}</p>
      <p className="font-[Rajdhani,sans-serif] text-[0.72rem] tracking-[0.25em] uppercase text-white/20">Coming Soon</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDE PANEL CONTENT SECTIONS
   ───────────────────────────────────────────────────────────── */

/* MANAGE — shows the current nav tab's content (tournaments list etc.) */
function ManageContent({ activeTab }: { activeTab: NavTab }) {
  switch (activeTab) {
    case "tournaments":  return <ManageTournaments />;
    case "arenas":       return <ManageArenas />;
    case "clubs":        return <ManageClubs />;
    case "leaderboard":  return <ComingSoon label="Leaderboard" />;
  }
}

/* ── Manage Tournaments */
function ManageTournaments() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then(r => r.json())
      .then(d => setTournaments(d.tournaments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => {
    switch (s) {
      case "registration_open": return "#22c55e";
      case "upcoming": return "#f59e0b";
      case "ongoing": return "#3b82f6";
      case "completed": return "#6b7280";
      case "cancelled": return "#ef4444";
      default: return "#8b5cf6";
    }
  };
  const statusLabel = (s: string) => {
    switch (s) {
      case "registration_open": return "Open";
      case "upcoming": return "Upcoming";
      case "ongoing": return "Live";
      case "completed": return "Done";
      case "cancelled": return "Cancelled";
      case "draft": return "Draft";
      default: return s;
    }
  };

  if (loading) return <LoadingState label="tournaments" />;
  if (tournaments.length === 0) return <EmptyState label="Tournaments" />;

  return (
    <div className="content-in space-y-0">
      {tournaments.map((t, i) => {
        const tid  = t._id ?? "";
        const sc   = statusColor(t.status);
        const sl   = statusLabel(t.status);
        const reg  = t.registered_players ?? 0;
        const lim  = t.participants_limit ?? 0;
        const pct  = lim > 0 ? Math.min(100, Math.round((reg / lim) * 100)) : 0;
        const isFull = lim > 0 && reg >= lim;

        return (
          <div key={tid || i}
            onClick={() => router.push(`/tournaments/${tid}`)}
            className="group relative border-b border-[rgba(139,92,246,0.08)] pl-5 pr-4 py-4 flex flex-col gap-2 hover:bg-[rgba(139,92,246,0.04)] transition-all duration-200 cursor-pointer">
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: sc }} />

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase px-1.5 py-0.5 border"
                    style={{ color: sc, borderColor: `${sc}44`, background: `${sc}11`, clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                    {sl}
                  </span>
                  {t.visibility === "private" && (
                    <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-white/20 border border-white/10 px-1.5 py-0.5"
                      style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                      Private
                    </span>
                  )}
                </div>
                <h3 className="font-[Cinzel,serif] text-[0.88rem] text-white font-bold leading-snug group-hover:text-[#a78bfa] transition-colors">
                  {t.title}
                </h3>
                {t.description && (
                  <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/25 mt-0.5 line-clamp-1">{t.description}</p>
                )}
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <div className="text-center">
                  <p className="font-[Rajdhani,sans-serif] text-[0.5rem] uppercase text-white/20 mb-0.5">Prize</p>
                  <p className="font-[Cinzel,serif] text-[0.8rem] font-bold text-[#a78bfa]">
                    {t.prize_pool > 0 ? `₹${t.prize_pool.toLocaleString()}` : "Trophy"}
                  </p>
                </div>
                <div className="text-center min-w-[60px]">
                  <p className="font-[Rajdhani,sans-serif] text-[0.5rem] uppercase text-white/20 mb-0.5">Slots</p>
                  {lim > 0 ? (
                    <>
                      <div className="h-1 w-full bg-[rgba(255,255,255,0.05)] my-0.5"
                        style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
                        <div className="h-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: pct >= 100 ? "#f87171" : pct > 80 ? "#f59e0b" : "#8b5cf6" }} />
                      </div>
                      <p className="font-[Rajdhani,sans-serif] text-[0.6rem]"
                        style={{ color: pct >= 100 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
                        {pct >= 100 ? "FULL" : `${reg}/${lim}`}
                      </p>
                    </>
                  ) : (
                    <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-[#f59e0b]">Unlimited</p>
                  )}
                </div>
                <span className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.18em] uppercase text-[#a78bfa]/40 group-hover:text-[#a78bfa]/80 transition-colors">
                  View →
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Manage Arenas */
function ManageArenas() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/arenas")
      .then(r => r.json())
      .then(d => setArenas(d.arenas ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="arenas" />;
  if (arenas.length === 0) return <EmptyState label="Arenas" />;

  return (
    <div className="content-in space-y-0">
      {arenas.map((arena, i) => {
        const gamesLabel = arena.supported_games?.join(", ") ?? "—";
        return (
          <div key={arena._id ?? i}
            className="group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-200 pl-5 pr-4 py-4 flex items-center gap-4">
            <div className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ background: arena.is_verified ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)" }} />
            <div className="w-[48px] h-[48px] flex-shrink-0 flex items-center justify-center border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
              {arena.arena_image
                ? <img src={arena.arena_image} alt={arena.arena_name} className="w-full h-full object-cover" />
                : <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 opacity-30">
                    <path d="M3 21V7L12 3L21 7V21H3Z" stroke="#8b5cf6" strokeWidth="1.5" />
                    <path d="M9 21V14H15V21" stroke="#8b5cf6" strokeWidth="1.5" />
                  </svg>
              }
            </div>
            <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-[Cinzel,serif] font-bold text-[0.88rem] text-white/85 group-hover:text-[#a78bfa] transition-colors">{arena.arena_name}</h3>
                {arena.is_verified && (
                  <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border text-[#8b5cf6] border-[rgba(139,92,246,0.44)] bg-[rgba(139,92,246,0.11)]"
                    style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>Verified</span>
                )}
              </div>
              {arena.arena_description && <p className="font-[Rajdhani,sans-serif] text-[0.68rem] text-white/25 line-clamp-1">{arena.arena_description}</p>}
              <p className="font-[Rajdhani,sans-serif] text-[0.58rem] text-white/18 mt-0.5">
                {arena.arena_location}{arena.arena_city ? ` · ${arena.arena_city}` : ""}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-5 shrink-0">
              <div className="text-center">
                <p className="font-[Rajdhani,sans-serif] text-[0.5rem] uppercase text-white/20 mb-0.5">Games</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/55">{gamesLabel}</p>
              </div>
              {arena.capacity && arena.capacity > 0 && (
                <div className="text-center">
                  <p className="font-[Rajdhani,sans-serif] text-[0.5rem] uppercase text-white/20 mb-0.5">Capacity</p>
                  <p className="font-[Cinzel,serif] font-bold text-[0.8rem] text-[#a78bfa]">{arena.capacity}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Manage Clubs */
function ManageClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clubs")
      .then(r => r.json())
      .then(d => setClubs(d.clubs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="clubs" />;
  if (clubs.length === 0) return <EmptyState label="Clubs" />;

  return (
    <div className="content-in space-y-0">
      {clubs.map((club, i) => {
        const memberCount = club.members?.length ?? 0;
        const gameLabel   = club.supported_games?.join(", ") ?? "—";
        return (
          <div key={club._id ?? i}
            className="group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-200 pl-5 pr-4 py-4 flex items-center gap-4">
            <div className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ background: club.is_verified ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)" }} />
            <div className="w-[60px] flex-shrink-0">
              <div className="font-[Cinzel,serif] font-black text-center text-[#a78bfa] text-sm"
                style={{ textShadow: "0 0 16px rgba(139,92,246,0.4)" }}>
                [{club.club_tag}]
              </div>
            </div>
            <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-[Cinzel,serif] font-bold text-[0.88rem] text-white/85 group-hover:text-[#a78bfa] transition-colors">{club.club_name}</h3>
                {club.is_verified && (
                  <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border text-[#8b5cf6] border-[rgba(139,92,246,0.44)] bg-[rgba(139,92,246,0.11)]"
                    style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>Verified</span>
                )}
              </div>
              {club.club_description && <p className="font-[Rajdhani,sans-serif] text-[0.68rem] text-white/25 line-clamp-1">{club.club_description}</p>}
              <p className="font-[Rajdhani,sans-serif] text-[0.58rem] text-white/18 mt-0.5">Led by {club.username} · {club.city}</p>
            </div>
            <div className="hidden md:flex items-center gap-5 shrink-0">
              <div className="text-center">
                <p className="font-[Rajdhani,sans-serif] text-[0.5rem] uppercase text-white/20 mb-0.5">Games</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/55">{gameLabel}</p>
              </div>
              <div className="text-center">
                <p className="font-[Rajdhani,sans-serif] text-[0.5rem] uppercase text-white/20 mb-0.5">Members</p>
                <p className="font-[Cinzel,serif] font-bold text-[0.8rem] text-[#a78bfa]">{memberCount}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Create new entity */
function CreateContent({ activeTab }: { activeTab: NavTab }) {
  const label = activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1); // e.g. "Tournament"
  return (
    <div className="content-in flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
      <div className="w-16 h-16 border border-[rgba(139,92,246,0.3)] flex items-center justify-center bg-[rgba(139,92,246,0.06)]"
        style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
          <path d="M12 5V19M5 12H19" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Organiser Tools</p>
        <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Create {label}</h2>
        <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/30 mt-2 tracking-wide">
          Creation forms are coming soon for organisers.
        </p>
      </div>
      <button
        className="font-[Rajdhani,sans-serif] font-bold text-[0.72rem] tracking-[0.25em] uppercase px-8 py-3 border border-[rgba(139,92,246,0.4)] text-[#a78bfa] bg-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.18)] hover:border-[rgba(139,92,246,0.7)] transition-all duration-200"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        + New {label}
      </button>
    </div>
  );
}

/* ── Post Updates */
function PostUpdatesContent() {
  const [title, setTitle] = useState("");
  const [body,  setBody]  = useState("");
  const [tag,   setTag]   = useState<PostTag>("announcement");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tag }),
      });
      setSent(true);
      setTitle(""); setBody("");
      setTimeout(() => setSent(false), 3000);
    } catch { }
    finally { setSending(false); }
  };

  const tagOptions: PostTag[] = ["announcement", "tournament", "update", "maintenance"];

  return (
    <div className="content-in max-w-[600px] mx-auto p-2 space-y-5">
      <div>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Broadcast</p>
        <h2 className="font-[Cinzel,serif] text-lg font-bold text-white">Post an Update</h2>
      </div>

      {/* Tag selector */}
      <div className="flex gap-2 flex-wrap">
        {tagOptions.map(t => (
          <button key={t} onClick={() => setTag(t)}
            className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.2em] uppercase px-3 py-1.5 border transition-all duration-150"
            style={{
              clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              borderColor: tag === t ? "rgba(139,92,246,0.7)" : "rgba(139,92,246,0.15)",
              background:  tag === t ? "rgba(139,92,246,0.18)" : "transparent",
              color:       tag === t ? "#a78bfa" : "rgba(255,255,255,0.25)",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/25 block mb-1.5">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Update title…"
          className="w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] px-4 py-3 font-[Rajdhani,sans-serif] text-[0.82rem] text-white placeholder-white/15 focus:outline-none focus:border-[rgba(139,92,246,0.55)] transition-all"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
      </div>

      {/* Body */}
      <div>
        <label className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/25 block mb-1.5">Message</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
          placeholder="Write your update…"
          className="w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] px-4 py-3 font-[Rajdhani,sans-serif] text-[0.82rem] text-white placeholder-white/15 focus:outline-none focus:border-[rgba(139,92,246,0.55)] transition-all resize-none"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className="w-full py-3 font-[Rajdhani,sans-serif] font-bold text-[0.82rem] tracking-[0.25em] uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
          background: sent ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
          border:     sent ? "1px solid rgba(34,197,94,0.6)" : "1px solid rgba(139,92,246,0.5)",
          color:      sent ? "#4ade80" : "#fff",
        }}>
        {sent ? "✓ Posted!" : sending ? "Posting…" : "Post Update →"}
      </button>
    </div>
  );
}

/* ── Settings */
function SettingsContent({ session }: { session: any }) {
  const user = session?.user;
  return (
    <div className="content-in max-w-[500px] mx-auto p-2 space-y-5">
      <div>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Organiser</p>
        <h2 className="font-[Cinzel,serif] text-lg font-bold text-white">Settings</h2>
      </div>

      <div className="border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.04)] px-5 py-4 space-y-3"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/25">Account</p>
        {[
          { label: "Username",  val: user?.username ?? "—" },
          { label: "Role",      val: user?.role ?? "—" },
          { label: "Email",     val: user?.email ?? "—" },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between border-b border-[rgba(139,92,246,0.07)] pb-2 last:border-none last:pb-0">
            <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-widest uppercase text-white/25">{label}</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] font-semibold text-white/60">{val}</span>
          </div>
        ))}
      </div>

      <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)] px-5 py-4 rounded-none"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] text-white/20">
          More organiser settings are coming soon. Contact support for advanced configuration.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RIGHT PANEL — switch based on activeTab
   ───────────────────────────────────────────────────────────── */
function RightPanelContent({
  activePanel, activeTab, session,
}: {
  activePanel: SidePanel;
  activeTab: NavTab;
  session: any;
}) {
  switch (activePanel) {
    case "manage":       return <ManageContent activeTab={activeTab} />;
    case "create":       return <CreateContent activeTab={activeTab} />;
    case "post-updates": return <PostUpdatesContent />;
    case "settings":     return <SettingsContent session={session} />;
  }
}

/* ─────────────────────────────────────────────────────────────
   MAIN SHELL
   ───────────────────────────────────────────────────────────── */
export default function OrganiserDashboardPage() {
  const { data: session } = useSession();
  const [activeTab,   setActiveTab]   = useState<NavTab>("tournaments");
  const [activePanel, setActivePanel] = useState<SidePanel>("manage");
  const [avatarOpen,  setAvatarOpen]  = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const user        = session?.user;
  const displayName = user?.username ?? "Organiser";
  const initials    = displayName.slice(0, 2).toUpperCase();

  const NAV_TABS: { key: NavTab; label: string }[] = [
    { key: "tournaments", label: "TOURNAMENTS" },
    { key: "arenas",      label: "ARENAS"      },
    { key: "leaderboard", label: "LEADERBOARD" },
    { key: "clubs",       label: "CLUBS"       },
  ];

  const SIDE_ITEMS: { key: SidePanel; label: string }[] = [
    { key: "manage",       label: "MANAGE"       },
    { key: "create",       label: "CREATE"       },
    { key: "post-updates", label: "POST UPDATES" },
    { key: "settings",     label: "SETTINGS"     },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        /* ── Animations */
        @keyframes fadeUp    { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0);    } }
        @keyframes fadeIn    { from { opacity:0;                              } to { opacity:1;                             } }
        @keyframes contentIn { from { opacity:0; transform:translateX(8px);   } to { opacity:1; transform:translateX(0);   } }
        @keyframes dropIn    { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spinPulse { 0%{transform:rotate(0deg);opacity:.4;} 50%{opacity:1;} 100%{transform:rotate(360deg);opacity:.4;} }
        @keyframes emptyFloat{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
        @keyframes gridFade  { from{opacity:0;} to{opacity:0.022;} }

        .shell-in    { animation: fadeUp    .45s ease forwards; }
        .content-in  { animation: contentIn .3s  ease forwards; }
        .drop-in     { animation: dropIn    .18s ease forwards; }
        .anim-grid   { animation: gridFade  2s   ease forwards; }
        .empty-float { animation: emptyFloat 3s ease-in-out infinite; }

        .spin-loader {
          width:28px; height:28px;
          border:2px solid rgba(139,92,246,0.15);
          border-top-color:#8b5cf6;
          border-radius:50%;
          animation:spinPulse 1s linear infinite;
        }

        /* ── Top nav tab */
        .nav-tab {
          font-family:'Rajdhani',sans-serif;
          font-size:0.72rem;
          letter-spacing:0.28em;
          font-weight:600;
          text-transform:uppercase;
          color:rgba(255,255,255,0.28);
          padding:10px 18px;
          border-bottom:2px solid transparent;
          cursor:pointer;
          transition:all .18s ease;
          background:none;
          border-top:none; border-left:none; border-right:none;
          white-space:nowrap;
        }
        .nav-tab:hover  { color:rgba(255,255,255,0.65); border-bottom-color:rgba(139,92,246,0.35); }
        .nav-tab.active { color:#a78bfa; border-bottom-color:#8b5cf6; }

        /* ── Side panel button */
        .side-btn {
          font-family:'Rajdhani',sans-serif;
          font-size:0.7rem;
          letter-spacing:0.3em;
          font-weight:600;
          text-transform:uppercase;
          color:rgba(255,255,255,0.3);
          padding:12px 16px;
          border:none;
          background:none;
          cursor:pointer;
          transition:all .18s ease;
          text-align:left;
          width:100%;
          display:block;
          border-left:2px solid transparent;
        }
        .side-btn:hover  { color:rgba(255,255,255,0.65); border-left-color:rgba(139,92,246,0.35); background:rgba(139,92,246,0.04); }
        .side-btn.active { color:#a78bfa; border-left-color:#8b5cf6; background:rgba(139,92,246,0.08); }

        /* ── Avatar */
        .avatar-btn {
          width:42px; height:42px; border-radius:50%;
          border:1.5px solid rgba(139,92,246,0.45);
          background:rgba(139,92,246,0.1);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .2s ease;
        }
        .avatar-btn:hover { border-color:rgba(139,92,246,0.8); background:rgba(139,92,246,0.18); box-shadow:0 0 16px rgba(139,92,246,0.3); }
        .avatar-btn.open  { border-color:rgba(139,92,246,0.95); box-shadow:0 0 22px rgba(139,92,246,0.35); }

        /* ── Dropdown */
        .dropdown {
          position:absolute; top:calc(100% + 10px); right:0;
          width:170px;
          background:#090919;
          border:1px solid rgba(139,92,246,0.3);
          z-index:200;
          box-shadow:0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(139,92,246,0.1);
        }
        .dropdown-item {
          font-family:'Rajdhani',sans-serif; font-size:0.72rem;
          letter-spacing:0.22em; text-transform:uppercase;
          padding:11px 16px; color:rgba(255,255,255,0.45);
          cursor:pointer; transition:all .15s ease;
          display:block; border-bottom:1px solid rgba(139,92,246,0.07);
          width:100%; text-align:left; background:none;
          border-right:none; border-top:none; border-left:none;
          text-decoration:none;
        }
        .dropdown-item:last-child   { border-bottom:none; }
        .dropdown-item:hover        { background:rgba(139,92,246,0.08); color:rgba(255,255,255,0.82); }
        .dropdown-item.danger:hover { background:rgba(239,68,68,0.08); color:#f87171; }

        /* ── Scrollbars */
        .scroll-thin::-webkit-scrollbar       { width:3px; }
        .scroll-thin::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.25); border-radius:2px; }

        /* ── Line clamp */
        .line-clamp-1 { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }

        /* button helpers */
        .join-btn:hover:not(:disabled) { background:rgba(139,92,246,0.2) !important; border-color:rgba(139,92,246,0.7) !important; box-shadow:0 0 14px rgba(139,92,246,0.2); }

        /* Modal */
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(12px);} to{opacity:1;transform:scale(1) translateY(0);} }
        .modal-panel { animation:modalIn .25s ease forwards; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          FULL-PAGE BACKGROUND
          ══════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 bg-[#050510]" />

      {/* Background grid */}
      <div className="anim-grid fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 65%)" }}
      />

      {/* ══════════════════════════════════════════════════════════
          LAYOUT — full viewport, flex column
          ══════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 flex flex-col overflow-hidden">

        {/* ── TOP NAVBAR ── */}
        <header className="shell-in relative z-30 shrink-0 flex items-center justify-between px-6 border-b border-[rgba(139,92,246,0.14)]"
          style={{ background: "rgba(5,5,16,0.75)", backdropFilter: "blur(14px)", height: "58px" }}>

          {/* Brand */}
          <span className="font-[Cinzel,serif] font-black tracking-[0.12em] text-[1.1rem] shrink-0"
            style={{ background: "linear-gradient(135deg,#c4b5fd,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            RANAKSHETRA
          </span>

          {/* Center nav tabs */}
          <nav className="flex items-end h-full gap-1">
            {NAV_TABS.map(tab => (
              <button key={tab.key}
                className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Avatar */}
          <div className="relative shrink-0" ref={avatarRef}>
            <button className={`avatar-btn ${avatarOpen ? "open" : ""}`}
              onClick={() => setAvatarOpen(v => !v)}>
              <span className="font-[Cinzel,serif] text-[0.6rem] font-black text-[#a78bfa]">{initials}</span>
            </button>

            {avatarOpen && (
              <div className="dropdown drop-in">
                <div className="px-4 py-3 border-b border-[rgba(139,92,246,0.12)]">
                  <p className="font-[Cinzel,serif] text-[0.72rem] font-bold text-white/70">{displayName}</p>
                  {user?.role && (
                    <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-widest uppercase text-[#8b5cf6]/60 mt-0.5">{user.role}</p>
                  )}
                </div>
                <Link href="/profile"   className="dropdown-item" onClick={() => setAvatarOpen(false)}>Profile</Link>
                <Link href="/settings"  className="dropdown-item" onClick={() => setAvatarOpen(false)}>Settings</Link>
                <button className="dropdown-item danger"
                  onClick={() => { setAvatarOpen(false); signOut({ callbackUrl: "/" }); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── BODY — padded container with outer border ── */}
        <div className="flex-1 overflow-hidden p-5">
          {/* Outer bordered container (matches the design wireframe) */}
          <div className="shell-in h-full border border-[rgba(139,92,246,0.22)] flex overflow-hidden"
            style={{
              background: "rgba(5,5,16,0.5)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 60px rgba(139,92,246,0.06), inset 0 0 60px rgba(139,92,246,0.02)",
            }}>

            {/* ── LEFT PANEL (MANAGE / CREATE / POST UPDATES / SETTINGS) ── */}
            <aside className="shrink-0 w-[185px] border-r border-[rgba(139,92,246,0.14)] flex flex-col">
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[rgba(139,92,246,0.4)]" />

              <div className="pt-4 pb-2">
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.4em] uppercase text-white/15 px-4 mb-2">Tools</p>
              </div>

              <nav className="flex-1">
                {SIDE_ITEMS.map(item => (
                  <button key={item.key}
                    className={`side-btn ${activePanel === item.key ? "active" : ""}`}
                    onClick={() => setActivePanel(item.key)}>
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Bottom info card */}
              <div className="p-4">
                <div className="border border-[rgba(139,92,246,0.1)] bg-[rgba(139,92,246,0.03)] px-3 pt-3 pb-3"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.1)] flex items-center justify-center shrink-0"
                      style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                      <span className="font-[Cinzel,serif] text-[0.45rem] font-black text-[#a78bfa]">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-[Rajdhani,sans-serif] text-[0.6rem] font-semibold text-white/55 truncate">{displayName}</p>
                      {user?.role && (
                        <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-widest uppercase text-[#8b5cf6]/45">{user.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── RIGHT CONTENT PANEL ── */}
            <main className="flex-1 overflow-y-auto scroll-thin p-5">
              {/* Content section header */}
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[rgba(139,92,246,0.09)]">
                <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.35em] uppercase text-[#8b5cf6]/60">
                  {activePanel.replace("-", " ")}
                </span>
                <div className="h-px flex-1 bg-[rgba(139,92,246,0.07)]" />
                <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/15">
                  {activeTab}
                </span>
              </div>

              <RightPanelContent
                activePanel={activePanel}
                activeTab={activeTab}
                session={session}
              />
            </main>

          </div>
        </div>
      </div>
    </>
  );
}
