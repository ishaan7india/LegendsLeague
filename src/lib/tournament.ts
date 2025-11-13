// Tournament data types and utilities

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export interface Match {
  id: string;
  matchNumber: number;
  teamA: string;
  teamB: string;
  teamAScore?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  teamBScore?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  winner?: string;
  isWalkover: boolean;
  isNoResult: boolean;
  date?: string;
}

export interface TeamStats {
  teamId: string;
  matches: number;
  wins: number;
  losses: number;
  noResults: number;
  points: number;
  nrr: number;
  runsScored: number;
  runsAgainst: number;
  oversFaced: number;
  oversBowled: number;
}

export const TEAMS: Team[] = [
  { id: "CSK", name: "Chennai Super Kings", shortName: "CSK" },
  { id: "DC", name: "Delhi Capitals", shortName: "DC" },
  { id: "GT", name: "Gujarat Titans", shortName: "GT" },
  { id: "KKR", name: "Kolkata Knight Riders", shortName: "KKR" },
  { id: "LSG", name: "Lucknow Super Giants", shortName: "LSG" },
  { id: "MI", name: "Mumbai Indians", shortName: "MI" },
  { id: "PBKS", name: "Punjab Kings", shortName: "PBKS" },
  { id: "RR", name: "Rajasthan Royals", shortName: "RR" },
  { id: "RCB", name: "Royal Challengers Bangalore", shortName: "RCB" },
  { id: "SRH", name: "Sunrisers Hyderabad", shortName: "SRH" },
];

// Generate all matches for single round-robin (45 matches)
export function generateRoundRobinSchedule(): Match[] {
  const matches: Match[] = [];
  let matchNumber = 1;

  for (let i = 0; i < TEAMS.length; i++) {
    for (let j = i + 1; j < TEAMS.length; j++) {
      matches.push({
        id: `match-${matchNumber}`,
        matchNumber,
        teamA: TEAMS[i].id,
        teamB: TEAMS[j].id,
        isWalkover: false,
        isNoResult: false,
      });
      matchNumber++;
    }
  }

  return matches;
}

// Convert cricket overs (X.Y where Y is balls 0-5) to decimal overs
export function oversToDecimal(overs: number): number {
  const completeOvers = Math.floor(overs);
  const balls = Math.round((overs - completeOvers) * 10);
  return completeOvers + balls / 6;
}

// Calculate NRR for a team
export function calculateNRR(
  runsScored: number,
  oversFaced: number,
  runsAgainst: number,
  oversBowled: number
): number {
  if (oversFaced === 0 || oversBowled === 0) return 0;
  const runRate = runsScored / oversFaced;
  const againstRate = runsAgainst / oversBowled;
  return runRate - againstRate;
}

// Calculate team statistics from matches
export function calculateTeamStats(matches: Match[]): TeamStats[] {
  const stats: Map<string, TeamStats> = new Map();

  // Initialize stats for all teams
  TEAMS.forEach((team) => {
    stats.set(team.id, {
      teamId: team.id,
      matches: 0,
      wins: 0,
      losses: 0,
      noResults: 0,
      points: 0,
      nrr: 0,
      runsScored: 0,
      runsAgainst: 0,
      oversFaced: 0,
      oversBowled: 0,
    });
  });

  // Process each match
  matches.forEach((match) => {
    if (!match.teamAScore || !match.teamBScore) return;

    const teamAStats = stats.get(match.teamA)!;
    const teamBStats = stats.get(match.teamB)!;

    teamAStats.matches++;
    teamBStats.matches++;

    if (match.isNoResult) {
      teamAStats.noResults++;
      teamBStats.noResults++;
      teamAStats.points += 1;
      teamBStats.points += 1;
    } else if (match.isWalkover) {
      if (match.winner === match.teamA) {
        teamAStats.wins++;
        teamAStats.points += 2;
        teamBStats.losses++;
      } else {
        teamBStats.wins++;
        teamBStats.points += 2;
        teamAStats.losses++;
      }
    } else {
      // Normal match - calculate runs and overs
      const teamAOvers = oversToDecimal(match.teamAScore.overs);
      const teamBOvers = oversToDecimal(match.teamBScore.overs);

      // If all out, count as full 20 overs
      const teamAOversFaced =
        match.teamAScore.wickets === 10 ? 20 : teamAOvers;
      const teamBOversFaced =
        match.teamBScore.wickets === 10 ? 20 : teamBOvers;

      teamAStats.runsScored += match.teamAScore.runs;
      teamAStats.oversFaced += teamAOversFaced;
      teamAStats.runsAgainst += match.teamBScore.runs;
      teamAStats.oversBowled += teamBOversFaced;

      teamBStats.runsScored += match.teamBScore.runs;
      teamBStats.oversFaced += teamBOversFaced;
      teamBStats.runsAgainst += match.teamAScore.runs;
      teamBStats.oversBowled += teamAOversFaced;

      // Determine winner
      if (match.teamAScore.runs > match.teamBScore.runs) {
        teamAStats.wins++;
        teamAStats.points += 2;
        teamBStats.losses++;
      } else if (match.teamBScore.runs > match.teamAScore.runs) {
        teamBStats.wins++;
        teamBStats.points += 2;
        teamAStats.losses++;
      } else {
        // Tie
        teamAStats.points += 1;
        teamBStats.points += 1;
      }
    }
  });

  // Calculate NRR for each team
  stats.forEach((teamStats) => {
    teamStats.nrr = calculateNRR(
      teamStats.runsScored,
      teamStats.oversFaced,
      teamStats.runsAgainst,
      teamStats.oversBowled
    );
  });

  // Sort by points, then NRR, then wins
  return Array.from(stats.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (Math.abs(b.nrr - a.nrr) > 0.001) return b.nrr - a.nrr;
    return b.wins - a.wins;
  });
}

// Validate overs input
export function validateOvers(overs: number): boolean {
  const balls = Math.round((overs - Math.floor(overs)) * 10);
  return overs >= 0 && overs <= 20 && balls >= 0 && balls <= 5;
}
