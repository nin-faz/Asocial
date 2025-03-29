import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { CheetahIcon } from "./icons/CheetahIcon";

type IconOption = {
  name: string;
  component: React.ReactNode;
};

interface IconSelectorProps {
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  className?: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({
  currentIcon,
  onSelectIcon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const iconOptions: IconOption[] = [
    { name: "Skull", component: <Skull className="h-full w-full" /> },
    { name: "Ghost", component: <Ghost className="h-full w-full" /> },
    { name: "Bot", component: <Bot className="h-full w-full" /> },
    { name: "Flame", component: <Flame className="h-full w-full" /> },
    { name: "Heart", component: <Heart className="h-full w-full" /> },
    { name: "Star", component: <Star className="h-full w-full" /> },
    { name: "Zap", component: <Zap className="h-full w-full" /> },
    { name: "Music", component: <Music className="h-full w-full" /> },
    { name: "Coffee", component: <Coffee className="h-full w-full" /> },
    { name: "Camera", component: <Camera className="h-full w-full" /> },
    { name: "Gamepad", component: <Gamepad className="h-full w-full" /> },
    { name: "Smile", component: <Smile className="h-full w-full" /> },
    { name: "Award", component: <Award className="h-full w-full" /> },
    { name: "Cloud", component: <Cloud className="h-full w-full" /> },
    { name: "Cheetah", component: <CheetahIcon className="h-full w-full" /> },
  ];

  const getCurrentIcon = () => {
    const icon = iconOptions.find((icon) => icon.name === currentIcon);
    return icon ? icon.component : <Skull className="h-full w-full" />;
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-32 h-32 rounded-full bg-purple-900 flex items-center justify-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-16 w-16 text-purple-400">{getCurrentIcon()}</div>
      </motion.div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-full left-0 mt-2 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-64"
        >
          <h3 className="text-purple-400 font-medium mb-3">
            Choisir une icône
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {iconOptions.map((icon) => (
              <motion.div
                key={icon.name}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                  currentIcon === icon.name ? "bg-purple-700" : "bg-gray-700"
                }`}
                onClick={() => {
                  onSelectIcon(icon.name);
                  setIsOpen(false);
                }}
              >
                <div className="h-6 w-6 text-purple-300">{icon.component}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IconSelector;
