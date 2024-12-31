import React from "react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import styles from "./FileItem.module.scss";

interface FileItemProps {
  name: string;
  isActive: boolean;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onClick: () => void;
}

const FileItem: React.FC<FileItemProps> = ({
  name,
  isActive,
  provided,
  snapshot,
  onClick,
}) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${styles.file} ${isActive ? styles.active : ""} ${
        snapshot.isDragging ? styles.dragging : ""
      }`}
      onClick={onClick}
    >
      {name}
    </div>
  );
};

export default FileItem;
