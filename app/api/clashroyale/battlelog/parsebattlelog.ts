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
    battleEndTime: battle.battleTime,
  };
}