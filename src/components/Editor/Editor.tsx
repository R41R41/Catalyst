import React, { useRef, useEffect, useState, useCallback } from "react";
import { getCompletion } from "../../services/openai";
import { Prompt } from "../../services/promptApi";
import { FileCategory } from "../../types/File";
import styles from "./Editor.module.scss";

interface EditorProps {
  content: string;
  category: FileCategory;
  onContentChange: (content: string, category: FileCategory) => void;
  systemPrompts: Prompt[];
}

const Editor: React.FC<EditorProps> = ({
  content,
  category,
  onContentChange,
  systemPrompts,
}) => {
  const [completion, setCompletion] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completionRef = useRef<HTMLSpanElement | null>(null);
  const originalContentRef = useRef<string>("");

  const insertCompletion = useCallback((completionText: string) => {
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

  const handleInput = () => {
    const newContent = editorRef.current?.textContent || "";
    onContentChange(newContent, category);
  };

  useEffect(() => {
    const handleInput = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (editorRef.current) {
          const content = editorRef.current.textContent || "";
          if (content) {
            originalContentRef.current = content;

            const result = await getCompletion(content, systemPrompts);

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
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) {
        if (e.key === "Tab") {
          e.preventDefault();
          if (completionRef.current) {
            completionRef.current.style.color = "white";
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
    editor?.addEventListener("input", handleInput);
    editor?.addEventListener("keydown", handleKeyDown);

    return () => {
      editor?.removeEventListener("input", handleInput);
      editor?.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isCompleted, insertCompletion, completion, systemPrompts]);

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
