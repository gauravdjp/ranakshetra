"use client";
import { useState } from "react";

interface BracketProps {
  id: string;
  isBye?: boolean;
  team1?: string;
  team2?: string;
  matchId?: string;
  status?: "pending" | "live" | "completed";
  winner_tag?: string | null;
  player1_tag?: string;
  player2_tag?: string;
  onStart?: (matchId: string) => void;
  onDeclareWinner?: (matchId: string, winnerTag: string) => void;
}

export default function Bracket({
  id,
  isBye = false,
  team1 = "TBD",
  team2 = "TBD",
  matchId,
  status = "pending",
  winner_tag,
  player1_tag,
  player2_tag,
  onStart,
  onDeclareWinner,
}: BracketProps) {
  const [showInfo, setShowInfo] = useState(false);

  // ── Derive W/L from DB data, not local state
  const team1Result: "W" | "L" | null = winner_tag
    ? (winner_tag === player1_tag ? "W" : "L")
    : null;
  const team2Result: "W" | "L" | null = winner_tag
    ? (winner_tag === player2_tag ? "W" : "L")
    : null;
  const locked = status === "completed" || status === "live";

  // ── BYE early return
  if (isBye) {
    return (
      <div className="flex items-center gap-3 mt-10 ml-6">
        <div className="w-[260px] shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          <div className="flex items-center h-[50px] bg-[#111827] border-2 border-purple-600/70 skew-x-24 rounded-sm">
            <span className="text-[11px] font-extrabold bg-[#1e293b] text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
            <span className="flex-1 px-3 text-[15px] font-bold text-white tracking-wide truncate -skew-x-24">{team1}</span>
            <span className="mr-4 text-[11px] font-black tracking-widest text-purple-300 bg-purple-950/80 border border-purple-500/50 px-2 py-0.5 rounded -skew-x-24">BYE</span>
          </div>
        </div>
        <div id={id} className="flex flex-col items-center relative">
          <div className="w-0.5 h-[25px] bg-purple-500/50"></div>
          <div className="w-[26px] h-[26px] rounded-full bg-[#111827] border-2 border-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            <span className="text-purple-300 text-[9px] font-bold tracking-wider">BYE</span>
          </div>
          <div className="w-0.5 h-[25px] bg-purple-500/50"></div>
        </div>
      </div>
    );
  }

  // ── Normal bracket
  return (
    <div className="flex items-center gap-3 mt-10 ml-6">
      <div className={`w-[260px] transition-all duration-300 rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.6)] ${
        status === "live" ? "ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]" : ""
      }`}>

        {/* Team 1 */}
        <div className={`flex items-center h-[50px] transition-all duration-200 skew-x-24 rounded-t-sm border-2 ${
          team1Result === "W"
            ? "bg-gradient-to-r from-emerald-950/80 to-[#111827] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : team1Result === "L"
            ? "bg-[#0d0f17] border-rose-950/80 opacity-60"
            : "bg-[#111827] border-[#374151] hover:border-cyan-400"
        }`}>
          <span className="text-[11px] font-extrabold bg-[#1e293b] text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
          <span className="flex-1 px-3 text-[15px] font-bold text-white tracking-wide truncate -skew-x-24">{team1}</span>
          <span className={`mr-4 px-2.5 py-0.5 text-[12px] font-extrabold rounded -skew-x-24 ${
            team1Result === "W"
              ? "text-emerald-300 bg-emerald-950/90 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              : team1Result === "L"
              ? "text-rose-300 bg-rose-950/70 border border-rose-500/50"
              : "text-slate-400"
          }`}>
            {team1Result ?? "—"}
          </span>
        </div>

        {/* VS Badge */}
        <div className="flex items-center justify-center my-0.5 relative z-10">
          <span className="text-[10px] font-extrabold tracking-widest text-purple-200 bg-[#1d1435] px-3 py-0.5 rounded-full border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.35)]">
            VS
          </span>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center h-[50px] transition-all duration-200 -skew-x-24 rounded-b-sm border-2 ${
          team2Result === "W"
            ? "bg-gradient-to-r from-emerald-950/80 to-[#111827] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : team2Result === "L"
            ? "bg-[#0d0f17] border-rose-950/80 opacity-60"
            : "bg-[#111827] border-[#374151] hover:border-cyan-400"
        }`}>
          <span className="text-[11px] font-extrabold bg-[#1e293b] text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded ml-3 tracking-wider skew-x-24">2</span>
          <span className="flex-1 px-3 text-[15px] font-bold text-white tracking-wide truncate skew-x-24">{team2}</span>
          <span className={`mr-4 px-2.5 py-0.5 text-[12px] font-extrabold rounded skew-x-24 ${
            team2Result === "W"
              ? "text-emerald-300 bg-emerald-950/90 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              : team2Result === "L"
              ? "text-rose-300 bg-rose-950/70 border border-rose-500/50"
              : "text-slate-400"
          }`}>
            {team2Result ?? "—"}
          </span>
        </div>
      </div>

      {/* Connector + Info */}
      <div id={id} className="flex flex-col items-center relative">
        <div className="w-0.5 h-[25px] bg-purple-500/50"></div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          title="Match Details & Controls"
          className="w-[28px] h-[28px] rounded-full bg-[#111827] border-2 border-cyan-400 text-cyan-300 text-[13px] font-extrabold hover:bg-cyan-400 hover:text-black transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center justify-center">
          i
        </button>
        <div className="w-0.5 h-[25px] bg-purple-500/50"></div>

        {/* Info Box Popover */}
        {showInfo && (
          <div className="absolute left-9 top-1/2 -translate-y-1/2 w-[240px] bg-[#0c1322] border-2 border-cyan-500/70 rounded-md p-4 z-30 text-[13px] shadow-[0_0_40px_rgba(0,0,0,0.85)]">

            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
              <p className="text-cyan-300 font-bold tracking-wider text-[12px] uppercase">Match Info</p>
              <span className={`text-[10px] tracking-widest px-2 py-0.5 rounded font-black ${
                status === "live"      ? "bg-green-500 text-black animate-pulse" :
                status === "completed" ? "bg-slate-700 text-slate-200" :
                                         "bg-blue-900 text-cyan-300"
              }`}>
                {status === "live" ? "● LIVE" : status === "completed" ? "DONE" : "PENDING"}
              </span>
            </div>

            {/* Details */}
            <div className="flex justify-between mb-1.5 text-slate-300">
              <span className="text-slate-400">Game:</span>
              <span className="text-white font-semibold">Clash Royale 1v1</span>
            </div>
            <div className="flex justify-between mb-1.5 text-slate-300">
              <span className="text-slate-400">Score:</span>
              <span className="text-cyan-300 font-mono font-bold">
                {team1Result ? (team1Result === "W" ? "2 — 1" : "1 — 2") : "— — —"}
              </span>
            </div>
            <div className="flex justify-between mb-3 text-slate-300">
              <span className="text-slate-400">Winner:</span>
              <span className={`font-bold ${
                team1Result === "W" ? "text-emerald-400" :
                team2Result === "W" ? "text-emerald-400" : "text-slate-400"
              }`}>
                {team1Result === "W" ? `${team1}` :
                 team2Result === "W" ? `${team2}` : "Pending"}
              </span>
            </div>

            {/* Start button */}
            {status === "pending" && onStart && (
              <>
                <div className="border-t border-[#1a4a7a] mb-3" />
                <button
                  onClick={() => { if (matchId) onStart(matchId); setShowInfo(false); }}
                  className="w-full py-1.5 rounded-sm text-[11px] font-bold tracking-widest
                    bg-gradient-to-r from-purple-900 to-[#1a4a7a]
                    text-purple-300 border border-purple-700
                    hover:from-purple-700 hover:to-cyan-900 hover:text-white
                    transition-all duration-200">
                  ▶ START MATCH
                </button>
              </>
            )}

            {/* Live indicator & instant winner advance */}
            {status === "live" && (
              <>
                <div className="border-t border-[#1a4a7a] mb-2.5" />
                <div className="flex items-center justify-center gap-2 text-green-400 text-[10px] tracking-widest mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  POLLING BATTLE LOG
                </div>
                {onDeclareWinner && (
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        if (matchId && player1_tag) onDeclareWinner(matchId, player1_tag);
                        setShowInfo(false);
                      }}
                      className="flex-1 py-1 px-1 rounded-sm text-[9px] font-bold bg-green-950/80 border border-green-700/60 text-green-300 hover:bg-green-800 transition-colors truncate">
                      {team1} Won
                    </button>
                    {player2_tag && (
                      <button
                        onClick={() => {
                          if (matchId && player2_tag) onDeclareWinner(matchId, player2_tag);
                          setShowInfo(false);
                        }}
                        className="flex-1 py-1 px-1 rounded-sm text-[9px] font-bold bg-green-950/80 border border-green-700/60 text-green-300 hover:bg-green-800 transition-colors truncate">
                        {team2} Won
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Winner banner */}
            {status === "completed" && (
              <>
                <div className="border-t border-[#1a4a7a] mb-3" />
                <div className="flex items-center justify-center gap-2 text-amber-400 text-[10px] tracking-widest">
                  🏆 {team1Result === "W" ? team1 : team2}
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}