import React, { useRef, useState, useCallback, useEffect } from "react";
import { getCompletion, findRelatedContents } from "@/services/openai";
import { Prompt } from "@/services/promptApi";
import { FileCategory, FileData } from "@/types/File";
import BaseEditor from "../BaseEditor/BaseEditor";
import styles from "./Editor.module.scss";

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

const Editor: React.FC<EditorProps> = ({
  category,
  onContentChange,
  currentFileName,
  allFiles,
  systemPrompts,
  ...restProps
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completionRef = useRef<HTMLSpanElement | null>(null);
  const originalContentRef = useRef<string>("");
  const editorRef = useRef<HTMLDivElement>(null);

  const insertCompletion = useCallback(async (completionText: string) => {
    const baseEditorContent = editorRef.current?.querySelector(
      '[contenteditable="true"]'
    );
    if (baseEditorContent) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0) || document.createRange();

      const span = document.createElement("span");
      span.style.color = "gray";
      span.textContent = completionText;
      completionRef.current = span;

      range.collapse(false);
      range.insertNode(span);

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);

  const handleBaseEditorChange = useCallback(
    async (content: string, _category: FileCategory) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (content) {
          originalContentRef.current = content;

          const relatedContents = await findRelatedContents(
            currentFileName,
            content,
            allFiles
          );
          const systemPrompt = systemPrompts.find(
            (prompt) => prompt.name === `predict_${category}`
          );

          if (!systemPrompt) {
            console.error("System prompt not found");
            return;
          }

          const result = await getCompletion(
            currentFileName,
            content,
            systemPrompt,
            relatedContents
          );

          if (result && content === originalContentRef.current) {
            await insertCompletion(result);
            setIsCompleted(true);
          }
        }
      }, 1000);

      onContentChange(content, _category);
    },
    [
      category,
      currentFileName,
      systemPrompts,
      allFiles,
      insertCompletion,
      onContentChange,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      if (isCompleted && e instanceof KeyboardEvent) {
        if (e.key === "Tab") {
          e.preventDefault();
          if (completionRef.current) {
            completionRef.current.style.color = "inherit";
            const baseEditorContent = editorRef.current?.querySelector(
              '[contenteditable="true"]'
            );
            const newContent = baseEditorContent?.textContent || "";

            const inputEvent = new InputEvent("input", {
              bubbles: true,
              cancelable: true,
            });
            baseEditorContent?.dispatchEvent(inputEvent);

            onContentChange(newContent, category);
          }
        } else {
          if (completionRef.current) {
            completionRef.current.remove();
            completionRef.current = null;
          }
        }
        setIsCompleted(false);
      }
    };

    const baseEditorContent = editorRef.current?.querySelector(
      '[contenteditable="true"]'
    );
    baseEditorContent?.addEventListener("keydown", handleKeyDown);

    return () => {
      baseEditorContent?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCompleted, category, onContentChange]);

  return (
    <div className={styles.editor} ref={editorRef}>
      <BaseEditor
        content={restProps.content}
        category={category}
        onContentChange={handleBaseEditorChange}
        onSave={restProps.onSave}
        isDirty={restProps.isDirty}
      />
    </div>
  );
};

export default Editor;
