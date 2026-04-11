export function parseBattleResult(battle: any) {
  // guard — if data not ready return null
  if (!battle || !battle.team || !battle.opponent) return null;

  const team = battle.team[0];
  const opponent = battle.opponent[0];

  if (!team || !opponent) return null;

  const teamWon = team.crowns > opponent.crowns;

  return {
    matchType: battle.gameMode?.name ?? "Unknown",
    winner: teamWon ? team.name : opponent.name,
    loser: teamWon ? opponent.name : team.name,
    score: `${team.crowns} - ${opponent.crowns}`,
    battleEndTime: battle.battleTime,
  };
}