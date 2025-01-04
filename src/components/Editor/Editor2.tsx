import "@blocknote/core/fonts/inter.css";
import { useBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "./Editor2.css";
import styles from "./Editor.module.scss";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { getCompletion, findRelatedContents } from "@/services/openai";
import { Prompt } from "@/services/promptApi";
import { FileCategory, FileData } from "@/types/File";

interface EditorProps {
  content: string;
  category: FileCategory;
  onContentChange: (content: string, category: FileCategory) => void;
  systemPrompts: Prompt[];
  allFiles: FileData[];
  currentFileName: string;
  onSave: () => void;
  isDirty: boolean;
}

const Editor2: React.FC<EditorProps> = ({ content }) => {
  const editor = useBlockNote();

  useEffect(() => {
    // 初期化時にMarkdownをブロックに変換
    async function loadInitialContent() {
      const blocks = await editor.tryParseMarkdownToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialContent();
  }, [editor, content]);

  return (
    <div className={styles.editor}>
      <BlockNoteView
        editor={editor}
        onChange={async () => {
          const markdown = await editor.blocksToMarkdownLossy(editor.document);
          console.log("Current content as markdown:", markdown);
        }}
      />
    </div>
  );
};

export default Editor2;
