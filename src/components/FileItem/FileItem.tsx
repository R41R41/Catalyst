import React, { useState } from "react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { FileCategory } from "@/types/File";
import { ContextMenu } from "@/components/common/ContextMenu";
import styles from "./FileItem.module.scss";

interface FileItemProps {
  id: string;
  name: string;
  category: FileCategory;
  isActive: boolean;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onClick: () => void;
  onRename: (fileId: string, newName: string, category: FileCategory) => void;
  onDelete: (fileId: string, category: FileCategory) => void;
  isDirty: boolean;
}

const FileItem: React.FC<FileItemProps> = ({
  id,
  name,
  category,
  isActive,
  provided,
  snapshot,
  onClick,
  onRename,
  onDelete,
  isDirty,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleRename = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const menuItems = [
    { label: "名前を変更", onClick: handleRename },
    {
      label: "削除",
      onClick: () => {
        onDelete(id, category);
        setShowMenu(false);
      },
    },
  ];

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${styles.file} ${isActive ? styles.active : ""} ${
        snapshot.isDragging ? styles.dragging : ""
      } ${isDirty ? styles.dirty : ""}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      style={provided.draggableProps.style}
    >
      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => {
            onRename(id, editName, category);
            setIsEditing(false);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onRename(id, editName, category);
              setIsEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        name
      )}
      {showMenu && (
        <ContextMenu
          items={menuItems}
          position={menuPosition}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default FileItem;
