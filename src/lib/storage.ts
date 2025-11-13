// Local storage utilities for tournament data

import { Match } from "./tournament";

const MATCHES_KEY = "legends_league_matches";
const THEME_KEY = "legends_league_theme";

export function saveMatches(matches: Match[]): void {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

export function loadMatches(): Match[] | null {
  const data = localStorage.getItem(MATCHES_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearMatches(): void {
  localStorage.removeItem(MATCHES_KEY);
}

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme(): "light" | "dark" | null {
  return localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
}
