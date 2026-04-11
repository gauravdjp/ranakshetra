"use client";
import { useState } from "react";

export default function Bracket() {
  const [showInfo, setShowInfo] = useState(false);
  const [team1Result, setTeam1Result] = useState<"W" | "L" | null>(null);
  const [team2Result, setTeam2Result] = useState<"W" | "L" | null>(null);
  const [locked, setLocked] = useState(false);

  const handleResult = (team: 1 | 2, result: "W" | "L") => {
    if (locked) return;

    if (team === 1) {
      setTeam1Result(result);
      setTeam2Result(result === "W" ? "L" : "W"); // auto set team 2
    } else {
      setTeam2Result(result);
      setTeam1Result(result === "W" ? "L" : "W"); // auto set team 1
    }

    setLocked(true); // lock all 4 buttons
  };

  return (
    <div className="flex items-center gap-3 mt-10 ml-10">

      <div className="w-[220px]">

        {/* Team 1 */}
        <div className="flex items-center h-[42px] bg-[#0f1e36] border border-[#1a4a7a] hover:border-cyan-400 transition-colors duration-200 skew-x-24">
          <span className="text-[10px] bg-[#1a4a7a] text-sky-300 px-1.5 py-0.5 rounded ml-3 tracking-wider -skew-x-24">1</span>
          <span className="flex-1 px-2 text-[13px] text-sky-100 tracking-wide truncate -skew-x-24">TeamAlpha</span>
          <button
            onClick={() => handleResult(1, "W")}
            disabled={locked}
            className={`mr-1 w-7 h-full text-[11px] transition-colors -skew-x-24
              ${locked ? "cursor-not-allowed opacity-60" : "hover:bg-green-900 cursor-pointer"}
              ${team1Result === "W" ? "text-green-400 bg-green-900" : "text-green-400"}`}>W</button>
          <button
            onClick={() => handleResult(1, "L")}
            disabled={locked}
            className={`mr-4 w-7 h-full text-[11px] transition-colors -skew-x-24
              ${locked ? "cursor-not-allowed opacity-60" : "hover:bg-red-900 cursor-pointer"}
              ${team1Result === "L" ? "text-red-400 bg-red-900" : "text-red-400"}`}>L</button>
        </div>

        <p className="text-center text-[9px] text-slate-600 tracking-widest py-0.5">VS</p>

        {/* Team 2 */}
        <div className="flex items-center h-[42px] bg-[#0f1e36] border border-[#1a4a7a] hover:border-cyan-400 transition-colors duration-200 -skew-x-24">
          <span className="text-[10px] bg-[#1a4a7a] text-sky-300 px-1.5 py-0.5 rounded ml-3 tracking-wider skew-x-24">2</span>
          <span className="flex-1 px-2 text-[13px] text-sky-100 tracking-wide truncate skew-x-24">TeamOmega</span>
          <button
            onClick={() => handleResult(2, "W")}
            disabled={locked}
            className={`mr-1 w-7 h-full text-[11px] transition-colors skew-x-24
              ${locked ? "cursor-not-allowed opacity-60" : "hover:bg-green-900 cursor-pointer"}
              ${team2Result === "W" ? "text-green-400 bg-green-900" : "text-green-400"}`}>W</button>
          <button
            onClick={() => handleResult(2, "L")}
            disabled={locked}
            className={`mr-4 w-7 h-full text-[11px] transition-colors skew-x-24
              ${locked ? "cursor-not-allowed opacity-60" : "hover:bg-red-900 cursor-pointer"}
              ${team2Result === "L" ? "text-red-400 bg-red-900" : "text-red-400"}`}>L</button>
        </div>

      </div>

      {/* Connector + Info */}
      <div className="flex flex-col items-center relative">
        <div className="w-px h-[21px] bg-[#1a4a7a]"></div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-[22px] h-[22px] rounded-full bg-[#0f1e36] border border-[#1a4a7a] text-sky-300 text-[11px] hover:bg-cyan-400 hover:text-[#0f1e36] transition-all">i</button>
        <div className="w-px h-[21px] bg-[#1a4a7a]"></div>

        {/* Info Box */}
        {showInfo && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[160px] bg-[#0f1e36] border border-[#1a4a7a] rounded-md p-3 z-10 text-[12px]">
            <p className="text-sky-400 font-medium mb-2 tracking-wide text-[11px]">Match Info</p>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Mode</span>
              <span className="text-sky-100">Ladder</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Arena</span>
              <span className="text-sky-100">Bone Pit</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Score</span>
              <span className="text-sky-100">3 - 0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Result</span>
              <span className={team1Result ? (team1Result === "W" ? "text-green-400" : "text-red-400") : "text-slate-500"}>
                {team1Result ? `Team1 ${team1Result}` : "Pending"}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}