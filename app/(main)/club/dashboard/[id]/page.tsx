"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */
type NavTab    = "overview" | "members" | "tournaments" | "leaderboard";
type SidePanel = "manage" | "chat" | "post-updates" | "settings";

type Member = {
  _id?: string;
  username: string;
  role?: string;
  joined_at?: string;
  rank?: number;
  wins?: number;
  losses?: number;
  avatar_initials?: string;
};

type ChatMessage = {
  _id?: string;
  sender: string;
  text: string;
  timestamp?: string;
  isMe?: boolean;
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

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
      <div className="spin-loader" />
      <p className="font-[Rajdhani,sans-serif] text-white/20 text-sm tracking-wide">Loading {label}…</p>
    </div>
  );
}

function ShortlyUpdate() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
      <div className="w-14 h-14 border border-[rgba(139,92,246,0.2)] flex items-center justify-center bg-[rgba(139,92,246,0.04)]"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" stroke="#8b5cf6" strokeWidth="1.2" />
          <path d="M12 7V12L15 14" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-[Cinzel,serif] text-base font-bold text-white/30">Will Shortly Update</p>
      <p className="font-[Rajdhani,sans-serif] text-[0.68rem] tracking-[0.25em] uppercase text-white/15">Data is being prepared</p>
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
   NAV TAB CONTENT
   ───────────────────────────────────────────────────────────── */

