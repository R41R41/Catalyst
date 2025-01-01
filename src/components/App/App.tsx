import React, { useState, useEffect } from "react";
import Editor from "../Editor/Editor";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./App.module.scss";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  fetchScenarios,
  updateScenario,
  createScenario,
  deleteScenario,
  renameScenario,
} from "../../services/api";
import { FileData } from "../../types/File";
import { fetchPrompts, Prompt } from "../../services/promptApi";

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setIsLoading(true);
        const scenarios = await fetchScenarios();
        if (scenarios && scenarios.length > 0) {
          setFiles(scenarios);
          setActiveFileId(scenarios[0].id);
        } else {
          const defaultScenario = {
            id: "scenario-1",
            name: "新規シナリオ",
            content: "",
          };
          const savedScenario = await createScenario(defaultScenario);
          setFiles([savedScenario]);
          setActiveFileId(savedScenario.id);
        }
      } catch (error) {
        console.error("Failed to load scenarios:", error);
        setError("シナリオの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, []);

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const loadedPrompts = await fetchPrompts();
        setPrompts(loadedPrompts);
      } catch (error) {
        console.error("Failed to load prompts:", error);
      }
    };
    loadPrompts();
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
    await updateScenario(activeFileId, content);
  };

  const handleAddFile = async () => {
    const newFile: FileData = {
      id: `file-${files.length + 1}`,
      name: `新規シナリオ_${files.length + 1}`,
      content: "",
    };
    const savedFile = await createScenario(newFile);
    setFiles([...files, savedFile]);
  };

  const handleDeleteFile = async (fileId: string) => {
    await deleteScenario(fileId);
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    await renameScenario(fileId, newName);
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
              systemPrompts={prompts}
            />
          </>
        )}
      </div>
    </DragDropContext>
  );
};

export default App;
