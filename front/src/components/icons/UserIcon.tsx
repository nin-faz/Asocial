import React from "react";
import { renderUserIcon } from "../../utils/iconUtil";

interface UserIconProps {
  iconName: string | null | undefined;
  size?: "small" | "medium" | "large";
  className?: string;
}

const UserIcon: React.FC<UserIconProps> = ({
  iconName,
  size = "medium",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderUserIcon(iconName, size)}
    </div>
  );
};

export default UserIcon;