/* ── Overview panel */
function OverviewContent() {
  const [club, setClub]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clubs")
      .then(r => r.json())
      .then(d => setClub(d.clubs?.[0] ?? null))   // leader sees their own club first
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="overview" />;

  if (!club) return <ShortlyUpdate />;

  const memberCount = club.members?.length ?? 0;
  const gamesList   = club.supported_games?.join(", ") ?? "—";

  const stats = [
    { label: "Total Members",  value: String(memberCount),          icon: "👥", accent: "#a78bfa" },
    { label: "Games",          value: gamesList,                    icon: "⚔️", accent: "#60a5fa" },
    { label: "Club Tag",       value: `[${club.club_tag ?? "—"}]`,  icon: "🏷️", accent: "#fbbf24" },
    { label: "Status",         value: club.is_verified ? "Verified" : "Unverified", icon: "✅", accent: club.is_verified ? "#4ade80" : "rgba(255,255,255,0.25)" },
  ];

  return (
    <div className="content-in space-y-6 p-1">
      {/* Club name banner */}
      <div className="border border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.04)] px-5 py-4"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.4em] uppercase text-[#8b5cf6]/50 mb-1">Your Club</p>
        <h2 className="font-[Cinzel,serif] text-xl font-black text-white">{club.club_name}</h2>
        {club.club_description && (
          <p className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/25 mt-1">{club.club_description}</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label}
            className="border border-[rgba(139,92,246,0.14)] bg-[rgba(139,92,246,0.03)] px-5 py-4 flex items-center gap-4"
            style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
            <span className="text-2xl">{s.icon}</span>
            <div className="min-w-0">
              <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.3em] uppercase text-white/25 mb-0.5">{s.label}</p>
              <p className="font-[Cinzel,serif] text-lg font-black truncate" style={{ color: s.accent }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Members panel */
function MembersContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clubs")
      .then(r => r.json())
      .then(d => {
        const club = d.clubs?.[0];
        setMembers(club?.members ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleColor = (role?: string) => {
    switch (role) {
      case "leader":    return "#fbbf24";
      case "co-leader": return "#a78bfa";
      case "elder":     return "#60a5fa";
      default:          return "rgba(255,255,255,0.25)";
    }
  };

  if (loading) return <LoadingState label="members" />;
  if (members.length === 0) return <ShortlyUpdate />;

  return (
    <div className="content-in space-y-0">
      {members.map((m, i) => {
        const initials = m.avatar_initials ?? m.username.slice(0, 2).toUpperCase();
        const rc = roleColor(m.role);
        return (
          <div key={m._id ?? i}
            className="group relative border-b border-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.03)] transition-all duration-200 pl-5 pr-4 py-3.5 flex items-center gap-4">
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: rc }} />

            {/* Avatar */}
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border"
              style={{ borderColor: `${rc}55`, background: `${rc}11`,
                clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
              <span className="font-[Cinzel,serif] text-[0.55rem] font-black" style={{ color: rc }}>{initials}</span>
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-[Cinzel,serif] text-[0.85rem] text-white/80 font-bold group-hover:text-[#a78bfa] transition-colors">
                  {m.username}
                </h3>
                {m.role && (
                  <span className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border"
                    style={{ color: rc, borderColor: `${rc}44`, background: `${rc}11`,
                      clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                    {m.role}
                  </span>
                )}
              </div>
              {m.joined_at && (
                <p className="font-[Rajdhani,sans-serif] text-[0.58rem] text-white/18 uppercase tracking-wide">
                  Joined {m.joined_at}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-5 shrink-0">
              {m.wins !== undefined && (
                <div className="text-center">
                  <p className="font-[Rajdhani,sans-serif] text-[0.48rem] uppercase text-white/20 mb-0.5">W / L</p>
                  <p className="font-[Cinzel,serif] text-[0.75rem] font-bold text-[#a78bfa]">
                    {m.wins} <span className="text-white/20">/</span> {m.losses ?? 0}
                  </p>
                </div>
              )}
              {m.rank !== undefined && (
                <div className="text-center">
                  <p className="font-[Rajdhani,sans-serif] text-[0.48rem] uppercase text-white/20 mb-0.5">Rank</p>
                  <p className="font-[Cinzel,serif] text-[0.75rem] font-bold text-[#fbbf24]">#{m.rank}</p>
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
   SIDE PANEL — MANAGE
   ───────────────────────────────────────────────────────────── */
function ManageContent({ activeTab }: { activeTab: NavTab }) {
  switch (activeTab) {
    case "overview":     return <OverviewContent />;
    case "members":      return <MembersContent />;
    case "tournaments":  return <ComingSoon label="Manage Tournaments" />;
    case "leaderboard":  return <ComingSoon label="Leaderboard" />;
  }
}

/* ─────────────────────────────────────────────────────────────
   SIDE PANEL — CHAT  (replaces CREATE from organiser dashboard)
   ───────────────────────────────────────────────────────────── */
function ChatContent({ displayName }: { displayName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "Sniper99",   text: "GGs last match, we dominated 🔥",      timestamp: "10:14",  isMe: false },
    { sender: "xSlayer",    text: "Tournament signup closes at midnight!",  timestamp: "10:22",  isMe: false },
    { sender: displayName,  text: "Everyone prep strats for Saturday.",     timestamp: "10:35",  isMe: true  },
    { sender: "Kratos_IRL", text: "Ready. Arena 3 booked?",                timestamp: "10:41",  isMe: false },
  ]);
  const [draft, setDraft]       = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSending(true);
    const newMsg: ChatMessage = {
      sender: displayName,
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setDraft("");

    try {
      await fetch("/api/club/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
    } catch { }
    finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="content-in flex flex-col h-full min-h-[400px]" style={{ maxHeight: "calc(100vh - 200px)" }}>
      {/* Header */}
      <div className="shrink-0 mb-3">
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-0.5">Club Channel</p>
        <h2 className="font-[Cinzel,serif] text-lg font-bold text-white">Club Chat</h2>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto scroll-thin space-y-3 pr-1 mb-4">
        {messages.map((msg, i) => {
          const initials = msg.sender.slice(0, 2).toUpperCase();
          return (
            <div key={i} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              {!msg.isMe && (
                <div className="w-7 h-7 shrink-0 flex items-center justify-center border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)]"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)", alignSelf: "flex-end" }}>
                  <span className="font-[Cinzel,serif] text-[0.45rem] font-black text-[#a78bfa]">{initials}</span>
                </div>
              )}

              <div className={`flex flex-col max-w-[72%] ${msg.isMe ? "items-end" : "items-start"}`}>
                {!msg.isMe && (
                  <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-widest uppercase text-white/25 mb-0.5 ml-1">{msg.sender}</p>
                )}
                <div className={`px-3.5 py-2.5 font-[Rajdhani,sans-serif] text-[0.78rem] leading-relaxed ${
                  msg.isMe
                    ? "bg-[rgba(139,92,246,0.18)] border border-[rgba(139,92,246,0.45)] text-white/85"
                    : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-white/55"
                }`}
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                  {msg.text}
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-widest text-white/15 mt-0.5 mx-1">{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="shrink-0 flex gap-2 items-end">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Message the club…"
          className="flex-1 bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] px-4 py-2.5 font-[Rajdhani,sans-serif] text-[0.82rem] text-white placeholder-white/15 focus:outline-none focus:border-[rgba(139,92,246,0.55)] transition-all resize-none"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="shrink-0 px-5 py-2.5 font-[Rajdhani,sans-serif] font-bold text-[0.72rem] tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
            background: "linear-gradient(135deg, rgba(139,92,246,0.85), rgba(109,40,217,0.85))",
            border: "1px solid rgba(139,92,246,0.5)",
            color: "#fff",
          }}>
          Send →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDE PANEL — POST UPDATES
   ───────────────────────────────────────────────────────────── */
function PostUpdatesContent() {
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const [tag,     setTag]     = useState<PostTag>("announcement");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await fetch("/api/club/updates", {
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
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Club Broadcast</p>
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

      <div>
        <label className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/25 block mb-1.5">Message</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
          placeholder="Write your update for the club…"
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

/* ─────────────────────────────────────────────────────────────
   SIDE PANEL — SETTINGS
   ───────────────────────────────────────────────────────────── */
function SettingsContent({ session }: { session: any }) {
  const user = session?.user;
  return (
    <div className="content-in max-w-[500px] mx-auto p-2 space-y-5">
      <div>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Club Leader</p>
        <h2 className="font-[Cinzel,serif] text-lg font-bold text-white">Settings</h2>
      </div>

      {/* Account card */}
      <div className="border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.04)] px-5 py-4 space-y-3"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/25">Account</p>
        {[
          { label: "Username", val: user?.username ?? "—" },
          { label: "Role",     val: user?.role ?? "club_leader" },
          { label: "Email",    val: user?.email ?? "—" },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between border-b border-[rgba(139,92,246,0.07)] pb-2 last:border-none last:pb-0">
            <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-widest uppercase text-white/25">{label}</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] font-semibold text-white/60">{val}</span>
          </div>
        ))}
      </div>

      {/* Club settings card */}
      <div className="border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.04)] px-5 py-4 space-y-3"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.3em] uppercase text-white/25">Club</p>
        {[
          { label: "Club Name", val: user?.club_name ?? "—" },
          { label: "Club Tag",  val: user?.club_tag  ?? "—" },
          { label: "Members",   val: user?.member_count?.toString() ?? "—" },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between border-b border-[rgba(139,92,246,0.07)] pb-2 last:border-none last:pb-0">
            <span className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-widest uppercase text-white/25">{label}</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] font-semibold text-white/60">{val}</span>
          </div>
        ))}
      </div>

      <div className="border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.03)] px-5 py-4"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] text-white/20">
          Advanced club settings and member role management are coming soon.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RIGHT PANEL ROUTER
   ───────────────────────────────────────────────────────────── */
function RightPanelContent({
  activePanel, activeTab, session, displayName,
}: {
  activePanel: SidePanel;
  activeTab:   NavTab;
  session:     any;
  displayName: string;
}) {
  switch (activePanel) {
    case "manage":       return <ManageContent activeTab={activeTab} />;
    case "chat":         return <ChatContent displayName={displayName} />;
    case "post-updates": return <PostUpdatesContent />;
    case "settings":     return <SettingsContent session={session} />;
  }
}

/* ─────────────────────────────────────────────────────────────
   MAIN SHELL
   ───────────────────────────────────────────────────────────── */
export default function ClubLeaderDashboardPage() {
  const { data: session } = useSession();
  const [activeTab,   setActiveTab]   = useState<NavTab>("overview");
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
  const displayName = user?.username ?? "Leader";
  const initials    = displayName.slice(0, 2).toUpperCase();

  const NAV_TABS: { key: NavTab; label: string }[] = [
    { key: "overview",    label: "OVERVIEW"    },
    { key: "members",     label: "MEMBERS"     },
    { key: "tournaments", label: "TOURNAMENTS" },
    { key: "leaderboard", label: "LEADERBOARD" },
  ];

  /* ── KEY DIFFERENCE: CHAT replaces CREATE ── */
  const SIDE_ITEMS: { key: SidePanel; label: string }[] = [
    { key: "manage",       label: "MANAGE"       },
    { key: "chat",         label: "CHAT"         },
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

        /* ── Chat highlight for CHAT button */
        .side-btn.chat-active {
          color:#60a5fa; border-left-color:#3b82f6; background:rgba(59,130,246,0.08);
        }

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
                <Link href="/profile"  className="dropdown-item" onClick={() => setAvatarOpen(false)}>Profile</Link>
                <Link href="/settings" className="dropdown-item" onClick={() => setAvatarOpen(false)}>Settings</Link>
                <button className="dropdown-item danger"
                  onClick={() => { setAvatarOpen(false); signOut({ callbackUrl: "/" }); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-hidden p-5">
          <div className="shell-in h-full border border-[rgba(139,92,246,0.22)] flex overflow-hidden"
            style={{
              background: "rgba(5,5,16,0.5)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 60px rgba(139,92,246,0.06), inset 0 0 60px rgba(139,92,246,0.02)",
            }}>

            {/* ── LEFT PANEL ── */}
            <aside className="shrink-0 w-[185px] border-r border-[rgba(139,92,246,0.14)] flex flex-col">
              <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[rgba(139,92,246,0.4)]" />

              <div className="pt-4 pb-2">
                <p className="font-[Rajdhani,sans-serif] text-[0.48rem] tracking-[0.4em] uppercase text-white/15 px-4 mb-2">Club Tools</p>
              </div>

              <nav className="flex-1">
                {SIDE_ITEMS.map(item => (
                  <button key={item.key}
                    className={`side-btn ${
                      activePanel === item.key
                        ? item.key === "chat" ? "chat-active" : "active"
                        : ""
                    }`}
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
                      <p className="font-[Rajdhani,sans-serif] text-[0.45rem] tracking-widest uppercase text-[#8b5cf6]/45">Club Leader</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── RIGHT CONTENT PANEL ── */}
            <main className="flex-1 overflow-y-auto scroll-thin p-5">
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
                displayName={displayName}
              />
            </main>

          </div>
        </div>
      </div>
    </>
  );
}