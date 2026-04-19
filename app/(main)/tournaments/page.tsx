"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types";

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [joined, setJoined] = useState<string[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [checkingJoined, setCheckingJoined] = useState(true);

  /* ── Fetch tournaments from database */
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await fetch("/api/tournaments");
        if (!res.ok) throw new Error("Failed to fetch tournaments");
        const data = await res.json();
        setTournaments(data.tournaments ?? []);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
        setError("Failed to load tournaments");
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  /* ── Check which tournaments the user already joined */
  useEffect(() => {
    if (tournaments.length === 0) {
      setCheckingJoined(false);
      return;
    }
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
      } catch {
        // silently fail — user just won't see "Check Out" buttons
      } finally {
        setCheckingJoined(false);
      }
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
      if (!res.ok) {
        alert(data.error || "Failed to join");
        return;
      }
      setJoined(prev => [...prev, tournamentId]);
    } catch {
      alert("Something went wrong");
    } finally {
      setJoiningId(null);
    }
  };

  /* ── Filtered list */
  const filtered = useMemo(() => {
    return tournaments.filter(t => {
      if (search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t._id ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tournaments, search]);

  /* ── Status color */
  const statusColor = (status: string) => {
    switch (status) {
      case "registration_open": return "#22c55e";
      case "upcoming": return "#f59e0b";
      case "ongoing": return "#3b82f6";
      case "completed": return "#6b7280";
      case "cancelled": return "#ef4444";
      default: return "#8b5cf6";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "registration_open": return "Open";
      case "upcoming": return "Upcoming";
      case "ongoing": return "Live";
      case "completed": return "Done";
      case "cancelled": return "Cancelled";
      case "draft": return "Draft";
      default: return status;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.025; }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
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

        .anim-grid { animation: gridFade 2s ease forwards; }
        .page-fade-1 { animation: fadeUp 0.55s ease forwards 0.05s; opacity: 0; }
        .page-fade-2 { animation: fadeUp 0.55s ease forwards 0.12s; opacity: 0; }
        .tourney-panel { animation: panelIn 0.3s ease forwards; opacity: 0; }
        .empty-float { animation: emptyFloat 3s ease-in-out infinite; }

        .spin-loader {
          width: 28px; height: 28px;
          border: 2px solid rgba(139,92,246,0.15);
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spinPulse 1s linear infinite;
        }

        .section-divide {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent);
        }

        .rk-search:focus {
          outline: none;
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 14px rgba(139,92,246,0.1);
        }

        .join-btn:hover:not(:disabled) {
          background: rgba(139,92,246,0.2) !important;
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 14px rgba(139,92,246,0.2);
        }
      `}</style>

      <div className="min-h-screen bg-[#050510] relative overflow-x-hidden">

        {/* Background grid */}
        <div className="anim-grid fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "70px 70px", zIndex: 0
          }}
        />
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)", zIndex: 0 }} />

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 md:px-8 pt-28 pb-20">

          {/* ════════════════════════════════════════════
              PAGE HEADER
          ════════════════════════════════════════════ */}
          <div className="page-fade-1 mb-2">
            <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.4em] uppercase text-[#8b5cf6]">
              Battle Arena
            </p>
          </div>

          <div className="page-fade-2 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.04em]"
                style={{
                  fontSize: "clamp(1.8rem, 5vw, 3rem)",
                  background: "linear-gradient(135deg, #fff 0%, #a78bfa 40%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                Tournaments
              </h1>
              <p className="font-[Rajdhani,sans-serif] text-[0.78rem] text-white/30 mt-1">
                {loading ? "Loading..." : `${tournaments.length} tournament${tournaments.length !== 1 ? "s" : ""} registered`}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="10" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tournaments..."
                className="rk-search bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.18)] text-white/70 font-[Rajdhani,sans-serif] text-[0.85rem] pl-9 pr-4 py-2.5 w-60 transition-all duration-300"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
              />
            </div>
          </div>

          <div className="section-divide mb-0" />

          {/* ════════════════════════════════════════════
              LOADING STATE
          ════════════════════════════════════════════ */}
          {loading && (
            <div className="text-center py-24">
              <div className="spin-loader mx-auto mb-4" />
              <p className="font-[Rajdhani,sans-serif] text-white/20 text-sm tracking-wide">
                Loading tournaments...
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              ERROR STATE
          ════════════════════════════════════════════ */}
          {!loading && error && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <circle cx="24" cy="24" r="20" stroke="#f87171" strokeWidth="1.5" />
                  <line x1="16" y1="16" x2="32" y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="32" y1="16" x2="16" y2="32" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">{error}</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                Please try again later
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              EMPTY STATE — no tournaments in database
          ════════════════════════════════════════════ */}
          {!loading && !error && tournaments.length === 0 && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Tournaments Yet</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                No tournaments have been created yet. Check back soon!
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════
              EMPTY SEARCH
          ════════════════════════════════════════════ */}
          {!loading && !error && tournaments.length > 0 && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="empty-float mb-4 inline-block">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 mx-auto opacity-15">
                  <path d="M24 4L42 12V24C42 33.5 34 41.5 24 44C14 41.5 6 33.5 6 24V12L24 4Z" stroke="#8b5cf6" strokeWidth="1.5" />
                  <path d="M16 24L21 29L32 18" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-[Cinzel,serif] text-white/20 text-lg">No Tournaments Found</p>
              <p className="font-[Rajdhani,sans-serif] text-white/15 text-sm mt-2 tracking-wide">
                Adjust your search to find tournaments
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-6 font-[Rajdhani,sans-serif] text-[0.72rem] tracking-[0.2em] uppercase text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] px-5 py-2 hover:bg-[rgba(139,92,246,0.08)] transition-all duration-200"
                style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}>
                Clear Search
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════
              TOURNAMENT LIST
          ════════════════════════════════════════════ */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-2 mt-4">
              {filtered.map((t, i) => {
                const tid = t._id ?? "";
                const sColor = statusColor(t.status);
                const sLabel = statusLabel(t.status);
                const registered = t.registered_players ?? 0;
                const limit = t.participants_limit ?? 0;
                const fillPct = limit > 0 ? Math.min(100, Math.round((registered / limit) * 100)) : 0;
                const isFull = limit > 0 && registered >= limit;

                return (
                  <div
                    key={tid || i}
                    className="tourney-panel relative bg-[#070718] border-b border-[rgba(139,92,246,0.08)] pl-5 pr-4 py-4
                      flex flex-col gap-3
                      md:grid md:items-center md:gap-3 md:pl-6
                      hover:bg-[rgba(139,92,246,0.03)] transition-all duration-200"
                    style={{
                      animationDelay: `${i * 0.04}s`,
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                    }}
                  >
                    {/* Left status stripe */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ background: sColor }} />

                    {/* Name / Status */}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase px-1.5 py-0.5 border"
                          style={{
                            color: sColor,
                            borderColor: `${sColor}44`,
                            background: `${sColor}11`,
                            clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)"
                          }}>
                          {sLabel}
                        </span>
                        {t.visibility === "private" && (
                          <span className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.15em] uppercase text-white/20 border border-white/10 px-1.5 py-0.5"
                            style={{ clipPath: "polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)" }}>
                            Private
                          </span>
                        )}
                      </div>
                      <h2 className="font-[Cinzel,serif] text-[0.88rem] text-white font-bold leading-snug">
                        {t.title}
                      </h2>
                      {t.description && (
                        <p className="font-[Rajdhani,sans-serif] text-[0.6rem] text-white/25 mt-0.5 line-clamp-1">
                          {t.description}
                        </p>
                      )}
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-3 gap-2 md:contents">
                      <div>
                        <p className="font-[Rajdhani,sans-serif] text-[0.55rem] uppercase text-white/25">Region</p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/75">{t.region || "—"}</p>
                      </div>
                      <div>
                        <p className="font-[Rajdhani,sans-serif] text-[0.55rem] uppercase text-white/25">Type</p>
                        <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/75">{t.tournament_type || "—"}</p>
                      </div>
                      <div>
                        <p className="font-[Rajdhani,sans-serif] text-[0.55rem] uppercase text-white/25">Prize</p>
                        <p className="font-[Cinzel,serif] text-[0.85rem] font-bold text-[#a78bfa]">
                          {t.prize_pool > 0 ? `₹${t.prize_pool.toLocaleString()}` : "Trophy"}
                        </p>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center gap-3 md:contents">
                      <div className="flex-1 md:flex-none">
                        <p className="font-[Rajdhani,sans-serif] text-[0.55rem] uppercase text-white/25">Slots</p>
                        {limit > 0 ? (
                          <>
                            <div className="h-1 w-full bg-[rgba(255,255,255,0.05)] my-1"
                              style={{ clipPath: "polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)" }}>
                              <div className="h-full transition-all duration-500"
                                style={{
                                  width: `${fillPct}%`,
                                  background: isFull ? "#f87171" : fillPct > 80 ? "#f59e0b" : "#8b5cf6"
                                }} />
                            </div>
                            <p className="font-[Rajdhani,sans-serif] text-[0.65rem]"
                              style={{ color: isFull ? "#f87171" : fillPct > 80 ? "#f59e0b" : "rgba(255,255,255,0.4)" }}>
                              {isFull ? "FULL" : `${registered}/${limit}`}
                            </p>
                          </>
                        ) : (
                          <p className="font-[Rajdhani,sans-serif] text-[0.65rem] text-[#f59e0b]">Unlimited</p>
                        )}
                      </div>

                      {/* ── Button */}
                      {checkingJoined ? (
                        <button disabled className="join-btn flex-shrink-0 px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap opacity-40 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa]"
                          style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}>
                          ...
                        </button>
                      ) : joined.includes(tid) ? (
                        <button
                          onClick={() => router.push(`/tournaments/${tid}`)}
                          className="join-btn flex-shrink-0 px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap transition-all bg-[#a78bfa]/10 border border-[#a78bfa] text-[#a78bfa]"
                          style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
                        >
                          Check Out →
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(tid)}
                          disabled={joiningId === tid || isFull || t.status === "completed" || t.status === "cancelled"}
                          className="join-btn flex-shrink-0 px-4 py-2 text-[0.6rem] uppercase font-bold tracking-[0.18em] font-[Rajdhani,sans-serif] whitespace-nowrap transition-all bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#a78bfa] disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
                        >
                          {joiningId === tid ? "Joining..." : isFull ? "Full" : "Join →"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Bottom summary */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-between px-1">
              <p className="font-[Rajdhani,sans-serif] text-[0.62rem] tracking-[0.2em] uppercase text-white/15">
                Showing {filtered.length} of {tournaments.length} tournaments
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}