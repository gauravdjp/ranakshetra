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
        <div className="w-[260px] shadow-sm">
          <div className="flex items-center h-[50px] bg-white border-2 border-teal-400 skew-x-24 rounded-sm">
            <span className="text-[11px] font-extrabold bg-slate-100 text-teal-700 border border-slate-300 px-2 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
            <span className="flex-1 px-3 text-[15px] font-bold text-slate-900 tracking-wide truncate -skew-x-24">{team1}</span>
            <span className="mr-4 text-[11px] font-black tracking-widest text-teal-700 bg-teal-50 border border-teal-300 px-2 py-0.5 rounded -skew-x-24">BYE</span>
          </div>
        </div>
        <div id={id} className="flex flex-col items-center relative">
          <div className="w-0.5 h-[25px] bg-teal-400"></div>
          <div className="w-[26px] h-[26px] rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shadow-sm">
            <span className="text-teal-700 text-[9px] font-bold tracking-wider">BYE</span>
          </div>
          <div className="w-0.5 h-[25px] bg-teal-400"></div>
        </div>
      </div>
    );
  }

  // ── Normal bracket
  return (
    <div className="flex items-center gap-3 mt-10 ml-6">
      <div className={`w-[260px] transition-all duration-300 rounded-sm shadow-md ${
        status === "live" ? "ring-2 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.35)]" : ""
      }`}>

        {/* Team 1 */}
        <div className={`flex items-center h-[50px] transition-all duration-200 skew-x-24 rounded-t-sm border-2 ${
          team1Result === "W"
            ? "bg-emerald-50 border-emerald-500 shadow-sm"
            : team1Result === "L"
            ? "bg-slate-50 border-slate-200 opacity-60"
            : "bg-white border-slate-300 hover:border-teal-500"
        }`}>
          <span className="text-[11px] font-extrabold bg-slate-100 text-teal-700 border border-slate-300 px-2 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
          <span className={`flex-1 px-3 text-[15px] font-bold tracking-wide truncate -skew-x-24 ${team1Result === "W" ? "text-emerald-950 font-black" : "text-slate-900"}`}>{team1}</span>
          <span className={`mr-4 px-2.5 py-0.5 text-[12px] font-extrabold rounded -skew-x-24 ${
            team1Result === "W"
              ? "text-emerald-700 bg-emerald-100 border border-emerald-400"
              : team1Result === "L"
              ? "text-rose-600 bg-rose-50 border border-rose-300"
              : "text-slate-400"
          }`}>
            {team1Result ?? "—"}
          </span>
        </div>

        {/* VS Badge */}
        <div className="flex items-center justify-center my-0.5 relative z-10">
          <span className="text-[10px] font-extrabold tracking-widest text-slate-700 bg-white px-3 py-0.5 rounded-full border border-slate-300 shadow-sm">
            VS
          </span>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center h-[50px] transition-all duration-200 -skew-x-24 rounded-b-sm border-2 ${
          team2Result === "W"
            ? "bg-emerald-50 border-emerald-500 shadow-sm"
            : team2Result === "L"
            ? "bg-slate-50 border-slate-200 opacity-60"
            : "bg-white border-slate-300 hover:border-teal-500"
        }`}>
          <span className="text-[11px] font-extrabold bg-slate-100 text-teal-700 border border-slate-300 px-2 py-0.5 rounded ml-3 tracking-wider skew-x-24">2</span>
          <span className={`flex-1 px-3 text-[15px] font-bold tracking-wide truncate skew-x-24 ${team2Result === "W" ? "text-emerald-950 font-black" : "text-slate-900"}`}>{team2}</span>
          <span className={`mr-4 px-2.5 py-0.5 text-[12px] font-extrabold rounded skew-x-24 ${
            team2Result === "W"
              ? "text-emerald-700 bg-emerald-100 border border-emerald-400"
              : team2Result === "L"
              ? "text-rose-600 bg-rose-50 border border-rose-300"
              : "text-slate-400"
          }`}>
            {team2Result ?? "—"}
          </span>
        </div>
      </div>

      {/* Connector + Info */}
      <div id={id} className="flex flex-col items-center relative">
        <div className="w-0.5 h-[25px] bg-teal-400"></div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          title="Match Details & Controls"
          className="w-[28px] h-[28px] rounded-full bg-white border-2 border-teal-500 text-teal-700 text-[13px] font-extrabold hover:bg-teal-600 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center">
          i
        </button>
        <div className="w-0.5 h-[25px] bg-teal-400"></div>

        {/* Info Box Popover */}
        {showInfo && (
          <div className="absolute left-9 top-1/2 -translate-y-1/2 w-[240px] bg-white border-2 border-teal-500 rounded-md p-4 z-30 text-[13px] shadow-xl text-slate-800">

            {/* Header */}
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <p className="text-teal-700 font-bold tracking-wider text-[12px] uppercase">Match Info</p>
              <span className={`text-[10px] tracking-widest px-2 py-0.5 rounded font-black ${
                status === "live"      ? "bg-amber-100 text-amber-800 border border-amber-400 animate-pulse" :
                status === "completed" ? "bg-slate-100 text-slate-700 border border-slate-300" :
                                         "bg-teal-50 text-teal-700 border border-teal-300"
              }`}>
                {status === "live" ? "● LIVE" : status === "completed" ? "DONE" : "PENDING"}
              </span>
            </div>

            {/* Details */}
            <div className="flex justify-between mb-1.5 text-slate-600">
              <span className="text-slate-500">Game:</span>
              <span className="text-slate-900 font-semibold">Clash Royale 1v1</span>
            </div>
            <div className="flex justify-between mb-1.5 text-slate-600">
              <span className="text-slate-500">Score:</span>
              <span className="text-teal-700 font-mono font-bold">
                {team1Result ? (team1Result === "W" ? "2 — 1" : "1 — 2") : "— — —"}
              </span>
            </div>
            <div className="flex justify-between mb-3 text-slate-600">
              <span className="text-slate-500">Winner:</span>
              <span className={`font-bold ${
                team1Result === "W" ? "text-emerald-700" :
                team2Result === "W" ? "text-emerald-700" : "text-slate-400"
              }`}>
                {team1Result === "W" ? `${team1}` :
                 team2Result === "W" ? `${team2}` : "Pending"}
              </span>
            </div>

            {/* Start button */}
            {status === "pending" && onStart && (
              <>
                <div className="border-t border-slate-200 mb-3" />
                <button
                  onClick={() => { if (matchId) onStart(matchId); setShowInfo(false); }}
                  className="w-full py-1.5 rounded-sm text-[11px] font-bold tracking-widest
                    bg-teal-600 text-white border border-teal-400
                    hover:bg-teal-500 shadow-sm
                    transition-all duration-200 cursor-pointer">
                  ▶ START MATCH
                </button>
              </>
            )}

            {/* Live indicator & instant winner advance */}
            {status === "live" && (
              <>
                <div className="border-t border-slate-200 mb-2.5" />
                <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-[10px] tracking-widest mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  POLLING BATTLE LOG
                </div>
                {onDeclareWinner && (
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        if (matchId && player1_tag) onDeclareWinner(matchId, player1_tag);
                        setShowInfo(false);
                      }}
                      className="flex-1 py-1 px-1 rounded-sm text-[10px] font-bold bg-emerald-600 border border-emerald-400 text-white hover:bg-emerald-500 transition-colors truncate shadow-sm cursor-pointer">
                      {team1} Won
                    </button>
                    {player2_tag && (
                      <button
                        onClick={() => {
                          if (matchId && player2_tag) onDeclareWinner(matchId, player2_tag);
                          setShowInfo(false);
                        }}
                        className="flex-1 py-1 px-1 rounded-sm text-[10px] font-bold bg-emerald-600 border border-emerald-400 text-white hover:bg-emerald-500 transition-colors truncate shadow-sm cursor-pointer">
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
                <div className="border-t border-slate-200 mb-3" />
                <div className="flex items-center justify-center gap-2 text-amber-900 bg-amber-50 border border-amber-300 py-1 rounded text-[11px] font-bold tracking-wider">
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