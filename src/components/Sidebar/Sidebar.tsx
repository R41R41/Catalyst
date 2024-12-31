import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "./Sidebar.module.scss";
import { FileData } from "../../types/File";

interface SidebarProps {
  files: FileData[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onAddFile: () => void;
  setFiles: (files: FileData[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onAddFile,
  setFiles,
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={onAddFile}>
          + New File
        </button>
      </div>
      <Droppable droppableId="SIDEBAR">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={styles.fileList}
          >
            {files.map((file, index) => (
              <Draggable key={file.id} draggableId={file.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${styles.file} ${
                      file.id === activeFileId ? styles.active : ""
                    } ${snapshot.isDragging ? styles.dragging : ""}`}
                    onClick={() => onFileSelect(file.id)}
                  >
                    {file.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Sidebar;
