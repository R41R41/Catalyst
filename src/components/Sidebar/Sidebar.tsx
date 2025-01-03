import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import { FileData, FileCategory } from "../../types/File";
import SidebarSection from "../SidebarSection/SidebarSection";

interface SidebarProps {
  files: FileData[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onAddFile: (category: FileCategory) => void;
  onRenameFile: (
    fileId: string,
    newName: string,
    category: FileCategory
  ) => void;
  onDeleteFile: (fileId: string, category: FileCategory) => void;
  setFiles: (files: FileData[]) => void;
  dirtyFiles: Set<string>;
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  setFiles,
  dirtyFiles,
}) => {
  const [expandedSections, setExpandedSections] = useState<FileCategory[]>([
    "character",
    "setting",
    "scenario",
  ]);

  const toggleSection = (category: FileCategory) => {
    setExpandedSections((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getFilesByCategory = (category: FileCategory) => {
    const filteredFiles = files.filter((file) => file.category === category);
    return filteredFiles;
  };

  const handleAddFile = (category: FileCategory) => {
    onAddFile(category);
  };

  return (
    <div className={styles.sidebar}>
      <SidebarSection
        title="キャラクター設定"
        category="character"
        files={getFilesByCategory("character")}
        isExpanded={expandedSections.includes("character")}
        activeFileId={activeFileId}
        onToggle={toggleSection}
        onFileSelect={onFileSelect}
        onRenameFile={onRenameFile}
        onDeleteFile={onDeleteFile}
        onAddFile={handleAddFile}
        dirtyFiles={dirtyFiles}
      />

      <SidebarSection
        title="その他設定"
        category="setting"
        files={getFilesByCategory("setting")}
        isExpanded={expandedSections.includes("setting")}
        activeFileId={activeFileId}
        onToggle={toggleSection}
        onFileSelect={onFileSelect}
        onRenameFile={onRenameFile}
        onDeleteFile={onDeleteFile}
        onAddFile={handleAddFile}
        dirtyFiles={dirtyFiles}
      />

      <SidebarSection
        title="シナリオ"
        category="scenario"
        files={getFilesByCategory("scenario")}
        isExpanded={expandedSections.includes("scenario")}
        activeFileId={activeFileId}
        onToggle={toggleSection}
        onFileSelect={onFileSelect}
        onRenameFile={onRenameFile}
        onDeleteFile={onDeleteFile}
        onAddFile={handleAddFile}
        dirtyFiles={dirtyFiles}
      />
    </div>
  );
};

export default Sidebar;
