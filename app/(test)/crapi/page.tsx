"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function BattleLog() {
  const { data, error, isLoading } = useSWR(
    "/api/clashroyale/battlelog?tag=%23220RULVURY",
    fetcher,
    { refreshInterval: 2000 }
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong</p>;

  // 👇 add this temporarily to see what data looks like
  console.log("data:", data);
  console.log("type:", typeof data);
  console.log("isArray:", Array.isArray(data));

  // safely check if it's an array
  const battles = Array.isArray(data) ? data : data?.items ?? data?.battles ?? [];

  return (
    <div>
      {battles.map((battle: any) => (
        <div key={battle.battleEndTime}>
          <p>🏆 Winner: {battle.winner}</p>
          <p>❌ Loser: {battle.loser}</p>
          <p>⚔️ Score: {battle.score}</p>
          <p>🎮 Mode: {battle.matchType}</p>
        </div>
      ))}
    </div>
  );
}