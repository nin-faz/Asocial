import React, { RefObject } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";

interface ActionMenuProps {
  show: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onOpen: (e: React.MouseEvent) => void;
  menuRef?: RefObject<HTMLDivElement>;
  buttonClassName?: string;
  menuClassName?: string;
  editLabel?: string;
  deleteLabel?: string;
  iconSize?: number;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  show,
  onEdit,
  onDelete,
  onOpen,
  menuRef,
  buttonClassName = "text-gray-500 hover:text-purple-400 p-2",
  menuClassName = "absolute top-0 right-0 w-36 bg-gray-800 text-white rounded-md shadow-lg p-2 space-y-2 z-10",
  editLabel = "Modifier",
  deleteLabel = "Supprimer",
  iconSize = 20,
}) => {
  return (
    <div className="relative">
      <button className={buttonClassName} onClick={onOpen}>
        <MoreVertical className={`h-5 w-5`} size={iconSize} />
      </button>
      {show && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={menuClassName}
        >
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center space-x-2 text-red-500 hover:text-red-400 w-full"
            >
              <Trash2 className="h-5 w-5" />
              <span>{deleteLabel}</span>
            </button>
          )}
          {onEdit && (
            <>
              <hr className="border-gray-700" />
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 text-purple-500 hover:text-purple-400 w-full"
              >
                <Edit2 className="h-5 w-5" />
                <span>{editLabel}</span>
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ActionMenu;
