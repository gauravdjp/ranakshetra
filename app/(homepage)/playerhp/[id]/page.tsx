"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type PlayerProfile = {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  city?: string;
  state?: string;
  country?: string;
  region?: string;
  device?: string;
  skill_level?: string;
  description?: string;
  games?: string[];
  fav_game?: string;
  player_tag?: string;
  tourney_games?: string[];
  is_verified?: boolean;
  created_at?: string;
  profile_image?: string;
};

type Update = {
  _id: string;
  title: string;
  body: string;
  tag?: string;
  created_at: string;
};

type Tournament = {
  _id: string;
  title: string;
  game_id: string;
  status: string;
  start_date: string;
  registration_deadline: string;
  entry_fee: number;
  prize_pool: number;
  region: string;
  participants_limit: number;
  registered_players?: number;
  tournament_type: string;
};

type Club = {
  _id: string;
  name: string;
  description?: string;
  game?: string;
  region?: string;
  members_count?: number;
  created_at?: string;
  tag?: string;
};

type Arena = {
  _id: string;
  name: string;
  description?: string;
  game?: string;
  region?: string;
  capacity?: number;
  status?: string;
  created_at?: string;
};

type NavId = "dashboard" | "profile" | "tournaments" | "clubs" | "leaderboard" | "arenas";

const NAV_ITEMS: { label: string; icon: string; id: NavId }[] = [
  { label: "Dashboard",   icon: "⚔",  id: "dashboard" },
  { label: "Tournaments", icon: "🏆", id: "tournaments" },
  { label: "Clubs",       icon: "🛡", id: "clubs" },
  { label: "Leaderboard", icon: "📊", id: "leaderboard" },
  { label: "Arenas",      icon: "🏟", id: "arenas" },
];

