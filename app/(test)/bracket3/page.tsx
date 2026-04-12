"use client";
import { useState } from "react";

function calculateRounds(participants: number) {
  const rounds: Array<{ matches: number; byes: number; teams: number }> = [];
  let teams = participants;

  while (teams > 1) {
    if (teams % 2 === 0) {
      // even — all play
      rounds.push({ teams, matches: teams / 2, byes: 0 });
      teams = teams / 2;
    } else {
      // odd — last one gets bye
      rounds.push({ teams, matches: Math.floor(teams / 2), byes: 1 });
      teams = Math.floor(teams / 2) + 1;
    }
  }

  return rounds;
}

export default function BracketEngine() {
  const [count, setCount] = useState(0);
  const [generated, setGenerated] = useState(false);

  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const handleGenerate = () => {
    if (count < 2) return;
    setGenerated(true);
  };

  const rounds = calculateRounds(count);

  return (
    <>
      <h1>Bracket Engine</h1>
      <input
        type="number"
        placeholder="enter no. of participants"
        onChange={(e) => {
          setGenerated(false);
          setCount(Number(e.target.value));
        }}
      />
      <button onClick={handleGenerate}>Generate Bracket</button>

      {generated && (
        <>
          <p>{isPowerOfTwo(count) ? "Standard bracket" : "Bye system"} — {count} participants</p>

          {/* Round breakdown — just for verification */}
          <table border={1} cellPadding={8} style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Round</th>
                <th>Teams</th>
                <th>Matches</th>
                <th>Byes</th>
                <th>Advances</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => (
                <tr key={i}>
                  <td>Round {i + 1}</td>
                  <td>{r.teams}</td>
                  <td>{r.matches}</td>
                  <td>{r.byes}</td>
                  <td>{r.matches + r.byes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}