import { getFaceitLevelInfo } from "@/types";

export default function FaceitLevelBadge({
  level,
  size = "md",
  showLabel = true,
}: {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const info = getFaceitLevelInfo(level);

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-14 w-14 text-xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-lg border font-bold ${sizeClasses[size]} ${info.color} ${info.bgColor} ${info.borderColor} ${info.hasGlow ? info.glowColor : ""} transition-all duration-300`}
      >
        {level}
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold ${info.color}`}>
          Уровень {level}
        </span>
      )}
    </div>
  );
}
