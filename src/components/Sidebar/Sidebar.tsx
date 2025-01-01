import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "./Sidebar.module.scss";
import { FileData } from "../../types/File";
import FileItem from "../FileItem/FileItem";

interface SidebarProps {
  files: FileData[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onAddFile: () => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
  setFiles: (files: FileData[]) => void;
  onEditPrompt: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  setFiles,
  onEditPrompt,
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
                  <FileItem
                    id={file.id}
                    name={file.name}
                    isActive={file.id === activeFileId}
                    provided={provided}
                    snapshot={snapshot}
                    onClick={() => onFileSelect(file.id)}
                    onRename={onRenameFile}
                    onDelete={onDeleteFile}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div className={styles.footer}>
        <button className={styles.promptButton} onClick={onEditPrompt}>
          Edit Prompt
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
