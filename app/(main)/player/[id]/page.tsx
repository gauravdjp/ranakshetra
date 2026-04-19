"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Games, Access_Level_USER_Role } from "../../../../types/index";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type PlayerProfile = {
  _id: string;
  name: string;
  username: string;
  player_tag?: string;
  role: Access_Level_USER_Role;
  email: string;
  city: string;
  state: string;
  country: string;
  region?: string;
  device?: string;
  skill_level?: string;
  description?: string;
  games?: Games[];
  fav_game?: Games;
  is_verified?: boolean;
  created_at?: string;
};

type CRData = {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  threeCrownWins: number;
  challengeMaxWins?: number;
  warDayWins?: number;
  donations: number;
  donationsReceived: number;
  arena?: { name: string };
  clan?: { name: string; tag: string; badgeId: number };
  role?: string;
  leagueStatistics?: {
    currentSeason?: { trophies?: number; bestTrophies?: number };
    previousSeason?: { trophies?: number; bestTrophies?: number };
  };
  currentFavouriteCard?: { name: string };
};

type PlayerEditForm = {
  name: string;
  player_tag: string;
  description: string;
  region: string;
  device: string;
  skill_level: string;
};

type InGameForm = {
  player_tag: string;
  skill_level: string;
  device: string;
};

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const REGIONS = ["North India", "South India", "East India", "West India", "Central India", "Global"];
const SKILL_LEVELS = ["Beginner", "Amateur", "Intermediate", "Semi-Pro", "Pro"];
const DEVICES = ["Mobile", "PC", "Console", "Mobile + PC"];

