"use client";
import Bracket from "./bracket";
import Xarrow from "react-xarrows";
import { BracketMatch } from "@/types/index";

interface StandardBracketProps {
  matches: BracketMatch[];
  onStart: (matchId: string) => void;
  currentPlayerTag?: string;
}

export default function StandardBracket({ matches, onStart, currentPlayerTag }: StandardBracketProps) {
  const CARD_W = 220, COL_GAP = 140, COL_W = CARD_W + COL_GAP, SLOT_H = 150;

  const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) + 1 : 0;
  const round0Count = matches.filter(m => m.round === 0).length;

  const getRoundLabel = (round: number) => {
    const fromEnd = totalRounds - 1 - round;
    if (fromEnd === 0) return "Final";
    if (fromEnd === 1) return "Semi Finals";
    if (fromEnd === 2) return "Quarter Finals";
    return `Round of ${round0Count * 2 / Math.pow(2, round)}`;
  };

  const getPos = (round: number, index: number) => {
    const x = round * COL_W;
    const slotH = SLOT_H * Math.pow(2, round);
    const y = index * slotH + (slotH / 2 - 95 / 2);
    return { x, y };
  };

  // Connections: each match feeds into the next round match
  const connections = matches
    .filter(m => m.round < totalRounds - 1)
    .map(m => ({
      from: `i-${m.matchId}`,
      to:   `i-r${m.round + 1}m${Math.floor(m.index / 2)}`,
    }));

  const totalH = SLOT_H * round0Count * 2 + 60;
  const totalW = COL_W * totalRounds + 60;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 24 }}>
      <div style={{ position: "relative", width: totalW, height: totalH, minWidth: Math.max(750, totalRounds * 300) }}>

        {/* Round labels */}
        {Array.from({ length: totalRounds }, (_, round) => {
          const { x } = getPos(round, 0);
          return (
            <div key={round} style={{
              position: "absolute", left: x, top: 0, width: CARD_W,
              textAlign: "center", fontFamily: "Rajdhani, sans-serif",
              fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(139,92,246,0.5)",
            }}>
              {getRoundLabel(round)}
            </div>
          );
        })}

        {/* Matches */}
        {matches.map((match) => {
          const { x, y } = getPos(match.round, match.index);
          // Only show Start button to the players involved in this match
          const isMyMatch = !!currentPlayerTag && (
            match.player1.tag === currentPlayerTag ||
            match.player2?.tag === currentPlayerTag
          );

          return (
            <div key={match.matchId} style={{ position: "absolute", left: x, top: y + 24 }}>
              <div id={`i-${match.matchId}`} style={{ display: "inline-block" }}>
                <Bracket
                  id={`i-${match.matchId}-info`}
                  isBye={match.isBye}
                  team1={match.player1.name}
                  team2={match.player2?.name ?? "TBD"}
                  matchId={match.matchId}
                  status={match.status}
                  winner_tag={match.winner_tag}
                  player1_tag={match.player1.tag}
                  player2_tag={match.player2?.tag}
                  onStart={isMyMatch && match.status === "pending" ? onStart : undefined}
                />
              </div>
            </div>
          );
        })}

        {/* Connector arrows */}
        {connections.map(({ from, to }) => (
          <Xarrow
            key={`${from}-${to}`}
            start={from}
            end={to}
            color="rgba(139,92,246,0.5)"
            strokeWidth={1.5}
            headSize={0}
            path="grid"
            gridBreak="50%"
            startAnchor={{ position: "right", offset: { x: 0,  y: 20 } }}
            endAnchor={{   position: "left",  offset: { x: 30, y: 20 } }}
          />
        ))}
      </div>
    </div>
  );
}