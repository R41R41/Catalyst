import React, { useState, useEffect } from "react";
import Editor from "../Editor/Editor";
import Sidebar from "../Sidebar/Sidebar";
import { FileData } from "../../types/File";
import styles from "./App.module.scss";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  fetchFiles,
  updateFile,
  createFile,
  deleteFile,
  renameFile,
} from "../../services/api";

const initialFiles: FileData[] = [
  { id: "file-1", name: "シナリオ", content: "" },
  { id: "file-2", name: "設定", content: "" },
];

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState(files[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        console.log("Fetching files...");
        const loadedFiles = await fetchFiles();
        console.log("Received files:", loadedFiles);

        if (loadedFiles && loadedFiles.length > 0) {
          console.log("Using loaded files");
          setFiles(loadedFiles);
          setActiveFileId(loadedFiles[0].id);
        } else {
          console.log("Using initial files");
          setFiles(initialFiles);
          setActiveFileId(initialFiles[0].id);
        }
      } catch (error) {
        console.error("Failed to load files:", error);
        setError("ファイルの読み込みに失敗しました");
        setFiles(initialFiles);
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };
    loadFiles();
  }, []);

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
  };

  const handleContentChange = async (content: string) => {
    setFiles(
      files.map((file) =>
        file.id === activeFileId ? { ...file, content } : file
      )
    );
    await updateFile(activeFileId, content);
  };

  const handleAddFile = async () => {
    const newFile: FileData = {
      id: `file-${files.length + 1}`,
      name: `new_file_${files.length + 1}.ts`,
      content: "",
    };
    const savedFile = await createFile(newFile);
    setFiles([...files, savedFile]);
  };

  const handleDeleteFile = async (fileId: string) => {
    await deleteFile(fileId);
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    await renameFile(fileId, newName);
    setFiles(
      files.map((file) =>
        file.id === fileId ? { ...file, name: newName } : file
      )
    );
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <>
            <Sidebar
              files={files}
              activeFileId={activeFileId}
              onFileSelect={handleFileSelect}
              onAddFile={handleAddFile}
              onRenameFile={handleRenameFile}
              onDeleteFile={handleDeleteFile}
              setFiles={setFiles}
            />
            <Editor
              content={activeFile?.content ?? ""}
              onContentChange={handleContentChange}
            />
          </>
        )}
      </div>
    </DragDropContext>
  );
};

export default App;