/* ─────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
function StatBox({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="relative p-4 border border-[rgba(139,92,246,0.15)] bg-white/[0.02]"
      style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
      <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase mb-1"
        style={{ color: accent ? "#8b5cf6" : "rgba(255,255,255,0.3)" }}>
        {label}
      </p>
      <p className="font-[Cinzel,serif] font-bold text-xl"
        style={{ color: accent ? "#a78bfa" : "white" }}>
        {value}
      </p>
    </div>
  );
}

function RkInput({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">{label}</label>
      <input {...props}
        className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-2.5 placeholder:text-white/20 transition-all duration-300"
        style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
      />
      {error && <p className="warn mt-1">{error}</p>}
    </div>
  );
}

function RkSelect({ label, options, error, ...props }: { label: string; options: string[]; error?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="mb-4">
      <label className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">{label}</label>
      <select {...props}
        className="rk-input w-full bg-[#0a0a1a] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-2.5 appearance-none cursor-pointer transition-all duration-300"
        style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
        {options.map(o => <option key={o} value={o} className="bg-[#0a0a1a]">{o}</option>)}
      </select>
      {error && <p className="warn mt-1">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="text-center">
        <div className="spin-loader mx-auto mb-4" />
        <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.3em] uppercase text-white/20">Loading Profile</p>
      </div>
    </div>
  );
}

function InfoRow({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">{label}</span>
      <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/55">{val}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDIT PROFILE MODAL
───────────────────────────────────────────────────────────── */
function EditModal({ player, onClose, onSave }: {
  player: PlayerProfile;
  onClose: () => void;
  onSave: (data: PlayerEditForm) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<PlayerEditForm>({
    defaultValues: {
      name:        player.name        ?? "",
      player_tag:  player.player_tag  ?? "",
      description: player.description ?? "",
      region:      player.region      ?? REGIONS[0],
      device:      player.device      ?? DEVICES[0],
      skill_level: player.skill_level ?? SKILL_LEVELS[0],
    },
  });

  const onSubmit: SubmitHandler<PlayerEditForm> = (data) => onSave(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,5,16,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-[480px] bg-[#080818] border border-[rgba(139,92,246,0.3)] p-8 modal-in"
        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}>
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[rgba(139,92,246,0.5)]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[rgba(139,92,246,0.5)]" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">Edit Profile</p>
            <h3 className="font-[Cinzel,serif] text-lg font-bold text-white">Update Your Info</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none mt-1">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[55vh] overflow-y-auto pr-1 scroll-form">
            <RkInput label="Full Name" placeholder="Your name"
              error={errors.name?.message}
              {...register("name", { required: "NAME IS REQUIRED" })}
            />
            <RkInput label="Player Tag / IGN" placeholder="e.g. #ABC123"
              error={errors.player_tag?.message}
              {...register("player_tag")}
            />
            <div className="mb-4">
              <label className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">Bio</label>
              <textarea rows={3} placeholder="Tell the arena who you are..."
                {...register("description")}
                className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] px-4 py-2.5 placeholder:text-white/20 resize-none transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              />
            </div>
            <RkSelect label="Region" options={REGIONS} {...register("region")} />
            <RkSelect label="Primary Device" options={DEVICES} {...register("device")} />
            <RkSelect label="Skill Level" options={SKILL_LEVELS} {...register("skill_level")} />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose}
              className="rk-btn-ghost flex-1 py-2.5 font-[Rajdhani,sans-serif] font-semibold text-[0.8rem] tracking-[0.2em] uppercase text-white/35 border border-[rgba(139,92,246,0.2)]">
              Cancel
            </button>
            <button type="submit"
              className="rk-btn-primary flex-1 py-2.5 font-[Rajdhani,sans-serif] font-bold text-[0.8rem] tracking-[0.2em] uppercase text-white">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   UPDATE GAME DETAILS MODAL (In-Game / Clash Royale tag)
───────────────────────────────────────────────────────────── */
function InGameModal({ player, playerId, onClose, onSaved }: {
  player: PlayerProfile;
  playerId: string;
  onClose: () => void;
  onSaved: (updated: Partial<PlayerProfile>) => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InGameForm>({
    defaultValues: {
      player_tag:  player.player_tag  ?? "",
      skill_level: player.skill_level ?? SKILL_LEVELS[0],
      device:      player.device      ?? DEVICES[0],
    },
  });

  const [saveError, setSaveError] = useState("");

  const onSubmit: SubmitHandler<InGameForm> = async (data) => {
    setSaveError("");
    try {
      const res = await fetch(`/api/players/${playerId}/in-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json();
        setSaveError(j.error ?? "Failed to save");
        return;
      }
      onSaved(data);
      onClose();
    } catch {
      setSaveError("Network error, please try again");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,5,16,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-[440px] bg-[#08081a] border border-[rgba(139,92,246,0.35)] p-8 modal-in"
        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.18)" }}>
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[rgba(139,92,246,0.6)]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[rgba(139,92,246,0.6)]" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-1">In-Game</p>
            <h3 className="font-[Cinzel,serif] text-lg font-bold text-white">Update Game Details</h3>
            <p className="font-[Rajdhani,sans-serif] text-[0.68rem] text-white/30 mt-1">
              Enter your Clash Royale tag to auto-fetch live stats
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none mt-1">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <RkInput
            label="Clash Royale Tag (e.g. #ABC123)"
            placeholder="#ABC123"
            error={errors.player_tag?.message}
            {...register("player_tag")}
          />
          <RkSelect label="Skill Level" options={SKILL_LEVELS} {...register("skill_level")} />
          <RkSelect label="Primary Device" options={DEVICES} {...register("device")} />

          {saveError && (
            <p className="warn mb-4">{saveError}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose}
              className="rk-btn-ghost flex-1 py-2.5 font-[Rajdhani,sans-serif] font-semibold text-[0.8rem] tracking-[0.2em] uppercase text-white/35 border border-[rgba(139,92,246,0.2)]">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="rk-btn-primary flex-1 py-2.5 font-[Rajdhani,sans-serif] font-bold text-[0.8rem] tracking-[0.2em] uppercase text-white disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLASH ROYALE STATS PANEL
───────────────────────────────────────────────────────────── */
function CRStatsPanel({ tag }: { tag: string }) {
  const [crData, setCrData] = useState<CRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tag) { setLoading(false); return; }
    async function fetchCR() {
      try {
        const res = await fetch(`/api/clashroyale/player?tag=${encodeURIComponent(tag)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.reason) throw new Error(data.message ?? "Not found");
        setCrData(data);
      } catch (e: any) {
        setError(e.message ?? "Could not load Clash Royale data");
      } finally {
        setLoading(false);
      }
    }
    fetchCR();
  }, [tag]);

  if (loading) return (
    <div className="rk-card p-6 flex items-center gap-3">
      <div className="spin-loader" />
      <p className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-widest uppercase text-white/25">
        Fetching Clash Royale data...
      </p>
    </div>
  );

  if (error) return (
    <div className="rk-card p-6">
      <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">Clash Royale</p>
      <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-[#f87171]">{error}</p>
    </div>
  );

  if (!crData) return null;

  const winRate = crData.wins + crData.losses > 0
    ? Math.round((crData.wins / (crData.wins + crData.losses)) * 100)
    : 0;

  return (
    <div className="rk-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6] mb-0.5">Clash Royale</p>
          <h4 className="font-[Cinzel,serif] font-bold text-white text-base">{crData.name}</h4>
          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/30 mt-0.5">{crData.tag}</p>
        </div>
        <div className="text-right">
          {crData.arena && (
            <p className="font-[Rajdhani,sans-serif] text-[0.68rem] text-[#a78bfa] font-semibold">{crData.arena.name}</p>
          )}
          <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-widest uppercase text-white/20 mt-0.5">
            Lvl {crData.expLevel}
          </p>
        </div>
      </div>

      {/* Trophy row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 border border-[rgba(251,191,36,0.15)] bg-[rgba(251,191,36,0.04)]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.28em] uppercase text-[rgba(251,191,36,0.5)] mb-0.5">🏆 Trophies</p>
          <p className="font-[Cinzel,serif] font-bold text-lg text-[#fbbf24]">{crData.trophies.toLocaleString()}</p>
        </div>
        <div className="p-3 border border-[rgba(251,191,36,0.08)] bg-[rgba(251,191,36,0.02)]"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
          <p className="font-[Rajdhani,sans-serif] text-[0.52rem] tracking-[0.28em] uppercase text-white/20 mb-0.5">Best</p>
          <p className="font-[Cinzel,serif] font-bold text-lg text-white/60">{crData.bestTrophies.toLocaleString()}</p>
        </div>
      </div>

      {/* W/L/Win rate */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Wins", val: crData.wins.toLocaleString(), color: "#22c55e" },
          { label: "Losses", val: crData.losses.toLocaleString(), color: "#f87171" },
          { label: "Win Rate", val: `${winRate}%`, color: "#a78bfa" },
        ].map(({ label, val, color }) => (
          <div key={label} className="text-center p-3 border border-[rgba(139,92,246,0.08)] bg-white/[0.015]"
            style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
            <p className="font-[Cinzel,serif] font-bold text-base" style={{ color }}>{val}</p>
            <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.22em] uppercase text-white/22 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Win rate bar */}
      <div className="win-bar mb-4">
        <div className="win-bar-fill" style={{ ["--target" as string]: `${winRate}%` }} />
      </div>

      {/* Extras */}
      <div className="space-y-2 pt-4 border-t border-[rgba(139,92,246,0.08)]">
        {crData.threeCrownWins > 0 && (
          <div className="flex justify-between">
            <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">3-Crown Wins</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-[#fbbf24]">{crData.threeCrownWins.toLocaleString()}</span>
          </div>
        )}
        {crData.challengeMaxWins !== undefined && crData.challengeMaxWins > 0 && (
          <div className="flex justify-between">
            <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">Challenge Max Wins</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-[#a78bfa]">{crData.challengeMaxWins}</span>
          </div>
        )}
        {crData.clan && (
          <div className="flex justify-between">
            <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">Clan</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/55">
              {crData.clan.name} <span className="text-white/25">{crData.clan.tag}</span>
            </span>
          </div>
        )}
        {crData.currentFavouriteCard && (
          <div className="flex justify-between">
            <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">Fav Card</span>
            <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/55">{crData.currentFavouriteCard.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">Donations</span>
          <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/55">
            {crData.donations.toLocaleString()} sent · {crData.donationsReceived.toLocaleString()} received
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────────────────────────── */
type ActiveTab = "overview" | "games";

export default function PlayerProfilePage() {
  const params = useParams();
  const rawId = params?.id as string;
  const { data: session, status: sessionStatus } = useSession();

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [inGameOpen, setInGameOpen] = useState(false);

  // Resolve the actual fetch ID:
  // - If the URL param looks like a real username (non-numeric), use it directly.
  // - Otherwise (e.g. the route renders as "/player/1" from a stale link),
  //   fall back to the session username so the logged-in user always sees their own profile.
  const isNumericId = /^\d+$/.test(rawId ?? "");
  const resolvedId = isNumericId && session?.user?.username
    ? session.user.username
    : rawId;

  const isOwner = session?.user?.username === player?.username;

  /* ── Fetch player – wait until session is settled so we have the fallback username */
  useEffect(() => {
    if (sessionStatus === "loading") return; // wait for session before deciding
    if (!resolvedId) return;

    setLoading(true);
    setNotFound(false);

    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/players/${resolvedId}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPlayer(data.player);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [resolvedId, sessionStatus]);

  const handleProfileSave = async (data: PlayerEditForm) => {
    if (!player) return;
    try {
      const res = await fetch(`/api/players/${resolvedId}/in-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_tag:  data.player_tag,
          skill_level: data.skill_level,
          device:      data.device,
          description: data.description,
          region:      data.region,
        }),
      });
      if (res.ok) {
        setPlayer(prev => prev ? { ...prev, ...data } : prev);
      }
    } catch { /* silently fail */ }
    setEditOpen(false);
  };

  const handleInGameSaved = (updated: Partial<PlayerProfile>) => {
    setPlayer(prev => prev ? { ...prev, ...updated } : prev);
  };

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "games",    label: "In-Game Stats" },
  ];

  const joinedDate = player?.created_at
    ? new Date(player.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  /* ── States */
  if (sessionStatus === "loading" || loading) return <Spinner />;

  if (notFound) return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="text-center">
        <p className="font-[Cinzel,serif] text-2xl font-black text-white/20 mb-2">PLAYER NOT FOUND</p>
        <Link href="/player" className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.25em] uppercase text-[#8b5cf6] no-underline hover:text-[#a78bfa] transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );

  if (!player) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.025; }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: var(--target); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(139,92,246,0); }
        }
        @keyframes spinPulse {
          0%   { transform: rotate(0deg);   opacity: 0.4; }
          50%  { opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.4; }
        }

        .fade-up   { animation: fadeUp 0.5s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.5s ease 0.1s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.5s ease 0.2s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.5s ease 0.3s forwards; opacity: 0; }
        .modal-in  { animation: modalIn 0.3s ease forwards; }
        .anim-grid { animation: gridFade 2s ease forwards; }

        .spin-loader {
          width: 28px; height: 28px;
          border: 2px solid rgba(139,92,246,0.15);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spinPulse 1s linear infinite;
        }

        .rk-input:focus {
          outline: none;
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 20px rgba(139,92,246,0.12), inset 0 0 10px rgba(139,92,246,0.03);
        }
        .rk-btn-primary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          transition: all 0.3s ease;
        }
        .rk-btn-primary:hover {
          box-shadow: 0 0 24px rgba(139,92,246,0.5);
          transform: translateY(-1px);
        }
        .rk-btn-ghost {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: all 0.3s ease;
        }
        .rk-btn-ghost:hover {
          background: rgba(139,92,246,0.07);
          border-color: rgba(139,92,246,0.4) !important;
        }
        .tab-btn {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 8px 20px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
        }
        .tab-btn:hover { color: rgba(255,255,255,0.6); }
        .tab-btn.active {
          color: #a78bfa;
          border-bottom-color: #8b5cf6;
        }
        .rk-card {
          position: relative;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(139,92,246,0.15);
        }
        .rk-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 20px; height: 20px;
          border-top: 1.5px solid rgba(139,92,246,0.4);
          border-left: 1.5px solid rgba(139,92,246,0.4);
        }
        .rk-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 20px; height: 20px;
          border-bottom: 1.5px solid rgba(139,92,246,0.4);
          border-right: 1.5px solid rgba(139,92,246,0.4);
        }
        .win-bar {
          height: 4px;
          background: rgba(139,92,246,0.15);
          position: relative;
          overflow: hidden;
        }
        .win-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          animation: barFill 1s ease 0.4s forwards;
          width: 0%;
        }
        .avatar-ring { animation: pulse-ring 3s ease-in-out infinite; }
        .scroll-form { max-height: 60vh; overflow-y: auto; padding-right: 4px; }
        .scroll-form::-webkit-scrollbar { width: 3px; }
        .scroll-form::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }
        .warn {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.7rem;
          color: #f87171;
          letter-spacing: 0.05em;
        }
        .verified-dot {
          width: 14px; height: 14px;
          background: rgba(139,92,246,0.2);
          border: 1px solid rgba(139,92,246,0.6);
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .game-chip {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 5px 12px;
          border: 1px solid rgba(139,92,246,0.25);
          background: rgba(139,92,246,0.06);
          color: rgba(255,255,255,0.5);
          clip-path: polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
        }
        .in-game-btn {
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1));
          border: 1px solid rgba(139,92,246,0.45);
          transition: all 0.3s ease;
        }
        .in-game-btn:hover {
          background: linear-gradient(135deg, rgba(139,92,246,0.35), rgba(139,92,246,0.2));
          border-color: rgba(139,92,246,0.8);
          box-shadow: 0 0 20px rgba(139,92,246,0.25);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="min-h-screen bg-[#050510] text-white relative overflow-x-hidden">

        {/* Background grid */}
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
        />

        {/* ── NAV ── */}
        <nav className="relative z-10 border-b border-[rgba(139,92,246,0.1)] px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-[Cinzel,serif] font-black text-white tracking-[0.08em] text-lg no-underline"
            style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            RANAKSHETRA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/player"
              className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors no-underline">
              ← Dashboard
            </Link>
            <div className="w-8 h-8 border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] flex items-center justify-center"
              style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
              <span className="font-[Cinzel,serif] text-[0.65rem] text-[#a78bfa] font-bold">
                {player.username.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-[1080px] mx-auto px-4 py-8">

          {/* ══════════════════════════════════════
              PROFILE HEADER
          ══════════════════════════════════════ */}
          <div className="fade-up rk-card p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="avatar-ring w-20 h-20 border-2 border-[rgba(139,92,246,0.6)] bg-[rgba(139,92,246,0.1)] flex items-center justify-center"
                  style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}>
                  <span className="font-[Cinzel,serif] text-3xl font-black text-[#a78bfa]">
                    {player.name?.split(" ").map(n => n[0]).join("") ?? player.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                {player.is_verified && (
                  <div className="verified-dot absolute -bottom-1 -right-1">
                    <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2">
                      <path d="M2 5L4 7L8 3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name & Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  <h1 className="font-[Cinzel,serif] text-2xl font-black text-white">{player.name ?? player.username}</h1>
                  {player.is_verified && (
                    <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase px-2 py-0.5 border border-[rgba(139,92,246,0.4)] text-[#8b5cf6] bg-[rgba(139,92,246,0.08)]"
                      style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                      Verified
                    </span>
                  )}
                </div>
                <p className="font-[Rajdhani,sans-serif] text-sm text-[#8b5cf6] tracking-widest mb-1">@{player.username}</p>
                {player.player_tag && (
                  <p className="font-[Rajdhani,sans-serif] text-xs text-white/35 tracking-wider mb-2">{player.player_tag}</p>
                )}
                {player.description && (
                  <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/40 leading-relaxed mb-3 max-w-xl">
                    {player.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {[
                    player.skill_level && { icon: "◈", val: player.skill_level },
                    player.device      && { icon: "◉", val: player.device },
                    player.region      && { icon: "⬡", val: player.region },
                    (player.city || player.state) && { icon: "◎", val: [player.city, player.state].filter(Boolean).join(", ") },
                    { icon: "◷", val: `Joined ${joinedDate}` },
                  ].filter(Boolean).map((item: any) => (
                    <span key={item.val} className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/30 tracking-wide flex items-center gap-1.5">
                      <span className="text-[#8b5cf6] text-[0.65rem]">{item.icon}</span>{item.val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons — only for owner */}
              {isOwner && (
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setEditOpen(true)}
                    className="rk-btn-ghost shrink-0 px-5 py-2.5 font-[Rajdhani,sans-serif] font-semibold text-[0.75rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)] flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 opacity-60">
                      <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                    Edit Profile
                  </button>
                  <button onClick={() => setInGameOpen(true)}
                    className="in-game-btn shrink-0 px-5 py-2.5 font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#a78bfa] flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                      <rect x="2" y="5" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M6 9H10M8 7V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M5 5V4C5 2.9 5.9 2 7 2H9C10.1 2 11 2.9 11 4V5" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    Update Game Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════
              QUICK INFO ROW
          ══════════════════════════════════════ */}
          <div className="fade-up-2 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBox label="Username" value={player.username} />
            <StatBox label="Role" value="Player" accent />
            <StatBox label="Country" value={player.country || "—"} />
            <StatBox label="Skill Level" value={player.skill_level || "—"} accent />
          </div>

          {/* ══════════════════════════════════════
              TABS
          ══════════════════════════════════════ */}
          <div className="fade-up-3 border-b border-[rgba(139,92,246,0.12)] mb-6 flex gap-0">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`tab-btn ${activeTab === t.key ? "active" : ""}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════
              TAB: OVERVIEW
          ══════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="fade-up-4 grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Account info */}
              <div className="md:col-span-2 rk-card p-6">
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-4">Account Details</p>
                <div className="space-y-3">
                  <InfoRow label="Email"       val={player.email} />
                  <InfoRow label="Username"    val={player.username} />
                  {player.player_tag  && <InfoRow label="Player Tag"  val={player.player_tag} />}
                  {player.city        && <InfoRow label="City"         val={player.city} />}
                  {player.state       && <InfoRow label="State"        val={player.state} />}
                  <InfoRow label="Country"     val={player.country || "—"} />
                  {player.region      && <InfoRow label="Region"       val={player.region} />}
                  {player.device      && <InfoRow label="Device"       val={player.device} />}
                  {player.skill_level && <InfoRow label="Skill Level"  val={player.skill_level} />}
                  <InfoRow label="Joined"      val={joinedDate} />
                </div>
              </div>

              {/* Games played */}
              <div className="rk-card p-6">
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-4">Games</p>
                {player.games && player.games.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {player.games.map(g => (
                      <span key={g} className="game-chip">{g}</span>
                    ))}
                  </div>
                ) : (
                  <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/20">
                    No games linked yet.{" "}
                    {isOwner && (
                      <button onClick={() => setInGameOpen(true)}
                        className="text-[#8b5cf6] underline cursor-pointer bg-transparent border-none">
                        Add now →
                      </button>
                    )}
                  </p>
                )}

                {player.description && (
                  <div className="mt-5 pt-4 border-t border-[rgba(139,92,246,0.08)]">
                    <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-2">Bio</p>
                    <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/40 leading-relaxed">{player.description}</p>
                  </div>
                )}

                {isOwner && (
                  <button onClick={() => setInGameOpen(true)}
                    className="mt-5 w-full in-game-btn py-2.5 font-[Rajdhani,sans-serif] font-bold text-[0.72rem] tracking-[0.2em] uppercase text-[#a78bfa]">
                    ⊕ Update Game Details
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: IN-GAME STATS
          ══════════════════════════════════════ */}
          {activeTab === "games" && (
            <div className="fade-up-4 space-y-4">
              {player.player_tag ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-[Rajdhani,sans-serif] text-[0.58rem] tracking-[0.35em] uppercase text-[#8b5cf6]">Live Data</p>
                      <h2 className="font-[Cinzel,serif] text-base font-bold text-white">In-Game Statistics</h2>
                    </div>
                    {isOwner && (
                      <button onClick={() => setInGameOpen(true)}
                        className="in-game-btn px-4 py-2 font-[Rajdhani,sans-serif] font-bold text-[0.7rem] tracking-[0.2em] uppercase text-[#a78bfa]">
                        Update Tag
                      </button>
                    )}
                  </div>
                  <CRStatsPanel tag={player.player_tag} />
                </>
              ) : (
                <div className="rk-card p-10 text-center">
                  <div className="w-14 h-14 border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.04)] flex items-center justify-center mx-auto mb-4"
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 opacity-30">
                      <rect x="3" y="6" width="18" height="14" rx="2" stroke="#8b5cf6" strokeWidth="1.5" />
                      <path d="M10 11H14M12 9V13" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M8 6V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V6" stroke="#8b5cf6" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className="font-[Cinzel,serif] text-sm font-bold text-white/25 mb-1">No Player Tag Linked</p>
                  <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/18 mb-5">
                    Link a Clash Royale tag to see live in-game stats
                  </p>
                  {isOwner && (
                    <button onClick={() => setInGameOpen(true)}
                      className="in-game-btn px-6 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.75rem] tracking-[0.2em] uppercase text-[#a78bfa]">
                      ⊕ Add Player Tag
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>{/* /max-w container */}
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {editOpen && isOwner && (
        <EditModal player={player} onClose={() => setEditOpen(false)} onSave={handleProfileSave} />
      )}

      {/* ── UPDATE IN-GAME MODAL ── */}
      {inGameOpen && isOwner && (
        <InGameModal
          player={player}
          playerId={resolvedId}
          onClose={() => setInGameOpen(false)}
          onSaved={handleInGameSaved}
        />
      )}
    </>
  );
}