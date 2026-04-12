"use client";
import Bracket from "./bracket";
import Xarrow from "react-xarrows";

interface StandardBracketProps {
  participants: number; // must be 2^n
}

export default function StandardBracket({ participants }: StandardBracketProps) {
  const CARD_W = 220;
  const COL_GAP = 140;
  const COL_W = CARD_W + COL_GAP;
  const SLOT_H = 150;

  const totalRounds = Math.log2(participants); // e.g. 8 → 3, 16 → 4, 32 → 5

  const getRoundLabel = (roundIndex: number) => {
    const fromEnd = totalRounds - 1 - roundIndex;
    if (fromEnd === 0) return "Final";
    if (fromEnd === 1) return "Semi Finals";
    if (fromEnd === 2) return "Quarter Finals";
    return `Round of ${participants / Math.pow(2, roundIndex)}`;
  };

  const getPos = (round: number, index: number) => {
    const x = round * COL_W;
    const slotH = SLOT_H * Math.pow(2, round);
    const y = index * slotH + (slotH / 2 - 95 / 2);
    return { x, y };
  };

  // Generate all matches
  const matches: Array<{ round: number; index: number }> = [];
  for (let round = 0; round < totalRounds; round++) {
    const matchCount = participants / Math.pow(2, round + 1);
    for (let index = 0; index < matchCount; index++) {
      matches.push({ round, index });
    }
  }

  // Generate all connections
  const connections: Array<{ from: string; to: string }> = [];
  for (let round = 0; round < totalRounds - 1; round++) {
    const matchCount = participants / Math.pow(2, round + 1);
    for (let i = 0; i < matchCount; i++) {
      connections.push({
        from: `i-r${round}m${i}`,
        to:   `i-r${round + 1}m${Math.floor(i / 2)}`,
      });
    }
  }

  const totalH = SLOT_H * (participants / 2) + 60;
  const totalW = COL_W * totalRounds + 60;
  const minWidth = Math.max(750, totalRounds * 300);

  return (
    <div>
      <div style={{ overflowX: "auto", paddingBottom: 24 }}>
        <div style={{ position: "relative", width: totalW, height: totalH, minWidth }}>

          {/* Round labels */}
          {Array.from({ length: totalRounds }, (_, round) => {
            const { x } = getPos(round, 0);
            return (
              <div key={round} style={{
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
                {getRoundLabel(round)}
              </div>
            );
          })}

          {/* Matches */}
          {matches.map(({ round, index }) => {
            const { x, y } = getPos(round, index);
            const id = `r${round}m${index}`;
            return (
              <div key={id} style={{ position: "absolute", left: x, top: y + 24 }}>
                <div id={`i-${id}`} style={{ display: "inline-block" }}>
                  <Bracket id={`i-${id}-info`} />
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
    </div>
  );
}