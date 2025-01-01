import React, { useState, useRef, useEffect } from "react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { FileCategory } from "../../types/File";
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
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleRename = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(id, category);
    setShowMenu(false);
  };

  const handleNameSubmit = () => {
    onRename(id, editName, category);
    setIsEditing(false);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${styles.file} ${isActive ? styles.active : ""} ${
        snapshot.isDragging ? styles.dragging : ""
      }`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
          autoFocus
        />
      ) : (
        name
      )}
      {showMenu && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{
            left: menuPosition.x,
            top: menuPosition.y,
            position: "fixed",
          }}
        >
          <button onClick={handleRename}>名前を変更</button>
          <button onClick={handleDelete}>削除</button>
        </div>
      )}
    </div>
  );
};

export default FileItem;
