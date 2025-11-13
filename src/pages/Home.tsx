import { useTournament } from "@/contexts/TournamentContext";
import { calculateTeamStats, TEAMS } from "@/lib/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamBadge } from "@/components/TeamBadge";
import { Trophy, Calendar, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { matches } = useTournament();
  const stats = calculateTeamStats(matches);
  const topTeam = stats[0];
  const completedMatches = matches.filter((m) => m.winner || m.isNoResult);
  const upcomingMatches = matches.filter((m) => !m.winner && !m.isNoResult);

  const topTeamName = TEAMS.find((t) => t.id === topTeam.teamId)?.name;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="cricket-gradient rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Legends League</h1>
          </div>
          <p className="text-xl opacity-90 mb-6">
            The ultimate cricket tournament featuring India's top 10 IPL teams competing in a single round-robin format.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/points">
              <Button variant="secondary" size="lg">
                View Points Table
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Match Results
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Single round-robin format
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingMatches.length} matches remaining
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leading Team</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-1">
              <TeamBadge teamId={topTeam.teamId} size="sm" />
              <div className="text-lg font-bold truncate">{topTeamName}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              {topTeam.points} points
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top NRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topTeam.nrr >= 0 ? "+" : ""}
              {topTeam.nrr.toFixed(3)}
            </div>
            <p className="text-xs text-muted-foreground">Net Run Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Single Round-Robin</h4>
              <p className="text-sm text-muted-foreground">
                Each team plays every other team once, totaling 45 matches across the tournament.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Points System</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Win: 2 points</li>
                <li>• Tie/No Result: 1 point each</li>
                <li>• Loss: 0 points</li>
                <li>• Walkover: Winner gets 2 points</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participating Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {TEAMS.map((team) => (
                <div key={team.id} className="flex items-center gap-2">
                  <TeamBadge teamId={team.id} size="sm" />
                  <span className="text-sm font-medium truncate">
                    {team.shortName}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tie-Breaking Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Tie-Breaking Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If teams are tied on points, the following criteria determine their position:
          </p>
          <ol className="text-sm space-y-2 text-muted-foreground">
            <li>1. <span className="font-semibold text-foreground">Net Run Rate (NRR)</span> - Higher is better</li>
            <li>2. <span className="font-semibold text-foreground">Number of Wins</span> - More wins rank higher</li>
            <li>3. <span className="font-semibold text-foreground">Head-to-head</span> - Direct match result (if applicable)</li>
          </ol>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium mb-1">NRR Formula:</p>
            <p className="text-xs text-muted-foreground font-mono">
              (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
