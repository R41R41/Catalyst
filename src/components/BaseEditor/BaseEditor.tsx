import React, { useRef, useEffect, useCallback } from "react";
import { FileCategory } from "@/types/File";
import styles from "./BaseEditor.module.scss";

interface BaseEditorProps {
  content: string;
  category: FileCategory | "prompt";
  onContentChange: (content: string, category: FileCategory) => void;
  onSave: () => void;
  isDirty: boolean;
}

const BaseEditor: React.FC<BaseEditorProps> = ({
  content,
  category,
  onContentChange,
  onSave,
  isDirty,
}) => {
  const MAX_HISTORY = 100;
  const editorRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const tempContentRef = useRef<string>("");

  const saveCaretPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreCaretPosition = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.textContent !== content) {
      const savedRange = saveCaretPosition();
      editorRef.current.textContent = content;
      restoreCaretPosition(savedRange);
    }
  }, [content]);

  const handleInput = useCallback(async () => {
    const newContent = editorRef.current?.textContent || "";
    await onContentChange(newContent, category as FileCategory);
    tempContentRef.current = newContent;
  }, [category, onContentChange]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }

      // Enterキーで履歴を保存
      if (e.key === "Enter") {
        const newHistory = [
          ...historyRef.current.slice(0, historyIndexRef.current + 1),
          tempContentRef.current,
        ];
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }
        historyRef.current = newHistory;
        historyIndexRef.current = Math.min(
          historyRef.current.length - 1,
          MAX_HISTORY - 1
        );
      }

      // Undo
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          const previousContent = historyRef.current[historyIndexRef.current];
          if (editorRef.current && previousContent !== undefined) {
            editorRef.current.textContent = previousContent;
            await onContentChange(previousContent, category as FileCategory);
          }
        }
      }

      // Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          const nextContent = historyRef.current[historyIndexRef.current];
          if (editorRef.current && nextContent !== undefined) {
            editorRef.current.textContent = nextContent;
            await onContentChange(nextContent, category as FileCategory);
          }
        }
      }
    };

    const editor = editorRef.current;
    editor?.addEventListener("keydown", handleKeyDown);

    return () => {
      editor?.removeEventListener("keydown", handleKeyDown);
    };
  }, [category, onContentChange, onSave]);

  return (
    <div className={styles.editor}>
      <div
        ref={editorRef}
        contentEditable
        className={styles["content-editable"]}
        onInput={handleInput}
      />
    </div>
  );
};

export default BaseEditor;
