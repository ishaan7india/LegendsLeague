import { Link, useLocation } from "react-router-dom";
import { Trophy, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="cricket-gradient flex h-10 w-10 items-center justify-center rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Legends League</h1>
              <p className="text-xs text-muted-foreground">Cricket Tournament</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/points"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/points") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Points Table
            </Link>
            <Link
              to="/results"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/results") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Match Results
            </Link>
            {isAuthenticated && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/admin") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">{children}</main>

      <footer className="border-t border-border py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Legends League. All rights reserved.
          </p>
          <nav className="flex gap-4 md:hidden">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/points"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Points
            </Link>
            <Link
              to="/results"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Results
            </Link>
            {isAuthenticated && (
              <Link
                to="/admin"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