const TAG_COLORS: Record<string, string> = {
  update:       "rgba(139,92,246,0.18)",
  tournament:   "rgba(232,108,47,0.18)",
  arena:        "rgba(16,185,129,0.18)",
  announcement: "rgba(59,130,246,0.18)",
};
const TAG_TEXT: Record<string, string> = {
  update:       "#a78bfa",
  tournament:   "#fb923c",
  arena:        "#34d399",
  announcement: "#60a5fa",
};

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    upcoming:          { label: "Upcoming",  color: "#60a5fa", bg: "rgba(59,130,246,0.12)"  },
    registration_open: { label: "Reg. Open", color: "#34d399", bg: "rgba(16,185,129,0.12)" },
    ongoing:           { label: "Live",      color: "#fb923c", bg: "rgba(232,108,47,0.12)" },
    completed:         { label: "Completed", color: "#6b7280", bg: "rgba(107,114,128,0.10)"},
    draft:             { label: "Draft",     color: "#4b5563", bg: "rgba(75,85,99,0.10)"   },
    cancelled:         { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  };
  const s = map[status] ?? map.draft;
  return (
    <span style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}28` }}
      className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full">
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function PlayerHomePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: session, isPending } = useSession();

  const [player,      setPlayer]      = useState<PlayerProfile | null>(null);
  const [updates,     setUpdates]     = useState<Update[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [clubs,       setClubs]       = useState<Club[]>([]);
  const [arenas,      setArenas]      = useState<Arena[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [secLoading,  setSecLoading]  = useState(false);   // secondary fetch
  const [activeNav,   setActiveNav]   = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // track which sections have been fetched
  const [fetched, setFetched] = useState<Set<NavId>>(new Set(["dashboard"]));

  /* ── Auth guard */
  useEffect(() => {
    if (!isPending && !session) router.push("/signin");
  }, [session, isPending, router]);

  /* ── Initial fetch: player + updates + upcoming tournaments */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [pRes, uRes, tRes] = await Promise.all([
          fetch(`/api/players/${id}`),
          fetch("/api/updates"),
          fetch("/api/tournaments"),
        ]);
        if (pRes.ok) { const d = await pRes.json(); setPlayer(d.player); }
        if (uRes.ok) { const d = await uRes.json(); setUpdates(d.updates ?? []); }
        if (tRes.ok) { const d = await tRes.json(); setTournaments(d.tournaments ?? []); }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ── Lazy-fetch for clubs / arenas */
  const switchNav = useCallback(async (nav: NavId) => {
    setActiveNav(nav);
    if (fetched.has(nav)) return;
    setFetched((prev) => new Set(prev).add(nav));
    setSecLoading(true);
    try {
      if (nav === "clubs") {
        const r = await fetch("/api/clubs");
        if (r.ok) { const d = await r.json(); setClubs(d.clubs ?? []); }
      }
      if (nav === "arenas") {
        const r = await fetch("/api/arenas");
        if (r.ok) { const d = await r.json(); setArenas(d.arenas ?? []); }
      }
    } finally {
      setSecLoading(false);
    }
  }, [fetched]);

  const handleSignOut = async () => { await signOut(); router.push("/"); };

  if (isPending || loading) return <PageSkeleton />;
  if (!session)             return null;

  const name     = player?.name ?? session.user.name ?? "Player";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  /* ── Filter helpers */
  const upcomingTournaments = tournaments.filter((t) =>
    ["upcoming", "registration_open"].includes(t.status)
  );
  const allTournaments = tournaments;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e2e2e2",
      fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>

      {/* ════════ TOP BAR ════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px 0 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSidebarOpen((v) => !v)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "6px 8px", color: "#555", lineHeight: 1, borderRadius: 6,
            transition: "color 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#aaa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; }}
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect width="18" height="2" rx="1" fill="currentColor"/>
              <rect y="6" width="12" height="2" rx="1" fill="currentColor"/>
              <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: "linear-gradient(135deg,#7c3aed,#e86c2f)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700,
            }}>⚔</div>
            <span style={{ fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontSize: 16, fontWeight: 700,
              letterSpacing: "0.12em", color: "#e2e2e2" }}>RANAKSHETRA</span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={handleSignOut} style={{
            padding: "5px 14px", borderRadius: 6, fontSize: 11,
            border: "1px solid rgba(255,255,255,0.08)", color: "#666",
            background: "transparent", cursor: "pointer",
            letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#666"; }}
          >Log Out</button>
        </div>
      </header>

      {/* ════════ BODY ════════ */}
      <div style={{ display: "flex", paddingTop: 60, minHeight: "100vh" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: sidebarOpen ? 228 : 0,
          minWidth: sidebarOpen ? 228 : 0,
          overflow: "hidden",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)",
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column",
          position: "sticky", top: 60, height: "calc(100vh - 60px)",
        }}>
          {/* Profile toggle button */}
          <button
            onClick={() => switchNav(activeNav === "profile" ? "dashboard" : "profile")}
            style={{
              all: "unset", display: "block", width: "100%", boxSizing: "border-box",
              padding: "24px 20px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", transition: "background 0.15s",
              background: activeNav === "profile" ? "rgba(255,255,255,0.04)" : "transparent",
            }}
            onMouseEnter={(e) => { if (activeNav !== "profile") e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { if (activeNav !== "profile") e.currentTarget.style.background = "transparent"; }}
            aria-label="View profile"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed 0%,#e86c2f 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0,
                boxShadow: activeNav === "profile"
                  ? "0 0 0 2px rgba(124,58,237,0.55)"
                  : "0 0 0 2px rgba(124,58,237,0.2)",
                transition: "box-shadow 0.15s",
              }}>{initials}</div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e2e2",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {name}
                </div>
                <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.05em", marginTop: 2 }}>
                  {player?.skill_level ?? "Player"}{player?.region ? ` · ${player.region}` : ""}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{
                  flexShrink: 0,
                  color: activeNav === "profile" ? "#a78bfa" : "#3a3a3a",
                  transform: activeNav === "profile" ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s, color 0.2s",
                }}>
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <div key={item.id} onClick={() => switchNav(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 7, marginBottom: 2,
                    cursor: "pointer",
                    background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                    borderLeft: isActive ? "2px solid #7c3aed" : "2px solid transparent",
                    color: isActive ? "#e2e2e2" : "#555",
                    fontSize: 13, fontWeight: isActive ? 500 : 400,
                    transition: "all 0.15s", whiteSpace: "nowrap", letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "transparent"; } }}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: "center", opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── MAIN CONTENT (expands to fill) ── */}
        <main style={{ flex: 1, padding: "32px 40px", minWidth: 0, overflowY: "auto" }}>
          {secLoading ? (
            <SectionSkeleton />
          ) : activeNav === "dashboard" ? (
            <DashboardView name={name} player={player} updates={updates} tournaments={upcomingTournaments} />
          ) : activeNav === "profile" ? (
            <ProfileView player={player} session={session} />
          ) : activeNav === "tournaments" ? (
            <TournamentsView tournaments={allTournaments} />
          ) : activeNav === "clubs" ? (
            <ClubsView clubs={clubs} />
          ) : activeNav === "leaderboard" ? (
            <LeaderboardView />
          ) : activeNav === "arenas" ? (
            <ArenasView arenas={arenas} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER UTIL
───────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, color: "#444", letterSpacing: "0.16em",
      textTransform: "uppercase", fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
      marginBottom: 20,
    }}>{children}</div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD VIEW
───────────────────────────────────────────────────────────── */
function DashboardView({
  name, player, updates, tournaments,
}: {
  name: string;
  player: PlayerProfile | null;
  updates: Update[];
  tournaments: Tournament[];
}) {
  return (
    <>
      {/* Welcome banner */}
      <div style={{
        borderRadius: 14, marginBottom: 32,
        background: "#111", border: "1px solid rgba(255,255,255,0.07)",
        padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div>
          <div style={{
            fontSize: 10, color: "#555", letterSpacing: "0.18em", textTransform: "uppercase",
            marginBottom: 8, fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
          }}>Welcome back</div>
          <h1 style={{
            fontSize: 30, fontWeight: 700, color: "#fff", margin: 0,
            fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.06em",
          }}>{name}</h1>
          {player?.player_tag && (
            <div style={{
              fontSize: 12, color: "#444", marginTop: 6,
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", letterSpacing: "0.05em",
            }}>#{player.player_tag}</div>
          )}
        </div>
      </div>

      {/* Two-column layout: feed left, upcoming right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>
        {/* Feed */}
        <div>
          <SectionLabel>Recent Posts — Arenas &amp; Organisers</SectionLabel>
          {updates.length === 0 ? (
            <EmptyState icon="📭" message="No updates posted yet. Check back soon!" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {updates.map((u, i) => <FeedCard key={u._id ?? i} update={u} />)}
            </div>
          )}
        </div>

        {/* Upcoming tournaments sidebar */}
        <div>
          <SectionLabel>Upcoming Tournaments</SectionLabel>
          {tournaments.length === 0 ? (
            <EmptyState icon="🎯" message="No upcoming tournaments." small />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tournaments.slice(0, 8).map((t) => <TournamentCard key={t._id} tournament={t} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROFILE VIEW
───────────────────────────────────────────────────────────── */
function ProfileView({
  player,
  session,
}: {
  player: PlayerProfile | null;
  session: { user: { name: string; email: string } };
}) {
  const name     = player?.name ?? session.user.name;
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const infoRows: { label: string; value: string }[] = [
    { label: "Username",  value: player?.username     ?? "—" },
    { label: "Email",     value: player?.email        ?? session.user.email },
    { label: "Skill",     value: player?.skill_level  ?? "—" },
    { label: "Region",    value: player?.region       ?? "—" },
    { label: "Country",   value: player?.country      ?? "—" },
    { label: "State",     value: player?.state        ?? "—" },
    { label: "City",      value: player?.city         ?? "—" },
    { label: "Device",    value: player?.device       ?? "—" },
    { label: "Fav Game",  value: player?.fav_game     ?? "—" },
    { label: "Verified",  value: player?.is_verified  ? "Yes ✓" : "No" },
    { label: "Member Since", value: player?.created_at
        ? new Date(player.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
        : "—" },
  ];

  return (
    <div>
      {/* Header card */}
      <div style={{
        borderRadius: 14, marginBottom: 28,
        background: "#111", border: "1px solid rgba(255,255,255,0.07)",
        padding: "32px 36px",
        display: "flex", alignItems: "center", gap: 28,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -50, right: -50,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#7c3aed 0%,#e86c2f 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: "#fff",
          boxShadow: "0 0 0 3px rgba(124,58,237,0.3), 0 8px 32px rgba(124,58,237,0.15)",
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, color: "#555", letterSpacing: "0.16em", textTransform: "uppercase",
            marginBottom: 8, fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
          }}>Your Profile</div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: "#fff", margin: 0,
            fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.05em",
          }}>{name}</h1>
          {player?.player_tag && (
            <div style={{
              fontSize: 12, color: "#444", marginTop: 6,
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
            }}>#{player.player_tag}</div>
          )}
          {player?.description && (
            <div style={{
              fontSize: 13, color: "#666", marginTop: 12, lineHeight: 1.65,
              maxWidth: 560,
            }}>{player.description}</div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <SectionLabel>Account Details</SectionLabel>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 10, marginBottom: 28,
      }}>
        {infoRows.map((row) => (
          <div key={row.label} style={{
            background: "#111", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 9, padding: "14px 18px",
          }}>
            <div style={{
              fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase",
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", marginBottom: 6,
            }}>{row.label}</div>
            <div style={{
              fontSize: 13, color: "#ddd", fontWeight: 500,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* Games */}
      {player?.games && player.games.length > 0 && (
        <>
          <SectionLabel>Games Played</SectionLabel>
          <div style={{
            background: "#111", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10, padding: "20px 24px", marginBottom: 28,
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {player.games.map((g) => (
                <span key={g} style={{
                  fontSize: 13, padding: "6px 16px", borderRadius: 7,
                  background: g === player.fav_game ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${g === player.fav_game ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.08)"}`,
                  color: g === player.fav_game ? "#c4b5fd" : "#777",
                }}>
                  {g}
                  {g === player.fav_game && (
                    <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>★</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tournament history */}
      {player?.tourney_games && player.tourney_games.length > 0 && (
        <>
          <SectionLabel>Tournament History</SectionLabel>
          <div style={{
            background: "#111", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10, padding: "20px 24px",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {player.tourney_games.map((g, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: "5px 14px", borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#666",
                }}>{g}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENTS VIEW
───────────────────────────────────────────────────────────── */
function TournamentsView({ tournaments }: { tournaments: Tournament[] }) {
  const [filter, setFilter] = useState<string>("all");
  const statuses = ["all", "registration_open", "upcoming", "ongoing", "completed"];

  const filtered = filter === "all"
    ? tournaments
    : tournaments.filter((t) => t.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px",
          fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.06em",
        }}>Tournaments</h1>
        <div style={{ fontSize: 12, color: "#444" }}>{tournaments.length} total</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "5px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer",
            border: `1px solid ${filter === s ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
            background: filter === s ? "rgba(124,58,237,0.15)" : "transparent",
            color: filter === s ? "#c4b5fd" : "#555",
            letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.15s",
          }}>{s.replace("_", " ")}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🏆" message="No tournaments match this filter." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map((t) => <TournamentFullCard key={t._id} tournament={t} />)}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLUBS VIEW
───────────────────────────────────────────────────────────── */
function ClubsView({ clubs }: { clubs: Club[] }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px",
          fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.06em",
        }}>Clubs</h1>
        <div style={{ fontSize: 12, color: "#444" }}>{clubs.length} clubs found</div>
      </div>

      {clubs.length === 0 ? (
        <EmptyState icon="🛡" message="No clubs available yet." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {clubs.map((c) => (
            <div key={c._id} style={{
              background: "#111", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 11, padding: "18px 20px",
              transition: "border-color 0.15s, background 0.15s", cursor: "pointer",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLDivElement).style.background = "#151515"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>🛡</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e2e2", marginBottom: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                  {c.tag && (
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>
                      #{c.tag}
                    </div>
                  )}
                </div>
              </div>
              {c.description && (
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 10,
                  overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {c.description}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#3a3a3a",
                fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>
                {c.game   && <span>{c.game}</span>}
                {c.region && <span>· {c.region}</span>}
                {c.members_count != null && <span style={{ marginLeft: "auto" }}>{c.members_count} members</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ARENAS VIEW
───────────────────────────────────────────────────────────── */
function ArenasView({ arenas }: { arenas: Arena[] }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px",
          fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.06em",
        }}>Arenas</h1>
        <div style={{ fontSize: 12, color: "#444" }}>{arenas.length} arenas found</div>
      </div>

      {arenas.length === 0 ? (
        <EmptyState icon="🏟" message="No arenas available yet." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {arenas.map((a) => (
            <div key={a._id} style={{
              background: "#111", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 11, padding: "18px 20px",
              transition: "border-color 0.15s, background 0.15s", cursor: "pointer",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLDivElement).style.background = "#151515"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>🏟</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e2e2", marginBottom: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  {a.status && (
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", textTransform: "capitalize" }}>
                      {a.status}
                    </div>
                  )}
                </div>
              </div>
              {a.description && (
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 10,
                  overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {a.description}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#3a3a3a",
                fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>
                {a.game   && <span>{a.game}</span>}
                {a.region && <span>· {a.region}</span>}
                {a.capacity != null && <span style={{ marginLeft: "auto" }}>Cap: {a.capacity}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEADERBOARD VIEW
───────────────────────────────────────────────────────────── */
function LeaderboardView() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px",
          fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.06em",
        }}>Leaderboard</h1>
        <div style={{ fontSize: 12, color: "#444" }}>Rankings &amp; standings</div>
      </div>
      <EmptyState icon="📊" message="Leaderboard coming soon — rankings are being tallied." />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FEED CARD
───────────────────────────────────────────────────────────── */
function FeedCard({ update }: { update: Update }) {
  const tag = update.tag ?? "update";
  const bg  = TAG_COLORS[tag] ?? TAG_COLORS.update;
  const tc  = TAG_TEXT[tag]   ?? TAG_TEXT.update;

  const relTime = (() => {
    const diff = Date.now() - new Date(update.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <div style={{
      background: "#111", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "16px 18px",
      transition: "border-color 0.15s, background 0.15s", cursor: "default",
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLDivElement).style.background = "#151515"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 4, background: bg, color: tc,
          fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
        }}>{tag}</span>
        <span style={{ fontSize: 10, color: "#333", marginLeft: "auto",
          fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>{relTime}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e2e2", marginBottom: 6, lineHeight: 1.4 }}>{update.title}</div>
      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65 }}>{update.body}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENT CARD (compact — for dashboard sidebar column)
───────────────────────────────────────────────────────────── */
function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const deadline = new Date(t.registration_deadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/tournament/${t._id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 9, padding: "12px 14px",
        transition: "all 0.15s", cursor: "pointer",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLDivElement).style.background = "#161616"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#ddd", lineHeight: 1.35, flex: 1 }}>{t.title}</div>
          <StatusBadge status={t.status} />
        </div>
        <div style={{ fontSize: 11, color: "#3a3a3a", marginBottom: 8,
          fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>{t.game_id} · {t.region}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span style={{ color: "#4ade80" }}>{t.prize_pool != null ? `₹${t.prize_pool.toLocaleString()}` : "—"}</span>
          <span style={{ color: daysLeft <= 2 ? "#f87171" : "#3a3a3a",
            fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>
            {daysLeft > 0 ? `${daysLeft}d left` : "Closing soon"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENT FULL CARD (for tournaments tab grid)
───────────────────────────────────────────────────────────── */
function TournamentFullCard({ tournament: t }: { tournament: Tournament }) {
  const deadline = new Date(t.registration_deadline);
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/tournament/${t._id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 11, padding: "18px 20px",
        transition: "border-color 0.15s, background 0.15s", cursor: "pointer",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLDivElement).style.background = "#151515"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e2e2", lineHeight: 1.35, flex: 1 }}>{t.title}</div>
          <StatusBadge status={t.status} />
        </div>
        <div style={{ fontSize: 12, color: "#3a3a3a", marginBottom: 14,
          fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>{t.game_id} · {t.region} · {t.tournament_type}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Prize Pool", value: t.prize_pool != null ? `₹${t.prize_pool.toLocaleString()}` : "—", color: "#4ade80" },
            { label: "Entry Fee",  value: t.entry_fee == null ? "—" : t.entry_fee === 0 ? "Free" : `₹${t.entry_fee}`, color: "#e2e2e2" },
            { label: "Slots",      value: t.participants_limit != null ? `${t.participants_limit}` : "—", color: "#e2e2e2" },
            { label: "Deadline",   value: daysLeft > 0 ? `${daysLeft}d left` : "Closing soon",
              color: daysLeft <= 2 ? "#f87171" : "#e2e2e2" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "10px 12px",
            }}>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em",
                textTransform: "uppercase", fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState({ icon, message, small }: { icon: string; message: string; small?: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: small ? "24px 12px" : "48px 24px", color: "#333" }}>
      <div style={{ fontSize: small ? 26 : 36, marginBottom: 10, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: small ? 11 : 13, letterSpacing: "0.03em" }}>{message}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION SKELETON (tab switch loading)
───────────────────────────────────────────────────────────── */
function SectionSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          height: 90, borderRadius: 10,
          background: "linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE SKELETON (initial load)
───────────────────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#080808",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.06)",
          borderTopColor: "rgba(255,255,255,0.4)",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: "#2a2a2a", fontSize: 11, letterSpacing: "0.18em",
          fontFamily: "monospace", textTransform: "uppercase" }}>Loading</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}