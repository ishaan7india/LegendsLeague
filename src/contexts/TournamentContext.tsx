import React, { createContext, useContext, useState, useEffect } from "react";
import { Match, generateRoundRobinSchedule, generatePlayoffMatches } from "@/lib/tournament";
import { saveMatches, loadMatches, clearMatches } from "@/lib/storage";

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

  useEffect(() => {
    // Load matches from localStorage or generate initial schedule
    const savedMatches = loadMatches();
    if (savedMatches) {
      setMatches(savedMatches);
    } else {
      const roundRobinMatches = generateRoundRobinSchedule();
      const playoffMatches = generatePlayoffMatches();
      const initialMatches = [...roundRobinMatches, ...playoffMatches];
      setMatches(initialMatches);
      saveMatches(initialMatches);
    }
  }, []);

  const updateMatch = (updatedMatch: Match) => {
    const newMatches = matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    );
    setMatches(newMatches);
    saveMatches(newMatches);
  };

  const deleteMatch = (matchId: string) => {
    const newMatches = matches.filter((m) => m.id !== matchId);
    setMatches(newMatches);
    saveMatches(newMatches);
  };

  const resetTournament = () => {
    clearMatches();
    const roundRobinMatches = generateRoundRobinSchedule();
    const playoffMatches = generatePlayoffMatches();
    const initialMatches = [...roundRobinMatches, ...playoffMatches];
    setMatches(initialMatches);
    saveMatches(initialMatches);
  };

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
