"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type ArenaRole = "owner" | "co_owner" | "manager" | "staff";

type ArenaMember = {
  user_id: string;
  name?: string;
  email?: string;
  role: ArenaRole;
};

type Arena = {
  _id: string;
  arena_name: string;
  arena_location: string;
  arena_city?: string;
  arena_state?: string;
  arena_description?: string;
  arena_image?: string;
  organizer_id: string;
  organizer_name?: string;
  supported_games?: string[];
  capacity?: number;
  is_verified?: boolean;
  members?: ArenaMember[];
  created_at?: string;
};

type Tournament = {
  _id: string;
  title: string;
  game_id: string;
  status: string;
  start_date: string;
  registration_deadline: string;
  entry_fee?: number;
  prize_pool?: number;
  region: string;
  participants_limit?: number;
  tournament_type: string;
  arena_id?: string;
};

type Update = {
  _id: string;
  title: string;
  body: string;
  tag?: string;
  created_at: string;
};

type NavId =
  | "dashboard"
  | "tournaments"
  | "create"
  | "posts"
  | "settings"
  | "sponsors"
  | "staff";

type NavItem = {
  id: NavId;
  label: string;
  icon: string;
  roles: ArenaRole[];
};

const ALL_NAV: NavItem[] = [
  { id: "dashboard",   label: "Dashboard",          icon: "⚔",  roles: ["owner","co_owner","manager","staff"] },
  { id: "tournaments", label: "Tournaments",         icon: "🏆", roles: ["owner","co_owner","manager","staff"] },
  { id: "create",      label: "Create Tournament",   icon: "➕", roles: ["owner","co_owner","manager"] },
  { id: "posts",       label: "Posts",               icon: "📣", roles: ["owner","co_owner","manager","staff"] },
  { id: "settings",    label: "Arena Settings",      icon: "⚙",  roles: ["owner","co_owner","manager","staff"] },
  { id: "sponsors",    label: "Sponsors",            icon: "💰", roles: ["owner","co_owner"] },
  { id: "staff",       label: "Staff & Roles",       icon: "👥", roles: ["owner","co_owner"] },
];

const ROLE_LABELS: Record<ArenaRole, string> = {
  owner:    "Owner",
  co_owner: "Co-Owner",
  manager:  "Manager",
  staff:    "Staff",
};

