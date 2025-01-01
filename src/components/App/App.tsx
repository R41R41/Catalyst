import React, { useState, useEffect, useCallback } from "react";
import Editor from "../Editor/Editor";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./App.module.scss";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  createCharacter,
  createScenario,
  createSetting,
  deleteCharacter,
  deleteScenario,
  deleteSetting,
  fetchCharacters,
  fetchScenarios,
  fetchSettings,
  renameCharacter,
  renameScenario,
  renameSetting,
  updateCharacter,
  updateScenario,
  updateSetting,
} from "../../services/api";
import { FileData, FileCategory } from "../../types/File";
import { fetchPrompts, updatePrompt, Prompt } from "../../services/promptApi";
import PromptModal from "../PromptModal/PromptModal";
import { v4 as uuidv4 } from "uuid";

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  useEffect(() => {
    const loadAllFiles = async () => {
      try {
        setIsLoading(true);

        // 各カテゴリーのデータを取得
        const [scenarios, characters, settings] = await Promise.all([
          fetchScenarios(),
          fetchCharacters(),
          fetchSettings(),
        ]);
        // カテゴリープロパティを追加して結合
        const allFiles = [
          ...scenarios.map((s) => ({
            ...s,
            category: "scenario" as FileCategory,
          })),
          ...characters.map((c) => ({
            ...c,
            category: "character" as FileCategory,
          })),
          ...settings.map((s) => ({
            ...s,
            category: "setting" as FileCategory,
          })),
        ];
        if (allFiles.length > 0) {
          setFiles(allFiles);
          setActiveFileId(allFiles[0].id);
        }
      } catch (error) {
        console.error("Failed to load files:", error);
        setError("ファイルの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadAllFiles();
  }, []);

  const loadPrompts = useCallback(async () => {
    try {
      const loadedPrompts = await fetchPrompts();
      setPrompts(loadedPrompts);
    } catch (error) {
      console.error("Failed to load prompts:", error);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

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

  const handleContentChange = async (
    content: string,
    category: FileCategory
  ) => {
    setFiles(
      files.map((file) =>
        file.id === activeFileId ? { ...file, content } : file
      )
    );
    if (category === "scenario") {
      await updateScenario(activeFileId, content);
    } else if (category === "character") {
      await updateCharacter(activeFileId, content);
    } else if (category === "setting") {
      await updateSetting(activeFileId, content);
    }
  };

  const handleAddFile = async (category: FileCategory) => {
    const newFile: FileData = {
      id: uuidv4(),
      name: `新規${getCategoryName(category)}_${
        files.filter((f) => f.category === category).length + 1
      }`,
      category: category,
      content: "",
    };
    if (category === "scenario") {
      const savedFile = await createScenario(newFile);
      setFiles([...files, { ...savedFile, category }]);
    } else if (category === "character") {
      const savedFile = await createCharacter(newFile);
      setFiles([...files, { ...savedFile, category }]);
    } else if (category === "setting") {
      const savedFile = await createSetting(newFile);
      setFiles([...files, { ...savedFile, category }]);
    }
  };

  const handleDeleteFile = async (fileId: string, category: FileCategory) => {
    if (category === "scenario") {
      await deleteScenario(fileId);
    } else if (category === "character") {
      await deleteCharacter(fileId);
    } else if (category === "setting") {
      await deleteSetting(fileId);
    }
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleRenameFile = async (
    fileId: string,
    newName: string,
    category: FileCategory
  ) => {
    if (category === "scenario") {
      await renameScenario(fileId, newName);
    } else if (category === "character") {
      await renameCharacter(fileId, newName);
    } else if (category === "setting") {
      await renameSetting(fileId, newName);
    }
    setFiles(
      files.map((file) =>
        file.id === fileId ? { ...file, name: newName } : file
      )
    );
  };

  const handleEditPrompt = () => {
    setIsPromptModalOpen(true);
  };

  const handleSavePrompts = async (newPrompts: Prompt[]) => {
    try {
      const updatedPrompt = newPrompts.find(
        (newPrompt, index) => newPrompt.content !== prompts[index].content
      );

      if (updatedPrompt) {
        await updatePrompt(updatedPrompt.id, updatedPrompt.content);
        await loadPrompts();
      }
    } catch (error) {
      console.error("Failed to save prompt:", error);
    }
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  const getCategoryName = (category: FileCategory): string => {
    switch (category) {
      case "character":
        return "キャラクター";
      case "setting":
        return "設定";
      case "scenario":
        return "シナリオ";
    }
  };

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
              onEditPrompt={handleEditPrompt}
            />
            <Editor
              content={activeFile?.content ?? ""}
              category={activeFile?.category ?? "scenario"}
              onContentChange={handleContentChange}
              systemPrompts={prompts}
              allFiles={files}
            />
          </>
        )}
        <PromptModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          prompts={prompts}
          onSave={handleSavePrompts}
        />
      </div>
    </DragDropContext>
  );
};

export default App;
