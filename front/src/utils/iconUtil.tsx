import {
  Skull,
  Ghost,
  Bot,
  Flame,
  Heart,
  Star,
  Zap,
  Music,
  Coffee,
  Camera,
  Gamepad,
  Smile,
  Award,
  Cloud,
} from "lucide-react";

export const renderUserIcon = (
  iconName: string | null | undefined,
  size: "small" | "medium" | "large" = "medium"
) => {
  // Nettoyage de la valeur pour éviter des problèmes de correspondance
  const cleanIconName = iconName?.trim() || "";

  const sizeClassName =
    size === "small" ? "h-6 w-6" : size === "large" ? "h-16 w-16" : "h-10 w-10";

  switch (cleanIconName) {
    case "Ghost":
      return <Ghost className={`${sizeClassName} text-purple-400`} />;
    case "Bot":
      return <Bot className={`${sizeClassName} text-purple-400`} />;
    case "Flame":
      return <Flame className={`${sizeClassName} text-purple-400`} />;
    case "Heart":
      return <Heart className={`${sizeClassName} text-purple-400`} />;
    case "Star":
      return <Star className={`${sizeClassName} text-purple-400`} />;
    case "Zap":
      return <Zap className={`${sizeClassName} text-purple-400`} />;
    case "Music":
      return <Music className={`${sizeClassName} text-purple-400`} />;
    case "Coffee":
      return <Coffee className={`${sizeClassName} text-purple-400`} />;
    case "Camera":
      return <Camera className={`${sizeClassName} text-purple-400`} />;
    case "Gamepad":
      return <Gamepad className={`${sizeClassName} text-purple-400`} />;
    case "Smile":
      return <Smile className={`${sizeClassName} text-purple-400`} />;
    case "Award":
      return <Award className={`${sizeClassName} text-purple-400`} />;
    case "Cloud":
      return <Cloud className={`${sizeClassName} text-purple-400`} />;
    default:
      return <Skull className={`${sizeClassName} text-purple-400`} />;
  }
};
