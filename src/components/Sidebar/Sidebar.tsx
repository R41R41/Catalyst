import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import { FileData, FileCategory } from "../../types/File";
import SidebarSection from "../SidebarSection/SidebarSection";

interface SidebarProps {
  files: FileData[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onAddFile: (category: FileCategory) => void;
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
    console.log(`Files for category ${category}:`, filteredFiles);
    return filteredFiles;
  };

  console.log("All files:", files);
  console.log("Expanded sections:", expandedSections);

  const handleAddFile = (category: FileCategory) => {
    onAddFile(category);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.serviceName}>Catalyst</div>

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
      />

      <div className={styles.footer}>
        <button className={styles.promptButton} onClick={onEditPrompt}>
          Edit Prompt
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
