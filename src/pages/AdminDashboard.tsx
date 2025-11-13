import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTournament } from "@/contexts/TournamentContext";
import { TEAMS, Match, validateOvers } from "@/lib/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const { matches, updateMatch, resetTournament } = useTournament();
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Form state
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [teamAScore, setTeamAScore] = useState({ runs: "", wickets: "", overs: "" });
  const [teamBScore, setTeamBScore] = useState({ runs: "", wickets: "", overs: "" });
  const [isWalkover, setIsWalkover] = useState(false);
  const [isNoResult, setIsNoResult] = useState(false);
  const [winner, setWinner] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const pendingMatches = matches.filter((m) => !m.winner && !m.isNoResult);
  const completedMatches = matches.filter((m) => m.winner || m.isNoResult);

  const handleMatchSelect = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      setSelectedMatchId(matchId);
      setEditingMatch(match);
      setTeamAScore({
        runs: match.teamAScore?.runs.toString() || "",
        wickets: match.teamAScore?.wickets.toString() || "",
        overs: match.teamAScore?.overs.toString() || "",
      });
      setTeamBScore({
        runs: match.teamBScore?.runs.toString() || "",
        wickets: match.teamBScore?.wickets.toString() || "",
        overs: match.teamBScore?.overs.toString() || "",
      });
      setIsWalkover(match.isWalkover);
      setIsNoResult(match.isNoResult);
      setWinner(match.winner || "");
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedMatchId) {
      newErrors.match = "Please select a match";
    }

    if (isWalkover) {
      if (!winner) {
        newErrors.winner = "Please select a winner for walkover";
      }
    } else if (!isNoResult) {
      // Validate Team A score
      if (!teamAScore.runs) newErrors.teamARuns = "Required";
      if (!teamAScore.wickets) newErrors.teamAWickets = "Required";
      if (!teamAScore.overs) newErrors.teamAOvers = "Required";
      else if (!validateOvers(parseFloat(teamAScore.overs))) {
        newErrors.teamAOvers = "Invalid overs format (e.g., 17.4 where balls 0-5)";
      }

      // Validate Team B score
      if (!teamBScore.runs) newErrors.teamBRuns = "Required";
      if (!teamBScore.wickets) newErrors.teamBWickets = "Required";
      if (!teamBScore.overs) newErrors.teamBOvers = "Required";
      else if (!validateOvers(parseFloat(teamBScore.overs))) {
        newErrors.teamBOvers = "Invalid overs format (e.g., 17.4 where balls 0-5)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !editingMatch) return;

    const updatedMatch: Match = {
      ...editingMatch,
      isWalkover,
      isNoResult,
    };

    if (isWalkover) {
      updatedMatch.winner = winner;
      updatedMatch.teamAScore = undefined;
      updatedMatch.teamBScore = undefined;
    } else if (isNoResult) {
      updatedMatch.winner = undefined;
      updatedMatch.teamAScore = undefined;
      updatedMatch.teamBScore = undefined;
    } else {
      const teamARuns = parseInt(teamAScore.runs);
      const teamBRuns = parseInt(teamBScore.runs);

      updatedMatch.teamAScore = {
        runs: teamARuns,
        wickets: parseInt(teamAScore.wickets),
        overs: parseFloat(teamAScore.overs),
      };
      updatedMatch.teamBScore = {
        runs: teamBRuns,
        wickets: parseInt(teamBScore.wickets),
        overs: parseFloat(teamBScore.overs),
      };

      // Determine winner
      if (teamARuns > teamBRuns) {
        updatedMatch.winner = editingMatch.teamA;
      } else if (teamBRuns > teamARuns) {
        updatedMatch.winner = editingMatch.teamB;
      } else {
        // Tie - both teams get 1 point, no winner
        updatedMatch.winner = undefined;
      }
    }

    updateMatch(updatedMatch);
    toast.success("Match updated successfully");
    resetForm();
  };

  const resetForm = () => {
    setSelectedMatchId("");
    setEditingMatch(null);
    setTeamAScore({ runs: "", wickets: "", overs: "" });
    setTeamBScore({ runs: "", wickets: "", overs: "" });
    setIsWalkover(false);
    setIsNoResult(false);
    setWinner("");
    setErrors({});
  };

  const handleReset = () => {
    resetTournament();
    resetForm();
    toast.success("Tournament reset successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage match results and tournament settings
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Tournament
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Tournament?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all match results and reset the tournament to its initial state. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                Reset Tournament
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMatches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMatches.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Match Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Enter Match Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Selection */}
          <div className="space-y-2">
            <Label>Select Match</Label>
            <Select value={selectedMatchId} onValueChange={handleMatchSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => {
                  const teamA = TEAMS.find((t) => t.id === match.teamA);
                  const teamB = TEAMS.find((t) => t.id === match.teamB);
                  const status = match.winner || match.isNoResult ? " ✓" : "";
                  return (
                    <SelectItem key={match.id} value={match.id}>
                      Match {match.matchNumber}: {teamA?.shortName} vs{" "}
                      {teamB?.shortName}
                      {status}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.match && (
              <p className="text-sm text-destructive">{errors.match}</p>
            )}
          </div>

          {editingMatch && (
            <>
              {/* Match Type Checkboxes */}
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="walkover"
                    checked={isWalkover}
                    onCheckedChange={(checked) => {
                      setIsWalkover(checked as boolean);
                      if (checked) setIsNoResult(false);
                    }}
                  />
                  <Label htmlFor="walkover">Walkover</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noResult"
                    checked={isNoResult}
                    onCheckedChange={(checked) => {
                      setIsNoResult(checked as boolean);
                      if (checked) setIsWalkover(false);
                    }}
                  />
                  <Label htmlFor="noResult">No Result</Label>
                </div>
              </div>

              {isWalkover && (
                <div className="space-y-2">
                  <Label>Winner</Label>
                  <Select value={winner} onValueChange={setWinner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={editingMatch.teamA}>
                        {TEAMS.find((t) => t.id === editingMatch.teamA)?.name}
                      </SelectItem>
                      <SelectItem value={editingMatch.teamB}>
                        {TEAMS.find((t) => t.id === editingMatch.teamB)?.name}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.winner && (
                    <p className="text-sm text-destructive">{errors.winner}</p>
                  )}
                </div>
              )}

              {!isWalkover && !isNoResult && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Team A Score */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      {TEAMS.find((t) => t.id === editingMatch.teamA)?.name}
                    </h3>
                    <div className="space-y-2">
                      <Label>Runs</Label>
                      <Input
                        type="number"
                        value={teamAScore.runs}
                        onChange={(e) =>
                          setTeamAScore({ ...teamAScore, runs: e.target.value })
                        }
                        placeholder="0"
                      />
                      {errors.teamARuns && (
                        <p className="text-sm text-destructive">
                          {errors.teamARuns}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Wickets</Label>
                      <Input
                        type="number"
                        max="10"
                        value={teamAScore.wickets}
                        onChange={(e) =>
                          setTeamAScore({
                            ...teamAScore,
                            wickets: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                      {errors.teamAWickets && (
                        <p className="text-sm text-destructive">
                          {errors.teamAWickets}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Overs (e.g., 17.4)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={teamAScore.overs}
                        onChange={(e) =>
                          setTeamAScore({ ...teamAScore, overs: e.target.value })
                        }
                        placeholder="0.0"
                      />
                      {errors.teamAOvers && (
                        <p className="text-sm text-destructive">
                          {errors.teamAOvers}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Team B Score */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      {TEAMS.find((t) => t.id === editingMatch.teamB)?.name}
                    </h3>
                    <div className="space-y-2">
                      <Label>Runs</Label>
                      <Input
                        type="number"
                        value={teamBScore.runs}
                        onChange={(e) =>
                          setTeamBScore({ ...teamBScore, runs: e.target.value })
                        }
                        placeholder="0"
                      />
                      {errors.teamBRuns && (
                        <p className="text-sm text-destructive">
                          {errors.teamBRuns}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Wickets</Label>
                      <Input
                        type="number"
                        max="10"
                        value={teamBScore.wickets}
                        onChange={(e) =>
                          setTeamBScore({
                            ...teamBScore,
                            wickets: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                      {errors.teamBWickets && (
                        <p className="text-sm text-destructive">
                          {errors.teamBWickets}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Overs (e.g., 17.4)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={teamBScore.overs}
                        onChange={(e) =>
                          setTeamBScore({ ...teamBScore, overs: e.target.value })
                        }
                        placeholder="0.0"
                      />
                      {errors.teamBOvers && (
                        <p className="text-sm text-destructive">
                          {errors.teamBOvers}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1">
                  Save Result
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
