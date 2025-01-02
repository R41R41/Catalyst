import React, { useRef, useEffect, useState, useCallback } from "react";
import { getCompletion, findRelatedContents } from "../../services/openai";
import { Prompt } from "../../services/promptApi";
import { FileCategory, FileData } from "../../types/File";
import styles from "./Editor.module.scss";

interface EditorProps {
  content: string;
  category: FileCategory;
  onContentChange: (content: string, category: FileCategory) => void;
  systemPrompts: Prompt[];
  allFiles: FileData[];
  onSave: () => void;
  isDirty: boolean;
}

const Editor: React.FC<EditorProps> = ({
  content,
  category,
  onContentChange,
  systemPrompts,
  allFiles,
  onSave,
  isDirty,
}) => {
  const [completion, setCompletion] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completionRef = useRef<HTMLSpanElement | null>(null);
  const originalContentRef = useRef<string>("");

  const insertCompletion = useCallback(async (completionText: string) => {
    if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const span = document.createElement("span");
      span.style.color = "gray";
      span.textContent = completionText;
      completionRef.current = span;
      range.insertNode(span);
    }
  }, []);

  const saveCaretPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreCaretPosition = (range: Range | null) => {
    if (range && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
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
    await onContentChange(newContent, category);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (editorRef.current) {
        const content = editorRef.current.textContent || "";
        if (content) {
          originalContentRef.current = content;

          const relatedContents = await findRelatedContents(content, allFiles);
          const systemPrompt = systemPrompts.find(
            (prompt) => prompt.name === `predict_${category}`
          );

          if (!systemPrompt) {
            console.error("System prompt not found");
            return;
          }

          console.log("補完します");
          const result = await getCompletion(
            content,
            systemPrompt,
            relatedContents
          );

          if (
            result &&
            editorRef.current?.textContent === originalContentRef.current
          ) {
            setCompletion(result);
            insertCompletion(result);
            setIsCompleted(true);
          }
        }
      }
    }, 1000);
  }, [category, onContentChange, systemPrompts, allFiles, insertCompletion]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }

      if (isCompleted) {
        if (e.key === "Tab") {
          e.preventDefault();
          if (completionRef.current) {
            completionRef.current.style.color = "white";
            const newContent = editorRef.current?.textContent || "";
            await onContentChange(newContent, category);
          }
        } else {
          if (completionRef.current) {
            setCompletion("");
            completionRef.current.remove();
            completionRef.current = null;
          }
        }
        setIsCompleted(false);
      }
    };

    const editor = editorRef.current;
    editor?.addEventListener("keydown", handleKeyDown);

    return () => {
      editor?.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    isCompleted,
    insertCompletion,
    completion,
    systemPrompts,
    onSave,
    category,
    onContentChange,
    allFiles,
  ]);

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

export default Editor;
