import React, { createContext, useContext, useState, useEffect } from "react";
import { Match, generateRoundRobinSchedule, generatePlayoffMatches } from "@/lib/tournament";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TournamentContextType {
  matches: Match[];
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;
  resetTournament: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(
  undefined
);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load matches from database
  useEffect(() => {
    loadMatchesFromDB();
  }, []);

  const loadMatchesFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_number", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert database format to Match format
        const loadedMatches: Match[] = data.map((m) => ({
          id: m.id,
          matchNumber: m.match_number,
          teamA: m.team_a,
          teamB: m.team_b,
          teamAScore: m.team_a_runs !== null ? {
            runs: m.team_a_runs,
            wickets: m.team_a_wickets,
            overs: m.team_a_overs,
          } : undefined,
          teamBScore: m.team_b_runs !== null ? {
            runs: m.team_b_runs,
            wickets: m.team_b_wickets,
            overs: m.team_b_overs,
          } : undefined,
          winner: m.winner || undefined,
          isWalkover: m.is_walkover,
          isNoResult: m.is_no_result,
          isPlayoff: m.is_playoff,
          playoffType: m.playoff_type as Match["playoffType"],
        }));
        setMatches(loadedMatches);
      } else {
        // No data in database, initialize with default schedule
        await initializeSchedule();
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      toast({
        title: "Error",
        description: "Failed to load tournament data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeSchedule = async () => {
    const roundRobinMatches = generateRoundRobinSchedule();
    const playoffMatches = generatePlayoffMatches();
    const initialMatches = [...roundRobinMatches, ...playoffMatches];

    // Save to database
    const dbMatches = initialMatches.map((m) => ({
      id: m.id,
      match_number: m.matchNumber,
      team_a: m.teamA,
      team_b: m.teamB,
      team_a_runs: m.teamAScore?.runs || null,
      team_a_wickets: m.teamAScore?.wickets || null,
      team_a_overs: m.teamAScore?.overs || null,
      team_b_runs: m.teamBScore?.runs || null,
      team_b_wickets: m.teamBScore?.wickets || null,
      team_b_overs: m.teamBScore?.overs || null,
      winner: m.winner || null,
      is_walkover: m.isWalkover,
      is_no_result: m.isNoResult,
      is_playoff: m.isPlayoff,
      playoff_type: m.playoffType || null,
    }));

    const { error } = await supabase.from("matches").insert(dbMatches);

    if (error) {
      console.error("Error initializing schedule:", error);
      toast({
        title: "Error",
        description: "Failed to initialize tournament schedule.",
        variant: "destructive",
      });
    } else {
      setMatches(initialMatches);
    }
  };

  const updateMatch = async (updatedMatch: Match) => {
    try {
      const dbMatch = {
        match_number: updatedMatch.matchNumber,
        team_a: updatedMatch.teamA,
        team_b: updatedMatch.teamB,
        team_a_runs: updatedMatch.teamAScore?.runs || null,
        team_a_wickets: updatedMatch.teamAScore?.wickets || null,
        team_a_overs: updatedMatch.teamAScore?.overs || null,
        team_b_runs: updatedMatch.teamBScore?.runs || null,
        team_b_wickets: updatedMatch.teamBScore?.wickets || null,
        team_b_overs: updatedMatch.teamBScore?.overs || null,
        winner: updatedMatch.winner || null,
        is_walkover: updatedMatch.isWalkover,
        is_no_result: updatedMatch.isNoResult,
        is_playoff: updatedMatch.isPlayoff,
        playoff_type: updatedMatch.playoffType || null,
      };

      const { error } = await supabase
        .from("matches")
        .update(dbMatch)
        .eq("id", updatedMatch.id);

      if (error) throw error;

      const newMatches = matches.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m
      );
      setMatches(newMatches);

      toast({
        title: "Success",
        description: "Match updated successfully.",
      });
    } catch (error) {
      console.error("Error updating match:", error);
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);

      if (error) throw error;

      const newMatches = matches.filter((m) => m.id !== matchId);
      setMatches(newMatches);

      toast({
        title: "Success",
        description: "Match deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        title: "Error",
        description: "Failed to delete match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetTournament = async () => {
    try {
      // Delete all existing matches
      const { error: deleteError } = await supabase
        .from("matches")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) throw deleteError;

      // Initialize new schedule
      await initializeSchedule();

      toast({
        title: "Success",
        description: "Tournament has been reset.",
      });
    } catch (error) {
      console.error("Error resetting tournament:", error);
      toast({
        title: "Error",
        description: "Failed to reset tournament. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <TournamentContext.Provider
      value={{ matches, updateMatch, deleteMatch, resetTournament }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
}
