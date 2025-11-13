import { useTournament } from "@/contexts/TournamentContext";
import { TEAMS } from "@/lib/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "@/components/TeamBadge";
import { Calendar, Trophy } from "lucide-react";

export default function MatchResults() {
  const { matches } = useTournament();
  const completedMatches = matches.filter((m) => m.winner || m.isNoResult);
  const upcomingMatches = matches.filter((m) => !m.winner && !m.isNoResult);

  const getTeamName = (teamId: string) =>
    TEAMS.find((t) => t.id === teamId)?.name || teamId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Match Results</h1>
          <p className="text-muted-foreground">
            {completedMatches.length} completed, {upcomingMatches.length}{" "}
            upcoming
          </p>
        </div>
      </div>

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Completed Matches</h2>
          <div className="grid gap-4">
            {completedMatches.map((match) => {
              const teamAName = getTeamName(match.teamA);
              const teamBName = getTeamName(match.teamB);

              return (
                <Card key={match.id} className="card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Match {match.matchNumber}
                      </CardTitle>
                      {match.isWalkover && (
                        <Badge variant="outline" className="bg-warning/10">
                          Walkover
                        </Badge>
                      )}
                      {match.isNoResult && (
                        <Badge variant="outline" className="bg-muted">
                          No Result
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Team A */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          match.winner === match.teamA
                            ? "bg-success/10"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TeamBadge teamId={match.teamA} />
                          <div>
                            <div className="font-semibold">{teamAName}</div>
                            {match.teamAScore && !match.isWalkover && (
                              <div className="text-sm text-muted-foreground">
                                {match.teamAScore.runs}/{match.teamAScore.wickets}{" "}
                                ({match.teamAScore.overs} ov)
                              </div>
                            )}
                          </div>
                        </div>
                        {match.winner === match.teamA && (
                          <Trophy className="h-5 w-5 text-warning" />
                        )}
                      </div>

                      {/* Team B */}
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          match.winner === match.teamB
                            ? "bg-success/10"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TeamBadge teamId={match.teamB} />
                          <div>
                            <div className="font-semibold">{teamBName}</div>
                            {match.teamBScore && !match.isWalkover && (
                              <div className="text-sm text-muted-foreground">
                                {match.teamBScore.runs}/{match.teamBScore.wickets}{" "}
                                ({match.teamBScore.overs} ov)
                              </div>
                            )}
                          </div>
                        </div>
                        {match.winner === match.teamB && (
                          <Trophy className="h-5 w-5 text-warning" />
                        )}
                      </div>

                      {/* Result Summary */}
                      {match.winner && !match.isNoResult && (
                        <div className="text-center text-sm font-medium text-muted-foreground pt-2">
                          {getTeamName(match.winner)} won
                          {match.isWalkover ? " by walkover" : ""}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Upcoming Matches</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.slice(0, 12).map((match) => (
              <Card key={match.id} className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Match {match.matchNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TeamBadge teamId={match.teamA} size="sm" />
                      <span className="text-sm font-medium truncate">
                        {getTeamName(match.teamA)}
                      </span>
                    </div>
                    <div className="text-center text-xs text-muted-foreground">
                      vs
                    </div>
                    <div className="flex items-center gap-2">
                      <TeamBadge teamId={match.teamB} size="sm" />
                      <span className="text-sm font-medium truncate">
                        {getTeamName(match.teamB)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {upcomingMatches.length > 12 && (
            <p className="text-sm text-muted-foreground text-center">
              +{upcomingMatches.length - 12} more matches
            </p>
          )}
        </div>
      )}
    </div>
  );
}
