import React, { useState } from "react";
import Editor from "../Editor/Editor";
import Sidebar from "../Sidebar/Sidebar";
import { File } from "../../types/File";
import styles from "./App.module.scss";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

const initialFiles: File[] = [
  { id: "file-1", name: "シナリオ", content: "" },
  { id: "file-2", name: "設定", content: "" },
];

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState(files[0].id);

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

  const handleContentChange = (content: string) => {
    setFiles(
      files.map((file) =>
        file.id === activeFileId ? { ...file, content } : file
      )
    );
  };

  const handleAddFile = () => {
    const newFile: File = {
      id: `file-${files.length + 1}`,
      name: `new_file_${files.length + 1}.ts`,
      content: "",
    };
    setFiles([...files, newFile]);
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        <Sidebar
          files={files}
          activeFileId={activeFileId}
          onFileSelect={handleFileSelect}
          onAddFile={handleAddFile}
          setFiles={setFiles}
        />
        <Editor
          content={activeFile?.content ?? ""}
          onContentChange={handleContentChange}
        />
      </div>
    </DragDropContext>
  );
};

export default App;
