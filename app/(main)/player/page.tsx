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
type NavSection = "dashboard" | "tournaments" | "clubs" | "arenas" | "leaderboard";

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
   SMALL SHARED COMPONENTS
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

/* ── Shared loading / empty / error states */
function LoadingState({ label }: { label: string }) {
  return (
    <div className="text-center py-16">
      <div className="spin-loader mx-auto mb-3" />
      <p className="font-[Rajdhani,sans-serif] text-white/20 text-sm tracking-wide">Loading {label}...</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16">
      <div className="empty-float mb-4 inline-block">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
          <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
          <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-[Cinzel,serif] text-white/20 text-lg">No {label} Yet</p>
      <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
        Check back soon!
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD SECTION — welcome + updates from DB
───────────────────────────────────────────────────────────── */
function DashboardSection({ session }: { session: any }) {
  const [updates, setUpdates] = useState<UpdatePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const res = await fetch("/api/updates");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setUpdates(data.updates ?? []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchUpdates();
  }, []);

  const user = session?.user;
  const displayName = user?.username ?? "Warrior";

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
              {displayName}{" "}
              {user?.player_tag && (
                <span className="text-white/30 text-base font-normal">· {user.player_tag}</span>
              )}
            </h3>
          </div>
          {user?.role && (
            <div className="flex gap-3">
              <div className="text-center px-3 py-2 border border-[rgba(139,92,246,0.12)] bg-white/[0.02]"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                <p className="font-[Cinzel,serif] font-bold text-sm text-[#a78bfa]">{user.role}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.22em] uppercase text-white/25 mt-0.5">Role</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Feed header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6]">Official</p>
          <h2 className="font-[Cinzel,serif] text-base font-bold text-white">Updates & Announcements</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 6px #8b5cf6", animation: "livePulse 2s ease-in-out infinite" }} />
          <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/25">Live</span>
        </div>
      </div>

      {loading && <LoadingState label="updates" />}

      {!loading && updates.length === 0 && <EmptyState label="Updates" />}

      {!loading && updates.length > 0 && (
        <div className="space-y-3">
          {updates.map((post, i) => (
            <article key={post._id ?? i}
              className="relative border bg-white/[0.016] transition-all duration-250 group"
              style={{
                borderColor: post.pinned ? "rgba(139,92,246,0.28)" : "rgba(139,92,246,0.11)",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                animationDelay: `${i * 0.05}s`,
              }}>
              {post.pinned && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: "linear-gradient(180deg, transparent 0%, #8b5cf6 30%, #8b5cf6 70%, transparent 100%)" }} />
              )}
              <div className="px-5 pt-4 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 border border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.12)] flex items-center justify-center shrink-0"
                      style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                        <path d="M7 1L11.5 3.5V7C11.5 9.8 9.5 12 7 13C4.5 12 2.5 9.8 2.5 7V3.5L7 1Z" stroke="#8b5cf6" strokeWidth="1" strokeLinejoin="round" />
                        <path d="M5 7L6.5 8.5L9 6" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-[Rajdhani,sans-serif] text-[0.68rem] font-semibold text-[#a78bfa] tracking-wide leading-none">RANAKSHETRA Official</p>
                      <p className="font-[Rajdhani,sans-serif] text-[0.52rem] text-white/25 tracking-wide mt-0.5">
                        {post.timestamp ?? (post.created_at ? new Date(post.created_at).toLocaleDateString() : "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {post.pinned && <span className="font-[Rajdhani,sans-serif] text-[0.46rem] tracking-[0.2em] uppercase text-[#8b5cf6]/50">◈ pinned</span>}
                    {post.tag && <PostTagBadge tag={post.tag} />}
                  </div>
                </div>
                <h4 className="font-[Cinzel,serif] text-[0.95rem] font-bold text-white mb-2 leading-snug">{post.title}</h4>
                <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/45 leading-relaxed">{post.body}</p>
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
                {post.cta && (
                  <div className="mt-3">
                    <Link href={post.cta.href}
                      className="inline-block no-underline font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(139,92,246,0.35)] text-[#8b5cf6] bg-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.14)] hover:border-[rgba(139,92,246,0.65)] transition-all duration-200"
                      style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                      {post.cta.label} ⟶
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && updates.length > 0 && (
        <div className="text-center pt-4 pb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-16 h-px bg-[rgba(139,92,246,0.1)]" />
            <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/15">End of feed</span>
            <div className="w-16 h-px bg-[rgba(139,92,246,0.1)]" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENTS SECTION — with join / check-out
───────────────────────────────────────────────────────────── */
function TournamentsSection() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState<string[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [checkingJoined, setCheckingJoined] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/tournaments");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setTournaments(data.tournaments ?? []);
      } catch { /* */ } finally { setLoading(false); }
    }
    fetch_();
  }, []);

  /* Check which tournaments the user already joined */
  useEffect(() => {
    if (tournaments.length === 0) { setCheckingJoined(false); return; }
    const checkAll = async () => {
      try {
        const results = await Promise.all(
          tournaments.map(async (t) => {
            const tid = t._id ?? "";
            const res = await fetch("/api/tournaments/check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tournamentId: tid }),
            });
            const data = await res.json();
            return data.joined ? tid : null;
          })
        );
        setJoined(results.filter(Boolean) as string[]);
      } catch { /* */ } finally { setCheckingJoined(false); }
    };
    checkAll();
  }, [tournaments]);

  const handleJoin = async (tournamentId: string) => {
    setJoiningId(tournamentId);
    try {
      const res = await fetch("/api/tournaments/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to join"); return; }
      setJoined(prev => [...prev, tournamentId]);
    } catch { alert("Something went wrong"); } finally { setJoiningId(null); }
  };

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
    <div className="content-in space-y-2">
      {tournaments.map((t, i) => {
        const tid = t._id ?? "";
        const sc = statusColor(t.status);
        const sl = statusLabel(t.status);
        const reg = t.registered_players ?? 0;
        const lim = t.participants_limit ?? 0;
        const pct = lim > 0 ? Math.min(100, Math.round((reg / lim) * 100)) : 0;
        const isFull = lim > 0 && reg >= lim;

        return (
          <div key={tid || i}
            className="relative bg-[#070718] border-b border-[rgba(139,92,246,0.08)] pl-5 pr-4 py-4 flex flex-col gap-3 hover:bg-[rgba(139,92,246,0.03)] transition-all duration-200">
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
                      style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>Private</span>
                  )}
                </div>
                <h3 className="font-[Cinzel,serif] text-[0.88rem] text-white font-bold leading-snug">{t.title}</h3>
                {t.description && <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/25 mt-0.5 line-clamp-1">{t.description}</p>}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="font-[Rajdhani,sans-serif] text-[0.52rem] uppercase text-white/20 mb-0.5">Region</p>
                  <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/60">{t.region || "—"}</p>
                </div>
                <div className="text-center">
                  <p className="font-[Rajdhani,sans-serif] text-[0.52rem] uppercase text-white/20 mb-0.5">Prize</p>
                  <p className="font-[Cinzel,serif] text-[0.8rem] font-bold text-[#a78bfa]">
                    {t.prize_pool > 0 ? `₹${t.prize_pool.toLocaleString()}` : "Trophy"}
                  </p>
                </div>
                <div className="text-center min-w-[60px]">
                  <p className="font-[Rajdhani,sans-serif] text-[0.52rem] uppercase text-white/20 mb-0.5">Slots</p>
                  {lim > 0 ? (
                    <>
                      <div className="h-1 w-full bg-[rgba(255,255,255,0.05)] my-0.5" style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: pct >= 100 ? "#f87171" : pct > 80 ? "#f59e0b" : "#8b5cf6" }} />
                      </div>
                      <p className="font-[Rajdhani,sans-serif] text-[0.6rem]" style={{ color: pct >= 100 ? "#f87171" : "rgba(255,255,255,0.4)" }}>
                        {pct >= 100 ? "FULL" : `${reg}/${lim}`}
                      </p>
                    </>
                  ) : (
                    <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-[#f59e0b]">Unlimited</p>
                  )}
                </div>

                {/* ── Join / Check Out button */}
                <div className="flex-shrink-0">
                  {checkingJoined ? (
                    <button disabled className="join-btn px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap opacity-40 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa]"
                      style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                      ...
                    </button>
                  ) : joined.includes(tid) ? (
                    <button
                      onClick={() => router.push(`/tournaments/${tid}`)}
                      className="join-btn px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap transition-all bg-[#a78bfa]/10 border border-[#a78bfa] text-[#a78bfa]"
                      style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                      Check Out →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(tid)}
                      disabled={joiningId === tid || isFull || t.status === "completed" || t.status === "cancelled"}
                      className="join-btn px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap transition-all bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                      {joiningId === tid ? "Joining..." : isFull ? "Full" : "Join →"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLUB APPLY MODAL
───────────────────────────────────────────────────────────── */
function ClubApplyModal({ club, onClose }: { club: Club; onClose: () => void }) {
  const memberCount = club.members?.length ?? 0;
  const gameLabel = club.supported_games?.join(", ") ?? "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#050510]/80 backdrop-blur-sm" />
      <div className="modal-panel relative w-full max-w-[460px] bg-[#09091a] border border-[rgba(139,92,246,0.35)] p-8"
        style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
        onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[rgba(139,92,246,0.6)]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[rgba(139,92,246,0.6)]" />
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Application</p>
            <h3 className="font-[Cinzel,serif] font-bold text-white text-xl">Apply to [{club.club_tag}]</h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/30 mt-0.5">{club.club_name}</p>
          </div>
          <button onClick={onClose}
            className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] text-white/25 hover:text-white/60 transition-colors border border-[rgba(139,92,246,0.15)] px-3 py-1 bg-transparent cursor-pointer"
            style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>ESC</button>
        </div>
        <div className="flex gap-3 mb-6 p-3 border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.04)]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          {[{ label: "Game", val: gameLabel }, { label: "City", val: club.city }, { label: "Members", val: String(memberCount) }].map(({ label, val }) => (
            <div key={label} className="flex-1 text-center">
              <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.2em] uppercase text-white/25 mb-0.5">{label}</p>
              <p className="font-[Rajdhani,sans-serif] font-bold text-[0.78rem] text-white/70">{val}</p>
            </div>
          ))}
        </div>
        <div className="border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] px-4 py-4 mb-6"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <div className="flex items-start gap-3">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-60">
              <circle cx="10" cy="10" r="8" stroke="#8b5cf6" strokeWidth="1.5" />
              <line x1="10" y1="9" x2="10" y2="14" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="10" cy="6.5" r="0.8" fill="#8b5cf6" />
            </svg>
            <div>
              <p className="font-[Rajdhani,sans-serif] font-bold text-[0.72rem] tracking-[0.1em] text-[#a78bfa] mb-1">Applications Opening Soon</p>
              <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/35 leading-relaxed">
                Club application forms are being built. Once live, you'll submit your IGN, rank proof,
                and a short message to the club leader.
              </p>
            </div>
          </div>
        </div>
        <button className="apply-btn w-full py-3 font-[Rajdhani,sans-serif] font-bold text-[0.88rem] tracking-[0.2em] uppercase text-white mb-3 border-none cursor-pointer" onClick={onClose}>
          Notify Me When Open
        </button>
        <button onClick={onClose}
          className="w-full py-2.5 font-[Rajdhani,sans-serif] text-[0.78rem] tracking-[0.15em] uppercase text-white/25 hover:text-white/45 transition-colors border border-[rgba(139,92,246,0.1)] hover:border-[rgba(139,92,246,0.3)] bg-transparent cursor-pointer"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>Close</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLUBS SECTION — with Apply modal
───────────────────────────────────────────────────────────── */
function ClubsSection() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyClub, setApplyClub] = useState<Club | null>(null);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/clubs");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setClubs(data.clubs ?? []);
      } catch { /* */ } finally { setLoading(false); }
    }
    fetch_();
  }, []);

  if (loading) return <LoadingState label="clubs" />;
  if (clubs.length === 0) return <EmptyState label="Clubs" />;

  return (
    <>
      {applyClub && <ClubApplyModal club={applyClub} onClose={() => setApplyClub(null)} />}
      <div className="content-in space-y-0">
        {clubs.map((club, i) => {
          const memberCount = club.members?.length ?? 0;
          const gameLabel = club.supported_games?.join(", ") ?? "—";
          return (
            <div key={club._id ?? i}
              className="group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-200 pl-5 pr-4 py-4 flex items-center gap-4">
              <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: club.is_verified ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)" }} />

              {/* Tag */}
              <div className="w-[60px] flex-shrink-0">
                <div className="font-[Cinzel,serif] font-black text-center text-[#a78bfa] text-sm" style={{ textShadow: "0 0 16px rgba(139,92,246,0.4)" }}>
                  [{club.club_tag}]
                </div>
              </div>

              <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] flex-shrink-0" />

              {/* Info */}
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

              {/* Stats */}
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

              {/* Apply button */}
              <button
                onClick={() => setApplyClub(club)}
                className="apply-btn-sm flex-shrink-0 font-[Rajdhani,sans-serif] font-bold text-[0.6rem] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-200 bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa] cursor-pointer"
                style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                Apply →
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ARENAS SECTION
───────────────────────────────────────────────────────────── */
function ArenasSection() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch("/api/arenas");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setArenas(data.arenas ?? []);
      } catch { /* */ } finally { setLoading(false); }
    }
    fetch_();
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

            {/* Icon */}
            <div className="w-[48px] h-[48px] flex-shrink-0 flex items-center justify-center border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)]"
              style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
              {arena.arena_image ? (
                <img src={arena.arena_image} alt={arena.arena_name} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 opacity-30">
                  <path d="M3 21V7L12 3L21 7V21H3Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M9 21V14H15V21" stroke="#8b5cf6" strokeWidth="1.5" />
                </svg>
              )}
            </div>

            <div className="w-px self-stretch bg-[rgba(139,92,246,0.1)] flex-shrink-0" />

            {/* Info */}
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
                {arena.organizer_name ? ` · by ${arena.organizer_name}` : ""}
              </p>
            </div>

            {/* Stats */}
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

/* ─────────────────────────────────────────────────────────────
   LEADERBOARD SECTION (placeholder — no collection yet)
───────────────────────────────────────────────────────────── */
function LeaderboardSection() {
  return <PlaceholderSection label="Leaderboard" />;
}

/* ─────────────────────────────────────────────────────────────
   MAIN LAYOUT SHELL
───────────────────────────────────────────────────────────── */
export default function PlayerMainPage() {
  const { data: session } = useSession();
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

  const user = session?.user;
  const displayName = user?.username ?? "Warrior";
  const initials = displayName.slice(0, 2).toUpperCase();

  const NAV_LINKS: { key: NavSection; label: string }[] = [
    { key: "tournaments", label: "TOURNAMENTS" },
    { key: "clubs",       label: "CLUBS"       },
    { key: "arenas",      label: "ARENAS"      },
    { key: "leaderboard", label: "LEADERBOARD" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":    return <DashboardSection session={session} />;
      case "tournaments":  return <TournamentsSection />;
      case "clubs":        return <ClubsSection />;
      case "arenas":       return <ArenasSection />;
      case "leaderboard":  return <LeaderboardSection />;
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
        @keyframes spinPulse {
          0%   { transform: rotate(0deg);   opacity: 0.4; }
          50%  { opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.4; }
        }
        @keyframes emptyFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .anim-grid  { animation: gridFade 2s ease forwards; }
        .shell-in   { animation: fadeUp 0.5s ease forwards; }
        .content-in { animation: contentIn 0.35s ease forwards; }
        .drop-in    { animation: dropIn 0.2s ease forwards; }
        .empty-float { animation: emptyFloat 3s ease-in-out infinite; }

        .spin-loader {
          width: 28px; height: 28px;
          border: 2px solid rgba(139,92,246,0.15);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spinPulse 1s linear infinite;
        }

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
          text-decoration: none;
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

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Join / Apply buttons */
        .join-btn:hover:not(:disabled) {
          background: rgba(139,92,246,0.2) !important;
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 14px rgba(139,92,246,0.2);
        }
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

        /* Modal */
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-panel { animation: modalIn 0.25s ease forwards; }
      `}</style>

      <div className="fixed inset-0 bg-[#050510] flex flex-col overflow-hidden">

        {/* ── Background grid */}
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
          <button onClick={() => setActiveSection("dashboard")} className="focus:outline-none bg-transparent border-none cursor-pointer">
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
                {initials}
              </span>
            </button>

            {avatarOpen && (
              <div className="dropdown drop-in">
                <div className="px-4 py-3 border-b border-[rgba(139,92,246,0.12)]">
                  <p className="font-[Cinzel,serif] text-[0.72rem] font-bold text-white/70">{displayName}</p>
                  {user?.role && (
                    <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-widest uppercase text-[#8b5cf6]/60 mt-0.5">{user.role}</p>
                  )}
                </div>
                <Link href="/profile" className="dropdown-item" onClick={() => setAvatarOpen(false)}>
                  Profile
                </Link>
                <Link href="/settings" className="dropdown-item" onClick={() => setAvatarOpen(false)}>
                  Settings
                </Link>
                <button className="dropdown-item danger" onClick={() => { setAvatarOpen(false); signOut({ callbackUrl: "/" }); }}>
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
                className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.05)] hover:bg-[rgba(139,92,246,0.1)] transition-all duration-200 cursor-pointer"
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
                      {initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-[Rajdhani,sans-serif] text-[0.65rem] font-semibold text-white/60 truncate">{displayName}</p>
                    {user?.role && (
                      <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-widest uppercase text-[#8b5cf6]/50">{user.role}</p>
                    )}
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