"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { Games, Access_Level_USER_Role } from "../../../../types/index";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — replace with real API calls later
───────────────────────────────────────────────────────────── */
type TournamentRecord = {
  id: string;
  name: string;
  game: string;
  date: string;
  placement: number;
  totalTeams: number;
  prize: string | null;
  result: "win" | "top3" | "top8" | "eliminated";
};

type PlayerEditForm = {
  name: string;
  player_tag: string;
  description: string;
  region: string;
  device: string;
  skill_level: string;
};

const MOCK_PLAYER = {
  _id: "p_01",
  name: "Arjun Mehta",
  username: "ShadowStrike",
  player_tag: "ShadowStrike#1337",
  role: Access_Level_USER_Role.PLAYER,
  email: "arjun@example.com",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  region: "West India",
  device: "Mobile + PC",
  skill_level: "Semi-Pro",
  description: "Competitive BGMI & Valorant player. Grinding ranked since 2021. Looking for a serious squad for nationals.",
  games: [Games.CLASH_ROYALE],
  fav_game: Games.CLASH_ROYALE,
  is_verified: true,
  joined: "March 2024",
  stats: {
    tournaments_played: 24,
    wins: 6,
    top3: 11,
    total_kills: 312,
    win_rate: 25,
    avg_placement: 3.2,
    rank_points: 4870,
  },
};

const MOCK_TOURNAMENTS: TournamentRecord[] = [
  { id: "t1", name: "West India BGMI Open", game: "BGMI", date: "12 Mar 2025", placement: 1, totalTeams: 64, prize: "₹15,000", result: "win" },
  { id: "t2", name: "Arena Masters S3", game: "Valorant", date: "28 Feb 2025", placement: 3, totalTeams: 32, prize: "₹3,000", result: "top3" },
  { id: "t3", name: "Clash Cup Weekly #18", game: "Clash Royale", date: "14 Feb 2025", placement: 2, totalTeams: 48, prize: "₹1,500", result: "top3" },
  { id: "t4", name: "BGMI Ranked Invitational", game: "BGMI", date: "01 Feb 2025", placement: 7, totalTeams: 20, prize: null, result: "top8" },
  { id: "t5", name: "National Qualifier — Valorant", game: "Valorant", date: "18 Jan 2025", placement: 14, totalTeams: 128, prize: null, result: "eliminated" },
  { id: "t6", name: "West India BGMI Open", game: "BGMI", date: "05 Jan 2025", placement: 1, totalTeams: 64, prize: "₹15,000", result: "win" },
  { id: "t7", name: "RK Monthly Cup #4", game: "BGMI", date: "22 Dec 2024", placement: 4, totalTeams: 32, prize: "₹500", result: "top8" },
  { id: "t8", name: "Clash Cup Weekly #9", game: "Clash Royale", date: "08 Dec 2024", placement: 1, totalTeams: 40, prize: "₹1,000", result: "win" },
];

const REGIONS = ["North India", "South India", "East India", "West India", "Central India", "Global"];
const SKILL_LEVELS = ["Beginner", "Amateur", "Intermediate", "Semi-Pro", "Pro"];
const DEVICES = ["Mobile", "PC", "Console", "Mobile + PC"];

