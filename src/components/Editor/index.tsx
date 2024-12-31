import React, { useRef, useEffect } from "react";
import { getCompletion } from "../../services/openai";
import styles from "./Editor.module.scss";

const StoryEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInput = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (editorRef.current) {
          const content = editorRef.current.textContent || "";
          if (content) {
            const result = await getCompletion(content);
            if (result) {
              insertCompletion(result);
            }
          }
        }
      }, 1000);
    };

    const editor = editorRef.current;
    editor?.addEventListener("input", handleInput);

    return () => {
      editor?.removeEventListener("input", handleInput);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const insertCompletion = (completion: string) => {
    if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const span = document.createElement("span");
      span.style.color = "red"; // 補完テキストの色を赤に設定
      span.textContent = completion;
      range.insertNode(span);
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      className={styles["content-editable"]}
    />
  );
};

export default StoryEditor;
