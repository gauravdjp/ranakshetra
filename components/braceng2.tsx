"use client";
import Bracket from "@/components/bracket";
import Xarrow from "react-xarrows";

interface ByeBracketProps {
  participants: number;
}

function calculateRounds(participants: number) {
  const rounds: Array<{ teams: number; matches: number; byes: number }> = [];
  let teams = participants;
  while (teams > 1) {
    if (teams % 2 === 0) {
      rounds.push({ teams, matches: teams / 2, byes: 0 });
      teams = teams / 2;
    } else {
      rounds.push({ teams, matches: Math.floor(teams / 2), byes: 1 });
      teams = Math.floor(teams / 2) + 1;
    }
  }
  return rounds;
}

export default function ByeBracket({ participants }: ByeBracketProps) {
  const CARD_W = 220;
  const COL_GAP = 140;
  const COL_W = CARD_W + COL_GAP;
  const SLOT_H = 150;

  const rounds = calculateRounds(participants);
  const totalRounds = rounds.length;

  // max matches in round 0 determines height
  const maxMatches = Math.ceil(participants / 2);

  const getPos = (roundIndex: number, slotIndex: number) => {
    const x = roundIndex * COL_W;

    // slot height doubles each round just like standard bracket
    const slotH = SLOT_H * Math.pow(2, roundIndex);
    const y = slotIndex * slotH + (slotH / 2 - 95 / 2);
    return { x, y };
  };

  // Build matches per round — bye slot always last
  const allMatches: Array<{ roundIndex: number; slotIndex: number; isBye: boolean }> = [];

  rounds.forEach((round, roundIndex) => {
    for (let i = 0; i < round.matches; i++) {
      allMatches.push({ roundIndex, slotIndex: i, isBye: false });
    }
    if (round.byes > 0) {
      // bye slot goes right after the last match
      allMatches.push({ roundIndex, slotIndex: round.matches, isBye: true });
    }
  });

  // Build connections — bye slot connects same as a normal match winner
  const connections: Array<{ from: string; to: string }> = [];

  rounds.forEach((round, roundIndex) => {
    if (roundIndex >= totalRounds - 1) return;
    const totalSlots = round.matches + round.byes; // matches + possible bye
    for (let i = 0; i < totalSlots; i++) {
      connections.push({
        from: `i-b-r${roundIndex}m${i}`,
        to:   `i-b-r${roundIndex + 1}m${Math.floor(i / 2)}`,
      });
    }
  });

  const totalH = SLOT_H * maxMatches * 2 + 60;
  const totalW = COL_W * totalRounds + 60;
  const minWidth = Math.max(750, totalRounds * 300);

  return (
    <div style={{ overflowX: "auto", paddingBottom: 24 }}>
      <div style={{ position: "relative", width: totalW, height: totalH, minWidth }}>

        {/* Round labels */}
        {rounds.map((_, roundIndex) => {
          const { x } = getPos(roundIndex, 0);
          return (
            <div key={roundIndex} style={{
              position: "absolute",
              left: x,
              top: 0,
              width: CARD_W,
              textAlign: "center",
              fontFamily: "Rajdhani, sans-serif",
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(139,92,246,0.5)",
            }}>
              Round {roundIndex + 1}
            </div>
          );
        })}

        {/* Matches + Bye cards */}
        {allMatches.map(({ roundIndex, slotIndex, isBye }) => {
          const { x, y } = getPos(roundIndex, slotIndex);
          const id = `b-r${roundIndex}m${slotIndex}`;
          return (
            <div key={id} style={{ position: "absolute", left: x, top: y + 24 }}>
              <div id={`i-${id}`} style={{ display: "inline-block" }}>
                <Bracket id={`i-${id}-info`} isBye={isBye} />
              </div>
            </div>
          );
        })}

        {/* Xarrows */}
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