/* ─────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
const resultConfig = {
  win:       { label: "WINNER",   color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.4)" },
  top3:      { label: "TOP 3",    color: "#a78bfa", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.4)" },
  top8:      { label: "TOP 8",    color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.3)" },
  eliminated:{ label: "ELIM",     color: "rgba(255,255,255,0.25)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)" },
};

function Badge({ result }: { result: TournamentRecord["result"] }) {
  const cfg = resultConfig[result];
  return (
    <span className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.2em] px-2 py-0.5 border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border,
        clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
      {cfg.label}
    </span>
  );
}

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

/* ─────────────────────────────────────────────────────────────
   EDIT MODAL
───────────────────────────────────────────────────────────── */
function EditModal({ player, onClose, onSave }: {
  player: typeof MOCK_PLAYER;
  onClose: () => void;
  onSave: (data: PlayerEditForm) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<PlayerEditForm>({
    defaultValues: {
      name: player.name,
      player_tag: player.player_tag,
      description: player.description,
      region: player.region,
      device: player.device,
      skill_level: player.skill_level,
    },
  });

  const onSubmit: SubmitHandler<PlayerEditForm> = (data) => onSave(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,5,16,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-[480px] bg-[#080818] border border-[rgba(139,92,246,0.3)] p-8 modal-in"
        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}>

        {/* Corner brackets */}
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
            <RkInput label="Player Tag / IGN" placeholder="e.g. ShadowStrike#1337"
              error={errors.player_tag?.message}
              {...register("player_tag", { required: "PLAYER TAG IS REQUIRED" })}
            />
            <div className="mb-4">
              <label className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">Bio</label>
              <textarea rows={3} placeholder="Tell the arena who you are..."
                {...register("description")}
                className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] px-4 py-2.5 placeholder:text-white/20 resize-none transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              />
            </div>
            <RkSelect label="Region" options={REGIONS}
              {...register("region")}
            />
            <RkSelect label="Primary Device" options={DEVICES}
              {...register("device")}
            />
            <RkSelect label="Skill Level" options={SKILL_LEVELS}
              {...register("skill_level")}
            />
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
   MAIN PROFILE PAGE
───────────────────────────────────────────────────────────── */
type ActiveTab = "overview" | "tournaments" | "games";

export default function PlayerProfilePage() {
  const [player, setPlayer] = useState(MOCK_PLAYER);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [tourFilter, setTourFilter] = useState<string>("all");

  const handleSave = (data: PlayerEditForm) => {
    setPlayer(prev => ({ ...prev, ...data }));
    setEditOpen(false);
  };

  const filteredTournaments = tourFilter === "all"
    ? MOCK_TOURNAMENTS
    : MOCK_TOURNAMENTS.filter(t => t.result === tourFilter);

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "tournaments", label: "Tournaments" },
    { key: "games", label: "Games" },
  ];

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

        .fade-up   { animation: fadeUp 0.5s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.5s ease 0.1s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.5s ease 0.2s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.5s ease 0.3s forwards; opacity: 0; }
        .modal-in  { animation: modalIn 0.3s ease forwards; }
        .anim-grid { animation: gridFade 2s ease forwards; }

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
        .tour-row {
          border-bottom: 1px solid rgba(139,92,246,0.07);
          transition: background 0.2s ease;
        }
        .tour-row:last-child { border-bottom: none; }
        .tour-row:hover { background: rgba(139,92,246,0.04); }

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

        /* verified checkmark */
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
        .game-chip.fav {
          border-color: rgba(139,92,246,0.7);
          background: rgba(139,92,246,0.14);
          color: #a78bfa;
        }
        .filter-chip {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 14px;
          border: 1px solid rgba(139,92,246,0.2);
          background: rgba(139,92,246,0.03);
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
        }
        .filter-chip:hover { background: rgba(139,92,246,0.08); color: rgba(255,255,255,0.6); }
        .filter-chip.active {
          border-color: rgba(139,92,246,0.7);
          background: rgba(139,92,246,0.12);
          color: #a78bfa;
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
            RAIKAZEN
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tournaments"
              className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors no-underline">
              Tournaments
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
                    {player.name.split(" ").map(n => n[0]).join("")}
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
                  <h1 className="font-[Cinzel,serif] text-2xl font-black text-white">{player.name}</h1>
                  {player.is_verified && (
                    <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase px-2 py-0.5 border border-[rgba(139,92,246,0.4)] text-[#8b5cf6] bg-[rgba(139,92,246,0.08)]"
                      style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                      Verified
                    </span>
                  )}
                </div>
                <p className="font-[Rajdhani,sans-serif] text-sm text-[#8b5cf6] tracking-widest mb-2">{player.player_tag}</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/40 leading-relaxed mb-3 max-w-xl">
                  {player.description}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {[
                    { icon: "◈", val: player.skill_level },
                    { icon: "◉", val: player.device },
                    { icon: "⬡", val: player.region },
                    { icon: "◎", val: `${player.city}, ${player.state}` },
                    { icon: "◷", val: `Joined ${player.joined}` },
                  ].map(({ icon, val }) => (
                    <span key={val} className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/30 tracking-wide flex items-center gap-1.5">
                      <span className="text-[#8b5cf6] text-[0.65rem]">{icon}</span>{val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit button */}
              <button onClick={() => setEditOpen(true)}
                className="rk-btn-ghost shrink-0 px-5 py-2.5 font-[Rajdhani,sans-serif] font-semibold text-[0.75rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)] flex items-center gap-2">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 opacity-60">
                  <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════
              QUICK STATS ROW
          ══════════════════════════════════════ */}
          <div className="fade-up-2 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBox label="Tournaments" value={player.stats.tournaments_played} />
            <StatBox label="Victories" value={player.stats.wins} accent />
            <StatBox label="Rank Points" value={player.stats.rank_points.toLocaleString()} accent />
            <StatBox label="Win Rate" value={`${player.stats.win_rate}%`} />
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

              {/* Performance card */}
              <div className="md:col-span-2 rk-card p-6">
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-4">Performance Breakdown</p>
                <div className="space-y-4">
                  {[
                    { label: "Win Rate",       value: player.stats.win_rate,              max: 100, display: `${player.stats.win_rate}%` },
                    { label: "Top 3 Rate",     value: Math.round((player.stats.top3 / player.stats.tournaments_played) * 100), max: 100, display: `${Math.round((player.stats.top3 / player.stats.tournaments_played) * 100)}%` },
                    { label: "Avg Placement",  value: Math.round((1 / player.stats.avg_placement) * 100), max: 100, display: `#${player.stats.avg_placement}` },
                  ].map(bar => (
                    <div key={bar.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-[Rajdhani,sans-serif] text-[0.7rem] tracking-widest uppercase text-white/40">{bar.label}</span>
                        <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-[#a78bfa] font-semibold">{bar.display}</span>
                      </div>
                      <div className="win-bar">
                        <div className="win-bar-fill" style={{ ["--target" as string]: `${bar.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini stats grid */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[rgba(139,92,246,0.08)]">
                  {[
                    { label: "Total Kills", value: player.stats.total_kills },
                    { label: "Top 3 Finishes", value: player.stats.top3 },
                    { label: "Avg Placement", value: `#${player.stats.avg_placement}` },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-[Cinzel,serif] font-bold text-lg text-white">{s.value}</p>
                      <p className="font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.2em] uppercase text-white/25 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right col: recent + fav game */}
              <div className="flex flex-col gap-4">
                {/* Recent tournament */}
                <div className="rk-card p-5">
                  <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-3">Latest Result</p>
                  {(() => {
                    const latest = MOCK_TOURNAMENTS[0];
                    return (
                      <div>
                        <p className="font-[Cinzel,serif] text-sm font-bold text-white mb-1 leading-snug">{latest.name}</p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/30 mb-3">{latest.game} · {latest.date}</p>
                        <div className="flex items-center justify-between">
                          <Badge result={latest.result} />
                          <span className="font-[Cinzel,serif] text-xl font-black"
                            style={{ color: latest.result === "win" ? "#fbbf24" : "#a78bfa" }}>
                            #{latest.placement}
                          </span>
                        </div>
                        {latest.prize && (
                          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-widest uppercase text-white/30 mt-2">
                            Prize · <span className="text-[#a78bfa]">{latest.prize}</span>
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Contact / info */}
                <div className="rk-card p-5 flex-1">
                  <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-3">Account Info</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Email", val: player.email },
                      { label: "Country", val: player.country },
                      { label: "Role", val: "Player" },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-widest uppercase text-white/25">{label}</span>
                        <span className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/55">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: TOURNAMENTS
          ══════════════════════════════════════ */}
          {activeTab === "tournaments" && (
            <div className="fade-up-4">

              {/* Summary row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <StatBox label="Played" value={player.stats.tournaments_played} />
                <StatBox label="Wins" value={player.stats.wins} accent />
                <StatBox label="Top 3" value={player.stats.top3} />
                <StatBox label="Prize Earned" value="₹36,000" accent />
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(["all", "win", "top3", "top8", "eliminated"] as const).map(f => (
                  <button key={f} onClick={() => setTourFilter(f)}
                    className={`filter-chip ${tourFilter === f ? "active" : ""}`}>
                    {f === "all" ? "All" : f === "win" ? "Wins" : f === "top3" ? "Top 3" : f === "top8" ? "Top 8" : "Eliminated"}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="rk-card overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 px-5 py-3 border-b border-[rgba(139,92,246,0.1)]">
                  {[["Tournament", "col-span-5"], ["Game", "col-span-2"], ["Date", "col-span-2 hidden md:block"], ["Result", "col-span-2"], ["Prize", "col-span-1 hidden md:block"]].map(([label, cls]) => (
                    <p key={label} className={`${cls} font-[Rajdhani,sans-serif] text-[0.55rem] tracking-[0.3em] uppercase text-white/25`}>
                      {label}
                    </p>
                  ))}
                </div>

                {filteredTournaments.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-[Rajdhani,sans-serif] text-[0.75rem] tracking-widest uppercase text-white/20">No records found</p>
                  </div>
                ) : (
                  filteredTournaments.map(t => (
                    <div key={t.id} className="tour-row grid grid-cols-12 px-5 py-4 items-center">
                      <div className="col-span-5 pr-4">
                        <p className="font-[Rajdhani,sans-serif] text-[0.82rem] font-semibold text-white/80 leading-snug">{t.name}</p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/25 mt-0.5">
                          {t.placement}/{t.totalTeams} teams
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="game-chip text-[0.55rem]">{t.game}</span>
                      </div>
                      <div className="col-span-2 hidden md:block">
                        <p className="font-[Rajdhani,sans-serif] text-[0.72rem] text-white/35">{t.date}</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Badge result={t.result} />
                        <span className="font-[Cinzel,serif] text-sm font-bold"
                          style={{ color: t.result === "win" ? "#fbbf24" : t.result === "top3" ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
                          #{t.placement}
                        </span>
                      </div>
                      <div className="col-span-1 hidden md:block">
                        <p className="font-[Rajdhani,sans-serif] text-[0.72rem]"
                          style={{ color: t.prize ? "#a78bfa" : "rgba(255,255,255,0.2)" }}>
                          {t.prize ?? "—"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: GAMES
          ══════════════════════════════════════ */}
          {activeTab === "games" && (
            <div className="fade-up-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.games.map(game => {
                const isFav = game === player.fav_game;
                const gameTours = MOCK_TOURNAMENTS.filter(t => t.game === game.split(" ")[0] || t.game === game);
                const wins = gameTours.filter(t => t.result === "win").length;
                return (
                  <div key={game} className="rk-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-[Cinzel,serif] text-base font-bold text-white mb-1">{game}</p>
                        {isFav && (
                          <span className="game-chip fav text-[0.5rem]">⭑ Favourite</span>
                        )}
                      </div>
                      <div className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center bg-[rgba(139,92,246,0.05)]"
                        style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                        <span className="font-[Cinzel,serif] text-[0.7rem] text-[#8b5cf6] font-bold">
                          {game.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[rgba(139,92,246,0.08)]">
                      <div className="text-center">
                        <p className="font-[Cinzel,serif] font-bold text-lg text-white">{gameTours.length}</p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-white/25 mt-0.5">Played</p>
                      </div>
                      <div className="text-center">
                        <p className="font-[Cinzel,serif] font-bold text-lg text-[#fbbf24]">{wins}</p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-white/25 mt-0.5">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="font-[Cinzel,serif] font-bold text-lg text-[#a78bfa]">
                          {gameTours.length ? Math.round((wins / gameTours.length) * 100) : 0}%
                        </p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-white/25 mt-0.5">Win Rate</p>
                      </div>
                    </div>
                    {/* Mini bar */}
                    {gameTours.length > 0 && (
                      <div className="mt-4 win-bar">
                        <div className="win-bar-fill"
                          style={{ ["--target" as string]: `${Math.round((wins / gameTours.length) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Placeholder — more games CTA */}
              <div className="rk-card p-6 flex flex-col items-center justify-center text-center min-h-[140px] border-dashed"
                style={{ borderColor: "rgba(139,92,246,0.12)", borderStyle: "dashed" }}>
                <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-white/20 mb-2">Add More Games</p>
                <p className="font-[Rajdhani,sans-serif] text-[0.7rem] text-white/15 mb-4">Track all your titles in one place</p>
                <button onClick={() => setEditOpen(true)}
                  className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.2em] uppercase px-4 py-2 border border-[rgba(139,92,246,0.2)] text-[#8b5cf6]/60 hover:border-[rgba(139,92,246,0.5)] hover:text-[#8b5cf6] transition-all duration-200"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}>
                  + Edit Profile
                </button>
              </div>
            </div>
          )}

        </div>{/* /max-w container */}
      </div>

      {/* ── EDIT MODAL ── */}
      {editOpen && (
        <EditModal player={player} onClose={() => setEditOpen(false)} onSave={handleSave} />
      )}
    </>
  );
}