"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   DASHBOARD SECTION — welcome + official feed from DB
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
        {/* Live dot */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" style={{ boxShadow: "0 0 6px #8b5cf6", animation: "livePulse 2s ease-in-out infinite" }} />
          <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.25em] uppercase text-white/25">Live</span>
        </div>
      </div>

      {/* ── Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="spin-loader mx-auto mb-3" />
          <p className="font-[Rajdhani,sans-serif] text-white/20 text-sm tracking-wide">Loading updates...</p>
        </div>
      )}

      {/* ── No updates */}
      {!loading && updates.length === 0 && (
        <div className="text-center py-16">
          <div className="empty-float mb-4 inline-block">
            <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
              <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
              <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-[Cinzel,serif] text-white/20 text-lg">No Updates Yet</p>
          <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
            Check back soon for announcements and updates!
          </p>
        </div>
      )}

      {/* ── Posts feed */}
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
                      <p className="font-[Rajdhani,sans-serif] text-[0.52rem] text-white/25 tracking-wide mt-0.5">
                        {post.timestamp ?? (post.created_at ? new Date(post.created_at).toLocaleDateString() : "")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {post.pinned && (
                      <span className="font-[Rajdhani,sans-serif] text-[0.46rem] tracking-[0.2em] uppercase text-[#8b5cf6]/50">
                        ◈ pinned
                      </span>
                    )}
                    {post.tag && <PostTagBadge tag={post.tag} />}
                  </div>
                </div>

                {/* Post content */}
                <h4 className="font-[Cinzel,serif] text-[0.95rem] font-bold text-white mb-2 leading-snug">{post.title}</h4>
                <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/45 leading-relaxed">{post.body}</p>

                {/* Meta grid */}
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

      {/* End of feed */}
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
   MAIN LAYOUT SHELL
───────────────────────────────────────────────────────────── */
export default function PlayerMainPage() {
  const { data: session } = useSession();
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

  const NAV_LINKS = [
    { href: "/tournaments", label: "TOURNAMENTS" },
    { href: "/club",        label: "CLUBS"       },
    { href: "/arena",       label: "ARENAS"      },
    { href: "/leaderboard", label: "LEADERBOARD" },
  ];

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
          text-decoration: none;
        }
        .nav-link:hover {
          color: rgba(255,255,255,0.65);
          border-left-color: rgba(139,92,246,0.35);
          background: rgba(139,92,246,0.04);
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
          <Link href="/player" className="focus:outline-none no-underline">
            <span className="font-[Cinzel,serif] font-black tracking-[0.12em] text-xl"
              style={{ background: "linear-gradient(135deg, #c4b5fd, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              RANAKSHETRA
            </span>
          </Link>

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
                {/* Mini user info */}
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
              <Link href="/player"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.05)] hover:bg-[rgba(139,92,246,0.1)] transition-all duration-200 no-underline"
                style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 shrink-0">
                  <rect x="1" y="1" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                  <rect x="9" y="1" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                  <rect x="1" y="9" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                  <rect x="9" y="9" width="6" height="6" rx="0.5" stroke="#8b5cf6" strokeWidth="1.2" />
                </svg>
                <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.25em] uppercase text-[#a78bfa]">
                  Dashboard
                </span>
              </Link>
            </div>

            {/* Divider */}
            <div className="mx-4 mb-2 mt-2 h-px bg-[rgba(139,92,246,0.08)]" />

            {/* Nav links */}
            <nav className="flex-1 py-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href}
                  href={link.href}
                  className="nav-link">
                  {link.label}
                </Link>
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
            <DashboardSection session={session} />
          </main>

        </div>
      </div>
    </>
  );
}