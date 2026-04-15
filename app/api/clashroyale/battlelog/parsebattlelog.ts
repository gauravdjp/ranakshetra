function parseCRTime(raw: string): string {
  // Already valid ISO (has dashes) — leave it alone
  if (raw.includes("-")) return raw;
  // "20260415T123747.000Z" → "2026-04-15T12:37:47.000Z"
  return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T${raw.slice(9,11)}:${raw.slice(11,13)}:${raw.slice(13)}`;
}

export function parseBattleResult(battle: any) {
  if (!battle || !battle.team || !battle.opponent) return null;

  const team = battle.team[0];
  const opponent = battle.opponent[0];

  if (!team || !opponent) return null;

  const teamWon = team.crowns > opponent.crowns;

  return {
    matchType: battle.gameMode?.name ?? "Unknown",
    winner: teamWon ? team.name : opponent.name,
    winner_tag: teamWon ? team.tag : opponent.tag,   // ← NEW
    loser: teamWon ? opponent.name : team.name,
    loser_tag: teamWon ? opponent.tag : team.tag,    // ← NEW
    team_tag: team.tag,                               // ← NEW
    opponent_tag: opponent.tag,                       // ← NEW
    score: `${team.crowns} - ${opponent.crowns}`,
    battleEndTime: parseCRTime(battle.battleTime),
  };
}