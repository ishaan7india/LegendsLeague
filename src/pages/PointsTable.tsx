import { useTournament } from "@/contexts/TournamentContext";
import { calculateTeamStats, TEAMS } from "@/lib/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamBadge } from "@/components/TeamBadge";
import { Trophy } from "lucide-react";

export default function PointsTable() {
  const { matches } = useTournament();
  const stats = calculateTeamStats(matches);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Points Table</h1>
          <p className="text-muted-foreground">Current tournament standings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Mat</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">NR</TableHead>
                  <TableHead className="text-center font-bold">Pts</TableHead>
                  <TableHead className="text-center">NRR</TableHead>
                  <TableHead className="text-right">For</TableHead>
                  <TableHead className="text-right">Against</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((teamStats, index) => {
                  const team = TEAMS.find((t) => t.id === teamStats.teamId);
                  const isTopThree = index < 4;

                  return (
                    <TableRow
                      key={teamStats.teamId}
                      className={isTopThree ? "bg-success/5" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && (
                            <Trophy className="h-4 w-4 text-warning" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TeamBadge teamId={teamStats.teamId} size="sm" />
                          <span className="font-medium">{team?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {teamStats.matches}
                      </TableCell>
                      <TableCell className="text-center">
                        {teamStats.wins}
                      </TableCell>
                      <TableCell className="text-center">
                        {teamStats.losses}
                      </TableCell>
                      <TableCell className="text-center">
                        {teamStats.noResults}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {teamStats.points}
                      </TableCell>
                      <TableCell
                        className={`text-center font-medium ${
                          teamStats.nrr > 0
                            ? "text-success"
                            : teamStats.nrr < 0
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {teamStats.nrr >= 0 ? "+" : ""}
                        {teamStats.nrr.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {teamStats.runsScored}/{teamStats.oversFaced.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {teamStats.runsAgainst}/
                        {teamStats.oversBowled.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Mat:</span> Matches Played
              </p>
              <p>
                <span className="font-semibold">W:</span> Wins
              </p>
              <p>
                <span className="font-semibold">L:</span> Losses
              </p>
              <p>
                <span className="font-semibold">NR:</span> No Results
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Pts:</span> Points
              </p>
              <p>
                <span className="font-semibold">NRR:</span> Net Run Rate
              </p>
              <p>
                <span className="font-semibold">For:</span> Runs Scored/Overs Faced
              </p>
              <p>
                <span className="font-semibold">Against:</span> Runs Conceded/Overs Bowled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
