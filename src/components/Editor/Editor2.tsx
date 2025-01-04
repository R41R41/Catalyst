import "@blocknote/core/fonts/inter.css";
import { useBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "./Editor2.css";
import styles from "./Editor.module.scss";
import React, { useEffect } from "react";
import { getCompletion, findRelatedContents } from "@/services/openai";
import { Prompt } from "@/services/promptApi";
import { FileCategory, FileData } from "@/types/File";

interface EditorProps {
  content: string;
  category: FileCategory;
  onContentChange: (content: string) => void;
  systemPrompts: Prompt[];
  allFiles: FileData[];
  currentFileName: string;
  onSave: () => void;
  isDirty: boolean;
}

const Editor2: React.FC<EditorProps> = ({
  content,
  category,
  onContentChange,
  onSave,
  currentFileName,
}) => {
  const editor = useBlockNote();

  useEffect(() => {
    const loadContent = async () => {
      if (!editor || !currentFileName) return;
      const blocks = await editor.tryParseMarkdownToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
    };
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, currentFileName]);

  return (
    <div className={styles.editor}>
      <BlockNoteView
        editor={editor}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "s") {
            event.preventDefault();
            onSave();
            return true;
          }
        }}
        onChange={async () => {
          const markdown = await editor.blocksToMarkdownLossy(editor.document);
          if (onContentChange) {
            onContentChange(markdown);
          }
        }}
      />
    </div>
  );
};

export default Editor2;
