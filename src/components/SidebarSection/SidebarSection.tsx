import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { FileData, FileCategory } from "../../types/File";
import FileItem from "../FileItem/FileItem";
import styles from "./SidebarSection.module.scss";

interface SidebarSectionProps {
  title: string;
  category: FileCategory;
  files: FileData[];
  isExpanded: boolean;
  activeFileId: string;
  onToggle: (category: FileCategory) => void;
  onFileSelect: (fileId: string) => void;
  onRenameFile: (
    fileId: string,
    newName: string,
    category: FileCategory
  ) => void;
  onDeleteFile: (fileId: string, category: FileCategory) => void;
  onAddFile: (category: FileCategory) => void;
  dirtyFiles: Set<string>;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  category,
  files,
  isExpanded,
  activeFileId,
  onToggle,
  onFileSelect,
  onRenameFile,
  onDeleteFile,
  onAddFile,
  dirtyFiles,
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => onToggle(category)}>
        <span>{title}</span>
        <span>{isExpanded ? "▼" : "▶"}</span>
      </div>
      {isExpanded && (
        <Droppable droppableId={category.toUpperCase()}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {files.map((file, index) => (
                <Draggable key={file.id} draggableId={file.id} index={index}>
                  {(provided, snapshot) => (
                    <FileItem
                      id={file.id}
                      name={file.name}
                      category={category}
                      isActive={file.id === activeFileId}
                      provided={provided}
                      snapshot={snapshot}
                      onClick={() => onFileSelect(file.id)}
                      onRename={onRenameFile}
                      onDelete={onDeleteFile}
                      isDirty={dirtyFiles.has(file.id)}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <button
                className={styles.addButton}
                onClick={() => onAddFile(category)}
              >
                + 新規追加
              </button>
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};

export default SidebarSection;
