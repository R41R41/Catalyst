import React, { useState, useEffect, useCallback } from "react";
import Editor from "@/components/Editor/Editor";
import Sidebar from "@/components/Sidebar/Sidebar";
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
} from "@/services/api";
import { FileData, FileCategory } from "@/types/File";
import { fetchPrompts, updatePrompt, Prompt } from "@/services/promptApi";
import SettingsModal from "@/components/SettingsModal/SettingsModal";
import { v4 as uuidv4 } from "uuid";
import { Header } from "@/components/Header/Header";

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());

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
    setDirtyFiles((prev) => new Set(prev).add(activeFileId));
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

  const handleSave = async () => {
    const file = files.find((f) => f.id === activeFileId);
    if (!file) return;

    await handleContentChange(file.content, file.category);
    setDirtyFiles((prev) => {
      const next = new Set(prev);
      next.delete(activeFileId);
      return next;
    });
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

  const handleSettingsClick = () => {
    setIsPromptModalOpen(true);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        <Header onSettingsClick={handleSettingsClick} />
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <div className={styles.mainSection}>
            <Sidebar
              files={files}
              activeFileId={activeFileId}
              onFileSelect={handleFileSelect}
              onAddFile={handleAddFile}
              onRenameFile={handleRenameFile}
              onDeleteFile={handleDeleteFile}
              setFiles={setFiles}
              dirtyFiles={dirtyFiles}
            />
            <Editor
              content={activeFile?.content ?? ""}
              currentFileName={activeFile?.name ?? ""}
              category={activeFile?.category ?? "scenario"}
              onContentChange={handleContentChange}
              systemPrompts={prompts}
              allFiles={files}
              onSave={handleSave}
              isDirty={dirtyFiles.has(activeFileId)}
            />
          </div>
        )}
        <SettingsModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          prompts={prompts}
          onSavePrompts={handleSavePrompts}
        />
      </div>
    </DragDropContext>
  );
};

export default App;
