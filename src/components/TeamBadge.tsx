import { TEAMS } from "@/lib/tournament";

interface TeamBadgeProps {
  teamId: string;
  size?: "sm" | "md" | "lg";
}

export function TeamBadge({ teamId, size = "md" }: TeamBadgeProps) {
  const team = TEAMS.find((t) => t.id === teamId);
  if (!team) return null;

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const initials = team.shortName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  return (
    <div
      className={`${sizeClasses[size]} cricket-gradient flex items-center justify-center rounded-full font-bold text-white shadow-sm`}
      title={team.name}
    >
      {initials}
    </div>
  );
}