const ROLE_COLORS: Record<ArenaRole, { color: string; bg: string }> = {
  owner:    { color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  co_owner: { color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
  manager:  { color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  staff:    { color: "#9ca3af", bg: "rgba(156,163,175,0.10)" },
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
    <span style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}28`,
      fontSize: 10, fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
      letterSpacing: "0.1em", textTransform: "uppercase" as const,
      padding: "2px 8px", borderRadius: "999px" }}>
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function ArenaHomePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: session, isPending } = useSession();

  const [arena,       setArena]       = useState<Arena | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [updates,     setUpdates]     = useState<Update[]>([]);
  const [arenaRole,   setArenaRole]   = useState<ArenaRole>("staff");
  const [loading,     setLoading]     = useState(true);
  const [activeNav,   setActiveNav]   = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Auth guard */
  useEffect(() => {
    if (!isPending && !session) router.push("/signin");
  }, [session, isPending, router]);

  /* ── Fetch arena + resolve role */
  useEffect(() => {
    if (!id || !session) return;
    (async () => {
      try {
        const [aRes, tRes, uRes] = await Promise.all([
          fetch(`/api/arenas/${id}`),
          fetch("/api/tournaments"),
          fetch("/api/updates"),
        ]);

        if (aRes.ok) {
          const d = await aRes.json();
          const arenaData: Arena = d.arena;
          setArena(arenaData);

          // Resolve the calling user's role within this arena.
          // Priority: explicit members[] entry → organizer_id match → session account role fallback
          const u = session.user as { id?: string; _id?: string; role?: string };
          const userId1 = u.id  ?? "";
          const userId2 = (u as Record<string, unknown>)._id as string | undefined ?? "";
          const accountRole = u.role ?? "";

          const member = arenaData.members?.find(
            (m) => m.user_id === userId1 || m.user_id === userId2
          );

          if (member) {
            // Explicit role assigned in arena's members list
            setArenaRole(member.role);
          } else if (
            (userId1 && arenaData.organizer_id === userId1) ||
            (userId2 && arenaData.organizer_id === userId2)
          ) {
            // User is the arena creator
            setArenaRole("owner");
          } else if (accountRole === "organiser" || accountRole === "admin") {
            // Organiser/admin accounts get owner-level access to all arenas they visit
            setArenaRole("owner");
          } else {
            // Genuinely not affiliated — redirect
            router.push("/unauthorized");
          }
        } else {
          // Arena not found or server error
          router.push("/unauthorized");
        }

        if (tRes.ok) {
          const d = await tRes.json();
          // filter tournaments that belong to this arena (if arena_id exists) or all
          const all: Tournament[] = d.tournaments ?? [];
          const filtered = all.filter((t) => !t.arena_id || t.arena_id === id);
          setTournaments(filtered);
        }

        if (uRes.ok) {
          const d = await uRes.json();
          setUpdates(d.updates ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, session, router]);

  const handleSignOut = async () => { await signOut(); router.push("/"); };

  /* ── Filter nav by role */
  const navItems = ALL_NAV.filter((n) => n.roles.includes(arenaRole));

  const canDo = useCallback((minRoles: ArenaRole[]) => minRoles.includes(arenaRole), [arenaRole]);

  if (isPending || loading) return <PageSkeleton />;
  if (!session)             return null;

  const roleStyle = ROLE_COLORS[arenaRole];

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
            <span style={{ fontFamily: "var(--font-cinzel,'Cinzel',serif)", fontSize: 16,
              fontWeight: 700, letterSpacing: "0.12em", color: "#e2e2e2" }}>RANAKSHETRA</span>
          </Link>

          {/* Arena name in header */}
          {arena && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
              <span style={{ color: "#2a2a2a" }}>·</span>
              <span style={{ fontSize: 13, color: "#555", letterSpacing: "0.04em" }}>
                {arena.arena_name}
              </span>
              {arena.is_verified && (
                <span style={{ fontSize: 10, color: "#60a5fa", letterSpacing: "0.08em" }}>✓ Verified</span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Role badge */}
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: 5,
            color: roleStyle.color, background: roleStyle.bg,
            fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
          }}>{ROLE_LABELS[arenaRole]}</span>

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
          width: sidebarOpen ? 236 : 0,
          minWidth: sidebarOpen ? 236 : 0,
          overflow: "hidden",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)",
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column",
          position: "sticky", top: 60, height: "calc(100vh - 60px)",
        }}>

          {/* Arena identity block */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Arena icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,#1a1a1a,#2a2a2a)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>🏟</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e2e2",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {arena?.arena_name ?? "Arena"}
                </div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 2, letterSpacing: "0.04em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {arena?.arena_city ?? arena?.arena_location ?? "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <div key={item.id} onClick={() => setActiveNav(item.id)}
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
                  <span style={{ fontSize: 14, width: 20, textAlign: "center", opacity: isActive ? 1 : 0.55 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          {/* Bottom: user identity */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 12, color: "#3a3a3a", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis" }}>
              {session.user.name}
            </div>
            <div style={{ fontSize: 10, color: "#2a2a2a", marginTop: 2,
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", letterSpacing: "0.04em" }}>
              {session.user.email}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: "32px 40px", minWidth: 0, overflowY: "auto" }}>
          {activeNav === "dashboard"   && <DashboardView   arena={arena} tournaments={tournaments} updates={updates} arenaRole={arenaRole} />}
          {activeNav === "tournaments" && <TournamentsView  tournaments={tournaments} arenaRole={arenaRole} canDo={canDo} />}
          {activeNav === "create"      && <CreateTournamentView arenaId={id} arena={arena} />}
          {activeNav === "posts"       && <PostsView        updates={updates} setUpdates={setUpdates} arenaRole={arenaRole} canDo={canDo} />}
          {activeNav === "settings"    && <SettingsView     arena={arena} arenaRole={arenaRole} canDo={canDo} />}
          {activeNav === "sponsors"    && <SponsorsView />}
          {activeNav === "staff"       && <StaffView        arena={arena} />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION HEADING
───────────────────────────────────────────────────────────── */
function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 6px",
        fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.06em",
      }}>{title}</h1>
      {subtitle && <div style={{ fontSize: 12, color: "#444" }}>{subtitle}</div>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, color: "#444", letterSpacing: "0.16em",
      textTransform: "uppercase" as const, fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
      marginBottom: 16,
    }}>{children}</div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "#333" }}>
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: 13, letterSpacing: "0.03em" }}>{message}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "#111", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "18px 22px",
    }}>
      <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.14em",
        textTransform: "uppercase" as const, fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
        marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff",
        fontFamily: "var(--font-cinzel,'Cinzel',serif)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD VIEW
───────────────────────────────────────────────────────────── */
function DashboardView({
  arena, tournaments, updates, arenaRole,
}: {
  arena: Arena | null;
  tournaments: Tournament[];
  updates: Update[];
  arenaRole: ArenaRole;
}) {
  const upcoming  = tournaments.filter((t) => ["upcoming","registration_open"].includes(t.status));
  const ongoing   = tournaments.filter((t) => t.status === "ongoing");
  const completed = tournaments.filter((t) => t.status === "completed");
  const roleStyle = ROLE_COLORS[arenaRole];

  return (
    <>
      {/* Hero banner */}
      <div style={{
        borderRadius: 14, marginBottom: 28,
        background: "#111", border: "1px solid rgba(255,255,255,0.07)",
        padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.16em",
            textTransform: "uppercase" as const, marginBottom: 8,
            fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>Arena Command Centre</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0,
            fontFamily: "var(--font-cinzel,'Cinzel',serif)", letterSpacing: "0.05em" }}>
            {arena?.arena_name ?? "Arena"}
          </h1>
          <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
            {[arena?.arena_city, arena?.arena_state].filter(Boolean).join(", ") || arena?.arena_location}
          </div>
          {arena?.supported_games && arena.supported_games.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {arena.supported_games.map((g) => (
                <span key={g} style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 4,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#666", letterSpacing: "0.06em",
                }}>{g}</span>
              ))}
            </div>
          )}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          padding: "6px 14px", borderRadius: 6,
          color: roleStyle.color, background: roleStyle.bg,
          fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
          flexShrink: 0,
        }}>{ROLE_LABELS[arenaRole]}</span>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Tournaments" value={tournaments.length} />
        <StatCard label="Upcoming"  value={upcoming.length}  sub="open for registration or scheduled" />
        <StatCard label="Live Now"  value={ongoing.length}   sub="currently running" />
        <StatCard label="Completed" value={completed.length} sub="all time" />
      </div>

      {/* Two-col: recent tournaments + recent posts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

        {/* Recent tournaments */}
        <div>
          <SectionLabel>Recent Tournaments</SectionLabel>
          {tournaments.length === 0 ? (
            <EmptyState icon="🏆" message="No tournaments yet. Create one to get started." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tournaments.slice(0, 5).map((t) => (
                <div key={t._id} style={{
                  background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 9, padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e2e2",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "#3a3a3a", marginTop: 3,
                      fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>
                      {t.game_id} · {t.region}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent posts */}
        <div>
          <SectionLabel>Recent Posts</SectionLabel>
          {updates.length === 0 ? (
            <EmptyState icon="📣" message="No posts yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {updates.slice(0, 5).map((u) => {
                const diff = Date.now() - new Date(u.created_at).getTime();
                const hrs  = Math.floor(diff / 3600000);
                const time = hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
                return (
                  <div key={u._id} style={{
                    background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 9, padding: "12px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e2e2",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {u.title}
                      </div>
                      <span style={{ fontSize: 10, color: "#333", marginLeft: 10, flexShrink: 0,
                        fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>{time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                      {u.body}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENTS VIEW
───────────────────────────────────────────────────────────── */
function TournamentsView({
  tournaments, arenaRole, canDo,
}: {
  tournaments: Tournament[];
  arenaRole: ArenaRole;
  canDo: (roles: ArenaRole[]) => boolean;
}) {
  const [filter, setFilter] = useState("all");
  const statuses = ["all","draft","upcoming","registration_open","ongoing","completed","cancelled"];
  const filtered = filter === "all" ? tournaments : tournaments.filter((t) => t.status === filter);

  return (
    <>
      <SectionHead title="Tournaments" subtitle={`${tournaments.length} total tournaments managed by this arena`} />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "5px 14px", borderRadius: 6, fontSize: 11, cursor: "pointer",
            border: `1px solid ${filter === s ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.07)"}`,
            background: filter === s ? "rgba(124,58,237,0.14)" : "transparent",
            color: filter === s ? "#c4b5fd" : "#555",
            letterSpacing: "0.08em", textTransform: "capitalize" as const, transition: "all 0.15s",
          }}>{s.replace("_"," ")}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🏆" message="No tournaments match this filter." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((t) => {
            const deadline = new Date(t.registration_deadline);
            const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
            return (
              <div key={t._id} style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 11, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e2e2" }}>{t.title}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#3a3a3a",
                    fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", flexWrap: "wrap" }}>
                    <span>{t.game_id}</span>
                    <span>{t.region}</span>
                    <span>{t.tournament_type}</span>
                    {t.prize_pool != null && <span style={{ color: "#4ade80" }}>₹{t.prize_pool.toLocaleString()}</span>}
                    {daysLeft > 0 && <span style={{ color: daysLeft <= 2 ? "#f87171" : "#3a3a3a" }}>{daysLeft}d left</span>}
                  </div>
                </div>

                {/* Actions — based on role */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Link href={`/tournament/${t._id}`}
                    style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11,
                      border: "1px solid rgba(255,255,255,0.08)", color: "#666",
                      textDecoration: "none", letterSpacing: "0.08em", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >View</Link>

                  {canDo(["owner","co_owner","manager","staff"]) && (
                    <button style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11,
                      border: "1px solid rgba(255,255,255,0.08)", color: "#666",
                      background: "transparent", cursor: "pointer", letterSpacing: "0.08em",
                      transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    >Bracket</button>
                  )}

                  {canDo(["owner","co_owner","manager"]) && (
                    <button style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11,
                      border: "1px solid rgba(255,255,255,0.08)", color: "#666",
                      background: "transparent", cursor: "pointer", letterSpacing: "0.08em",
                      transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    >Edit</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   CREATE TOURNAMENT VIEW
───────────────────────────────────────────────────────────── */
function CreateTournamentView({ arenaId, arena }: { arenaId: string; arena: Arena | null }) {
  const [form, setForm] = useState({
    title: "", game_id: "", tournament_type: "solo", region: "",
    prize_pool: "", entry_fee: "0", participants_limit: "16",
    start_date: "", registration_deadline: "", description: "",
    visibility: "public",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prize_pool:         Number(form.prize_pool) || 0,
          entry_fee:          Number(form.entry_fee) || 0,
          participants_limit: Number(form.participants_limit) || 16,
          arena_id:           arenaId,
          organizer_id:       arena?.organizer_id ?? arenaId,
          status:             "draft",
          single_player:      true,
          team_based:         false,
          brackets_generated: false,
          results_declared:   false,
          progress:           0,
          format_rules:       "",
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ title:"", game_id:"", tournament_type:"solo", region:"",
          prize_pool:"", entry_fee:"0", participants_limit:"16",
          start_date:"", registration_deadline:"", description:"", visibility:"public" });
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to create tournament");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#e2e2e2",
    outline: "none", boxSizing: "border-box",
    fontFamily: "var(--font-outfit,'Outfit',sans-serif)",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", display: "block", marginBottom: 6,
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <SectionHead title="Create Tournament" subtitle={`New tournament under ${arena?.arena_name ?? "this arena"}`} />

      {success && (
        <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#34d399" }}>
          ✓ Tournament created successfully as Draft. Go to Manage Tournaments to publish it.
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#f87171" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Field label="Tournament Title">
            <input required value={form.title} onChange={set("title")} placeholder="e.g. Arena Cup Season 1"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>
          <Field label="Game">
            <input required value={form.game_id} onChange={set("game_id")} placeholder="e.g. CLASH ROYALE"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>

          <Field label="Tournament Type">
            <select value={form.tournament_type} onChange={set("tournament_type")}
              style={{ ...inputStyle, appearance: "none" }}>
              {["solo","duo","squad","team","single_elimination","double_elimination","round_robin","swiss_system"].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g," ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Region">
            <input required value={form.region} onChange={set("region")} placeholder="e.g. South Asia"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>

          <Field label="Prize Pool (₹)">
            <input type="number" min="0" value={form.prize_pool} onChange={set("prize_pool")} placeholder="0"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>
          <Field label="Entry Fee (₹)">
            <input type="number" min="0" value={form.entry_fee} onChange={set("entry_fee")} placeholder="0"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>

          <Field label="Max Participants">
            <input type="number" min="2" value={form.participants_limit} onChange={set("participants_limit")}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>
          <Field label="Visibility">
            <select value={form.visibility} onChange={set("visibility")}
              style={{ ...inputStyle, appearance: "none" }}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </Field>

          <Field label="Start Date">
            <input type="datetime-local" value={form.start_date} onChange={set("start_date")}
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>
          <Field label="Registration Deadline">
            <input type="datetime-local" value={form.registration_deadline} onChange={set("registration_deadline")}
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
          </Field>
        </div>

        <Field label="Description">
          <textarea value={form.description} onChange={set("description")}
            placeholder="Tournament rules, format, prizes, special conditions…"
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </Field>

        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={submitting} style={{
            padding: "11px 28px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: submitting ? "rgba(255,255,255,0.06)" : "#fff",
            color: submitting ? "#555" : "#0a0a0a",
            border: "none", cursor: submitting ? "not-allowed" : "pointer",
            letterSpacing: "0.08em", textTransform: "uppercase",
            transition: "background 0.2s, transform 0.15s",
          }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >{submitting ? "Creating…" : "Create as Draft →"}</button>
        </div>
      </form>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   POSTS VIEW
───────────────────────────────────────────────────────────── */
function PostsView({
  updates, setUpdates, arenaRole, canDo,
}: {
  updates: Update[];
  setUpdates: React.Dispatch<React.SetStateAction<Update[]>>;
  arenaRole: ArenaRole;
  canDo: (roles: ArenaRole[]) => boolean;
}) {
  const [form, setForm]   = useState({ title: "", body: "", tag: "announcement" });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePost = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPosting(true); setError("");
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const d = await res.json();
        setUpdates((prev) => [d.update, ...prev]);
        setForm({ title: "", body: "", tag: "announcement" });
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to post");
      }
    } catch {
      setError("Network error");
    } finally {
      setPosting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#e2e2e2",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "var(--font-outfit,'Outfit',sans-serif)",
  };

  const TAG_OPTS = ["announcement","tournament","arena","update"];

  return (
    <>
      <SectionHead title="Posts" subtitle="Announcements and updates visible to all players" />

      {/* Compose — only non-staff can post? Actually staff can post per requirements */}
      {canDo(["owner","co_owner","manager","staff"]) && (
        <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
          <SectionLabel>New Post</SectionLabel>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 7, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}
          <form onSubmit={handlePost}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }}>
              <input required value={form.title} onChange={set("title")} placeholder="Post title…"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
              <select value={form.tag} onChange={set("tag")}
                style={{ ...inputStyle, width: "auto", minWidth: 130, appearance: "none" }}>
                {TAG_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <textarea required value={form.body} onChange={set("body")} rows={3}
              placeholder="Write your announcement…"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, marginBottom: 12 }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
            <button type="submit" disabled={posting} style={{
              padding: "8px 22px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              background: "#fff", color: "#0a0a0a", border: "none", cursor: "pointer",
              letterSpacing: "0.08em", transition: "background 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e2e2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >{posting ? "Posting…" : "Publish Post"}</button>
          </form>
        </div>
      )}

      {/* Post list */}
      {updates.length === 0 ? (
        <EmptyState icon="📣" message="No posts yet. Publish the first one above." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {updates.map((u) => {
            const diff = Date.now() - new Date(u.created_at).getTime();
            const hrs  = Math.floor(diff / 3600000);
            const time = hrs < 1 ? "Just now" : hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs/24)}d ago`;
            const TAG_COLOR: Record<string, string> = {
              announcement: "#60a5fa", tournament: "#fb923c",
              arena: "#34d399", update: "#a78bfa",
            };
            const tc = TAG_COLOR[u.tag ?? "update"] ?? "#a78bfa";
            return (
              <div key={u._id} style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "16px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const,
                    padding: "2px 8px", borderRadius: 4, color: tc,
                    background: `${tc}18`, fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                  }}>{u.tag ?? "update"}</span>
                  <span style={{ fontSize: 10, color: "#333", marginLeft: "auto",
                    fontFamily: "var(--font-dm-mono,'DM Mono',monospace)" }}>{time}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e2e2", marginBottom: 6 }}>{u.title}</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65 }}>{u.body}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ARENA SETTINGS VIEW
───────────────────────────────────────────────────────────── */
function SettingsView({
  arena, arenaRole, canDo,
}: {
  arena: Arena | null;
  arenaRole: ArenaRole;
  canDo: (roles: ArenaRole[]) => boolean;
}) {
  const [saved,  setSaved]  = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#e2e2e2",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "var(--font-outfit,'Outfit',sans-serif)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase",
    fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", display: "block", marginBottom: 6,
  };

  const isEditable = canDo(["owner","co_owner","manager","staff"]);

  return (
    <>
      <SectionHead title="Arena Settings" subtitle="Manage your arena's information" />

      {!isEditable && (
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#fbbf24" }}>
          ⚠ You have read-only access to settings.
        </div>
      )}

      {saved && (
        <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#34d399" }}>
          ✓ Settings saved.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 720 }}>
        <div>
          <label style={labelStyle}>Arena Name</label>
          <input defaultValue={arena?.arena_name} disabled={!isEditable} style={inputStyle}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input defaultValue={arena?.arena_location} disabled={!isEditable} style={inputStyle}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
        <div>
          <label style={labelStyle}>City</label>
          <input defaultValue={arena?.arena_city} disabled={!isEditable} style={inputStyle}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
        <div>
          <label style={labelStyle}>State</label>
          <input defaultValue={arena?.arena_state} disabled={!isEditable} style={inputStyle}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
        <div>
          <label style={labelStyle}>Capacity</label>
          <input type="number" defaultValue={arena?.capacity} disabled={!isEditable} style={inputStyle}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
        <div>
          <label style={labelStyle}>Supported Games</label>
          <input defaultValue={arena?.supported_games?.join(", ")}
            disabled={!isEditable} placeholder="CLASH ROYALE, ..."
            style={inputStyle}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Description</label>
          <textarea defaultValue={arena?.arena_description} disabled={!isEditable} rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={(e) => { if (isEditable) e.target.style.borderColor = "rgba(124,58,237,0.45)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
        </div>
      </div>

      {isEditable && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
            style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "#fff", color: "#0a0a0a", border: "none", cursor: "pointer",
              letterSpacing: "0.08em", textTransform: "uppercase" as const,
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e2e2"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Save Changes</button>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPONSORS VIEW
───────────────────────────────────────────────────────────── */
function SponsorsView() {
  return (
    <>
      <SectionHead title="Sponsors" subtitle="Manage arena sponsors and partners" />
      <EmptyState icon="💰" message="No sponsors added yet. Sponsor management coming soon." />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAFF & ROLES VIEW
───────────────────────────────────────────────────────────── */
function StaffView({ arena }: { arena: Arena | null }) {
  const members = arena?.members ?? [];

  return (
    <>
      <SectionHead title="Staff & Roles"
        subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} on this arena`} />

      {members.length === 0 ? (
        <EmptyState icon="👥" message="No staff members assigned yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 640 }}>
          {members.map((m) => {
            const rc = ROLE_COLORS[m.role];
            return (
              <div key={m.user_id} style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#555",
                }}>👤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e2e2" }}>
                    {m.name ?? "Unknown"}
                  </div>
                  {m.email && (
                    <div style={{ fontSize: 11, color: "#444",
                      fontFamily: "var(--font-dm-mono,'DM Mono',monospace)", marginTop: 2 }}>
                      {m.email}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  padding: "4px 10px", borderRadius: 5,
                  color: rc.color, background: rc.bg,
                  fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                }}>{ROLE_LABELS[m.role]}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE SKELETON
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
          fontFamily: "monospace", textTransform: "uppercase" as const }}>Loading Arena</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
