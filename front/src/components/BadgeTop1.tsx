import { Trophy, Flame, Star, Crown } from "lucide-react";
import React from "react";

export type BadgePreset = "trophy" | "flame" | "star" | "crown";

interface BadgeTop1Props {
  message?: string | null;
  color?: string | null;
  preset?: BadgePreset | null;
  className?: string;
}

const iconMap = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  crown: Crown,
};

export const BadgeTop1: React.FC<BadgeTop1Props> = ({
  message,
  color,
  preset,
  className = "",
}) => {
  const Icon = iconMap[preset || "trophy"];
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-bold shadow flex items-center gap-1 animate-pulse ${className}`}
      style={{
        background: color || "#fde047",
        color: color ? "#222" : "#b45309",
      }}
      title="Top 1 du leaderboard"
    >
      <Icon className="h-4 w-4" />
      {message ? (
        <>
          <span>{message}</span>
          <span className="ml-1 text-[10px] font-semibold opacity-80">
            TOP 1
          </span>
        </>
      ) : (
        <span>TOP 1</span>
      )}
    </span>
  );
};
