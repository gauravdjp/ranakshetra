"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GAMES = ["All Games", "Clash Royale"];
const REGIONS = ["All Regions", "North India", "South India", "East India", "West India", "Central India", "Global"];
const TYPES = ["All", "Public", "Private", "Club"];
const SORTS = ["Date ↑", "Prize ↓", "Slots Available"];

const TOURNAMENTS = [
  {
    id: "T-CR-2026-001",
    name: "Clash Royale Champion Trophy",
    game: "Clash Royale",
    type: "public",
    region: "Central India",
    rank: "All Ranks",
    prize: "Trophy",
    slots: "Unlimited",
    organiser: "Gaurav",
    status: "upcoming"
  }
];

function CustomSelect({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-white/30">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rk-select bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] text-white/70 font-[Rajdhani,sans-serif] text-[0.72rem] px-2 py-1.5 cursor-pointer focus:outline-none focus:border-[rgba(139,92,246,0.5)]"
        style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#0a0a1a]">{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function TournamentsPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("All");
  const [gameFilter, setGameFilter] = useState("All Games");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [sortBy, setSortBy] = useState("Date ↑");
  const [joined, setJoined] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingJoined, setCheckingJoined] = useState(true);

  // ── Check which tournaments the user already joined on load
  useEffect(() => {
    const checkAll = async () => {
      const results = await Promise.all(
        TOURNAMENTS.map(async (t) => {
          const res = await fetch("/api/tournaments/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tournamentId: t.id }),
          });
          const data = await res.json();
          return data.joined ? t.id : null;
        })
      );
      setJoined(results.filter(Boolean) as string[]);
      setCheckingJoined(false);
    };
    checkAll();
  }, []);

  const handleJoin = async (tournamentId: string) => {
    setLoading(tournamentId);
    try {
      const res = await fetch("/api/tournaments/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to join");
        return;
      }
      setJoined(prev => [...prev, tournamentId]);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] px-4 md:px-8 pt-24 md:pt-28">

      {/* Filter Panel */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 p-3 md:p-4 border border-[rgba(139,92,246,0.08)] bg-[rgba(139,92,246,0.02)]"
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
      >
        <CustomSelect label="Game"   value={gameFilter}   onChange={setGameFilter}   options={GAMES} />
        <CustomSelect label="Region" value={regionFilter} onChange={setRegionFilter} options={REGIONS} />
        <CustomSelect label="Type"   value={typeFilter}   onChange={setTypeFilter}   options={TYPES} />
        <CustomSelect label="Sort"   value={sortBy}       onChange={setSortBy}       options={SORTS} />
      </div>

      {/* Tournament List */}
      <div className="space-y-2">
        {TOURNAMENTS.map((t) => (
          <div
            key={t.id}
            className="relative bg-[#070718] border-b border-[rgba(139,92,246,0.08)] pl-5 pr-4 py-4
              flex flex-col gap-3
              md:grid md:items-center md:gap-3 md:pl-6"
            style={{
              ["--cols" as any]: "2fr 1fr 1fr 1fr 1fr 1fr auto",
              gridTemplateColumns: "var(--cols)"
            } as any}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#22c55e]" />

            {/* Name / ID / Organiser */}
            <div>
              <p className="text-[0.45rem] tracking-[0.2em] text-white/20">{t.id}</p>
              <h2 className="font-[Cinzel,serif] text-[0.88rem] text-white font-bold leading-snug">
                {t.name}
              </h2>
              <p className="text-[0.6rem] text-white/25">by {t.organiser}</p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-3 gap-2 md:contents">
              <div><p className="text-[0.55rem] uppercase text-white/25">Game</p><p className="text-[0.75rem] text-white/75">{t.game}</p></div>
              <div><p className="text-[0.55rem] uppercase text-white/25">Region</p><p className="text-[0.75rem] text-white/75">{t.region}</p></div>
              <div><p className="text-[0.55rem] uppercase text-white/25">Rank</p><p className="text-[0.75rem] text-white/75">{t.rank}</p></div>
            </div>

            {/* Footer row */}
            <div className="flex items-center gap-3 md:contents">
              <div className="flex-shrink-0">
                <p className="text-[0.55rem] uppercase text-white/25">Prize</p>
                <p className="text-[0.85rem] font-bold text-[#a78bfa]">{t.prize}</p>
              </div>

              <div className="flex-1 md:flex-none">
                <p className="text-[0.55rem] uppercase text-white/25">Slots</p>
                <div className="h-1 w-full bg-[#333] my-1">
                  <div className="h-full bg-[#f59e0b] w-full" />
                </div>
                <p className="text-[0.65rem] text-[#f59e0b]">{t.slots}</p>
              </div>

              {/* ── Button */}
              {checkingJoined ? (
                <button disabled className="flex-shrink-0 px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap opacity-40 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa]"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                  ...
                </button>
              ) : joined.includes(t.id) ? (
                <button
                  onClick={() => router.push(`/tournaments/${t.id}`)}
                  className="flex-shrink-0 px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap transition-all bg-[#a78bfa]/10 border border-[#a78bfa] text-[#a78bfa]"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
                >
                  Check Out →
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(t.id)}
                  disabled={loading === t.id}
                  className="flex-shrink-0 px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap transition-all bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
                >
                  {loading === t.id ? "Joining..." : "Join →"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}