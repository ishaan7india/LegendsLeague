// Local storage utilities for theme preference only
// Tournament data is now stored in the global database

const THEME_KEY = "legends_league_theme";

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme(): "light" | "dark" | null {
  return localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
}
