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
      <div className="flex items-center gap-3 mt-10 ml-10">
        <div className="w-[220px]">
          <div className="flex items-center h-[42px] bg-[#0f1e36] border border-purple-900 skew-x-24">
            <span className="text-[10px] bg-[#1a4a7a] text-sky-300 px-1.5 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
            <span className="flex-1 px-2 text-[13px] text-sky-100 tracking-wide truncate -skew-x-24">{team1}</span>
            <span className="mr-4 text-[10px] tracking-widest text-purple-400 -skew-x-24">BYE</span>
          </div>
        </div>
        <div id={id} className="flex flex-col items-center relative">
          <div className="w-px h-[21px] bg-[#1a4a7a]"></div>
          <div className="w-[22px] h-[22px] rounded-full bg-[#0f1e36] border border-purple-900 flex items-center justify-center">
            <span className="text-purple-400 text-[8px] tracking-wider">BYE</span>
          </div>
          <div className="w-px h-[21px] bg-[#1a4a7a]"></div>
        </div>
      </div>
    );
  }

  // ── Normal bracket
  return (
    <div className="flex items-center gap-3 mt-10 ml-10">
      <div className="w-[220px]">

        {/* Team 1 */}
        <div className={`flex items-center h-[42px] bg-[#0f1e36] border transition-colors duration-200 skew-x-24
          ${team1Result === "W" ? "border-green-600" : team1Result === "L" ? "border-red-900 opacity-60" : "border-[#1a4a7a] hover:border-cyan-400"}`}>
          <span className="text-[10px] bg-[#1a4a7a] text-sky-300 px-1.5 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
          <span className="flex-1 px-2 text-[13px] text-sky-100 tracking-wide truncate -skew-x-24">{team1}</span>
          <span className={`mr-4 px-2 text-[11px] font-bold -skew-x-24
            ${team1Result === "W" ? "text-green-400" : team1Result === "L" ? "text-red-400" : "text-slate-600"}`}>
            {team1Result ?? "—"}
          </span>
        </div>

        <p className="text-center text-[9px] text-slate-600 tracking-widest py-0.5">VS</p>

        {/* Team 2 */}
        <div className={`flex items-center h-[42px] bg-[#0f1e36] border transition-colors duration-200 -skew-x-24
          ${team2Result === "W" ? "border-green-600" : team2Result === "L" ? "border-red-900 opacity-60" : "border-[#1a4a7a] hover:border-cyan-400"}`}>
          <span className="text-[10px] bg-[#1a4a7a] text-sky-300 px-1.5 py-0.5 rounded ml-3 tracking-wider skew-x-24">2</span>
          <span className="flex-1 px-2 text-[13px] text-sky-100 tracking-wide truncate skew-x-24">{team2}</span>
          <span className={`mr-4 px-2 text-[11px] font-bold skew-x-24
            ${team2Result === "W" ? "text-green-400" : team2Result === "L" ? "text-red-400" : "text-slate-600"}`}>
            {team2Result ?? "—"}
          </span>
        </div>
      </div>

      {/* Connector + Info */}
      <div id={id} className="flex flex-col items-center relative">
        <div className="w-px h-[21px] bg-[#1a4a7a]"></div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-[22px] h-[22px] rounded-full bg-[#0f1e36] border border-[#1a4a7a] text-sky-300 text-[11px] hover:bg-cyan-400 hover:text-[#0f1e36] transition-all">i</button>
        <div className="w-px h-[21px] bg-[#1a4a7a]"></div>

        {/* Info Box */}
        {showInfo && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[180px] bg-[#0f1e36] border border-[#1a4a7a] rounded-md p-3 z-10 text-[12px]">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sky-400 font-medium tracking-wide text-[11px]">Match Info</p>
              <span className={`text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm font-bold
                ${status === "live"      ? "bg-green-900/60 text-green-400" :
                  status === "completed" ? "bg-slate-800 text-slate-400"    :
                                           "bg-[#1a4a7a]/60 text-sky-400"}`}>
                {status === "live" ? "● LIVE" : status === "completed" ? "DONE" : "PENDING"}
              </span>
            </div>

            {/* Details */}
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Mode</span>
              <span className="text-sky-100">Ladder</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Score</span>
              <span className="text-sky-100">
                {team1Result ? (team1Result === "W" ? "W — L" : "L — W") : "— — —"}
              </span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-slate-400">Result</span>
              <span className={
                team1Result === "W" ? "text-green-400" :
                team2Result === "W" ? "text-green-400" : "text-slate-500"}>
                {team1Result === "W" ? `${team1} wins` :
                 team2Result === "W" ? `${team2} wins` : "Pending"}
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