import React, { useRef, useEffect, useState, useCallback } from "react";
import { getCompletion } from "../../services/openai";
import styles from "./Editor.module.scss";

interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onContentChange }) => {
  const [completion, setCompletion] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completionRef = useRef<HTMLSpanElement | null>(null);

  const insertCompletion = useCallback((completionText: string) => {
    console.log("insertCompletion", completionText);
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

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = content;
    }
  }, [content]);

  const handleInput = () => {
    const newContent = editorRef.current?.textContent || "";
    onContentChange(newContent);
  };

  useEffect(() => {
    const handleInput = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (editorRef.current) {
          const content = editorRef.current.textContent || "";
          console.log("content", content);
          if (content) {
            const result = await getCompletion(content);
            console.log("result", result);
            if (result) {
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
  }, [isCompleted, insertCompletion, completion]);

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
